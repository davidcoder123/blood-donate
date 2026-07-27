import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markAllRead } from '../services/api';
import { useSocket } from '../services/useSocket';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [notifs, setNotifs]     = useState([]);
  const [unread, setUnread]     = useState(0);
  const [showBell, setShowBell] = useState(false);

  const fetchNotifs = async () => {
    try {
      const res = await getNotifications();
      setNotifs(res.data.notifications);
      setUnread(res.data.unreadCount);
    } catch {}
  };

  useSocket(user, () => {
    setUnread(n => n + 1);
    fetchNotifs();
  });

  useEffect(() => { if (user) fetchNotifs(); }, [user]);

  const handleBell = async () => {
    setShowBell(s => !s);
    if (!showBell && unread > 0) {
      await markAllRead();
      setUnread(0);
    }
  };

  const n = {
    nav:   { background: '#2563eb', padding: '0 20px', height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.25)' },
    logo:  { color: 'white', fontWeight: 700, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' },
    right: { display: 'flex', alignItems: 'center', gap: '14px' },
    bell:  { position: 'relative', cursor: 'pointer', userSelect: 'none' },
    badge: { position: 'absolute', top: '-6px', right: '-6px', background: '#fbbf24', color: '#111', fontSize: '10px', fontWeight: 700, borderRadius: '999px', padding: '2px 5px', minWidth: '16px', textAlign: 'center' },
    drop:  { position: 'absolute', top: '36px', right: 0, background: 'white', borderRadius: '12px', boxShadow: '0 8px 28px rgba(0,0,0,0.18)', width: '300px', maxHeight: '380px', overflowY: 'auto', zIndex: 200 },
    item:  { padding: '12px 16px', borderBottom: '1px solid #f3f4f6' },
    title: { fontSize: '13px', fontWeight: 600, color: '#1f2937' },
    msg:   { fontSize: '12px', color: '#6b7280', marginTop: '2px' },
    name:  { color: 'white', fontSize: '13px' },
    btn:   { background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
  };

  return (
    <nav style={n.nav}>
      <div style={n.logo}>
        <img src="/logo.svg" alt='logo' width={30} height={30}/>
         Blood Donate</div>
      <div style={n.right}>
        <div style={n.bell} onClick={handleBell}>
          <span style={{ fontSize: '20px', color: 'white' }}>🔔</span>
          {unread > 0 && <span style={n.badge}>{unread}</span>}
          {showBell && (
            <div style={n.drop}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', fontSize: '13px', fontWeight: 600, color: '#374151' }}>Notifications</div>
              {notifs.length === 0
                ? <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>No notifications yet</div>
                : notifs.map((notif, i) => (
                  <div key={i} style={n.item}>
                    <div style={n.title}>{notif.title}</div>
                    <div style={n.msg}>{notif.message}</div>
                  </div>
                ))
              }
            </div>
          )}
        </div>
        <span style={n.name}>👤 {user?.name}</span>
        <button style={n.btn} onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}
