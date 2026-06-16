import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
//import { getStats, getPendingHospitals, getAllDonors, approveHospital } from '../services/api';
import { getStats, getPendingHospitals, getAllDonors, approveHospital, getAllRequests, getAllHospitals } from '../services/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats]     = useState({});
  const [pending, setPending] = useState([]);
  const [donors, setDonors]   = useState([]);
  const [requests, setRequests] = useState([]);
  const [allHospitals, setAllHospitals] = useState([]);
  const [tab, setTab]         = useState('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [s, p, d, r, h] = await Promise.all([getStats(), getPendingHospitals(), getAllDonors(), getAllRequests(), getAllHospitals()]);
      setStats(s.data); setPending(p.data); setDonors(d.data); setRequests(r.data); setAllHospitals(h.data);
    } catch {} finally { setLoading(false); }
  };

  const handleApprove = async (id, approve) => {
    try {
      await approveHospital(id, approve ? 'active' : 'rejected');
      toast.success(approve ? '✅ Hospital approved!' : '❌ Hospital rejected');
      fetchAll();
    } catch { toast.error('Action failed'); }
  };

  const s = {
    page:    { minHeight:'100vh', background:'#f9fafb' },
    content: { maxWidth:'1000px', margin:'0 auto', padding:'24px 16px' },
    title:   { fontSize:'22px', fontWeight:700, color:'#1f2937', marginBottom:'20px' },
    stats:   { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:'12px', marginBottom:'28px' },
    stat:    (color) => ({ background:color, borderRadius:'14px', padding:'18px 20px', color:'white' }),
    sNum:    { fontSize:'34px', fontWeight:800 },
    sLbl:    { fontSize:'13px', opacity:0.9, marginTop:'2px' },
    tabs:    { display:'flex', gap:'8px', marginBottom:'20px' },
    tab:     (a) => ({ padding:'8px 20px', borderRadius:'999px', border:'none', cursor:'pointer', fontSize:'13px', fontWeight:600, background: a?'#dc2626':'#e5e7eb', color: a?'white':'#374151' }),
    card:    { background:'white', borderRadius:'14px', padding:'18px 20px', marginBottom:'12px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'12px' },
    name:    { fontSize:'15px', fontWeight:700, color:'#1f2937' },
    info:    { fontSize:'12px', color:'#6b7280', marginTop:'3px' },
    approve: { background:'#16a34a', color:'white', border:'none', padding:'8px 18px', borderRadius:'8px', cursor:'pointer', fontSize:'13px', fontWeight:700 },
    reject:  { background:'#dc2626', color:'white', border:'none', padding:'8px 18px', borderRadius:'8px', cursor:'pointer', fontSize:'13px', fontWeight:700 },
    badge:   (c) => ({ background:c+'20', color:c, fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'999px', display:'inline-block', marginLeft:'6px' }),
    empty:   { textAlign:'center', padding:'60px 20px', color:'#9ca3af', fontSize:'15px' },
  };

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.content}>
        <div style={s.title}>🛡️ Admin Dashboard</div>

        <div style={s.stats}>
          <div style={s.stat('#dc2626')}><div style={s.sNum}>{stats.totalDonors||0}</div><div style={s.sLbl}>Total Donors</div></div>
          <div style={s.stat('#1d4ed8')}><div style={s.sNum}>{stats.activeHospitals||0}</div><div style={s.sLbl}>Active Hospitals</div></div>
          <div style={s.stat('#d97706')}><div style={s.sNum}>{stats.pendingHospitals||0}</div><div style={s.sLbl}>Pending Approval</div></div>
          <div style={s.stat('#16a34a')}><div style={s.sNum}>{stats.openRequests||0}</div><div style={s.sLbl}>Open Requests</div></div>
        </div>

        <div style={s.tabs}>
          <button style={s.tab(tab==='pending')} onClick={() => setTab('pending')}>
            Pending Hospitals {pending.length > 0 && `(${pending.length})`}
          </button>
          <button style={s.tab(tab==='donors')} onClick={() => setTab('donors')}>
            All Donors ({donors.length})
          </button>
          <button style={s.tab(tab==='requests')} onClick={() => setTab('requests')}>
            Blood Requests ({requests.length})
          </button>
          <button style={s.tab(tab==='hospitals')} onClick={() => setTab('hospitals')}>
            All Hospitals ({allHospitals.length})
          </button>
        </div>

        {loading && <div style={s.empty}>Loading...</div>}

        {!loading && tab === 'pending' && (
          pending.length === 0
            ? <div style={s.empty}>✅ No pending hospital approvals</div>
            : pending.map(h => (
              <div key={h._id} style={s.card}>
                <div>
                  <div style={s.name}>🏥 {h.hospitalName}</div>
                  <div style={s.info}>📧 {h.email} · 📞 {h.phone}</div>
                  <div style={s.info}>📍 {h.city}, {h.state} · License: <strong>{h.licenseNumber}</strong></div>
                  <div style={s.info}>Contact: {h.name} · Registered: {new Date(h.createdAt).toLocaleDateString()}</div>
                </div>
                <div style={{display:'flex', gap:'8px'}}>
                  <button style={s.approve} onClick={() => handleApprove(h._id, true)}>✅ Approve</button>
                  <button style={s.reject}  onClick={() => handleApprove(h._id, false)}>❌ Reject</button>
                </div>
              </div>
            ))
        )}

        {!loading && tab === 'donors' && (
          donors.length === 0
            ? <div style={s.empty}>No donors yet</div>
            : donors.map(d => (
              <div key={d._id} style={s.card}>
                <div>
                  <div style={s.name}>
                    {d.name}
                    <span style={s.badge('#dc2626')}>{d.bloodGroup}</span>
                  </div>
                  <div style={s.info}>📧 {d.email} · 📞 {d.phone}</div>
                  <div style={s.info}>📍 {d.city}, {d.state}</div>
                  <div style={s.info}>Registered: {new Date(d.createdAt).toLocaleDateString()}</div>
                </div>
                <span style={s.badge(d.available ? '#16a34a' : '#6b7280')}>
                  {d.available ? 'Available' : 'Not Available'}
                </span>
              </div>
            ))
        )}
        {!loading && tab === 'requests' && (
          requests.length === 0
            ? <div style={s.empty}>No blood requests yet</div>
            : requests.map(r => (
              <div key={r._id} style={s.card}>
                <div>
                  <div style={s.name}>
                    🏥 {r.hospital?.hospitalName}
                    <span style={s.badge('#dc2626')}>{r.bloodGroup}</span>
                    <span style={s.badge(r.status === 'open' ? '#16a34a' : '#6b7280')}>{r.status.toUpperCase()}</span>
                  </div>
                  <div style={s.info}>📍 {r.hospital?.city}, {r.hospital?.state}</div>
                  <div style={s.info}>🩸 {r.unitsNeeded} unit{r.unitsNeeded > 1 ? 's' : ''} needed · {r.urgency} urgency</div>
                  {r.patientName && <div style={s.info}>Patient: {r.patientName}</div>}
                  <div style={s.info}>📅 {new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
                <span style={s.badge(r.urgency === 'critical' ? '#dc2626' : r.urgency === 'urgent' ? '#d97706' : '#16a34a')}>
                  {r.urgency}
                </span>
              </div>
            ))
)}
        {!loading && tab === 'hospitals' && (
          allHospitals.length === 0
            ? <div style={s.empty}>No hospitals yet</div>
            : allHospitals.map(h => (
              <div key={h._id} style={s.card}>
                <div>
                  <div style={s.name}>🏥 {h.hospitalName}</div>
                  <div style={s.info}>📧 {h.email} · 📞 {h.phone}</div>
                  <div style={s.info}>📍 {h.city}, {h.state}</div>
                  <div style={s.info}>License: {h.licenseNumber}</div>
                </div>
                <span style={s.badge(h.status === 'active' ? '#16a34a' : h.status === 'pending' ? '#d97706' : '#dc2626')}>
                  {h.status.toUpperCase()}
                </span>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
