const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Present', 'Absent'],
        required: true
    },
    markedAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure one attendance per staff per day
attendanceSchema.index({ staffId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);