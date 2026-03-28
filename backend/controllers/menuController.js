const Menu = require('../models/Menu');

// @desc    Get all menu items
// @route   GET /api/menu
exports.getMenuItems = async (req, res) => {
    try {
        const menuItems = await Menu.find().sort({ category: 1, name: 1 });
        res.json(menuItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single menu item
// @route   GET /api/menu/:id
exports.getMenuItem = async (req, res) => {
    try {
        const menuItem = await Menu.findById(req.params.id);
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        res.json(menuItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create menu item
// @route   POST /api/menu
exports.createMenuItem = async (req, res) => {
    try {
        const { name, price, category, isAvailable } = req.body;
        
        const menuItem = await Menu.create({
            name,
            price,
            category,
            isAvailable: isAvailable !== undefined ? isAvailable : true
        });
        
        res.status(201).json(menuItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
exports.updateMenuItem = async (req, res) => {
    try {
        const menuItem = await Menu.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        
        res.json(menuItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
exports.deleteMenuItem = async (req, res) => {
    try {
        const menuItem = await Menu.findByIdAndDelete(req.params.id);
        
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        
        res.json({ message: 'Menu item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle menu item availability
// @route   PATCH /api/menu/:id/toggle
exports.toggleAvailability = async (req, res) => {
    try {
        const menuItem = await Menu.findById(req.params.id);
        
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        
        menuItem.isAvailable = !menuItem.isAvailable;
        await menuItem.save();
        
        res.json(menuItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};