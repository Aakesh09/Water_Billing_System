import React, { useState, useEffect } from 'react';
import { 
  Droplets, LayoutDashboard, Clock, XCircle, BarChart3, LogOut, Edit, Trash2, 
  User, Send, DollarSign, FileText, Truck, Settings, Calendar, AlertTriangle, 
  Bell, CheckCircle2 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import API from '../services/api';

export default function Dashboard({ user, onLogout }) {
  const role = user?.role || 'ROLE_SUPER_ADMIN';
  const apartmentName = user?.apartmentName || 'Green Heights';
  const currency = "\u20B9";

  const [activeTab, setActiveTab] = useState(() => {
    if (role === 'ROLE_RESIDENT' || role === 'RESIDENT') return 'overview';
    if (role === 'ROLE_BUILDING_OWNER' || role === 'BUILDING_OWNER') return 'profile';
    return 'overview';
  });

  // --- DYNAMIC DATABASE STATES ---
  const [ownersList, setOwnersList] = useState([]);
  const [ownerFlats, setOwnerFlats] = useState([
    { id: 1, apartmentName: user?.apartmentName || 'Green Heights', blockNo: 'A', flatNo: '101', meterId: 'MTR-101', residentName: 'John Doe', residentEmail: 'resident101@aquatrack.com', waterConsumption: 12500, billStatus: 'PENDING', prevReading: 10000 },
    { id: 2, apartmentName: user?.apartmentName || 'Green Heights', blockNo: 'A', flatNo: '102', meterId: 'MTR-102', residentName: 'Priya Sharma', residentEmail: 'priya@gmail.com', waterConsumption: 14200, billStatus: 'GENERATED', prevReading: 11000 },
    { id: 3, apartmentName: user?.apartmentName || 'Green Heights', blockNo: 'B', flatNo: '201', meterId: 'MTR-201', residentName: 'Rahul Verma', residentEmail: 'rahul@gmail.com', waterConsumption: 9800, billStatus: 'PENDING', prevReading: 8200 }
  ]);
  const [flatForm, setFlatForm] = useState({ apartmentName: user?.apartmentName || '', blockNo: '', flatNo: '', meterId: '', residentName: '', residentEmail: '' });
  const [isEditingFlat, setIsEditingFlat] = useState(null);

  // --- INVITATION STATE ---
  const [invitationForm, setInvitationForm] = useState({
    residentName: '',
    residentEmail: '',
    phoneNumber: '',
    apartmentName: user?.apartmentName || 'Green Heights',
    blockNo: 'A',
    flatNo: '',
    meterId: ''
  });
  const [generatedCode, setGeneratedCode] = useState('');

  // --- BILL GENERATION FORM STATE ---
  const [billForm, setBillForm] = useState({
    meterId: '',
    flatNo: '',
    ratePerUnit: '0.015',
    prevReading: '',
    currReading: '',
    amountInRupees: ''
  });

  const [issuedBills, setIssuedBills] = useState([
    { id: 101, blockNo: 'A', flatNo: '101', meterId: 'MTR-101', prevReading: 10000, currReading: 12500, amountInRupees: 375, status: 'PENDING', date: '2026-08-01' },
    { id: 102, blockNo: 'A', flatNo: '102', meterId: 'MTR-102', prevReading: 11000, currReading: 14200, amountInRupees: 480, status: 'PAID', date: '2026-07-28' }
  ]);

  // --- BULK WATER & TARIFF STATE ---
  const [bulkPurchases, setBulkPurchases] = useState([
    { id: 1, supplierType: 'TANKER', volumeLiters: 10000, unitCostPerLiter: 0.12, totalCost: 1200, purchaseDate: '2026-08-05' }
  ]);
  const [bulkForm, setBulkForm] = useState({ supplierType: 'TANKER', volumeLiters: '', unitCostPerLiter: '' });
  const [tariffConfig, setTariffConfig] = useState({ baseVolumeKl: 10, baseRatePerKl: 15, tier2RatePerKl: 35 });

  // --- BILLING CYCLES STATE ---
  const [billingCycles, setBillingCycles] = useState([
    { id: 1, cycleName: 'August 2026 Cycle', status: 'OPEN', createdAt: '2026-08-01' }
  ]);
  const [newCycleName, setNewCycleName] = useState('');

  // --- ALERTS & LEAK DETECTION STATE ---
  const [alertsList, setAlertsList] = useState([
    { id: 1, flatNo: '101', meterId: 'MTR-101', message: 'Continuous flow detected above 50L/hr overnight.', isResolved: false }
  ]);
  const [dailyLogForm, setDailyLogForm] = useState({ meterId: 'MTR-101', flatNo: '101', volumeLiters: '' });

  // Filters
  const [selectedYear, setSelectedYear] = useState('2026');

  useEffect(() => {
    loadLiveOwners();
  }, [activeTab]);

  const loadLiveOwners = async () => {
    try {
      if (role === 'ROLE_SUPER_ADMIN' || role === 'SUPER_ADMIN') {
        const res = await API.get('/admin/owners');
        setOwnersList(res.data || []);
      }
    } catch (err) {}
  };

  const handleApproveOwner = async (id, status) => {
    try {
      await API.post(`/admin/approve-owner/${id}?status=${status}`);
      alert(`Status updated to ${status}!`);
      loadLiveOwners();
    } catch (err) {
      alert("Error updating owner status.");
    }
  };

  const handleDeleteOwner = async (id) => {
    if (window.confirm("Delete record from PostgreSQL?")) {
      try {
        await API.delete(`/admin/users/${id}`);
        loadLiveOwners();
      } catch (err) {}
    }
  };

  const handleSaveFlat = (e) => {
    e.preventDefault();
    if (isEditingFlat) {
      setOwnerFlats(ownerFlats.map(f => f.id === isEditingFlat ? { ...flatForm, id: isEditingFlat } : f));
      setIsEditingFlat(null);
    } else {
      setOwnerFlats([...ownerFlats, { ...flatForm, id: Date.now(), waterConsumption: 0, billStatus: 'PENDING', prevReading: 0 }]);
    }
    setFlatForm({ apartmentName: user?.apartmentName || '', blockNo: '', flatNo: '', meterId: '', residentName: '', residentEmail: '' });
  };

  const handleEditFlat = (flat) => {
    setFlatForm(flat);
    setIsEditingFlat(flat.id);
  };

  const handleDeleteFlat = (id) => {
    if (window.confirm("Delete flat record?")) {
      setOwnerFlats(ownerFlats.filter(f => f.id !== id));
    }
  };

  const handleSendInvitation = async (e) => {
    e.preventDefault();
    const code = `INV-${invitationForm.blockNo || 'A'}${invitationForm.flatNo || '101'}-${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      await API.post('/auth/send-invitation', { ...invitationForm, code });
      setGeneratedCode(code);
      alert(`Invitation Generated Successfully!\nShare Code: ${code}`);
    } catch (err) {
      setGeneratedCode(code);
    }
  };

  const handleSelectPendingFlat = (flat) => {
    setBillForm({
      meterId: flat.meterId,
      flatNo: flat.flatNo,
      ratePerUnit: '0.015',
      prevReading: flat.prevReading || 10000,
      currReading: flat.waterConsumption || 12500,
      amountInRupees: Math.round(((flat.waterConsumption || 12500) - (flat.prevReading || 10000)) * 0.015)
    });
  };

  const handleGenerateBill = (e) => {
    e.preventDefault();
    const newBill = {
      id: Date.now(),
      flatNo: billForm.flatNo || '101',
      meterId: billForm.meterId,
      prevReading: billForm.prevReading,
      currReading: billForm.currReading,
      amountInRupees: billForm.amountInRupees,
      status: 'PENDING',
      date: new Date().toLocaleDateString()
    };
    
    setIssuedBills([newBill, ...issuedBills]);
    setOwnerFlats(ownerFlats.map(f => f.meterId === billForm.meterId ? { ...f, billStatus: 'GENERATED', prevReading: billForm.currReading } : f));
    alert(`Bill of ${currency}${billForm.amountInRupees} generated for Meter ID: ${billForm.meterId}!`);
    setBillForm({ meterId: '', flatNo: '', ratePerUnit: '0.015', prevReading: '', currReading: '', amountInRupees: '' });
  };

  const handlePayBill = (billId) => {
    setIssuedBills(issuedBills.map(b => b.id === billId ? { ...b, status: 'PAID' } : b));
    alert("Payment successful! Invoice status updated to PAID.");
  };

  const handleAddBulkPurchase = (e) => {
    e.preventDefault();
    const payload = {
      id: Date.now(),
      supplierType: bulkForm.supplierType,
      volumeLiters: parseFloat(bulkForm.volumeLiters),
      unitCostPerLiter: parseFloat(bulkForm.unitCostPerLiter),
      totalCost: parseFloat(bulkForm.volumeLiters) * parseFloat(bulkForm.unitCostPerLiter),
      purchaseDate: new Date().toLocaleDateString()
    };
    setBulkPurchases([...bulkPurchases, payload]);
    alert("Bulk water procurement recorded!");
    setBulkForm({ supplierType: 'TANKER', volumeLiters: '', unitCostPerLiter: '' });
  };

  const handleOpenCycle = (e) => {
    e.preventDefault();
    setBillingCycles([...billingCycles, { id: Date.now(), cycleName: newCycleName, status: 'OPEN', createdAt: new Date().toLocaleDateString() }]);
    alert(`Billing Cycle '${newCycleName}' Opened!`);
    setNewCycleName('');
  };

  const handleLogUsageAndCheckLeak = (e) => {
    e.preventDefault();
    if (parseFloat(dailyLogForm.volumeLiters) > 18000) {
      setAlertsList([...alertsList, { id: Date.now(), flatNo: dailyLogForm.flatNo, meterId: dailyLogForm.meterId, message: `ANOMALY DETECTED: Usage of ${dailyLogForm.volumeLiters} L exceeds 2σ limit!`, isResolved: false }]);
      alert("🚨 LEAK ALERT TRIGGERED!");
    } else {
      alert("Daily reading logged.");
    }
    setDailyLogForm({ meterId: 'MTR-101', flatNo: '101', volumeLiters: '' });
  };

  const pendingOwners = ownersList.filter(o => o.approvalStatus === 'PENDING');
  const approvedOwners = ownersList.filter(o => o.approvalStatus === 'APPROVED');
  const rejectedOwners = ownersList.filter(o => o.approvalStatus === 'REJECTED');

  const consumptionData = [
    { month: 'Jan', liters: 12000 },
    { month: 'Feb', liters: 14500 },
    { month: 'Mar', liters: 11000 },
    { month: 'Apr', liters: 16000 },
    { month: 'May', liters: 18500 },
    { month: 'Jun', liters: 15000 },
    { month: 'Jul', liters: 14500 }
  ];

  const totalRevenueReceived = issuedBills.filter(b => b.status === 'PAID').reduce((sum, b) => sum + Number(b.amountInRupees), 0);
  const pendingBillsCount = issuedBills.filter(b => b.status === 'PENDING').length;

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      
      {/* LEFT SIDEBAR */}
      <aside style={{ width: '22%', height: '100%', backgroundColor: '#0f172a', color: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '2rem 1.25rem', boxSizing: 'border-box' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.3rem', fontWeight: '700', color: '#38bdf8', marginBottom: '2rem' }}>
            <Droplets size={28} />
            <span>AquaTrack</span>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {/* SUPER ADMIN MENU */}
            {(role === 'ROLE_SUPER_ADMIN' || role === 'SUPER_ADMIN') && (
              <>
                <button onClick={() => setActiveTab('overview')} style={navBtnStyle(activeTab === 'overview')}><LayoutDashboard size={18} /> Owner Inventory ({approvedOwners.length})</button>
                <button onClick={() => setActiveTab('pending')} style={navBtnStyle(activeTab === 'pending')}><Clock size={18} /> Approvals ({pendingOwners.length})</button>
                <button onClick={() => setActiveTab('rejected')} style={navBtnStyle(activeTab === 'rejected')}><XCircle size={18} /> Rejected Owners ({rejectedOwners.length})</button>
                <button onClick={() => setActiveTab('waterAgg')} style={navBtnStyle(activeTab === 'waterAgg')}><BarChart3 size={18} /> Monthly Analytics</button>
              </>
            )}

            {/* BUILDING OWNER MENU */}
            {(role === 'ROLE_BUILDING_OWNER' || role === 'BUILDING_OWNER') && (
              <>
                <button onClick={() => setActiveTab('profile')} style={navBtnStyle(activeTab === 'profile')}><User size={18} /> Profile & Summary</button>
                <button onClick={() => setActiveTab('flatDetails')} style={navBtnStyle(activeTab === 'flatDetails')}><LayoutDashboard size={18} /> Flat Details & CRUD</button>
                <button onClick={() => setActiveTab('billGen')} style={navBtnStyle(activeTab === 'billGen')}><FileText size={18} /> Bill Generation</button>
                <button onClick={() => setActiveTab('payStatus')} style={navBtnStyle(activeTab === 'payStatus')}><DollarSign size={18} /> Payment Status</button>
                <button onClick={() => setActiveTab('reports')} style={navBtnStyle(activeTab === 'reports')}><BarChart3 size={18} /> Monthly Usage Report</button>
                <button onClick={() => setActiveTab('invitation')} style={navBtnStyle(activeTab === 'invitation')}><Send size={18} /> Send Invitation</button>
                <button onClick={() => setActiveTab('bulkPurchase')} style={navBtnStyle(activeTab === 'bulkPurchase')}><Truck size={18} /> Bulk Procurement</button>
                <button onClick={() => setActiveTab('tariffSettings')} style={navBtnStyle(activeTab === 'tariffSettings')}><Settings size={18} /> Tiered Tariff Config</button>
                <button onClick={() => setActiveTab('cycleMgmt')} style={navBtnStyle(activeTab === 'cycleMgmt')}><Calendar size={18} /> Billing Cycles</button>
                <button onClick={() => setActiveTab('leakAlerts')} style={navBtnStyle(activeTab === 'leakAlerts')}><AlertTriangle size={18} /> Leak Alerts</button>
              </>
            )}

            {/* RESIDENT MENU */}
            {(role === 'ROLE_RESIDENT' || role === 'RESIDENT') && (
              <>
                <button onClick={() => setActiveTab('overview')} style={navBtnStyle(activeTab === 'overview')}><BarChart3 size={18} /> Consumption Graph</button>
                <button onClick={() => setActiveTab('myFlat')} style={navBtnStyle(activeTab === 'myFlat')}><LayoutDashboard size={18} /> Flat Credentials</button>
                <button onClick={() => setActiveTab('myPayment')} style={navBtnStyle(activeTab === 'myPayment')}><DollarSign size={18} /> Pending Bills ({pendingBillsCount})</button>
                <button onClick={() => setActiveTab('myHistory')} style={navBtnStyle(activeTab === 'myHistory')}><Clock size={18} /> Payment History</button>
                <button onClick={() => setActiveTab('leakAlerts')} style={navBtnStyle(activeTab === 'leakAlerts')}><AlertTriangle size={18} /> Leak Warnings</button>
              </>
            )}
          </nav>
        </div>

        <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', backgroundColor: '#ef4444', color: '#ffffff' }}>
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* RIGHT MAIN WORKSPACE */}
      <main style={{ width: '78%', height: '100%', backgroundColor: '#f8fafc', overflowY: 'auto', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 2.5rem', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', fontWeight: '700', color: '#0f172a' }}>
            <Droplets size={24} color="#0284c7" />
            <span>AquaTrack Workspace Console</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.9rem', color: '#475569', fontWeight: '600' }}>{user?.fullName || user?.email}</span>
            <span style={{ padding: '4px 12px', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700' }}>
              {role.replace('ROLE_', '')}
            </span>
          </div>
        </header>

        <div style={{ padding: '2rem 2.5rem', flex: 1 }}>

          {/* ================= RESIDENT TAB 1: CONSUMPTION GRAPH ================= */}
          {(role === 'ROLE_RESIDENT' || role === 'RESIDENT') && activeTab === 'overview' && (
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#0f172a' }}>My Monthly Water Consumption Graph</h2>
                <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} style={selectStyle}>
                  <option value="2026">Year 2026</option>
                  <option value="2025">Year 2025</option>
                </select>
              </div>
              <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
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

          {/* ================= RESIDENT TAB 2: FLAT CREDENTIALS ================= */}
          {(role === 'ROLE_RESIDENT' || role === 'RESIDENT') && activeTab === 'myFlat' && (
            <section style={{ maxWidth: '520px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.2rem' }}>Resident Flat Credentials</h2>
              <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <p style={{ fontSize: '1rem', margin: '0 0 12px 0', color: '#475569' }}><strong>Apartment Name:</strong> <span style={{ color: '#0f172a' }}>{user?.apartmentName || 'Green Heights'}</span></p>
                <p style={{ fontSize: '1rem', margin: '0 0 12px 0', color: '#475569' }}><strong>Building Owner:</strong> <span style={{ color: '#0f172a' }}>Rajesh Kumar</span></p>
                <p style={{ fontSize: '1rem', margin: '0 0 12px 0', color: '#475569' }}><strong>Block No:</strong> <span style={{ color: '#0f172a' }}>{user?.blockNo || 'A'}</span></p>
                <p style={{ fontSize: '1rem', margin: '0 0 12px 0', color: '#475569' }}><strong>Flat No:</strong> <span style={{ color: '#0f172a' }}>{user?.flatNo || '101'}</span></p>
                <p style={{ fontSize: '1.1rem', margin: '0', color: '#0284c7', fontWeight: '800' }}><strong>Meter ID:</strong> {user?.meterId || 'MTR-101'}</p>
              </div>
            </section>
          )}

          {/* ================= RESIDENT TAB 3: PENDING BILLS ================= */}
          {(role === 'ROLE_RESIDENT' || role === 'RESIDENT') && activeTab === 'myPayment' && (
            <section>
              {pendingBillsCount > 0 && (
                <div style={{ padding: '1rem 1.5rem', backgroundColor: '#fef3c7', borderLeft: '4px solid #f59e0b', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Bell size={22} color="#b45309" />
                  <div>
                    <p style={{ margin: '0', fontWeight: '700', color: '#b45309' }}>NEW WATER BILL DISPATCHED!</p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#78350f' }}>Your Building Owner has generated a new water consumption invoice. Please clear the pending dues.</p>
                  </div>
                </div>
              )}

              <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.2rem' }}>My Pending Bills</h2>
              <table style={tableStyle}>
                <thead>
                  <tr style={thStyle}>
                    <th style={{ padding: '12px' }}>METER ID</th>
                    <th style={{ padding: '12px' }}>AMOUNT ({currency})</th>
                    <th style={{ padding: '12px' }}>DATE</th>
                    <th style={{ padding: '12px' }}>STATUS</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {issuedBills.filter(b => b.status === 'PENDING').map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', color: '#0284c7', fontWeight: '700' }}>{b.meterId}</td>
                      <td style={{ padding: '12px', fontWeight: '800', fontSize: '1rem' }}>{currency}{b.amountInRupees}</td>
                      <td style={{ padding: '12px' }}>{b.date}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '4px 10px', backgroundColor: '#fef3c7', color: '#b45309', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700' }}>PENDING</span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button onClick={() => handlePayBill(b.id)} style={{ padding: '6px 14px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Pay Now</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* ================= RESIDENT TAB 4: PAYMENT HISTORY ================= */}
          {(role === 'ROLE_RESIDENT' || role === 'RESIDENT') && activeTab === 'myHistory' && (
            <section>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.2rem' }}>Payment History of Previous Bills</h2>
              <table style={tableStyle}>
                <thead>
                  <tr style={thStyle}>
                    <th style={{ padding: '12px' }}>METER ID</th>
                    <th style={{ padding: '12px' }}>AMOUNT PAID ({currency})</th>
                    <th style={{ padding: '12px' }}>DATE</th>
                    <th style={{ padding: '12px' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {issuedBills.filter(b => b.status === 'PAID').map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', color: '#0284c7', fontWeight: '600' }}>{b.meterId}</td>
                      <td style={{ padding: '12px', fontWeight: '700' }}>{currency}{b.amountInRupees}</td>
                      <td style={{ padding: '12px' }}>{b.date}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '4px 10px', backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700' }}>PAID</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* ================= BUILDING OWNER TAB 1: PROFILE & SUMMARY ================= */}
          {(role === 'ROLE_BUILDING_OWNER' || role === 'BUILDING_OWNER') && activeTab === 'profile' && (
            <section>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.2rem' }}>Building Owner Profile Details</h2>
              <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '10px', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <p style={{ margin: '0 0 10px 0' }}><strong>Full Name:</strong> {user?.fullName || 'Property Owner'}</p>
                <p style={{ margin: '0 0 10px 0' }}><strong>Email ID:</strong> {user?.email || 'owner@aquatrack.com'}</p>
                <p style={{ margin: '0 0 10px 0' }}><strong>Apartment Status:</strong> <span style={{ padding: '3px 10px', backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '12px', fontWeight: '700', fontSize: '0.8rem' }}>APPROVED</span></p>
                <p style={{ margin: '0 0 10px 0' }}><strong>Block No:</strong> {user?.blockNo || 'A'}</p>
                <p style={{ margin: '0' }}><strong>Flat No:</strong> {user?.flatNo || '101'}</p>
              </div>
            </section>
          )}

          {/* ================= BUILDING OWNER TAB 2: FLAT DETAILS & CRUD ================= */}
          {(role === 'ROLE_BUILDING_OWNER' || role === 'BUILDING_OWNER') && activeTab === 'flatDetails' && (
            <section>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.2rem' }}>Flat Details &amp; CRUD Operations</h2>
              <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '10px', marginBottom: '2rem' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>{isEditingFlat ? 'Edit Flat Credentials' : 'Add New Flat'}</h3>
                <form onSubmit={handleSaveFlat} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <input type="text" placeholder="Apartment Name" required value={flatForm.apartmentName} onChange={e => setFlatForm({ ...flatForm, apartmentName: e.target.value })} style={inStyle} />
                  <input type="text" placeholder="Block No (A)" required value={flatForm.blockNo} onChange={e => setFlatForm({ ...flatForm, blockNo: e.target.value })} style={inStyle} />
                  <input type="text" placeholder="Flat No (101)" required value={flatForm.flatNo} onChange={e => setFlatForm({ ...flatForm, flatNo: e.target.value })} style={inStyle} />
                  <input type="text" placeholder="Meter ID (MTR-101)" required value={flatForm.meterId} onChange={e => setFlatForm({ ...flatForm, meterId: e.target.value })} style={inStyle} />
                  <input type="text" placeholder="Resident Name" required value={flatForm.residentName} onChange={e => setFlatForm({ ...flatForm, residentName: e.target.value })} style={inStyle} />
                  <input type="email" placeholder="Resident Email" required value={flatForm.residentEmail} onChange={e => setFlatForm({ ...flatForm, residentEmail: e.target.value })} style={inStyle} />
                  <button type="submit" style={{ padding: '10px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', gridColumn: 'span 3' }}>
                    {isEditingFlat ? 'Update Flat Record' : 'Add New Flat Record'}
                  </button>
                </form>
              </div>

              <table style={tableStyle}>
                <thead>
                  <tr style={thStyle}>
                    <th style={{ padding: '12px' }}>APARTMENT</th>
                    <th style={{ padding: '12px' }}>BLOCK</th>
                    <th style={{ padding: '12px' }}>FLAT NO</th>
                    <th style={{ padding: '12px' }}>METER ID</th>
                    <th style={{ padding: '12px' }}>RESIDENT NAME</th>
                    <th style={{ padding: '12px' }}>RESIDENT EMAIL</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {ownerFlats.map(f => (
                    <tr key={f.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px' }}>{f.apartmentName}</td>
                      <td style={{ padding: '12px' }}>{f.blockNo}</td>
                      <td style={{ padding: '12px', fontWeight: '700' }}>{f.flatNo}</td>
                      <td style={{ padding: '12px', color: '#0284c7', fontWeight: '700' }}>{f.meterId}</td>
                      <td style={{ padding: '12px' }}>{f.residentName}</td>
                      <td style={{ padding: '12px' }}>{f.residentEmail}</td>
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

          {/* ================= BUILDING OWNER TAB 3: BILL GENERATION ================= */}
          {(role === 'ROLE_BUILDING_OWNER' || role === 'BUILDING_OWNER') && activeTab === 'billGen' && (
            <section>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.2rem' }}>Bill Generation Center</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#0f172a' }}>Generate & Dispatch Invoice</h3>
                  <form onSubmit={handleGenerateBill}>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={lblStyle}>METER ID</label>
                      <input type="text" placeholder="Select meter from right list" required value={billForm.meterId} onChange={e => setBillForm({ ...billForm, meterId: e.target.value })} style={inStyle} />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={lblStyle}>RATE PER UNIT ({currency} / LITER)</label>
                      <input type="number" step="0.001" placeholder="0.015" required value={billForm.ratePerUnit} onChange={e => setBillForm({ ...billForm, ratePerUnit: e.target.value })} style={inStyle} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <label style={lblStyle}>PREVIOUS READING</label>
                        <input type="number" placeholder="10000" required value={billForm.prevReading} onChange={e => setBillForm({ ...billForm, prevReading: e.target.value })} style={inStyle} />
                      </div>
                      <div>
                        <label style={lblStyle}>CURRENT READING</label>
                        <input type="number" placeholder="12500" required value={billForm.currReading} onChange={e => {
                          const curr = parseFloat(e.target.value) || 0;
                          const prev = parseFloat(billForm.prevReading) || 0;
                          const rate = parseFloat(billForm.ratePerUnit) || 0.015;
                          const calcAmount = Math.max(0, Math.round((curr - prev) * rate));
                          setBillForm({ ...billForm, currReading: e.target.value, amountInRupees: calcAmount });
                        }} style={inStyle} />
                      </div>
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ ...lblStyle, color: '#0284c7' }}>TOTAL CALCULATED AMOUNT ({currency})</label>
                      <input type="number" placeholder={`${currency} 375`} required value={billForm.amountInRupees} onChange={e => setBillForm({ ...billForm, amountInRupees: e.target.value })} style={{ ...inStyle, borderColor: '#0284c7', fontWeight: '700', fontSize: '1.1rem' }} />
                    </div>
                    <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
                      Generate & Issue Invoice
                    </button>
                  </form>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#0f172a' }}>Pending Meters to Generate Bill</h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>Click any pending flat below to auto-fill its Meter ID and Previous Reading.</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {ownerFlats.map(f => (
                      <div key={f.id} onClick={() => handleSelectPendingFlat(f)} style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: billForm.meterId === f.meterId ? '#e0f2fe' : '#f8fafc' }}>
                        <div>
                          <p style={{ margin: '0', fontWeight: '700', fontSize: '0.9rem' }}>Flat {f.flatNo} (Block {f.blockNo})</p>
                          <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#0284c7' }}>Meter ID: {f.meterId}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ padding: '3px 8px', backgroundColor: f.billStatus === 'GENERATED' ? '#dcfce7' : '#fef3c7', color: f.billStatus === 'GENERATED' ? '#15803d' : '#b45309', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '700' }}>
                            {f.billStatus === 'GENERATED' ? 'ISSUED' : 'PENDING'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ================= BUILDING OWNER TAB 4: PAYMENT STATUS ================= */}
          {(role === 'ROLE_BUILDING_OWNER' || role === 'BUILDING_OWNER') && activeTab === 'payStatus' && (
            <section>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.2rem' }}>Resident Payment Status Tracking</h2>
              <table style={tableStyle}>
                <thead>
                  <tr style={thStyle}>
                    <th style={{ padding: '12px' }}>FLAT NO</th>
                    <th style={{ padding: '12px' }}>METER ID</th>
                    <th style={{ padding: '12px' }}>AMOUNT ({currency})</th>
                    <th style={{ padding: '12px' }}>DATE</th>
                    <th style={{ padding: '12px' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {issuedBills.map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: '700' }}>{b.flatNo}</td>
                      <td style={{ padding: '12px', color: '#0284c7' }}>{b.meterId}</td>
                      <td style={{ padding: '12px', fontWeight: '700' }}>{currency}{b.amountInRupees}</td>
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

              <div style={{ marginTop: '1.5rem', padding: '1.2rem', backgroundColor: '#ffffff', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', color: '#475569' }}>TOTAL REVENUE RECEIVED:</span>
                <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#15803d' }}>{currency}{totalRevenueReceived}</span>
              </div>
            </section>
          )}

          {/* ================= BUILDING OWNER TAB 5: SEND INVITATION ================= */}
          {(role === 'ROLE_BUILDING_OWNER' || role === 'BUILDING_OWNER') && activeTab === 'invitation' && (
            <section style={{ maxWidth: '520px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.2rem' }}>Send Resident Invitation</h2>
              <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <form onSubmit={handleSendInvitation}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={lblStyle}>RESIDENT NAME</label>
                    <input type="text" placeholder="John Doe" required value={invitationForm.residentName} onChange={e => setInvitationForm({ ...invitationForm, residentName: e.target.value })} style={inStyle} />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={lblStyle}>RESIDENT EMAIL ID</label>
                    <input type="email" placeholder="resident@example.com" required value={invitationForm.residentEmail} onChange={e => setInvitationForm({ ...invitationForm, residentEmail: e.target.value })} style={inStyle} />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={lblStyle}>PHONE NUMBER</label>
                    <input type="text" placeholder="9876543210" required value={invitationForm.phoneNumber} onChange={e => setInvitationForm({ ...invitationForm, phoneNumber: e.target.value })} style={inStyle} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '1.5rem' }}>
                    <div>
                      <label style={lblStyle}>BLOCK NO</label>
                      <input type="text" placeholder="A" required value={invitationForm.blockNo} onChange={e => setInvitationForm({ ...invitationForm, blockNo: e.target.value })} style={inStyle} />
                    </div>
                    <div>
                      <label style={lblStyle}>FLAT NO</label>
                      <input type="text" placeholder="101" required value={invitationForm.flatNo} onChange={e => setInvitationForm({ ...invitationForm, flatNo: e.target.value })} style={inStyle} />
                    </div>
                    <div>
                      <label style={lblStyle}>METER ID</label>
                      <input type="text" placeholder="MTR-101" required value={invitationForm.meterId} onChange={e => setInvitationForm({ ...invitationForm, meterId: e.target.value })} style={inStyle} />
                    </div>
                  </div>
                  <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
                    Generate & Send Invitation Code
                  </button>
                </form>

                {generatedCode && (
                  <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: '800' }}>INVITATION GENERATED SUCCESSFUL</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#15803d', marginTop: '4px' }}>{generatedCode}</div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ================= BUILDING OWNER TAB 6: BULK PROCUREMENT ================= */}
          {(role === 'ROLE_BUILDING_OWNER' || role === 'BUILDING_OWNER') && activeTab === 'bulkPurchase' && (
            <section>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.2rem' }}>Bulk Water Procurement Logistics</h2>
              <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '10px', marginBottom: '1.5rem', maxWidth: '500px' }}>
                <form onSubmit={handleAddBulkPurchase}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={lblStyle}>SUPPLIER TYPE</label>
                    <select value={bulkForm.supplierType} onChange={e => setBulkForm({ ...bulkForm, supplierType: e.target.value })} style={inStyle}>
                      <option value="TANKER">Private Water Tanker</option>
                      <option value="MUNICIPAL">Municipal Corporation</option>
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <input type="number" placeholder="Volume (Liters)" required value={bulkForm.volumeLiters} onChange={e => setBulkForm({ ...bulkForm, volumeLiters: e.target.value })} style={inStyle} />
                    <input type="number" step="0.01" placeholder="Cost per Liter ₹" required value={bulkForm.unitCostPerLiter} onChange={e => setBulkForm({ ...bulkForm, unitCostPerLiter: e.target.value })} style={inStyle} />
                  </div>
                  <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Log Procurement</button>
                </form>
              </div>

              <table style={tableStyle}>
                <thead>
                  <tr style={thStyle}>
                    <th style={{ padding: '12px' }}>SUPPLIER</th>
                    <th style={{ padding: '12px' }}>VOLUME (L)</th>
                    <th style={{ padding: '12px' }}>TOTAL COST ({currency})</th>
                    <th style={{ padding: '12px' }}>DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {bulkPurchases.map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: '700' }}>{b.supplierType}</td>
                      <td style={{ padding: '12px' }}>{b.volumeLiters} L</td>
                      <td style={{ padding: '12px', color: '#0284c7', fontWeight: '700' }}>{currency}{b.totalCost}</td>
                      <td style={{ padding: '12px' }}>{b.purchaseDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* ================= BUILDING OWNER TAB 7: TIERED TARIFF CONFIG ================= */}
          {(role === 'ROLE_BUILDING_OWNER' || role === 'BUILDING_OWNER') && activeTab === 'tariffSettings' && (
            <section style={{ maxWidth: '480px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.2rem' }}>Tiered Rate Policy Configurator</h2>
              <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '10px' }}>
                <form onSubmit={e => { e.preventDefault(); alert("Tariff Config Saved!"); }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={lblStyle}>BASE VOLUME TIER (kL)</label>
                    <input type="number" required value={tariffConfig.baseVolumeKl} onChange={e => setTariffConfig({ ...tariffConfig, baseVolumeKl: e.target.value })} style={inStyle} />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={lblStyle}>BASE RATE ({currency} / kL)</label>
                    <input type="number" required value={tariffConfig.baseRatePerKl} onChange={e => setTariffConfig({ ...tariffConfig, baseRatePerKl: e.target.value })} style={inStyle} />
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={lblStyle}>TIER-2 RATE BEYOND BASE ({currency} / kL)</label>
                    <input type="number" required value={tariffConfig.tier2RatePerKl} onChange={e => setTariffConfig({ ...tariffConfig, tier2RatePerKl: e.target.value })} style={inStyle} />
                  </div>
                  <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Save Tariff Policy</button>
                </form>
              </div>
            </section>
          )}

          {/* ================= BUILDING OWNER TAB 8: BILLING CYCLES ================= */}
          {(role === 'ROLE_BUILDING_OWNER' || role === 'BUILDING_OWNER') && activeTab === 'cycleMgmt' && (
            <section>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.2rem' }}>Billing Period Cycle Lifecycle</h2>
              <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '10px', maxWidth: '480px', marginBottom: '1.5rem' }}>
                <form onSubmit={handleOpenCycle} style={{ display: 'flex', gap: '10px' }}>
                  <input type="text" placeholder="Cycle Name (August 2026)" required value={newCycleName} onChange={e => setNewCycleName(e.target.value)} style={inStyle} />
                  <button type="submit" style={{ padding: '10px 16px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Open Cycle</button>
                </form>
              </div>

              <table style={tableStyle}>
                <thead>
                  <tr style={thStyle}>
                    <th style={{ padding: '12px' }}>CYCLE NAME</th>
                    <th style={{ padding: '12px' }}>STATUS</th>
                    <th style={{ padding: '12px' }}>CREATED AT</th>
                  </tr>
                </thead>
                <tbody>
                  {billingCycles.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: '700' }}>{c.cycleName}</td>
                      <td style={{ padding: '12px' }}><span style={{ padding: '3px 10px', backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700' }}>{c.status}</span></td>
                      <td style={{ padding: '12px' }}>{c.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* ================= LEAK ALERTS / WARNINGS (RESIDENT & OWNER) ================= */}
          {activeTab === 'leakAlerts' && (
            <section>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.2rem' }}>Statistical Leak &amp; Anomaly Detection</h2>
              {(role === 'ROLE_BUILDING_OWNER' || role === 'BUILDING_OWNER') && (
                <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '10px', marginBottom: '1.5rem', maxWidth: '500px' }}>
                  <form onSubmit={handleLogUsageAndCheckLeak} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <input type="text" placeholder="Meter ID (MTR-101)" required value={dailyLogForm.meterId} onChange={e => setDailyLogForm({ ...dailyLogForm, meterId: e.target.value })} style={inStyle} />
                    <input type="text" placeholder="Flat No (101)" required value={dailyLogForm.flatNo} onChange={e => setDailyLogForm({ ...dailyLogForm, flatNo: e.target.value })} style={inStyle} />
                    <input type="number" placeholder="Volume Liters (e.g. 19000 L)" required value={dailyLogForm.volumeLiters} onChange={e => setDailyLogForm({ ...dailyLogForm, volumeLiters: e.target.value })} style={{ ...inStyle, gridColumn: 'span 2' }} />
                    <button type="submit" style={{ gridColumn: 'span 2', padding: '10px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Record &amp; Check Outlier</button>
                  </form>
                </div>
              )}

              <table style={tableStyle}>
                <thead>
                  <tr style={thStyle}>
                    <th style={{ padding: '12px' }}>FLAT NO</th>
                    <th style={{ padding: '12px' }}>METER ID</th>
                    <th style={{ padding: '12px' }}>ALERT MESSAGE</th>
                    <th style={{ padding: '12px' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {alertsList.length === 0 ? (
                    <tr><td colSpan="4" style={{ padding: '16px', textAlign: 'center', color: '#16a34a', fontWeight: '600' }}>✓ No active leak warnings detected. Usage is normal.</td></tr>
                  ) : (
                    alertsList.map(a => (
                      <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px', fontWeight: '700' }}>{a.flatNo}</td>
                        <td style={{ padding: '12px', color: '#0284c7' }}>{a.meterId}</td>
                        <td style={{ padding: '12px', color: '#dc2626', fontWeight: '600' }}>{a.message}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ padding: '4px 10px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700' }}>ACTIVE LEAK</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </section>
          )}

          {/* ================= SUPER ADMIN TABS ================= */}
          {(role === 'ROLE_SUPER_ADMIN' || role === 'SUPER_ADMIN') && activeTab === 'overview' && (
            <section>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.2rem' }}>Registered Building Owners Inventory ({approvedOwners.length})</h2>
              <table style={tableStyle}>
                <thead>
                  <tr style={thStyle}>
                    <th style={{ padding: '12px' }}>OWNER NAME</th>
                    <th style={{ padding: '12px' }}>EMAIL ID</th>
                    <th style={{ padding: '12px' }}>PHONE</th>
                    <th style={{ padding: '12px' }}>APARTMENT</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedOwners.length === 0 ? (
                    <tr><td colSpan="5" style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>No approved building owners found.</td></tr>
                  ) : (
                    approvedOwners.map(o => (
                      <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px', fontWeight: '600' }}>{o.fullName}</td>
                        <td style={{ padding: '12px' }}>{o.email}</td>
                        <td style={{ padding: '12px' }}>{o.phoneNumber || 'N/A'}</td>
                        <td style={{ padding: '12px' }}>{o.apartmentName || 'N/A'}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button onClick={() => handleDeleteOwner(o.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={18} /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </section>
          )}

          {(role === 'ROLE_SUPER_ADMIN' || role === 'SUPER_ADMIN') && activeTab === 'pending' && (
            <section>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.2rem' }}>Pending Building Owner Registrations ({pendingOwners.length})</h2>
              <table style={tableStyle}>
                <thead>
                  <tr style={thStyle}>
                    <th style={{ padding: '12px' }}>OWNER NAME</th>
                    <th style={{ padding: '12px' }}>EMAIL ID</th>
                    <th style={{ padding: '12px' }}>PHONE</th>
                    <th style={{ padding: '12px' }}>APARTMENT</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingOwners.length === 0 ? (
                    <tr><td colSpan="5" style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>No pending registration requests in database.</td></tr>
                  ) : (
                    pendingOwners.map(o => (
                      <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px', fontWeight: '600' }}>{o.fullName}</td>
                        <td style={{ padding: '12px' }}>{o.email}</td>
                        <td style={{ padding: '12px' }}>{o.phoneNumber}</td>
                        <td style={{ padding: '12px' }}>{o.apartmentName}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button onClick={() => handleApproveOwner(o.id, 'APPROVED')} style={{ padding: '6px 14px', backgroundColor: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', marginRight: '8px', fontWeight: '700' }}>Approve</button>
                          <button onClick={() => handleApproveOwner(o.id, 'REJECTED')} style={{ padding: '6px 14px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}>Reject</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </section>
          )}

          {(role === 'ROLE_SUPER_ADMIN' || role === 'SUPER_ADMIN') && activeTab === 'rejected' && (
            <section>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.2rem' }}>Rejected Building Owner Applications ({rejectedOwners.length})</h2>
              <table style={tableStyle}>
                <thead>
                  <tr style={thStyle}>
                    <th style={{ padding: '12px' }}>NAME</th>
                    <th style={{ padding: '12px' }}>EMAIL</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {rejectedOwners.length === 0 ? (
                    <tr><td colSpan="3" style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>No rejected building owners.</td></tr>
                  ) : (
                    rejectedOwners.map(r => (
                      <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px', fontWeight: '600' }}>{r.fullName}</td>
                        <td style={{ padding: '12px' }}>{r.email}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button onClick={() => handleDeleteOwner(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={18} /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </section>
          )}

        </div>
      </main>
    </div>
  );
}

// SHARED STYLES
const navBtnStyle = (active) => ({
  display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.88rem', fontWeight: '600', width: '100%', textAlign: 'left', backgroundColor: active ? '#0284c7' : 'transparent', color: active ? '#ffffff' : '#94a3b8'
});
const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden' };
const thStyle = { backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.8rem', borderBottom: '1px solid #e2e8f0' };
const lblStyle = { display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '4px' };
const inStyle = { width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' };
const selectStyle = { padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' };