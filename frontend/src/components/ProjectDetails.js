import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useProgress } from '../ProgressContext';
import '../login.css';
import config from '../config';

const ProjectDetails = () => {
  const { id } = useParams();
  const [projectName, setProjectName] = useState('');
  const [creditRequirement, setCreditRequirement] = useState('');
  const [landLocation, setLandLocation] = useState('');
  const [landSize, setLandSize] = useState('');
  const [marketValue, setMarketValue] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { currentStep, setCurrentStep, progressPercentage } = useProgress();

  // Ensure Project Details is step 2
  useEffect(() => {
    if (currentStep !== 2) setCurrentStep(2);
    // eslint-disable-next-line
  }, [currentStep, setCurrentStep]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.put(`${config.API_URL}/api/project/${id}`, {
        projectName,
        creditRequirement,
        landLocation,
        landSize,
        marketValue
      });
      setCurrentStep(4); // Move to Development Planning (step 4)
      navigate(`/development/${id}`);
    } catch (err) {
      setError('Error submitting project details. Please try again.');
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
            Project Details
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
            <label className="form-label">Project Name</label>
            <input
              type="text"
              className="form-input"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Credit Requirement (INR in CR)</label>
            <input
              type="number"
              className="form-input"
              value={creditRequirement}
              onChange={(e) => setCreditRequirement(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Land Location</label>
            <input
              type="text"
              className="form-input"
              value={landLocation}
              onChange={(e) => setLandLocation(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Land Size (Sq Ft)</label>
            <input
              type="number"
              className="form-input"
              value={landSize}
              onChange={(e) => setLandSize(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Market Value (INR in CR)</label>
            <input
              type="number"
              className="form-input"
              value={marketValue}
              onChange={(e) => setMarketValue(e.target.value)}
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

export default ProjectDetails;