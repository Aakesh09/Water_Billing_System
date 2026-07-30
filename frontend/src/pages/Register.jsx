import React, { useState } from 'react';
import API from '../services/api';

export default function Register({ onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: 'RESIDENT'
  });
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/auth/register', formData);
      setMsg('Registration successful! Please log in.');
      setTimeout(() => onSwitchToLogin(), 1500);
    } catch (err) {
      setMsg(err.response?.data || 'Registration failed.');
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '60px auto', padding: '2rem', border: '1px solid #333', borderRadius: '8px', background: '#121212' }}>
      <h2>AquaTrack Registration</h2>
      {msg && <p style={{ color: msg.includes('successful') ? '#4caf50' : '#f44336' }}>{msg}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Full Name:</label>
          <input type="text" required style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Email:</label>
          <input type="email" required style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            onChange={e => setFormData({ ...formData, email: e.target.value })} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Password:</label>
          <input type="password" required style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            onChange={e => setFormData({ ...formData, password: e.target.value })} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Phone Number:</label>
          <input type="text" required style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Role:</label>
          <select style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
            <option value="RESIDENT">Resident Household</option>
            <option value="BUILDING_OWNER">Building / Apartment Admin</option>
          </select>
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Register
        </button>
      </form>
      <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
        Already have an account? <span style={{ color: '#646cff', cursor: 'pointer' }} onClick={onSwitchToLogin}>Login here</span>
      </p>
    </div>
  );
}