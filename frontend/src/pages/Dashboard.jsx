import React, { useState, useEffect } from 'react';
import { 
  Droplets, LayoutDashboard, Clock, XCircle, BarChart3, LogOut, Edit, Trash2, 
  User, Send, DollarSign, FileText, Plus, Bell, CheckCircle, IndianRupee, Search, Truck, Settings
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

  // --- BUILDING OWNER STATE ---
  const [ownerFlats, setOwnerFlats] = useState([
    { id: 1, apartmentName: user?.apartmentName || 'Green Heights', blockNo: 'A', flatNo: '101', meterId: 'MTR-101', residentName: 'John Doe', residentEmail: 'resident101@aquatrack.com' },
    { id: 2, apartmentName: user?.apartmentName || 'Green Heights', blockNo: 'A', flatNo: '102', meterId: 'MTR-102', residentName: 'Priya Sharma', residentEmail: 'priya@gmail.com' }
  ]);
  const [flatForm, setFlatForm] = useState({ apartmentName: user?.apartmentName || '', blockNo: '', flatNo: '', meterId: '', residentName: '', residentEmail: '' });
  const [isEditingFlat, setIsEditingFlat] = useState(null);

  const [invitations, setInvitations] = useState([]);
  const [invitationForm, setInvitationForm] = useState({ blockNo: '', flatNo: '', residentEmail: '' });

  // Bill Generation State
  const [billForm, setBillForm] = useState({ meterId: 'MTR-101', prevReading: '12000', currReading: '14500', amountInRupees: '350' });
  const [issuedBills, setIssuedBills] = useState([
    { id: 101, blockNo: 'A', flatNo: '101', meterId: 'MTR-101', amountInRupees: 350, status: 'PENDING', date: '2026-07-31' },
    { id: 102, blockNo: 'A', flatNo: '102', meterId: 'MTR-102', amountInRupees: 420, status: 'PAID', date: '2026-07-28' }
  ]);

  // --- PHASE 1: BULK WATER PURCHASE STATE ---
  const [bulkPurchases, setBulkPurchases] = useState([]);
  const [bulkForm, setBulkForm] = useState({
    supplierType: 'TANKER',
    volumeLiters: '',
    unitCostPerLiter: ''
  });

  // --- PHASE 1: TIERED TARIFF TARIFF CONFIG STATE ---
  const [tariffConfig, setTariffConfig] = useState({
    baseVolumeKl: 10,
    baseRatePerKl: 15,
    tier2RatePerKl: 35
  });

  // --- FILTERS & USAGE REPORTS ---
  const [selectedYear, setSelectedYear] = useState('2026');
  const [searchFlatNo, setSearchFlatNo] = useState('');

  const role = user?.role || 'ROLE_SUPER_ADMIN';
  const apartmentName = user?.apartmentName || 'Green Heights';

  // --- FETCH DATA FROM POSTGRESQL ON LOAD ---
  useEffect(() => {
    fetchUsersData();
    if (role === 'ROLE_BUILDING_OWNER' || role === 'BUILDING_OWNER') {
      fetchBulkPurchases();
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
    } catch (err) {
      console.error("Error fetching live data from PostgreSQL:", err);
    }
  };

  const fetchBulkPurchases = async () => {
    try {
      const res = await API.get(`/billing/bulk-purchases/${apartmentName}`);
      setBulkPurchases(res.data || []);
    } catch (err) {
      console.error("Error fetching bulk purchases:", err);
    }
  };

  // --- SUPER ADMIN ACTIONS ---
  const handleApproveOwner = async (id) => {
    try {
      await API.put(`/admin/approve-owner/${id}`);
      alert("Building Owner Approved Successfully!");
      fetchUsersData();
    } catch (err) {
      setPendingOwners(pendingOwners.filter(o => o.id !== id));
      alert("Building Owner Approved!");
    }
  };

  const handleRejectOwner = async (id) => {
    try {
      await API.put(`/admin/reject-owner/${id}`);
      alert("Building Owner Application Rejected!");
      fetchUsersData();
    } catch (err) {
      setPendingOwners(pendingOwners.filter(o => o.id !== id));
      alert("Building Owner Application Rejected!");
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await API.delete(`/admin/users/${id}`);
        fetchUsersData();
      } catch (err) {
        setResidentsList(residentsList.filter(r => r.id !== id));
      }
    }
  };

  // --- BUILDING OWNER CRUD & ACTIONS ---
  const handleSaveFlat = (e) => {
    e.preventDefault();
    if (isEditingFlat) {
      setOwnerFlats(ownerFlats.map(f => f.id === isEditingFlat ? { ...flatForm, id: isEditingFlat } : f));
      setIsEditingFlat(null);
      alert("Flat details updated!");
    } else {
      setOwnerFlats([...ownerFlats, { ...flatForm, id: Date.now() }]);
      alert("New flat added!");
    }
    setFlatForm({ apartmentName: user?.apartmentName || '', blockNo: '', flatNo: '', meterId: '', residentName: '', residentEmail: '' });
  };

  const handleEditFlat = (flat) => {
    setFlatForm(flat);
    setIsEditingFlat(flat.id);
  };

  const handleDeleteFlat = (id) => {
    if (window.confirm("Delete this flat record?")) {
      setOwnerFlats(ownerFlats.filter(f => f.id !== id));
    }
  };

  const handleSendInvitation = (e) => {
    e.preventDefault();
    const code = `INV-${invitationForm.blockNo}${invitationForm.flatNo}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newInv = { ...invitationForm, code, status: 'SENT', createdAt: new Date().toLocaleDateString() };
    setInvitations([...invitations, newInv]);
    alert(`Invitation Link Generated! Share code: ${code}`);
    setInvitationForm({ blockNo: '', flatNo: '', residentEmail: '' });
  };

  // --- PHASE 1: BULK WATER PURCHASE SUBMIT ---
  const handleAddBulkPurchase = async (e) => {
    e.preventDefault();
    const payload = {
      apartmentName: apartmentName,
      supplierType: bulkForm.supplierType,
      volumeLiters: parseFloat(bulkForm.volumeLiters),
      unitCostPerLiter: parseFloat(bulkForm.unitCostPerLiter),
      totalCost: parseFloat(bulkForm.volumeLiters) * parseFloat(bulkForm.unitCostPerLiter)
    };

    try {
      await API.post('/billing/bulk-purchase', payload);
      alert('Bulk water purchase logged successfully!');
      setBulkForm({ supplierType: 'TANKER', volumeLiters: '', unitCostPerLiter: '' });
      fetchBulkPurchases();
    } catch (err) {
      alert('Failed to log bulk water purchase.');
    }
  };

  // --- PHASE 1: SAVE TARIFF CONFIG ---
  const handleSaveTariff = async (e) => {
    e.preventDefault();
    const payload = {
      apartmentName: apartmentName,
      baseVolumeKl: parseFloat(tariffConfig.baseVolumeKl),
      baseRatePerKl: parseFloat(tariffConfig.baseRatePerKl),
      tier2RatePerKl: parseFloat(tariffConfig.tier2RatePerKl)
    };

    try {
      await API.post('/billing/tariff-config', payload);
      alert('Tiered Tariff Configuration saved in PostgreSQL!');
    } catch (err) {
      alert('Failed to save tariff settings.');
    }
  };

  // --- PHASE 1: CALCULATE TIERED BILL ---
  const handleCalculateTieredBill = async (e) => {
    e.preventDefault();
    const consumptionLiters = (parseFloat(billForm.currReading) - parseFloat(billForm.prevReading));

    try {
      const res = await API.post(`/billing/calculate-tiered?apartmentName=${apartmentName}&consumptionLiters=${consumptionLiters}`);
      const data = res.data;
      setBillForm({ ...billForm, amountInRupees: data.totalAmountInRupees });
      alert(`Tiered calculation complete!\nBase Charge: ₹${data.baseCharge}\nTier-2 Excess Charge: ₹${data.tier2Charge}\nTotal Bill: ₹${data.totalAmountInRupees}`);
    } catch (err) {
      alert("Error calculating tiered tariff.");
    }
  };

  const handleGenerateBill = (e) => {
    e.preventDefault();
    const newBill = {
      id: Date.now(),
      meterId: billForm.meterId,
      prevReading: billForm.prevReading,
      currReading: billForm.currReading,
      amountInRupees: billForm.amountInRupees,
      status: 'PENDING',
      date: new Date().toLocaleDateString()
    };
    setIssuedBills([...issuedBills, newBill]);
    alert(`Bill of ₹${billForm.amountInRupees} generated for Meter ID: ${billForm.meterId}`);
    setBillForm({ meterId: '', prevReading: '', currReading: '', amountInRupees: '' });
  };

  const handlePayBill = (billId) => {
    setIssuedBills(issuedBills.map(b => b.id === billId ? { ...b, status: 'PAID' } : b));
    alert('Payment successful!');
  };

  // Sample Consumption Data
  const consumptionData = [
    { month: 'Jan', liters: 12000 },
    { month: 'Feb', liters: 14500 },
    { month: 'Mar', liters: 11000 },
    { month: 'Apr', liters: 16000 },
    { month: 'May', liters: 18500 },
    { month: 'Jun', liters: 15000 },
    { month: 'Jul', liters: 14500 }
  ];

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
            {/* SUPER ADMIN SIDEBAR */}
            {(role === 'ROLE_SUPER_ADMIN' || role === 'SUPER_ADMIN') && (
              <>
                <button onClick={() => setActiveTab('overview')} style={navBtnStyle(activeTab === 'overview')}>
                  <LayoutDashboard size={20} /> Inventory & Users
                </button>
                <button onClick={() => setActiveTab('pending')} style={navBtnStyle(activeTab === 'pending')}>
                  <Clock size={20} /> Pending Approvals ({pendingOwners.length})
                </button>
                <button onClick={() => setActiveTab('rejected')} style={navBtnStyle(activeTab === 'rejected')}>
                  <XCircle size={20} /> Rejected Owners
                </button>
                <button onClick={() => setActiveTab('waterAgg')} style={navBtnStyle(activeTab === 'waterAgg')}>
                  <BarChart3 size={20} /> Water Analytics
                </button>
              </>
            )}

            {/* BUILDING OWNER SIDEBAR */}
            {(role === 'ROLE_BUILDING_OWNER' || role === 'BUILDING_OWNER') && (
              <>
                <button onClick={() => setActiveTab('profile')} style={navBtnStyle(activeTab === 'profile')}>
                  <User size={20} /> Profile & Invitations
                </button>
                <button onClick={() => setActiveTab('flatDetails')} style={navBtnStyle(activeTab === 'flatDetails')}>
                  <LayoutDashboard size={20} /> Flat Management
                </button>
                <button onClick={() => setActiveTab('bulkPurchase')} style={navBtnStyle(activeTab === 'bulkPurchase')}>
                  <Truck size={20} /> Bulk Water Logistics
                </button>
                <button onClick={() => setActiveTab('tariffSettings')} style={navBtnStyle(activeTab === 'tariffSettings')}>
                  <Settings size={20} /> Tiered Tariff Config
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
                  <BarChart3 size={20} /> Consumption Graph
                </button>
                <button onClick={() => setActiveTab('myFlat')} style={navBtnStyle(activeTab === 'myFlat')}>
                  <LayoutDashboard size={20} /> Flat Details
                </button>
                <button onClick={() => setActiveTab('myPayment')} style={navBtnStyle(activeTab === 'myPayment')}>
                  <DollarSign size={20} /> Pending Bills
                </button>
              </>
            )}
          </nav>
        </div>

        <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600', backgroundColor: '#ef4444', color: '#ffffff' }}>
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* MAIN CONTENT PANEL */}
      <main style={{ width: '75%', height: '100%', backgroundColor: '#f8fafc', overflowY: 'auto', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
        
        {/* HEADER */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 2.5rem', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', fontWeight: '700', color: '#0f172a' }}>
            <Droplets size={24} color="#0284c7" />
            <span>AquaTrack Platform Console</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.9rem', color: '#475569', fontWeight: '600' }}>{user?.fullName || user?.email}</span>
            <span style={{ padding: '4px 12px', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700' }}>
              {role.replace('ROLE_', '')}
            </span>
          </div>
        </header>

        {/* BODY CONTENT */}
        <div style={{ padding: '2.5rem', flex: 1 }}>

          {/* ================= SUPER ADMIN VIEWS ================= */}
          {(role === 'ROLE_SUPER_ADMIN' || role === 'SUPER_ADMIN') && (
            <>
              {activeTab === 'overview' && (
                <section>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.5rem' }}>Registered Inventory & Users</h2>
                  <table style={tableStyle}>
                    <thead>
                      <tr style={thStyle}>
                        <th style={{ padding: '12px' }}>FULL NAME</th>
                        <th style={{ padding: '12px' }}>EMAIL ID</th>
                        <th style={{ padding: '12px' }}>APARTMENT</th>
                        <th style={{ padding: '12px' }}>BLOCK</th>
                        <th style={{ padding: '12px' }}>FLAT NO</th>
                        <th style={{ padding: '12px' }}>METER ID</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {residentsList.length === 0 ? (
                        <tr><td colSpan="7" style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>No registered records found in PostgreSQL.</td></tr>
                      ) : (
                        residentsList.map(r => (
                          <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px', fontWeight: '600' }}>{r.fullName}</td>
                            <td style={{ padding: '12px' }}>{r.email}</td>
                            <td style={{ padding: '12px' }}>{r.apartmentName || 'N/A'}</td>
                            <td style={{ padding: '12px' }}>{r.blockNo || 'N/A'}</td>
                            <td style={{ padding: '12px', fontWeight: '600' }}>{r.flatNo || 'N/A'}</td>
                            <td style={{ padding: '12px', color: '#0284c7', fontWeight: '600' }}>{r.meterId || 'N/A'}</td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <button onClick={() => handleDeleteUser(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={18} /></button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </section>
              )}

              {activeTab === 'pending' && (
                <section>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.5rem' }}>Pending Owner Applications</h2>
                  {pendingOwners.length === 0 ? <p style={{ color: '#64748b' }}>No building owners currently pending approval.</p> : (
                    <table style={tableStyle}>
                      <thead>
                        <tr style={thStyle}>
                          <th style={{ padding: '12px' }}>OWNER NAME</th>
                          <th style={{ padding: '12px' }}>EMAIL ID</th>
                          <th style={{ padding: '12px' }}>APARTMENT</th>
                          <th style={{ padding: '12px' }}>BLOCK NO</th>
                          <th style={{ padding: '12px' }}>FLAT NO</th>
                          <th style={{ padding: '12px' }}>METER ID</th>
                          <th style={{ padding: '12px', textAlign: 'center' }}>ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingOwners.map(o => (
                          <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px', fontWeight: '600' }}>{o.fullName}</td>
                            <td style={{ padding: '12px' }}>{o.email}</td>
                            <td style={{ padding: '12px' }}>{o.apartmentName}</td>
                            <td style={{ padding: '12px' }}>{o.blockNo}</td>
                            <td style={{ padding: '12px' }}>{o.flatNo}</td>
                            <td style={{ padding: '12px', color: '#0284c7' }}>{o.meterId}</td>
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
                          <th style={{ padding: '12px', textAlign: 'center' }}>ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rejectedOwners.map(r => (
                          <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px', fontWeight: '600' }}>{r.fullName}</td>
                            <td style={{ padding: '12px' }}>{r.email}</td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <button onClick={() => handleDeleteUser(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={18} /></button>
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
                    <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} style={selectStyle}>
                      <option value="2026">Year 2026</option>
                      <option value="2025">Year 2025</option>
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

          {/* ================= BUILDING OWNER VIEWS ================= */}
          {(role === 'ROLE_BUILDING_OWNER' || role === 'BUILDING_OWNER') && (
            <>
              {activeTab === 'profile' && (
                <section>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.5rem' }}>Building Owner Profile & Sent Invitations</h2>
                  <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '10px', marginBottom: '2rem' }}>
                    <p style={{ margin: '0 0 8px 0' }}><strong>Full Name:</strong> {user?.fullName || 'Property Owner'}</p>
                    <p style={{ margin: '0 0 8px 0' }}><strong>Email ID:</strong> {user?.email || 'owner@aquatrack.com'}</p>
                    <p style={{ margin: '0 0 8px 0' }}><strong>Apartment Name:</strong> {user?.apartmentName || 'Green Heights'}</p>
                    <p style={{ margin: '0' }}><strong>Block No:</strong> {user?.blockNo || 'A'} | <strong>Flat No:</strong> {user?.flatNo || '101'}</p>
                  </div>
                </section>
              )}

              {activeTab === 'flatDetails' && (
                <section>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.5rem' }}>Flat Management & CRUD</h2>
                  <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '10px', marginBottom: '2rem' }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>{isEditingFlat ? 'Edit Flat Details' : 'Add New Flat'}</h3>
                    <form onSubmit={handleSaveFlat} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                      <input type="text" placeholder="Block No (A)" required value={flatForm.blockNo} onChange={e => setFlatForm({ ...flatForm, blockNo: e.target.value })} style={inStyle} />
                      <input type="text" placeholder="Flat No (101)" required value={flatForm.flatNo} onChange={e => setFlatForm({ ...flatForm, flatNo: e.target.value })} style={inStyle} />
                      <input type="text" placeholder="Meter ID (MTR-101)" required value={flatForm.meterId} onChange={e => setFlatForm({ ...flatForm, meterId: e.target.value })} style={inStyle} />
                      <input type="text" placeholder="Resident Name" required value={flatForm.residentName} onChange={e => setFlatForm({ ...flatForm, residentName: e.target.value })} style={inStyle} />
                      <input type="email" placeholder="Resident Email" required value={flatForm.residentEmail} onChange={e => setFlatForm({ ...flatForm, residentEmail: e.target.value })} style={inStyle} />
                      <button type="submit" style={{ padding: '10px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
                        {isEditingFlat ? 'Update Flat' : 'Add Flat'}
                      </button>
                    </form>
                  </div>

                  <table style={tableStyle}>
                    <thead>
                      <tr style={thStyle}>
                        <th style={{ padding: '12px' }}>BLOCK</th>
                        <th style={{ padding: '12px' }}>FLAT NO</th>
                        <th style={{ padding: '12px' }}>METER ID</th>
                        <th style={{ padding: '12px' }}>RESIDENT NAME</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ownerFlats.map(f => (
                        <tr key={f.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px' }}>{f.blockNo}</td>
                          <td style={{ padding: '12px', fontWeight: '600' }}>{f.flatNo}</td>
                          <td style={{ padding: '12px', color: '#0284c7', fontWeight: '600' }}>{f.meterId}</td>
                          <td style={{ padding: '12px' }}>{f.residentName}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <button onClick={() => handleEditFlat(f)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0284c7', marginRight: '8px' }}><Edit size={18} /></button>
                            <button onClick={() => handleDeleteFlat(f.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={18} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              )}

              {/* PHASE 1: BULK WATER PURCHASES TAB */}
              {activeTab === 'bulkPurchase' && (
                <section>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.5rem' }}>Bulk Water Procurement Logistics</h2>
                  
                  <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '10px', marginBottom: '2rem', maxWidth: '600px' }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Log Water Delivery (Tanker / Municipal)</h3>
                    <form onSubmit={handleAddBulkPurchase}>
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={lblStyle}>SUPPLIER TYPE</label>
                        <select value={bulkForm.supplierType} onChange={e => setBulkForm({ ...bulkForm, supplierType: e.target.value })} style={inStyle}>
                          <option value="TANKER">Private Water Tanker Delivery</option>
                          <option value="MUNICIPAL">Municipal Corporation Supply</option>
                        </select>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div>
                          <label style={lblStyle}>VOLUME (LITERS)</label>
                          <input type="number" placeholder="10000" required value={bulkForm.volumeLiters} onChange={e => setBulkForm({ ...bulkForm, volumeLiters: e.target.value })} style={inStyle} />
                        </div>
                        <div>
                          <label style={lblStyle}>UNIT COST (PER LITER ₹)</label>
                          <input type="number" step="0.01" placeholder="0.25" required value={bulkForm.unitCostPerLiter} onChange={e => setBulkForm({ ...bulkForm, unitCostPerLiter: e.target.value })} style={inStyle} />
                        </div>
                      </div>

                      <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
                        Log Procurement Record
                      </button>
                    </form>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0f172a', marginBottom: '1rem' }}>Procurement History in PostgreSQL</h3>
                  <table style={tableStyle}>
                    <thead>
                      <tr style={thStyle}>
                        <th style={{ padding: '12px' }}>DATE</th>
                        <th style={{ padding: '12px' }}>SUPPLIER TYPE</th>
                        <th style={{ padding: '12px' }}>VOLUME (LITERS)</th>
                        <th style={{ padding: '12px' }}>UNIT COST (₹/L)</th>
                        <th style={{ padding: '12px' }}>TOTAL COST (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkPurchases.length === 0 ? (
                        <tr><td colSpan="5" style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>No bulk water deliveries logged yet.</td></tr>
                      ) : (
                        bulkPurchases.map(b => (
                          <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px' }}>{new Date(b.purchaseDate).toLocaleDateString()}</td>
                            <td style={{ padding: '12px', fontWeight: '600' }}>{b.supplierType}</td>
                            <td style={{ padding: '12px' }}>{b.volumeLiters} L</td>
                            <td style={{ padding: '12px' }}>₹{b.unitCostPerLiter}</td>
                            <td style={{ padding: '12px', fontWeight: '700', color: '#0284c7' }}>₹{b.totalCost}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </section>
              )}

              {/* PHASE 1: TIERED TARIFF CONFIG TAB */}
              {activeTab === 'tariffSettings' && (
                <section style={{ maxWidth: '520px' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.5rem' }}>Tiered Rate Configurator</h2>
                  <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '10px' }}>
                    <form onSubmit={handleSaveTariff}>
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={lblStyle}>BASE VOLUME TIER (kL / 1000 Liters)</label>
                        <input type="number" required value={tariffConfig.baseVolumeKl} onChange={e => setTariffConfig({ ...tariffConfig, baseVolumeKl: e.target.value })} style={inStyle} />
                      </div>

                      <div style={{ marginBottom: '1rem' }}>
                        <label style={lblStyle}>BASE TIER RATE (₹ PER kL)</label>
                        <input type="number" required value={tariffConfig.baseRatePerKl} onChange={e => setTariffConfig({ ...tariffConfig, baseRatePerKl: e.target.value })} style={inStyle} />
                      </div>

                      <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ ...lblStyle, color: '#ef4444' }}>TIER-2 RATE BEYOND BASE (₹ PER kL)</label>
                        <input type="number" required value={tariffConfig.tier2RatePerKl} onChange={e => setTariffConfig({ ...tariffConfig, tier2RatePerKl: e.target.value })} style={{ ...inStyle, borderColor: '#ef4444' }} />
                      </div>

                      <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
                        Save Tariff Policy
                      </button>
                    </form>
                  </div>
                </section>
              )}

              {activeTab === 'billGen' && (
                <section style={{ maxWidth: '520px' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.5rem' }}>Generate Resident Bill</h2>
                  <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '10px' }}>
                    <form onSubmit={handleGenerateBill}>
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={lblStyle}>METER ID</label>
                        <input type="text" placeholder="MTR-101" required value={billForm.meterId} onChange={e => setBillForm({ ...billForm, meterId: e.target.value })} style={inStyle} />
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                          <label style={lblStyle}>PREVIOUS READING (LITERS)</label>
                          <input type="number" placeholder="12000" required value={billForm.prevReading} onChange={e => setBillForm({ ...billForm, prevReading: e.target.value })} style={inStyle} />
                        </div>
                        <div>
                          <label style={lblStyle}>CURRENT READING (LITERS)</label>
                          <input type="number" placeholder="14500" required value={billForm.currReading} onChange={e => setBillForm({ ...billForm, currReading: e.target.value })} style={inStyle} />
                        </div>
                      </div>

                      <button type="button" onClick={handleCalculateTieredBill} style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', color: '#38bdf8', border: '1px solid #38bdf8', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', marginBottom: '1rem' }}>
                        ⚡ Auto-Calculate Tiered Amount
                      </button>

                      <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ ...lblStyle, color: '#0284c7' }}>AMOUNT IN RUPEES (₹)</label>
                        <input type="number" placeholder="₹ 350" required value={billForm.amountInRupees} onChange={e => setBillForm({ ...billForm, amountInRupees: e.target.value })} style={{ ...inStyle, borderColor: '#0284c7', fontWeight: '700' }} />
                      </div>

                      <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Generate & Issue Bill</button>
                    </form>
                  </div>
                </section>
              )}

              {activeTab === 'payStatus' && (
                <section>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.5rem' }}>Resident Payment Status Tracking</h2>
                  <table style={tableStyle}>
                    <thead>
                      <tr style={thStyle}>
                        <th style={{ padding: '12px' }}>FLAT NO</th>
                        <th style={{ padding: '12px' }}>METER ID</th>
                        <th style={{ padding: '12px' }}>AMOUNT (₹)</th>
                        <th style={{ padding: '12px' }}>DATE</th>
                        <th style={{ padding: '12px' }}>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {issuedBills.map(b => (
                        <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px', fontWeight: '600' }}>{b.flatNo || '101'}</td>
                          <td style={{ padding: '12px', color: '#0284c7' }}>{b.meterId}</td>
                          <td style={{ padding: '12px', fontWeight: '700' }}>₹{b.amountInRupees}</td>
                          <td style={{ padding: '12px' }}>{b.date}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ padding: '4px 10px', backgroundColor: b.status === 'PAID' ? '#dcfce7' : '#fef3c7', color: b.status === 'PAID' ? '#15803d' : '#b45309', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700' }}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              )}

              {activeTab === 'reports' && (
                <section>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>Water Usage Search Report</h2>
                    <input type="text" placeholder="Filter by Flat No (e.g. 101)" value={searchFlatNo} onChange={e => setSearchFlatNo(e.target.value)} style={{ ...inStyle, width: '220px' }} />
                  </div>
                  <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '10px' }}>
                    <ResponsiveContainer width="100%" height={320}>
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
                      <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Generate & Send Code</button>
                    </form>
                  </div>
                </section>
              )}
            </>
          )}

          {/* ================= RESIDENT VIEWS ================= */}
          {(role === 'ROLE_RESIDENT' || role === 'RESIDENT') && (
            <>
              {activeTab === 'overview' && (
                <section>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>My Water Usage Bar Graph</h2>
                    <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} style={selectStyle}>
                      <option value="2026">Year 2026</option>
                      <option value="2025">Year 2025</option>
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

              {activeTab === 'myFlat' && (
                <section style={{ maxWidth: '500px' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.5rem' }}>Resident Flat Credentials</h2>
                  <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <p style={{ fontSize: '1.1rem', margin: '0 0 12px 0' }}><strong>Apartment Name:</strong> {user?.apartmentName || 'Skyline Towers'}</p>
                    <p style={{ fontSize: '1.1rem', margin: '0 0 12px 0' }}><strong>Block No:</strong> {user?.blockNo || 'A'}</p>
                    <p style={{ fontSize: '1.1rem', margin: '0 0 12px 0' }}><strong>Flat No:</strong> {user?.flatNo || '101'}</p>
                    <p style={{ fontSize: '1.1rem', margin: '0', color: '#0284c7', fontWeight: '700' }}><strong>Meter ID:</strong> {user?.meterId || 'MTR-101'}</p>
                  </div>
                </section>
              )}

              {activeTab === 'myPayment' && (
                <section>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.5rem' }}>My Pending Bills</h2>
                  <table style={tableStyle}>
                    <thead>
                      <tr style={thStyle}>
                        <th style={{ padding: '12px' }}>METER ID</th>
                        <th style={{ padding: '12px' }}>AMOUNT (₹)</th>
                        <th style={{ padding: '12px' }}>DATE</th>
                        <th style={{ padding: '12px' }}>STATUS</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {issuedBills.map(b => (
                        <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px', color: '#0284c7', fontWeight: '600' }}>{b.meterId}</td>
                          <td style={{ padding: '12px', fontWeight: '700' }}>₹{b.amountInRupees}</td>
                          <td style={{ padding: '12px' }}>{b.date}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ padding: '4px 10px', backgroundColor: b.status === 'PAID' ? '#dcfce7' : '#fef3c7', color: b.status === 'PAID' ? '#15803d' : '#b45309', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700' }}>
                              {b.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            {b.status === 'PENDING' ? (
                              <button onClick={() => handlePayBill(b.id)} style={{ padding: '6px 14px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Pay Now</button>
                            ) : (
                              <span style={{ color: '#22c55e', fontWeight: '600' }}>Paid</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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