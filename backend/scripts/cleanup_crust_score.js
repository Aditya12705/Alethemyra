// This script sets crust_score, crust_rating, and risk_level to NULL for all users where the score is 0, '0', '', or NULL.
// Run this with: node backend/scripts/cleanup_crust_score.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../clutch.db');
const db = new sqlite3.Database(dbPath);

const cleanupQuery = `
  UPDATE users
  SET crust_score = NULL, crust_rating = NULL, risk_level = NULL
  WHERE crust_score IS NULL
    OR crust_score = ''
    OR crust_score = 0
    OR crust_score = '0'
`;

db.run(cleanupQuery, function(err) {
  if (err) {
    console.error('Error cleaning up crust score fields:', err.message);
  } else {
    console.log(`Crust score fields cleaned for ${this.changes} user(s).`);
  }
  db.close();
});
