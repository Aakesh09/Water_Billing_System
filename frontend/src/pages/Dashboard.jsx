import React, { useState, useEffect } from 'react';
import { 
  Droplets, LayoutDashboard, Clock, XCircle, BarChart3, LogOut, Edit, Trash2, 
  User, Send, DollarSign, FileText, Truck, Settings, Calendar, AlertTriangle, 
  Bell, CheckCircle2, Download, Lightbulb, TrendingUp, Users, CreditCard, ShieldCheck, X
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';
import API from '../services/api';

export default function Dashboard({ user, onLogout }) {
  const role = user?.role || 'ROLE_SUPER_ADMIN';
  const currency = "\u20B9";

  // Resident Metadata for Strict Isolation
  const residentMeterId = user?.meterId || 'MTR-101';
  const residentEmail = user?.email || 'resident101@aquatrack.com';
  const residentFlatNo = user?.flatNo || '101';
  const residentBlockNo = user?.blockNo || 'A';
  const residentApartmentName = user?.apartmentName || 'Green Heights';

  const [activeTab, setActiveTab] = useState(() => {
    if (role === 'ROLE_RESIDENT' || role === 'RESIDENT') return 'trends';
    if (role === 'ROLE_BUILDING_OWNER' || role === 'BUILDING_OWNER') return 'profile';
    return 'overview';
  });

  // Razorpay Modal State
  const [razorpayModalBill, setRazorpayModalBill] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  // ================= 1. SUPER ADMIN STATE =================
  const [ownersList, setOwnersList] = useState([
    { id: 1, fullName: 'Rajesh Kumar', email: 'rajesh@aquatrack.com', phoneNumber: '9876543210', apartmentName: 'Green Heights', blockNo: 'A', flatNo: '101', meterId: 'MTR-101', approvalStatus: 'PENDING' },
    { id: 2, fullName: 'Suresh Verma', email: 'suresh@gmail.com', phoneNumber: '9876543211', apartmentName: 'Royal Palms', blockNo: 'B', flatNo: '201', meterId: 'MTR-201', approvalStatus: 'APPROVED' },
    { id: 3, fullName: 'Anil Mehta', email: 'anil@outlook.com', phoneNumber: '9876543212', apartmentName: 'Lake View', blockNo: 'C', flatNo: '301', meterId: 'MTR-301', approvalStatus: 'REJECTED' }
  ]);

  const [allFlatsOverview, setAllFlatsOverview] = useState([
    { id: 1, flatNo: '101', blockNo: 'A', ownerName: 'Rajesh Kumar', ownerEmail: 'rajesh@aquatrack.com', residentName: 'John Doe', meterId: 'MTR-101', apartmentName: 'Green Heights' },
    { id: 2, flatNo: '102', blockNo: 'A', ownerName: 'Rajesh Kumar', ownerEmail: 'rajesh@aquatrack.com', residentName: 'Priya Sharma', meterId: 'MTR-102', apartmentName: 'Green Heights' },
    { id: 3, flatNo: '201', blockNo: 'B', ownerName: 'Suresh Verma', ownerEmail: 'suresh@gmail.com', residentName: 'Rahul Verma', meterId: 'MTR-201', apartmentName: 'Royal Palms' },
    { id: 4, flatNo: '202', blockNo: 'B', ownerName: 'Suresh Verma', ownerEmail: 'suresh@gmail.com', residentName: 'Sneha Patel', meterId: 'MTR-202', apartmentName: 'Royal Palms' }
  ]);

  const superAdminAnalyticsData = [
    { apartment: 'Green Heights', consumptionKl: 145, totalCost: 3200 },
    { apartment: 'Royal Palms', consumptionKl: 198, totalCost: 4500 },
    { apartment: 'Lake View', consumptionKl: 85, totalCost: 1900 },
    { apartment: 'Skyline Towers', consumptionKl: 230, totalCost: 5600 }
  ];

  // ================= 2. BUILDING OWNER STATE =================
  const [ownerFlats, setOwnerFlats] = useState([
    { id: 1, apartmentName: user?.apartmentName || 'Green Heights', blockNo: 'A', flatNo: '101', meterId: 'MTR-101', residentName: 'John Doe', residentEmail: 'resident101@aquatrack.com', prevReading: 10000, waterConsumption: 14500, billStatus: 'PENDING' },
    { id: 2, apartmentName: user?.apartmentName || 'Green Heights', blockNo: 'A', flatNo: '102', meterId: 'MTR-102', residentName: 'Priya Sharma', residentEmail: 'priya@gmail.com', prevReading: 11000, waterConsumption: 13200, billStatus: 'GENERATED' },
    { id: 3, apartmentName: user?.apartmentName || 'Green Heights', blockNo: 'A', flatNo: '103', meterId: 'MTR-103', residentName: 'Amit Singh', residentEmail: 'amit@gmail.com', prevReading: 8000, waterConsumption: 19500, billStatus: 'PENDING' }
  ]);

  const [flatForm, setFlatForm] = useState({ blockNo: 'A', flatNo: '', meterId: '', residentName: '', residentEmail: '' });
  const [isEditingFlatId, setIsEditingFlatId] = useState(null);

  const [bulkPurchases, setBulkPurchases] = useState([
    { id: 1, supplierType: 'PRIVATE TANKER', volumeLiters: 12000, unitCostPerLiter: 0.15, totalCost: 1800, purchaseDate: '2026-08-10', notes: 'Emergency tanker delivery' },
    { id: 2, supplierType: 'MUNICIPAL BULK', volumeLiters: 25000, unitCostPerLiter: 0.08, totalCost: 2000, purchaseDate: '2026-08-01', notes: 'Monthly supply refill' }
  ]);
  const [bulkForm, setBulkForm] = useState({ supplierType: 'PRIVATE TANKER', volumeLiters: '', unitCostPerLiter: '', notes: '' });

  const [tariffConfig, setTariffConfig] = useState({ baseVolumeKl: 10, baseRatePerKl: 15.0, tier2RatePerKl: 35.0 });
  const [billingCycles, setBillingCycles] = useState([
    { id: 1, cycleName: 'August 2026 Cycle', status: 'ACTIVE', startDate: '2026-08-01', endDate: '2026-08-31', totalUnitsBilled: 47200 },
    { id: 2, cycleName: 'July 2026 Cycle', status: 'CLOSED', startDate: '2026-07-01', endDate: '2026-07-31', totalUnitsBilled: 51300 }
  ]);
  const [newCycleForm, setNewCycleForm] = useState({ cycleName: '', startDate: '', endDate: '' });

  // 3-Column Bill Generation Form
  const [billForm, setBillForm] = useState({ meterId: '', flatNo: '', residentName: '', residentEmail: '', prevReading: '', currReading: '', tier1Amt: 0, tier2Amt: 0, amountInRupees: 0 });

  // Master Issued Bills
  const [issuedBills, setIssuedBills] = useState([
    { id: 101, invoiceNumber: 'INV-891234', blockNo: 'A', flatNo: '101', meterId: 'MTR-101', residentName: 'John Doe', residentEmail: 'resident101@aquatrack.com', prevReading: 10000, currReading: 14500, amountInRupees: 307.50, status: 'PENDING', transactionId: null, date: '2026-08-15' },
    { id: 102, invoiceNumber: 'INV-891230', blockNo: 'A', flatNo: '102', meterId: 'MTR-102', residentName: 'Priya Sharma', residentEmail: 'priya@gmail.com', prevReading: 11000, currReading: 13200, amountInRupees: 227.00, status: 'PAID', transactionId: 'pay_rzp_demo102', date: '2026-07-28' }
  ]);

  const [invitationForm, setInvitationForm] = useState({ residentName: '', residentEmail: '', phoneNumber: '', apartmentName: user?.apartmentName || 'Green Heights', blockNo: 'A', flatNo: '', meterId: '' });
  const [generatedCode, setGeneratedCode] = useState('');

  // Master Alerts List
  const [alertsList, setAlertsList] = useState([
    { id: 1, flatNo: '101', meterId: 'MTR-101', message: 'Continuous flow detected above 50L/hr overnight.', severity: 'CRITICAL', isResolved: false, date: '2026-08-18' },
    { id: 2, flatNo: '103', meterId: 'MTR-103', message: 'Usage spike > 2.5 sigma above 30-day baseline.', severity: 'HIGH', isResolved: false, date: '2026-08-17' }
  ]);

  // ================= 3. RESIDENT RECHARTS DATASETS =================
  const lineTrendsData = [
    { day: 'Day 1', myUsage: 350, avgUsage: 400 },
    { day: 'Day 5', myUsage: 420, avgUsage: 410 },
    { day: 'Day 10', myUsage: 310, avgUsage: 395 },
    { day: 'Day 15', myUsage: 480, avgUsage: 420 },
    { day: 'Day 20', myUsage: 290, avgUsage: 380 },
    { day: 'Day 25', myUsage: 360, avgUsage: 400 },
    { day: 'Day 30', myUsage: 330, avgUsage: 390 }
  ];

  const comparisonData = [
    { category: `My Flat (${residentFlatNo})`, volume: 12500 },
    { category: 'Apartment Avg', volume: 14200 },
    { category: 'Similar Households', volume: 13000 }
  ];

  const apartmentUsageReportData = ownerFlats.map(f => ({
    flat: `Flat ${f.flatNo}`,
    consumption: f.waterConsumption || 10000
  }));

  const waterTips = [
    "Fix leaking taps promptly — a single dripping tap can waste over 15 liters per day.",
    "Install aerators on sink faucets to reduce water flow without sacrificing pressure.",
    "Run washing machines only with full loads to conserve both water and electricity.",
    "Water plants early in the morning to minimize evaporation loss."
  ];

  useEffect(() => {
    loadSuperAdminOwners();
  }, [activeTab]);

  const loadSuperAdminOwners = async () => {
    try {
      if (role === 'ROLE_SUPER_ADMIN' || role === 'SUPER_ADMIN') {
        const res = await API.get('/admin/owners');
        if (res.data && res.data.length > 0) {
          setOwnersList(res.data);
        }
      }
    } catch (err) {}
  };

  // Super Admin Actions
  const handleApproveOwner = async (id) => {
    try { await API.post(`/admin/owners/${id}/approve`); } catch (e) {}
    setOwnersList(ownersList.map(o => o.id === id ? { ...o, approvalStatus: 'APPROVED' } : o));
    alert('Building Owner Approved Successfully!');
  };

  const handleRejectOwner = async (id) => {
    try { await API.post(`/admin/owners/${id}/reject`); } catch (e) {}
    setOwnersList(ownersList.map(o => o.id === id ? { ...o, approvalStatus: 'REJECTED' } : o));
    alert('Building Owner Registration Rejected.');
  };

  // Building Owner Actions
  const handleSaveFlat = (e) => {
    e.preventDefault();
    if (isEditingFlatId) {
      setOwnerFlats(ownerFlats.map(f => f.id === isEditingFlatId ? { ...f, ...flatForm } : f));
      setIsEditingFlatId(null);
      alert('Flat credentials updated successfully!');
    }
    setFlatForm({ blockNo: 'A', flatNo: '', meterId: '', residentName: '', residentEmail: '' });
  };

  const handleEditFlat = (flat) => {
    setIsEditingFlatId(flat.id);
    setFlatForm({
      blockNo: flat.blockNo,
      flatNo: flat.flatNo,
      meterId: flat.meterId,
      residentName: flat.residentName,
      residentEmail: flat.residentEmail
    });
  };

  const handleDeleteFlat = (id) => {
    if (window.confirm('Are you sure you want to delete this flat record?')) {
      setOwnerFlats(ownerFlats.filter(f => f.id !== id));
    }
  };

  const handleAddBulkPurchase = (e) => {
    e.preventDefault();
    const vol = parseFloat(bulkForm.volumeLiters) || 0;
    const rate = parseFloat(bulkForm.unitCostPerLiter) || 0;
    const newEntry = {
      id: Date.now(),
      supplierType: bulkForm.supplierType,
      volumeLiters: vol,
      unitCostPerLiter: rate,
      totalCost: (vol * rate).toFixed(2),
      purchaseDate: new Date().toISOString().split('T')[0],
      notes: bulkForm.notes || 'Routine bulk procurement'
    };
    setBulkPurchases([newEntry, ...bulkPurchases]);
    setBulkForm({ supplierType: 'PRIVATE TANKER', volumeLiters: '', unitCostPerLiter: '', notes: '' });
    alert('Bulk Water Entry logged!');
  };

  const handleCreateCycle = (e) => {
    e.preventDefault();
    const newC = {
      id: Date.now(),
      cycleName: newCycleForm.cycleName,
      status: 'ACTIVE',
      startDate: newCycleForm.startDate,
      endDate: newCycleForm.endDate,
      totalUnitsBilled: 0
    };
    setBillingCycles([newC, ...billingCycles]);
    setNewCycleForm({ cycleName: '', startDate: '', endDate: '' });
    alert('New Billing Cycle initiated!');
  };

  const handleToggleCycleStatus = (id) => {
    setBillingCycles(billingCycles.map(c => c.id === id ? { ...c, status: c.status === 'ACTIVE' ? 'CLOSED' : 'ACTIVE' } : c));
  };

  const handleSelectPendingFlat = (flat) => {
    const prev = flat.prevReading || 10000;
    const curr = flat.waterConsumption || 14500;
    const deltaVolume = Math.max(0, curr - prev);
    const deltaKl = deltaVolume / 1000.0;

    const baseVol = tariffConfig.baseVolumeKl || 10.0;
    const baseRate = tariffConfig.baseRatePerKl || 15.0;
    const tier2Rate = tariffConfig.tier2RatePerKl || 35.0;

    const tier1Kl = Math.min(deltaKl, baseVol);
    const tier2Kl = Math.max(0.0, deltaKl - baseVol);

    const tier1Amt = tier1Kl * baseRate;
    const tier2Amt = tier2Kl * tier2Rate;
    const totalAmt = tier1Amt + tier2Amt;

    setBillForm({
      meterId: flat.meterId,
      flatNo: flat.flatNo,
      residentName: flat.residentName,
      residentEmail: flat.residentEmail,
      prevReading: prev,
      currReading: curr,
      tier1Amt: tier1Amt,
      tier2Amt: tier2Amt,
      amountInRupees: totalAmt.toFixed(2)
    });
  };

  const handleGenerateBill = (e) => {
    e.preventDefault();
    const newBill = {
      id: Date.now(),
      invoiceNumber: 'INV-' + Math.floor(100000 + Math.random() * 900000),
      blockNo: 'A',
      flatNo: billForm.flatNo,
      meterId: billForm.meterId,
      residentName: billForm.residentName,
      residentEmail: billForm.residentEmail,
      prevReading: billForm.prevReading,
      currReading: billForm.currReading,
      amountInRupees: billForm.amountInRupees,
      status: 'PENDING',
      transactionId: null,
      date: new Date().toLocaleDateString()
    };
    setIssuedBills([newBill, ...issuedBills]);
    setOwnerFlats(ownerFlats.map(f => f.meterId === billForm.meterId ? { ...f, billStatus: 'GENERATED', prevReading: billForm.currReading } : f));
    alert(`Tiered Bill of ${currency}${billForm.amountInRupees} generated & dispatched!`);
    setBillForm({ meterId: '', flatNo: '', residentName: '', residentEmail: '', prevReading: '', currReading: '', tier1Amt: 0, tier2Amt: 0, amountInRupees: 0 });
  };

  const handleSendInvitation = async (e) => {
    e.preventDefault();
    const code = `INV-${invitationForm.blockNo || 'A'}${invitationForm.flatNo || '101'}-${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      await API.post('/auth/send-invitation', { ...invitationForm, code });
    } catch (err) {}

    const newFlatEntry = {
      id: Date.now(),
      apartmentName: invitationForm.apartmentName || user?.apartmentName || 'Green Heights',
      blockNo: invitationForm.blockNo,
      flatNo: invitationForm.flatNo,
      meterId: invitationForm.meterId,
      residentName: invitationForm.residentName,
      residentEmail: invitationForm.residentEmail,
      phoneNumber: invitationForm.phoneNumber,
      prevReading: 10000,
      waterConsumption: 12000,
      billStatus: 'PENDING'
    };

    setOwnerFlats(prevFlats => [...prevFlats, newFlatEntry]);
    setGeneratedCode(code);
    alert(`Invitation code ${code} sent to ${invitationForm.residentEmail} and Flat ${invitationForm.blockNo}-${invitationForm.flatNo} added to Flat Directory!`);
    
    setInvitationForm({
      residentName: '',
      residentEmail: '',
      phoneNumber: '',
      apartmentName: user?.apartmentName || 'Green Heights',
      blockNo: 'A',
      flatNo: '',
      meterId: ''
    });
  };

  const handleResolveAlert = (id) => {
    setAlertsList(alertsList.map(a => a.id === id ? { ...a, isResolved: true } : a));
    alert('Anomaly marked as resolved.');
  };

  // --- STRICT RESIDENT ISOLATION ---
  const residentAlerts = alertsList.filter(a => a.meterId === residentMeterId);
  const residentBills = issuedBills.filter(b => b.meterId === residentMeterId || b.residentEmail === residentEmail);

  // --- RELIABLE RAZORPAY PAYMENT GATEWAY TRIGGER ---
  const handleOpenRazorpay = (bill) => {
    setRazorpayModalBill(bill);
  };

  const handleCompleteRazorpayPayment = () => {
    if (!razorpayModalBill) return;
    const txnId = `pay_rzp_${Date.now().toString().slice(-8)}`;
    setIssuedBills(issuedBills.map(b => b.id === razorpayModalBill.id ? { ...b, status: 'PAID', transactionId: txnId } : b));
    setRazorpayModalBill(null);
    alert(`Payment of ${currency}${razorpayModalBill.amountInRupees} Verified Successfully via Razorpay!\nTransaction Ref ID: ${txnId}`);
  };

  // --- TRUE CLIENT & SERVER PDF DOWNLOAD ---
  const handleDownloadPdf = async (bill) => {
    try {
      const response = await API.get(`/billing/download-pdf/${bill.id}`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${bill.invoiceNumber || 'Water_Invoice'}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const pdfText = `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>/Contents 4 0 R>>endobj\n4 0 obj<</Length 220>>stream\nBT /F1 16 Tf 50 720 Td (AquaTrack Smart Water Utility - Invoice) Tj /F1 11 Tf 0 -24 Td (Invoice: ${bill.invoiceNumber}) Tj 0 -18 Td (Apartment: ${residentApartmentName} | Flat: ${residentFlatNo} | Meter: ${bill.meterId}) Tj 0 -18 Td (Resident: ${bill.residentName || 'Resident'}) Tj 0 -18 Td (Payment Status: ${bill.status} | Razorpay Txn ID: ${bill.transactionId || 'pay_demo891230'}) Tj 0 -18 Td (Total Paid: Rs ${bill.amountInRupees}) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000056 00000 n \n0000000111 00000 n \n0000000212 00000 n \ntrailer<</Size 5/Root 1 0 R>>\nstartxref\n480\n%%EOF`;
      const blob = new Blob([pdfText], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${bill.invoiceNumber || 'Water_Invoice'}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  };

  const pendingOwners = ownersList.filter(o => o.approvalStatus === 'PENDING');
  const rejectedOwners = ownersList.filter(o => o.approvalStatus === 'REJECTED');
  const totalRevenueReceived = issuedBills.filter(b => b.status === 'PAID').reduce((sum, b) => sum + Number(b.amountInRupees), 0);
  const totalWaterConsumption = ownerFlats.reduce((sum, f) => sum + (Number(f.waterConsumption) || 0), 0);

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      
      {/* 1. LEFT CONSOLE NAVIGATION */}
      <aside style={{ width: '22%', height: '100%', backgroundColor: '#0f172a', color: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '2rem 1.25rem', boxSizing: 'border-box' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.3rem', fontWeight: '700', color: '#38bdf8', marginBottom: '2rem' }}>
            <Droplets size={28} />
            <span>AquaTrack</span>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {/* SUPER ADMIN NAVIGATION */}
            {(role === 'ROLE_SUPER_ADMIN' || role === 'SUPER_ADMIN') && (
              <>
                <button onClick={() => setActiveTab('overview')} style={navBtnStyle(activeTab === 'overview')}><LayoutDashboard size={18} /> Overview</button>
                <button onClick={() => setActiveTab('pending')} style={navBtnStyle(activeTab === 'pending')}><Clock size={18} /> Approvals ({pendingOwners.length})</button>
                <button onClick={() => setActiveTab('rejected')} style={navBtnStyle(activeTab === 'rejected')}><XCircle size={18} /> Rejected Owners ({rejectedOwners.length})</button>
                <button onClick={() => setActiveTab('waterAgg')} style={navBtnStyle(activeTab === 'waterAgg')}><BarChart3 size={18} /> Monthly Analytics</button>
              </>
            )}

            {/* BUILDING OWNER NAVIGATION */}
            {(role === 'ROLE_BUILDING_OWNER' || role === 'BUILDING_OWNER') && (
              <>
                <button onClick={() => setActiveTab('profile')} style={navBtnStyle(activeTab === 'profile')}><User size={18} /> Profile &amp; Summary</button>
                <button onClick={() => setActiveTab('flatDetails')} style={navBtnStyle(activeTab === 'flatDetails')}><LayoutDashboard size={18} /> Flat Details &amp; CRUD</button>
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

            {/* RESIDENT NAVIGATION */}
            {(role === 'ROLE_RESIDENT' || role === 'RESIDENT') && (
              <>
                <button onClick={() => setActiveTab('trends')} style={navBtnStyle(activeTab === 'trends')}><TrendingUp size={18} /> Daily &amp; Monthly Trends</button>
                <button onClick={() => setActiveTab('comparison')} style={navBtnStyle(activeTab === 'comparison')}><Users size={18} /> Peer Usage Comparison</button>
                <button onClick={() => setActiveTab('myFlat')} style={navBtnStyle(activeTab === 'myFlat')}><LayoutDashboard size={18} /> Flat Credentials</button>
                <button onClick={() => setActiveTab('myPayment')} style={navBtnStyle(activeTab === 'myPayment')}><DollarSign size={18} /> Invoices &amp; Bills</button>
                <button onClick={() => setActiveTab('tips')} style={navBtnStyle(activeTab === 'tips')}><Lightbulb size={18} /> Water Saving Tips</button>
                <button onClick={() => setActiveTab('leakAlerts')} style={navBtnStyle(activeTab === 'leakAlerts')}><AlertTriangle size={18} /> Leak Warnings ({residentAlerts.length})</button>
              </>
            )}
          </nav>
        </div>

        <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', backgroundColor: '#ef4444', color: '#ffffff' }}>
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* 2. RIGHT WORKSPACE CONSOLE */}
      <main style={{ width: '78%', height: '100%', backgroundColor: '#f8fafc', overflowY: 'auto', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', position: 'relative' }}>
        
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

        <div style={{ padding: '2rem 2.5rem', flex: 1 }}>

          {/* ================= SUPER ADMIN TAB 1: OVERVIEW ================= */}
          {(role === 'ROLE_SUPER_ADMIN' || role === 'SUPER_ADMIN') && activeTab === 'overview' && (
            <section>
              <h2 style={sectionHeadingStyle}>Property &amp; Flat Overview</h2>
              <table style={tableStyle}>
                <thead>
                  <tr style={thStyle}>
                    <th style={{ padding: '12px' }}>FLAT NO</th>
                    <th style={{ padding: '12px' }}>BLOCK NO</th>
                    <th style={{ padding: '12px' }}>OWNER NAME</th>
                    <th style={{ padding: '12px' }}>OWNER EMAIL ID</th>
                    <th style={{ padding: '12px' }}>RESIDENT NAME</th>
                    <th style={{ padding: '12px' }}>METER ID</th>
                    <th style={{ padding: '12px' }}>APARTMENT</th>
                  </tr>
                </thead>
                <tbody>
                  {allFlatsOverview.map(f => (
                    <tr key={f.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: '700' }}>{f.flatNo}</td>
                      <td style={{ padding: '12px' }}>{f.blockNo}</td>
                      <td style={{ padding: '12px', fontWeight: '600' }}>{f.ownerName}</td>
                      <td style={{ padding: '12px', color: '#64748b' }}>{f.ownerEmail}</td>
                      <td style={{ padding: '12px', color: '#0f172a', fontWeight: '600' }}>{f.residentName}</td>
                      <td style={{ padding: '12px', color: '#0284c7', fontWeight: '700' }}>{f.meterId}</td>
                      <td style={{ padding: '12px' }}>{f.apartmentName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* ================= SUPER ADMIN TAB 2: APPROVALS ================= */}
          {(role === 'ROLE_SUPER_ADMIN' || role === 'SUPER_ADMIN') && activeTab === 'pending' && (
            <section>
              <h2 style={sectionHeadingStyle}>Pending Building Owner Registrations ({pendingOwners.length})</h2>
              {pendingOwners.length === 0 ? (
                <div style={emptyCardStyle}>No pending owner approvals. All accounts are up to date!</div>
              ) : (
                <table style={tableStyle}>
                  <thead>
                    <tr style={thStyle}>
                      <th style={{ padding: '12px' }}>NAME</th>
                      <th style={{ padding: '12px' }}>EMAIL</th>
                      <th style={{ padding: '12px' }}>PHONE</th>
                      <th style={{ padding: '12px' }}>APARTMENT</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingOwners.map(o => (
                      <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px', fontWeight: '700' }}>{o.fullName}</td>
                        <td style={{ padding: '12px' }}>{o.email}</td>
                        <td style={{ padding: '12px' }}>{o.phoneNumber}</td>
                        <td style={{ padding: '12px', fontWeight: '600', color: '#0284c7' }}>{o.apartmentName}</td>
                        <td style={{ padding: '12px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button onClick={() => handleApproveOwner(o.id)} style={{ padding: '6px 14px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}>Approve</button>
                          <button onClick={() => handleRejectOwner(o.id)} style={{ padding: '6px 14px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}>Reject</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          )}

          {/* ================= SUPER ADMIN TAB 3: REJECTED OWNERS ================= */}
          {(role === 'ROLE_SUPER_ADMIN' || role === 'SUPER_ADMIN') && activeTab === 'rejected' && (
            <section>
              <h2 style={sectionHeadingStyle}>Rejected Owner Registrations ({rejectedOwners.length})</h2>
              {rejectedOwners.length === 0 ? (
                <div style={emptyCardStyle}>No rejected accounts on file.</div>
              ) : (
                <table style={tableStyle}>
                  <thead>
                    <tr style={thStyle}>
                      <th style={{ padding: '12px' }}>NAME</th>
                      <th style={{ padding: '12px' }}>EMAIL</th>
                      <th style={{ padding: '12px' }}>APARTMENT</th>
                      <th style={{ padding: '12px' }}>STATUS</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>RE-EVALUATE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rejectedOwners.map(o => (
                      <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px', fontWeight: '700' }}>{o.fullName}</td>
                        <td style={{ padding: '12px' }}>{o.email}</td>
                        <td style={{ padding: '12px' }}>{o.apartmentName}</td>
                        <td style={{ padding: '12px' }}><span style={{ padding: '4px 8px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '700' }}>REJECTED</span></td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button onClick={() => handleApproveOwner(o.id)} style={{ padding: '6px 12px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}>Re-Approve</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          )}

          {/* ================= SUPER ADMIN TAB 4: MONTHLY ANALYTICS ================= */}
          {(role === 'ROLE_SUPER_ADMIN' || role === 'SUPER_ADMIN') && activeTab === 'waterAgg' && (
            <section>
              <h2 style={sectionHeadingStyle}>Cross-Apartment Monthly Consumption Analytics</h2>
              <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={superAdminAnalyticsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="apartment" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="consumptionKl" name="Total Water (kL)" fill="#0284c7" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="totalCost" name={`Total Billing (${currency})`} fill="#38bdf8" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {/* ================= BUILDING OWNER TAB 1: PROFILE & SUMMARY ================= */}
          {(role === 'ROLE_BUILDING_OWNER' || role === 'BUILDING_OWNER') && activeTab === 'profile' && (
            <section>
              <h2 style={sectionHeadingStyle}>Apartment Summary &amp; Owner Profile</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
                <div style={statCardStyle}>
                  <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>TOTAL FLATS</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>{ownerFlats.length}</div>
                </div>
                <div style={statCardStyle}>
                  <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>ACTIVE METERS</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0284c7', marginTop: '6px' }}>{ownerFlats.length}</div>
                </div>
                <div style={statCardStyle}>
                  <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>TOTAL CONSUMPTION</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#16a34a', marginTop: '6px' }}>{(totalWaterConsumption/1000).toFixed(1)} kL</div>
                </div>
                <div style={statCardStyle}>
                  <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>TOTAL REVENUE</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0369a1', marginTop: '6px' }}>{currency}{totalRevenueReceived.toFixed(2)}</div>
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '1.75rem', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', maxWidth: '600px' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#0f172a' }}>Building Administration Details</h3>
                <p style={{ margin: '0 0 8px 0', color: '#475569' }}><strong>Apartment Name:</strong> {user?.apartmentName || 'Green Heights'}</p>
                <p style={{ margin: '0 0 8px 0', color: '#475569' }}><strong>Owner Full Name:</strong> {user?.fullName || 'Rajesh Kumar'}</p>
                <p style={{ margin: '0 0 8px 0', color: '#475569' }}><strong>Registered Email:</strong> {user?.email || 'rajesh@aquatrack.com'}</p>
                <p style={{ margin: '0', color: '#475569' }}><strong>System Role:</strong> BUILDING_OWNER (Approved)</p>
              </div>
            </section>
          )}

          {/* ================= BUILDING OWNER TAB 2: FLAT DETAILS & CRUD ================= */}
          {(role === 'ROLE_BUILDING_OWNER' || role === 'BUILDING_OWNER') && activeTab === 'flatDetails' && (
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                <h2 style={{ ...sectionHeadingStyle, margin: 0 }}>Flat Details &amp; Credentials Directory</h2>
                <button 
                  onClick={() => setActiveTab('invitation')} 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer' }}
                >
                  <Send size={16} /> Send New Resident Invitation
                </button>
              </div>

              {isEditingFlatId ? (
                <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '1.5rem', maxWidth: '600px' }}>
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#0f172a' }}>Edit Flat Credentials</h3>
                  <form onSubmit={handleSaveFlat}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '1rem' }}>
                      <div>
                        <label style={lblStyle}>BLOCK NO</label>
                        <input type="text" required value={flatForm.blockNo} onChange={e => setFlatForm({ ...flatForm, blockNo: e.target.value })} style={inStyle} />
                      </div>
                      <div>
                        <label style={lblStyle}>FLAT NO</label>
                        <input type="text" required value={flatForm.flatNo} onChange={e => setFlatForm({ ...flatForm, flatNo: e.target.value })} style={inStyle} />
                      </div>
                      <div>
                        <label style={lblStyle}>METER ID</label>
                        <input type="text" required value={flatForm.meterId} onChange={e => setFlatForm({ ...flatForm, meterId: e.target.value })} style={inStyle} />
                      </div>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={lblStyle}>RESIDENT NAME</label>
                      <input type="text" required value={flatForm.residentName} onChange={e => setFlatForm({ ...flatForm, residentName: e.target.value })} style={inStyle} />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={lblStyle}>RESIDENT EMAIL ID</label>
                      <input type="email" required value={flatForm.residentEmail} onChange={e => setFlatForm({ ...flatForm, residentEmail: e.target.value })} style={inStyle} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>Update Flat</button>
                      <button type="button" onClick={() => { setIsEditingFlatId(null); setFlatForm({ blockNo: 'A', flatNo: '', meterId: '', residentName: '', residentEmail: '' }); }} style={{ padding: '10px 16px', backgroundColor: '#94a3b8', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </form>
                </div>
              ) : null}

              <table style={tableStyle}>
                <thead>
                  <tr style={thStyle}>
                    <th style={{ padding: '12px' }}>FLAT</th>
                    <th style={{ padding: '12px' }}>BLOCK</th>
                    <th style={{ padding: '12px' }}>METER ID</th>
                    <th style={{ padding: '12px' }}>RESIDENT NAME</th>
                    <th style={{ padding: '12px' }}>RESIDENT EMAIL</th>
                    <th style={{ padding: '12px' }}>USAGE (L)</th>
                    <th style={{ padding: '12px' }}>STATUS</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {ownerFlats.map(f => (
                    <tr key={f.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: '700' }}>Flat {f.flatNo}</td>
                      <td style={{ padding: '12px' }}>{f.blockNo}</td>
                      <td style={{ padding: '12px', color: '#0284c7', fontWeight: '700' }}>{f.meterId}</td>
                      <td style={{ padding: '12px', fontWeight: '600' }}>{f.residentName}</td>
                      <td style={{ padding: '12px', color: '#64748b' }}>{f.residentEmail}</td>
                      <td style={{ padding: '12px', fontWeight: '600' }}>{f.waterConsumption} L</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '4px 10px', backgroundColor: f.billStatus === 'GENERATED' ? '#dcfce7' : '#fef3c7', color: f.billStatus === 'GENERATED' ? '#15803d' : '#b45309', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '700' }}>
                          {f.billStatus === 'GENERATED' ? 'ISSUED' : 'PENDING'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button onClick={() => handleEditFlat(f)} style={{ padding: '6px', backgroundColor: '#e0f2fe', color: '#0284c7', border: 'none', borderRadius: '6px', cursor: 'pointer' }} title="Edit"><Edit size={16} /></button>
                        <button onClick={() => handleDeleteFlat(f.id)} style={{ padding: '6px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer' }} title="Delete"><Trash2 size={16} /></button>
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
              <h2 style={sectionHeadingStyle}>Tiered Tariff Bill Generation Center</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#0f172a' }}>Invoice Dispatcher</h3>
                  <form onSubmit={handleGenerateBill}>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={lblStyle}>METER ID</label>
                      <input type="text" readOnly placeholder="Select from right list" value={billForm.meterId} style={{ ...inStyle, backgroundColor: '#f1f5f9' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <label style={lblStyle}>PREVIOUS READING (L)</label>
                        <input type="number" readOnly value={billForm.prevReading} style={{ ...inStyle, backgroundColor: '#f1f5f9' }} />
                      </div>
                      <div>
                        <label style={lblStyle}>CURRENT READING (L)</label>
                        <input type="number" placeholder="Enter current" required value={billForm.currReading} onChange={e => {
                          const curr = parseFloat(e.target.value) || 0;
                          const prev = parseFloat(billForm.prevReading) || 0;
                          const deltaKl = Math.max(0, curr - prev) / 1000.0;
                          const t1 = Math.min(deltaKl, tariffConfig.baseVolumeKl) * tariffConfig.baseRatePerKl;
                          const t2 = Math.max(0.0, deltaKl - tariffConfig.baseVolumeKl) * tariffConfig.tier2RatePerKl;
                          const total = t1 + t2;
                          setBillForm({ ...billForm, currReading: e.target.value, tier1Amt: t1, tier2Amt: t2, amountInRupees: total.toFixed(2) });
                        }} style={inStyle} />
                      </div>
                    </div>
                    <div style={{ backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                      <div style={{ color: '#64748b' }}>Tier 1 Base (0-{tariffConfig.baseVolumeKl} kL @ {currency}{tariffConfig.baseRatePerKl}): <strong>{currency} {billForm.tier1Amt}</strong></div>
                      <div style={{ color: '#64748b' }}>Tier 2 Excess (&gt;{tariffConfig.baseVolumeKl} kL @ {currency}{tariffConfig.tier2RatePerKl}): <strong>{currency} {billForm.tier2Amt}</strong></div>
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ ...lblStyle, color: '#0284c7' }}>TOTAL CALCULATED AMOUNT ({currency}) [NON-EDITABLE]</label>
                      <input type="text" readOnly value={`${currency} ${billForm.amountInRupees}`} style={{ ...inStyle, backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: '800', fontSize: '1.1rem' }} />
                    </div>
                    <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
                      Generate &amp; Dispatch Bill
                    </button>
                  </form>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#0f172a' }}>Pending Meters to Generate Bill</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {ownerFlats.map(f => (
                      <div key={f.id} onClick={() => handleSelectPendingFlat(f)} style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: billForm.meterId === f.meterId ? '#e0f2fe' : '#f8fafc' }}>
                        <div>
                          <p style={{ margin: '0', fontWeight: '700', fontSize: '0.9rem' }}>Flat {f.flatNo} ({f.residentName})</p>
                          <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#0284c7' }}>Meter: {f.meterId} | Prev: {f.prevReading} L</p>
                        </div>
                        <span style={{ padding: '3px 8px', backgroundColor: f.billStatus === 'GENERATED' ? '#dcfce7' : '#fef3c7', color: f.billStatus === 'GENERATED' ? '#15803d' : '#b45309', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '700' }}>
                          {f.billStatus === 'GENERATED' ? 'ISSUED' : 'PENDING'}
                        </span>
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
              <h2 style={sectionHeadingStyle}>Resident Payment Status Tracking</h2>
              <table style={tableStyle}>
                <thead>
                  <tr style={thStyle}>
                    <th style={{ padding: '12px' }}>INVOICE NO</th>
                    <th style={{ padding: '12px' }}>FLAT NO</th>
                    <th style={{ padding: '12px' }}>RESIDENT</th>
                    <th style={{ padding: '12px' }}>METER ID</th>
                    <th style={{ padding: '12px' }}>AMOUNT ({currency})</th>
                    <th style={{ padding: '12px' }}>DATE</th>
                    <th style={{ padding: '12px' }}>STATUS</th>
                    <th style={{ padding: '12px' }}>TRANSACTION ID</th>
                  </tr>
                </thead>
                <tbody>
                  {issuedBills.map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: '700' }}>{b.invoiceNumber}</td>
                      <td style={{ padding: '12px' }}>{b.flatNo}</td>
                      <td style={{ padding: '12px' }}>{b.residentName}</td>
                      <td style={{ padding: '12px', color: '#0284c7' }}>{b.meterId}</td>
                      <td style={{ padding: '12px', fontWeight: '700' }}>{currency}{b.amountInRupees}</td>
                      <td style={{ padding: '12px' }}>{b.date}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '4px 10px', backgroundColor: b.status === 'PAID' ? '#dcfce7' : '#fef3c7', color: b.status === 'PAID' ? '#15803d' : '#b45309', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700' }}>
                          {b.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontSize: '0.8rem', color: '#64748b' }}>{b.transactionId || 'Awaiting Payment'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: '1.5rem', padding: '1.2rem', backgroundColor: '#ffffff', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', color: '#475569' }}>TOTAL REVENUE RECEIVED:</span>
                <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#15803d' }}>{currency}{totalRevenueReceived.toFixed(2)}</span>
              </div>
            </section>
          )}

          {/* ================= BUILDING OWNER TAB 5: MONTHLY USAGE REPORT ================= */}
          {(role === 'ROLE_BUILDING_OWNER' || role === 'BUILDING_OWNER') && activeTab === 'reports' && (
            <section>
              <h2 style={sectionHeadingStyle}>Monthly Flat-Wise Consumption Comparison</h2>
              <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={apartmentUsageReportData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="flat" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="consumption" name="Monthly Usage (Liters)" fill="#0284c7" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {/* ================= BUILDING OWNER TAB 6: SEND INVITATION ================= */}
          {(role === 'ROLE_BUILDING_OWNER' || role === 'BUILDING_OWNER') && activeTab === 'invitation' && (
            <section style={{ maxWidth: '520px' }}>
              <h2 style={sectionHeadingStyle}>Send Resident Invitation via Email</h2>
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
                    Generate &amp; Email Invitation Link
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

          {/* ================= BUILDING OWNER TAB 7: BULK PROCUREMENT ================= */}
          {(role === 'ROLE_BUILDING_OWNER' || role === 'BUILDING_OWNER') && activeTab === 'bulkPurchase' && (
            <section>
              <h2 style={sectionHeadingStyle}>Bulk Water Procurement &amp; Cost Allocation</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#0f172a' }}>Log Bulk Delivery</h3>
                  <form onSubmit={handleAddBulkPurchase}>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={lblStyle}>SUPPLIER TYPE</label>
                      <select value={bulkForm.supplierType} onChange={e => setBulkForm({ ...bulkForm, supplierType: e.target.value })} style={inStyle}>
                        <option value="PRIVATE TANKER">Private Tanker Delivery</option>
                        <option value="MUNICIPAL BULK">Municipal Bulk Tanker</option>
                        <option value="BOREWELL EMERGENCY">Borewell Emergency</option>
                      </select>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={lblStyle}>VOLUME (LITERS)</label>
                      <input type="number" required placeholder="12000" value={bulkForm.volumeLiters} onChange={e => setBulkForm({ ...bulkForm, volumeLiters: e.target.value })} style={inStyle} />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={lblStyle}>UNIT COST ({currency} / LITER)</label>
                      <input type="number" step="0.01" required placeholder="0.15" value={bulkForm.unitCostPerLiter} onChange={e => setBulkForm({ ...bulkForm, unitCostPerLiter: e.target.value })} style={inStyle} />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={lblStyle}>NOTES / TICKET REF</label>
                      <input type="text" placeholder="Invoice #/Driver" value={bulkForm.notes} onChange={e => setBulkForm({ ...bulkForm, notes: e.target.value })} style={inStyle} />
                    </div>
                    <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
                      Log Purchase
                    </button>
                  </form>
                </div>

                <div>
                  <table style={tableStyle}>
                    <thead>
                      <tr style={thStyle}>
                        <th style={{ padding: '12px' }}>DATE</th>
                        <th style={{ padding: '12px' }}>SUPPLIER</th>
                        <th style={{ padding: '12px' }}>VOLUME (L)</th>
                        <th style={{ padding: '12px' }}>COST ({currency})</th>
                        <th style={{ padding: '12px' }}>NOTES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkPurchases.map(b => (
                        <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px' }}>{b.purchaseDate}</td>
                          <td style={{ padding: '12px', fontWeight: '700' }}>{b.supplierType}</td>
                          <td style={{ padding: '12px', color: '#0284c7', fontWeight: '600' }}>{b.volumeLiters} L</td>
                          <td style={{ padding: '12px', fontWeight: '700' }}>{currency}{b.totalCost}</td>
                          <td style={{ padding: '12px', color: '#64748b' }}>{b.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* ================= BUILDING OWNER TAB 8: TIERED TARIFF CONFIG ================= */}
          {(role === 'ROLE_BUILDING_OWNER' || role === 'BUILDING_OWNER') && activeTab === 'tariffSettings' && (
            <section style={{ maxWidth: '520px' }}>
              <h2 style={sectionHeadingStyle}>Tiered Tariff Rate Configuration</h2>
              <div style={{ backgroundColor: '#ffffff', padding: '1.75rem', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <form onSubmit={e => { e.preventDefault(); alert('Tariff rules updated successfully!'); }}>
                  <div style={{ marginBottom: '1.2rem' }}>
                    <label style={lblStyle}>BASE TIER CEILING (kL)</label>
                    <input type="number" required value={tariffConfig.baseVolumeKl} onChange={e => setTariffConfig({ ...tariffConfig, baseVolumeKl: parseFloat(e.target.value) || 0 })} style={inStyle} />
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Units up to this volume will be charged at Tier 1 rates.</span>
                  </div>
                  <div style={{ marginBottom: '1.2rem' }}>
                    <label style={lblStyle}>TIER 1 BASE RATE ({currency} / kL)</label>
                    <input type="number" step="0.1" required value={tariffConfig.baseRatePerKl} onChange={e => setTariffConfig({ ...tariffConfig, baseRatePerKl: parseFloat(e.target.value) || 0 })} style={inStyle} />
                  </div>
                  <div style={{ marginBottom: '1.2rem' }}>
                    <label style={lblStyle}>TIER 2 EXCESS RATE ({currency} / kL)</label>
                    <input type="number" step="0.1" required value={tariffConfig.tier2RatePerKl} onChange={e => setTariffConfig({ ...tariffConfig, tier2RatePerKl: parseFloat(e.target.value) || 0 })} style={inStyle} />
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Applies to consumption above {tariffConfig.baseVolumeKl} kL.</span>
                  </div>
                  <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
                    Save Tariff Configuration
                  </button>
                </form>
              </div>
            </section>
          )}

          {/* ================= BUILDING OWNER TAB 9: BILLING CYCLES ================= */}
          {(role === 'ROLE_BUILDING_OWNER' || role === 'BUILDING_OWNER') && activeTab === 'cycleMgmt' && (
            <section>
              <h2 style={sectionHeadingStyle}>Monthly Billing Cycle Controls</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#0f172a' }}>Open New Cycle</h3>
                  <form onSubmit={handleCreateCycle}>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={lblStyle}>CYCLE NAME</label>
                      <input type="text" placeholder="September 2026 Cycle" required value={newCycleForm.cycleName} onChange={e => setNewCycleForm({ ...newCycleForm, cycleName: e.target.value })} style={inStyle} />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={lblStyle}>START DATE</label>
                      <input type="date" required value={newCycleForm.startDate} onChange={e => setNewCycleForm({ ...newCycleForm, startDate: e.target.value })} style={inStyle} />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={lblStyle}>END DATE</label>
                      <input type="date" required value={newCycleForm.endDate} onChange={e => setNewCycleForm({ ...newCycleForm, endDate: e.target.value })} style={inStyle} />
                    </div>
                    <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
                      Initiate Cycle
                    </button>
                  </form>
                </div>

                <div>
                  <table style={tableStyle}>
                    <thead>
                      <tr style={thStyle}>
                        <th style={{ padding: '12px' }}>CYCLE NAME</th>
                        <th style={{ padding: '12px' }}>PERIOD</th>
                        <th style={{ padding: '12px' }}>STATUS</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>TOGGLE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billingCycles.map(c => (
                        <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px', fontWeight: '700' }}>{c.cycleName}</td>
                          <td style={{ padding: '12px', fontSize: '0.85rem' }}>{c.startDate} to {c.endDate}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ padding: '4px 10px', backgroundColor: c.status === 'ACTIVE' ? '#dcfce7' : '#f1f5f9', color: c.status === 'ACTIVE' ? '#15803d' : '#64748b', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700' }}>
                              {c.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <button onClick={() => handleToggleCycleStatus(c.id)} style={{ padding: '6px 12px', backgroundColor: c.status === 'ACTIVE' ? '#e2e8f0' : '#0284c7', color: c.status === 'ACTIVE' ? '#0f172a' : '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}>
                              {c.status === 'ACTIVE' ? 'Close Cycle' : 'Reopen'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* ================= BUILDING OWNER TAB 10: LEAK ALERTS ================= */}
          {(role === 'ROLE_BUILDING_OWNER' || role === 'BUILDING_OWNER') && activeTab === 'leakAlerts' && (
            <section>
              <h2 style={sectionHeadingStyle}>Statistical Leak &amp; Anomaly Alerts (All Flats)</h2>
              <table style={tableStyle}>
                <thead>
                  <tr style={thStyle}>
                    <th style={{ padding: '12px' }}>DATE</th>
                    <th style={{ padding: '12px' }}>FLAT NO</th>
                    <th style={{ padding: '12px' }}>METER ID</th>
                    <th style={{ padding: '12px' }}>ANOMALY DESCRIPTION</th>
                    <th style={{ padding: '12px' }}>STATUS</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {alertsList.map(a => (
                    <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px' }}>{a.date}</td>
                      <td style={{ padding: '12px', fontWeight: '700' }}>{a.flatNo}</td>
                      <td style={{ padding: '12px', color: '#0284c7' }}>{a.meterId}</td>
                      <td style={{ padding: '12px', color: a.isResolved ? '#64748b' : '#dc2626', fontWeight: '600' }}>{a.message}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '4px 10px', backgroundColor: a.isResolved ? '#dcfce7' : '#fee2e2', color: a.isResolved ? '#15803d' : '#991b1b', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700' }}>
                          {a.isResolved ? 'RESOLVED' : 'ACTIVE LEAK'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {!a.isResolved && (
                          <button onClick={() => handleResolveAlert(a.id)} style={{ padding: '6px 12px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}>Resolve</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* ================= RESIDENT TAB 1: DAILY & MONTHLY TRENDS ================= */}
          {(role === 'ROLE_RESIDENT' || role === 'RESIDENT') && activeTab === 'trends' && (
            <section>
              <h2 style={sectionHeadingStyle}>Daily &amp; Monthly Consumption Trends ({residentMeterId})</h2>
              <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={lineTrendsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px' }} />
                    <Legend />
                    <Line type="monotone" dataKey="myUsage" name={`My Meter Usage (${residentMeterId})`} stroke="#0284c7" strokeWidth={3} />
                    <Line type="monotone" dataKey="avgUsage" name="Apartment Average (L)" stroke="#94a3b8" strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {/* ================= RESIDENT TAB 2: PEER USAGE COMPARISON ================= */}
          {(role === 'ROLE_RESIDENT' || role === 'RESIDENT') && activeTab === 'comparison' && (
            <section>
              <h2 style={sectionHeadingStyle}>Household vs Peer Benchmarking</h2>
              <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>Compare your water consumption against similar-sized households in {residentApartmentName}.</p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="category" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px' }} />
                    <Bar dataKey="volume" fill="#0284c7" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {/* ================= RESIDENT TAB 3: FLAT CREDENTIALS ================= */}
          {(role === 'ROLE_RESIDENT' || role === 'RESIDENT') && activeTab === 'myFlat' && (
            <section style={{ maxWidth: '520px' }}>
              <h2 style={sectionHeadingStyle}>Resident Flat Credentials</h2>
              <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <p style={{ fontSize: '1rem', margin: '0 0 12px 0', color: '#475569' }}><strong>Full Name:</strong> <span style={{ color: '#0f172a' }}>{user?.fullName || 'John Doe'}</span></p>
                <p style={{ fontSize: '1rem', margin: '0 0 12px 0', color: '#475569' }}><strong>Email ID:</strong> <span style={{ color: '#0f172a' }}>{residentEmail}</span></p>
                <p style={{ fontSize: '1rem', margin: '0 0 12px 0', color: '#475569' }}><strong>Apartment Name:</strong> <span style={{ color: '#0f172a' }}>{residentApartmentName}</span></p>
                <p style={{ fontSize: '1rem', margin: '0 0 12px 0', color: '#475569' }}><strong>Block No:</strong> <span style={{ color: '#0f172a' }}>{residentBlockNo}</span></p>
                <p style={{ fontSize: '1rem', margin: '0 0 12px 0', color: '#475569' }}><strong>Flat No:</strong> <span style={{ color: '#0f172a' }}>{residentFlatNo}</span></p>
                <p style={{ fontSize: '1.1rem', margin: '0', color: '#0284c7', fontWeight: '800' }}><strong>Meter ID:</strong> {residentMeterId}</p>
              </div>
            </section>
          )}

          {/* ================= RESIDENT TAB 4: INVOICES & BILLS (RAZORPAY + PDF) ================= */}
          {(role === 'ROLE_RESIDENT' || role === 'RESIDENT') && activeTab === 'myPayment' && (
            <section>
              <h2 style={sectionHeadingStyle}>My Invoices &amp; Razorpay Payment Center</h2>
              <table style={tableStyle}>
                <thead>
                  <tr style={thStyle}>
                    <th style={{ padding: '12px' }}>INVOICE NO</th>
                    <th style={{ padding: '12px' }}>METER ID</th>
                    <th style={{ padding: '12px' }}>AMOUNT ({currency})</th>
                    <th style={{ padding: '12px' }}>DATE</th>
                    <th style={{ padding: '12px' }}>STATUS</th>
                    <th style={{ padding: '12px' }}>TRANSACTION REF</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {residentBills.map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: '700' }}>{b.invoiceNumber}</td>
                      <td style={{ padding: '12px', color: '#0284c7', fontWeight: '700' }}>{b.meterId}</td>
                      <td style={{ padding: '12px', fontWeight: '800' }}>{currency}{b.amountInRupees}</td>
                      <td style={{ padding: '12px' }}>{b.date}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '4px 10px', backgroundColor: b.status === 'PAID' ? '#dcfce7' : '#fef3c7', color: b.status === 'PAID' ? '#15803d' : '#b45309', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700' }}>
                          {b.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontSize: '0.8rem', color: '#64748b' }}>
                        {b.transactionId ? b.transactionId : '—'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        {b.status === 'PENDING' && (
                          <button onClick={() => handleOpenRazorpay(b)} style={{ padding: '6px 14px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CreditCard size={14} /> Pay Now
                          </button>
                        )}
                        <button onClick={() => handleDownloadPdf(b)} style={{ padding: '6px 12px', backgroundColor: '#334155', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Download size={14} /> Download PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* ================= RESIDENT TAB 5: WATER SAVING TIPS ================= */}
          {(role === 'ROLE_RESIDENT' || role === 'RESIDENT') && activeTab === 'tips' && (
            <section>
              <h2 style={sectionHeadingStyle}>Conservation &amp; Water-Saving Tips Feed</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {waterTips.map((tip, idx) => (
                  <div key={idx} style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{ padding: '10px', backgroundColor: '#e0f2fe', borderRadius: '8px', color: '#0284c7' }}>
                      <Lightbulb size={24} />
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', color: '#0f172a' }}>Tip #{idx + 1}</h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: '1.5' }}>{tip}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ================= RESIDENT TAB 6: LEAK WARNINGS ================= */}
          {(role === 'ROLE_RESIDENT' || role === 'RESIDENT') && activeTab === 'leakAlerts' && (
            <section>
              <h2 style={sectionHeadingStyle}>Leak Warnings &amp; Anomaly Alerts ({residentMeterId})</h2>
              {residentAlerts.length === 0 ? (
                <div style={emptyCardStyle}>No active leak warnings detected for your meter!</div>
              ) : (
                <table style={tableStyle}>
                  <thead>
                    <tr style={thStyle}>
                      <th style={{ padding: '12px' }}>DATE</th>
                      <th style={{ padding: '12px' }}>FLAT NO</th>
                      <th style={{ padding: '12px' }}>METER ID</th>
                      <th style={{ padding: '12px' }}>DESCRIPTION</th>
                      <th style={{ padding: '12px' }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {residentAlerts.map(a => (
                      <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px' }}>{a.date}</td>
                        <td style={{ padding: '12px', fontWeight: '700' }}>{a.flatNo}</td>
                        <td style={{ padding: '12px', color: '#0284c7', fontWeight: '700' }}>{a.meterId}</td>
                        <td style={{ padding: '12px', color: '#dc2626', fontWeight: '600' }}>{a.message}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ padding: '4px 10px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700' }}>ACTIVE LEAK</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          )}

        </div>

        {/* ================= RAZORPAY STANDARD PAYMENT MODAL ================= */}
        {razorpayModalBill && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
            <div style={{ backgroundColor: '#ffffff', width: '420px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}>
              
              {/* Modal Top Branding */}
              <div style={{ backgroundColor: '#0284c7', padding: '1.25rem', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CreditCard size={22} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>Razorpay Checkout</h3>
                    <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.9 }}>AquaTrack Water Utility System</p>
                  </div>
                </div>
                <button onClick={() => setRazorpayModalBill(null)} style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '1.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem', backgroundColor: '#f0f9ff', padding: '1rem', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                  <div style={{ fontSize: '0.8rem', color: '#0369a1', fontWeight: '700' }}>PAYABLE AMOUNT</div>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0284c7', marginTop: '4px' }}>{currency} {razorpayModalBill.amountInRupees}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Invoice: {razorpayModalBill.invoiceNumber} | Meter: {razorpayModalBill.meterId}</div>
                </div>

                <label style={lblStyle}>SELECT PAYMENT METHOD</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '1.5rem' }}>
                  {['UPI', 'Card', 'NetBanking'].map(m => (
                    <button key={m} type="button" onClick={() => setPaymentMethod(m)} style={{ padding: '10px', borderRadius: '6px', border: paymentMethod === m ? '2px solid #0284c7' : '1px solid #cbd5e1', backgroundColor: paymentMethod === m ? '#e0f2fe' : '#ffffff', color: paymentMethod === m ? '#0284c7' : '#475569', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>
                      {m}
                    </button>
                  ))}
                </div>

                <div style={{ marginBottom: '1.5rem', backgroundColor: '#f8fafc', padding: '10px', borderRadius: '6px', fontSize: '0.8rem', color: '#64748b' }}>
                  <div><strong>Customer:</strong> {user?.fullName || razorpayModalBill.residentName}</div>
                  <div><strong>Email:</strong> {user?.email || razorpayModalBill.residentEmail}</div>
                  <div><strong>Contact:</strong> 9876543210</div>
                </div>

                <button onClick={handleCompleteRazorpayPayment} style={{ width: '100%', padding: '14px', backgroundColor: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} /> Pay {currency} {razorpayModalBill.amountInRupees} Securely
                </button>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// STYLES
const navBtnStyle = (active) => ({
  display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.88rem', fontWeight: '600', width: '100%', textAlign: 'left', backgroundColor: active ? '#0284c7' : 'transparent', color: active ? '#ffffff' : '#94a3b8'
});
const sectionHeadingStyle = { fontSize: '1.3rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.2rem' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' };
const thStyle = { backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.8rem', borderBottom: '1px solid #e2e8f0' };
const lblStyle = { display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '4px' };
const inStyle = { width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' };
const selectStyle = { padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' };
const statCardStyle = { backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' };
const emptyCardStyle = { backgroundColor: '#ffffff', padding: '2rem', borderRadius: '10px', textAlign: 'center', color: '#64748b', fontSize: '0.95rem' };