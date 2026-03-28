const dotenv = require('dotenv');
dotenv.config();

console.log('Environment Check:');
console.log('OPENROUTER_API_KEY exists:', !!process.env.OPENROUTER_API_KEY);
console.log('API Key first 15 chars:', process.env.OPENROUTER_API_KEY ? process.env.OPENROUTER_API_KEY.substring(0, 15) + '...' : 'Not found');

const openrouterAI = require('./services/openrouterAI');

async function testAPI() {
    try {
        console.log('\n🧪 Testing OpenRouter AI connection...');
        const result = await openrouterAI.testConnection();
        
        if (result.success) {
            console.log('✅ OpenRouter AI connection successful!');
            console.log('AI Response:', result.response);
        } else {
            console.log('❌ OpenRouter AI connection failed:', result.error);
        }
        
        // Test with sample data
        console.log('\n📊 Testing with sample data...');
        const testData = {
            totalRevenue: 150000,
            totalOrders: 300,
            averageOrderValue: 500,
            topItems: [
                { name: "Paneer Butter Masala", quantity: 150, revenue: 37500 },
                { name: "Butter Naan", quantity: 200, revenue: 10000 }
            ],
            lowItems: [
                { name: "Veg Manchurian", quantity: 20, revenue: 4000 }
            ]
        };
        
        const testStaff = {
            totalStaff: 8,
            totalSalary: 120000,
            attendanceRate: 92,
            roles: ["Chef", "Waiter", "Manager", "Cleaner"]
        };
        
        const testMenu = {
            totalItems: 45,
            minPrice: 80,
            maxPrice: 450,
            categories: ["Veg", "Non-Veg", "Beverages", "Desserts"]
        };
        
        console.log('🤖 Running profit analysis...');
        const analysis = await openrouterAI.analyzeProfitOptimization(testData, testStaff, testMenu);
        console.log('✅ Analysis complete!');
        console.log('Analysis Result:', JSON.stringify(analysis, null, 2));
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testAPI();