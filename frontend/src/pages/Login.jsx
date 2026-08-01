import React, { useState } from 'react';
import { Droplets, ShieldCheck, Building2, User, Home, KeyRound, Mail, CheckCircle2 } from 'lucide-react';
import API from '../services/api';

export default function Login({ onLogin, onNavigate }) {
  const [role, setRole] = useState('RESIDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalMsg, setModalMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Send selected role along with credentials for strict role matching
      const res = await API.post('/auth/login', { email, password, role });
      localStorage.setItem('aquatrack_user', JSON.stringify(res.data));
      onLogin(res.data);
    } catch (err) {
      setError(err.response?.data || 'Invalid credentials or account role mismatch.');
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setModalMsg('');
    try {
      await API.post('/auth/forgot-password/send-otp', { email: resetEmail });
      setForgotStep(2);
      setModalMsg('OTP Code generated: Use 123456');
    } catch (err) {
      setModalMsg(err.response?.data || 'Email ID not found in database.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setModalMsg('New passwords do not match!');
      return;
    }
    try {
      await API.post('/auth/forgot-password/reset', { email: resetEmail, otp, newPassword });
      setForgotStep(3);
    } catch (err) {
      setModalMsg(err.response?.data || 'Failed to reset password. Verify OTP code.');
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      
      {/* LEFT PANEL */}
      <div style={{ width: '45%', height: '100%', backgroundColor: '#0b1329', color: '#ffffff', padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button type="button" onClick={() => onNavigate('home')} style={{ background: 'rgba(255, 255, 255, 0.1)', border: 'none', borderRadius: '8px', padding: '8px', color: '#38bdf8', cursor: 'pointer', display: 'flex' }}>
            <Home size={22} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.5rem', fontWeight: '700', color: '#0284c7' }}>
            <Droplets size={30} />
            <span>AquaTrack</span>
          </div>
        </div>

        <div style={{ maxWidth: '460px', margin: '2rem 0' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', lineHeight: '1.3', margin: '0 0 1rem 0', color: '#ffffff' }}>
            Smart Water Consumption Analytics and Billing System
          </h1>
        </div>

        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>© 2026 AquaTrack</div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ width: '55%', height: '100%', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '3rem', boxSizing: 'border-box', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          
          <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#0f172a', margin: '0 0 6px 0', textAlign: 'center' }}>Welcome back</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', margin: '0 0 1.75rem 0' }}>Choose your role to continue</p>

          {/* Role Selection Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '1.5rem', padding: '4px', backgroundColor: '#f1f5f9', borderRadius: '10px' }}>
            <button type="button" onClick={() => setRole('SUPER_ADMIN')} style={roleBtnStyle(role === 'SUPER_ADMIN')}>
              <ShieldCheck size={18} /> Super Admin
            </button>
            <button type="button" onClick={() => setRole('BUILDING_OWNER')} style={roleBtnStyle(role === 'BUILDING_OWNER')}>
              <Building2 size={18} /> Building Owner
            </button>
            <button type="button" onClick={() => setRole('RESIDENT')} style={roleBtnStyle(role === 'RESIDENT')}>
              <User size={18} /> Resident
            </button>
          </div>

          {error && <p style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '6px', fontSize: '0.85rem', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>EMAIL ID</label>
              <input type="email" placeholder="name@aquatrack.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>PASSWORD</label>
              <input type="password" placeholder="••••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
            </div>

            <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
              <span onClick={() => { setShowForgotModal(true); setForgotStep(1); setModalMsg(''); }} style={{ fontSize: '0.85rem', color: '#0284c7', fontWeight: '600', cursor: 'pointer' }}>
                Forgot Password?
              </span>
            </div>

            <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}>
              Log in
            </button>
          </form>

          <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
            Don't have an account? <span style={{ color: '#0284c7', fontWeight: '600', cursor: 'pointer' }} onClick={() => onNavigate('register')}>Register here</span>
          </p>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ width: '100%', maxWidth: '420px', backgroundColor: '#ffffff', borderRadius: '12px', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            {forgotStep === 1 && (
              <form onSubmit={handleSendOtp}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0284c7', marginBottom: '1rem' }}>
                  <Mail size={24} />
                  <h3 style={{ margin: 0 }}>Reset Password</h3>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.25rem' }}>Enter your registered email ID to request password reset OTP.</p>
                {modalMsg && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem' }}>{modalMsg}</p>}
                <input type="email" placeholder="email@aquatrack.com" required value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} style={inputStyle} />
                <div style={{ display: 'flex', gap: '10px', marginTop: '1.25rem' }}>
                  <button type="button" onClick={() => setShowForgotModal(false)} style={secBtnStyle}>Cancel</button>
                  <button type="submit" style={priBtnStyle}>Send OTP</button>
                </div>
              </form>
            )}

            {forgotStep === 2 && (
              <form onSubmit={handleResetPassword}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0284c7', marginBottom: '1rem' }}>
                  <KeyRound size={24} />
                  <h3 style={{ margin: 0 }}>Enter OTP & New Password</h3>
                </div>
                {modalMsg && <p style={{ color: '#0284c7', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: '600' }}>{modalMsg}</p>}
                <input type="text" placeholder="6-digit OTP Code (123456)" required value={otp} onChange={(e) => setOtp(e.target.value)} style={{ ...inputStyle, marginBottom: '10px' }} />
                <input type="password" placeholder="New Password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ ...inputStyle, marginBottom: '10px' }} />
                <input type="password" placeholder="Confirm New Password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ ...inputStyle, marginBottom: '1.25rem' }} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => setShowForgotModal(false)} style={secBtnStyle}>Cancel</button>
                  <button type="submit" style={priBtnStyle}>Reset Password</button>
                </div>
              </form>
            )}

            {forgotStep === 3 && (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <CheckCircle2 size={48} color="#22c55e" style={{ margin: '0 auto 1rem auto' }} />
                <h3>Password Updated!</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Your password has been changed in PostgreSQL. Old password will no longer work.</p>
                <button type="button" onClick={() => setShowForgotModal(false)} style={priBtnStyle}>Back to Login</button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

const roleBtnStyle = (active) => ({
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '10px 4px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600', backgroundColor: active ? '#ffffff' : 'transparent', color: active ? '#0284c7' : '#64748b', boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
});
const inputStyle = { width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.95rem', color: '#0f172a', backgroundColor: '#ffffff', outline: 'none', boxSizing: 'border-box' };
const priBtnStyle = { flex: 1, padding: '10px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' };
const secBtnStyle = { flex: 1, padding: '10px', backgroundColor: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' };