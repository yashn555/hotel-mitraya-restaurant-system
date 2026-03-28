import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaRobot, FaChartLine, FaLightbulb, FaMoneyBillWave, FaUtensils, FaUsers, FaSync, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AIAnalytics = () => {
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [activeSection, setActiveSection] = useState('insights');
    const [error, setError] = useState(null);

    useEffect(() => {
        loadAnalysis();
    }, []);

    const loadAnalysis = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('http://localhost:5000/api/ai/profit-insights');
            setAnalysis(response.data.data);
            toast.success('AI Analysis loaded successfully');
        } catch (error) {
            console.error('Error loading AI analysis:', error);
            setError(error.response?.data?.message || 'Error loading AI analysis');
            toast.error(error.response?.data?.message || 'Error loading AI analysis');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-12 text-center">
                <FaRobot className="text-6xl text-blue-600 mx-auto mb-4 animate-pulse" />
                <p className="text-gray-600 text-lg">AI is analyzing your restaurant data...</p>
                <p className="text-sm text-gray-500 mt-2">Using OpenRouter AI for intelligent insights</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Analysis</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                    onClick={loadAnalysis}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Try Again
                </button>
                <p className="text-sm text-gray-500 mt-4">
                    Make sure you have completed orders in the last 30 days for accurate analysis.
                </p>
            </div>
        );
    }

    if (!analysis) return null;

    const aiAnalysis = analysis.ai_analysis;

    // Helper function to render estimated impact
    const renderEstimatedImpact = () => {
        const impact = aiAnalysis.estimated_impact;
        if (typeof impact === 'object') {
            return (
                <div className="space-y-1">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Percentage:</span>
                        <span className="font-bold text-green-600">{impact.percentage}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-bold text-green-600">{impact.amount}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Timeframe:</span>
                        <span className="font-bold text-green-600">{impact.timeframe}</span>
                    </div>
                </div>
            );
        }
        return <span className="text-2xl font-bold text-green-600">{impact}</span>;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <FaRobot className="text-4xl" />
                        <div>
                            <h2 className="text-2xl font-bold">AI Profit Optimization Assistant</h2>
                            <p className="text-purple-100">Powered by OpenRouter AI</p>
                        </div>
                    </div>
                    <button
                        onClick={loadAnalysis}
                        className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition flex items-center space-x-2"
                    >
                        <FaSync className={loading ? 'animate-spin' : ''} />
                        <span>Refresh Analysis</span>
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-2 border-b bg-white rounded-t-lg px-4">
                <button
                    onClick={() => setActiveSection('insights')}
                    className={`px-4 py-3 font-semibold transition ${
                        activeSection === 'insights'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <FaChartLine className="inline mr-2" /> Key Insights
                </button>
                <button
                    onClick={() => setActiveSection('recommendations')}
                    className={`px-4 py-3 font-semibold transition ${
                        activeSection === 'recommendations'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <FaLightbulb className="inline mr-2" /> Recommendations
                </button>
                <button
                    onClick={() => setActiveSection('menu')}
                    className={`px-4 py-3 font-semibold transition ${
                        activeSection === 'menu'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <FaUtensils className="inline mr-2" /> Menu Optimization
                </button>
                <button
                    onClick={() => setActiveSection('staff')}
                    className={`px-4 py-3 font-semibold transition ${
                        activeSection === 'staff'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <FaUsers className="inline mr-2" /> Staff Optimization
                </button>
            </div>

            {/* Content Sections */}
            <div className="bg-white rounded-b-lg shadow p-6">
                {activeSection === 'insights' && (
                    <div>
                        <h3 className="text-xl font-bold mb-4">Profit Insights</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-blue-50 rounded-lg p-4">
                                <p className="text-sm text-gray-600 mb-2">Estimated Profit Margin</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {typeof aiAnalysis.profit_insights?.estimated_profit_margin === 'object' 
                                        ? aiAnalysis.profit_insights.estimated_profit_margin.percentage 
                                        : aiAnalysis.profit_insights?.estimated_profit_margin || 'Analyzing...'}
                                </p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4">
                                <p className="text-sm text-gray-600 mb-2">Estimated Impact</p>
                                {renderEstimatedImpact()}
                            </div>
                            <div className="bg-orange-50 rounded-lg p-4">
                                <p className="text-sm text-gray-600 mb-2">AI Model</p>
                                <p className="text-lg font-bold text-orange-600">OpenRouter AI</p>
                                <p className="text-xs text-gray-500 mt-1">GPT-3.5 Turbo</p>
                            </div>
                        </div>
                        
                        {aiAnalysis.profit_insights?.revenue_trend_analysis && (
                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                <h4 className="font-semibold mb-2">Revenue Trend Analysis</h4>
                                <p className="text-gray-700">{aiAnalysis.profit_insights.revenue_trend_analysis}</p>
                            </div>
                        )}
                        
                        {aiAnalysis.profit_insights?.cost_concerns && (
                            <div className="bg-yellow-50 rounded-lg p-4 mb-4">
                                <h4 className="font-semibold mb-2 text-yellow-800">Cost Concerns</h4>
                                <p className="text-gray-700">{aiAnalysis.profit_insights.cost_concerns}</p>
                            </div>
                        )}
                        
                        {aiAnalysis.profit_insights?.key_opportunities && (
                            <div className="bg-green-50 rounded-lg p-4">
                                <h4 className="font-semibold mb-2 text-green-800">Key Opportunities</h4>
                                <p className="text-gray-700">{aiAnalysis.profit_insights.key_opportunities}</p>
                            </div>
                        )}
                    </div>
                )}

                {activeSection === 'recommendations' && (
                    <div>
                        <h3 className="text-xl font-bold mb-4">Actionable Recommendations</h3>
                        <div className="space-y-3">
                            {aiAnalysis.recommendations && aiAnalysis.recommendations.map((rec, idx) => (
                                <div key={idx} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:shadow-md transition">
                                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                                        {idx + 1}
                                    </div>
                                    <p className="flex-1 text-gray-700">{rec}</p>
                                    <FaCheckCircle className="text-green-500 mt-1" />
                                </div>
                            ))}
                        </div>
                        
                        {aiAnalysis.action_items && (
                            <div className="mt-6">
                                <h4 className="font-semibold mb-3 text-lg">Immediate Action Items</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {aiAnalysis.action_items.map((item, idx) => (
                                        <div key={idx} className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                                            <span className="text-red-500 text-xl">⚠️</span>
                                            <span className="text-gray-700">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeSection === 'menu' && (
                    <div>
                        <h3 className="text-xl font-bold mb-4">Menu Optimization Strategies</h3>
                        <div className="grid grid-cols-1 gap-4">
                            {aiAnalysis.menu_optimization && aiAnalysis.menu_optimization.map((opt, idx) => (
                                <div key={idx} className="p-4 border rounded-lg hover:shadow-md transition bg-gradient-to-r from-gray-50 to-white">
                                    <div className="flex items-start space-x-3">
                                        <FaUtensils className="text-blue-500 text-xl mt-1" />
                                        <div>
                                            <p className="font-semibold mb-1 text-blue-700">Strategy {idx + 1}</p>
                                            <p className="text-gray-600">{opt}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {analysis.sales_summary && analysis.sales_summary.topItems && analysis.sales_summary.topItems.length > 0 && (
                            <div className="mt-6 p-4 bg-green-50 rounded-lg">
                                <h4 className="font-semibold mb-3 text-green-800">🏆 Top Performing Items</h4>
                                <div className="space-y-2">
                                    {analysis.sales_summary.topItems.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-2 bg-white rounded">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-bold text-lg text-green-600">{idx + 1}.</span>
                                                <span>{item.name}</span>
                                            </div>
                                            <div className="flex space-x-4">
                                                <span className="text-gray-600">{item.quantity} sold</span>
                                                <span className="font-semibold text-green-600">₹{item.revenue}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeSection === 'staff' && (
                    <div>
                        <h3 className="text-xl font-bold mb-4">Staff Efficiency Recommendations</h3>
                        <div className="grid grid-cols-1 gap-4">
                            {aiAnalysis.staff_optimization && aiAnalysis.staff_optimization.map((opt, idx) => (
                                <div key={idx} className="p-4 border rounded-lg hover:shadow-md transition bg-gradient-to-r from-purple-50 to-white">
                                    <div className="flex items-start space-x-3">
                                        <FaUsers className="text-purple-500 text-xl mt-1" />
                                        <div>
                                            <p className="font-semibold mb-1 text-purple-700">Recommendation {idx + 1}</p>
                                            <p className="text-gray-600">{opt}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {analysis.staff_summary && (
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg text-center border">
                                    <p className="text-sm text-gray-600 mb-1">Total Staff</p>
                                    <p className="text-3xl font-bold text-blue-600">{analysis.staff_summary.totalStaff}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg text-center border">
                                    <p className="text-sm text-gray-600 mb-1">Monthly Salary Cost</p>
                                    <p className="text-2xl font-bold text-red-600">₹{analysis.staff_summary.totalSalary.toLocaleString()}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg text-center border">
                                    <p className="text-sm text-gray-600 mb-1">Attendance Rate</p>
                                    <p className="text-3xl font-bold text-green-600">{analysis.staff_summary.attendanceRate}%</p>
                                </div>
                            </div>
                        )}
                        
                        {analysis.staff_summary && analysis.staff_summary.roles && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                <h4 className="font-semibold mb-2">Staff Roles</h4>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.staff_summary.roles.map((role, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm">
                                            {role}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-gray-500">
                <p>Analysis generated using OpenRouter AI with real-time restaurant data</p>
                <p className="mt-1">Last updated: {analysis.analysis_timestamp ? new Date(analysis.analysis_timestamp).toLocaleString() : 'Just now'}</p>
            </div>
        </div>
    );
};

export default AIAnalytics;