const Order = require('../models/Order');
const Menu = require('../models/Menu');

// @desc    Get all orders
// @route   GET /api/orders
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('items.menuItem')
            .sort({ orderTime: -1 });
        res.json(orders);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get orders by status
// @route   GET /api/orders/status/:status
exports.getOrdersByStatus = async (req, res) => {
    try {
        const orders = await Order.find({ status: req.params.status })
            .populate('items.menuItem')
            .sort({ orderTime: 1 });
        res.json(orders);
    } catch (error) {
        console.error('Get orders by status error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get order by table number
// @route   GET /api/orders/table/:tableNumber
exports.getOrderByTable = async (req, res) => {
    try {
        const order = await Order.findOne({ 
            tableNumber: parseInt(req.params.tableNumber),
            status: { $nin: ['Paid', 'Free'] }
        }).populate('items.menuItem');
        
        res.json(order || null);
    } catch (error) {
        console.error('Get order by table error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new order
// @route   POST /api/orders
exports.createOrder = async (req, res) => {
    try {
        const { tableNumber, items, isParcel, paymentType } = req.body;
        
        console.log('Creating order with data:', { tableNumber, items, isParcel, paymentType });
        
        // Validate required fields
        if (!tableNumber) {
            return res.status(400).json({ message: 'Table number is required' });
        }
        
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'At least one item is required' });
        }
        
        // Check if table already has active order
        const existingOrder = await Order.findOne({
            tableNumber: parseInt(tableNumber),
            status: { $nin: ['Paid', 'Free'] }
        });
        
        if (existingOrder) {
            return res.status(400).json({ 
                message: `Table ${tableNumber} already has an active order. Please update the existing order.` 
            });
        }
        
        // Get menu item details and validate
        const orderItems = [];
        for (const item of items) {
            if (!item.menuItem || !item.quantity) {
                return res.status(400).json({ message: 'Each item must have menuItem ID and quantity' });
            }
            
            const menuItem = await Menu.findById(item.menuItem);
            if (!menuItem) {
                return res.status(400).json({ message: `Menu item ${item.menuItem} not found` });
            }
            
            if (!menuItem.isAvailable) {
                return res.status(400).json({ message: `${menuItem.name} is not available` });
            }
            
            orderItems.push({
                menuItem: item.menuItem,
                name: menuItem.name,
                price: menuItem.price,
                quantity: parseInt(item.quantity)
            });
        }
        
        // Calculate total
        let totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        let parcelCharge = 0;
        
        if (isParcel) {
            parcelCharge = 10;
            totalAmount += parcelCharge;
        }
        
        const order = new Order({
            tableNumber: parseInt(tableNumber),
            items: orderItems,
            isParcel: isParcel || false,
            parcelCharge,
            paymentType: paymentType || 'Not Paid',
            status: 'Occupied',
            totalAmount
        });
        
        const savedOrder = await order.save();
        console.log('Order saved successfully:', savedOrder._id);
        
        const populatedOrder = await Order.findById(savedOrder._id).populate('items.menuItem');
        
        res.status(201).json(populatedOrder);
    } catch (error) {
        console.error('Create order error:', error);
        
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({ 
                message: 'Duplicate order detected. Please try again.' 
            });
        }
        
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update order
// @route   PUT /api/orders/:id
exports.updateOrder = async (req, res) => {
    try {
        const { items, status, paymentType, isParcel } = req.body;
        
        console.log('Updating order:', req.params.id, { items, status, paymentType, isParcel });
        
        let order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        // If order is already paid, cannot update
        if (order.status === 'Paid') {
            return res.status(400).json({ message: 'Cannot update a paid order' });
        }
        
        // Update items if provided
        if (items && Array.isArray(items)) {
            const orderItems = [];
            for (const item of items) {
                if (!item.menuItem || !item.quantity) {
                    return res.status(400).json({ message: 'Each item must have menuItem ID and quantity' });
                }
                
                const menuItem = await Menu.findById(item.menuItem);
                if (!menuItem) {
                    return res.status(400).json({ message: `Menu item ${item.menuItem} not found` });
                }
                
                if (!menuItem.isAvailable) {
                    return res.status(400).json({ message: `${menuItem.name} is not available` });
                }
                
                orderItems.push({
                    menuItem: item.menuItem,
                    name: menuItem.name,
                    price: menuItem.price,
                    quantity: parseInt(item.quantity)
                });
            }
            order.items = orderItems;
        }
        
        // Update other fields
        if (status) order.status = status;
        if (paymentType) order.paymentType = paymentType;
        if (isParcel !== undefined) order.isParcel = isParcel;
        
        // Recalculate total
        let totalAmount = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (order.isParcel) {
            order.parcelCharge = 10;
            totalAmount += order.parcelCharge;
        } else {
            order.parcelCharge = 0;
        }
        order.totalAmount = totalAmount;
        
        await order.save();
        console.log('Order updated successfully:', order._id);
        
        const updatedOrder = await Order.findById(order._id).populate('items.menuItem');
        res.json(updatedOrder);
    } catch (error) {
        console.error('Update order error:', error);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Mark order as ready
// @route   PATCH /api/orders/:id/ready
exports.markAsReady = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        order.status = 'Ready';
        order.readyTime = new Date();
        await order.save();
        
        console.log('Order marked as ready:', order._id);
        
        const updatedOrder = await Order.findById(order._id).populate('items.menuItem');
        res.json(updatedOrder);
    } catch (error) {
        console.error('Mark as ready error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark order as paid
// @route   PATCH /api/orders/:id/paid
exports.markAsPaid = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        order.status = 'Paid';
        order.paymentType = 'Paid';
        order.paidTime = new Date();
        await order.save();
        
        console.log('Order marked as paid:', order._id);
        
        const updatedOrder = await Order.findById(order._id).populate('items.menuItem');
        res.json(updatedOrder);
    } catch (error) {
        console.error('Mark as paid error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        console.log('Order deleted:', order._id);
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Delete order error:', error);
        res.status(500).json({ message: error.message });
    }
};


// @desc    Update order status (Kitchen: Preparing, Ready to Serve)
// @route   PATCH /api/orders/:id/status/kitchen
exports.updateKitchenStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        if (status === 'Preparing') {
            order.status = 'Preparing';
            order.preparingTime = new Date();
        } else if (status === 'Ready to Serve') {
            order.status = 'Ready to Serve';
            order.readyTime = new Date();
        } else {
            return res.status(400).json({ message: 'Invalid status for kitchen' });
        }
        
        await order.save();
        console.log(`Kitchen updated order ${order._id} to ${status}`);
        
        const updatedOrder = await Order.findById(order._id).populate('items.menuItem');
        res.json(updatedOrder);
    } catch (error) {
        console.error('Update kitchen status error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark as served (Waiter serves food)
// @route   PATCH /api/orders/:id/serve
exports.markAsServed = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        order.status = 'Served';
        order.servedTime = new Date();
        await order.save();
        
        console.log('Order served:', order._id);
        
        const updatedOrder = await Order.findById(order._id).populate('items.menuItem');
        res.json(updatedOrder);
    } catch (error) {
        console.error('Mark as served error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Start eating (Counter confirms customer started eating)
// @route   PATCH /api/orders/:id/start-eating
exports.startEating = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        order.status = 'Eating';
        order.eatingStartTime = new Date();
        await order.save();
        
        console.log('Customer started eating:', order._id);
        
        const updatedOrder = await Order.findById(order._id).populate('items.menuItem');
        res.json(updatedOrder);
    } catch (error) {
        console.error('Start eating error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add items to existing order (for extra orders during meal)
// @route   POST /api/orders/:id/add-items
exports.addItemsToOrder = async (req, res) => {
    try {
        const { items } = req.body;
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        // Add new items
        for (const item of items) {
            if (!item.menuItem || !item.quantity) {
                return res.status(400).json({ message: 'Each item must have menuItem ID and quantity' });
            }
            
            const menuItem = await Menu.findById(item.menuItem);
            if (!menuItem) {
                return res.status(400).json({ message: `Menu item ${item.menuItem} not found` });
            }
            
            if (!menuItem.isAvailable) {
                return res.status(400).json({ message: `${menuItem.name} is not available` });
            }
            
            // Check if item already exists in order
            const existingItem = order.items.find(i => i.menuItem.toString() === item.menuItem);
            if (existingItem) {
                existingItem.quantity += parseInt(item.quantity);
            } else {
                order.items.push({
                    menuItem: item.menuItem,
                    name: menuItem.name,
                    price: menuItem.price,
                    quantity: parseInt(item.quantity),
                    isVeg: menuItem.category !== 'Non-Veg'
                });
            }
        }
        
        // Recalculate total
        let totalAmount = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (order.isParcel) {
            order.parcelCharge = 10;
            totalAmount += order.parcelCharge;
        } else {
            order.parcelCharge = 0;
        }
        
        order.totalAmount = totalAmount;
        order.remainingAmount = totalAmount - order.prepaidAmount;
        
        await order.save();
        console.log('Items added to order:', order._id);
        
        const updatedOrder = await Order.findById(order._id).populate('items.menuItem');
        res.json(updatedOrder);
    } catch (error) {
        console.error('Add items to order error:', error);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update prepaid amount
// @route   PATCH /api/orders/:id/prepaid
exports.updatePrepaid = async (req, res) => {
    try {
        const { prepaidAmount } = req.body;
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        order.prepaidAmount = prepaidAmount;
        order.remainingAmount = order.totalAmount - prepaidAmount;
        
        if (prepaidAmount >= order.totalAmount) {
            order.paymentType = 'Prepaid';
        } else if (prepaidAmount > 0) {
            order.paymentType = 'Partial Prepaid';
        }
        
        await order.save();
        console.log('Prepaid amount updated:', order._id);
        
        const updatedOrder = await Order.findById(order._id).populate('items.menuItem');
        res.json(updatedOrder);
    } catch (error) {
        console.error('Update prepaid error:', error);
        res.status(500).json({ message: error.message });
    }
};