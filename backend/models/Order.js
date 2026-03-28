const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    tableNumber: {
        type: Number,
        required: [true, 'Table number is required'],
        min: 1,
        max: 16
    },
    customerName: {
        type: String,
        default: 'Guest'
    },
    customerCount: {
        type: Number,
        default: 1
    },
    items: [{
        menuItem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Menu',
            required: true
        },
        name: String,
        price: Number,
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        isVeg: {
            type: Boolean,
            default: true
        }
    }],
    status: {
        type: String,
        enum: ['Occupied', 'Preparing', 'Ready to Serve', 'Served', 'Eating', 'Paid', 'Free'],
        default: 'Occupied'
    },
    totalAmount: {
        type: Number,
        required: true,
        default: 0
    },
    prepaidAmount: {
        type: Number,
        default: 0
    },
    remainingAmount: {
        type: Number,
        default: 0
    },
    isParcel: {
        type: Boolean,
        default: false
    },
    parcelCharge: {
        type: Number,
        default: 0
    },
    paymentType: {
        type: String,
        enum: ['Prepaid', 'Partial Prepaid', 'Not Paid', 'Paid'],
        default: 'Not Paid'
    },
    orderTime: {
        type: Date,
        default: Date.now
    },
    preparingTime: Date,
    readyTime: Date,
    servedTime: Date,
    eatingStartTime: Date,
    eatingEndTime: Date,
    paidTime: Date
});

// Indexes for better performance
orderSchema.index({ tableNumber: 1, status: 1 });
orderSchema.index({ orderTime: -1 });

module.exports = mongoose.model('Order', orderSchema);