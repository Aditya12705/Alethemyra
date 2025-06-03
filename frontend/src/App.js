import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProgressProvider } from './ProgressContext';
import Login from './components/Login';
import KYC from './components/KYC';
import ProjectDetails from './components/ProjectDetails';
import CorporateInfo from './components/CorporateInfo';
import DevelopmentPlanning from './components/DevelopmentPlanning';
import RegulatoryCompliance from './components/RegulatoryCompliance';
import DocumentUpload from './components/DocumentUpload';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import AdminUserDetails from './components/AdminUserDetails';
import AdminLogin from './components/AdminLogin';
import AdminUserDocuments from './components/AdminUserDocuments';

const App = () => {
  return (
    <ProgressProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/kyc/:userId" element={<KYC />} />
          <Route path="/project/:id" element={<ProjectDetails />} />
          <Route path="/corporate/:id" element={<CorporateInfo />} />
          <Route path="/development/:id" element={<DevelopmentPlanning />} />
          <Route path="/regulatory/:id" element={<RegulatoryCompliance />} />
          <Route path="/submit/:userId" element={<DocumentUpload />} />
          <Route path="/user-dashboard/:userId/*" element={<UserDashboard />} />
          <Route path="/admin-dashboard/*" element={<AdminDashboard />} />
          <Route path="/admin-user/:id" element={<AdminUserDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin-dashboard/users" element={<AdminUserDocuments />} />
        </Routes>
      </Router>
    </ProgressProvider>
  );
};

export default App;