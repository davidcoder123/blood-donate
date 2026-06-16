import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { createRequest, getMyRequests, getResponses, updateReqStatus, confirmDonation } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useSocket } from '../services/useSocket';  

const BG = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
const urgColor = { critical:'#dc2626', high:'#d97706', normal:'#16a34a' };

// Simple WebRTC call modal
function CallModal({ donor, onClose }) {
  const localAudio  = useRef(null);
  const remoteAudio = useRef(null);
  const peer = useRef(null);
  const [status, setStatus] = useState('Connecting...');

  useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localAudio.current.srcObject = stream;
        localAudio.current.muted = true;
        peer.current = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
        stream.getTracks().forEach(t => peer.current.addTrack(t, stream));
        peer.current.ontrack = e => { remoteAudio.current.srcObject = e.streams[0]; };
        peer.current.oniceconnectionstatechange = () => setStatus(peer.current.iceConnectionState);
        setStatus('Calling...');
      } catch { toast.error('Microphone access denied'); onClose(); }
    })();
    return () => { peer.current?.close(); localAudio.current?.srcObject?.getTracks().forEach(t=>t.stop()); };
  }, []);

  const s = {
    overlay:{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999 },
    modal:  { background:'white', borderRadius:'20px', padding:'36px', textAlign:'center', width:'300px' },
    avatar: { width:'72px', height:'72px', borderRadius:'50%', background:'#fee2e2', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'32px', margin:'0 auto 14px' },
    name:   { fontSize:'18px', fontWeight:700, color:'#1f2937', marginBottom:'4px' },
    status: { fontSize:'13px', color:'#6b7280', marginBottom:'20px' },
    end:    { background:'#dc2626', color:'white', border:'none', padding:'12px 28px', borderRadius:'999px', cursor:'pointer', fontSize:'15px', fontWeight:700 },
  };

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.avatar}>👤</div>
        <div style={s.name}>{donor.name}</div>
        <div style={s.status}>📞 {status} · {donor.bloodGroup}</div>
        <audio ref={localAudio} autoPlay />
        <audio ref={remoteAudio} autoPlay />
        <button style={s.end} onClick={onClose}>End Call</button>
      </div>
    </div>
  );
}

export default function HospitalDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [responses, setResponses] = useState({});
  const [showForm, setShowForm]   = useState(false);
  const [calling, setCalling]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [form, setForm] = useState({ bloodGroup:'A+', unitsNeeded:1, urgency:'normal', patientName:'', notes:'', radiusKm:50 });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => { fetchRequests(); }, []);

  useSocket(user, () => {}, (requestId) => {
    // Update the accepted count in requests state without refetching
    setRequests(prev =>
      prev.map(r =>
        r._id === requestId
          ? { ...r, donorsAccepted: (r.donorsAccepted || 0) + 1 }
          : r
      )
    );
  });

  const fetchRequests = async () => {
    try { const r = await getMyRequests(); setRequests(r.data); }
    catch {} finally { setLoading(false); }
  };

  const fetchResponses = async (id) => {
    try {
      const r = await getResponses(id);
      setResponses(prev => ({ ...prev, [id]: r.data }));
    } catch { toast.error('Failed to load responses'); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await createRequest({ ...form, unitsNeeded: parseInt(form.unitsNeeded), radiusKm: parseInt(form.radiusKm) });
      toast.success(res.data.message);
      setShowForm(false);
      fetchRequests();
    } catch (err) { toast.error(err.response?.data?.error || 'Error'); }
  };

  const handleStatus = async (id, status) => {
    await updateReqStatus(id, status);
    toast.success('Status updated');
    fetchRequests();
  };
  const handleConfirmDonation = async (requestId, donorId, donorName) => {
    if (!window.confirm(`Confirm that ${donorName} actually donated blood? This will block them from new requests for 90 days.`)) return;
    try {
      const res = await confirmDonation(requestId, donorId);
      toast.success(res.data.message);
      fetchResponses(requestId); // refresh the responses panel
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to confirm donation');
    }
  };

  const waLink = (phone, name) =>
    `https://wa.me/${phone?.replace(/\D/g,'')}?text=${encodeURIComponent(`Hi ${name}, ${user?.hospitalName} urgently needs a blood donor. Can you help?`)}`;

  const s = {
    page:    { minHeight:'100vh', background:'#f9fafb' },
    content: { maxWidth:'960px', margin:'0 auto', padding:'24px 16px' },
    topRow:  { display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'12px', marginBottom:'24px' },
    name:    { fontSize:'22px', fontWeight:700, color:'#1f2937' },
    meta:    { fontSize:'13px', color:'#6b7280', marginTop:'3px' },
    newBtn:  { background:'#dc2626', color:'white', border:'none', padding:'10px 20px', borderRadius:'10px', cursor:'pointer', fontSize:'14px', fontWeight:700 },
    form:    { background:'white', borderRadius:'16px', padding:'24px', marginBottom:'20px', border:'2px solid #dc2626' },
    formH:   { fontSize:'16px', fontWeight:700, color:'#1f2937', marginBottom:'16px' },
    label:   { display:'block', fontSize:'13px', fontWeight:600, color:'#374151', marginBottom:'5px' },
    input:   { width:'100%', padding:'10px 13px', border:'1.5px solid #e5e7eb', borderRadius:'10px', fontSize:'14px', outline:'none', boxSizing:'border-box', marginBottom:'14px' },
    select:  { width:'100%', padding:'10px 13px', border:'1.5px solid #e5e7eb', borderRadius:'10px', fontSize:'14px', background:'white', boxSizing:'border-box', marginBottom:'14px' },
    row4:    { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:'12px' },
    submit:  { background:'#dc2626', color:'white', border:'none', padding:'11px 24px', borderRadius:'10px', cursor:'pointer', fontSize:'14px', fontWeight:700 },
    cancel:  { background:'#f3f4f6', color:'#374151', border:'none', padding:'11px 20px', borderRadius:'10px', cursor:'pointer', fontSize:'14px', marginLeft:'10px' },
    card:    { background:'white', borderRadius:'16px', padding:'20px', marginBottom:'14px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' },
    bg:      { fontSize:'28px', fontWeight:800, color:'#dc2626' },
    hosp:    { fontSize:'14px', fontWeight:700, color:'#1f2937' },
    info:    { fontSize:'12px', color:'#6b7280', marginTop:'2px' },
    urg:     (u) => ({ background: urgColor[u]+'20', color:urgColor[u], fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'999px' }),
    stat: (s) => ({ background: s==='open'?'#dbeafe':s==='fulfilled'?'#dcfce7':s==='expired'?'#fee2e2':'#f3f4f6', color: s==='open'?'#1d4ed8':s==='fulfilled'?'#15803d':s==='expired'?'#b91c1c':'#6b7280', fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'999px' }),
    actions: { display:'flex', gap:'8px', marginTop:'14px', flexWrap:'wrap' },
    viewBtn: { background:'#3b82f6', color:'white', border:'none', padding:'7px 14px', borderRadius:'8px', cursor:'pointer', fontSize:'12px', fontWeight:600 },
    fulfil:  { background:'#16a34a', color:'white', border:'none', padding:'7px 14px', borderRadius:'8px', cursor:'pointer', fontSize:'12px', fontWeight:600 },
    canBtn:  { background:'#6b7280', color:'white', border:'none', padding:'7px 14px', borderRadius:'8px', cursor:'pointer', fontSize:'12px', fontWeight:600 },
    dCard:   { background:'#f9fafb', borderRadius:'10px', padding:'12px 14px', marginTop:'8px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'8px' },
    callBtn: { background:'#7c3aed', color:'white', border:'none', padding:'6px 12px', borderRadius:'8px', cursor:'pointer', fontSize:'12px', fontWeight:700 },
    wa:      { background:'#25D366', color:'white', border:'none', padding:'6px 12px', borderRadius:'8px', cursor:'pointer', fontSize:'12px', fontWeight:700, textDecoration:'none', display:'inline-block' },
    empty:   { textAlign:'center', padding:'60px 20px', color:'#9ca3af', fontSize:'15px' },
  };

  return (
    <div style={s.page}>
      <Navbar />
      {calling && <CallModal donor={calling} onClose={() => setCalling(null)} />}
      <div style={s.content}>
        <div style={s.topRow}>
          <div>
            <div style={s.name}>🏥 {user?.hospitalName}</div>
            <div style={s.meta}>{user?.city}, {user?.state} · {user?.phone}</div>
          </div>
          <button style={s.newBtn} onClick={() => setShowForm(s => !s)}>+ New Blood Request</button>
        </div>

        {showForm && (
          <div style={s.form}>
            <div style={s.formH}>🩸 Post Urgent Blood Request</div>
            <form onSubmit={handleCreate}>
              <div style={s.row4}>
                <div>
                  <label style={s.label}>Blood Group</label>
                  <select style={s.select} value={form.bloodGroup} onChange={e => set('bloodGroup', e.target.value)}>
                    {BG.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label style={s.label}>Units Needed</label>
                  <input style={s.input} type="number" min="1" max="20" value={form.unitsNeeded} onChange={e => set('unitsNeeded', e.target.value)} />
                </div>
                <div>
                  <label style={s.label}>Urgency</label>
                  <select style={s.select} value={form.urgency} onChange={e => set('urgency', e.target.value)}>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label style={s.label}>Search Radius (km)</label>
                  <input style={s.input} type="number" min="10" max="200" value={form.radiusKm} onChange={e => set('radiusKm', e.target.value)} />
                </div>
              </div>
              <label style={s.label}>Patient Name (optional)</label>
              <input style={s.input} placeholder="Patient name" value={form.patientName} onChange={e => set('patientName', e.target.value)} />
              <label style={s.label}>Notes</label>
              <input style={s.input} placeholder="Any additional info..." value={form.notes} onChange={e => set('notes', e.target.value)} />
              <button type="submit" style={s.submit}>🚨 Post & Notify Donors</button>
              <button type="button" style={s.cancel} onClick={() => setShowForm(false)}>Cancel</button>
            </form>
          </div>
        )}

        {loading && <div style={s.empty}>Loading...</div>}
        {!loading && requests.length === 0 && <div style={s.empty}>No requests yet. Post your first blood request above.</div>}

        {requests.map(r => (
          <div key={r._id} style={s.card}>
            <div style={{display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:'10px'}}>
              <div style={{display:'flex', gap:'14px', alignItems:'center'}}>
                <span style={s.bg}>{r.bloodGroup}</span>
                <div>
                  <div style={s.hosp}>{r.unitsNeeded} unit{r.unitsNeeded>1?'s':''} · {r.patientName || 'Unknown patient'}</div>
                  <div style={s.info}>Posted: {new Date(r.createdAt).toLocaleDateString()}</div>

                  {/* ✅ ADD THESE TWO LINES */}
                  <div style={{fontSize:'12px', color:'#2563eb', marginTop:'4px', fontWeight:600}}>
                    📢 Notified: {r.donorsNotified || 0} donors &nbsp;·&nbsp; ✅ Accepted: {r.donorsAccepted || 0}
                  </div>
                  {r.expiresAt && r.status === 'open' && (
                    <div style={{ fontSize:'12px', color: new Date(r.expiresAt) < new Date(Date.now() + 3600000) ? '#dc2626' : '#6b7280', marginTop:'2px' }}>
                      ⏰ Expires: {new Date(r.expiresAt).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })} · {new Date(r.expiresAt).toLocaleDateString('en-IN')}
                    </div>
                  )}
                  {r.status === 'expired' && (
                    <div style={{ fontSize:'12px', color:'#dc2626', marginTop:'2px', fontWeight:700 }}>⛔ Expired</div>
                  )}
                </div>
              </div>
              <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>
                <span style={s.urg(r.urgency)}>{r.urgency.toUpperCase()}</span>
                <span style={s.stat(r.status)}>{r.status.toUpperCase()}</span>
              </div>
            </div>
            {r.notes && <div style={{fontSize:'13px', color:'#6b7280', marginTop:'8px'}}>{r.notes}</div>}
            <div style={s.actions}>
              <button style={s.viewBtn} onClick={() => fetchResponses(r._id)}>👥 View Responses</button>
              {r.status === 'open' && <button style={s.fulfil} onClick={() => handleStatus(r._id,'fulfilled')}>✅ Mark Fulfilled</button>}
              {r.status === 'open' && <button style={s.canBtn} onClick={() => handleStatus(r._id,'cancelled')}>Cancel</button>}
            </div>

            {responses[r._id] && (
              <div style={{marginTop:'12px'}}>
                <div style={{fontSize:'13px', fontWeight:700, color:'#374151', marginBottom:'6px'}}>
                  Donor Responses ({responses[r._id].length})
                </div>
                {responses[r._id].length === 0
                  ? <div style={{fontSize:'13px', color:'#9ca3af'}}>No responses yet</div>
                  : responses[r._id].map((resp, i) => (
                    <div key={i} style={s.dCard}>
                      <div>
                        <div style={{fontSize:'13px', fontWeight:700, color:'#1f2937'}}>{resp.donor?.name} · {resp.donor?.bloodGroup}</div>
                        <div style={{fontSize:'12px', color:'#6b7280'}}>📍 {resp.donor?.city} · 📞 {resp.donor?.phone}</div>
                        <div style={{fontSize:'12px', color: resp.status==='accepted'?'#16a34a':'#dc2626', fontWeight:600}}>{resp.status?.toUpperCase()}</div>
                      </div>
                      <div style={{display:'flex', gap:'6px', flexWrap:'wrap', alignItems:'center'}}>
                        <span style={{fontSize:'13px', fontWeight:700, color:'#7c3aed'}}>📞 {resp.donor?.phone}</span>
                        <a style={s.wa} href={waLink(resp.donor?.phone, resp.donor?.name)} target="_blank" rel="noreferrer">💬 WhatsApp</a>
                        {resp.status === 'accepted' && (
                          <button
                            onClick={() => handleConfirmDonation(r._id, resp.donor?._id, resp.donor?.name)}
                            style={{ background:'#16a34a', color:'white', border:'none', padding:'6px 12px', borderRadius:'8px', cursor:'pointer', fontSize:'12px', fontWeight:700 }}>
                            ✅ Confirm Donated
                          </button>
                        )}
                        {resp.status === 'donated' && (
                          <span style={{ background:'#dcfce7', color:'#15803d', fontSize:'12px', fontWeight:700, padding:'5px 10px', borderRadius:'8px' }}>
                            🩸 Donated ✓
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
