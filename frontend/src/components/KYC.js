import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useProgress } from '../ProgressContext';
import '../login.css';
import config from '../config';

const KYC = () => {
  const { userId } = useParams();
  const [fullName, setFullName] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [panName, setPanName] = useState('');
  const [aadhaarName, setAadhaarName] = useState('');
  const [panCardFile, setPanCardFile] = useState(null);
  const [aadhaarCardFile, setAadhaarCardFile] = useState(null);
  const [panCardStatus, setPanCardStatus] = useState('Not Uploaded');
  const [aadhaarCardStatus, setAadhaarCardStatus] = useState('Not Uploaded');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [applicationId, setApplicationId] = useState(null);
  const navigate = useNavigate();
  const { currentStep, setCurrentStep, progressPercentage } = useProgress();

  // Ensure KYC is step 1
  useEffect(() => {
    if (currentStep !== 1) setCurrentStep(1);
    // eslint-disable-next-line
  }, [currentStep, setCurrentStep]);

  const handleFileChange = (e, setFile, setStatus) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setStatus('Uploaded');
    } else {
      setStatus('Not Uploaded');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (fullName !== panName || fullName !== aadhaarName) {
      setError('Names do not match across documents. Please ensure they are the same.');
      return;
    }
    if (!panCardFile || !aadhaarCardFile) {
      setError('Please upload both PAN card and Aadhaar card.');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('panNumber', panNumber);
    formData.append('aadhaarNumber', aadhaarNumber);
    formData.append('userId', userId);
    console.log('Submitting KYC with files:', { panCardFile, aadhaarCardFile });
    formData.append('panCard', panCardFile);
    formData.append('aadhaarCard', aadhaarCardFile);

    try {
      const response = await axios.post(`${config.API_URL}/api/kyc`, formData, {
        headers: {
        },
      });
      if (response.data.success) {
        setApplicationId(response.data.userId);
        setShowResult(true);
        setError('');
      } else {
        setError(response.data.message || 'Error submitting KYC. Please try again.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Error submitting KYC. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceed = () => {
    if (applicationId) {
      setCurrentStep(2);
      navigate(`/corporate/${applicationId}`);
    }
  };

  const handleRetry = () => {
    setShowResult(false);
    setApplicationId(null);
    setError('');
    setFullName('');
    setPanNumber('');
    setAadhaarNumber('');
    setPanName('');
    setAadhaarName('');
    setPanCardFile(null);
    setAadhaarCardFile(null);
    setPanCardStatus('Not Uploaded');
    setAadhaarCardStatus('Not Uploaded');
  };

  return (
    <div className="login-container" style={{flexDirection:'column'}}>
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 32,
        }}
      >
        {/* Only show logo and Cred-Mod-I on login page, so remove here */}
        <div style={{ width: '100%', textAlign: 'center' }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 28,
              color: '#7C6A4E', // Oxidized bronze
              letterSpacing: 1,
            }}
          >
            Alethemyra
          </div>
        </div>
      </div>
      <div className="login-card" style={{maxWidth:500}}>
        <div style={{marginBottom:24}}>
          <h1 className="login-title">Credit Application</h1>
          <p className="form-title" style={{marginBottom:0}}>Complete your credit application in a few steps</p>
        </div>
        <div style={{marginBottom:24}}>
          <h2 className="form-title" style={{marginBottom:8}}>KYC</h2>
          <div style={{marginTop:8}}>
            <div style={{position:'relative',width:'100%',height:8,background:'#fff',borderRadius:8,border:'1px solid #e0e0e0'}}>
              <div
                style={{
                  position: 'absolute',
                  height: '100%',
                  background: '#7C6A4E', // Oxidized bronze
                  borderRadius: 8,
                  transition: 'width 0.3s',
                  width: `${progressPercentage}%`,
                }}
              ></div>
            </div>
            <p style={{fontSize:13,color:'#888',marginTop:6}}>
              Step {currentStep} of 6 ({progressPercentage}%)
            </p>
          </div>
        </div>
        {showResult ? (
          <div style={{textAlign:'center'}}>
            <h3 style={{fontSize:22,fontWeight:600,color:'#003B6F',marginBottom:16}}>KYC Result</h3>
            <div style={{marginBottom:24}}>
              <p style={{fontSize:17,color:'#434343'}}>KYC verification completed successfully.</p>
              <p style={{fontSize:13,color:'#888',marginTop:8}}>
                Please proceed to the next step to continue your application.
              </p>
            </div>
            <div style={{display:'flex',justifyContent:'center',gap:12}}>
              <button
                onClick={handleProceed}
                className="submit-button"
                style={{width:'auto',padding:'8px 24px'}}
              >
                Proceed to Next Step
              </button>
              <button
                onClick={handleRetry}
                className="submit-button"
                style={{width:'auto',padding:'8px 24px',background:'#4B1869'}}
              >
                Retry Application
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">PAN Number</label>
              <input
                type="text"
                className="form-input"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Name on PAN</label>
              <input
                type="text"
                className="form-input"
                value={panName}
                onChange={(e) => setPanName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Aadhaar Number</label>
              <input
                type="text"
                className="form-input"
                value={aadhaarNumber}
                onChange={(e) => setAadhaarNumber(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Name on Aadhaar</label>
              <input
                type="text"
                className="form-input"
                value={aadhaarName}
                onChange={(e) => setAadhaarName(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{marginBottom:24}}>
              <h3 style={{fontSize:16,fontWeight:600,color:'#434343',marginBottom:8}}>Required Documents</h3>
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:12,background:'#fff',border:'1px solid #e0e0e0',borderRadius:8}}>
                  <span style={{color:'#434343'}}>PAN Card</span>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <span style={{fontSize:13,color:panCardStatus === 'Uploaded' ? '#C2A66C' : '#434343'}}>{panCardStatus}</span>
                    <label className="submit-button" style={{width:'auto',padding:'4px 16px',fontSize:13,background:'#C2A66C',margin:0,cursor:'pointer'}}>
                      Upload
                      <input
                        type="file"
                        name="panCard"
                        style={{display:'none'}}
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileChange(e, setPanCardFile, setPanCardStatus)}
                      />
                    </label>
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:12,background:'#fff',border:'1px solid #e0e0e0',borderRadius:8}}>
                  <span style={{color:'#434343'}}>Aadhaar Card</span>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <span style={{fontSize:13,color:aadhaarCardStatus === 'Uploaded' ? '#C2A66C' : '#434343'}}>{aadhaarCardStatus}</span>
                    <label className="submit-button" style={{width:'auto',padding:'4px 16px',fontSize:13,background:'#C2A66C',margin:0,cursor:'pointer'}}>
                      Upload
                      <input
                        type="file"
                        name="aadhaarCard"
                        style={{display:'none'}}
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileChange(e, setAadhaarCardFile, setAadhaarCardStatus)}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
            {error && <p className="error-message">{error}</p>}
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify KYC'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default KYC;
