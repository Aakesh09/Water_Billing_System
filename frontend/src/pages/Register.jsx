import React, { useState } from 'react';
import { Droplets, Building2, User, Home, Link2 } from 'lucide-react';
import API from '../services/api';

export default function Register({ onSwitchToLogin, onNavigate }) {
  const [role, setRole] = useState('BUILDING_OWNER');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    apartmentName: '',
    blockNo: '',
    flatNo: '',
    meterId: '',
    invitationCode: ''
  });
  const [msg, setMsg] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    try {
      await API.post('/auth/register', { ...formData, role });
      
      if (role === 'BUILDING_OWNER') {
        setMsg({ 
          type: 'success', 
          text: 'Registration submitted! Please wait for Super Admin approval before logging in.' 
        });
      } else {
        setMsg({ type: 'success', text: 'Resident registration successful! You can now log in.' });
      }

      setTimeout(() => onSwitchToLogin(), 3000);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data || 'Registration failed. Check if details already exist or invitation code is invalid.' });
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      
      {/* LEFT PANEL */}
      <div style={{ width: '40%', height: '100%', backgroundColor: '#0b1329', color: '#ffffff', padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button type="button" onClick={() => onNavigate('home')} style={{ background: 'rgba(255, 255, 255, 0.1)', border: 'none', borderRadius: '8px', padding: '8px', color: '#38bdf8', cursor: 'pointer', display: 'flex' }}>
            <Home size={22} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.5rem', fontWeight: '700', color: '#0284c7' }}>
            <Droplets size={30} />
            <span>AquaTrack</span>
          </div>
        </div>

        <div style={{ maxWidth: '400px', margin: '2rem 0' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', lineHeight: '1.25', margin: '0 0 1rem 0' }}>
            User Registration
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#94a3b8', lineHeight: '1.6' }}>
            Building Owners require Super Admin verification. Residents must provide the invitation code issued by their Building Owner.
          </p>
        </div>

        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>© 2026 AquaTrack</div>
      </div>

      {/* RIGHT PANEL (SCROLLABLE FORM) */}
      <div style={{ width: '60%', height: '100%', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', padding: '2.5rem 3.5rem', boxSizing: 'border-box', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: '520px', margin: 'auto' }}>
          
          <h2 style={{ fontSize: '1.85rem', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0', textAlign: 'center' }}>
            Create an Account
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', textAlign: 'center', margin: '0 0 1.5rem 0' }}>
            Select role and fill details
          </p>

          {/* Role Selection Tabs (No Super Admin Option) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '1.5rem', padding: '4px', backgroundColor: '#f1f5f9', borderRadius: '10px' }}>
            <button
              type="button"
              onClick={() => setRole('BUILDING_OWNER')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', backgroundColor: role === 'BUILDING_OWNER' ? '#ffffff' : 'transparent', color: role === 'BUILDING_OWNER' ? '#0284c7' : '#64748b', boxShadow: role === 'BUILDING_OWNER' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
            >
              <Building2 size={18} />
              Building Owner
            </button>
            <button
              type="button"
              onClick={() => setRole('RESIDENT')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', backgroundColor: role === 'RESIDENT' ? '#ffffff' : 'transparent', color: role === 'RESIDENT' ? '#0284c7' : '#64748b', boxShadow: role === 'RESIDENT' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
            >
              <User size={18} />
              Resident
            </button>
          </div>

          {msg.text && (
            <div style={{ padding: '12px', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center', backgroundColor: msg.type === 'success' ? '#f0fdf4' : '#fef2f2', color: msg.type === 'success' ? '#166534' : '#991b1b', border: `1px solid ${msg.type === 'success' ? '#bbf7d0' : '#fecaca'}` }}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            
            <div style={{ gridColumn: 'span 2' }}>
              <label style={lblStyle}>FULL NAME</label>
              <input type="text" name="fullName" required placeholder="John Doe" onChange={handleChange} style={inputStyle} />
            </div>

            <div>
              <label style={lblStyle}>EMAIL ID</label>
              <input type="email" name="email" required placeholder="user@aquatrack.com" onChange={handleChange} style={inputStyle} />
            </div>

            <div>
              <label style={lblStyle}>PASSWORD</label>
              <input type="password" name="password" required placeholder="••••••••" onChange={handleChange} style={inputStyle} />
            </div>

            <div>
              <label style={lblStyle}>PHONE NUMBER</label>
              <input type="text" name="phoneNumber" required placeholder="9876543210" onChange={handleChange} style={inputStyle} />
            </div>

            <div>
              <label style={lblStyle}>APARTMENT NAME</label>
              <input type="text" name="apartmentName" required placeholder="Green Heights" onChange={handleChange} style={inputStyle} />
            </div>

            <div>
              <label style={lblStyle}>BLOCK NO</label>
              <input type="text" name="blockNo" required placeholder="A" onChange={handleChange} style={inputStyle} />
            </div>

            <div>
              <label style={lblStyle}>FLAT NO</label>
              <input type="text" name="flatNo" required placeholder="101" onChange={handleChange} style={inputStyle} />
            </div>

            <div style={{ gridColumn: role === 'RESIDENT' ? 'span 1' : 'span 2' }}>
              <label style={lblStyle}>METER ID</label>
              <input type="text" name="meterId" required placeholder="MTR-101" onChange={handleChange} style={inputStyle} />
            </div>

            {role === 'RESIDENT' && (
              <div>
                <label style={{ ...lblStyle, color: '#0284c7' }}>INVITATION CODE / LINK</label>
                <input type="text" name="invitationCode" required placeholder="INV-A101-99" onChange={handleChange} style={{ ...inputStyle, borderColor: '#0284c7' }} />
              </div>
            )}

            <button type="submit" style={{ gridColumn: 'span 2', padding: '12px', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', marginTop: '0.5rem' }}>
              Register
            </button>
          </form>

          <p style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
            Already registered? <span style={{ color: '#0284c7', fontWeight: '600', cursor: 'pointer' }} onClick={onSwitchToLogin}>Login here</span>
          </p>
        </div>
      </div>
    </div>
  );
}

const lblStyle = { display: 'block', fontSize: '0.725rem', fontWeight: '700', color: '#475569', marginBottom: '4px' };
const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem', color: '#0f172a', backgroundColor: '#ffffff', outline: 'none', boxSizing: 'border-box' };