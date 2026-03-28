const Staff = require('../models/Staff');

// @desc    Get all staff
// @route   GET /api/staff
exports.getStaff = async (req, res) => {
    try {
        const staff = await Staff.find().sort({ name: 1 });
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single staff
// @route   GET /api/staff/:id
exports.getStaffById = async (req, res) => {
    try {
        const staff = await Staff.findById(req.params.id);
        if (!staff) {
            return res.status(404).json({ message: 'Staff not found' });
        }
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create staff
// @route   POST /api/staff
exports.createStaff = async (req, res) => {
    try {
        const { name, role, monthlySalary, perDayDeduction } = req.body;
        
        const staff = await Staff.create({
            name,
            role,
            monthlySalary,
            perDayDeduction
        });
        
        res.status(201).json(staff);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update staff
// @route   PUT /api/staff/:id
exports.updateStaff = async (req, res) => {
    try {
        const staff = await Staff.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!staff) {
            return res.status(404).json({ message: 'Staff not found' });
        }
        
        res.json(staff);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete staff
// @route   DELETE /api/staff/:id
exports.deleteStaff = async (req, res) => {
    try {
        const staff = await Staff.findByIdAndDelete(req.params.id);
        
        if (!staff) {
            return res.status(404).json({ message: 'Staff not found' });
        }
        
        res.json({ message: 'Staff deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};