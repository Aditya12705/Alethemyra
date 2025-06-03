import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useProgress } from '../ProgressContext';
import '../login.css';
import config from '../config';

const FileInput = ({ label, name, onChange, optional = false }) => {
  const [fileName, setFileName] = useState('');

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
    }
    onChange(e);
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
      }}>
        <span style={{
          fontWeight: 600,
          color: '#7C6A4E',
          fontSize: '0.95rem',
        }}>{label}</span>
        {optional && (
          <span style={{
            fontSize: '0.8rem',
            color: '#A08B5B',
            padding: '4px 12px',
            background: '#F8F6F3',
            borderRadius: '12px'
          }}>Optional</span>
        )}
      </div>
      <label style={{
        position: 'relative',
        display: 'block',
        width: '100%',
        height: '44px',
        borderRadius: '10px',
        background: fileName ? '#F0EDE7' : '#F8F6F3',
        border: '1px dashed #A08B5B',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        overflow: 'visible',
        paddingRight: 80,
        boxSizing: 'border-box',
      }}>
        <input
          type="file"
          accept="application/pdf,image/*"
          name={name}
          onChange={handleChange}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            zIndex: 1,
            cursor: 'pointer',
            boxSizing: 'border-box',
          }}
        />
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          color: '#A08B5B',
          fontSize: '0.9rem',
          gap: 8,
          boxSizing: 'border-box',
          overflow: 'visible',
        }}>
          {fileName ? (
            <>
              <span style={{
                color: '#7C6A4E',
                maxWidth: 'calc(100% - 90px)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: '1 1 0%',
                minWidth: 0,
                boxSizing: 'border-box',
              }}>
                {fileName}
              </span>
              <span style={{
                background: '#7C6A4E',
                color: '#fff',
                padding: '2px 10px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                flexShrink: 0,
                marginLeft: 8,
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
              }}>
                Uploaded
              </span>
            </>
          ) : (
            'Click or drag file to upload'
          )}
        </div>
      </label>
    </div>
  );
};

const DocumentUpload = () => {
  const { userId } = useParams();
  const { currentStep, setCurrentStep } = useProgress();
  const [error, setError] = useState('');
  const [bbmpDoc, setBbmpDoc] = useState(null);
  const [planApprovalDoc, setPlanApprovalDoc] = useState(null);
  const [khataCertificateDoc, setKhataCertificateDoc] = useState(null);
  const [fiscalYearLandTaxInvoiceDoc, setFiscalYearLandTaxInvoiceDoc] = useState(null);
  const [bettermentCertificateDoc, setBettermentCertificateDoc] = useState(null);
  const [bwssbDocs, setBwssbDocs] = useState([null, null, null]);
  const [kebDocs, setKebDocs] = useState([null, null, null]);
  const [ecDoc, setEcDoc] = useState(null);
  const [occcDoc, setOcccDoc] = useState(null);
  const [reraDoc, setReraDoc] = useState(null);
  const [ownershipDoc, setOwnershipDoc] = useState(null);
  const [gpsDoc, setGpsDoc] = useState(null);
  const [motherDeedDoc, setMotherDeedDoc] = useState(null);
  const [familyTreeDoc, setFamilyTreeDoc] = useState(null);
  const [nocDoc, setNocDoc] = useState(null);
  const [legalDisputeDoc, setLegalDisputeDoc] = useState(null);
  const [jvDoc, setJvDoc] = useState(null);
  const [ownershipPercentage, setOwnershipPercentage] = useState(100);
  const [partners, setPartners] = useState([]);

  // Fetch user data for JV logic
  useEffect(() => {
    if (currentStep !== 6) setCurrentStep(6);
    axios.get(`${config.API_URL}/api/user/${userId}`)
      .then(res => {
        setOwnershipPercentage(Number(res.data.ownershipPercentage) || 100);
        let parsedPartners = [];
        if (res.data.partners) {
          try {
            parsedPartners = JSON.parse(res.data.partners);
          } catch {}
        }
        setPartners(Array.isArray(parsedPartners) ? parsedPartners : []);
      })
      .catch(() => {});
    // eslint-disable-next-line
  }, [currentStep, setCurrentStep, userId]);

  const handleBwssbChange = (idx, file) => {
    setBwssbDocs(prev => {
      const arr = [...prev];
      arr[idx] = file;
      return arr;
    });
  };

  const handleKebChange = (idx, file) => {
    setKebDocs(prev => {
      const arr = [...prev];
      arr[idx] = file;
      return arr;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const formData = new FormData();
    if (bbmpDoc) formData.append('bbmpDoc', bbmpDoc);
    if (planApprovalDoc) formData.append('planApprovalDoc', planApprovalDoc);
    if (khataCertificateDoc) formData.append('khataCertificateDoc', khataCertificateDoc);
    if (fiscalYearLandTaxInvoiceDoc) formData.append('fiscalYearLandTaxInvoiceDoc', fiscalYearLandTaxInvoiceDoc);
    if (bettermentCertificateDoc) formData.append('bettermentCertificateDoc', bettermentCertificateDoc);
    if (ecDoc) formData.append('ecDoc', ecDoc);
    bwssbDocs.forEach((file, idx) => { if (file) formData.append(`bwssb${idx+1}Doc`, file); });
    kebDocs.forEach((file, idx) => { if (file) formData.append(`keb${idx+1}Doc`, file); });
    if (occcDoc) formData.append('occcDoc', occcDoc);
    if (reraDoc) formData.append('reraDoc', reraDoc);
    if (ownershipDoc) formData.append('ownershipDoc', ownershipDoc);
    if (gpsDoc) formData.append('gpsPhotos', gpsDoc);
    if (motherDeedDoc) formData.append('motherDeedDoc', motherDeedDoc);
    if (familyTreeDoc) formData.append('familyTreeDoc', familyTreeDoc);
    if (nocDoc) formData.append('nocDoc', nocDoc);
    if (legalDisputeDoc) formData.append('legalDisputeDoc', legalDisputeDoc);
    if (ownershipPercentage < 100 && partners && partners.length > 0 && jvDoc) formData.append('jvDoc', jvDoc);
    try {
      await axios.post(`${config.API_URL}/api/submit/${userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      window.location.href = `/user-dashboard/${userId}`;
    } catch (err) {
      setError('Error submitting application. Please try again.');
    }
  };

  return (
    <div className="login-container" style={{ 
      flexDirection: 'column', 
      padding: '40px 0', 
      background: '#F8F6F3',
      minHeight: '100vh'
    }}>
      <div style={{ width: '100%', textAlign: 'center', marginBottom: 40 }}>
        <div style={{
          fontWeight: 800,
          fontSize: 32,
          color: '#7C6A4E',
          letterSpacing: 1.2,
          textTransform: 'uppercase'
        }}>
          Alethemyra
        </div>
      </div>
      <div className="login-card" style={{ 
        maxWidth: 1000, 
        width: '95%', 
        margin: '0 auto', 
        background: '#fff', 
        boxShadow: '0 8px 32px rgba(124, 106, 78, 0.1)', 
        borderRadius: 24, 
        padding: '40px'
      }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 24 }}>
            <h1 className="login-title" style={{ fontSize: 32, color: '#7C6A4E', fontWeight: 800 }}>Credit Application</h1>
            <h2 className="form-title" style={{ margin: '16px 0', fontSize: 22, color: '#A08B5B', fontWeight: 700 }}>
              Document Upload
            </h2>
          </div>

          {/* Regulatory Approval Documents Section */}
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#2D3748', marginBottom: 16 }}>
              Regulatory Approval Documents
            </h3>
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
              {/* Row 1 */}
              <div style={{ flex: 1, minWidth: 320 }}>
                <FileInput label="BBMP Approval" name="bbmpDoc" onChange={e => setBbmpDoc(e.target.files[0])} optional />
              </div>
              <div style={{ flex: 1, minWidth: 320 }}>
                <FileInput label="Plan Approval" name="planApprovalDoc" onChange={e => setPlanApprovalDoc(e.target.files[0])} optional />
              </div>
              {/* Row 2 */}
              <div style={{ flex: 1, minWidth: 320 }}>
                <FileInput label="KHATA" name="khataCertificateDoc" onChange={e => setKhataCertificateDoc(e.target.files[0])} optional />
              </div>
              <div style={{ flex: 1, minWidth: 320 }}>
                <FileInput label="Fiscal Year Land Tax Invoice" name="fiscalYearLandTaxInvoiceDoc" onChange={e => setFiscalYearLandTaxInvoiceDoc(e.target.files[0])} optional />
              </div>
              {/* Row 3 */}
              <div style={{ flex: 1, minWidth: 320 }}>
                <FileInput label="Betterment Certificate" name="bettermentCertificateDoc" onChange={e => setBettermentCertificateDoc(e.target.files[0])} optional />
              </div>
              <div style={{ flex: 1, minWidth: 320 }}>
                <FileInput label="EC" name="ecDoc" onChange={e => setEcDoc(e.target.files[0])} optional />
              </div>
              {/* Row 4 - BWSSB and KEB side by side */}
              <div style={{ flex: 1, minWidth: 320 }}>
                <h4 style={{ fontSize: 18, fontWeight: 600, color: '#4A5568', marginBottom: 12 }}>BWSSB Approvals (Max 3)</h4>
                {[0, 1, 2].map(idx => (
                  <FileInput key={idx} label={`BWSSB Document ${idx + 1}`} name={`bwssb${idx + 1}Doc`} onChange={e => handleBwssbChange(idx, e.target.files[0])} optional />
                ))}
              </div>
              <div style={{ flex: 1, minWidth: 320 }}>
                <h4 style={{ fontSize: 18, fontWeight: 600, color: '#4A5568', marginBottom: 12 }}>KEB Approvals (Max 3)</h4>
                {[0, 1, 2].map(idx => (
                  <FileInput key={idx} label={`KEB Document ${idx + 1}`} name={`keb${idx + 1}Doc`} onChange={e => handleKebChange(idx, e.target.files[0])} optional />
                ))}
              </div>
              {/* Row 5 */}
              <div style={{ flex: 1, minWidth: 320 }}>
                <FileInput label="OCCC Approval" name="occcDoc" onChange={e => setOcccDoc(e.target.files[0])} optional />
              </div>
              <div style={{ flex: 1, minWidth: 320 }}>
                <FileInput label="RERA Approval" name="reraDoc" onChange={e => setReraDoc(e.target.files[0])} optional />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: '100%', height: 2, background: '#e5e5e5', margin: '32px 0 40px 0', borderRadius: 2 }} />

          {/* Property Documents Section */}
          <div style={{
            background: '#f8f9fa',
            padding: '36px 32px 24px 32px',
            borderRadius: '20px',
            marginBottom: '40px',
            boxShadow: '0 4px 24px #ece9e2',
            border: '1.5px solid #e5e5e5',
            maxWidth: 1100,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            <h3 style={{
              marginBottom: '32px',
              color: '#2D3748',
              fontWeight: 800,
              fontSize: 28,
              letterSpacing: 0.5,
              textAlign: 'center',
            }}>
              Property Documents
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
              gap: '32px 40px',
              alignItems: 'start',
              width: '100%',
              margin: '0 auto',
            }}>
              <div style={{ flex: 1, minWidth: 380 }}>
                <FileInput label="Ownership Documents" name="ownershipDoc" onChange={e => setOwnershipDoc(e.target.files[0])} />
              </div>
              <div style={{ flex: 1, minWidth: 380 }}>
                <FileInput label="Mother Deed" name="motherDeedDoc" onChange={e => setMotherDeedDoc(e.target.files[0])} required />
              </div>
              <div style={{ flex: 1, minWidth: 380 }}>
                <FileInput label="GPS-tagged Land Photos" name="gpsPhotos" onChange={e => setGpsDoc(e.target.files[0])} />
              </div>
              <div style={{ flex: 1, minWidth: 380 }}>
                <FileInput label="Family Tree" name="familyTreeDoc" onChange={e => setFamilyTreeDoc(e.target.files[0])} required />
              </div>
              <div style={{ flex: 1, minWidth: 380 }}>
                <FileInput label="NOC" name="nocDoc" onChange={e => setNocDoc(e.target.files[0])} required />
              </div>
              <div style={{ flex: 1, minWidth: 380 }}>
                <FileInput label="Legal Dispute Documents" name="legalDisputeDoc" onChange={e => setLegalDisputeDoc(e.target.files[0])} optional />
              </div>
              {/* JV Document logic: only show if ownership < 100 and partners exist */}
              {ownershipPercentage < 100 && partners && partners.length > 0 && (
                <div style={{ flex: 1, minWidth: 380 }}>
                  <FileInput label="Joint Venture Document" name="jvDoc" onChange={e => setJvDoc(e.target.files[0])} />
                </div>
              )}
            </div>
          </div>

          {error && <p style={{
            color: '#E53E3E',
            background: '#FFF5F5',
            padding: '12px 20px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontWeight: 500
          }}>{error}</p>}
          
          <button 
            type="submit" 
            className="doc-upload-submit"
          >
            Submit Application
          </button>
        </form>
      </div>
    </div>
  );
};

export default DocumentUpload;
