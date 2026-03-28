const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

class OpenRouterAI {
    constructor() {
        this.apiKey = process.env.OPENROUTER_API_KEY;
        this.baseURL = 'https://openrouter.ai/api/v1';
        this.isInitialized = false;
        this.model = 'openai/gpt-3.5-turbo'; // Default model
        
        this.initialize();
    }

    initialize() {
        if (!this.apiKey) {
            console.error('❌ OPENROUTER_API_KEY is missing!');
            console.error('Please add OPENROUTER_API_KEY to your .env file');
            this.isInitialized = false;
            return;
        }
        
        try {
            this.isInitialized = true;
            console.log('✅ OpenRouter AI initialized successfully');
            console.log('API Key used:', this.apiKey.substring(0, 15) + '...');
            console.log('Using model:', this.model);
        } catch (error) {
            console.error('❌ Failed to initialize OpenRouter AI:', error.message);
            this.isInitialized = false;
        }
    }

    async generateContent(prompt) {
        if (!this.isInitialized) {
            throw new Error('OpenRouter AI not initialized. Please check your API key.');
        }

        try {
            const response = await axios.post(
                `${this.baseURL}/chat/completions`,
                {
                    model: this.model,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a professional restaurant profit optimization consultant. Always respond with valid JSON as specified in the prompt. Be specific, use actual numbers from the data provided, and provide actionable insights.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 2000
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'https://hotel-mitraya.com',
                        'X-Title': 'Hotel Mitraya Restaurant Management System'
                    }
                }
            );

            return response.data.choices[0].message.content;
        } catch (error) {
            console.error('OpenRouter API Error:', error.response?.data || error.message);
            throw new Error(`OpenRouter API Error: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    async analyzeProfitOptimization(salesData, staffData, menuData) {
        if (!this.isInitialized) {
            console.error('❌ AI Model not initialized. Cannot perform analysis.');
            throw new Error('AI Model not initialized. Please check your OPENROUTER_API_KEY in .env file');
        }

        console.log('🤖 Starting AI profit optimization analysis with OpenRouter...');
        console.log('Sales Data:', {
            revenue: salesData.totalRevenue,
            orders: salesData.totalOrders,
            avgOrder: salesData.averageOrderValue
        });

        const prompt = this.buildProfitAnalysisPrompt(salesData, staffData, menuData);
        
        try {
            console.log('📤 Sending request to OpenRouter AI...');
            const response = await this.generateContent(prompt);
            
            console.log('📥 Received response from OpenRouter AI');
            console.log('Response length:', response.length);
            
            const parsedResult = this.parseAIResponse(response);
            console.log('✅ Analysis completed successfully');
            
            return parsedResult;
        } catch (error) {
            console.error('❌ AI Analysis Error:', error.message);
            throw error;
        }
    }

    buildProfitAnalysisPrompt(salesData, staffData, menuData) {
        return `You are a professional restaurant profit optimization consultant. Analyze the following data and provide detailed, actionable insights.

SALES DATA (Last 30 days):
- Total Revenue: ₹${salesData.totalRevenue}
- Total Orders: ${salesData.totalOrders}
- Average Order Value: ₹${salesData.averageOrderValue}
- Top Selling Items: ${salesData.topItems.map(i => `${i.name} (${i.quantity} sold, ₹${i.revenue} revenue)`).join(', ')}
- Low Performing Items: ${salesData.lowItems.map(i => `${i.name} (${i.quantity} sold, ₹${i.revenue} revenue)`).join(', ')}

STAFF DATA:
- Total Staff: ${staffData.totalStaff}
- Monthly Salary Cost: ₹${staffData.totalSalary}
- Attendance Rate: ${staffData.attendanceRate}%
- Staff Roles: ${staffData.roles.join(', ')}

MENU DATA:
- Total Menu Items: ${menuData.totalItems}
- Price Range: ₹${menuData.minPrice} - ₹${menuData.maxPrice}
- Categories: ${menuData.categories.join(', ')}

Please provide a comprehensive analysis in the following JSON format. Be specific with numbers and percentages based on the actual data provided:

{
    "profit_insights": {
        "estimated_profit_margin": "X% (explain calculation based on data)",
        "revenue_trend_analysis": "Detailed analysis of revenue patterns",
        "cost_concerns": "List of main cost concerns with specific amounts",
        "key_opportunities": "Main opportunities for profit improvement"
    },
    "recommendations": [
        "Specific recommendation 1 with expected impact",
        "Specific recommendation 2 with expected impact",
        "Specific recommendation 3 with expected impact",
        "Specific recommendation 4 with expected impact",
        "Specific recommendation 5 with expected impact"
    ],
    "estimated_impact": {
        "percentage": "X%",
        "amount": "₹X",
        "timeframe": "X weeks/months"
    },
    "action_items": [
        "Immediate action 1 (within 24 hours)",
        "Short-term action 2 (within 1 week)",
        "Medium-term action 3 (within 1 month)",
        "Long-term action 4 (ongoing)"
    ],
    "menu_optimization": [
        "Menu optimization 1 with expected impact",
        "Menu optimization 2 with expected impact",
        "Menu optimization 3 with expected impact"
    ],
    "staff_optimization": [
        "Staff optimization 1 with expected impact",
        "Staff optimization 2 with expected impact",
        "Staff optimization 3 with expected impact"
    ]
}

Make recommendations specific to this restaurant's data. Use the actual numbers provided. Provide realistic percentages and amounts based on the data.`;
    }

    parseAIResponse(text) {
        try {
            // Try to find JSON in the response
            let jsonStr = text;
            
            // If text contains markdown code blocks, extract JSON
            const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch) {
                jsonStr = jsonMatch[1];
            } else {
                // Try to find JSON object directly
                const objectMatch = text.match(/\{[\s\S]*\}/);
                if (objectMatch) {
                    jsonStr = objectMatch[0];
                }
            }
            
            // Parse JSON
            const parsed = JSON.parse(jsonStr);
            
            // Validate required fields
            if (!parsed.profit_insights || !parsed.recommendations) {
                throw new Error('Missing required fields in AI response');
            }
            
            return parsed;
        } catch (e) {
            console.error('Error parsing AI response:', e.message);
            console.error('Raw response:', text.substring(0, 500));
            throw new Error('Failed to parse AI response. Please try again.');
        }
    }

    // Test the connection
    async testConnection() {
        try {
            const testPrompt = "Say 'Hello, Hotel Mitraya! AI analysis is ready.' in one sentence.";
            const response = await this.generateContent(testPrompt);
            return { success: true, response };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Create and export a single instance
const openrouterAI = new OpenRouterAI();

// Test initialization
console.log('OpenRouter AI Service Status:', openrouterAI.isInitialized ? '✅ Active' : '❌ Inactive');

module.exports = openrouterAI;