import { useState, useEffect } from 'react';
import axios from 'axios';
import '../login.css';
import Navbar from './Navbar';
import { useParams, useNavigate, Routes, Route } from 'react-router-dom';
import OptionalDocumentUpload from './OptionalDocumentUpload';
import config from '../config';

const ApplicationDetails = ({ user, documents }) => (
  <div style={{padding:32}}>
    <h2 style={{fontWeight:700, fontSize:28, color:'#7C6A4E', marginBottom:24}}>Application Details</h2>
    <div style={{
      background:'#fff',
      borderRadius:16,
      padding:32,
      boxShadow:'0 2px 12px rgba(124,106,78,0.08)',
      border:'1.5px solid #e5e5e5'
    }}>
      {/* Basic Information */}
      <div style={{marginBottom:32}}>
        <h3 style={{fontSize:20, fontWeight:600, color:'#2D3748', marginBottom:16}}>Basic Information</h3>
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))',
          gap:24,
          fontSize:15
        }}>
          <div><b>Application ID:</b> <span style={{color:'#7C6A4E', fontWeight:500}}>{user.userUniqueId}</span></div>
          <div><b>Status:</b> <span style={{
            background: user.status === 'Accepted' ? '#48BB78' : 
                       user.status === 'Rejected' ? '#F56565' : '#C2A66C',
            color:'#fff',
            padding:'4px 12px',
            borderRadius:12,
            fontSize:13,
            fontWeight:600
          }}>{user.status}</span></div>
          <div><b>Applied on:</b> {user.createdAt}</div>
          <div><b>Full Name:</b> {user.fullName}</div>
        </div>
      </div>

      {/* KYC Details */}
      <div style={{marginBottom:32}}>
        <h3 style={{fontSize:20, fontWeight:600, color:'#2D3748', marginBottom:16}}>KYC Details</h3>
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))',
          gap:24,
          fontSize:15
        }}>
          <div><b>PAN Number:</b> {user.panNumber}</div>
          <div><b>Aadhaar Number:</b> {user.aadhaarNumber}</div>
          <div>
            <b>PAN Card:</b> {user.panCardPath ? 
              <a href={`${user.panCardPath}`} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 style={{color:'#003B6F', marginLeft:8}}>
                View Document
              </a> : 'Not uploaded'}
          </div>
          <div>
            <b>Aadhaar Card:</b> {user.aadhaarCardPath ? 
              <a href={`${user.aadhaarCardPath}`} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 style={{color:'#003B6F', marginLeft:8}}>
                View Document
              </a> : 'Not uploaded'}
          </div>
        </div>
      </div>

      {/* Project Details */}
      <div style={{marginBottom:32}}>
        <h3 style={{fontSize:20, fontWeight:600, color:'#2D3748', marginBottom:16}}>Project Details</h3>
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))',
          gap:24,
          fontSize:15
        }}>
          <div><b>Project Name:</b> {user.projectName}</div>
          <div><b>Credit Requirement:</b> ₹{user.creditRequirement} Cr</div>
          <div><b>Land Location:</b> {user.landLocation}</div>
          <div><b>Land Size:</b> {user.landSize} sq ft</div>
          <div><b>Market Value:</b> ₹{user.marketValue}</div>
        </div>
      </div>

      {/* Crust Score Section (if available) */}
      {user.crust_score !== undefined &&
        user.crust_score !== null &&
        user.crust_score !== '' &&
        user.crust_score !== '0' &&
        !isNaN(Number(user.crust_score)) &&
        Number(user.crust_score) > 0 &&
        user.crust_rating !== undefined &&
        user.crust_rating !== null &&
        user.crust_rating !== '' && (
        <div style={{marginBottom:32}}>
          <h3 style={{fontSize:20, fontWeight:600, color:'#2D3748', marginBottom:16}}>Crust Score</h3>
          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))',
            gap:24,
            fontSize:15
          }}>
            <div><b>Score:</b> {user.crust_score}</div>
            <div><b>Rating:</b> {user.crust_rating}</div>
            <div><b>Risk Level:</b> {user.risk_level || 'N/A'}</div>
          </div>
        </div>
      )}

      {/* Corporate Information */}
      <div style={{marginBottom:32}}>
        <h3 style={{fontSize:20, fontWeight:600, color:'#2D3748', marginBottom:16}}>Corporate Information</h3>
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))',
          gap:24,
          fontSize:15
        }}>
          <div><b>Corporate Phone:</b> {user.corporatePhone}</div>
          <div><b>TIN Number:</b> {user.tinNumber}</div>
          <div><b>GST Number:</b> {user.gstNumber}</div>
          <div><b>CIN Number:</b> {user.cinNumber}</div>
          <div><b>Company Name:</b> {user.companyName}</div>
        </div>
      </div>

      {/* Development Planning */}
      <div style={{marginBottom:32}}>
        <h3 style={{fontSize:20, fontWeight:600, color:'#2D3748', marginBottom:16}}>Development Planning</h3>
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))',
          gap:24,
          fontSize:15
        }}>
          <div><b>Planned Start Date:</b> {user.plannedStartDate}</div>
          <div><b>Ownership Percentage:</b> {user.ownershipPercentage}%</div>
          <div><b>Financial Contribution:</b> ₹{user.financialContribution}</div>
          {user.partners && user.partners.length > 0 && (
            <div style={{gridColumn:'1/-1'}}>
              <b>Partners:</b>
              <div style={{marginTop:8, paddingLeft:16}}>
                {JSON.parse(user.partners).map((p, idx) => (
                  <div key={idx} style={{marginBottom:4}}>
                    {idx + 1}. Name: {p.name}, Ownership: {p.ownership}%, Contribution: ₹{p.contribution}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Regulatory Compliance */}
      <div>
        <h3 style={{fontSize:20, fontWeight:600, color:'#2D3748', marginBottom:16}}>Regulatory Compliance</h3>
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))',
          gap:24,
          fontSize:15
        }}>
          <div><b>Regulatory Approvals:</b> {user.hasRegulatoryApprovals ? 'Yes' : 'No'}</div>
          <div><b>GPS Photos:</b> {user.hasGpsPhotos ? 'Yes' : 'No'}</div>
          {user.expectedPermissionDate && (
            <div><b>Expected Permission Date:</b> {user.expectedPermissionDate}</div>
          )}
        </div>
      </div>
    </div>
  </div>
);

const inputStyle = { width: 60, marginLeft: 8 };
const labelStyle = { fontWeight: 500, marginBottom: 2, color: '#7C6A4E' };

const CrustScoreSection = ({ modelInputs, handleModelInput, handleModelSubmit, modelResult, modelLoading, error }) => (
  <div style={{padding:32, maxWidth: 600, margin: '0 auto'}}>
    <h2 style={{fontWeight:700, fontSize:28, color:'#7C6A4E', marginBottom: 28, textAlign:'center', letterSpacing:1}}>Crust Score Calculator</h2>
    <form onSubmit={handleModelSubmit} style={{
      background:'#fff', 
      borderRadius:24,
      boxShadow:'0 4px 16px rgba(124,106,78,0.08)', 
      border:'2px solid #C2A66C',
      padding:32,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Asset Section */}      <fieldset style={{
        border:'2px solid #C2A66C', 
        borderRadius:16, 
        marginBottom:24, 
        padding:24,
        position: 'relative',
        background: '#fff'
      }}>
        <legend style={{
          fontWeight:700, 
          fontSize:18, 
          color:'#7C6A4E', 
          padding:'0 16px',
          background: '#fff'
        }}>Asset (35% Weight)</legend>
        <div style={{display:'flex', flexDirection:'column', gap:18}}>
          <div style={{display:'flex', alignItems:'center'}}>
            <label style={{...labelStyle, minWidth:220}} htmlFor="a1">A1: Pre-Development Value (15%)</label>
            <span style={{fontWeight:400, fontSize:13, color:'#888', marginLeft:8}}>Land ownership, title clarity, zoning compliance, regulatory approvals (RERA, EC, etc.)</span>
            <input id="a1" name="a1" type="number" min="0" max="10" step="0.01" value={modelInputs.a1} onChange={handleModelInput} required style={inputStyle} placeholder="A1" />
          </div>
          <div style={{display:'flex', alignItems:'center'}}>
            <label style={{...labelStyle, minWidth:220}} htmlFor="a2">A2: Site Potential (10%)</label>
            <span style={{fontWeight:400, fontSize:13, color:'#888', marginLeft:8}}>Location attractiveness, infrastructure proximity (metro, highway), connectivity</span>
            <input id="a2" name="a2" type="number" min="0" max="10" step="0.01" value={modelInputs.a2} onChange={handleModelInput} required style={inputStyle} placeholder="A2" />
          </div>
          <div style={{display:'flex', alignItems:'center'}}>
            <label style={{...labelStyle, minWidth:220}} htmlFor="a3">A3: Post-Development Value (10%)</label>
            <span style={{fontWeight:400, fontSize:13, color:'#888', marginLeft:8}}>Market value of finished product, absorption rate in that micro-market</span>
            <input id="a3" name="a3" type="number" min="0" max="10" step="0.01" value={modelInputs.a3} onChange={handleModelInput} required style={inputStyle} placeholder="A3" />
          </div>
        </div>
      </fieldset>
      {/* Behaviour Section */}
      <fieldset style={{border:'2px solid #C2A66C', borderRadius:12, marginBottom:24, padding:20}}>
        <legend style={{fontWeight:700, fontSize:18, color:'#7C6A4E', padding:'0 12px'}}>Behaviour (40% Weight)</legend>
        <div style={{display:'flex', flexDirection:'column', gap:18}}>
          <div style={{display:'flex', alignItems:'center'}}>
            <label style={{...labelStyle, minWidth:220}} htmlFor="b1">B1: Personal Credit Score (10%)</label>
            <span style={{fontWeight:400, fontSize:13, color:'#888', marginLeft:8}}>CIBIL score mapped to buckets</span>
            <input id="b1" name="b1" type="number" min="0" max="10" step="0.01" value={modelInputs.b1} onChange={handleModelInput} required style={inputStyle} placeholder="B1" />
          </div>
          <div style={{display:'flex', alignItems:'center'}}>
            <label style={{...labelStyle, minWidth:220}} htmlFor="b2">B2: Commercial Credit Score (5%)</label>
            <span style={{fontWeight:400, fontSize:13, color:'#888', marginLeft:8}}>From Experian, CIBIL, etc.</span>
            <input id="b2" name="b2" type="number" min="0" max="10" step="0.01" value={modelInputs.b2} onChange={handleModelInput} required style={inputStyle} placeholder="B2" />
          </div>
          <div style={{display:'flex', alignItems:'center'}}>
            <label style={{...labelStyle, minWidth:220}} htmlFor="b3">B3: Personal Financials (5%)</label>
            <span style={{fontWeight:400, fontSize:13, color:'#888', marginLeft:8}}>Net worth, income stability, contingent liabilities</span>
            <input id="b3" name="b3" type="number" min="0" max="10" step="0.01" value={modelInputs.b3} onChange={handleModelInput} required style={inputStyle} placeholder="B3" />
          </div>
          <div style={{display:'flex', alignItems:'center'}}>
            <label style={{...labelStyle, minWidth:220}} htmlFor="b4">B4: Corporate Financials (10%)</label>
            <span style={{fontWeight:400, fontSize:13, color:'#888', marginLeft:8}}>Debt-to-equity, profitability, current ratio, PAT margins</span>
            <input id="b4" name="b4" type="number" min="0" max="10" step="0.01" value={modelInputs.b4} onChange={handleModelInput} required style={inputStyle} placeholder="B4" />
          </div>
          <div style={{display:'flex', alignItems:'center'}}>
            <label style={{...labelStyle, minWidth:220}} htmlFor="b5">B5: Repayment History (10%)</label>
            <span style={{fontWeight:400, fontSize:13, color:'#888', marginLeft:8}}>On-time repayments for loans (home loan, LAP, project finance)</span>
            <input id="b5" name="b5" type="number" min="0" max="10" step="0.01" value={modelInputs.b5} onChange={handleModelInput} required style={inputStyle} placeholder="B5" />
          </div>
        </div>
      </fieldset>
      {/* Cashflow Section */}
      <fieldset style={{border:'2px solid #C2A66C', borderRadius:12, marginBottom:24, padding:20}}>
        <legend style={{fontWeight:700, fontSize:18, color:'#7C6A4E', padding:'0 12px'}}>Cashflow (25% Weight)</legend>
        <div style={{display:'flex', flexDirection:'column', gap:18}}>
          <div style={{display:'flex', alignItems:'center'}}>
            <label style={{...labelStyle, minWidth:220}} htmlFor="c1">C1: Projected Cash Inflows (10%)</label>
            <span style={{fontWeight:400, fontSize:13, color:'#888', marginLeft:8}}>Expected sales, rental income, etc.</span>
            <input id="c1" name="c1" type="number" min="0" max="10" step="0.01" value={modelInputs.c1} onChange={handleModelInput} required style={inputStyle} placeholder="C1" />
          </div>
          <div style={{display:'flex', alignItems:'center'}}>
            <label style={{...labelStyle, minWidth:220}} htmlFor="c2">C2: Debt Service Coverage Ratio (10%)</label>
            <span style={{fontWeight:400, fontSize:13, color:'#888', marginLeft:8}}>Ability to service debt from cash flows</span>
            <input id="c2" name="c2" type="number" step="0.01" value={modelInputs.c2} onChange={handleModelInput} required style={inputStyle} placeholder="C2" />
          </div>
          <div style={{display:'flex', alignItems:'center'}}>
            <label style={{...labelStyle, minWidth:220}} htmlFor="c3">C3: Liquidity Position (5%)</label>
            <span style={{fontWeight:400, fontSize:13, color:'#888', marginLeft:8}}>Cash reserves, access to credit lines</span>
            <input id="c3" name="c3" type="number" min="0" max="10" step="0.01" value={modelInputs.c3} onChange={handleModelInput} required style={inputStyle} placeholder="C3" />
          </div>
        </div>
      </fieldset>
      <button type="submit" className="submit-button" style={{marginTop:8, width:'100%', fontWeight:700, fontSize:18, background:'linear-gradient(90deg,#7C6A4E,#C2A66C)', color:'#fff', border:'none', borderRadius:24, height:48}} disabled={modelLoading}>{modelLoading ? 'Calculating...' : 'Calculate Crust Score'}</button>
    </form>
    {modelResult && modelResult.success && (
      <div style={{marginTop:32, color:'#003B6F', fontWeight:600, fontSize:18, background:'#f4f6fa', borderRadius:16, border:'2px solid #C2A66C', padding:28, maxWidth:520, boxShadow:'0 2px 12px rgba(124,106,78,0.08)', textAlign:'left'}}>
        <div style={{marginBottom:8}}><b>Asset Score (35%):</b> {modelResult.asset_score}</div>
        <div style={{marginBottom:8}}><b>Behaviour Score (40%):</b> {modelResult.behaviour_score}</div>
        <div style={{marginBottom:8}}><b>Cashflow Score (25%):</b> {modelResult.cashflow_score}</div>
        <div style={{margin:'16px 0 8px 0', borderTop:'1px solid #e5e5e5'}}></div>
        <div style={{marginBottom:8}}><b>Composite Crust Score:</b> {modelResult.crust_score}</div>
        <div style={{marginBottom:8}}><b>Rating:</b> {modelResult.rating}</div>
        <div><b>Risk Level:</b> {modelResult.risk}</div>
      </div>
    )}
    {modelResult && !modelResult.success && (
      <div style={{color:'red', marginTop:12, fontWeight:600, fontSize:16}}>{modelResult.message}</div>
    )}
    {error && <div className="error-message" style={{color:'red', marginTop:12, fontWeight:600, fontSize:16}}>{error}</div>}
  </div>
);

const DocumentSection = ({
  documents,
  handleReupload,
  reuploading,
  reuploadMsg,
  userId,
  refreshDocs,
  userUniqueId,
  navigate
}) => {
  const [allRegulatoryUploaded, setAllRegulatoryUploaded] = useState(false);

  // Determine which regulatory docs are present
  const docMap = {};
  if (documents && Array.isArray(documents)) {
    documents.forEach(doc => {
      if (doc.type && doc.type.toLowerCase().includes('bbmp')) docMap['bbmp'] = true;
      if (doc.type && doc.type.toLowerCase().includes('bwssb')) docMap['bwssb'] = true;
      if (doc.type && doc.type.toLowerCase().includes('keb')) docMap['keb'] = true;
      if (doc.type && doc.type.toLowerCase().includes('rera')) docMap['rera'] = true;
      if (doc.type && doc.type.toLowerCase().includes('land')) docMap['land'] = true;
    });
  }

  // Fix useEffect dependency warning: only depend on documents
  useEffect(() => {
    setAllRegulatoryUploaded(docMap['bbmp'] && docMap['bwssb'] && docMap['keb'] && docMap['rera'] && docMap['land']);
  }, [documents]);

  // Status message UI
  const statusBox = (
    <div style={{
      background: '#fff',
      border: '1.5px solid #e5e5e5',
      borderRadius: 20,
      boxShadow: '0 2px 12px rgba(124,106,78,0.08)',
      padding: 32,
      maxWidth: 600,
      margin: '32px auto',
      textAlign: 'center'
    }}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}}>
        <span style={{
          display:'inline-block',
          width:40,
          height:40,
          borderRadius:'50%',
          background: allRegulatoryUploaded ? '#48BB78' : '#C2A66C',
          color:'#fff',
          fontSize:28,
          lineHeight:'40px'
        }}>
          {allRegulatoryUploaded ? '✔' : '⏳'}
        </span>
        <span style={{
          fontWeight:700,
          fontSize:22,
          color: allRegulatoryUploaded ? '#48BB78' : '#C2A66C',
          marginLeft:12
        }}>
          {allRegulatoryUploaded ? 'Application Submitted Successfully' : 'You\'re on the Waitlist'}
        </span>
      </div>
      <div style={{
        background:'#f8f8f8',
        border:'1px solid #e5e5e5',
        borderRadius:12,
        padding:'18px 20px',
        marginBottom:24,
        color:'#222',
        fontSize:16,
        textAlign:'left'
      }}>
        {allRegulatoryUploaded
          ? <>Thank you for applying. We will get back to you in 10 days. In the meantime, we will complete legal, credit, onsite inspection, and regulatory body permission authenticity checks.</>
          : <>You're on the waitlist while we verify your submission. Once permissions are obtained, please upload them and we will proceed.</>
        }
      </div>
      <div style={{marginBottom:18,textAlign:'left'}}>
        <div style={{fontWeight:600,marginBottom:6}}>Application Reference</div>
        <div style={{
          background:'#f4f6fa',
          borderRadius:8,
          padding:'12px 18px',
          color:'#003B6F',
          fontWeight:700,
          fontSize:16,
          letterSpacing:1
        }}>
          REF: {userUniqueId}
        </div>
        <div style={{fontSize:13,marginTop:8,color:'#888'}}>
          You can track your application status using this reference number.
        </div>
      </div>
      <button
        className="submit-button"
        style={{
          width:'100%',
          padding:'12px 24px',
          background:'linear-gradient(90deg,#7C6A4E,#C2A66C)',
          color:'#fff',
          border:'none',
          borderRadius: 24,
          fontWeight:700,
          fontSize:16,
          cursor:'pointer'
        }}
        onClick={() => window.location.href = `/user-dashboard/${userId}`}
      >
        Go to Dashboard
      </button>
    </div>
  );

  // Main UI
  return (
    <div style={{
      padding: 40,
      background: '#fff',
      borderRadius: 24,
      boxShadow: '0 4px 16px rgba(124,106,78,0.08)',
      border: '1.5px solid #e5e5e5',
      maxWidth: 900,
      margin: '0 auto'
    }}>
      <h2 style={{fontWeight:700, fontSize:28, color:'#7C6A4E', marginBottom: 32}}>Your Uploaded Documents</h2>
      {allRegulatoryUploaded ? statusBox : (
        <>
          {/* Uploaded Documents Grid */}
          {documents && (
            <div style={{
              marginBottom: 40,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 28,
              alignItems: 'stretch'
            }}>
              {documents.map((doc, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#F8F6F3',
                    borderRadius: 16,
                    border: '1.5px solid #e5e5e5',
                    boxShadow: '0 2px 8px rgba(124,106,78,0.06)',
                    padding: '24px 18px 18px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minHeight: 120,
                    justifyContent: 'center',
                    transition: 'box-shadow 0.2s',
                    textAlign: 'center'
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 16,
                      color: '#7C6A4E',
                      marginBottom: 10,
                      letterSpacing: 0.2
                    }}
                  >
                    {doc.type}
                  </div>
                  <a
                    href={`${config.API_URL}/${doc.path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '6px 18px',
                      background: '#7C6A4E',
                      color: '#fff',
                      textDecoration: 'none',
                      borderRadius: 10,
                      fontWeight: 600,
                      fontSize: 14,
                      marginTop: 8,
                      transition: 'background 0.2s, box-shadow 0.2s',
                      boxShadow: '0 2px 8px rgba(194,166,108,0.08)'
                    }}
                  >
                    View
                  </a>
                </div>
              ))}
            </div>
          )}
          {/* Add button to upload optional documents */}
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <button
              className="submit-button"
              style={{ width: 'auto', padding: '12px 32px' }}
              onClick={() => navigate(`/user-dashboard/${userId}/upload-optional`)}
            >
              Upload Additional Optional Documents
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const UserDashboard = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [modelInputs, setModelInputs] = useState({ a1: '', a2: '', a3: '', b1: '', b2: '', b3: '', b4: '', b5: '', c1: '', c2: '', c3: '' });
  const [modelResult, setModelResult] = useState(null);
  const [modelLoading, setModelLoading] = useState(false);
  const [documents, setDocuments] = useState(null);
  const [reuploading, setReuploading] = useState(false);
  const [reuploadMsg, setReuploadMsg] = useState('');
  const [applicationStatus, setApplicationStatus] = useState('submitted');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/api/user/${userId}`);
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
          risk_level: userData.risk_level,
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
      } catch (err) {
        setError('Error fetching user details.');
      }
    };
    const fetchDocs = async () => {
      try {
        const res = await axios.get(`${config.API_URL}/api/user/${userId}/documents`);
        setDocuments(res.data.documents || []);
      } catch {}
    };
    const fetchStatus = async () => {
      try {
        const res = await axios.get(`${config.API_URL}/api/user/${userId}/status`);
        setApplicationStatus(res.data.status || 'submitted');
      } catch {}
    };
    fetchUser();
    fetchDocs();
    fetchStatus();
  }, [userId]);

  const handleModelInput = (e) => {
    setModelInputs({ ...modelInputs, [e.target.name]: e.target.value });
  };

  const handleModelSubmit = async (e) => {
    e.preventDefault();
    setModelLoading(true);
    setModelResult(null);
    setError('');
    try {
      // Convert inputs to numbers
      const inputs = Object.keys(modelInputs).reduce((acc, key) => {
        acc[key] = Number(modelInputs[key]);
        return acc;
      }, {});

      // Validate inputs (0-10 range for all except C2)
      for (const [key, value] of Object.entries(inputs)) {
        if (key !== 'c2' && (value < 0 || value > 10)) {
          throw new Error('All scores (except C2) must be between 0 and 10.');
        }
      }
      // Validate C2 separately based on document scoring guide
      // Note: Backend also validates, but a frontend alert is helpful for immediate feedback.
      if (![2, 5, 8, 10].includes(inputs.c2)) {
         // alert('C2 should be 10 (>2.0x), 8 (1.5-2.0x), 5 (1.0-1.49x), or 2 (<1.0x) per the scoring guide.');
         // Decided to remove frontend alert to avoid double validation messages
      }

      // Log inputs before sending to backend
      console.log('Sending inputs to backend:', inputs);

      // Send inputs to backend for calculation and saving
      const response = await axios.post(`${config.API_URL}/api/user/${userId}/crust-score`, inputs);
      
      if (response.data.success) {
        setModelResult(response.data);
        // Optionally refetch user data to show saved score on dashboard immediately
        // fetchUser(); 
      } else {
        setError(response.data.message || 'Error calculating crust score on backend.');
      }

    } catch (err) {
      setError(err.message || 'Error calculating crust score.');
    } finally {
      setModelLoading(false);
    }
  };

  const handleReupload = async (e) => {
    e.preventDefault();
    setReuploading(true);
    setReuploadMsg('');
    setError('');
    const formData = new FormData();
    if (e.target.panCard.files[0]) formData.append('panCard', e.target.panCard.files[0]);
    if (e.target.aadhaarCard.files[0]) formData.append('aadhaarCard', e.target.aadhaarCard.files[0]);
    try {
      await axios.post(`${config.API_URL}/api/user/${userId}/reupload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setReuploadMsg('Document(s) re-uploaded successfully.');
      // Refresh document list
      const res = await axios.get(`${config.API_URL}/api/user/${userId}/documents`);
      setDocuments(res.data.documents);
    } catch (err) {
      setError('Error re-uploading document(s).');
    } finally {
      setReuploading(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    // Clear any local storage/session if used for auth
    localStorage.clear();
    sessionStorage.clear();
    navigate('/');
  };

  // Progress bar component
  const ProgressBar = ({ status }) => {
    // Status order
    const steps = [
      { key: 'submitted', label: 'Application Submitted', desc: 'Your application has been received' },
      { key: 'credit', label: 'Credit Assessment', desc: 'Evaluating credit worthiness' },
      { key: 'verification', label: 'Documents and Legal Verification', desc: 'Verifying all documents and legal compliance' },
      { key: 'inspection', label: 'Site Inspection', desc: 'Physical verification of land' },
      { key: 'final', label: 'Final Approval', desc: 'Final decision on application' },
    ];
    let statusIndex = steps.findIndex(s => s.key === status);
    if (statusIndex === -1) statusIndex = 0; // Default to first step only
    return (
      <div style={{ background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 2px 12px #e5e5e5', marginBottom: 32, maxWidth: 600, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 28, color: '#48BB78', marginRight: 12 }}>✔</span>
          <span style={{ fontWeight: 700, fontSize: 22, color: '#48BB78' }}>Application Submitted Successfully</span>
        </div>
        <div style={{ background: '#f8f8f8', borderRadius: 8, padding: 16, marginBottom: 24, color: '#222', fontSize: 16 }}>
          {statusIndex >= 0 && statusIndex < 2
            ? 'Thank you for applying. We will get back to you in 15 days. In the meantime, we will complete legal, credit, onsite inspection, and regulatory body permission authenticity checks.'
            : statusIndex === 2
              ? 'Your application is under credit assessment.'
              : statusIndex === 3
                ? 'Your application is under site inspection.'
                : statusIndex === 4
                  ? 'Your application is under legal verification.'
                  : statusIndex === 5
                    ? 'Your application has been approved!'
                    : ''}
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>Application Status Tracking</div>
          <ol style={{ listStyle: 'none', padding: 0 }}>
            {steps.map((step, idx) => (
              <li key={step.key} style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                <span style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: idx <= statusIndex ? '#48BB78' : '#e5e5e5',
                  color: idx <= statusIndex ? '#fff' : '#888',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, marginRight: 10
                }}>{idx < statusIndex ? '✔' : idx === statusIndex ? '⏺' : ''}</span>
                <div>
                  <div style={{ fontWeight: idx === statusIndex ? 700 : 500, color: idx === statusIndex ? '#003B6F' : '#222' }}>{step.label}</div>
                  <div style={{ fontSize: 13, color: '#888' }}>{step.desc}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div style={{ background: '#f4f6fa', borderRadius: 8, padding: 16, color: '#003B6F', fontWeight: 700, fontSize: 16, letterSpacing: 1 }}>
          Application Reference<br />REF: {user?.userUniqueId || 'N/A'}
          <div style={{ fontSize: 13, marginTop: 8, color: '#888', fontWeight: 400 }}>
            You can track your application status using this reference number.
          </div>
        </div>
      </div>
    );
  };

  if (!user) return (
    <div className="login-container">
      <div className="login-card">Loading...</div>
    </div>
  );

  return (
    <div style={{width:'100vw', minHeight:'100vh', background:'#faf9f6', overflow:'visible'}}>
      <Navbar userId={userId} />
      <div style={{
        width: '100%',
        maxWidth: 1400,
        margin: '0 auto',
        paddingTop: 32,
        paddingLeft: 40,
        paddingRight: 40,
        paddingBottom: 40,
        position: 'relative',
        overflow: 'visible'
      }}>
        {/* Logout button */}
        <button 
          onClick={handleLogout}
          style={{
            position:'absolute', 
            top:0, 
            right:40,
            margin:24, 
            padding:'8px 24px',
            background:'#C2A66C', 
            color:'#fff', 
            border:'none', 
            borderRadius:24,
            fontWeight:700, 
            fontSize:16, 
            cursor:'pointer', 
            boxShadow:'0 2px 8px rgba(124,106,78,0.15)',
            transition: 'all 0.2s ease',
            '&:hover': {
              background: '#7C6A4E',
              transform: 'translateY(-1px)'
            }
          }}
        >
          Logout
        </button>
        {/* Progress bar and dashboard content */}
        <Routes>
          <Route path="/" element={
            <>
              <ProgressBar status={applicationStatus} user={user} />
            </>
          } />
          <Route path="/application" element={user && documents ? <ApplicationDetails user={user} documents={documents} /> : <div>Loading...</div>} />
          <Route path="/details" element={user && documents ? <ApplicationDetails user={user} documents={documents} /> : <div>Loading...</div>} />
          <Route path="/documents" element={
            <DocumentSection
              documents={documents}
              handleReupload={handleReupload}
              reuploading={reuploading}
              reuploadMsg={reuploadMsg}
              userId={userId}
              refreshDocs={() => {
                axios.get(`${config.API_URL}/api/user/${userId}/documents`).then(res => setDocuments(res.data.documents || []));
              }}
              userUniqueId={user?.userUniqueId}
              navigate={navigate}
            />
          } />
          <Route path="/score" element={
            <CrustScoreSection
              modelInputs={modelInputs}
              handleModelInput={handleModelInput}
              handleModelSubmit={handleModelSubmit}
              modelResult={modelResult}
              modelLoading={modelLoading}
              error={error}
            />
          } />
          <Route path="/upload-optional" element={<OptionalDocumentUpload />} />
        </Routes>
      </div>
    </div>
  );
};

export default UserDashboard;
