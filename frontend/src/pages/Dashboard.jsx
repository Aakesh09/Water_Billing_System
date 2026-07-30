import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';

const mockUsageData = [
  { day: 'Mon', consumption: 220, peerAvg: 250 },
  { day: 'Tue', consumption: 310, peerAvg: 240 },
  { day: 'Wed', consumption: 190, peerAvg: 260 },
  { day: 'Thu', consumption: 450, peerAvg: 255 }, // Leak alert threshold trigger
  { day: 'Fri', consumption: 280, peerAvg: 245 },
  { day: 'Sat', consumption: 340, peerAvg: 280 },
  { day: 'Sun', consumption: 290, peerAvg: 270 },
];

export default function Dashboard({ user, onLogout }) {
  const [usersList, setUsersList] = useState([]);
  const [bills, setBills] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user.role === 'ROLE_SUPER_ADMIN') {
      API.get('/admin/users').then(res => setUsersList(res.data)).catch(console.error);
    } else if (user.role === 'ROLE_RESIDENT') {
      API.get('/resident/bills').then(res => setBills(res.data)).catch(console.error);
    }
  }, [user]);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>
      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #333', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', color: '#646cff' }}>AquaTrack System</h1>
          <span style={{ fontSize: '0.9rem', color: '#888' }}>Smart Water Usage Monitoring & Tiered Billing Platform</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: '0 0 6px 0' }}>Welcome, <strong>{user.fullName}</strong> <span style={{ color: '#4caf50' }}>({user.role})</span></p>
          <button onClick={onLogout} style={{ padding: '6px 14px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
        </div>
      </header>

      {/* RESIDENT VIEW */}
      {user.role === 'ROLE_RESIDENT' && (
        <section>
          <h2 style={{ marginBottom: '1rem' }}>Household Usage Analytics & Peer Comparison</h2>
          
          {/* RECHARTS CONSUMPTION GRAPH */}
          <div style={{ background: '#1e1e1e', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
            <h3>Daily Usage vs. Building Average (Liters)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={mockUsageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="day" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip contentStyle={{ backgroundColor: '#222', border: 'none' }} />
                <Line type="monotone" dataKey="consumption" name="My Flat Usage (L)" stroke="#007bff" strokeWidth={3} />
                <Line type="monotone" dataKey="peerAvg" name="Building Avg (L)" stroke="#28a745" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <h3> Meter Billing Invoices</h3>
          {bills.length === 0 ? <p style={{ color: '#888' }}>No pending invoices found for your flat.</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#222' }}>
                  <th style={{ padding: '10px' }}>Bill #</th>
                  <th style={{ padding: '10px' }}>Period</th>
                  <th style={{ padding: '10px' }}>Consumption</th>
                  <th style={{ padding: '10px' }}>Amount</th>
                  <th style={{ padding: '10px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {bills.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #333' }}>
                    <td style={{ padding: '10px' }}>#{b.id}</td>
                    <td style={{ padding: '10px' }}>{b.billingStartDate} - {b.billingEndDate}</td>
                    <td style={{ padding: '10px' }}>{b.totalLiters} L</td>
                    <td style={{ padding: '10px' }}>${b.totalAmount}</td>
                    <td style={{ padding: '10px' }}><strong style={{ color: b.status === 'PAID' ? '#28a745' : '#ffc107' }}>{b.status}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {/* BUILDING OWNER / ADMIN PANEL */}
      {(user.role === 'ROLE_BUILDING_OWNER' || user.role === 'ROLE_SUPER_ADMIN') && (
        <section>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <button onClick={() => setActiveTab('overview')} style={{ padding: '8px 16px', background: activeTab === 'overview' ? '#007bff' : '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Building Overview</button>
            <button onClick={() => setActiveTab('meter')} style={{ padding: '8px 16px', background: activeTab === 'meter' ? '#007bff' : '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Meter Reading / CSV Entry</button>
            {user.role === 'ROLE_SUPER_ADMIN' && (
              <button onClick={() => setActiveTab('users')} style={{ padding: '8px 16px', background: activeTab === 'users' ? '#007bff' : '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>User Management</button>
            )}
          </div>

          {activeTab === 'overview' && (
            <div style={{ background: '#1e1e1e', padding: '1.5rem', borderRadius: '8px' }}>
              <h3>Apartment Water Distribution Bar Chart</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={mockUsageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="day" stroke="#ccc" />
                  <YAxis stroke="#ccc" />
                  <Tooltip contentStyle={{ backgroundColor: '#222' }} />
                  <Bar dataKey="consumption" fill="#007bff" name="Total Water Logged (L)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeTab === 'meter' && (
            <div style={{ background: '#1e1e1e', padding: '1.5rem', borderRadius: '8px' }}>
              <h3>Record Meter Reading</h3>
              <form onSubmit={e => { e.preventDefault(); alert('Meter reading saved successfully!'); }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label>Meter ID / Household:</label>
                  <input type="text" defaultValue="METER-FLAT-101" style={{ width: '100%', padding: '8px', marginTop: '4px' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label>Current Reading (Liters):</label>
                  <input type="number" defaultValue="14500" style={{ width: '100%', padding: '8px', marginTop: '4px' }} />
                </div>
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Submit Reading
                </button>
              </form>
            </div>
          )}

          {activeTab === 'users' && user.role === 'ROLE_SUPER_ADMIN' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#222' }}>
                  <th style={{ padding: '10px' }}>ID</th>
                  <th style={{ padding: '10px' }}>Full Name</th>
                  <th style={{ padding: '10px' }}>Email</th>
                  <th style={{ padding: '10px' }}>Role</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #333' }}>
                    <td style={{ padding: '10px' }}>{u.id}</td>
                    <td style={{ padding: '10px' }}>{u.fullName}</td>
                    <td style={{ padding: '10px' }}>{u.email}</td>
                    <td style={{ padding: '10px' }}><span style={{ padding: '4px 8px', borderRadius: '4px', background: '#0d6efd' }}>{u.role}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </div>
  );
}