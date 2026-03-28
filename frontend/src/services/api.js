import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Add response interceptor for error handling
api.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// Menu APIs
export const getMenuItems = () => api.get('/menu');
export const createMenuItem = (data) => api.post('/menu', data);
export const updateMenuItem = (id, data) => api.put(`/menu/${id}`, data);
export const deleteMenuItem = (id) => api.delete(`/menu/${id}`);
export const toggleMenuItem = (id) => api.patch(`/menu/${id}/toggle`);

// Order APIs
export const getOrders = () => api.get('/orders');
export const getOrderByTable = (tableNumber) => api.get(`/orders/table/${tableNumber}`);
export const createOrder = (data) => api.post('/orders', data);
export const updateOrder = (id, data) => api.put(`/orders/${id}`, data);
export const markOrderReady = (id) => api.patch(`/orders/${id}/ready`);
export const markOrderPaid = (id) => api.patch(`/orders/${id}/paid`);
export const deleteOrder = (id) => api.delete(`/orders/${id}`);

// Staff APIs
export const getStaff = () => api.get('/staff');
export const createStaff = (data) => api.post('/staff', data);
export const updateStaff = (id, data) => api.put(`/staff/${id}`, data);
export const deleteStaff = (id) => api.delete(`/staff/${id}`);

// Attendance APIs
export const markAttendance = (data) => api.post('/attendance', data);
export const getAttendanceByDate = (date) => api.get(`/attendance/date/${date}`);
export const getMonthlyAttendance = (year, month) => api.get(`/attendance/monthly/${year}/${month}`);
export const getStaffMonthlySummary = (staffId, year, month) => api.get(`/attendance/summary/${staffId}/${year}/${month}`);

// Report APIs
export const getDailyReport = (date) => api.get(`/reports/daily/${date}`);
export const getMonthlyReport = (year, month) => api.get(`/reports/monthly/${year}/${month}`);
export const getProfitReport = (startDate, endDate) => api.get(`/reports/profit/${startDate}/${endDate}`);

export default api;