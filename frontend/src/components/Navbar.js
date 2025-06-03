import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ userId }) => {
  const location = useLocation();

  const getNavLinkStyle = (path) => ({
    ...navLinkStyle,
    background: location.pathname.endsWith(path) ? 'rgba(124,106,78,0.08)' : 'transparent',
    color: location.pathname.endsWith(path) ? '#003B6F' : '#7C6A4E'
  });

  return (
    <nav style={{
      width: '100%',
      background: '#fff',
      borderBottom: '1.5px solid #e5e5e5',
      padding: '0 16px',
      display: 'flex',
      alignItems: 'center',
      height: 70,
      justifyContent: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 8px 0 rgba(124,106,78,0.04)'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: 12,
        marginRight: 32
      }}>
        <img src="/alethemyra-logo.jpg" alt="Alethemyra Logo" style={{ height: 36, marginRight: 6, borderRadius: 6 }} />
        <span style={{ fontWeight: 700, fontSize: 24, color: '#7C6A4E', letterSpacing: 1, fontFamily: 'Poppins, sans-serif' }}>
          Alethemyra
        </span>
      </div>
      <div style={{ 
        display: 'flex', 
        gap: 4, 
        padding: '0 12px',
        background: 'rgba(124,106,78,0.03)',
        borderRadius: 12,
        height: 45,
        alignItems: 'center'
      }}>
        <Link to={`/user-dashboard/${userId}`} style={getNavLinkStyle('')}>Dashboard</Link>
        <Link to={`/user-dashboard/${userId}/details`} style={getNavLinkStyle('details')}>Application</Link>
        <Link to={`/user-dashboard/${userId}/score`} style={getNavLinkStyle('score')}>Crust Score</Link>
        <Link to={`/user-dashboard/${userId}/documents`} style={getNavLinkStyle('documents')}>Documents</Link>
      </div>
    </nav>
  );
};

const navLinkStyle = {
  color: '#7C6A4E',
  fontWeight: 600,
  textDecoration: 'none',
  fontSize: 15,
  padding: '6px 16px',
  borderRadius: 8,
  transition: 'all 0.2s ease',
  fontFamily: 'Poppins, sans-serif',
  whiteSpace: 'nowrap',
  display: 'flex',
  alignItems: 'center',
  height: 35,
};

export default Navbar;
