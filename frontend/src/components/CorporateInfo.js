import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useProgress } from '../ProgressContext';
import '../login.css';
import config from '../config'; // Updated import path

const CorporateInfo = () => {
  const { id } = useParams();
  const [corporatePhone, setCorporatePhone] = useState('');
  const [tinNumber, setTinNumber] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [cinNumber, setCinNumber] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { currentStep, setCurrentStep, progressPercentage } = useProgress();

  // Ensure Corporate Info is step 3
  useEffect(() => {
    if (currentStep !== 2) setCurrentStep(2);
    // eslint-disable-next-line
  }, [currentStep, setCurrentStep]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Use config.API_URL instead of hardcoded localhost
      await axios.put(`${config.API_URL}/api/corporate/${id}`, {
        companyName,
        corporatePhone,
        tinNumber,
        gstNumber,
        cinNumber,
      });
      setCurrentStep(3); // Move to Project Details (step 3)
      navigate(`/project/${id}`);
    } catch (err) {
      setError('Error submitting corporate info. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ flexDirection: 'column' }}>
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
      <div className="login-card" style={{ maxWidth: 500 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 className="login-title">Credit Application</h1>
          <p className="form-title" style={{ marginBottom: 0 }}>
            Complete your credit application in a few steps
          </p>
        </div>
        <div style={{ marginBottom: 24 }}>
          <h2 className="form-title" style={{ marginBottom: 8 }}>
            Corporate Information
          </h2>
          <div style={{ marginTop: 8 }}>
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: 8,
                background: '#fff',
                borderRadius: 8,
                border: '1px solid #e0e0e0',
              }}
            >
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
            <p style={{ fontSize: 13, color: '#888', marginTop: 6 }}>
              Step {currentStep} of 6 ({progressPercentage}%)
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Company Name</label>
            <input
              type="text"
              className="form-input"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Corporate Phone Number</label>
            <input
              type="text"
              className="form-input"
              value={corporatePhone}
              onChange={(e) => setCorporatePhone(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">TIN Number</label>
            <input
              type="text"
              className="form-input"
              value={tinNumber}
              onChange={(e) => setTinNumber(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">GST Number</label>
            <input
              type="text"
              className="form-input"
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label">CIN Number</label>
            <input
              type="text"
              className="form-input"
              value={cinNumber}
              onChange={(e) => setCinNumber(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button
            type="submit"
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? 'Submitting...' : 'Next'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CorporateInfo;