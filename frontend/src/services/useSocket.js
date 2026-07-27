import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

export function useSocket(user, onNotification, onDonorResponded) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    // ✅ Dynamic URL: uses env variable or defaults to your Render backend
    const SOCKET_URL =
      process.env.REACT_APP_API_URL ||
      process.env.VITE_API_URL ||
      "https://blood-donate-qzym.onrender.com";

    // Connect to backend over HTTPS
    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket", "polling"], // Helps bypass network/CORS restrictions
    });

    // Register this user's socket
    socketRef.current.emit("register", user._id);

    // Listen for real-time blood request notifications
    socketRef.current.on("new_notification", (data) => {
      toast.custom(
        () => (
          <div
            style={{
              background: "#dc2626",
              color: "white",
              padding: "14px 18px",
              borderRadius: "10px",
              display: "flex",
              gap: "10px",
              alignItems: "center",
              boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
              maxWidth: "340px",
            }}
          >
            <span style={{ fontSize: "22px" }}>🩸</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: "14px" }}>
                {data.title}
              </div>
              <div style={{ fontSize: "12px", opacity: 0.9, marginTop: "2px" }}>
                {data.message}
              </div>
            </div>
          </div>
        ),
        { duration: 7000, position: "top-right" },
      );

      if (onNotification) onNotification(data);
    });

    // Donor gets notified when hospital confirms their donation
    socketRef.current.on("donation_confirmed", (data) => {
      toast.custom(
        () => (
          <div
            style={{
              background: "#16a34a",
              color: "white",
              padding: "14px 18px",
              borderRadius: "10px",
              display: "flex",
              gap: "10px",
              alignItems: "center",
              boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
              maxWidth: "340px",
            }}
          >
            <span style={{ fontSize: "22px" }}>🩸</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: "14px" }}>
                Donation Confirmed!
              </div>
              <div style={{ fontSize: "12px", opacity: 0.9, marginTop: "2px" }}>
                {data.message}
              </div>
            </div>
          </div>
        ),
        { duration: 7000, position: "top-right" },
      );

      if (onNotification) onNotification(data);
    });

    socketRef.current.on("donor_responded", (data) => {
      if (onDonorResponded) onDonorResponded(data.requestId);
    });

    return () => socketRef.current?.disconnect();
  }, [user]);

  return socketRef;
}

// import { useEffect, useRef } from 'react';
// import { io } from 'socket.io-client';
// import toast from 'react-hot-toast';

// export function useSocket(user, onNotification, onDonorResponded) {
//   const socketRef = useRef(null);

//   useEffect(() => {
//     if (!user) return;

//     // Connect to backend
//     socketRef.current = io('http://localhost:5000');

//     // Register this user's socket
//     socketRef.current.emit('register', user._id);

//     // Listen for real-time blood request notifications
//     socketRef.current.on('new_notification', (data) => {
//       toast.custom(() => (
//         <div style={{
//           background: '#dc2626', color: 'white', padding: '14px 18px',
//           borderRadius: '10px', display: 'flex', gap: '10px', alignItems: 'center',
//           boxShadow: '0 4px 16px rgba(0,0,0,0.2)', maxWidth: '340px'
//         }}>
//           <span style={{ fontSize: '22px' }}>🩸</span>
//           <div>
//             <div style={{ fontWeight: 700, fontSize: '14px' }}>{data.title}</div>
//             <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '2px' }}>{data.message}</div>
//           </div>
//         </div>
//       ), { duration: 7000, position: 'top-right' });

//       if (onNotification) onNotification(data);
//     });

//     // Donor gets notified when hospital confirms their donation
//     socketRef.current.on('donation_confirmed', (data) => {
//       toast.custom(() => (
//         <div style={{
//           background: '#16a34a', color: 'white', padding: '14px 18px',
//           borderRadius: '10px', display: 'flex', gap: '10px', alignItems: 'center',
//           boxShadow: '0 4px 16px rgba(0,0,0,0.2)', maxWidth: '340px'
//         }}>
//           <span style={{ fontSize: '22px' }}>🩸</span>
//           <div>
//             <div style={{ fontWeight: 700, fontSize: '14px' }}>Donation Confirmed!</div>
//             <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '2px' }}>{data.message}</div>
//           </div>
//         </div>
//       ), { duration: 7000, position: 'top-right' });

//       if (onNotification) onNotification(data);
//     });
//     socketRef.current.on('donor_responded', (data) => {
//       if (onDonorResponded) onDonorResponded(data.requestId);
//     });

//     return () => socketRef.current?.disconnect();
//   }, [user]);

//   return socketRef;
// }
