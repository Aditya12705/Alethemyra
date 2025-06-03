import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from '../config';

const AdminUserDocuments = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${config.API_URL}/api/users`).then(res => {
      const transformedUsers = res.data.map(user => ({
        ...user,
        userUniqueId: user.useruniqueid,
        fullName: user.fullname,
      }));
      setUsers(transformedUsers);
    });
  }, []);

  useEffect(() => {
    if (selectedUser) {
      axios.get(`${config.API_URL}/api/user/${selectedUser.id}`).then(res => {
        const userData = res.data;
        const extractedDocuments = [
          { type: 'PAN Card', path: userData.pancardpath },
          { type: 'Aadhaar Card', path: userData.aadhaarcardpath },
          { type: 'Mother Deed', path: userData.motherdeeddocpath },
          { type: 'Family Tree', path: userData.familytreedocpath },
          { type: 'NOC', path: userData.nocdocpath },
          { type: 'Ownership Document', path: userData.ownershipdocpath },
          { type: 'Regulatory Document', path: userData.regulatorydocpath },
          { type: 'GPS Document', path: userData.gpsdocpath },
          { type: 'BBMP Document', path: userData.bbmpdocpath },
          { type: 'Plan Approval Document', path: userData.planapprovaldocpath },
          { type: 'Khata Certificated Document', path: userData.khatacertificatedocpath },
          { type: 'Fiscal Year Land Tax Invoiced Document', path: userData.fiscalyearlandtaxinvoicedocpath },
          { type: 'Betterment Certificated Document', path: userData.bettermentcertificatedocpath },
          { type: 'BWSSB1 Document', path: userData.bwssb1docpath },
          { type: 'BWSSB2 Document', path: userData.bwssb2docpath },
          { type: 'BWSSB3 Document', path: userData.bwssb3docpath },
          { type: 'KEB1 Document', path: userData.keb1docpath },
          { type: 'KEB2 Document', path: userData.keb2docpath },
          { type: 'KEB3 Document', path: userData.keb3docpath },
          { type: 'EC Document', path: userData.ecdocpath },
          { type: 'OCC Document', path: userData.occcdocpath },
          { type: 'RERA Document', path: userData.reradocpath },
          { type: 'Land Document', path: userData.landdocpath },
          { type: 'JV Document', path: userData.jvdocpath },
          { type: 'Legal Disputed Document', path: userData.legaldisputedocpath },
        ].filter(doc => doc.path); // Filter out documents with null or undefined paths

        setDocuments(extractedDocuments);
        setSelectedDoc(null);
        setNotes(userData.documentnotes || '');
      });
    } else {
      setDocuments([]);
      setSelectedDoc(null);
      setNotes('');
    }
  }, [selectedUser]);

  const refreshDocuments = () => {
    if (selectedUser) {
      axios.get(`${config.API_URL}/api/user/${selectedUser.id}/documents`).then(res => {
        setDocuments(res.data.documents || []);
        setNotes(res.data.notes || '');
      });
    }
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    await axios.post(`${config.API_URL}/api/user/${selectedUser.id}/documents/notes`, { notes });
    setSaving(false);
    refreshDocuments();
  };

  return (
    <div style={{display:'flex',height:'80vh',gap:32,padding:32}}>
      <div style={{position:'absolute',top:24,left:32}}>
        <button onClick={()=>navigate('/admin-dashboard')} style={{padding:'8px 24px',background:'#C2A66C',color:'#fff',border:'none',borderRadius:8,fontWeight:600,fontSize:15,cursor:'pointer',boxShadow:'0 2px 8px #C2A66C22'}}>
          Go to Dashboard
        </button>
      </div>
      {/* Left: User and document tiles */}
      <div style={{width:320,overflowY:'auto',borderRight:'1.5px solid #e5e5e5',paddingRight:24,marginTop:48}}>
        <h2 style={{fontWeight:700,fontSize:20,color:'#7C6A4E',marginBottom:16}}>Users</h2>
        {users.map(user => (
          <div key={user.id} style={{marginBottom:12}}>
            <div onClick={()=>setSelectedUser(user)} style={{cursor:'pointer',padding:12,borderRadius:8,background:selectedUser?.id===user.id?'#C2A66C22':'#fff',fontWeight:600}}>
              {user.fullName || user.userUniqueId}
            </div>
            {selectedUser?.id===user.id && (
              <div style={{marginTop:8}}>
                {documents.length > 0 ? documents.map((doc,idx)=>(
                  <div key={idx} onClick={()=>setSelectedDoc(doc)} style={{padding:8,marginBottom:6,borderRadius:6,background:selectedDoc===doc?'#C2A66C44':'#f4f4f4',cursor:'pointer',fontSize:14}}>
                    {doc.type||doc.name||`Document ${idx+1}`}
                  </div>
                )) : <div style={{color:'#888',fontSize:13}}>No documents uploaded</div>}
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Right: Document viewer and notes */}
      <div style={{flex:1,display:'flex',flexDirection:'column',gap:24,marginTop:48}}>
        <div style={{flex:1,background:'#fff',borderRadius:12,padding:24,boxShadow:'0 2px 8px #C2A66C22'}}>
          <h2 style={{fontWeight:700,fontSize:20,color:'#7C6A4E',marginBottom:16}}>Document Viewer</h2>
          {selectedDoc ? (
            <iframe
              src={`${config.API_URL}/${selectedDoc.path}`}
              title={selectedDoc.type||selectedDoc.name}
              style={{width:'100%',height:'60vh',border:'1.5px solid #e5e5e5',borderRadius:8}}
            />
          ) : (
            <div style={{color:'#888'}}>Select a document to view</div>
          )}
        </div>
        <div style={{background:'#fff',borderRadius:12,padding:24,boxShadow:'0 2px 8px #C2A66C22'}}>
          <h3 style={{fontWeight:600,fontSize:16,color:'#7C6A4E',marginBottom:8}}>Admin Notes</h3>
          <textarea
            value={notes}
            onChange={e=>setNotes(e.target.value)}
            rows={4}
            style={{width:'100%',border:'1.5px solid #e5e5e5',borderRadius:8,padding:12,fontSize:15}}
            placeholder="Write notes about the user's documents here..."
          />
          <button onClick={handleSaveNotes} disabled={saving} style={{marginTop:12,padding:'8px 24px',background:'#C2A66C',color:'#fff',border:'none',borderRadius:8,fontWeight:600,fontSize:15}}>
            {saving ? 'Saving...' : 'Save Notes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUserDocuments;
