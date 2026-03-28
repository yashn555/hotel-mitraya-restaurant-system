const Attendance = require('../models/Attendance');
const Staff = require('../models/Staff');
const mongoose = require('mongoose');

// @desc    Mark attendance
// @route   POST /api/attendance
exports.markAttendance = async (req, res) => {
    try {
        const { staffId, date, status } = req.body;
        
        const attendance = await Attendance.findOneAndUpdate(
            { staffId, date: new Date(date) },
            { status, markedAt: new Date() },
            { new: true, upsert: true, runValidators: true }
        );
        
        res.status(201).json(attendance);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get attendance by date
// @route   GET /api/attendance/date/:date
exports.getAttendanceByDate = async (req, res) => {
    try {
        const date = new Date(req.params.date);
        const attendance = await Attendance.find({ 
            date: {
                $gte: new Date(date.setHours(0,0,0)),
                $lt: new Date(date.setHours(23,59,59))
            }
        }).populate('staffId', 'name role');
        
        // Get all staff
        const allStaff = await Staff.find({ isActive: true });
        
        // Combine data
        const attendanceData = allStaff.map(staff => {
            const record = attendance.find(a => a.staffId._id.toString() === staff._id.toString());
            return {
                staffId: staff._id,
                name: staff.name,
                role: staff.role,
                status: record ? record.status : 'Absent',
                markedAt: record ? record.markedAt : null
            };
        });
        
        res.json(attendanceData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get monthly attendance
// @route   GET /api/attendance/monthly/:year/:month
exports.getMonthlyAttendance = async (req, res) => {
    try {
        const { year, month } = req.params;
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        
        const attendance = await Attendance.find({
            date: {
                $gte: startDate,
                $lte: endDate
            }
        }).populate('staffId', 'name role monthlySalary perDayDeduction');
        
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get staff monthly summary
// @route   GET /api/attendance/summary/:staffId/:year/:month
exports.getStaffMonthlySummary = async (req, res) => {
    try {
        const { staffId, year, month } = req.params;
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        
        const attendance = await Attendance.find({
            staffId,
            date: {
                $gte: startDate,
                $lte: endDate
            }
        });
        
        const staff = await Staff.findById(staffId);
        
        const absentDays = attendance.filter(a => a.status === 'Absent').length;
        const presentDays = attendance.filter(a => a.status === 'Present').length;
        const totalDays = new Date(year, month, 0).getDate();
        
        const salary = staff.monthlySalary - (absentDays * staff.perDayDeduction);
        
        res.json({
            staffName: staff.name,
            totalDays,
            presentDays,
            absentDays,
            monthlySalary: staff.monthlySalary,
            perDayDeduction: staff.perDayDeduction,
            calculatedSalary: salary > 0 ? salary : 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};