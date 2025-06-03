import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useProgress } from '../ProgressContext';
import '../login.css';
import styles from './DocumentUpload.module.css'; // Reuse styles
import config from '../config'; // Updated import path

const FileInput = ({ label, name, onChange, optional = false, existingFileName }) => {
  const [fileName, setFileName] = useState(existingFileName || '');

  useEffect(() => {
    setFileName(existingFileName || '');
  }, [existingFileName]);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
    } else {
      setFileName('');
    }
    onChange(name, file);
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

const OptionalDocumentUpload = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState({});
  const [bwssbDocs, setBwssbDocs] = useState([null, null, null]);
  const [kebDocs, setKebDocs] = useState([null, null, null]);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userOwnership, setUserOwnership] = useState(100); // To check if JV is required

  // Fetch existing documents and user ownership on load
  useEffect(() => {
    axios.get(`${config.API_URL}/api/user/${userId}/documents`)
      .then(res => {
        const fetchedDocs = {};
        if (res.data && Array.isArray(res.data.documents)) {
          res.data.documents.forEach(doc => {
            // Store just the filename from the path
            const fileName = doc.path ? doc.path.split('/').pop() : '';
            // Simple mapping for now, might need refinement based on doc.type
            if (doc.type === 'BBMP Document') fetchedDocs.bbmpDoc = fileName;
            if (doc.type === 'Plan Approval') fetchedDocs.planApprovalDoc = fileName;
            if (doc.type === 'KHATA') fetchedDocs.khataCertificateDoc = fileName;
            if (doc.type === 'Fiscal Year Land Tax Invoice') fetchedDocs.fiscalYearLandTaxInvoiceDoc = fileName;
            if (doc.type === 'Betterment Certificate') fetchedDocs.bettermentCertificateDoc = fileName;
            if (doc.type === 'EC') fetchedDocs.ecDoc = fileName;
            // BWSSB and KEB would need specific mapping if multiple are supported later
            // For now, assuming the first uploaded is shown, or need a different approach
            if (doc.type === 'Legal Dispute Documents') fetchedDocs.legalDisputeDoc = fileName;
            if (doc.type === 'JV Document') fetchedDocs.jvDoc = fileName;
            if (doc.type === 'BWSSB Approval' && !fetchedDocs.bwssbDocs) fetchedDocs.bwssbDocs = [fileName, null, null];
            if (doc.type === 'KEB Approval' && !fetchedDocs.kebDocs) fetchedDocs.kebDocs = [fileName, null, null];

          });
        }
        setDocuments(fetchedDocs);
        // If fetchedDocs.bwssbDocs is not set, initialize with [null, null, null]
        setBwssbDocs(fetchedDocs.bwssbDocs || [null, null, null]);
        // If fetchedDocs.kebDocs is not set, initialize with [null, null, null]
        setKebDocs(fetchedDocs.kebDocs || [null, null, null]);
      })
      .catch(() => {});

    axios.get(`${config.API_URL}/api/user/${userId}`)
      .then(res => {
        setUserOwnership(Number(res.data.ownershipPercentage) || 100);
      })
      .catch(() => {});

  }, [userId]);

  const handleFileChange = (name, file) => {
    if (name.startsWith('bwssb')) {
      const index = parseInt(name.replace('bwssb', '').replace('Doc', ''), 10) - 1;
      setBwssbDocs(prev => {
        const arr = [...prev];
        arr[index] = file;
        return arr;
      });
    } else if (name.startsWith('keb')) {
        const index = parseInt(name.replace('keb', '').replace('Doc', ''), 10) - 1;
        setKebDocs(prev => {
          const arr = [...prev];
          arr[index] = file;
          return arr;
        });
    } else {
      setDocuments(prev => ({ ...prev, [name]: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');
    const formData = new FormData();

    // Append only the files that were selected or re-selected
    if (documents.bbmpDoc instanceof File) formData.append('bbmpDoc', documents.bbmpDoc);
    if (documents.planApprovalDoc instanceof File) formData.append('planApprovalDoc', documents.planApprovalDoc);
    if (documents.khataCertificateDoc instanceof File) formData.append('khataCertificateDoc', documents.khataCertificateDoc);
    if (documents.fiscalYearLandTaxInvoiceDoc instanceof File) formData.append('fiscalYearLandTaxInvoiceDoc', documents.fiscalYearLandTaxInvoiceDoc);
    if (documents.bettermentCertificateDoc instanceof File) formData.append('bettermentCertificateDoc', documents.bettermentCertificateDoc);
    if (documents.ecDoc instanceof File) formData.append('ecDoc', documents.ecDoc);
    if (documents.legalDisputeDoc instanceof File) formData.append('legalDisputeDoc', documents.legalDisputeDoc);
    if (documents.jvDoc instanceof File) formData.append('jvDoc', documents.jvDoc);

    bwssbDocs.forEach((file, idx) => { if (file instanceof File) formData.append(`bwssb${idx+1}Doc`, file); });
    kebDocs.forEach((file, idx) => { if (file instanceof File) formData.append(`keb${idx+1}Doc`, file); });


    // Check if any file is being uploaded
    let hasFiles = false;
    for (let pair of formData.entries()) {
        hasFiles = true;
        break;
    }

    if (!hasFiles) {
        setError('Please select at least one file to upload.');
        setIsLoading(false);
        return;
    }

    try {
      const response = await axios.post(`${config.API_URL}/api/user/${userId}/optional-documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccessMsg('Optional documents uploaded successfully!');
      // Optionally refresh document list in the parent dashboard component or here
      // if needed to show uploaded status immediately.
      // For now, let the user navigate back to the dashboard.
      // After successful upload, maybe redirect back to the main dashboard view
      navigate(`/user-dashboard/${userId}/documents`); // Or just show success message

    } catch (err) {
      console.error('Upload error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Error uploading documents. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // List of optional documents to display
  const optionalRegulatoryDocs = [
    { name: 'bbmpDoc', label: 'BBMP Document' },
    { name: 'planApprovalDoc', label: 'Plan Approval' },
    { name: 'khataCertificateDoc', label: 'KHATA' },
    { name: 'fiscalYearLandTaxInvoiceDoc', label: 'Fiscal Year Land Tax Invoice' },
    { name: 'bettermentCertificateDoc', label: 'Betterment Certificate' },
    { name: 'ecDoc', label: 'EC' },
  ];

  const otherOptionalDocs = [
    { name: 'legalDisputeDoc', label: 'Legal Dispute Documents' },
  ];

  // Determine if JV document should be shown (less than 100% ownership)
  const showJvDoc = userOwnership < 100;

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
        <h1 className="login-title" style={{ fontSize: 32, color: '#7C6A4E', fontWeight: 800, marginBottom: 16 }}>Upload Optional Documents</h1>
        <p style={{ marginBottom: 32, color: '#A08B5B', fontSize: 18, textAlign: 'center' }}>
          You can upload the following optional documents to support your application.
        </p>
        
        <form onSubmit={handleSubmit}>

          {/* Optional Regulatory Documents */}
          <div style={{ marginBottom: 40 }}>
            <div style={{
              fontWeight: 700,
              fontSize: 18,
              color: '#A08B5B',
              marginBottom: 24,
              borderBottom: '1px solid #e0e0e0',
              paddingBottom: 8,
            }}>
              Optional Regulatory Documents
            </div>
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
              {optionalRegulatoryDocs.map(doc => (
                <div key={doc.name} style={{ flex: 1, minWidth: 320 }}>
                  <FileInput 
                    label={doc.label} 
                    name={doc.name} 
                    onChange={handleFileChange} 
                    optional 
                    existingFileName={documents[doc.name]}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* BWSSB and KEB Optional Approvals */}
          <div style={{ marginBottom: 40 }}>
            <div style={{
              fontWeight: 700,
              fontSize: 18,
              color: '#A08B5B',
              marginBottom: 24,
              borderBottom: '1px solid #e0e0e0',
              paddingBottom: 8,
            }}>
              Optional BWSSB and KEB Approvals
            </div>
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 320 }}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, color: '#7C6A4E', fontSize: 16, display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                    BWSSB Approvals <span style={{ fontSize: '0.95em', color: '#888', fontWeight: 400, marginLeft: 8 }}>(Optional, up to 3)</span>
                  </div>
                  {[0,1,2].map(idx => (
                    <FileInput
                      key={idx}
                      label={`BWSSB Approval ${idx + 1}`}
                      name={`bwssb${idx+1}Doc`}
                      onChange={handleFileChange}
                      optional
                      existingFileName={bwssbDocs[idx] ? (bwssbDocs[idx].name || bwssbDocs[idx]) : ''}
                    />
                  ))}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 320 }}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, color: '#7C6A4E', fontSize: 16, display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                    KEB Approvals <span style={{ fontSize: '0.95em', color: '#888', fontWeight: 400, marginLeft: 8 }}>(Optional, up to 3)</span>
                  </div>
                  {[0,1,2].map(idx => (
                    <FileInput
                      key={idx}
                      label={`KEB Approval ${idx + 1}`}
                      name={`keb${idx+1}Doc`}
                      onChange={handleFileChange}
                      optional
                      existingFileName={kebDocs[idx] ? (kebDocs[idx].name || kebDocs[idx]) : ''}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Other Optional Documents */}
          <div style={{ marginBottom: 40 }}>
             <div style={{
              fontWeight: 700,
              fontSize: 18,
              color: '#A08B5B',
              marginBottom: 24,
              borderBottom: '1px solid #e0e0e0',
              paddingBottom: 8,
            }}>
              Other Optional Documents
            </div>
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
              {otherOptionalDocs.map(doc => (
                 <div key={doc.name} style={{ flex: 1, minWidth: 320 }}>
                   <FileInput 
                     label={doc.label} 
                     name={doc.name} 
                     onChange={handleFileChange} 
                     optional 
                     existingFileName={documents[doc.name]}
                   />
                 </div>
              ))}
               {showJvDoc && (
                  <div style={{ flex: 1, minWidth: 320 }}>
                    <FileInput 
                      label="Joint Venture Document" 
                      name="jvDoc" 
                      onChange={handleFileChange} 
                      optional 
                      existingFileName={documents.jvDoc}
                    />
                  </div>
                )}
            </div>
          </div>

          {successMsg && <p style={{ color: 'green', marginBottom: 20 }}>{successMsg}</p>}
          {error && <p className="error-message">{error}</p>}

          <button
            type="submit"
            className="submit-button"
            disabled={isLoading}
            style={{ width: 'auto', padding: '12px 32px', margin: '0 auto', display: 'block' }}
          >
            {isLoading ? 'Uploading...' : 'Upload Selected Documents'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OptionalDocumentUpload; 