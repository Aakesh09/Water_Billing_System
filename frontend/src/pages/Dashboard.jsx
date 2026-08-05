import React, { useState, useEffect } from 'react';
import { 
  Droplets, LayoutDashboard, Clock, XCircle, BarChart3, LogOut, Edit, Trash2, 
  User, Send, DollarSign, FileText, Truck, Settings, Calendar, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import API from '../services/api';

export default function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');

  // --- SUPER ADMIN STATE ---
  const [residentsList, setResidentsList] = useState([]);
  const [pendingOwners, setPendingOwners] = useState([]);
  const [rejectedOwners, setRejectedOwners] = useState([]);

  // --- BUILDING OWNER & RESIDENT STATE ---
  const [billingCycles, setBillingCycles] = useState([]);
  const [newCycleName, setNewCycleName] = useState('');
  const [selectedCycleInvoices, setSelectedCycleInvoices] = useState([]);

  // --- PHASE 3: ALERTS & LEAK DETECTION STATE ---
  const [alertsList, setAlertsList] = useState([]);
  const [dailyLogForm, setDailyLogForm] = useState({ meterId: 'MTR-101', flatNo: '101', volumeLiters: '' });

  const role = user?.role || 'ROLE_SUPER_ADMIN';
  const apartmentName = user?.apartmentName || 'Green Heights';

  useEffect(() => {
    fetchUsersData();
    fetchAlerts();
    if (role === 'ROLE_BUILDING_OWNER' || role === 'BUILDING_OWNER') {
      fetchBillingCycles();
    }
  }, []);

  const fetchUsersData = async () => {
    try {
      if (role === 'ROLE_SUPER_ADMIN' || role === 'SUPER_ADMIN') {
        const res = await API.get('/admin/users');
        const allUsers = res.data || [];
        setResidentsList(allUsers.filter(u => u.role === 'RESIDENT' || u.role === 'ROLE_RESIDENT'));
        setPendingOwners(allUsers.filter(u => (u.role === 'BUILDING_OWNER' || u.role === 'ROLE_BUILDING_OWNER') && u.approvalStatus === 'PENDING'));
        setRejectedOwners(allUsers.filter(u => (u.role === 'BUILDING_OWNER' || u.role === 'ROLE_BUILDING_OWNER') && u.approvalStatus === 'REJECTED'));
      }
    } catch (err) {}
  };

  const fetchBillingCycles = async () => {
    try {
      const res = await API.get(`/cycles/${apartmentName}`);
      setBillingCycles(res.data || []);
    } catch (err) {}
  };

  const fetchAlerts = async () => {
    try {
      const endpoint = (role === 'ROLE_BUILDING_OWNER' || role === 'BUILDING_OWNER') 
        ? `/alerts/apartment/${apartmentName}` 
        : `/alerts/flat/${apartmentName}/${user?.flatNo || '101'}`;
      const res = await API.get(endpoint);
      setAlertsList(res.data || []);
    } catch (err) {}
  };

  // --- PHASE 3 ACTIONS ---
  const handleLogUsageAndCheckLeak = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/alerts/log-usage', {
        apartmentName: apartmentName,
        flatNo: dailyLogForm.flatNo,
        meterId: dailyLogForm.meterId,
        volumeLiters: parseFloat(dailyLogForm.volumeLiters)
      });

      if (res.data?.alertType === 'LEAK_DETECTED') {
        alert(`🚨 ALERT TRIGGERED (> 2σ Outlier): ${res.data.message}`);
      } else {
        alert("Daily meter reading recorded. Usage is within normal standard deviation limits.");
      }
      setDailyLogForm({ ...dailyLogForm, volumeLiters: '' });
      fetchAlerts();
    } catch (err) {
      alert("Failed to log daily meter reading.");
    }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      await API.put(`/alerts/resolve/${alertId}`);
      alert("Alert marked as resolved.");
      fetchAlerts();
    } catch (err) {
      alert("Failed to resolve alert.");
    }
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      
      {/* SIDEBAR */}
      <aside style={{ width: '25%', height: '100%', backgroundColor: '#0f172a', color: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '2rem 1.5rem', boxSizing: 'border-box' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.4rem', fontWeight: '700', color: '#38bdf8', marginBottom: '2.5rem' }}>
            <Droplets size={28} />
            <span>AquaTrack</span>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {(role === 'ROLE_SUPER_ADMIN' || role === 'SUPER_ADMIN') && (
              <>
                <button onClick={() => setActiveTab('overview')} style={navBtnStyle(activeTab === 'overview')}><LayoutDashboard size={20} /> Inventory & Users</button>
                <button onClick={() => setActiveTab('pending')} style={navBtnStyle(activeTab === 'pending')}><Clock size={20} /> Pending Approvals ({pendingOwners.length})</button>
              </>
            )}

            {(role === 'ROLE_BUILDING_OWNER' || role === 'BUILDING_OWNER') && (
              <>
                <button onClick={() => setActiveTab('profile')} style={navBtnStyle(activeTab === 'profile')}><User size={20} /> Profile & Invitations</button>
                <button onClick={() => setActiveTab('cycleMgmt')} style={navBtnStyle(activeTab === 'cycleMgmt')}><Calendar size={20} /> Billing Cycle Management</button>
                <button onClick={() => setActiveTab('leakAlerts')} style={navBtnStyle(activeTab === 'leakAlerts')}><AlertTriangle size={20} /> Leak Detection Alerts ({alertsList.filter(a => !a.isResolved).length})</button>
              </>
            )}

            {(role === 'ROLE_RESIDENT' || role === 'RESIDENT') && (
              <>
                <button onClick={() => setActiveTab('overview')} style={navBtnStyle(activeTab === 'overview')}><BarChart3 size={20} /> Consumption Graph</button>
                <button onClick={() => setActiveTab('myFlat')} style={navBtnStyle(activeTab === 'myFlat')}><LayoutDashboard size={20} /> Flat Credentials</button>
                <button onClick={() => setActiveTab('leakAlerts')} style={navBtnStyle(activeTab === 'leakAlerts')}><AlertTriangle size={20} /> Leak Alerts ({alertsList.filter(a => !a.isResolved).length})</button>
              </>
            )}
          </nav>
        </div>

        <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600', backgroundColor: '#ef4444', color: '#ffffff' }}>
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ width: '75%', height: '100%', backgroundColor: '#f8fafc', overflowY: 'auto', padding: '2.5rem', boxSizing: 'border-box' }}>
        
        {/* PHASE 3: LEAK DETECTION & ALERTS TAB */}
        {activeTab === 'leakAlerts' && (
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.5rem' }}>Statistical Leak & Anomaly Detection (> 2σ Outlier Engine)</h2>

            {/* Test Simulation Form */}
            {(role === 'ROLE_BUILDING_OWNER' || role === 'BUILDING_OWNER') && (
              <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '10px', marginBottom: '2rem', maxWidth: '550px' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Simulate Meter Reading & Test Leak Trigger</h3>
                <form onSubmit={handleLogUsageAndCheckLeak} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <input type="text" placeholder="Meter ID (MTR-101)" required value={dailyLogForm.meterId} onChange={e => setDailyLogForm({ ...dailyLogForm, meterId: e.target.value })} style={inStyle} />
                  <input type="text" placeholder="Flat No (101)" required value={dailyLogForm.flatNo} onChange={e => setDailyLogForm({ ...dailyLogForm, flatNo: e.target.value })} style={inStyle} />
                  <input type="number" placeholder="Volume Liters (e.g. 8500 L)" required value={dailyLogForm.volumeLiters} onChange={e => setDailyLogForm({ ...dailyLogForm, volumeLiters: e.target.value })} style={{ ...inStyle, gridColumn: 'span 2' }} />
                  <button type="submit" style={{ gridColumn: 'span 2', padding: '10px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
                    Record Reading & Analyze Anomaly
                  </button>
                </form>
              </div>
            )}

            {/* Alerts Table */}
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0f172a', marginBottom: '1rem' }}>Triggered System Warning Alerts</h3>
            <table style={tableStyle}>
              <thead>
                <tr style={thStyle}>
                  <th style={{ padding: '12px' }}>FLAT NO</th>
                  <th style={{ padding: '12px' }}>METER ID</th>
                  <th style={{ padding: '12px' }}>ALERT MESSAGE</th>
                  <th style={{ padding: '12px' }}>STATUS</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {alertsList.length === 0 ? (
                  <tr><td colSpan="5" style={{ padding: '16px', textAlign: 'center', color: '#22c55e', fontWeight: '600' }}>✓ No active leak warnings detected. All meters operating within standard deviation limits.</td></tr>
                ) : (
                  alertsList.map(a => (
                    <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: a.isResolved ? '#ffffff' : '#fef2f2' }}>
                      <td style={{ padding: '12px', fontWeight: '700' }}>{a.flatNo}</td>
                      <td style={{ padding: '12px', color: '#0284c7' }}>{a.meterId}</td>
                      <td style={{ padding: '12px', color: a.isResolved ? '#475569' : '#dc2626', fontWeight: '600' }}>{a.message}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '4px 10px', backgroundColor: a.isResolved ? '#dcfce7' : '#fee2e2', color: a.isResolved ? '#15803d' : '#991b1b', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700' }}>
                          {a.isResolved ? 'RESOLVED' : 'ACTIVE LEAK'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {!a.isResolved ? (
                          <button onClick={() => handleResolveAlert(a.id)} style={{ padding: '6px 12px', backgroundColor: '#15803d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>Resolve Alert</button>
                        ) : (
                          <span style={{ color: '#15803d', fontWeight: '600' }}>Cleared</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        )}

      </main>
    </div>
  );
}

const navBtnStyle = (active) => ({
  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600', width: '100%', textAlign: 'left', backgroundColor: active ? '#0284c7' : 'transparent', color: active ? '#ffffff' : '#94a3b8'
});
const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden' };
const thStyle = { backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.85rem', borderBottom: '1px solid #e2e8f0' };
const inStyle = { width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' };