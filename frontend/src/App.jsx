import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Header from './components/Header';
import CounterScreen from './pages/CounterScreen';
import KitchenScreen from './pages/KitchenScreen';
import KitchenDisplay from './pages/KitchenDisplay';
import AdminDashboard from './pages/AdminDashboard';
import MenuManagement from './pages/MenuManagement';
import StaffManagement from './pages/StaffManagement';
import AttendancePage from './pages/AttendancePage';
import ReportsPage from './pages/ReportsPage';

// ✅ Layout Component
function Layout() {
    const location = useLocation();

    // Hide header on kitchen display
    const hideHeaderRoutes = ['/kitchen-display'];

    return (
        <>
            {!hideHeaderRoutes.includes(location.pathname) && <Header />}

            <div className="container mx-auto px-4 py-8">
                <Routes>
                    <Route path="/" element={<CounterScreen />} />
                    <Route path="/kitchen" element={<KitchenScreen />} />
                    <Route path="/kitchen-display" element={<KitchenDisplay />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/menu" element={<MenuManagement />} />
                    <Route path="/staff" element={<StaffManagement />} />
                    <Route path="/attendance" element={<AttendancePage />} />
                    <Route path="/reports" element={<ReportsPage />} />
                </Routes>
            </div>
        </>
    );
}

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-100">
                <Layout />

                <Toaster 
                    position="top-right"
                    toastOptions={{
                        duration: 2000,
                        style: {
                            background: '#363636',
                            color: '#fff',
                        },
                    }}
                />
            </div>
        </Router>
    );
}

export default App;