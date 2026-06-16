import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

// Auto-attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────
export const sendOtp         = (email)  => API.post('/auth/send-otp', { email });
export const registerDonor   = (data)   => API.post('/auth/register/donor', data);
export const registerHospital= (data)   => API.post('/auth/register/hospital', data);
export const login           = (data)   => API.post('/auth/login', data);
export const forgotPassword  = (email)  => API.post('/auth/forgot-password', { email });
export const resetPassword   = (token, password) => API.post(`/auth/reset-password/${token}`, { password });

// ── Donor ─────────────────────────────────────────────────────
export const getOpenRequests  = ()        => API.get('/donor/requests');
export const respondToRequest = (id, accept) => API.post(`/donor/requests/${id}/respond`, { accept });
export const getDonorHistory  = ()        => API.get('/donor/history');
export const toggleAvailability = (available) => API.patch('/donor/availability', { available });
export const confirmDonation = (requestId, donorId) => API.patch(`/hospital/requests/${requestId}/confirm-donation/${donorId}`);
export const getDonorProfile  = ()        => API.get('/donor/profile');

// ── Hospital ──────────────────────────────────────────────────
export const createRequest    = (data)    => API.post('/hospital/requests', data);
export const getMyRequests    = ()        => API.get('/hospital/requests');
export const getResponses     = (id)      => API.get(`/hospital/requests/${id}/responses`);
export const updateReqStatus  = (id, status) => API.patch(`/hospital/requests/${id}/status`, { status });

// ── Admin ─────────────────────────────────────────────────────
export const getStats         = ()        => API.get('/admin/stats');
export const getPendingHospitals = ()     => API.get('/admin/hospitals/pending');
export const getAllHospitals   = ()        => API.get('/admin/hospitals');
export const getAllDonors      = ()        => API.get('/admin/donors');
export const approveHospital  = (id, status) => API.patch(`/admin/hospitals/${id}/status`, { status });
export const getAllRequests    = ()        => API.get('/admin/requests');

// ── Notifications ─────────────────────────────────────────────
export const getNotifications = ()        => API.get('/notifications');
export const markAllRead      = ()        => API.patch('/notifications/read-all');
