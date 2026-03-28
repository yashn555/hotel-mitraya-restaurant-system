import React, { useState } from 'react';
import { format } from 'date-fns';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaPrint, FaSave, FaTimes, FaRupeeSign } from 'react-icons/fa';

const BillModal = ({ order, onClose, onCheckoutComplete }) => {
    const [processing, setProcessing] = useState(false);
    const [checkoutDone, setCheckoutDone] = useState(false);

    if (!order) return null;

    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalWithParcel = order.isParcel ? subtotal + 10 : subtotal;
    const balanceDue = totalWithParcel - (order.prepaidAmount || 0);

    const restaurantInfo = {
        name: 'Hotel Mitraya',
        address: 'Chaitanya Park, lane no.01, Nr. Honda showroom, DY Patil cig road, Akurdi, Pimpri-chinchwad, 412191',
        phone: '+91 7420903459/9158691003',
        gst: '@XXXXXXXXXXX'
    
    };

    const getThermalBillHTML = () => {
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Bill - Table ${order.tableNumber}</title>
    <style>
        body {
            font-family: 'Courier New', monospace;
            width: 80mm;
            margin: 0 auto;
            padding: 8px;
            font-size: 12px;
        }
        .header {
            text-align: center;
            margin-bottom: 10px;
            border-bottom: 1px dashed #000;
            padding-bottom: 8px;
        }
        .restaurant-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 3px;
        }
        .restaurant-details {
            font-size: 9px;
            color: #666;
        }
        .bill-title {
            font-size: 12px;
            font-weight: bold;
            margin: 8px 0;
            text-align: center;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin: 4px 0;
            font-size: 11px;
        }
        .items {
            margin: 8px 0;
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            padding: 8px 0;
        }
        .item-row {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
            font-size: 11px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
            font-weight: bold;
            font-size: 12px;
        }
        .footer {
            text-align: center;
            margin-top: 12px;
            padding-top: 8px;
            border-top: 1px dashed #000;
            font-size: 9px;
        }
        @media print {
            @page {
                margin: 0;
                size: 80mm auto;
            }
            body {
                margin: 0;
                padding: 4mm;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="restaurant-name">${restaurantInfo.name}</div>
        <div class="restaurant-details">${restaurantInfo.address}</div>
        <div class="restaurant-details">📞 ${restaurantInfo.phone}</div>
        <div class="restaurant-details">Instagram: ${restaurantInfo.gst}</div>
    </div>
    
    <div class="bill-title">TAX INVOICE</div>
    
    <div class="info-row">
        <span>Bill No: ${order._id.slice(-8)}</span>
        <span>Table: ${order.tableNumber}</span>
    </div>
    <div class="info-row">
        <span>Date: ${format(new Date(order.orderTime), 'dd/MM/yyyy')}</span>
        <span>Time: ${format(new Date(order.orderTime), 'hh:mm a')}</span>
    </div>
    ${order.customerName && order.customerName !== 'Guest' ? `
    <div class="info-row">
        <span>Customer: ${order.customerName}</span>
        <span>Guests: ${order.customerCount}</span>
    </div>
    ` : ''}
    
    <div class="items">
        ${order.items.map(item => `
            <div class="item-row">
                <span>${item.name} x ${item.quantity}</span>
                <span>₹${item.price * item.quantity}</span>
            </div>
        `).join('')}
    </div>
    
    <div class="info-row">
        <span>Subtotal:</span>
        <span>₹${subtotal}</span>
    </div>
    ${order.isParcel ? `
    <div class="info-row">
        <span>Parcel Charge:</span>
        <span>₹10</span>
    </div>
    ` : ''}
    ${order.prepaidAmount > 0 ? `
    <div class="info-row">
        <span>Prepaid:</span>
        <span>-₹${order.prepaidAmount}</span>
    </div>
    ` : ''}
    <div class="total-row">
        <span>TOTAL:</span>
        <span>₹${balanceDue}</span>
    </div>
    
    <div class="info-row">
        <span>Payment:</span>
        <span>${order.paymentType}</span>
    </div>
    
    <div class="footer">
        <div>Thank you for dining with us!</div>
        <div>Please visit again</div>
        <div>⭐ Hotel Mitraya ⭐</div>
    </div>
</body>
</html>`;
    };

    const saveBill = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/bills/save', {
                order: order,
                billType: 'thermal',
                restaurantInfo: restaurantInfo
            });
            
            if (response.data.success) {
                console.log('Bill saved:', response.data.filePath);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error saving bill:', error);
            return false;
        }
    };

    const printBill = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(getThermalBillHTML());
        printWindow.document.close();
        printWindow.print();
        printWindow.onafterprint = () => printWindow.close();
    };

    const handleCheckout = async () => {
        setProcessing(true);
        
        try {
            // First save the bill
            const saved = await saveBill();
            
            if (saved) {
                // Then print
                printBill();
                toast.success('Bill saved and printed successfully!');
                setCheckoutDone(true);
                
                // Wait a moment then close modal and trigger parent completion
                setTimeout(() => {
                    if (onCheckoutComplete) {
                        onCheckoutComplete();
                    }
                    onClose();
                }, 1500);
            } else {
                toast.error('Error saving bill. Please try again.');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error('Error processing checkout');
        } finally {
            setProcessing(false);
        }
    };

    if (checkoutDone) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
                    <div className="text-green-500 text-5xl mb-4">✓</div>
                    <h2 className="text-2xl font-bold mb-2">Checkout Complete!</h2>
                    <p className="text-gray-600 mb-4">Bill has been saved and printed successfully.</p>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                {/* Bill Preview */}
                <div className="p-6 border-b">
                    <div className="text-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-800">Hotel Mitraya</h2>
                        <p className="text-gray-600 text-sm">Final Bill</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Table:</span>
                            <span className="font-semibold">{order.tableNumber}</span>
                        </div>
                        {order.customerName && order.customerName !== 'Guest' && (
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Customer:</span>
                                <span className="font-semibold">{order.customerName}</span>
                            </div>
                        )}
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Items:</span>
                            <span className="font-semibold">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                        </div>
                    </div>
                    
                    <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                                <div className="flex items-center">
                                    {item.isVeg ? (
                                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                    ) : (
                                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                    )}
                                    <span>{item.name} x {item.quantity}</span>
                                </div>
                                <span>₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                    </div>
                    
                    <div className="border-t pt-3">
                        <div className="flex justify-between mb-1">
                            <span className="text-gray-600">Subtotal:</span>
                            <span>₹{subtotal}</span>
                        </div>
                        {order.isParcel && (
                            <div className="flex justify-between mb-1">
                                <span className="text-gray-600">Parcel Charge:</span>
                                <span>₹10</span>
                            </div>
                        )}
                        {order.prepaidAmount > 0 && (
                            <div className="flex justify-between mb-1 text-green-600">
                                <span>Prepaid:</span>
                                <span>-₹{order.prepaidAmount}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-xl font-bold mt-2 pt-2 border-t">
                            <span>Total:</span>
                            <span className="text-green-600">₹{balanceDue}</span>
                        </div>
                    </div>
                    
                    <div className="mt-4 text-sm text-gray-500">
                        <p>Payment: {order.paymentType}</p>
                    </div>
                </div>
                
                {/* Single Checkout Button */}
                <div className="p-6">
                    <button
                        onClick={handleCheckout}
                        disabled={processing}
                        className={`w-full py-3 rounded-lg font-semibold text-white transition flex items-center justify-center space-x-2 ${
                            processing 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-green-600 hover:bg-green-700'
                        }`}
                    >
                        {processing ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Processing...</span>
                            </>
                        ) : (
                            <>
                                <FaPrint />
                                <FaRupeeSign />
                                <span>Checkout & Print Bill</span>
                            </>
                        )}
                    </button>
                    
                    <button
                        onClick={onClose}
                        className="w-full mt-3 py-2 text-gray-600 hover:text-gray-800 transition"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BillModal;