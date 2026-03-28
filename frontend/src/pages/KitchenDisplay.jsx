import React, { useState, useEffect } from 'react';
import { getOrders } from '../services/api';
import { connectSocket, onOrderUpdate, offOrderUpdate } from '../services/socket';
import { format } from 'date-fns';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaCheck, FaClock, FaFire, FaUtensils, FaBell, FaBellSlash, FaTv } from 'react-icons/fa';
import notificationSound from '../utils/notificationSound';

const KitchenDisplay = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('new');
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [lastOrderCount, setLastOrderCount] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Check fullscreen status
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    useEffect(() => {
        loadOrders();
        
        // Auto-refresh every 5 seconds
        const interval = setInterval(loadOrders, 5000);
        
        // Socket.io real-time updates
        const socket = connectSocket();
        onOrderUpdate(() => {
            loadOrders();
            // Play sound for new orders
            if (soundEnabled) {
                notificationSound.play();
            }
        });
        
        return () => {
            clearInterval(interval);
            offOrderUpdate();
        };
    }, [soundEnabled]);

    const loadOrders = async () => {
        try {
            const response = await getOrders();
            const allOrders = response.data;
            
            // Filter orders that need kitchen attention
            const kitchenOrders = allOrders.filter(order => 
                !order.isParcel && // Exclude parcel orders
                ['Occupied', 'Preparing'].includes(order.status)
            );
            
            setOrders(kitchenOrders);
            
            // Check for new orders
            if (kitchenOrders.length > lastOrderCount && lastOrderCount > 0) {
                notificationSound.play();
            }
            setLastOrderCount(kitchenOrders.length);
            
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        setLoading(true);
        try {
            await axios.patch(`http://localhost:5000/api/orders/${orderId}/kitchen-status`, { 
                status: newStatus 
            });
            toast.success(`Order status updated to ${newStatus}`);
            loadOrders();
        } catch (error) {
            console.error('Error updating order:', error);
            toast.error('Error updating order status');
        } finally {
            setLoading(false);
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'Occupied':
                return 'bg-yellow-500';
            case 'Preparing':
                return 'bg-blue-500';
            case 'Ready to Serve':
                return 'bg-green-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'Occupied':
                return <FaClock className="text-2xl" />;
            case 'Preparing':
                return <FaFire className="text-2xl" />;
            case 'Ready to Serve':
                return <FaCheck className="text-2xl" />;
            default:
                return <FaUtensils className="text-2xl" />;
        }
    };

    const formatTime = (date) => {
        return format(new Date(date), 'hh:mm a');
    };

    const getOrderAge = (orderTime) => {
        const minutes = Math.floor((new Date() - new Date(orderTime)) / 60000);
        if (minutes < 1) return 'Just now';
        if (minutes === 1) return '1 min ago';
        return `${minutes} mins ago`;
    };

    const getUrgencyClass = (orderTime) => {
        const minutes = Math.floor((new Date() - new Date(orderTime)) / 60000);
        if (minutes > 15) return 'border-red-500 bg-red-50';
        if (minutes > 10) return 'border-orange-500 bg-orange-50';
        return '';
    };

    const newOrders = orders.filter(order => order.status === 'Occupied');
    const preparingOrders = orders.filter(order => order.status === 'Preparing');

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Kitchen Display Header - Custom for TV */}
            <div className="bg-gradient-to-r from-red-800 to-red-900 text-white shadow-xl sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <FaUtensils className="text-3xl" />
                            <div>
                                <h1 className="text-2xl font-bold">KITCHEN DISPLAY</h1>
                                <p className="text-xs text-red-200">Live Order Management</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <div className="text-2xl font-mono font-bold">
                                    {currentTime.toLocaleTimeString('en-IN', { 
                                        hour: '2-digit', 
                                        minute: '2-digit',
                                        second: '2-digit'
                                    })}
                                </div>
                                <div className="text-sm">
                                    {currentTime.toLocaleDateString('en-IN', { 
                                        weekday: 'short',
                                        month: 'short', 
                                        day: 'numeric'
                                    })}
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setSoundEnabled(!soundEnabled);
                                    if (!soundEnabled) {
                                        notificationSound.enable();
                                    } else {
                                        notificationSound.disable();
                                    }
                                }}
                                className={`p-2 rounded-lg transition ${
                                    soundEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
                                }`}
                                title={soundEnabled ? 'Sound On' : 'Sound Off'}
                            >
                                {soundEnabled ? <FaBell className="text-xl" /> : <FaBellSlash className="text-xl" />}
                            </button>
                            <button
                                onClick={toggleFullscreen}
                                className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Mode'}
                            >
                                <FaTv className="text-xl" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-gray-800 border-b border-gray-700 sticky top-[73px] z-40">
                <div className="container mx-auto px-4">
                    <div className="flex space-x-1">
                        <button
                            onClick={() => setActiveTab('new')}
                            className={`px-8 py-3 font-semibold text-lg transition ${
                                activeTab === 'new'
                                    ? 'bg-red-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            🆕 NEW ORDERS
                            {newOrders.length > 0 && (
                                <span className="ml-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-sm">
                                    {newOrders.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('preparing')}
                            className={`px-8 py-3 font-semibold text-lg transition ${
                                activeTab === 'preparing'
                                    ? 'bg-red-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            🔥 IN PREPARATION
                            {preparingOrders.length > 0 && (
                                <span className="ml-2 bg-blue-500 text-white px-2 py-0.5 rounded-full text-sm">
                                    {preparingOrders.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Orders Grid */}
            <div className="container mx-auto px-4 py-6 pb-16">
                {activeTab === 'new' && (
                    <div>
                        {newOrders.length === 0 ? (
                            <div className="text-center py-20">
                                <FaUtensils className="text-6xl text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-400 text-2xl">No New Orders</p>
                                <p className="text-gray-500 text-lg mt-2">Waiting for orders from counter...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {newOrders.map(order => (
                                    <div
                                        key={order._id}
                                        className={`bg-white rounded-lg shadow-xl overflow-hidden border-l-8 transition-transform hover:scale-102 ${getUrgencyClass(order.orderTime)} border-l-${getStatusColor(order.status).replace('bg-', '')}`}
                                    >
                                        {/* Order Header */}
                                        <div className={`${getStatusColor(order.status)} text-white p-5`}>
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center space-x-3">
                                                    {getStatusIcon(order.status)}
                                                    <span className="text-3xl font-bold">Table {order.tableNumber}</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-mono">{formatTime(order.orderTime)}</div>
                                                    <div className="text-sm opacity-90">{getOrderAge(order.orderTime)}</div>
                                                </div>
                                            </div>
                                            {order.customerName && order.customerName !== 'Guest' && (
                                                <div className="mt-2 text-sm opacity-90">
                                                    👤 {order.customerName}
                                                </div>
                                            )}
                                            {order.customerCount > 1 && (
                                                <div className="text-sm opacity-90">
                                                    👥 {order.customerCount} guests
                                                </div>
                                            )}
                                        </div>

                                        {/* Order Items */}
                                        <div className="p-5 max-h-80 overflow-y-auto">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0">
                                                    <div className="flex items-center space-x-2">
                                                        {item.isVeg ? (
                                                            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                                                        ) : (
                                                            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                                                        )}
                                                        <span className="font-bold text-lg">{item.quantity}x</span>
                                                        <span className="text-base">{item.name}</span>
                                                    </div>
                                                    <div className="text-gray-600 font-medium">₹{item.price * item.quantity}</div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Order Footer */}
                                        <div className="border-t p-5 bg-gray-50">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="font-bold text-lg">Total:</span>
                                                <span className="text-2xl font-bold text-green-600">₹{order.totalAmount}</span>
                                            </div>
                                            <button
                                                onClick={() => updateOrderStatus(order._id, 'Preparing')}
                                                disabled={loading}
                                                className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 font-bold text-lg transition disabled:opacity-50"
                                            >
                                                🔪 START PREPARING
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'preparing' && (
                    <div>
                        {preparingOrders.length === 0 ? (
                            <div className="text-center py-20">
                                <FaFire className="text-6xl text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-400 text-2xl">No Orders in Preparation</p>
                                <p className="text-gray-500 text-lg mt-2">Start preparing from new orders</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {preparingOrders.map(order => (
                                    <div
                                        key={order._id}
                                        className={`bg-white rounded-lg shadow-xl overflow-hidden border-l-8 border-l-blue-500 transition-transform hover:scale-102`}
                                    >
                                        {/* Order Header */}
                                        <div className="bg-blue-500 text-white p-5">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center space-x-3">
                                                    <FaFire className="text-2xl" />
                                                    <span className="text-3xl font-bold">Table {order.tableNumber}</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-mono">{formatTime(order.orderTime)}</div>
                                                    <div className="text-sm opacity-90">{getOrderAge(order.orderTime)}</div>
                                                </div>
                                            </div>
                                            {order.preparingTime && (
                                                <div className="mt-2 text-sm opacity-90">
                                                    ⏲️ Started: {formatTime(order.preparingTime)}
                                                </div>
                                            )}
                                        </div>

                                        {/* Order Items */}
                                        <div className="p-5 max-h-80 overflow-y-auto">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0">
                                                    <div className="flex items-center space-x-2">
                                                        {item.isVeg ? (
                                                            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                                                        ) : (
                                                            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                                                        )}
                                                        <span className="font-bold text-lg">{item.quantity}x</span>
                                                        <span className="text-base">{item.name}</span>
                                                    </div>
                                                    <div className="text-gray-600 font-medium">₹{item.price * item.quantity}</div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Order Footer */}
                                        <div className="border-t p-5 bg-gray-50">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="font-bold text-lg">Total:</span>
                                                <span className="text-2xl font-bold text-green-600">₹{order.totalAmount}</span>
                                            </div>
                                            <button
                                                onClick={() => updateOrderStatus(order._id, 'Ready to Serve')}
                                                disabled={loading}
                                                className="w-full bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 font-bold text-lg transition disabled:opacity-50"
                                            >
                                                ✅ READY TO SERVE
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Stats Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex justify-between items-center text-gray-300">
                        <div className="flex items-center space-x-6">
                            <span className="text-base">📊 Total Active: <span className="font-bold text-white">{orders.length}</span></span>
                            <span className="text-base">🆕 New: <span className="font-bold text-yellow-400">{newOrders.length}</span></span>
                            <span className="text-base">🔥 Preparing: <span className="font-bold text-blue-400">{preparingOrders.length}</span></span>
                        </div>
                        <div className="text-sm">
                            Last Updated: {new Date().toLocaleTimeString()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KitchenDisplay;