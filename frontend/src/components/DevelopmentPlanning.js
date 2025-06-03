import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useProgress } from '../ProgressContext';
import '../login.css';
import config from '../config';

const DevelopmentPlanning = () => {
  const { id } = useParams();
  const [plannedStartDate, setPlannedStartDate] = useState('');
  const [ownershipPercentage, setOwnershipPercentage] = useState('');
  const [financialContribution, setFinancialContribution] = useState('');
  const [partners, setPartners] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [developmentStarted, setDevelopmentStarted] = useState('');
  const [developmentPercent, setDevelopmentPercent] = useState('');
  const navigate = useNavigate();
  const { currentStep, setCurrentStep, progressPercentage } = useProgress();

  // Ensure Development Planning is step 4
  useEffect(() => {
    if (currentStep !== 4) setCurrentStep(4);
    // eslint-disable-next-line
  }, [currentStep, setCurrentStep]);

  // Handle ownership change and reset partners if 100%
  const handleOwnershipChange = (e) => {
    const value = e.target.value;
    setOwnershipPercentage(value);
    if (parseInt(value) === 100) {
      setPartners([]);
    } else if (partners.length === 0 && value && parseInt(value) < 100) {
      setPartners([{ name: '', ownership: '', contribution: '' }]);
    }
  };

  // Add new partner field
  const addPartner = () => {
    setPartners([...partners, { name: '', ownership: '', contribution: '' }]);
  };

  // Remove partner field
  const removePartner = (idx) => {
    setPartners(partners.filter((_, i) => i !== idx));
  };

  // Update partner field
  const handlePartnerChange = (idx, field, value) => {
    const updated = partners.map((p, i) =>
      i === idx ? { ...p, [field]: value } : p
    );
    setPartners(updated);
  };

  // Calculate total ownership
  const totalOwnership = () => {
    let total = parseFloat(ownershipPercentage || 0);
    partners.forEach((p) => {
      total += parseFloat(p.ownership || 0);
    });
    return total;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // Validation for partners
    if (ownershipPercentage !== '' && parseInt(ownershipPercentage) < 100) {
      let total = parseFloat(ownershipPercentage || 0);
      let valid = true;
      partners.forEach((p) => {
        if (!p.name || !p.ownership) valid = false;
        total += parseFloat(p.ownership || 0);
      });
      if (!valid) {
        setError('Please fill all partner fields.');
        return;
      }
      if (Math.round(total) !== 100) {
        setError('Total ownership (including user and partners) must add up to 100%.');
        return;
      }
    }
    setIsLoading(true);
    try {
      await axios.put(`${config.API_URL}/api/development/${id}`, {
        developmentStarted,
        developmentPercent: developmentStarted === 'yes' ? developmentPercent : '',
        plannedStartDate: developmentStarted === 'no' ? plannedStartDate : '',
        ownershipPercentage,
        financialContribution,
        partners, // send partners array to backend
      });
      setCurrentStep(5); // Move to Regulatory Compliance (step 5)
      navigate(`/regulatory/${id}`);
    } catch (err) {
      setError('Error submitting development planning details. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
      <div className="login-card" style={{ maxWidth: 500 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 className="login-title">Credit Application</h1>
          <p className="form-title" style={{ marginBottom: 0 }}>
            Complete your credit application in a few steps
          </p>
        </div>
        <div style={{ marginBottom: 24 }}>
          <h2 className="form-title" style={{ marginBottom: 8 }}>
            Development Planning
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
            <label className="form-label">Has Development Started?</label>
            <select
              className="form-input"
              value={developmentStarted}
              onChange={e => setDevelopmentStarted(e.target.value)}
              required
            >
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          {/* If development started, ask for percent complete */}
          {developmentStarted === 'yes' && (
            <div className="form-group">
              <label className="form-label">What percentage of development is done?</label>
              <input
                type="number"
                className="form-input"
                value={developmentPercent}
                onChange={e => setDevelopmentPercent(e.target.value)}
                min="0"
                max="100"
                required
              />
            </div>
          )}
          {/* If not started, ask for planned start date */}
          {developmentStarted === 'no' && (
            <div className="form-group">
              <label className="form-label">Planned Start Date</label>
              <input
                type="date"
                className="form-input"
                value={plannedStartDate}
                onChange={(e) => setPlannedStartDate(e.target.value)}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Ownership Percentage (%) (You)</label>
            <input
              type="number"
              className="form-input"
              value={ownershipPercentage}
              onChange={handleOwnershipChange}
              min="0"
              max="100"
              required
            />
          </div>
          {ownershipPercentage !== '' && parseInt(ownershipPercentage) < 100 && (
            <div className="form-group" style={{marginBottom: 0}}>
              <label className="form-label">Partners</label>
              {partners.map((partner, idx) => (
                <div key={idx} style={{marginBottom: 12, border: '1px solid #eee', borderRadius: 8, padding: 10, background: '#fafafa'}}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={`Partner ${idx + 1} Name`}
                    value={partner.name}
                    onChange={e => handlePartnerChange(idx, 'name', e.target.value)}
                    style={{marginBottom: 8}}
                  />
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Ownership %"
                    value={partner.ownership}
                    min="0"
                    max="100"
                    onChange={e => handlePartnerChange(idx, 'ownership', e.target.value)}
                    style={{marginBottom: 8}}
                  />
                  <button
                    type="button"
                    className="submit-button"
                    style={{background:'#e53e3e',width:'100%',marginTop:8}}
                    onClick={() => removePartner(idx)}
                  >
                    Remove Partner
                  </button>
                </div>
              ))}
              {totalOwnership() < 100 && (
                <button
                  type="button"
                  className="submit-button"
                  style={{width:'100%',marginTop:8,background:'#003B6F'}}
                  onClick={addPartner}
                >
                  Add Partner
                </button>
              )}
            </div>
          )}
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label">Personal contribution to the development (INR CR)</label>
            <input
              type="number"
              className="form-input"
              value={financialContribution}
              onChange={e => setFinancialContribution(e.target.value)}
              min="0"
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

export default DevelopmentPlanning;
