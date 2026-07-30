import React, { useState, useEffect } from 'react';
import API from '../services/api';

export default function Dashboard({ user, onLogout }) {
  const [bills, setBills] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (user.role === 'ROLE_RESIDENT') {
      API.get('/resident/bills')
        .then(res => setBills(res.data))
        .catch(err => console.error(err));
    } else if (user.role === 'ROLE_SUPER_ADMIN') {
      API.get('/admin/users')
        .then(res => setUsers(res.data))
        .catch(err => console.error(err));
    }
  }, [user]);

  const handlePay = async (billId, amount) => {
    try {
      await API.post('/resident/pay', {
        billId,
        amount,
        paymentMethod: 'CREDIT_CARD'
      });
      alert('Payment Successful!');
      window.location.reload();
    } catch (err) {
      alert('Payment failed');
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>
      {/* HEADER SECTION */}
      <header style={{ 
        display: 'flex', 
        justify: 'space-between', 
        alignItems: 'center', 
        borderBottom: '2px solid #333', 
        paddingBottom: '1rem', 
        marginBottom: '2rem' 
      }}>
        <div style={{ textAlign: 'left' }}>
          <h1 style={{ margin: 0, fontSize: '2rem', lineHeight: '1.2', color: '#646cff' }}>AquaTrack</h1>
          <span style={{ fontSize: '1rem', color: '#888' }}>Smart Water Usage & Billing Dashboard</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '0.95rem' }}>
            Welcome, <strong>{user.fullName}</strong> <span style={{ color: '#4caf50' }}>({user.role})</span>
          </p>
          <button 
            onClick={onLogout} 
            style={{ 
              padding: '6px 16px', 
              backgroundColor: '#dc3545', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* SUPER ADMIN VIEW */}
      {user.role === 'ROLE_SUPER_ADMIN' && (
        <section>
          <h2 style={{ marginBottom: '1rem' }}>System User Management</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#1a1a1a', borderBottom: '2px solid #444' }}>
                <th style={{ padding: '12px' }}>ID</th>
                <th style={{ padding: '12px' }}>Full Name</th>
                <th style={{ padding: '12px' }}>Email</th>
                <th style={{ padding: '12px' }}>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '12px' }}>{u.id}</td>
                  <td style={{ padding: '12px' }}>{u.fullName}</td>
                  <td style={{ padding: '12px' }}>{u.email}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      backgroundColor: u.role === 'SUPER_ADMIN' ? '#0d6efd' : '#198754',
                      fontSize: '0.85rem'
                    }}>
                      {u.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* RESIDENT VIEW */}
      {user.role === 'ROLE_RESIDENT' && (
        <section>
          <h2 style={{ marginBottom: '1rem' }}>My Water Bills</h2>
          {bills.length === 0 ? <p>No bills found for your account.</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#1a1a1a', borderBottom: '2px solid #444' }}>
                  <th style={{ padding: '12px' }}>Bill ID</th>
                  <th style={{ padding: '12px' }}>Building / Flat</th>
                  <th style={{ padding: '12px' }}>Billing Period</th>
                  <th style={{ padding: '12px' }}>Usage</th>
                  <th style={{ padding: '12px' }}>Amount</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {bills.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #333' }}>
                    <td style={{ padding: '12px' }}>#{b.id}</td>
                    <td style={{ padding: '12px' }}>{b.buildingName} - {b.flatNumber}</td>
                    <td style={{ padding: '12px' }}>{b.billingStartDate} to {b.billingEndDate}</td>
                    <td style={{ padding: '12px' }}>{b.totalLiters} L</td>
                    <td style={{ padding: '12px' }}>${b.totalAmount}</td>
                    <td style={{ padding: '12px' }}>
                      <strong style={{ color: b.status === 'PAID' ? '#198754' : '#ffc107' }}>
                        {b.status}
                      </strong>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {b.status === 'UNPAID' && (
                        <button 
                          onClick={() => handlePay(b.id, b.totalAmount)}
                          style={{ padding: '6px 12px', backgroundColor: '#198754', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Pay Now
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {/* BUILDING OWNER VIEW */}
      {user.role === 'ROLE_BUILDING_OWNER' && (
        <section>
          <h2>Building & Meter Management</h2>
          <p style={{ color: '#aaa' }}>Manage resident apartments, install water meters, record monthly usage readings, and auto-generate consumer bills.</p>
        </section>
      )}
    </div>
  );
}