import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useProgress } from '../ProgressContext';
import '../login.css';
import config from '../config';

const RegulatoryCompliance = () => {
  const { id } = useParams();
  const [hasRegulatoryApprovals, setHasRegulatoryApprovals] = useState(false);
  const [hasGpsPhotos, setHasGpsPhotos] = useState(false);
  const [expectedPermissionDate, setExpectedPermissionDate] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { currentStep, setCurrentStep, progressPercentage } = useProgress();

  // Ensure Regulatory Compliance is step 5
  useEffect(() => {
    if (currentStep !== 5) setCurrentStep(5);
    // eslint-disable-next-line
  }, [currentStep, setCurrentStep]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.put(`${config.API_URL}/api/regulatory/${id}`, {
        hasRegulatoryApprovals,
        hasGpsPhotos,
        expectedPermissionDate,
      });
      setCurrentStep(6); // Move to Document Submission (step 6)
      navigate(`/submit/${id}`, { state: { hasRegulatoryApprovals } });
    } catch (err) {
      setError('Error submitting regulatory compliance details. Please try again.');
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
            Regulatory Compliance
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
            <label
              className="form-label"
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <input
                type="checkbox"
                checked={hasRegulatoryApprovals}
                onChange={(e) => {
                  setHasRegulatoryApprovals(e.target.checked);
                  if (e.target.checked) setExpectedPermissionDate('');
                }}
                style={{ marginRight: 8 }}
              />
              Has Regulatory Approvals
            </label>
          </div>
          <div className="form-group">
            <label
              className="form-label"
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <input
                type="checkbox"
                checked={hasGpsPhotos}
                onChange={(e) => setHasGpsPhotos(e.target.checked)}
                style={{ marginRight: 8 }}
              />
              Has GPS Photos
            </label>
          </div>
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label">Expected Permission Date (if applicable)</label>
            <input
              type="date"
              className="form-input"
              value={expectedPermissionDate}
              onChange={(e) => setExpectedPermissionDate(e.target.value)}
              disabled={hasRegulatoryApprovals}
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

export default RegulatoryCompliance;