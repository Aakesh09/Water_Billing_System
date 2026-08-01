import React, { useState, useEffect } from 'react';
import { 
  Droplets, LayoutDashboard, Clock, XCircle, BarChart3, LogOut, Edit, Trash2, 
  User, Send, DollarSign, FileText, Plus, Bell, CheckCircle, RefreshCw
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import API from '../services/api';

export default function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');

  // --- STATE FOR SUPER ADMIN ---
  const [residentsList, setResidentsList] = useState([
    { id: 1, blockNo: 'A', flatNo: '101', meterId: 'MTR-101', email: 'resident101@aquatrack.com', name: 'John Doe', apartmentName: 'Green Heights' },
    { id: 2, blockNo: 'B', flatNo: '202', meterId: 'MTR-202', email: 'resident202@aquatrack.com', name: 'Priya Sharma', apartmentName: 'Green Heights' }
  ]);
  const [pendingOwners, setPendingOwners] = useState([
    { id: 10, name: 'Ramesh Patel', email: 'ramesh@building.com', apartmentName: 'Skyline Towers', blockNo: 'C', flatNo: '301', meterId: 'MTR-C301' }
  ]);
  const [rejectedOwners, setRejectedOwners] = useState([]);

  // --- STATE FOR BUILDING OWNER ---
  const [ownerFlats, setOwnerFlats] = useState([
    { id: 1, apartmentName: 'Green Heights', blockNo: 'A', flatNo: '101', meterId: 'MTR-101', residentName: 'John Doe', residentEmail: 'resident101@aquatrack.com' }
  ]);
  const [generateBillForm, setGenerateBillForm] = useState({ meterId: 'MTR-101', prevReading: 12000, currReading: 14500, ratePerLiter: 0.05 });
  const [invitations, setInvitations] = useState([]);
  const [invitationForm, setInvitationForm] = useState({ blockNo: '', flatNo: '', residentEmail: '' });
  const [issuedBills, setIssuedBills] = useState([
    { id: 101, blockNo: 'A', flatNo: '101', meterId: 'MTR-101', amount: 125, status: 'PENDING', month: 'July 2026' }
  ]);

  // --- STATE FOR FILTERS ---
  const [selectedMonth, setSelectedMonth] = useState('July');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [filterFlatNo, setFilterFlatNo] = useState('');

  // Sample Consumption Data
  const consumptionData = [
    { month: 'Jan', liters: 12000 },
    { month: 'Feb', liters: 14500 },
    { month: 'Mar', liters: 11000 },
    { month: 'Apr', liters: 16000 },
    { month: 'May', liters: 18500 },
    { month: 'Jun', liters: 15000 },
    { month: 'Jul', liters: 14500 },
  ];

  const role = user?.role || 'ROLE_SUPER_ADMIN';

  // --- HANDLERS (SUPER ADMIN) ---
  const handleApproveOwner = (id) => {
    const approved = pendingOwners.find(o => o.id === id);
    setPendingOwners(pendingOwners.filter(o => o.id !== id));
    alert(`Approved ${approved?.name}! Account is now active.`);
  };

  const handleRejectOwner = (id) => {
    const rejected = pendingOwners.find(o => o.id === id);
    setPendingOwners(pendingOwners.filter(o => o.id !== id));
    if (rejected) {
      setRejectedOwners([...rejectedOwners, { ...rejected, reason: 'Rejected by Super Admin' }]);
    }
  };

  const handleDeleteRecord = (id, listType) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      if (listType === 'residents') setResidentsList(residentsList.filter(r => r.id !== id));
      if (listType === 'rejected') setRejectedOwners(rejectedOwners.filter(r => r.id !== id));
      if (listType === 'ownerFlats') setOwnerFlats(ownerFlats.filter(f => f.id !== id));
    }
  };

  // --- HANDLERS (BUILDING OWNER) ---
  const handleSendInvitation = (e) => {
    e.preventDefault();
    const code = `INV-${invitationForm.blockNo}${invitationForm.flatNo}-${Math.floor(1000 + Math.random() * 9000)}`;
    setInvitations([...invitations, { ...invitationForm, code }]);
    alert(`Invitation Generated! Share this code with resident: ${code}`);
    setInvitationForm({ blockNo: '', flatNo: '', residentEmail: '' });
  };

  const handlePayBill = (billId) => {
    setIssuedBills(issuedBills.map(b => b.id === billId ? { ...b, status: 'PAID' } : b));
    alert('Payment successful!');
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      
      {/* LEFT SIDEBAR (30% WIDTH) */}
      <aside style={{ width: '25%', height: '100%', backgroundColor: '#0f172a', color: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '2rem 1.5rem', boxSizing: 'border-box' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.4rem', fontWeight: '700', color: '#38bdf8', marginBottom: '2.5rem' }}>
            <Droplets size={28} />
            <span>AquaTrack</span>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            
            {/* SUPER ADMIN SIDEBAR */}
            {(role === 'ROLE_SUPER_ADMIN' || role === 'SUPER_ADMIN') && (
              <>
                <button onClick={() => setActiveTab('overview')} style={navBtnStyle(activeTab === 'overview')}>
                  <LayoutDashboard size={20} /> Dashboard
                </button>
                <button onClick={() => setActiveTab('pending')} style={navBtnStyle(activeTab === 'pending')}>
                  <Clock size={20} /> Pending Approvals
                </button>
                <button onClick={() => setActiveTab('rejected')} style={navBtnStyle(activeTab === 'rejected')}>
                  <XCircle size={20} /> Rejected Owners
                </button>
                <button onClick={() => setActiveTab('waterAgg')} style={navBtnStyle(activeTab === 'waterAgg')}>
                  <BarChart3 size={20} /> Water Consumption
                </button>
              </>
            )}

            {/* BUILDING OWNER SIDEBAR */}
            {(role === 'ROLE_BUILDING_OWNER' || role === 'BUILDING_OWNER') && (
              <>
                <button onClick={() => setActiveTab('profile')} style={navBtnStyle(activeTab === 'profile')}>
                  <User size={20} /> Profile
                </button>
                <button onClick={() => setActiveTab('flatDetails')} style={navBtnStyle(activeTab === 'flatDetails')}>
                  <LayoutDashboard size={20} /> Flat Details
                </button>
                <button onClick={() => setActiveTab('billGen')} style={navBtnStyle(activeTab === 'billGen')}>
                  <FileText size={20} /> Bill Generation
                </button>
                <button onClick={() => setActiveTab('payStatus')} style={navBtnStyle(activeTab === 'payStatus')}>
                  <DollarSign size={20} /> Payment Status
                </button>
                <button onClick={() => setActiveTab('reports')} style={navBtnStyle(activeTab === 'reports')}>
                  <BarChart3 size={20} /> Usage Report
                </button>
                <button onClick={() => setActiveTab('invitation')} style={navBtnStyle(activeTab === 'invitation')}>
                  <Send size={20} /> Send Invitation
                </button>
              </>
            )}

            {/* RESIDENT SIDEBAR */}
            {(role === 'ROLE_RESIDENT' || role === 'RESIDENT') && (
              <>
                <button onClick={() => setActiveTab('overview')} style={navBtnStyle(activeTab === 'overview')}>
                  <BarChart3 size={20} /> Overview Graph
                </button>
                <button onClick={() => setActiveTab('myFlat')} style={navBtnStyle(activeTab === 'myFlat')}>
                  <LayoutDashboard size={20} /> My Flat Details
                </button>
                <button onClick={() => setActiveTab('myPayment')} style={navBtnStyle(activeTab === 'myPayment')}>
                  <DollarSign size={20} /> Pending Bills
                </button>
                <button onClick={() => setActiveTab('payHistory')} style={navBtnStyle(activeTab === 'payHistory')}>
                  <Clock size={20} /> Payment History
                </button>
              </>
            )}

          </nav>
        </div>

        <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600', backgroundColor: '#ef4444', color: '#ffffff' }}>
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* RIGHT CONTENT PANEL (75% WIDTH) */}
      <main style={{ width: '75%', height: '100%', backgroundColor: '#f8fafc', overflowY: 'auto', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
        
        {/* TOP HEADER */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 2.5rem', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', fontWeight: '700', color: '#0f172a' }}>
            <Droplets size={24} color="#0284c7" />
            <span>AquaTrack Platform Console</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.9rem', color: '#475569', fontWeight: '500' }}>{user?.fullName || user?.email || 'User'}</span>
            <span style={{ padding: '4px 12px', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700' }}>
              {role.replace('ROLE_', '')}
            </span>
          </div>
        </header>

        {/* BODY CONTENT */}
        <div style={{ padding: '2.5rem', flex: 1 }}>

          {/* ==================== SUPER ADMIN VIEWS ==================== */}
          {(role === 'ROLE_SUPER_ADMIN' || role === 'SUPER_ADMIN') && (
            <>
              {activeTab === 'overview' && (
                <section>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.5rem' }}>Flat & Meter Inventory</h2>
                  <table style={tableStyle}>
                    <thead>
                      <tr style={thStyle}>
                        <th style={{ padding: '12px' }}>BLOCK NO</th>
                        <th style={{ padding: '12px' }}>FLAT NO</th>
                        <th style={{ padding: '12px' }}>METER ID</th>
                        <th style={{ padding: '12px' }}>NAME</th>
                        <th style={{ padding: '12px' }}>EMAIL ID</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {residentsList.map(r => (
                        <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px' }}>{r.blockNo}</td>
                          <td style={{ padding: '12px', fontWeight: '600' }}>{r.flatNo}</td>
                          <td style={{ padding: '12px', color: '#0284c7', fontWeight: '600' }}>{r.meterId}</td>
                          <td style={{ padding: '12px' }}>{r.name}</td>
                          <td style={{ padding: '12px' }}>{r.email}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0284c7', marginRight: '8px' }}><Edit size={18} /></button>
                            <button onClick={() => handleDeleteRecord(r.id, 'residents')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={18} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              )}

              {activeTab === 'pending' && (
                <section>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.5rem' }}>Pending Owner Applications</h2>
                  {pendingOwners.length === 0 ? <p style={{ color: '#64748b' }}>No pending applications found.</p> : (
                    <table style={tableStyle}>
                      <thead>
                        <tr style={thStyle}>
                          <th style={{ padding: '12px' }}>OWNER NAME</th>
                          <th style={{ padding: '12px' }}>EMAIL ID</th>
                          <th style={{ padding: '12px' }}>APARTMENT</th>
                          <th style={{ padding: '12px' }}>BLOCK</th>
                          <th style={{ padding: '12px', textAlign: 'center' }}>ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingOwners.map(o => (
                          <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px', fontWeight: '600' }}>{o.name}</td>
                            <td style={{ padding: '12px' }}>{o.email}</td>
                            <td style={{ padding: '12px' }}>{o.apartmentName}</td>
                            <td style={{ padding: '12px' }}>{o.blockNo}</td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <button onClick={() => handleApproveOwner(o.id)} style={{ padding: '6px 14px', backgroundColor: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', marginRight: '8px' }}>Approve</button>
                              <button onClick={() => handleRejectOwner(o.id)} style={{ padding: '6px 14px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Reject</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </section>
              )}

              {activeTab === 'rejected' && (
                <section>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.5rem' }}>Rejected Applications</h2>
                  {rejectedOwners.length === 0 ? <p style={{ color: '#64748b' }}>No rejected applications.</p> : (
                    <table style={tableStyle}>
                      <thead>
                        <tr style={thStyle}>
                          <th style={{ padding: '12px' }}>NAME</th>
                          <th style={{ padding: '12px' }}>EMAIL ID</th>
                          <th style={{ padding: '12px' }}>REASON</th>
                          <th style={{ padding: '12px', textAlign: 'center' }}>ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rejectedOwners.map(r => (
                          <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px', fontWeight: '600' }}>{r.name}</td>
                            <td style={{ padding: '12px' }}>{r.email}</td>
                            <td style={{ padding: '12px', color: '#ef4444' }}>{r.reason}</td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <button onClick={() => handleDeleteRecord(r.id, 'rejected')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={18} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </section>
              )}

              {activeTab === 'waterAgg' && (
                <section>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>Water Consumption Analytics</h2>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} style={selectStyle}>
                        <option value="January">January</option><option value="February">February</option><option value="March">March</option>
                        <option value="April">April</option><option value="May">May</option><option value="June">June</option><option value="July">July</option>
                      </select>
                      <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} style={selectStyle}>
                        <option value="2026">2026</option><option value="2025">2025</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '10px' }}>
                    <ResponsiveContainer width="100%" height={340}>
                      <BarChart data={consumptionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px' }} />
                        <Bar dataKey="liters" fill="#0284c7" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              )}
            </>
          )}

          {/* ==================== BUILDING OWNER VIEWS ==================== */}
          {(role === 'ROLE_BUILDING_OWNER' || role === 'BUILDING_OWNER') && (
            <>
              {activeTab === 'profile' && (
                <section>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.5rem' }}>Building Owner Profile</h2>
                  <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '10px', marginBottom: '2rem' }}>
                    <p><strong>Owner Name:</strong> {user?.fullName || 'Property Owner'}</p>
                    <p><strong>Email ID:</strong> {user?.email || 'owner@aquatrack.com'}</p>
                  </div>

                  <h3>Assigned Meter & Resident Details</h3>
                  <table style={tableStyle}>
                    <thead>
                      <tr style={thStyle}>
                        <th style={{ padding: '12px' }}>FLAT NO</th>
                        <th style={{ padding: '12px' }}>METER ID</th>
                        <th style={{ padding: '12px' }}>RESIDENT NAME</th>
                        <th style={{ padding: '12px' }}>RESIDENT EMAIL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ownerFlats.map(f => (
                        <tr key={f.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px', fontWeight: '600' }}>{f.flatNo}</td>
                          <td style={{ padding: '12px', color: '#0284c7' }}>{f.meterId}</td>
                          <td style={{ padding: '12px' }}>{f.residentName}</td>
                          <td style={{ padding: '12px' }}>{f.residentEmail}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              )}

              {activeTab === 'invitation' && (
                <section style={{ maxWidth: '480px' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.5rem' }}>Send Resident Invitation</h2>
                  <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '10px' }}>
                    <form onSubmit={handleSendInvitation}>
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={lblStyle}>BLOCK NO</label>
                        <input type="text" placeholder="A" required value={invitationForm.blockNo} onChange={e => setInvitationForm({ ...invitationForm, blockNo: e.target.value })} style={inStyle} />
                      </div>
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={lblStyle}>FLAT NO</label>
                        <input type="text" placeholder="101" required value={invitationForm.flatNo} onChange={e => setInvitationForm({ ...invitationForm, flatNo: e.target.value })} style={inStyle} />
                      </div>
                      <div style={{ marginBottom: '1.5rem' }}>
                        <label style={lblStyle}>RESIDENT EMAIL ID</label>
                        <input type="email" placeholder="resident@example.com" required value={invitationForm.residentEmail} onChange={e => setInvitationForm({ ...invitationForm, residentEmail: e.target.value })} style={inStyle} />
                      </div>
                      <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Generate & Send Invitation</button>
                    </form>
                  </div>
                </section>
              )}
            </>
          )}

          {/* ==================== RESIDENT VIEWS ==================== */}
          {(role === 'ROLE_RESIDENT' || role === 'RESIDENT') && (
            <>
              {activeTab === 'overview' && (
                <section>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>Monthly Water Usage Bar Graph</h2>
                    <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} style={selectStyle}>
                      <option value="2026">2026</option>
                      <option value="2025">2025</option>
                    </select>
                  </div>
                  <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '10px' }}>
                    <ResponsiveContainer width="100%" height={340}>
                      <BarChart data={consumptionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px' }} />
                        <Bar dataKey="liters" fill="#0284c7" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              )}
            </>
          )}

        </div>
      </main>
    </div>
  );
}

const navBtnStyle = (active) => ({
  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600', width: '100%', textAlign: 'left', backgroundColor: active ? '#0284c7' : 'transparent', color: active ? '#ffffff' : '#94a3b8'
});
const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden' };
const thStyle = { backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.85rem', borderBottom: '1px solid #e2e8f0' };
const lblStyle = { display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '4px' };
const inStyle = { width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' };
const selectStyle = { padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' };