const Order = require('../models/Order');
const Staff = require('../models/Staff');
const Menu = require('../models/Menu');
const Attendance = require('../models/Attendance');
const openrouterAI = require('../services/openrouterAI');

// @desc    Get AI-powered profit optimization insights
// @route   GET /api/ai/profit-insights
exports.getProfitInsights = async (req, res) => {
    try {
        console.log('📊 Fetching data for AI analysis...');
        
        // Get last 30 days of data
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Sales Data
        const orders = await Order.find({
            orderTime: { $gte: thirtyDaysAgo },
            status: 'Paid'
        });

        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const totalOrders = orders.length;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Top Selling Items
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

        const topItems = Object.values(itemSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        const lowItems = Object.values(itemSales)
            .sort((a, b) => a.revenue - b.revenue)
            .slice(0, 3);

        // Staff Data
        const staff = await Staff.find({ isActive: true });
        const totalSalary = staff.reduce((sum, s) => sum + s.monthlySalary, 0);
        
        // Get attendance for last 30 days
        const attendance = await Attendance.find({
            date: { $gte: thirtyDaysAgo }
        });
        
        const totalDays = 30;
        const totalPresent = attendance.filter(a => a.status === 'Present').length;
        const attendanceRate = staff.length > 0 ? (totalPresent / (staff.length * totalDays)) * 100 : 0;

        const roles = [...new Set(staff.map(s => s.role))];

        // Menu Data
        const menuItems = await Menu.find();
        const prices = menuItems.map(m => m.price);
        const categories = [...new Set(menuItems.map(m => m.category))];

        const salesData = {
            totalRevenue,
            totalOrders,
            averageOrderValue: Math.round(averageOrderValue),
            topItems,
            lowItems
        };

        const staffData = {
            totalStaff: staff.length,
            totalSalary,
            attendanceRate: attendanceRate.toFixed(1),
            roles
        };

        const menuData = {
            totalItems: menuItems.length,
            minPrice: Math.min(...prices, 0),
            maxPrice: Math.max(...prices, 0),
            categories
        };

        console.log('📊 Data collected:', {
            revenue: totalRevenue,
            orders: totalOrders,
            staff: staff.length,
            menu: menuItems.length
        });

        // Check if we have enough data
        if (totalOrders === 0) {
            return res.status(400).json({
                success: false,
                message: 'Not enough data for analysis. Please ensure you have completed orders in the last 30 days.',
                data: null
            });
        }

        // Get AI analysis
        console.log('🤖 Calling OpenRouter AI for analysis...');
        const analysis = await openrouterAI.analyzeProfitOptimization(
            salesData,
            staffData,
            menuData
        );

        console.log('✅ AI analysis complete');
        
        res.json({
            success: true,
            message: 'AI analysis completed successfully',
            data: {
                sales_summary: salesData,
                staff_summary: staffData,
                menu_summary: menuData,
                ai_analysis: analysis,
                analysis_timestamp: new Date().toISOString(),
                ai_model: 'openai/gpt-3.5-turbo (via OpenRouter)'
            }
        });

    } catch (error) {
        console.error('❌ Error in profit insights:', error.message);
        res.status(500).json({ 
            success: false, 
            message: error.message,
            data: null
        });
    }
};

// @desc    Test OpenRouter AI connection
// @route   GET /api/ai/test
exports.testAIConnection = async (req, res) => {
    try {
        console.log('🧪 Testing OpenRouter AI connection...');
        
        const testResult = await openrouterAI.testConnection();
        
        if (testResult.success) {
            res.json({
                success: true,
                message: 'OpenRouter AI connection successful!',
                response: testResult.response,
                api_key_configured: !!process.env.OPENROUTER_API_KEY
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'OpenRouter AI connection failed',
                error: testResult.error,
                api_key_configured: !!process.env.OPENROUTER_API_KEY
            });
        }
    } catch (error) {
        console.error('AI Test Error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};