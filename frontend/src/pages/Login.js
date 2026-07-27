import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(form);
      loginUser(res.data);
      toast.success('Welcome back!');
      navigate(`/${res.data.user.role}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  const s = {
    page:  { minHeight: '100vh', background: 'linear-gradient(135deg,#2563eb,#1e3a8a)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
    card:  { background: 'white', borderRadius: '20px', padding: '40px 36px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
    logo:  { textAlign: 'center', fontSize: '52px', marginBottom: '6px' },
    h1:    { textAlign: 'center', fontSize: '24px', fontWeight: 700, color: '#1f2937', margin: '0 0 4px' },
    sub:   { textAlign: 'center', fontSize: '14px', color: '#6b7280', marginBottom: '28px' },
    label: { display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' },
    input: { width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '16px', transition: 'border .2s' },
    passWrap: { position: 'relative', marginBottom: '16px' },
    passInput: { width: '100%', padding: '11px 44px 11px 14px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
    eye:   { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '16px', color: '#9ca3af', background: 'none', border: 'none' },
    btn:   { width: '100%', background: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', marginTop: '4px' },
    links: { textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#6b7280' },
    link:  { color: '#2563eb', textDecoration: 'none', fontWeight: 600 },
    forgot:{ display: 'block', textAlign: 'right', fontSize: '12px', color: '#2563eb', textDecoration: 'none', marginTop: '-10px', marginBottom: '14px' }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>🩸</div>
        <h1 style={s.h1}>Blood Donor Finder</h1>
        <p style={s.sub}>Connecting donors with hospitals</p>

        <form onSubmit={handle}>
          <label style={s.label}>Email</label>
          <input style={s.input} type="email" required placeholder="your@email.com"
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />

          <label style={s.label}>Password</label>
          <div style={s.passWrap}>
            <input style={s.passInput} type={showPass ? 'text' : 'password'} required placeholder="••••••••"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            <button type="button" style={s.eye} onClick={() => setShowPass(s => !s)}>
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>

          <Link to="/forgot-password" style={s.forgot}>Forgot password?</Link>
          <button style={s.btn} disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        </form>

        <div style={s.links}>
          <Link to="/register/donor" style={s.link}>Register as Donor</Link>
          {' · '}
          <Link to="/register/hospital" style={s.link}>Register Hospital</Link>
        </div>
      </div>
    </div>
  );
}
