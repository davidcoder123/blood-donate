import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerHospital } from '../services/api';
import toast from 'react-hot-toast';

export default function RegisterHospital() {
  const [form, setForm] = useState({ name:'', email:'', password:'', hospitalName:'', licenseNumber:'', phone:'', address:'', city:'', state:'', latitude:'', longitude:'' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      pos => { set('latitude', pos.coords.latitude); set('longitude', pos.coords.longitude); toast.success('Location captured!'); },
      ()  => toast.error('Allow location access in your browser')
    );
  };
  const getLocationFromAddress = async () => {
  if (!form.address) return toast.error('Enter an address first');
  
  // Build fallback queries from most specific to least specific
  const fullAddress = form.address;
  const parts = fullAddress.split(',').map(p => p.trim()).filter(Boolean);
  
  // Try progressively shorter versions of the address
  const queries = [];
    for (let i = 0; i < parts.length; i++) {
      queries.push(parts.slice(i).join(', ')); // drop front parts one by one
    }
    // Also try city+state+pincode only if parts exist
    if (parts.length > 2) {
      queries.push(parts.slice(-3).join(', ')); // last 3 parts
      queries.push(parts.slice(-2).join(', ')); // last 2 parts
    }

    try {
      for (const q of queries) {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=in`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        if (data.length) {
          set('latitude', data[0].lat);
          set('longitude', data[0].lon);
          toast.success(`Location set! (matched: ${data[0].display_name.substring(0, 60)}...)`);
          return;
        }
      }
      toast.error('Could not find location. Please use Auto-detect instead.');
    } catch {
      toast.error('Failed to fetch location. Check your internet connection.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerHospital({ ...form, latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude) });
      toast.success('Registration submitted! You will receive an email after admin approval.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  const s = {
    page:  { minHeight:'100vh', background:'linear-gradient(135deg,#1d4ed8,#1e3a8a)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' },
    card:  { background:'white', borderRadius:'20px', padding:'36px', width:'100%', maxWidth:'500px', boxShadow:'0 20px 60px rgba(0,0,0,0.3)' },
    h2:    { fontSize:'20px', fontWeight:700, color:'#1f2937', marginBottom:'4px' },
    sub:   { fontSize:'13px', color:'#6b7280', marginBottom:'20px' },
    notice:{ background:'#fef3c7', border:'1px solid #fcd34d', borderRadius:'10px', padding:'12px 14px', fontSize:'13px', color:'#92400e', marginBottom:'20px' },
    label: { display:'block', fontSize:'13px', fontWeight:600, color:'#374151', marginBottom:'5px' },
    input: { width:'100%', padding:'10px 13px', border:'1.5px solid #e5e7eb', borderRadius:'10px', fontSize:'14px', outline:'none', boxSizing:'border-box', marginBottom:'14px' },
    row:   { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' },
    btn:   { width:'100%', background:'#1d4ed8', color:'white', border:'none', padding:'12px', borderRadius:'10px', fontSize:'14px', fontWeight:700, cursor:'pointer' },
    outBtn:{ width:'100%', background:'white', color:'#1d4ed8', border:'2px solid #1d4ed8', padding:'10px', borderRadius:'10px', fontSize:'14px', fontWeight:600, cursor:'pointer', marginBottom:'14px' },
    link:  { color:'#dc2626', textDecoration:'none', fontWeight:600 },
    locBox:{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'10px', padding:'10px 14px', fontSize:'12px', color:'#166534', marginBottom:'14px' },
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h2 style={s.h2}>🏥 Register Hospital</h2>
        <p style={s.sub}>Join our verified hospital network</p>
        <div style={s.notice}>⚠️ Hospital accounts need admin approval. You'll receive an email once verified.</div>

        <form onSubmit={handleSubmit}>
          <label style={s.label}>Contact Person Name</label>
          <input style={s.input} required placeholder="Dr. John Smith" value={form.name} onChange={e => set('name', e.target.value)} />

          <label style={s.label}>Hospital Name</label>
          <input style={s.input} required placeholder="Apollo Hospital, Chennai" value={form.hospitalName} onChange={e => set('hospitalName', e.target.value)} />

          <label style={s.label}>License Number</label>
          <input style={s.input} required placeholder="TN-HOSP-2024-1234" value={form.licenseNumber} onChange={e => set('licenseNumber', e.target.value)} />

          <div style={s.row}>
            <div>
              <label style={s.label}>Email</label>
              <input style={s.input} type="email" required placeholder="hospital@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div>
              <label style={s.label}>Phone</label>
              <input style={s.input} required placeholder="+91 9876543210" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
          </div>

          <label style={s.label}>Password</label>
          <input style={s.input} type="password" required minLength={6} placeholder="Min 6 characters" value={form.password} onChange={e => set('password', e.target.value)} />
          <label style={s.label}>Hospital Address</label>
          <input 
            style={s.input} 
            placeholder="123 Hospital Road, T Nagar, Chennai - 600017" 
            value={form.address} 
            onChange={e => set('address', e.target.value)} 
          />
          <button type="button" style={s.outBtn} onClick={getLocationFromAddress}>
            📍 Set Location from Address
          </button>
          <button type="button" style={{...s.outBtn, marginTop:'0'}} onClick={getLocation}>
            🛰️ Auto-detect My Location Instead
          </button>
          {form.latitude && <div style={s.locBox}>✅ Location captured successfully</div>}
          <div style={s.row}>
            <div>
              <label style={s.label}>City</label>
              <input style={s.input} required placeholder="Chennai" value={form.city} onChange={e => set('city', e.target.value)} />
            </div>
            <div>
              <label style={s.label}>State</label>
              <input style={s.input} placeholder="Tamil Nadu" value={form.state} onChange={e => set('state', e.target.value)} />
            </div>
          </div>

          {form.latitude && <div style={s.locBox}>✅ Location captured successfully</div>}

          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? 'Submitting...' : '🏥 Submit for Approval'}
          </button>
        </form>

        <p style={{textAlign:'center', marginTop:'18px', fontSize:'13px', color:'#6b7280'}}>
          Already registered? <Link to="/login" style={s.link}>Login</Link>
        </p>
      </div>
    </div>
  );
}
