const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Staff name is required'],
        trim: true
    },
    role: {
        type: String,
        required: [true, 'Role is required'],
        enum: ['Chef', 'Waiter', 'Cleaner', 'Manager', 'Cashier']
    },
    monthlySalary: {
        type: Number,
        required: [true, 'Monthly salary is required'],
        min: 0
    },
    perDayDeduction: {
        type: Number,
        required: [true, 'Per day deduction is required'],
        min: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    joiningDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Staff', staffSchema);