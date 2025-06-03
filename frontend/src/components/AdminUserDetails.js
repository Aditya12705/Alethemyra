import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../login.css';
import jsPDF from 'jspdf';
import config from '../config';

const AdminUserDetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/api/user/${id}`);
        const userData = response.data;
        // Transform snake_case keys to camelCase
        const transformedUser = {
          id: userData.id,
          userUniqueId: userData.useruniqueid,
          fullName: userData.fullname,
          corporatePhone: userData.corporatephone,
          createdAt: userData.createdat,
          creditRequirement: userData.creditrequirement,
          status: userData.status,
          cinNumber: userData.cinnumber,
          panCardPath: userData.pancardpath,
          aadhaarCardPath: userData.aadhaarcardpath,
          panNumber: userData.pannumber,
          aadhaarNumber: userData.aadhaarnumber,
          projectName: userData.projectname,
          landLocation: userData.landlocation,
          landSize: userData.landsize,
          marketValue: userData.marketvalue,
          crust_score: userData.crust_score,
          crust_rating: userData.crust_rating,
          tinNumber: userData.tinnumber,
          gstNumber: userData.gstnumber,
          companyName: userData.companyname,
          plannedStartDate: userData.plannedstartdate,
          ownershipPercentage: userData.ownershippercentage,
          financialContribution: userData.financialcontribution,
          partners: userData.partners,
          hasRegulatoryApprovals: userData.hasregulatoryapprovals,
          hasGpsPhotos: userData.hasgpsphotos,
          expectedPermissionDate: userData.expectedpermissiondate,
        };
        setUser(transformedUser);
        setStatus(transformedUser.status);
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };
    fetchUser();
  }, [id]);

  const handleStatusUpdate = async () => {
    try {
      await axios.put(`${config.API_URL}/api/user/${id}/status`, { status });
      setUser({ ...user, status });
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDownloadPDF = () => {
    if (!user) return;
    const doc = new jsPDF();
    let y = 10;
    doc.setFontSize(18);
    doc.text('Credit Application Report', 10, y);
    y += 10;
    doc.setFontSize(12);

    const addLine = (label, value) => {
      const displayValue = (value === undefined || value === null || value === '') ? 'N/A' : value;
      doc.text(`${label}: ${displayValue}`, 10, y);
      y += 8;
    };

    addLine('Full Name', user.fullName);
    addLine('PAN Number', user.panNumber);
    addLine('Aadhaar Number', user.aadhaarNumber);
    addLine('Project Name', user.projectName);
    addLine('Company Name', user.companyName);
    addLine('Credit Requirement', user.creditRequirement + ' Cr');
    addLine('Land Location', user.landLocation);
    addLine('Land Size', user.landSize + ' sq ft');
    addLine('Market Value', user.marketValue);
    addLine('Corporate Phone', user.corporatePhone);
    addLine('TIN Number', user.tinNumber);
    addLine('GST Number', user.gstNumber);
    addLine('CIN Number', user.cinNumber);
    addLine('Planned Start Date', user.plannedStartDate);
    addLine('Ownership Percentage', user.ownershipPercentage + '%');
    addLine('Financial Contribution', user.financialContribution);
    addLine('Has Regulatory Approvals', user.hasRegulatoryApprovals ? 'Yes' : 'No');
    addLine('Has GPS Photos', user.hasGpsPhotos ? 'Yes' : 'No');
    addLine('Expected Permission Date', user.expectedPermissionDate);
    
    // Add Crust Score details only if they have been calculated by admin
    if (user.crust_score !== undefined && user.crust_score !== null && user.crust_score !== '' && !isNaN(Number(user.crust_score)) && Number(user.crust_score) > 0 && user.crust_rating) {
      y += 10; // Add some spacing
      doc.text('Crust Score Details:', 10, y);
      y += 8;
      addLine('Score', Number(user.crust_score).toFixed(2));
      addLine('Rating', user.crust_rating);
      addLine('Risk Level', user.risk_level || 'N/A');
    }
    
    addLine('Status', user.status);
    addLine('Application Date', user.createdAt);

    // Partners (if any)
    if (user.partners) {
      try {
        const partners = JSON.parse(user.partners);
        if (Array.isArray(partners) && partners.length > 0) {
          doc.text('Partners:', 10, y);
          y += 8;
          partners.forEach((p, idx) => {
            doc.text(`  ${idx + 1}. Name: ${p.name}, Ownership: ${p.ownership}%, Contribution: ${p.contribution}`, 12, y);
            y += 8;
          });
        }
      } catch {}
    }

    doc.save(`Credit_Application_${user.fullName || 'Applicant'}.pdf`);
  };

  if (!user) return (
    <div className="login-container">
      <div className="login-card">Loading...</div>
    </div>
  );

  // Only show crust score if it is a valid, nonzero number and rating exists
  const isCrustScoreValid = (
    user.crust_score !== undefined &&
    user.crust_score !== null &&
    user.crust_score !== '' &&
    user.crust_score !== '0' &&
    Number(user.crust_score) > 0 &&
    !isNaN(Number(user.crust_score)) &&
    user.crust_rating !== undefined &&
    user.crust_rating !== null &&
    user.crust_rating !== ''
  );

  return (
    <div className="login-container" style={{ flexDirection: 'column', minHeight: '100vh', background: '#F4F4F2' }}>      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
        <div style={{ fontWeight: 700, fontSize: 22, color: '#7C6A4E', letterSpacing: 1 }}>Application Details</div>
      </div>
      <div className="login-card" style={{
        maxWidth: 800,
        width: '100%',
        margin: '0 auto',
        background: '#fff',
        border: '2px solid #7C6A4E',
        boxShadow: '0 4px 24px 0 rgba(124,106,78,0.08)',
        padding: '32px 32px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <button onClick={() => navigate('/admin-dashboard')} className="submit-button" style={{ width: 'auto', background: '#7C6A4E', padding: '8px 24px' }}>Back to Applications</button>
          <button
            onClick={handleDownloadPDF}
            className="submit-button"
            style={{ width: 'auto', background: '#C2A66C', color: '#003B6F', fontWeight: 700, padding: '8px 24px' }}
          >
            Download Report as PDF
          </button>
        </div>
        <h1 className="login-title" style={{ textAlign: 'center', marginBottom: 8 }}>{user.fullName}</h1>
        <div style={{textAlign:'center', marginBottom: 12}}>
          <span style={{fontWeight:500, color:'#888'}}>Application ID: <span style={{color:'#7C6A4E', fontWeight:700}}>{user.userUniqueId}</span></span>
        </div>
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center', marginBottom: 24 }}>
          <span className="form-title" style={{ marginBottom: 0, display: 'block' }}>Application Status:</span>
          {user.status === 'Accepted' && (
            <span style={{ background: '#48BB78', color: '#fff', padding: '6px 18px', borderRadius: 18, fontWeight: 600 }}>Accepted</span>
          )}
          {user.status === 'Rejected' && (
            <span style={{ background: '#F56565', color: '#fff', padding: '6px 18px', borderRadius: 18, fontWeight: 600 }}>Rejected</span>
          )}
          {user.status !== 'Accepted' && user.status !== 'Rejected' && (
            <span style={{ background: '#C2A66C', color: '#fff', padding: '6px 18px', borderRadius: 18, fontWeight: 600 }}>{user.status}</span>
          )}
        </div>
        <div className="form-group" style={{ marginBottom: 32 }}>
          <h2 className="form-title" style={{ marginBottom: 12 }}>Credit Application Details</h2>
          <div style={{
            background: '#f8f8f8',
            borderRadius: 12,
            padding: 24,
            marginBottom: 0,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 18,
            fontSize: 15
          }}>
            <div>
              <p><strong>Full Name:</strong> {user.fullName}</p>
              <p><strong>PAN Number:</strong> {user.panNumber}</p>
              <p><strong>Aadhaar Number:</strong> {user.aadhaarNumber}</p>
              <p><strong>Project Name:</strong> {user.projectName}</p>
              <p><strong>Company Name:</strong> {user.companyName}</p>
              <p><strong>Credit Requirement:</strong> {user.creditRequirement} Cr</p>
              <p><strong>Land Location:</strong> {user.landLocation}</p>
              <p><strong>Land Size:</strong> {user.landSize} sq ft</p>
              <p><strong>Market Value:</strong> {user.marketValue}</p>
              <p><strong>Corporate Phone:</strong> {user.corporatePhone}</p>
              <p><strong>TIN Number:</strong> {user.tinNumber}</p>
              <p><strong>GST Number:</strong> {user.gstNumber}</p>
              <p><strong>CIN Number:</strong> {user.cinNumber}</p>
            </div>
            <div>
              <p><strong>Planned Start Date:</strong> {user.plannedStartDate}</p>
              <p><strong>Ownership Percentage:</strong> {user.ownershipPercentage}%</p>
              <p><strong>Personal contribution to the development (INR CR):</strong> {user.financialContribution}</p>
              <p><strong>Has Regulatory Approvals:</strong> {user.hasRegulatoryApprovals ? 'Yes' : 'No'}</p>
              <p><strong>Has GPS Photos:</strong> {user.hasGpsPhotos ? 'Yes' : 'No'}</p>
              <p><strong>Expected Permission Date:</strong> {user.expectedPermissionDate}</p>
              {/* Only show crust score if it is a valid, nonzero number and rating exists */}
              {isCrustScoreValid && (
                <>
                  <p><strong>Crust Score:</strong> {Number(user.crust_score).toFixed(2)}</p>
                  <p><strong>Rating:</strong> {user.crust_rating}</p>
                </>
              )}
              <p><strong>Risk Level:</strong> {user.risk_level || 'N/A'}</p>
              <p><strong>Status:</strong> {user.status}</p>
              <p><strong>Application Date:</strong> {user.createdAt}</p>
              {/* Partners */}
              {user.partners && (() => {
                try {
                  const partners = JSON.parse(user.partners);
                  if (Array.isArray(partners) && partners.length > 0) {
                    return (
                      <div style={{ marginTop: 8 }}>
                        <strong>Partners:</strong>
                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                          {partners.map((p, idx) => (
                            <li key={idx}>
                              Name: {p.name}, Ownership: {p.ownership}%, Contribution: {p.contribution}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  }
                } catch { }
                return null;
              })()}
            </div>
          </div>
        </div>
        <div className="form-group" style={{ marginTop: 24 }}>
          <h2 className="form-title" style={{ marginBottom: 10 }}>Admin Notes</h2>
          <textarea className="form-input" rows="3" placeholder="Enter your notes about this application..." style={{ marginBottom: 16 }}></textarea>
          <label className="form-label" style={{ marginTop: 16 }}>Update Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="form-input"
            style={{ width: 220, display: 'inline-block', marginRight: 12 }}
          >            <option value="submitted">Application Submitted</option>
            <option value="credit">Credit Assessment</option>
            <option value="verification">Documents and Legal Verification</option>
            <option value="inspection">Site Inspection</option>
            <option value="final">Final Approval</option>
          </select>
          <button onClick={handleStatusUpdate} className="submit-button" style={{ width: 180, marginTop: 0, marginLeft: 0 }}>
            Update Status
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetails;
