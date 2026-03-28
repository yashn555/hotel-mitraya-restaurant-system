import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUtensils, FaUsers, FaCalendarCheck, FaChartLine, FaRobot } from 'react-icons/fa';
import AIAnalytics from '../components/AIAnalytics';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passkey, setPasskey] = useState('');
    const [showPasskeyModal, setShowPasskeyModal] = useState(true);
    const [activeTab, setActiveTab] = useState('menu');

    const handlePasskeySubmit = (e) => {
        e.preventDefault();
        if (passkey === '5555') {
            setIsAuthenticated(true);
            setShowPasskeyModal(false);
            toast.success('Access granted!');
        } else {
            toast.error('Invalid passkey!');
            setPasskey('');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
                    <div className="flex justify-center mb-6">
                        <FaRobot className="text-5xl text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-center mb-4">Admin Access Required</h2>
                    <p className="text-gray-600 text-center mb-6">Please enter the passkey to access admin panel</p>
                    <form onSubmit={handlePasskeySubmit}>
                        <input
                            type="password"
                            placeholder="Enter Passkey"
                            value={passkey}
                            onChange={(e) => setPasskey(e.target.value)}
                            className="w-full border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            Verify Access
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    const menuItems = [
        { to: '/menu', icon: FaUtensils, title: 'Menu Management', color: 'bg-blue-500', description: 'Add, edit, and manage menu items' },
        { to: '/staff', icon: FaUsers, title: 'Staff Management', color: 'bg-green-500', description: 'Manage staff details and salaries' },
        { to: '/attendance', icon: FaCalendarCheck, title: 'Attendance', color: 'bg-yellow-500', description: 'Mark and view staff attendance' },
        { to: '/reports', icon: FaChartLine, title: 'Reports', color: 'bg-purple-500', description: 'View sales and profit reports' },
    ];

    return (
        <div>
            {/* Navigation Tabs */}
            <div className="flex space-x-2 border-b mb-6">
                <button
                    onClick={() => setActiveTab('menu')}
                    className={`px-6 py-3 font-semibold transition ${
                        activeTab === 'menu'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    📋 Management
                </button>
                <button
                    onClick={() => setActiveTab('ai')}
                    className={`px-6 py-3 font-semibold transition ${
                        activeTab === 'ai'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <FaRobot className="inline mr-2" /> AI Profit Optimizer
                </button>
            </div>

            {activeTab === 'menu' ? (
                <>
                    <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {menuItems.map((item, index) => (
                            <Link
                                key={index}
                                to={item.to}
                                className={`${item.color} rounded-lg shadow-lg p-6 text-white transform transition hover:scale-105`}
                            >
                                <div className="flex items-center mb-4">
                                    <item.icon className="text-4xl mr-4" />
                                    <h2 className="text-2xl font-bold">{item.title}</h2>
                                </div>
                                <p className="text-white text-opacity-90">{item.description}</p>
                            </Link>
                        ))}
                    </div>
                    
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold mb-2">Today's Sales</h3>
                            <p className="text-3xl font-bold text-green-600">₹0</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold mb-2">Active Orders</h3>
                            <p className="text-3xl font-bold text-blue-600">0</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold mb-2">Total Staff</h3>
                            <p className="text-3xl font-bold text-purple-600">0</p>
                        </div>
                    </div>
                </>
            ) : (
                <AIAnalytics />
            )}
        </div>
    );
};

export default AdminDashboard;