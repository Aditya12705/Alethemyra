const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const { calculateCrustScore } = require('./crustScore');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { Pool } = require('pg'); // Import PostgreSQL Pool

const app = express();
// Use Render's port if available, otherwise use 5000 for local development
const port = process.env.PORT || 5000;

// Middleware
// Configure CORS to allow requests from the frontend URL (using environment variable for deployed app)
const allowedOrigins = [
  'http://localhost:3000',
  'https://clutch-frontend.onrender.com',
  'https://alethemyra.onrender.com',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(bodyParser.json());

// Remove the express.static('/uploads', ...) line as Cloudinary will serve files
// app.use('/uploads', express.static('uploads'));

// --- PostgreSQL Setup ---
// Use environment variables for PostgreSQL database connection (DATABASE_URL is standard)
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection
});

// Add error handler for the pool
db.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Function to test database connection with retries
const testConnection = async (retries = 5, delay = 5000) => {
  let client;
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempting to connect to PostgreSQL database (attempt ${i + 1}/${retries})...`);
      client = await db.connect();
      console.log('Successfully connected to PostgreSQL database');
      return true;
    } catch (err) {
      console.error(`Error connecting to PostgreSQL (attempt ${i + 1}/${retries}):`, {
        message: err.message,
        code: err.code,
        stack: err.stack
      });
      if (i < retries - 1) {
        console.log(`Retrying in ${delay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } finally {
      if (client) client.release();
    }
  }
  return false;
};

// Function to initialize database
const initializeDatabase = async () => {
  try {
    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('Could not establish database connection after multiple retries. Exiting...');
      process.exit(1);
    }

    console.log('Starting database initialization...');
    
    // Create Tables with error handling
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS user_credentials (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          number VARCHAR(255) NOT NULL
        )
      `);
      console.log('Table user_credentials checked/created');

      await db.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          user_id INT NOT NULL UNIQUE REFERENCES user_credentials(id) ON DELETE CASCADE,
          userUniqueId VARCHAR(255) UNIQUE,
          fullName VARCHAR(255) NOT NULL,
          panNumber VARCHAR(255) NOT NULL,
          aadhaarNumber VARCHAR(255) NOT NULL,
          panCardPath VARCHAR(255),
          aadhaarCardPath VARCHAR(255),
          crust_score REAL,
          crust_rating VARCHAR(255),
          companyName VARCHAR(255),
          projectName VARCHAR(255),
          creditRequirement INT,
          landLocation VARCHAR(255),
          landSize INT,
          marketValue INT,
          landDevStatus VARCHAR(255),
          corporatePhone VARCHAR(255),
          tinNumber VARCHAR(255),
          gstNumber VARCHAR(255),
          cinNumber VARCHAR(255),
          plannedStartDate VARCHAR(255),
          ownershipPercentage INT,
          financialContribution INT,
          partners TEXT,
          hasRegulatoryApprovals BOOLEAN,
          hasGpsPhotos BOOLEAN,
          expectedPermissionDate VARCHAR(255),
          status VARCHAR(255) DEFAULT 'Pending',
          createdAt VARCHAR(255),
          documentNotes TEXT,
          ownershipDocPath VARCHAR(255),
          regulatoryDocPath VARCHAR(255),
          gpsDocPath VARCHAR(255),
          bbmpDocPath VARCHAR(255),
          planApprovalDocPath VARCHAR(255),
          khataCertificateDocPath VARCHAR(255),
          fiscalYearLandTaxInvoiceDocPath VARCHAR(255),
          bettermentCertificateDocPath VARCHAR(255),
          bwssb1DocPath VARCHAR(255),
          bwssb2DocPath VARCHAR(255),
          bwssb3DocPath VARCHAR(255),
          keb1DocPath VARCHAR(255),
          keb2DocPath VARCHAR(255),
          keb3DocPath VARCHAR(255),
          ecDocPath VARCHAR(255),
          occcDocPath VARCHAR(255),
          reraDocPath VARCHAR(255),
          landDocPath VARCHAR(255),
          jvDocPath VARCHAR(255),
          motherDeedDocPath VARCHAR(255),
          familyTreeDocPath VARCHAR(255),
          nocDocPath VARCHAR(255),
          legalDisputeDocPath VARCHAR(255)
        )
      `);
      console.log('Table users checked/created');

      await db.query(`
        CREATE TABLE IF NOT EXISTS admins (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) NOT NULL,
          password VARCHAR(255) NOT NULL
        )
      `);
      console.log('Table admins checked/created');

      // Insert default admin if not exists
      const adminExists = await db.query(`SELECT * FROM admins WHERE username = $1`, ['admin']);
      if (adminExists.rows.length === 0) {
        await db.query(`INSERT INTO admins (username, password) VALUES ($1, $2)`, ['admin', 'password123']);
        console.log('Default admin created');
      }

      console.log('Database initialization completed successfully');
    } catch (err) {
      console.error('Error during table creation:', {
        message: err.message,
        code: err.code,
        stack: err.stack
      });
      throw err;
    }
  } catch (err) {
    console.error('Database initialization error:', {
      message: err.message,
      code: err.code,
      stack: err.stack
    });
    process.exit(1);
  }
};

// Initialize database
initializeDatabase();

// Remove the local uploads directory check
// const uploadsDir = path.join(__dirname, 'uploads');
// if (!fs.existsSync(uploadsDir)) { fs.mkdirSync(uploadsDir); }

// --- Cloudinary Configuration ---
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true // Force HTTPS
});

// Configure Multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'clutch_app_uploads',
    resource_type: 'auto', // Automatically detect resource type
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'], // Restrict allowed formats
    transformation: [
      { quality: 'auto' }, // Optimize quality
      { fetch_format: 'auto' } // Convert to WebP if supported
    ]
  }
});

// Initialize multer with Cloudinary storage
const upload = multer({ storage: storage });

// File filter (Keep your existing file filter logic if needed)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'), false);
  }
};

// Re-initialize multer with file filter if needed
const uploadWithFilter = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });


// Helper function to get current date
const getCurrentDate = () => new Date().toISOString().split('T')[0]; // Keep as is, stores as VARCHAR

// Helper to generate random userUniqueId
function generateUserUniqueId() {
  return 'U' + Math.floor(10000000 + Math.random() * 90000000);
}

// Endpoints

// --- User Register ---
app.post('/api/user/register', async (req, res) => { // Made async
  console.log('Received request for /api/user/register with body:', req.body);
  const { name, number } = req.body;
  if (!name || !number) {
    return res.status(400).json({ success: false, message: 'Name and number are required.' });
  }
  try {
    // Use parameterized queries ($1, $2, etc.) with array of values in pg
    const userExists = await db.query(`SELECT * FROM user_credentials WHERE name = $1`, [name]);
    
    if (userExists.rows.length > 0) {
      res.status(400).json({ success: false, message: 'User already exists.' });
    } else {
      const insertCredential = await db.query(
        `INSERT INTO user_credentials (name, number) VALUES ($1, $2) RETURNING id` ,
        [name, number]
      );
      const userId = insertCredential.rows[0].id; // Get the inserted ID

      // Generate random userUniqueId
      const userUniqueId = generateUserUniqueId();
      await db.query(
        `INSERT INTO users (user_id, userUniqueId, fullName, panNumber, aadhaarNumber, createdAt) VALUES ($1, $2, '', '', '', $3)`,
        [userId, userUniqueId, getCurrentDate()]
      );
      res.json({ success: true, userId: userId, userUniqueId });
    }
  } catch (err) {
      console.error('Error in /api/user/register:', err.message);
      res.status(500).json({ success: false, message: err.message });
  }
});

// --- User Login ---
app.post('/api/user/login', async (req, res) => { // Made async
  const { name, number } = req.body;
  if (!name || !number) {
    return res.status(400).json({ success: false, message: 'Name and number are required.' });
  }
  try {
    const results = await db.query(
      `SELECT uc.id, u.userUniqueId FROM user_credentials uc JOIN users u ON uc.id = u.user_id WHERE uc.name = $1 AND uc.number = $2`,
      [name, number]
    );
    
    if (results.rows.length > 0) {
      res.json({ success: true, userId: results.rows[0].id, userUniqueId: results.rows[0].userUniqueId });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials or user not found.' });
    }
  } catch (err) {
      console.error('Error in /api/user/login:', err.message);
      res.status(500).json({ success: false, message: err.message });
  }
});

// --- Admin Login ---
app.post('/api/admin/login', async (req, res) => { // Made async
  const { username, password } = req.body;
  try {
    const results = await db.query(
      `SELECT * FROM admins WHERE username = $1 AND password = $2`,
      [username, password]
    );
    
    if (results.rows.length > 0) {
      res.json({ success: true, message: 'Admin logged in successfully' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }
  } catch (err) {
      console.error('Error in /api/admin/login:', err.message);
      res.status(500).json({ success: false, message: err.message });
  }
});

// --- Submit KYC ---
// Use uploadWithFilter for file uploads if you want the file filter applied
app.post('/api/kyc', uploadWithFilter.fields([
  { name: 'panCard', maxCount: 1 },
  { name: 'aadhaarCard', maxCount: 1 }
]), async (req, res) => { // Made async
  try {
    const { fullName, panNumber, aadhaarNumber, userId } = req.body;
    const panCardUrl = req.files && req.files['panCard'] ? req.files['panCard'][0].path : null; // .path contains the Cloudinary URL
    const aadhaarCardUrl = req.files && req.files['aadhaarCard'] ? req.files['aadhaarCard'][0].path : null;
    const createdAt = getCurrentDate();

    if (!fullName || !panNumber || !aadhaarNumber || !panCardUrl || !aadhaarCardUrl || !userId) {
      // Consider deleting uploaded files from Cloudinary if validation fails here
      if (panCardUrl) cloudinary.uploader.destroy(req.files['panCard'][0].public_id); // Use public_id for deletion
      if (aadhaarCardUrl) cloudinary.uploader.destroy(req.files['aadhaarCard'][0].public_id);
      return res.status(400).json({ success: false, message: 'All fields, files, and userId are required.' });
    }
    
    // Database checks - adjust for pg
    const userCredentialExists = await db.query(`SELECT * FROM user_credentials WHERE id = $1`, [userId]);
    if (userCredentialExists.rows.length === 0) {
       // Consider deleting uploaded files from Cloudinary
      if (panCardUrl) cloudinary.uploader.destroy(req.files['panCard'][0].public_id);
      if (aadhaarCardUrl) cloudinary.uploader.destroy(req.files['aadhaarCard'][0].public_id);
      return res.status(404).json({ success: false, message: 'User not found in user_credentials.' });
    }
    const userExists = await db.query(`SELECT * FROM users WHERE id = $1`, [userId]);
     if (userExists.rows.length === 0) {
      // Consider deleting uploaded files from Cloudinary
      if (panCardUrl) cloudinary.uploader.destroy(req.files['panCard'][0].public_id);
      if (aadhaarCardUrl) cloudinary.uploader.destroy(req.files['aadhaarCard'][0].public_id);
      return res.status(404).json({ success: false, message: 'User not found in users table.' });
    }

    // Update users table - adjust for pg parameterized query
    await db.query(
      `UPDATE users SET fullName = $1, panNumber = $2, aadhaarNumber = $3, panCardPath = $4, aadhaarCardPath = $5, createdAt = $6 WHERE id = $7`,
      // Save the Cloudinary URLs (or public_id if you prefer) to the database
      [fullName, panNumber, aadhaarNumber, panCardUrl, aadhaarCardUrl, createdAt, userId]
    );
    res.json({ success: true, userId: userId });

  } catch (e) {
    console.error('Caught error in /api/kyc:', e);
     // Consider deleting uploaded files from Cloudinary in case of other errors
    if (req.files && req.files['panCard'] && req.files['panCard'][0].public_id) cloudinary.uploader.destroy(req.files['panCard'][0].public_id);
    if (req.files && req.files['aadhaarCard'] && req.files['aadhaarCard'][0].public_id) cloudinary.uploader.destroy(req.files['aadhaarCard'][0].public_id);
    res.status(500).json({ success: false, message: 'Internal server error (uncaught).' });
  }
});

// --- Crust Score Service Integration ---
app.post('/api/user/:id/crust-score', async (req, res) => { // Made async
  const { id } = req.params;
  try {
    const modelInputs = req.body;
    const result = calculateCrustScore(modelInputs);

    // Save the calculated score to the database - adjust for pg parameterized query
    const { compositeScore, rating, risk } = result;
    const updateQuery = `UPDATE users SET crust_score = $1, crust_rating = $2, risk_level = $3 WHERE id = $4`;
    await db.query(updateQuery, [compositeScore, rating, risk, id]);

    res.json({
      success: true,
      crust_score: compositeScore,
      rating: rating,
      risk: risk,
      asset_score: result.aScore,
      behaviour_score: result.bScore,
      cashflow_score: result.cScore,
      // ...result // Removed spreading result to ensure explicit properties
    });

  } catch (error) {
    console.error('Error in JS crust score service:', error.message);
    res.status(500).json({ success: false, message: 'Error processing crust score', error: error.message });
  }
});

// --- Submit Application ---
// Use uploadWithFilter for file uploads
app.post('/api/submit/:id', uploadWithFilter.fields([
  { name: 'bbmpDoc', maxCount: 1 },
  { name: 'planApprovalDoc', maxCount: 1 },
  { name: 'khataCertificateDoc', maxCount: 1 },
  { name: 'fiscalYearLandTaxInvoiceDoc', maxCount: 1 },
  { name: 'bettermentCertificateDoc', maxCount: 1 },
  { name: 'bwssb1Doc', maxCount: 1 },
  { name: 'bwssb2Doc', maxCount: 1 },
  { name: 'bwssb3Doc', maxCount: 1 },
  { name: 'keb1Doc', maxCount: 1 },
  { name: 'keb2Doc', maxCount: 1 },
  { name: 'keb3Doc', maxCount: 1 },
  { name: 'ecDoc', maxCount: 1 },
  { name: 'occcDoc', maxCount: 1 },
  { name: 'reraDoc', maxCount: 1 },
  { name: 'ownershipDocuments', maxCount: 1 },
  { name: 'regulatoryApprovals', maxCount: 1 },
  { name: 'gpsPhotos', maxCount: 1 },
  { name: 'motherDeedDoc', maxCount: 1 },
  { name: 'familyTreeDoc', maxCount: 1 },
  { name: 'nocDoc', maxCount: 1 },
  { name: 'legalDisputeDoc', maxCount: 1 },
  { name: 'jvDoc', maxCount: 1 }
]), async (req, res) => { // Made async
  const { id } = req.params;
  try {
    const updates = [];
    const values = [];
    let paramIndex = 1; // Start index for parameterized query

    const addUpdate = (fieldName, files) => {
        if (files && files[fieldName]) {
             updates.push(`${fieldName}Path = $${paramIndex++}`);
             values.push(files[fieldName][0].path); // Cloudinary URL
             // Add logic here to get and potentially delete old Cloudinary file if updating
             // This requires fetching the old value from the DB first.
        }
    };

    // Use the helper to add updates for each possible file field
    addUpdate('bbmpDoc', req.files);
    addUpdate('planApprovalDoc', req.files);
    addUpdate('khataCertificateDoc', req.files);
    addUpdate('fiscalYearLandTaxInvoiceDoc', req.files);
    addUpdate('bettermentCertificateDoc', req.files);
    addUpdate('bwssb1Doc', req.files);
    addUpdate('bwssb2Doc', req.files);
    addUpdate('bwssb3Doc', req.files);
    addUpdate('keb1Doc', req.files);
    addUpdate('keb2Doc', req.files);
    addUpdate('keb3Doc', req.files);
    addUpdate('ecDoc', req.files);
    addUpdate('occcDoc', req.files);
    addUpdate('reraDoc', req.files);
    addUpdate('ownershipDocuments', req.files);
    addUpdate('regulatoryApprovals', req.files);
    addUpdate('gpsPhotos', req.files);
    addUpdate('motherDeedDoc', req.files);
    addUpdate('familyTreeDoc', req.files);
    addUpdate('nocDoc', req.files);
    addUpdate('legalDisputeDoc', req.files);
    addUpdate('jvDoc', req.files);

    if (updates.length > 0) {
      // Add the user ID as the last parameter
      values.push(id);
      
      // Execute the update query - adjust for pg parameterized query
      await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}`, values);

      res.json({ success: true, message: 'Application submitted successfully' });
    } else {
      res.json({ success: true, message: 'No files uploaded or no updates.' });
    }
  } catch (err) {
    console.error('Error in /api/submit/:id:', err);
     // Consider deleting uploaded files from Cloudinary if DB update fails
    res.status(500).json({ success: false, message: err.message });
  }
});

// Endpoint for uploading regulatory docs after application - DEPRECATED, will be replaced by optional-documents endpoint
// Removing this endpoint as it's marked as deprecated and redundant with optional-documents.
// app.post('/api/user/:id/regulatory-upload', ...);


// --- Endpoint for uploading optional documents after initial submission ---
// Use uploadWithFilter for file uploads
app.post('/api/user/:id/optional-documents', uploadWithFilter.fields([
  { name: 'bbmpDoc', maxCount: 1 },
  { name: 'planApprovalDoc', maxCount: 1 },
  { name: 'khataCertificateDoc', maxCount: 1 },
  { name: 'fiscalYearLandTaxInvoiceDoc', maxCount: 1 },
  { name: 'bettermentCertificateDoc', maxCount: 1 },
  { name: 'ecDoc', maxCount: 1 },
  { name: 'bwssb1Doc', maxCount: 1 },
  { name: 'bwssb2Doc', maxCount: 1 },
  { name: 'bwssb3Doc', maxCount: 1 },
  { name: 'keb1Doc', maxCount: 1 },
  { name: 'keb2Doc', maxCount: 1 },
  { name: 'keb3Doc', maxCount: 1 },
  { name: 'legalDisputeDoc', maxCount: 1 },
  { name: 'jvDoc', maxCount: 1 } // JV is optional if ownership < 100
]), async (req, res) => { // Made async
  const { id } = req.params;
  try {
    const updates = [];
    const values = [];
    let paramIndex = 1; // Start index for parameterized query

     const addUpdate = (fieldName, files) => {
        if (files && files[fieldName]) {
             updates.push(`${fieldName}Path = $${paramIndex++}`);
             values.push(files[fieldName][0].path); // Cloudinary URL
             // Add logic here to get and potentially delete old Cloudinary file if updating
             // This requires fetching the old value from the DB first.
        }
    };

    addUpdate('bbmpDoc', req.files);
    addUpdate('planApprovalDoc', req.files);
    addUpdate('khataCertificateDoc', req.files);
    addUpdate('fiscalYearLandTaxInvoiceDoc', req.files);
    addUpdate('bettermentCertificateDoc', req.files);
    addUpdate('ecDoc', req.files);

    // Handle multiple BWSSB documents
    for (let i = 1; i <= 3; i++) {
      addUpdate(`bwssb${i}Doc`, req.files);
    }

    // Handle multiple KEB documents
    for (let i = 1; i <= 3; i++) {
       addUpdate(`keb${i}Doc`, req.files);
    }

    addUpdate('legalDisputeDoc', req.files);
    addUpdate('jvDoc', req.files);

    if (updates.length > 0) {
      // Add the user ID as the last parameter
      values.push(id);
      
      // Execute the update query - adjust for pg parameterized query
      await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}`, values);

      res.json({ success: true, message: 'Optional documents uploaded successfully' });
    } else {
      res.status(400).json({ success: false, message: 'No files uploaded.' });
    }
  } catch (err) {
    console.error('Error in /api/user/:id/optional-documents:', err);
     // Consider deleting uploaded files from Cloudinary if DB update fails
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- Delete user (and cascade to user_credentials) ---
app.delete('/api/user/:id', async (req, res) => { // Made async
  const { id } = req.params;
  try {
    // Use transactions for multi-step operations in PG
    await db.query('BEGIN'); // Start transaction
    // ON DELETE CASCADE should handle user_credentials deletion if FOREIGN KEY is set up correctly in PG
    await db.query(`DELETE FROM users WHERE id = $1`, [id]);
    // If CASCADE doesn't work or isn't set up, you might need: await db.query(`DELETE FROM user_credentials WHERE id = $1`, [id]);
    await db.query('COMMIT'); // Commit transaction
    res.json({ success: true });
  } catch (err) {
    await db.query('ROLLBACK'); // Rollback on error
    console.error('Error deleting user:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- Update Project Details ---
app.put('/api/project/:id', async (req, res) => { // Made async
  const { id } = req.params;
  const { projectName, creditRequirement, landLocation, landSize, marketValue } = req.body;
  try {
    await db.query(
      `UPDATE users SET projectName = $1, creditRequirement = $2, landLocation = $3, landSize = $4, marketValue = $5 WHERE id = $6`,
      [projectName, creditRequirement, landLocation, landSize, marketValue, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating project details:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- Update Corporate Info ---
app.put('/api/corporate/:id', async (req, res) => { // Made async
  const { id } = req.params;
  const { companyName, corporatePhone, tinNumber, gstNumber, cinNumber } = req.body;
  try {
    await db.query(
      `UPDATE users SET companyName = $1, corporatePhone = $2, tinNumber = $3, gstNumber = $4, cinNumber = $5 WHERE id = $6`,
      [companyName, corporatePhone, tinNumber, gstNumber, cinNumber, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating corporate info:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- Update Development Planning ---
app.put('/api/development/:id', async (req, res) => { // Made async
  const { id } = req.params;
  const { plannedStartDate, ownershipPercentage, financialContribution, partners } = req.body;
  try {
    // For JSON data in PostgreSQL, use JSONB type and CAST
    const partnersJson = partners ? JSON.stringify(partners) : null;
    await db.query(
      `UPDATE users SET plannedStartDate = $1, ownershipPercentage = $2, financialContribution = $3, partners = $4 WHERE id = $5`,
      [plannedStartDate, ownershipPercentage, financialContribution, partnersJson, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating development planning:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- Update Regulatory Compliance ---
app.put('/api/regulatory/:id', async (req, res) => { // Made async
  const { id } = req.params;
  const { hasRegulatoryApprovals, hasGpsPhotos, expectedPermissionDate } = req.body;
  try {
    // Assuming hasRegulatoryApprovals and hasGpsPhotos are boolean in PG
    await db.query(
      `UPDATE users SET hasRegulatoryApprovals = $1, hasGpsPhotos = $2, expectedPermissionDate = $3 WHERE id = $4`,
      [hasRegulatoryApprovals, hasGpsPhotos, expectedPermissionDate, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating regulatory compliance:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- Get All Users (Admin Dashboard) ---
app.get('/api/users', async (req, res) => { // Made async
  try {
    console.log('Attempting to fetch all users...');
    const results = await db.query(`
      SELECT 
        id, 
        userUniqueId, 
        fullName, 
        corporatePhone, 
        createdAt, 
        creditRequirement, 
        status, 
        cinNumber, 
        crust_score, 
        crust_rating, 
        risk_level 
      FROM users
    `);
    console.log(`Successfully fetched ${results.rows.length} users`);
    res.json(results.rows); // PostgreSQL results are in .rows
  } catch (err) {
    console.error('Detailed error in /api/users:', {
      message: err.message,
      stack: err.stack,
      code: err.code
    });
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching users',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// --- Get User Details (Admin Details) ---
app.get('/api/user/:id', async (req, res) => { // Made async
  const { id } = req.params;
  try {
    const results = await db.query(`SELECT * FROM users WHERE id = $1`, [id]);
    if (results.rows.length > 0) {
      res.json(results.rows[0]);
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (err) {
    console.error('Error getting user details:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- Update User Status (Admin) ---
app.put('/api/user/:id/status', async (req, res) => { // Made async
  const { id } = req.params;
  const { status } = req.body;
  try {
    await db.query(`UPDATE users SET status = $1 WHERE id = $2`, [status, id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating user status:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- OTP store (in-memory, but now for DB users) ---
// In-memory OTP storage is not persistent across deploys/restarts.
// Consider storing OTPs in the database with an expiry timestamp.
const otps = {}; // Still using in-memory for now

// Send OTP endpoint (DB version)
app.post('/api/send-otp', async (req, res) => { // Made async
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ message: 'Phone is required' });
  }
  try {
    // Check if user exists in DB - adjust for pg
    const results = await db.query('SELECT * FROM user_credentials WHERE number = $1', [phone]);
    
    if (results.rows.length === 0) {
      return res.status(404).json({ message: 'User not found. Please register.' });
    }
    // Generate OTP
    const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
    otps[phone] = { otp, expires: Date.now() + 5 * 60 * 1000, userId: results.rows[0].id };
    // In production, send OTP via SMS provider here
    console.log(`OTP for ${phone}: ${otp}`); // Log OTP for testing
    res.json({ message: 'OTP sent' });
  } catch (err) {
    console.error('Error in /api/send-otp:', err);
    res.status(500).json({ message: 'Database error' });
  }
});

// Verify OTP endpoint (DB version)
app.post('/api/verify-otp', async (req, res) => { // Made async
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ message: 'Phone and OTP are required' });
  }
  const record = otps[phone];
  if (!record || record.otp !== otp) {
    return res.status(401).json({ message: 'Invalid OTP' });
  }
  if (Date.now() > record.expires) {
    delete otps[phone];
    return res.status(410).json({ message: 'OTP expired' });
  }
  // Auth success, clear OTP
  const userId = record.userId;
  delete otps[phone];
  // Fetch user info for dashboard redirect - adjust for pg
  try {
    const userRows = await db.query('SELECT * FROM users WHERE user_id = $1', [userId]);
    if (!userRows || userRows.rows.length === 0) {
      return res.status(500).json({ message: 'User not found after OTP verification' });
    }
    res.json({ message: 'Login successful', user: userRows.rows[0] });
  } catch (err) {
      console.error('Error fetching user after OTP verify:', err);
      res.status(500).json({ message: 'Database error' });
  }
});

// --- Get application documents ---
app.get('/api/user/:id/documents', async (req, res) => { // Made async
  const { id } = req.params;
  try {
    const results = await db.query(`SELECT * FROM users WHERE id = $1`, [id]);
    if (results.rows.length > 0) {
      const user = results.rows[0];
      const docs = [];
      // Assuming database now stores Cloudinary URLs
      if (user.pancardpath) docs.push({ type: 'PAN Card', url: user.pancardpath }); // Use lowercase column names
      if (user.aadhaarcardpath) docs.push({ type: 'Aadhaar Card', url: user.aadhaarcardpath });
      if (user.landdocpath) docs.push({ type: 'Land Document', url: user.landdocpath });
      if (user.ownershipdocpath) docs.push({ type: 'Ownership Document', url: user.ownershipdocpath });
      if (user.regulatorydocpath) docs.push({ type: 'Regulatory Approval', url: user.regulatorydocpath });
      if (user.gpsdocpath) docs.push({ type: 'GPS-tagged Land Photo', url: user.gpsdocpath });
      if (user.bbmpdocpath) docs.push({ type: 'BBMP Approval', url: user.bbmpdocpath });
      if (user.bwssb1docpath) docs.push({ type: 'BWSSB Approval', url: user.bwssb1docpath });
      if (user.bwssb2docpath) docs.push({ type: 'BWSSB Approval', url: user.bwssb2docpath });
      if (user.bwssb3docpath) docs.push({ type: 'BWSSB Approval', url: user.bwssb3docpath });
      if (user.keb1docpath) docs.push({ type: 'KEB Approval', url: user.keb1docpath });
      if (user.keb2docpath) docs.push({ type: 'KEB Approval', url: user.keb2docpath });
      if (user.keb3docpath) docs.push({ type: 'KEB Approval', url: user.keb3docpath });
      if (user.ecdocpath) docs.push({ type: 'EC', url: user.ecdocpath });
      if (user.occcdocpath) docs.push({ type: 'OCCC Approval', url: user.occcdocpath });
      if (user.reradocpath) docs.push({ type: 'RERA Approval', url: user.reradocpath });
      if (user.jvdocpath) docs.push({ type: 'JV Document', url: user.jvdocpath });
      if (user.motherdeeddocpath) docs.push({ type: 'Mother Deed', url: user.motherdeeddocpath });
      if (user.familytreedocpath) docs.push({ type: 'Family Tree', url: user.familytreedocpath });
      if (user.nocdocpath) docs.push({ type: 'NOC', url: user.nocdocpath });
      if (user.legaldisputedocpath) docs.push({ type: 'Legal Dispute Documents', url: user.legaldisputedocpath });

      res.json({ success: true, documents: docs, notes: user.documentnotes || '' }); // Use lowercase column name for notes
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (err) {
    console.error('Error getting user documents:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- Save admin notes for user documents ---
app.post('/api/user/:id/documents/notes', async (req, res) => { // Made async
  const { id } = req.params;
  const { notes } = req.body;
  try {
     await db.query('UPDATE users SET documentnotes = $1 WHERE id = $2', [notes, id]); // Use lowercase column name
     res.json({ success: true });
  } catch (err) {
    console.error('Error saving document notes:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- Get application status for progress bar ---
app.get('/api/user/:id/status', async (req, res) => { // Made async
  const { id } = req.params;
  try {
    const results = await db.query('SELECT * FROM users WHERE id = $1', [id]); // Use lowercase column names in query results
    if (!results || results.rows.length === 0) {
      return res.json({ status: 'submitted' });
    }
    const user = results.rows[0];
    // Allow 0 as valid for numeric fields
    const isPresent = v => v !== null && v !== undefined && v !== '';
    
    // Check development step based on developmentstarted (lowercase)
    let developmentComplete = false;
    if (user.developmentstarted === 'yes') { // Use lowercase
      developmentComplete = isPresent(user.ownershippercentage) && isPresent(user.financialcontribution) && isPresent(user.developmentpercent); // Use lowercase
    } else if (user.developmentstarted === 'no') { // Use lowercase
      developmentComplete = isPresent(user.ownershippercentage) && isPresent(user.financialcontribution) && !!user.plannedstartdate; // Use lowercase
    } else {
      developmentComplete = isPresent(user.ownershippercentage) && isPresent(user.financialcontribution); // Use lowercase
    }

    const allStepsFilled =
      !!user.fullname && !!user.pannumber && !!user.aadhaarnumber && !!user.pancardpath && !!user.aadhaarcardpath && // Use lowercase
      !!user.corporatephone && !!user.tinnumber && !!user.gstnumber && !!user.cinnumber && // Use lowercase
      !!user.companyname && isPresent(user.creditrequirement) && !!user.landlocation && isPresent(user.landsize) && isPresent(user.marketvalue) && // Use lowercase
      developmentComplete &&
      (user.hasregulatoryapprovals !== null && user.hasregulatoryapprovals !== undefined) && // Use lowercase
      (user.hasgpsphotos !== null && user.hasgpsphotos !== undefined); // Use lowercase
    
    // Always use the status from the database (lowercase column name), mapped to progress bar keys
    let status = 'submitted';
    switch ((user.status || '').toLowerCase()) { // Use lowercase column name
      case 'submitted':
      case 'pending':
        status = 'submitted'; break;
      case 'verification':
        status = 'verification'; break;
      case 'credit':
        status = 'credit'; break;
      case 'inspection':
        status = 'inspection'; break;
      case 'legal':
        status = 'legal'; break;
      case 'approved':
      case 'final':
        status = 'final'; break;
      default:
        status = 'submitted';
    }
    res.json({ status });
  } catch (err) {
    console.error('Error getting application status:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Removed the static file serving block for the frontend build
// if (process.env.NODE_ENV === 'production') { ... }

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Add a health check endpoint
app.get('/health', async (req, res) => {
  try {
    const client = await db.connect();
    client.release();
    res.json({ status: 'healthy', database: 'connected' });
  } catch (err) {
    console.error('Health check failed:', err);
    res.status(500).json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});
