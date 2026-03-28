import React from 'react';
import { format } from 'date-fns';

const ThermalBill = ({ order, restaurantInfo = {} }) => {
    const defaultRestaurant = {
        name: 'Hotel Mitraya',
        address: 'Your Restaurant Address',
        phone: '+91 XXXXXXXXXX',
        gst: 'XXXXXXXXXXX'
    };

    const restaurant = { ...defaultRestaurant, ...restaurantInfo };

    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalWithParcel = order.isParcel ? subtotal + 10 : subtotal;
    const balanceDue = totalWithParcel - (order.prepaidAmount || 0);

    const printBill = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Bill - Table ${order.tableNumber}</title>
                <style>
                    body {
                        font-family: 'Courier New', monospace;
                        width: 80mm;
                        margin: 0 auto;
                        padding: 10px;
                        font-size: 12px;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 10px;
                        border-bottom: 1px dashed #000;
                        padding-bottom: 10px;
                    }
                    .restaurant-name {
                        font-size: 18px;
                        font-weight: bold;
                    }
                    .bill-title {
                        font-size: 14px;
                        font-weight: bold;
                        margin: 10px 0;
                    }
                    .info-row {
                        display: flex;
                        justify-content: space-between;
                        margin: 5px 0;
                    }
                    .items {
                        margin: 10px 0;
                        border-top: 1px dashed #000;
                        border-bottom: 1px dashed #000;
                        padding: 10px 0;
                    }
                    .item-row {
                        display: flex;
                        justify-content: space-between;
                        margin: 3px 0;
                    }
                    .total-row {
                        display: flex;
                        justify-content: space-between;
                        margin: 5px 0;
                        font-weight: bold;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 15px;
                        padding-top: 10px;
                        border-top: 1px dashed #000;
                        font-size: 10px;
                    }
                    @media print {
                        @page {
                            margin: 0;
                            size: 80mm auto;
                        }
                        body {
                            margin: 0;
                            padding: 5mm;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="restaurant-name">${restaurant.name}</div>
                    <div>${restaurant.address}</div>
                    <div>Ph: ${restaurant.phone}</div>
                    <div>GST: ${restaurant.gst}</div>
                </div>
                
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
                    <div>★★★★★</div>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.onafterprint = () => printWindow.close();
    };

    return { printBill };
};

export default ThermalBill;