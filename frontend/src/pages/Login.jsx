import React, { useState } from 'react';
import API from '../services/api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('admin@aquatrack.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', { email, password });
      localStorage.setItem('aquatrack_user', JSON.stringify(res.data));
      onLogin(res.data);
    } catch (err) {
      setError('Invalid credentials or server error.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>AquaTrack Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Email:</label>
          <input 
            type="email" 
            style={{ width: '100%', padding: '8px', marginTop: '4px' }} 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Password:</label>
          <input 
            type="password" 
            style={{ width: '100%', padding: '8px', marginTop: '4px' }} 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px' }}>
          Login
        </button>
      </form>
    </div>
  );
}