import React, { useState, useEffect } from 'react';
import { getOrders, updateOrder, markOrderReady } from '../services/api';
import { connectSocket, onOrderUpdate, offOrderUpdate } from '../services/socket';
import { format } from 'date-fns';
import axios from 'axios';
import toast from 'react-hot-toast';

const KitchenScreen = () => {
    const [pendingOrders, setPendingOrders] = useState([]);
    const [preparingOrders, setPreparingOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadOrders();
        
        const socket = connectSocket();
        onOrderUpdate(() => {
            loadOrders();
        });
        
        return () => {
            offOrderUpdate();
        };
    }, []);

    const loadOrders = async () => {
        try {
            const response = await getOrders();
            const orders = response.data;
            
            const pending = orders.filter(order => 
                order.status === 'Occupied' && !order.isParcel
            );
            const preparing = orders.filter(order => 
                order.status === 'Preparing'
            );
            
            setPendingOrders(pending);
            setPreparingOrders(preparing);
        } catch (error) {
            console.error('Error loading orders:', error);
            toast.error('Error loading orders');
        }
    };

    const handleKitchenStatus = async (orderId, status) => {
        setLoading(true);
        try {
            const response = await axios.patch(`http://localhost:5000/api/orders/${orderId}/kitchen-status`, { status });
            toast.success(`Order marked as ${status}`);
            loadOrders();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Error updating order status');
        } finally {
            setLoading(false);
        }
    };

    const OrderCard = ({ order, type }) => (
        <div className={`bg-white rounded-lg shadow-lg p-6 mb-4 border-l-8 ${
            type === 'pending' ? 'border-yellow-500' : 'border-blue-500'
        }`}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-2xl font-bold">Table {order.tableNumber}</h3>
                    {order.customerName !== 'Guest' && (
                        <p className="text-sm text-gray-600">Customer: {order.customerName}</p>
                    )}
                    <p className="text-sm text-gray-500">
                        {format(new Date(order.orderTime), 'hh:mm a')}
                    </p>
                </div>
                {order.isParcel && (
                    <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm">
                        Parcel
                    </span>
                )}
                <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                        order.status === 'Occupied' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'Preparing' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                    }`}>
                        {order.status}
                    </span>
                </div>
            </div>
            
            <div className="space-y-2 mb-4">
                {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                        <div className="flex items-center">
                            {item.isVeg ? (
                                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                            ) : (
                                <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                            )}
                            <span className="text-lg">
                                {item.quantity}x {item.name}
                            </span>
                        </div>
                        <span className="font-semibold">₹{item.price * item.quantity}</span>
                    </div>
                ))}
            </div>
            
            <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between font-bold mb-3">
                    <span>Total:</span>
                    <span>₹{order.totalAmount}</span>
                </div>
                
                {order.status === 'Occupied' && (
                    <button
                        onClick={() => handleKitchenStatus(order._id, 'Preparing')}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Start Preparing
                    </button>
                )}
                
                {order.status === 'Preparing' && (
                    <button
                        onClick={() => handleKitchenStatus(order._id, 'Ready to Serve')}
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                    >
                        Ready to Serve
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Kitchen Display System</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pending Orders */}
                <div>
                    <h2 className="text-2xl font-semibold mb-4 text-yellow-700">
                        New Orders ({pendingOrders.length})
                    </h2>
                    {pendingOrders.length === 0 ? (
                        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                            No new orders
                        </div>
                    ) : (
                        pendingOrders.map(order => (
                            <OrderCard key={order._id} order={order} type="pending" />
                        ))
                    )}
                </div>
                
                {/* Preparing Orders */}
                <div>
                    <h2 className="text-2xl font-semibold mb-4 text-blue-700">
                        In Preparation ({preparingOrders.length})
                    </h2>
                    {preparingOrders.length === 0 ? (
                        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                            No orders in preparation
                        </div>
                    ) : (
                        preparingOrders.map(order => (
                            <OrderCard key={order._id} order={order} type="preparing" />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default KitchenScreen;