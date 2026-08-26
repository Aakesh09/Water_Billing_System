import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Droplets, Home as HomeIcon, ShieldCheck, Building2, User, ShieldAlert } from 'lucide-react';
import API from '../services/api';

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('SUPER_ADMIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await API.post('/auth/login', { email, password, role: selectedRole });

      // 1. Role verification check
      if (res.data.role !== selectedRole) {
        setErrorMsg("Role mismatch! Select proper role.");
        setLoading(false);
        return;
      }

      // 2. Building Owner Approval Check
      if (res.data.role === 'BUILDING_OWNER' && res.data.approvalStatus === 'PENDING') {
        setErrorMsg("Your account is pending Super Admin approval. Please wait for authorization.");
        setLoading(false);
        return;
      }

      onLogin(res.data);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.response?.data || "Role mismatch! Select proper role.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid #94a3b8',
    borderRadius: '8px',
    fontSize: '0.95rem',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    boxSizing: 'border-box',
    outline: 'none',
    fontWeight: '600'
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', fontFamily: 'Inter, system-ui, sans-serif', overflow: 'hidden' }}>
      
      {/* Balanced 40% Left Sidebar */}
      <div style={{ width: '45%', backgroundColor: '#080d1a', color: '#ffffff', padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/" style={{ padding: '8px', backgroundColor: '#dde1e8', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HomeIcon size={20} color="#94a3b8" />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Droplets size={28} color="#0284c7" />
            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0284c7' }}>AquaTrack</span>
          </div>
        </div>

        <div style={{ color: '#ffffff', zIndex: 10 }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#ffffff', lineHeight: 1.3, marginBottom: '1rem', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              Smart Water Consumption Analytics and Billing System
    </h2>
        </div>

        <div style={{ textAlign: 'center', color: '#ecf1f7', fontSize: '0.85rem' }}>
          © 2026 AquaTrack
        </div>
      </div>

      {/* Spacious 60% Right Login Panel */}
      <div style={{ width: '55%', backgroundColor: '#ffffff', padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', boxSizing: 'border-box' }}>
        <div style={{ width: '100%', maxWidth: '460px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ margin: '0 0 6px 0', fontSize: '2.2rem', fontWeight: '800', color: '#0f172a' }}>Welcome back</h2>
            <p style={{ margin: 0, fontSize: '0.95rem', color: '#64748b' }}>Choose your role to continue</p>
          </div>

          {/* Role Tab Controls */}
          <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '5px', borderRadius: '10px', marginBottom: '2rem' }}>
            <button 
              type="button" 
              onClick={() => setSelectedRole('SUPER_ADMIN')}
              style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', backgroundColor: selectedRole === 'SUPER_ADMIN' ? '#ffffff' : 'transparent', color: selectedRole === 'SUPER_ADMIN' ? '#0284c7' : '#64748b', boxShadow: selectedRole === 'SUPER_ADMIN' ? '0 2px 4px rgba(0,0,0,0.08)' : 'none' }}
            >
              <ShieldCheck size={16} /> Super Admin
            </button>
            <button 
              type="button" 
              onClick={() => setSelectedRole('BUILDING_OWNER')}
              style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', backgroundColor: selectedRole === 'BUILDING_OWNER' ? '#ffffff' : 'transparent', color: selectedRole === 'BUILDING_OWNER' ? '#0284c7' : '#64748b', boxShadow: selectedRole === 'BUILDING_OWNER' ? '0 2px 4px rgba(0,0,0,0.08)' : 'none' }}
            >
              <Building2 size={16} /> Building Owner
            </button>
            <button 
              type="button" 
              onClick={() => setSelectedRole('RESIDENT')}
              style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', backgroundColor: selectedRole === 'RESIDENT' ? '#ffffff' : 'transparent', color: selectedRole === 'RESIDENT' ? '#0284c7' : '#64748b', boxShadow: selectedRole === 'RESIDENT' ? '0 2px 4px rgba(0,0,0,0.08)' : 'none' }}
            >
              <User size={16} /> Resident
            </button>
          </div>

          {errorMsg && (
            <div style={{ padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} color="#ef4444" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#334155', marginBottom: '6px', letterSpacing: '0.05em' }}>EMAIL ID</label>
              <input 
                type="email" 
                placeholder="user@aquatrack.com" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                style={inputStyle} 
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#334155', marginBottom: '6px', letterSpacing: '0.05em' }}>PASSWORD</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                style={inputStyle} 
              />
            </div>

            <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Please contact system administrator to reset credentials.'); }} style={{ color: '#0284c7', fontSize: '0.85rem', fontWeight: '700', textDecoration: 'none' }}>Forgot Password?</a>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ width: '100%', padding: '14px', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', fontSize: '1rem' }}
            >
              {loading ? 'Authenticating...' : 'Log in'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: '#64748b' }}>
            Don't have account! <Link to="/register" style={{ color: '#0284c7', fontWeight: '800', textDecoration: 'none' }}>Register here</Link>
          </div>

        </div>
      </div>
    </div>
  );
}