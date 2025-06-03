import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Routes, Route } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import '../login.css';
import config from '../config'; // Updated import path

const CrustScoreSection = ({ modelInputs, handleModelInput, handleModelSubmit, modelResult, modelLoading, error, fetchUsers }) => {
  // Add local state for user selection
  const [selectedUserId, setSelectedUserId] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch users for dropdown
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/api/users`);
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  // Pass selectedUserId to the parent handleModelSubmit
  const handleSubmit = (e) => {
    if (!selectedUserId) {
      alert('Please select an applicant first.');
      return;
    }
    handleModelSubmit(e, selectedUserId);
  };

  return (
    <div style={{padding:32, maxWidth: 600, margin: '0 auto'}}>
      <h2 style={{fontWeight:700, fontSize:24, color:'#7C6A4E', marginBottom: 28, textAlign:'center', letterSpacing:1}}>
        Crust Score Calculator
      </h2>
      
      {/* User selection dropdown */}
      <div style={{marginBottom: 24}}>
        <label style={{display: 'block', marginBottom: 8, color: '#7C6A4E', fontWeight: 600}}>
          Select Application
        </label>
        <select 
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 8,
            border: '1.5px solid #C2A66C',
            color: '#2D3748',
            fontSize: 15
          }}
        >
          <option value="">Select an applicant...</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.userUniqueId} - {user.fullName}
            </option>
          ))}
        </select>
      </div>

      {/* Calculator form */}
      <form onSubmit={handleSubmit} style={{background:'#fff', borderRadius:16, boxShadow:'0 2px 12px rgba(124,106,78,0.08)', border:'1.5px solid #e5e5e5', padding:32}}>
        {/* Asset Section */}
        <fieldset style={{border:'2px solid #C2A66C', borderRadius:12, marginBottom:24, padding:20}}>
          <legend style={{fontWeight:700, fontSize:16, color:'#7C6A4E', padding:'0 12px'}}>Asset (35% Weight)</legend>
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
          <legend style={{fontWeight:700, fontSize:16, color:'#7C6A4E', padding:'0 12px'}}>Behaviour (40% Weight)</legend>
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
          <legend style={{fontWeight:700, fontSize:16, color:'#7C6A4E', padding:'0 12px'}}>Cashflow (25% Weight)</legend>
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
        <button 
          type="submit" 
          className="submit-button" 
          style={{
            marginTop:8, 
            width:'100%', 
            fontWeight:700, 
            fontSize:16, 
            background:'linear-gradient(90deg,#7C6A4E,#C2A66C)', 
            color:'#fff', 
            border:'none', 
            borderRadius:24, 
            height:48
          }} 
          disabled={modelLoading}
        >
          {modelLoading ? 'Calculating...' : 'Calculate Crust Score'}
        </button>
      </form>

      {/* Results display */}
      {modelResult && modelResult.success && (
        <div style={{marginTop:32, color:'#003B6F', fontWeight:600, fontSize:16, background:'#f4f6fa', borderRadius:16, border:'2px solid #C2A66C', padding:28, maxWidth:520, boxShadow:'0 2px 12px rgba(124,106,78,0.08)', textAlign:'left'}}>
          <div style={{marginBottom:8}}><b>Asset Score (35%):</b> {modelResult.asset_score}</div>
          <div style={{marginBottom:8}}><b>Behaviour Score (40%):</b> {modelResult.behaviour_score}</div>
          <div style={{marginBottom:8}}><b>Cashflow Score (25%):</b> {modelResult.cashflow_score}</div>
          <div style={{margin:'16px 0 8px 0', borderTop:'1px solid #e5e5e5'}}></div>
          <div style={{marginBottom:8}}><b>Composite Crust Score:</b> {modelResult.crust_score}</div>
          <div style={{marginBottom:8}}><b>Rating:</b> {modelResult.rating}</div>
          <div><b>Risk Level:</b> {modelResult.risk}</div>
        </div>
      )}
      
      {error && (
        <div style={{color:'#DC2626', marginTop:16, padding:'12px', background:'#FEE2E2', borderRadius:8, fontWeight:500}}>
          {error}
        </div>
      )}
    </div>
  );
};

const ApplicationSection = ({ users, loading, error, handleStatusUpdate, navigate }) => (
  <div style={{ 
    flex: 1, 
    padding: '24px', 
    background: '#F4F4F2',
    overflowX: 'hidden'
  }}>
    <div style={{ 
      width: '100%',
      maxWidth: '1400px',
      margin: '0 auto',
      background: '#fff',
      borderRadius: 20,
      border: '2px solid #7C6A4E',
      boxShadow: '0 4px 24px 0 rgba(124,106,78,0.08)',
      overflow: 'hidden'
    }}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
          Loading applications...
        </div>
      ) : error ? (
        <div className="error-message" style={{ textAlign: 'center' }}>{error}</div>
      ) : (
        <div style={{ overflowX: 'auto', margin: 0 }}>
          <div style={{ minWidth: '1000px' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: 0,
              fontSize: 14
            }}>
              <thead>
                <tr style={{
                  background: 'linear-gradient(90deg, #7C6A4E, #C2A66C)',
                  height: '56px'
                }}>
                  <th style={{ 
                    padding: '16px 20px', 
                    color: '#fff', 
                    fontWeight: 600, 
                    textAlign: 'left', 
                    width: '12%',
                    whiteSpace: 'nowrap'
                  }}>App ID</th>
                  <th style={{ 
                    padding: '16px 20px', 
                    color: '#fff', 
                    fontWeight: 600, 
                    textAlign: 'left', 
                    width: '16%',
                    whiteSpace: 'nowrap'
                  }}>Applicant</th>
                  <th style={{ 
                    padding: '16px 20px', 
                    color: '#fff', 
                    fontWeight: 600, 
                    textAlign: 'left', 
                    width: '14%',
                    whiteSpace: 'nowrap'
                  }}>Phone</th>
                  <th style={{ 
                    padding: '16px 20px', 
                    color: '#fff', 
                    fontWeight: 600, 
                    textAlign: 'left', 
                    width: '14%',
                    whiteSpace: 'nowrap'
                  }}>Application Date</th>
                  <th style={{ 
                    padding: '16px 20px', 
                    color: '#fff', 
                    fontWeight: 600, 
                    textAlign: 'left', 
                    width: '14%',
                    whiteSpace: 'nowrap'
                  }}>Credit (₹ CR)</th>
                  <th style={{ 
                    padding: '16px 20px', 
                    color: '#fff', 
                    fontWeight: 600, 
                    textAlign: 'left', 
                    width: '10%',
                    whiteSpace: 'nowrap'
                  }}>Crust Score</th>
                  <th style={{ 
                    padding: '16px 20px', 
                    color: '#fff', 
                    fontWeight: 600, 
                    textAlign: 'left', 
                    width: '10%',
                    whiteSpace: 'nowrap'
                  }}>Rating</th>
                  <th style={{ 
                    padding: '16px 20px', 
                    color: '#fff', 
                    fontWeight: 600, 
                    textAlign: 'center', 
                    width: '14%',
                    whiteSpace: 'nowrap'
                  }}>Status</th>
                  <th style={{ 
                    padding: '16px 20px', 
                    color: '#fff', 
                    fontWeight: 600, 
                    textAlign: 'right', 
                    width: '16%',
                    whiteSpace: 'nowrap'
                  }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    style={{
                      cursor: 'pointer',
                      borderBottom: '1px solid #eee',
                      transition: 'background 0.2s',
                      '&:hover': {
                        background: 'rgba(124,106,78,0.04)'
                      }
                    }}
                    onClick={e => {
                      if (e.target.tagName.toLowerCase() === 'select') return;
                      navigate(`/admin-user/${user.id}`);
                    }}
                  >
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{fontWeight: 600, color: '#003B6F', fontSize: '13px'}}>{user.userUniqueId}</span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{fontWeight: 600, color: '#2D3748', fontSize: '13px'}}>{user.fullName}</div>
                    </td>
                    <td style={{ padding: '16px 20px', color: '#7C6A4E', fontSize: '13px' }}>
                      {user.corporatePhone || <span style={{color: '#bbb'}}>N/A</span>}
                    </td>
                    <td style={{ padding: '16px 20px', color: '#666', fontSize: '13px' }}>
                      {user.createdAt}
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'left' }}>
                      <span style={{fontWeight: 600, color: '#003B6F', fontSize: '13px'}}>
                        {user.creditRequirement ? `${user.creditRequirement}` : 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'left' }}>
                      <span style={{fontWeight: 600, color: '#003B6F', fontSize: '13px'}}>
                        {user.crust_score !== null && user.crust_score !== undefined ? Number(user.crust_score).toFixed(2) : 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'left' }}>
                      <span style={{fontWeight: 600, color: '#003B6F', fontSize: '13px'}}>
                        {user.crust_rating || 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <span style={{
                        background: user.status === 'Accepted' ? '#48BB78' :
                                  user.status === 'Rejected' ? '#F56565' : '#C2A66C',
                        color: '#fff',
                        padding: '6px 12px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        display: 'inline-block',
                        minWidth: 80,
                        textAlign: 'center'
                      }}>
                        {user.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <select
                        style={{
                          padding: '6px 12px',
                          borderRadius: 16,
                          border: '1.5px solid #C2A66C',
                          background: '#fff',
                          color: '#2D3748',
                          fontSize: 13,
                          fontWeight: 500,
                          outline: 'none',
                          cursor: 'pointer',
                          width: '120px'
                        }}
                        value={user.status || ''}
                        onChange={(e) => handleStatusUpdate(user.id, e.target.value)}
                        onClick={e => e.stopPropagation()}
                      >
                        <option value="">Update Status</option>
                        <option value="Accepted">Accept</option>
                        <option value="Rejected">Reject</option>
                        <option value="Pending">Mark Pending</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div style={{ textAlign: 'center', color: '#666', padding: '40px 0' }}>
                No applications found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  </div>
);

const inputStyle = { width: 60, marginLeft: 8 };
const labelStyle = { fontWeight: 500, marginBottom: 2, color: '#7C6A4E' };

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [modelInputs, setModelInputs] = useState({ a1: '', a2: '', a3: '', b1: '', b2: '', b3: '', b4: '', b5: '', c1: '', c2: '', c3: '' });
  const [modelResult, setModelResult] = useState(null);
  const [modelLoading, setModelLoading] = useState(false);
  const [usersUpdateKey, setUsersUpdateKey] = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${config.API_URL}/api/users`);
      setUsers(response.data);
      setUsersUpdateKey(prevKey => prevKey + 1);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load applications. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.put(`${config.API_URL}/api/user/${id}/status`, { status: newStatus });
      setUsers(users.map(user => user.id === id ? { ...user, status: newStatus } : user));
      setUsersUpdateKey(prevKey => prevKey + 1);
      alert('User status updated successfully!');
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleModelInput = (e) => {
    setModelInputs({ ...modelInputs, [e.target.name]: e.target.value });
  };

  const handleModelSubmit = async (e, userId) => {
    e.preventDefault();
    setModelLoading(true);
    setModelResult(null);
    setError('');
    if (!userId) {
      setError('Please select an applicant first.');
      setModelLoading(false);
      return;
    }
    try {
      setModelResult(null);

      const inputs = Object.keys(modelInputs).reduce((acc, key) => {
        acc[key] = Number(modelInputs[key]);
        return acc;
      }, {});

      for (const [key, value] of Object.entries(inputs)) {
        if (key !== 'c2' && (value < 0 || value > 10)) {
          throw new Error('All scores (except C2) must be between 0 and 10.');
        }
      }
      if (![2, 5, 8, 10].includes(inputs.c2)) {
        alert('C2 should be 10 (>2.0x), 8 (1.5-2.0x), 5 (1.0-1.49x), or 2 (<1.0x) per the scoring guide.');
      }

      const response = await axios.post(`${config.API_URL}/api/user/${userId}/crust-score`, inputs);

      if (response.data.success) {
        setModelResult(response.data);
        console.log('Crust score calculated and saved, fetching users again.');
        fetchUsers();
      } else {
        setError(response.data.message || 'Error calculating crust score on backend.');
      }

    } catch (err) {
      setError(err.message || 'Error calculating crust score.');
    } finally {
      setModelLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', maxWidth: '100vw', overflow: 'hidden' }}>
      <AdminNavbar />
      <div style={{ width: '100%', maxWidth: 1400, margin: '0 auto', paddingTop: 32, overflow: 'visible', position: 'relative' }}>
        <button 
          onClick={() => navigate('/')} 
          style={{
            position: 'absolute',
            top: 0,
            right: 36,
            padding: '8px 20px',
            background: '#C2A66C',
            color: '#fff',
            border: 'none',
            borderRadius: 20,
            fontWeight: 600,
            fontSize: 15,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(124,106,78,0.08)',
            zIndex: 10
          }}
        >
          Logout
        </button>        <Routes>          <Route path="*" element={
            <ApplicationSection 
              key={usersUpdateKey}
              users={users}
              loading={loading}
              error={error}
              handleStatusUpdate={handleStatusUpdate}
              navigate={navigate}
            />
          } />
          <Route path="crust-score" element={
            <CrustScoreSection 
              modelInputs={modelInputs}
              handleModelInput={handleModelInput}
              handleModelSubmit={handleModelSubmit}
              modelResult={modelResult}
              modelLoading={modelLoading}
              error={error}
              fetchUsers={fetchUsers}
            />
          } />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;