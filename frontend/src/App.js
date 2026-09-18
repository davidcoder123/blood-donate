import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { requestNotificationPermission, onMessageListener } from "./firebase";
import api from "./services/api";

import Login from "./pages/Login";
import RegisterDonor from "./pages/RegisterDonor";
import RegisterHospital from "./pages/RegisterHospital";
import DonorDashboard from "./pages/DonorDashboard";
import HospitalDashboard from "./pages/HospitalDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import LandingPage from "./LandingPage";
import PWAInstallButton from "./components/PWAInstallButton";

function ProtectedRoute({ children, role }) {
  const { user, isLoggedIn, loading } = useAuth();
  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          fontSize: "24px",
        }}
      >
        🩸
      </div>
    );
  if (!isLoggedIn) return <Navigate to="/login" />;
  if (role && user?.role !== role) return <Navigate to="/login" />;
  return children;
}

function AppContent() {
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    // Only request permission and attempt to save token if user is authenticated
    if (isLoggedIn) {
      requestNotificationPermission().then((token) => {
        if (token) {
          api.post("/auth/save-token", { fcmToken: token }).catch((err) => {
            console.error("Failed to save FCM token to backend:", err);
          });
        }
      });
    }

    // Set up foreground push notification listener
    onMessageListener()
      .then((payload) => {
        console.log("Foreground Notification Received:", payload);
        if (payload?.notification) {
          toast.success(
            `${payload.notification.title}: ${payload.notification.body}`,
          );
        }
      })
      .catch((err) => console.log("Failed to receive message: ", err));
  }, [isLoggedIn]);

  return (
    <>
      <AppRoutes />
      <PWAInstallButton />
    </>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register/donor" element={<RegisterDonor />} />
      <Route path="/register/hospital" element={<RegisterHospital />} />
      <Route
        path="/donor"
        element={
          <ProtectedRoute role="donor">
            <DonorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hospital"
        element={
          <ProtectedRoute role="hospital">
            <HospitalDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={
          user ? <Navigate to={`/${user.role}`} /> : <Navigate to="/login" />
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{ style: { borderRadius: "10px", fontSize: "14px" } }}
        />
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}
