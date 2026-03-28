const Order = require('../models/Order');
const Menu = require('../models/Menu');

// @desc    Get daily sales report
// @route   GET /api/reports/daily/:date
exports.getDailyReport = async (req, res) => {
    try {
        const date = new Date(req.params.date);
        const startDate = new Date(date.setHours(0,0,0));
        const endDate = new Date(date.setHours(23,59,59));
        
        const orders = await Order.find({
            orderTime: {
                $gte: startDate,
                $lte: endDate
            }
        }).populate('items.menuItem');
        
        const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const paidOrders = orders.filter(order => order.paymentType === 'Paid');
        const unpaidOrders = orders.filter(order => order.paymentType !== 'Paid');
        
        // Calculate item sales
        const itemSales = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                if (!itemSales[item.name]) {
                    itemSales[item.name] = {
                        name: item.name,
                        quantity: 0,
                        revenue: 0
                    };
                }
                itemSales[item.name].quantity += item.quantity;
                itemSales[item.name].revenue += item.price * item.quantity;
            });
        });
        
        const topItems = Object.values(itemSales).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
        
        res.json({
            date: req.params.date,
            totalOrders: orders.length,
            totalSales,
            paidOrders: paidOrders.length,
            unpaidOrders: unpaidOrders.length,
            paidAmount: paidOrders.reduce((sum, order) => sum + order.totalAmount, 0),
            unpaidAmount: unpaidOrders.reduce((sum, order) => sum + order.totalAmount, 0),
            topItems,
            orders
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get monthly sales report
// @route   GET /api/reports/monthly/:year/:month
exports.getMonthlyReport = async (req, res) => {
    try {
        const { year, month } = req.params;
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        
        const orders = await Order.find({
            orderTime: {
                $gte: startDate,
                $lte: endDate
            }
        });
        
        const dailySales = {};
        const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const paidOrders = orders.filter(order => order.paymentType === 'Paid');
        
        orders.forEach(order => {
            const date = order.orderTime.toISOString().split('T')[0];
            if (!dailySales[date]) {
                dailySales[date] = {
                    date,
                    orders: 0,
                    sales: 0
                };
            }
            dailySales[date].orders++;
            dailySales[date].sales += order.totalAmount;
        });
        
        res.json({
            year,
            month,
            totalOrders: orders.length,
            totalSales,
            paidOrders: paidOrders.length,
            averageOrderValue: orders.length > 0 ? totalSales / orders.length : 0,
            dailySales: Object.values(dailySales),
            orders
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get profit report
// @route   GET /api/reports/profit/:startDate/:endDate
exports.getProfitReport = async (req, res) => {
    try {
        const startDate = new Date(req.params.startDate);
        const endDate = new Date(req.params.endDate);
        
        const orders = await Order.find({
            orderTime: {
                $gte: startDate,
                $lte: endDate
            }
        });
        
        // Assuming profit margin is 60% for food items
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const estimatedCost = totalRevenue * 0.4;
        const estimatedProfit = totalRevenue - estimatedCost;
        
        res.json({
            startDate: req.params.startDate,
            endDate: req.params.endDate,
            totalRevenue,
            estimatedCost,
            estimatedProfit,
            profitMargin: (estimatedProfit / totalRevenue * 100).toFixed(2)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};