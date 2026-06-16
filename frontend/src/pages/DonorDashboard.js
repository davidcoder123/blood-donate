import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getOpenRequests, respondToRequest, getDonorHistory, toggleAvailability } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const urgColor = { critical:'#dc2626', high:'#d97706', normal:'#16a34a' };

export default function DonorDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [history, setHistory]   = useState([]);
  const [avail, setAvail]       = useState(user?.available ?? true);
  const [tab, setTab]           = useState('requests');
  const [loading, setLoading]   = useState(true);
  const [responded, setResponded] = useState({});
  const [showHealthCheck, setShowHealthCheck] = useState(null);
  const [healthAnswers, setHealthAnswers] = useState({
    fever: null, pregnant: null, tattoo: null,
    surgery: null, medication: null
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [r, h] = await Promise.all([getOpenRequests(), getDonorHistory()]);
      setRequests(r.data);
      const alreadyDone = {};
      r.data.forEach(req => {
        const mine = req.responses?.find(
          x => x.donor === user?._id || x.donor?._id === user?._id
        );
        if (mine) alreadyDone[req._id] = mine.status === 'accepted' ? 'accepted' : mine.status === 'donated' ? 'donated' : 'declined';
      });
      setResponded(alreadyDone);
      setHistory(h.data);
    } catch (err) {
      toast.error('Failed to load requests. Please refresh.');
    } finally { setLoading(false); }
  };

  const respond = async (id, accept) => {
    if (!accept) {
      try {
        const res = await respondToRequest(id, false);
        toast.success(res.data.message);
        setResponded(prev => ({ ...prev, [id]: 'declined' }));
        fetchAll();
      } catch (err) {
        toast.error(err.response?.data?.error || 'Error');
      }
      return;
    }
    setHealthAnswers({ fever: null, pregnant: null, tattoo: null, surgery: null, medication: null });
    setShowHealthCheck(id);
  };

  const submitHealthCheck = async () => {
    const allAnswered = Object.values(healthAnswers).every(v => v !== null);
    if (!allAnswered) { toast.error('Please answer all questions.'); return; }

    const anyYes = Object.values(healthAnswers).some(v => v === true);
    if (anyYes) { toast.error('You are not eligible to donate right now.'); setShowHealthCheck(null); return; }

    try {
      const res = await respondToRequest(showHealthCheck, true);
      toast.success(res.data.message);
      setResponded(prev => ({ ...prev, [showHealthCheck]: 'accepted' }));
      setShowHealthCheck(null);
      fetchAll();
    } catch (err) {
      const msg = err.response?.data?.error || 'Error';
      toast.error(msg);
      if (msg.includes('not eligible') || msg === 'You already responded to this request.') {
        setResponded(prev => ({ ...prev, [showHealthCheck]: 'already' }));
      }
      setShowHealthCheck(null);
    }
  };

  const handleAvail = async () => {
    const next = !avail;
    await toggleAvailability(next);
    setAvail(next);
    toast.success(next ? 'You are now available to donate' : 'Marked as unavailable');
  };

  const waLink = (phone, hospitalName, bg) =>
    `https://wa.me/${phone?.replace(/\D/g,'')}?text=${encodeURIComponent(`Hi, I saw the ${bg} blood request at ${hospitalName}. I can donate.`)}`;

  const s = {
    page:    { minHeight:'100vh', background:'#f9fafb' },
    content: { maxWidth:'960px', margin:'0 auto', padding:'24px 16px' },
    topRow:  { display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'12px', marginBottom:'24px' },
    name:    { fontSize:'22px', fontWeight:700, color:'#1f2937' },
    meta:    { fontSize:'13px', color:'#6b7280', marginTop:'3px' },
    availBtn:(a) => ({ background: a?'#16a34a':'#6b7280', color:'white', border:'none', padding:'9px 20px', borderRadius:'999px', cursor:'pointer', fontSize:'13px', fontWeight:700 }),
    tabs:    { display:'flex', gap:'8px', marginBottom:'20px' },
    tab:     (a) => ({ padding:'8px 20px', borderRadius:'999px', border:'none', cursor:'pointer', fontSize:'13px', fontWeight:600, background: a?'#dc2626':'#e5e7eb', color: a?'white':'#374151' }),
    card:    { background:'white', borderRadius:'16px', padding:'20px', marginBottom:'14px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' },
    bg:      { fontSize:'30px', fontWeight:800, color:'#dc2626' },
    hosp:    { fontSize:'15px', fontWeight:700, color:'#1f2937' },
    info:    { fontSize:'12px', color:'#6b7280', marginTop:'3px' },
    urg:     (u) => ({ background: urgColor[u]+'20', color:urgColor[u], fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'999px' }),
    actions: { display:'flex', gap:'8px', marginTop:'14px', flexWrap:'wrap' },
    yes:     { background:'#dc2626', color:'white', border:'none', padding:'8px 18px', borderRadius:'8px', cursor:'pointer', fontSize:'13px', fontWeight:700 },
    no:      { background:'#f3f4f6', color:'#374151', border:'none', padding:'8px 18px', borderRadius:'8px', cursor:'pointer', fontSize:'13px' },
    wa:      { background:'#25D366', color:'white', border:'none', padding:'8px 18px', borderRadius:'8px', cursor:'pointer', fontSize:'13px', fontWeight:700, textDecoration:'none', display:'inline-block' },
    empty:   { textAlign:'center', padding:'60px 20px', color:'#9ca3af', fontSize:'15px' },
    notes:   { background:'#fef9f0', border:'1px solid #fde68a', borderRadius:'8px', padding:'8px 12px', fontSize:'13px', color:'#92400e', marginTop:'8px' },
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(1);
  };

  return (
    <div style={s.page}>
      <Navbar />

      {/* Health Check Popup */}
      {showHealthCheck && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999, padding:'16px' }}>
          <div style={{ background:'white', borderRadius:'20px', padding:'28px', maxWidth:'420px', width:'100%' }}>
            <div style={{ fontSize:'18px', fontWeight:700, color:'#1f2937', marginBottom:'6px' }}>🩺 Quick Health Check</div>
            <div style={{ fontSize:'13px', color:'#6b7280', marginBottom:'20px' }}>Please answer honestly. This ensures donor and patient safety.</div>
            {[
              { key:'fever',      label:'Do you have fever or cold right now?' },
              { key:'pregnant',   label:'Are you pregnant or delivered within 6 months?' },
              { key:'tattoo',     label:'Had a tattoo or piercing within 6 months?' },
              { key:'surgery',    label:'Had surgery within 6 months?' },
              { key:'medication', label:'Currently taking antibiotics or any medication?' },
            ].map(q => (
              <div key={q.key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid #f3f4f6' }}>
                <span style={{ fontSize:'13px', color:'#374151', flex:1, marginRight:'12px' }}>{q.label}</span>
                <div style={{ display:'flex', gap:'8px' }}>
                  <button
                    onClick={() => setHealthAnswers(prev => ({ ...prev, [q.key]: true }))}
                    style={{ padding:'5px 14px', borderRadius:'6px', border:'none', cursor:'pointer', fontSize:'12px', fontWeight:700,
                      background: healthAnswers[q.key] === true ? '#dc2626' : '#f3f4f6',
                      color: healthAnswers[q.key] === true ? 'white' : '#374151' }}>
                    Yes
                  </button>
                  <button
                    onClick={() => setHealthAnswers(prev => ({ ...prev, [q.key]: false }))}
                    style={{ padding:'5px 14px', borderRadius:'6px', border:'none', cursor:'pointer', fontSize:'12px', fontWeight:700,
                      background: healthAnswers[q.key] === false ? '#16a34a' : '#f3f4f6',
                      color: healthAnswers[q.key] === false ? 'white' : '#374151' }}>
                    No
                  </button>
                </div>
              </div>
            ))}
            <div style={{ display:'flex', gap:'10px', marginTop:'20px' }}>
              <button onClick={submitHealthCheck}
                style={{ flex:1, background:'#dc2626', color:'white', border:'none', padding:'11px', borderRadius:'10px', cursor:'pointer', fontSize:'14px', fontWeight:700 }}>
                ✅ Submit & Confirm
              </button>
              <button onClick={() => setShowHealthCheck(null)}
                style={{ background:'#f3f4f6', color:'#374151', border:'none', padding:'11px 18px', borderRadius:'10px', cursor:'pointer', fontSize:'14px' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={s.content}>
        <div style={s.topRow}>
          <div>
            <div style={s.name}>Welcome, {user?.name} 🩸</div>
            <div style={s.meta}>Blood Group: <strong>{user?.bloodGroup}</strong> · {user?.city}</div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'6px' }}>
            <button style={s.availBtn(avail)} onClick={handleAvail}>
              {avail ? '✅ Available to Donate' : '❌ Not Available'}
            </button>
            {user?.eligibilityBlock && new Date() < new Date(user.eligibilityBlock) && (
              <div style={{ fontSize:'12px', color:'#dc2626', fontWeight:600, background:'#fef2f2', padding:'5px 12px', borderRadius:'999px', border:'1px solid #fecaca' }}>
                ⏳ Eligible to donate again after {new Date(user.eligibilityBlock).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}
              </div>
            )}
          </div>
        </div>

        <div style={s.tabs}>
          <button style={s.tab(tab==='requests')} onClick={() => setTab('requests')}>
            Open Requests ({requests.length})
          </button>
          <button style={s.tab(tab==='history')} onClick={() => setTab('history')}>
            My History ({history.length})
          </button>
        </div>

        {loading && <div style={s.empty}>Loading...</div>}

        {!loading && tab === 'requests' && (
          requests.length === 0
            ? <div style={s.empty}>
              {user?.eligibilityBlock && new Date() < new Date(user?.eligibilityBlock)
                ? `🚫 You are not eligible to donate until ${new Date(user?.eligibilityBlock).toLocaleDateString('en-IN')}`
                : '🎉 No open blood requests right now'}
            </div>
            : requests.map(r => (
              <div key={r._id} style={s.card}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'10px'}}>
                  <div style={{display:'flex', gap:'14px', alignItems:'center'}}>
                    <span style={s.bg}>{r.bloodGroup}</span>
                    <div>
                      <div style={s.hosp}>{r.hospital?.hospitalName}</div>
                      <div style={s.info}>📍 {r.hospital?.city} · {r.unitsNeeded} unit{r.unitsNeeded>1?'s':''} needed</div>
                      {r.patientName && <div style={s.info}>Patient: {r.patientName}</div>}
                      {user?.location?.coordinates && r.hospital?.location?.coordinates && (
                        <div style={s.info}>
                          📏 {getDistance(
                            user.location.coordinates[1], user.location.coordinates[0],
                            r.hospital.location.coordinates[1], r.hospital.location.coordinates[0]
                          )} km away
                        </div>
                      )}
                    </div>
                  </div>
                  <span style={s.urg(r.urgency)}>{r.urgency.toUpperCase()}</span>
                </div>

                {r.notes && <div style={s.notes}>📝 {r.notes}</div>}

                <div style={s.actions}>
                  {responded[r._id] ? (
                    <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', alignItems:'center' }}>
                      <div style={{
                        padding: '8px 18px', borderRadius: '8px',
                        background: responded[r._id] === 'accepted' ? '#dcfce7' : responded[r._id] === 'donated' ? '#dbeafe' : responded[r._id] === 'declined' ? '#fee2e2' : '#fef3c7',
                        color: responded[r._id] === 'accepted' ? '#15803d' : responded[r._id] === 'donated' ? '#1d4ed8' : responded[r._id] === 'declined' ? '#b91c1c' : '#92400e',
                        fontSize: '13px', fontWeight: 700
                      }}>
                        {responded[r._id] === 'accepted' ? '✅ Accepted — awaiting hospital confirmation' :
                         responded[r._id] === 'donated'  ? '🩸 Donation confirmed by hospital! Eligible after 90 days' :
                         responded[r._id] === 'declined' ? '❌ You declined this request' : '⚠️ Already responded'}
                      </div>
                    </div>
                  ) : (
                    <>
                      <button style={s.yes} onClick={() => respond(r._id, true)}>✅ I'll Donate</button>
                      <button style={s.no}  onClick={() => respond(r._id, false)}>Decline</button>
                    </>
                  )}
                  <a style={s.wa} href={waLink(r.hospital?.phone, r.hospital?.hospitalName, r.bloodGroup)} target="_blank" rel="noreferrer">
                    💬 WhatsApp Hospital
                  </a>
                </div>
              </div>
            ))
        )}

        {!loading && tab === 'history' && (
          history.length === 0
            ? <div style={s.empty}>No donation history yet</div>
            : history.map(r => {
              const myRes = r.responses?.find(x => x.donor === user?._id || x.donor?._id === user?._id);
              return (
                <div key={r._id} style={s.card}>
                  <div style={{display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:'8px'}}>
                    <div>
                      <div style={s.hosp}>{r.hospital?.hospitalName}</div>
                      <div style={s.info}>{r.bloodGroup} · {r.hospital?.city}</div>
                    </div>
                    <span style={{
                      ...s.urg('normal'),
                      background: myRes?.status==='donated' ? '#dbeafe' : myRes?.status==='accepted' ? '#dcfce7' : '#fee2e2',
                      color:      myRes?.status==='donated' ? '#1d4ed8' : myRes?.status==='accepted' ? '#15803d' : '#b91c1c'
                    }}>
                      {myRes?.status === 'donated' ? 'DONATED ✓' : myRes?.status?.toUpperCase() || 'RESPONDED'}
                    </span>
                  </div>
                  <div style={s.info}>📅 {new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}