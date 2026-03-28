import React, { useState, useEffect } from 'react';
import { getOrderByTable, createOrder, updateOrder, markOrderReady, markOrderPaid } from '../services/api';
import { connectSocket, onOrderUpdate, offOrderUpdate, emitOrderUpdate } from '../services/socket';
import TableCard from '../components/TableCard';
import MenuItem from '../components/MenuItem';
import BillModal from '../components/BillModal';
import toast from 'react-hot-toast';
import axios from 'axios';

const CounterScreen = () => {
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [filteredMenu, setFilteredMenu] = useState([]);
    const [cart, setCart] = useState([]);
    const [isParcel, setIsParcel] = useState(false);
    const [paymentType, setPaymentType] = useState('Not Paid');
    const [prepaidAmount, setPrepaidAmount] = useState(0);
    const [showBill, setShowBill] = useState(false);
    const [socket, setSocket] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [customerName, setCustomerName] = useState('');
    const [customerCount, setCustomerCount] = useState(1);
    const [showAddItemsModal, setShowAddItemsModal] = useState(false);
    const [extraItems, setExtraItems] = useState([]);

    useEffect(() => {
        loadMenuItems();
        loadTables();
        
        const newSocket = connectSocket();
        setSocket(newSocket);
        
        onOrderUpdate((data) => {
            if (data.tableNumber === selectedTable) {
                loadCurrentOrder(selectedTable);
            }
            loadTables();
        });
        
        return () => {
            offOrderUpdate();
        };
    }, []);

    useEffect(() => {
        filterMenu();
    }, [searchTerm, selectedCategory, menuItems]);

    const loadMenuItems = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/menu');
            setMenuItems(response.data);
        } catch (error) {
            console.error('Error loading menu:', error);
            toast.error('Failed to load menu items');
        }
    };

    const filterMenu = () => {
        let filtered = [...menuItems];
        
        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(item => 
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Category filter
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(item => item.category === selectedCategory);
        }
        
        setFilteredMenu(filtered);
    };

    const loadTables = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/orders');
            const orders = response.data;
            const tableStatus = {};
            for (let i = 1; i <= 16; i++) {
                const order = orders.find(o => o.tableNumber === i && o.status !== 'Paid' && o.status !== 'Free');
                if (order) {
                    tableStatus[i] = order.status;
                } else {
                    tableStatus[i] = 'Free';
                }
            }
            setTables(tableStatus);
        } catch (error) {
            console.error('Error loading tables:', error);
            toast.error('Failed to load tables');
        }
    };

    const loadCurrentOrder = async (tableNumber) => {
        try {
            const response = await getOrderByTable(tableNumber);
            if (response.data) {
                setCurrentOrder(response.data);
                const cartItems = response.data.items.map(item => ({
                    menuItem: item.menuItem._id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    isVeg: item.isVeg
                }));
                setCart(cartItems);
                setIsParcel(response.data.isParcel);
                setPaymentType(response.data.paymentType);
                setPrepaidAmount(response.data.prepaidAmount || 0);
                setCustomerName(response.data.customerName || '');
                setCustomerCount(response.data.customerCount || 1);
            } else {
                setCurrentOrder(null);
                setCart([]);
                setIsParcel(false);
                setPaymentType('Not Paid');
                setPrepaidAmount(0);
                setCustomerName('');
                setCustomerCount(1);
            }
        } catch (error) {
            console.error('Error loading order:', error);
        }
    };

    const handleTableClick = async (tableNumber) => {
        setSelectedTable(tableNumber);
        await loadCurrentOrder(tableNumber);
    };

    const addToCart = (item) => {
        const existingItem = cart.find(cartItem => cartItem.menuItem === item._id);
        if (existingItem) {
            setCart(cart.map(cartItem =>
                cartItem.menuItem === item._id
                    ? { ...cartItem, quantity: cartItem.quantity + 1 }
                    : cartItem
            ));
        } else {
            setCart([...cart, {
                menuItem: item._id,
                name: item.name,
                price: item.price,
                quantity: 1,
                isVeg: item.isVeg
            }]);
        }
        toast.success(`${item.name} added to cart`);
    };

    const updateQuantity = (menuItemId, delta) => {
        const item = cart.find(i => i.menuItem === menuItemId);
        if (item) {
            const newQuantity = item.quantity + delta;
            if (newQuantity <= 0) {
                setCart(cart.filter(i => i.menuItem !== menuItemId));
                toast.success('Item removed from cart');
            } else {
                setCart(cart.map(i =>
                    i.menuItem === menuItemId
                        ? { ...i, quantity: newQuantity }
                        : i
                ));
            }
        }
    };

    const removeItem = (menuItemId) => {
        setCart(cart.filter(i => i.menuItem !== menuItemId));
        toast.success('Item removed from cart');
    };

    const calculateTotal = () => {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return isParcel ? subtotal + 10 : subtotal;
    };

    const handlePlaceOrder = async () => {
        if (cart.length === 0) {
            toast.error('Please add items to order');
            return;
        }

        setLoading(true);
        
        const orderData = {
            tableNumber: selectedTable,
            customerName: customerName || 'Guest',
            customerCount: customerCount,
            items: cart.map(item => ({
                menuItem: item.menuItem,
                quantity: item.quantity
            })),
            isParcel: isParcel,
            paymentType: paymentType,
            prepaidAmount: prepaidAmount
        };

        try {
            let response;
            if (currentOrder) {
                response = await updateOrder(currentOrder._id, orderData);
                toast.success('Order updated successfully');
            } else {
                response = await createOrder(orderData);
                toast.success('Order placed successfully');
            }
            
            setCurrentOrder(response.data);
            
            if (socket) {
                emitOrderUpdate({ 
                    type: 'order_updated', 
                    tableNumber: selectedTable,
                    order: response.data 
                });
            }
            
            await loadTables();
            await loadCurrentOrder(selectedTable);
            
        } catch (error) {
            console.error('Error placing order:', error);
            if (error.response) {
                toast.error(error.response.data.message || 'Error placing order');
            } else {
                toast.error('Error placing order');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAddExtraItems = async () => {
        if (extraItems.length === 0) {
            toast.error('Please add items');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`http://localhost:5000/api/orders/${currentOrder._id}/add-items`, {
                items: extraItems
            });
            
            setCurrentOrder(response.data);
            await loadCurrentOrder(selectedTable);
            setShowAddItemsModal(false);
            setExtraItems([]);
            toast.success('Extra items added successfully');
            
            if (socket) {
                emitOrderUpdate({ 
                    type: 'order_updated', 
                    tableNumber: selectedTable,
                    order: response.data 
                });
            }
        } catch (error) {
            console.error('Error adding items:', error);
            toast.error('Error adding items');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkServed = async () => {
        if (!currentOrder) return;
        setLoading(true);
        try {
            const response = await axios.patch(`http://localhost:5000/api/orders/${currentOrder._id}/serve`);
            toast.success('Food served to table');
            setCurrentOrder(response.data);
            await loadCurrentOrder(selectedTable);
        } catch (error) {
            console.error('Error marking served:', error);
            toast.error('Error marking served');
        } finally {
            setLoading(false);
        }
    };

    const handleStartEating = async () => {
        if (!currentOrder) return;
        setLoading(true);
        try {
            const response = await axios.patch(`http://localhost:5000/api/orders/${currentOrder._id}/start-eating`);
            toast.success('Customer started eating');
            setCurrentOrder(response.data);
            await loadCurrentOrder(selectedTable);
        } catch (error) {
            console.error('Error starting eating:', error);
            toast.error('Error starting eating');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkPaid = async () => {
        if (!currentOrder) return;
        setLoading(true);
        try {
            const response = await markOrderPaid(currentOrder._id);
            toast.success('Bill paid successfully');
            setShowBill(true);
            setCurrentOrder(response.data);
            
            if (socket) {
                emitOrderUpdate({ 
                    type: 'order_paid', 
                    tableNumber: selectedTable,
                    order: response.data 
                });
            }
            
            await loadTables();
        } catch (error) {
            console.error('Error marking paid:', error);
            toast.error('Error processing payment');
        } finally {
            setLoading(false);
        }
    };

    const handlePrintBill = () => {
        toast.success('Bill printed successfully');
        setShowBill(false);
        setSelectedTable(null);
        setCurrentOrder(null);
        setCart([]);
        setIsParcel(false);
        setPaymentType('Not Paid');
        setPrepaidAmount(0);
    };

    const getTableStatus = (tableNumber) => {
        return tables[tableNumber] || 'Free';
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Tables Grid */}
            <div className="lg:col-span-1">
                <h2 className="text-2xl font-bold mb-4">Tables</h2>
                <div className="grid grid-cols-2 gap-4">
                    {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16].map(table => (
                        <TableCard
                            key={table}
                            tableNumber={table}
                            status={getTableStatus(table)}
                            onClick={() => handleTableClick(table)}
                        />
                    ))}
                </div>
            </div>
            
            {/* Order Management */}
            <div className="lg:col-span-2">
                {selectedTable ? (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Table {selectedTable}</h2>
                            <button
                                onClick={() => {
                                    setSelectedTable(null);
                                    setCurrentOrder(null);
                                    setCart([]);
                                }}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                            >
                                Close
                            </button>
                        </div>
                        
                        {/* Customer Info */}
                        <div className="bg-white rounded-lg shadow p-4 mb-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Customer Name (Optional)"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="border rounded px-3 py-2"
                                />
                                <input
                                    type="number"
                                    placeholder="Number of Customers"
                                    value={customerCount}
                                    onChange={(e) => setCustomerCount(parseInt(e.target.value))}
                                    className="border rounded px-3 py-2"
                                    min="1"
                                />
                            </div>
                        </div>
                        
                        {/* Order Options */}
                        <div className="bg-white rounded-lg shadow p-4 mb-4">
                            <div className="flex space-x-4">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isParcel}
                                        onChange={(e) => setIsParcel(e.target.checked)}
                                        className="mr-2"
                                    />
                                    <span>Parcel (Additional ₹10)</span>
                                </label>
                                <select
                                    value={paymentType}
                                    onChange={(e) => setPaymentType(e.target.value)}
                                    className="border rounded px-3 py-1"
                                >
                                    <option value="Not Paid">Not Paid</option>
                                    <option value="Prepaid">Full Prepaid</option>
                                    <option value="Partial Prepaid">Partial Prepaid</option>
                                </select>
                                {paymentType !== 'Not Paid' && (
                                    <input
                                        type="number"
                                        placeholder="Prepaid Amount"
                                        value={prepaidAmount}
                                        onChange={(e) => setPrepaidAmount(parseInt(e.target.value))}
                                        className="border rounded px-3 py-1 w-32"
                                    />
                                )}
                                {currentOrder && (
                                    <div className="ml-auto">
                                        <span className={`px-3 py-1 rounded-full text-sm ${
                                            currentOrder.status === 'Occupied' ? 'bg-yellow-100 text-yellow-800' :
                                            currentOrder.status === 'Preparing' ? 'bg-blue-100 text-blue-800' :
                                            currentOrder.status === 'Ready to Serve' ? 'bg-green-100 text-green-800' :
                                            currentOrder.status === 'Served' ? 'bg-purple-100 text-purple-800' :
                                            currentOrder.status === 'Eating' ? 'bg-pink-100 text-pink-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {currentOrder.status}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Search and Filter */}
                        <div className="bg-white rounded-lg shadow p-4 mb-4">
                            <div className="flex space-x-4">
                                <input
                                    type="text"
                                    placeholder="Search menu items..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="flex-1 border rounded px-3 py-2"
                                />
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="border rounded px-3 py-2"
                                >
                                    <option value="all">All Items</option>
                                    <option value="Veg">Veg Only</option>
                                    <option value="Non-Veg">Non-Veg Only</option>
                                    <option value="Beverages">Beverages</option>
                                    <option value="Desserts">Desserts</option>
                                </select>
                            </div>
                        </div>
                        
                        {/* Menu Items */}
                        <div className="mb-4">
                            <h3 className="text-xl font-semibold mb-2">Menu</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                                {filteredMenu.map(item => (
                                    <MenuItem
                                        key={item._id}
                                        item={item}
                                        onAdd={addToCart}
                                        quantity={cart.find(i => i.menuItem === item._id)?.quantity || 0}
                                    />
                                ))}
                            </div>
                        </div>
                        
                        {/* Cart */}
                        <div className="bg-white rounded-lg shadow p-4">
                            <h3 className="text-xl font-semibold mb-2">Current Order</h3>
                            {cart.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No items added</p>
                            ) : (
                                <>
                                    <div className="max-h-64 overflow-y-auto">
                                        {cart.map(item => (
                                            <div key={item.menuItem} className="flex justify-between items-center py-2 border-b">
                                                <div className="flex-1">
                                                    <div className="flex items-center">
                                                        {item.isVeg ? (
                                                            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                                                        ) : (
                                                            <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                                                        )}
                                                        <p className="font-semibold">{item.name}</p>
                                                    </div>
                                                    <p className="text-sm text-gray-600">₹{item.price} each</p>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <button
                                                        onClick={() => updateQuantity(item.menuItem, -1)}
                                                        className="w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300"
                                                        disabled={loading}
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.menuItem, 1)}
                                                        className="w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300"
                                                        disabled={loading}
                                                    >
                                                        +
                                                    </button>
                                                    <button
                                                        onClick={() => removeItem(item.menuItem)}
                                                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                                        disabled={loading}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 pt-2 border-t">
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Subtotal:</span>
                                            <span>₹{cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)}</span>
                                        </div>
                                        {isParcel && (
                                            <div className="flex justify-between text-sm text-gray-600 mt-1">
                                                <span>Parcel Charge:</span>
                                                <span>₹10</span>
                                            </div>
                                        )}
                                        {prepaidAmount > 0 && (
                                            <div className="flex justify-between text-sm text-gray-600 mt-1">
                                                <span>Prepaid:</span>
                                                <span>-₹{prepaidAmount}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-xl font-bold mt-2 pt-2 border-t">
                                            <span>Total Due:</span>
                                            <span className="text-green-600">₹{calculateTotal() - prepaidAmount}</span>
                                        </div>
                                    </div>
                                </>
                            )}
                            
                            <div className="mt-4 space-y-2">
                                <div className="flex space-x-3">
                                    <button
                                        onClick={handlePlaceOrder}
                                        disabled={loading || cart.length === 0}
                                        className={`flex-1 py-2 rounded-lg transition ${
                                            loading || cart.length === 0
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                                        }`}
                                    >
                                        {loading ? 'Processing...' : (currentOrder ? 'Update Order' : 'Place Order')}
                                    </button>
                                    
                                    {currentOrder && currentOrder.status === 'Ready to Serve' && (
                                        <button
                                            onClick={handleMarkServed}
                                            disabled={loading}
                                            className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
                                        >
                                            Serve Food
                                        </button>
                                    )}
                                </div>
                                
                                {currentOrder && currentOrder.status === 'Served' && (
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={handleStartEating}
                                            disabled={loading}
                                            className="flex-1 bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700"
                                        >
                                            Start Eating
                                        </button>
                                        <button
                                            onClick={() => setShowAddItemsModal(true)}
                                            disabled={loading}
                                            className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700"
                                        >
                                            Add Extra Items
                                        </button>
                                    </div>
                                )}
                                
                                {currentOrder && currentOrder.status === 'Eating' && (
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => setShowAddItemsModal(true)}
                                            className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700"
                                        >
                                            Add More Items
                                        </button>
                                        <button
                                            onClick={handleMarkPaid}
                                            disabled={loading}
                                            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                                        >
                                            Generate Bill & Pay
                                        </button>
                                    </div>
                                )}
                                
                                {currentOrder && currentOrder.status === 'Ready' && (
                                    <button
                                        onClick={handleMarkPaid}
                                        disabled={loading}
                                        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                                    >
                                        Generate Bill
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full bg-white rounded-lg shadow p-12">
                        <div className="text-center">
                            <p className="text-gray-500 text-lg mb-2">No table selected</p>
                            <p className="text-gray-400">Click on any table to start taking orders</p>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Add Extra Items Modal */}
            {showAddItemsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-4">Add Extra Items</h2>
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Search items..."
                                    className="w-full border rounded px-3 py-2"
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto mb-4">
                                {menuItems.filter(item => 
                                    item.name.toLowerCase().includes(searchTerm.toLowerCase())
                                ).map(item => (
                                    <div key={item._id} className="bg-gray-50 rounded p-3 flex justify-between items-center">
                                        <div>
                                            <div className="flex items-center">
                                                {item.isVeg ? (
                                                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                                                ) : (
                                                    <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                                                )}
                                                <p className="font-semibold">{item.name}</p>
                                            </div>
                                            <p className="text-sm text-gray-600">₹{item.price}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const existing = extraItems.find(i => i.menuItem === item._id);
                                                if (existing) {
                                                    setExtraItems(extraItems.map(i =>
                                                        i.menuItem === item._id
                                                            ? { ...i, quantity: i.quantity + 1 }
                                                            : i
                                                    ));
                                                } else {
                                                    setExtraItems([...extraItems, {
                                                        menuItem: item._id,
                                                        quantity: 1
                                                    }]);
                                                }
                                            }}
                                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            Add
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t pt-4">
                                <h3 className="font-semibold mb-2">Extra Items to Add:</h3>
                                {extraItems.map((item, idx) => {
                                    const menuItem = menuItems.find(m => m._id === item.menuItem);
                                    return menuItem ? (
                                        <div key={idx} className="flex justify-between items-center py-1">
                                            <span>{menuItem.name} x {item.quantity}</span>
                                            <button
                                                onClick={() => {
                                                    if (item.quantity > 1) {
                                                        setExtraItems(extraItems.map(i =>
                                                            i.menuItem === item.menuItem
                                                                ? { ...i, quantity: i.quantity - 1 }
                                                                : i
                                                        ));
                                                    } else {
                                                        setExtraItems(extraItems.filter(i => i.menuItem !== item.menuItem));
                                                    }
                                                }}
                                                className="text-red-600"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ) : null;
                                })}
                                <div className="flex space-x-3 mt-4">
                                    <button
                                        onClick={handleAddExtraItems}
                                        disabled={extraItems.length === 0}
                                        className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                                    >
                                        Add to Order
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowAddItemsModal(false);
                                            setExtraItems([]);
                                        }}
                                        className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Bill Modal */}
            {showBill && currentOrder && (
                <BillModal
                    order={currentOrder}
                    onClose={() => setShowBill(false)}
                    onPrint={handlePrintBill}
                />
            )}
        </div>
    );
};

export default CounterScreen;