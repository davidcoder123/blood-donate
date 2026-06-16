import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendOtp, registerDonor } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const BG = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

export default function RegisterDonor() {
  const [step, setStep]     = useState(1);
  const [form, setForm] = useState({ name:'', email:'', password:'', otp:'', bloodGroup:'A+', phone:'', address:'', city:'', state:'', latitude:'', longitude:'' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSendOtp = async () => {
    if (!form.email) return toast.error('Enter your email first');
    setLoading(true);
    try {
      await sendOtp(form.email);
      toast.success('OTP sent! Check your email.');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = () => {
    if (form.otp.length !== 6) return toast.error('Enter the 6-digit OTP');
    setStep(3);
  };

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
    if (!form.latitude) return toast.error('Please capture your location');
    setLoading(true);
    try {
      const res = await registerDonor({ ...form, latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude) });
      loginUser(res.data);
      toast.success('Registration successful!');
      navigate('/donor');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  const s = {
    page:  { minHeight:'100vh', background:'linear-gradient(135deg,#dc2626,#7f1d1d)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' },
    card:  { background:'white', borderRadius:'20px', padding:'36px', width:'100%', maxWidth:'480px', boxShadow:'0 20px 60px rgba(0,0,0,0.3)' },
    steps: { display:'flex', gap:'6px', marginBottom:'24px', alignItems:'center' },
    dot:   (a) => ({ width:'30px', height:'30px', borderRadius:'50%', background: a?'#dc2626':'#e5e7eb', color: a?'white':'#9ca3af', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:700 }),
    stepLabel: { fontSize:'13px', color:'#6b7280', marginLeft:'6px' },
    h2:    { fontSize:'20px', fontWeight:700, color:'#1f2937', marginBottom:'4px' },
    sub:   { fontSize:'13px', color:'#6b7280', marginBottom:'22px' },
    label: { display:'block', fontSize:'13px', fontWeight:600, color:'#374151', marginBottom:'5px' },
    input: { width:'100%', padding:'10px 13px', border:'1.5px solid #e5e7eb', borderRadius:'10px', fontSize:'14px', outline:'none', boxSizing:'border-box', marginBottom:'14px' },
    select:{ width:'100%', padding:'10px 13px', border:'1.5px solid #e5e7eb', borderRadius:'10px', fontSize:'14px', background:'white', boxSizing:'border-box', marginBottom:'14px' },
    row:   { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' },
    btn:   { width:'100%', background:'#dc2626', color:'white', border:'none', padding:'12px', borderRadius:'10px', fontSize:'14px', fontWeight:700, cursor:'pointer', marginTop:'4px' },
    outBtn:{ width:'100%', background:'white', color:'#dc2626', border:'2px solid #dc2626', padding:'10px', borderRadius:'10px', fontSize:'14px', fontWeight:600, cursor:'pointer', marginBottom:'12px' },
    otp:   { width:'100%', padding:'14px', border:'2px solid #e5e7eb', borderRadius:'10px', fontSize:'28px', textAlign:'center', letterSpacing:'10px', outline:'none', boxSizing:'border-box', marginBottom:'14px' },
    passWrap: { position:'relative', marginBottom:'14px' },
    passIn:{ width:'100%', padding:'10px 40px 10px 13px', border:'1.5px solid #e5e7eb', borderRadius:'10px', fontSize:'14px', outline:'none', boxSizing:'border-box' },
    eye:   { position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', cursor:'pointer', background:'none', border:'none', fontSize:'16px' },
    link:  { color:'#dc2626', textDecoration:'none', fontWeight:600 },
    locBox:{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'10px', padding:'10px 14px', fontSize:'12px', color:'#166534', marginBottom:'14px' },
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.steps}>
          {[1,2,3].map(n => <div key={n} style={s.dot(step >= n)}>{n}</div>)}
          <span style={s.stepLabel}>{step===1?'Basic Info':step===2?'Verify Email':'Blood & Location'}</span>
        </div>

        <h2 style={s.h2}>🩸 Register as Donor</h2>
        <p style={s.sub}>Join our network of life-savers</p>

        {/* Step 1 */}
        {step === 1 && (
          <div>
            <label style={s.label}>Full Name</label>
            <input style={s.input} placeholder="Your full name" value={form.name} onChange={e => set('name', e.target.value)} />
            <label style={s.label}>Email</label>
            <input style={s.input} type="email" placeholder="your@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
            <label style={s.label}>Password</label>
            <div style={s.passWrap}>
              <input style={s.passIn} type={showPass?'text':'password'} placeholder="Min 6 characters" value={form.password} onChange={e => set('password', e.target.value)} />
              <button type="button" style={s.eye} onClick={() => setShowPass(s=>!s)}>{showPass?'🙈':'👁️'}</button>
            </div>
            <label style={s.label}>Phone</label>
            <input style={s.input} placeholder="+91 9876543210" value={form.phone} onChange={e => set('phone', e.target.value)} />
            <button style={s.btn} onClick={handleSendOtp} disabled={loading || !form.name || !form.email || !form.password}>
              {loading ? 'Sending OTP...' : 'Send OTP to Email →'}
            </button>
          </div>
        )}

        {/* Step 2 - OTP */}
        {step === 2 && (
          <div>
            <p style={{fontSize:'14px', color:'#374151', marginBottom:'16px'}}>
              Enter the 6-digit OTP sent to <strong>{form.email}</strong>
            </p>
            <input style={s.otp} maxLength={6} placeholder="000000" value={form.otp}
              onChange={e => set('otp', e.target.value.replace(/\D/g,''))} />
            <button style={s.btn} onClick={handleVerifyOtp}>Verify OTP →</button>
            <button style={{...s.outBtn, marginTop:'10px'}} onClick={handleSendOtp} disabled={loading}>Resend OTP</button>
          </div>
        )}

        {/* Step 3 - Blood & Location */}
        {step === 3 && (
          <form onSubmit={handleSubmit}>
            <label style={s.label}>Blood Group</label>
            <select style={s.select} value={form.bloodGroup} onChange={e => set('bloodGroup', e.target.value)}>
              {BG.map(b => <option key={b}>{b}</option>)}
            </select>
            <label style={s.label}>Full Address</label>
            <input 
              style={s.input} 
              placeholder="123 Main Street, Anna Nagar, Chennai" 
              value={form.address} 
              onChange={e => set('address', e.target.value)} 
            />
            <button type="button" style={s.outBtn} onClick={getLocationFromAddress}>
              📍 Set Location from Address
            </button>
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
            {form.latitude && (
              <div style={s.locBox}>✅ Location captured: {parseFloat(form.latitude).toFixed(4)}, {parseFloat(form.longitude).toFixed(4)}</div>
            )}
            <button type="submit" style={s.btn} disabled={loading || !form.latitude}>
              {loading ? 'Registering...' : '✅ Complete Registration'}
            </button>
          </form>
        )}

        <p style={{textAlign:'center', marginTop:'18px', fontSize:'13px', color:'#6b7280'}}>
          Already registered? <Link to="/login" style={s.link}>Login</Link>
        </p>
      </div>
    </div>
  );
}
