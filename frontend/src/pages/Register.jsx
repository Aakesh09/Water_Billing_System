import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Droplets, Home as HomeIcon, Building2, User, CheckCircle2 } from 'lucide-react';
import API from '../services/api';

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [role, setRole] = useState('BUILDING_OWNER');
  const [invitationCode, setInvitationCode] = useState(searchParams.get('code') || '');
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    apartmentName: '',
    blockNo: '',
    flatNo: '',
    meterId: ''
  });

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setInvitationCode(code);
      setRole('RESIDENT');
      verifyCode(code);
    }
  }, [searchParams]);

  const verifyCode = async (codeToVerify) => {
    const targetCode = codeToVerify || invitationCode;
    if (!targetCode) return;
    
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await API.get(`/auth/verify-invitation/${targetCode}`);
      if (res.data?.valid) {
        setFormData(prev => ({
          ...prev,
          fullName: res.data.residentName || prev.fullName,
          email: res.data.residentEmail || '',
          phoneNumber: res.data.phoneNumber || prev.phoneNumber,
          apartmentName: res.data.apartmentName || '',
          blockNo: res.data.blockNo || '',
          flatNo: res.data.flatNo || '',
          meterId: res.data.meterId || ''
        }));
        setIsVerified(true);
      }
    } catch (err) {
      setErrorMsg(err.response?.data || "Invalid or expired invitation code.");
      setIsVerified(false);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      if (isVerified && role === 'RESIDENT') {
        await API.post('/auth/register-resident', {
          invitationCode,
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          password: formData.password
        });
        alert("Resident Registration Successful! Please log in.");
      } else {
        await API.post('/auth/register', { ...formData, role });
        if (role === 'BUILDING_OWNER') {
          alert("Building Owner registration submitted! Account status is PENDING. Wait for Super Admin approval before logging in.");
        } else {
          alert("Registration Successful!");
        }
      }
      navigate('/login');
    } catch (err) {
      alert(err.response?.data || "Registration failed. Please check inputs.");
    }
  };

  const inputStyle = (readOnly) => ({
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #94a3b8',
    borderRadius: '6px',
    fontSize: '0.9rem',
    color: readOnly ? '#475569' : '#0f172a',
    backgroundColor: readOnly ? '#f1f5f9' : '#ffffff',
    boxSizing: 'border-box',
    fontWeight: '600',
    outline: 'none',
    cursor: readOnly ? 'not-allowed' : 'text'
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', fontFamily: 'Inter, system-ui, sans-serif', overflow: 'hidden' }}>
      
      {/* Left Sidebar */}
      <div style={{ width: '35%', backgroundColor: '#080d1a', color: '#ffffff', padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/" style={{ padding: '8px', backgroundColor: '#1e293b', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HomeIcon size={20} color="#94a3b8" />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Droplets size={28} color="#0284c7" />
            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0284c7' }}>AquaTrack</span>
          </div>
        </div>

        <div style={{ margin: 'auto 0', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', margin: '0 0 1rem 0' }}>User Registration</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '380px', margin: '0 auto', lineHeight: '1.6' }}>
            Building Owners require Super Admin verification. Residents enter their invitation code to auto-fill property credentials.
          </p>
        </div>

        <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
          © 2026 AquaTrack
        </div>
      </div>

      {/* Right Registration Form */}
      <div style={{ width: '65%', backgroundColor: '#ffffff', padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', boxSizing: 'border-box', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: '520px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '2.2rem', fontWeight: '800', color: '#0f172a' }}>Create an Account</h2>
            <p style={{ margin: 0, fontSize: '0.95rem', color: '#64748b' }}>Select role and fill details</p>
          </div>

          <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '8px', marginBottom: '1.5rem' }}>
            <button 
              type="button" 
              onClick={() => { setRole('BUILDING_OWNER'); setIsVerified(false); }}
              style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', backgroundColor: role === 'BUILDING_OWNER' ? '#ffffff' : 'transparent', color: role === 'BUILDING_OWNER' ? '#0284c7' : '#64748b' }}
            >
              <Building2 size={16} /> Building Owner
            </button>
            <button 
              type="button" 
              onClick={() => setRole('RESIDENT')}
              style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', backgroundColor: role === 'RESIDENT' ? '#ffffff' : 'transparent', color: role === 'RESIDENT' ? '#0284c7' : '#64748b' }}
            >
              <User size={16} /> Resident
            </button>
          </div>

          {/* Invitation Verification Header */}
          {role === 'RESIDENT' && !isVerified && (
            <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>ENTER INVITATION CODE</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" placeholder="INV-A101-9823" value={invitationCode} onChange={e => setInvitationCode(e.target.value)} style={inputStyle(false)} />
                <button type="button" onClick={() => verifyCode(invitationCode)} disabled={loading} style={{ padding: '10px 18px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '800', cursor: 'pointer' }}>
                  {loading ? '...' : 'Verify'}
                </button>
              </div>
              {errorMsg && <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '6px 0 0 0', fontWeight: '700' }}>{errorMsg}</p>}
            </div>
          )}

          {isVerified && (
            <div style={{ padding: '10px 14px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', fontSize: '0.85rem', fontWeight: '700', borderRadius: '6px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={18} color="#16a34a" /> Verified Invitation! Fields pre-filled below.
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#334155', marginBottom: '4px' }}>FULL NAME</label>
              <input type="text" placeholder="Full Name" required readOnly={isVerified} value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} style={inputStyle(isVerified)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#334155', marginBottom: '4px' }}>EMAIL ID</label>
                <input type="email" placeholder="email@example.com" required readOnly={isVerified} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={inputStyle(isVerified)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#334155', marginBottom: '4px' }}>CREATE PASSWORD</label>
                <input type="password" placeholder="••••••••" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} style={inputStyle(false)} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#334155', marginBottom: '4px' }}>PHONE NUMBER</label>
                <input type="text" placeholder="9876543210" required readOnly={isVerified} value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} style={inputStyle(isVerified)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#334155', marginBottom: '4px' }}>APARTMENT NAME</label>
                <input type="text" placeholder="Apartment Name" required readOnly={isVerified} value={formData.apartmentName} onChange={e => setFormData({ ...formData, apartmentName: e.target.value })} style={inputStyle(isVerified)} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#334155', marginBottom: '4px' }}>BLOCK NO</label>
                <input type="text" placeholder="A" required readOnly={isVerified} value={formData.blockNo} onChange={e => setFormData({ ...formData, blockNo: e.target.value })} style={inputStyle(isVerified)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#334155', marginBottom: '4px' }}>FLAT NO</label>
                <input type="text" placeholder="101" required readOnly={isVerified} value={formData.flatNo} onChange={e => setFormData({ ...formData, flatNo: e.target.value })} style={inputStyle(isVerified)} />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#334155', marginBottom: '4px' }}>METER ID</label>
              <input type="text" placeholder="MTR-101" required readOnly={isVerified} value={formData.meterId} onChange={e => setFormData({ ...formData, meterId: e.target.value })} style={inputStyle(isVerified)} />
            </div>

            <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', fontSize: '1rem' }}>
              Complete Registration
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.9rem', color: '#64748b' }}>
            Already registered? <Link to="/login" style={{ color: '#0284c7', fontWeight: '800', textDecoration: 'none' }}>Log in</Link>
          </div>

        </div>
      </div>
    </div>
  );
}