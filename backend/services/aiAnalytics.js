const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

class AIAnalytics {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.isInitialized = false;
    this.apiKey = process.env.GEMINI_API_KEY;

    this.initialize(this.apiKey);
  }

  initialize(apiKey) {
    if (!apiKey) {
      console.error('❌ GEMINI API KEY MISSING!');
      this.isInitialized = false;
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);

      // ✅ FIXED MODEL
      this.model = this.genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: {
          temperature: 0.7,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        },
      });

      this.isInitialized = true;

      console.log('✅ Gemini AI initialized');
      console.log('Model: gemini-2.0-flash');

    } catch (error) {
      console.error('❌ Initialization failed:', error.message);
      this.isInitialized = false;
    }
  }

  async analyzeProfitOptimization(salesData, staffData, menuData) {
    if (!this.isInitialized || !this.model) {
      throw new Error('AI not initialized');
    }

    const prompt = this.buildProfitAnalysisPrompt(
      salesData,
      staffData,
      menuData
    );

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseAIResponse(text);
    } catch (error) {
      console.error('❌ AI Error:', error.message);
      throw new Error(`AI failed: ${error.message}`);
    }
  }

  buildProfitAnalysisPrompt(salesData, staffData, menuData) {
    return `Analyze restaurant data:

Revenue: ₹${salesData.totalRevenue}
Orders: ${salesData.totalOrders}
Avg Order: ₹${salesData.averageOrderValue}

Top Items: ${salesData.topItems.map(i => i.name).join(', ')}

Staff: ${staffData.totalStaff}
Salary: ₹${staffData.totalSalary}

Menu Items: ${menuData.totalItems}

Return JSON with insights, recommendations, and actions.`;
  }

  parseAIResponse(text) {
    try {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('No JSON found');

      return JSON.parse(match[0]);
    } catch (e) {
      console.error('Parse error:', e.message);
      throw new Error('Invalid AI response');
    }
  }
}

module.exports = new AIAnalytics();