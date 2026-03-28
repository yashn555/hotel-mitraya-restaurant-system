import React, { useState } from 'react';
import { getDailyReport, getMonthlyReport, getProfitReport } from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const ReportsPage = () => {
    const [dailyDate, setDailyDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [dailyReport, setDailyReport] = useState(null);
    const [monthlyYear, setMonthlyYear] = useState(format(new Date(), 'yyyy'));
    const [monthlyMonth, setMonthlyMonth] = useState(format(new Date(), 'MM'));
    const [monthlyReport, setMonthlyReport] = useState(null);
    const [profitStart, setProfitStart] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [profitEnd, setProfitEnd] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [profitReport, setProfitReport] = useState(null);
    const [loading, setLoading] = useState(false);

    const loadDailyReport = async () => {
        setLoading(true);
        try {
            const response = await getDailyReport(dailyDate);
            setDailyReport(response.data);
            toast.success('Daily report loaded');
        } catch (error) {
            toast.error('Error loading daily report');
        } finally {
            setLoading(false);
        }
    };

    const loadMonthlyReport = async () => {
        setLoading(true);
        try {
            const response = await getMonthlyReport(monthlyYear, monthlyMonth);
            setMonthlyReport(response.data);
            toast.success('Monthly report loaded');
        } catch (error) {
            toast.error('Error loading monthly report');
        } finally {
            setLoading(false);
        }
    };

    const loadProfitReport = async () => {
        setLoading(true);
        try {
            const response = await getProfitReport(profitStart, profitEnd);
            setProfitReport(response.data);
            toast.success('Profit report loaded');
        } catch (error) {
            toast.error('Error loading profit report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Reports & Analytics</h1>
            
            {/* Daily Report */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Daily Sales Report</h2>
                <div className="flex space-x-4 mb-4">
                    <input
                        type="date"
                        value={dailyDate}
                        onChange={(e) => setDailyDate(e.target.value)}
                        className="border rounded-lg px-4 py-2"
                    />
                    <button
                        onClick={loadDailyReport}
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Load Report
                    </button>
                </div>
                {dailyReport && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded">
                            <p className="text-gray-600">Total Orders</p>
                            <p className="text-2xl font-bold">{dailyReport.totalOrders}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded">
                            <p className="text-gray-600">Total Sales</p>
                            <p className="text-2xl font-bold text-green-600">₹{dailyReport.totalSales}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded">
                            <p className="text-gray-600">Paid Orders</p>
                            <p className="text-2xl font-bold">{dailyReport.paidOrders}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded">
                            <p className="text-gray-600">Unpaid Orders</p>
                            <p className="text-2xl font-bold">{dailyReport.unpaidOrders}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded">
                            <p className="text-gray-600">Paid Amount</p>
                            <p className="text-2xl font-bold">₹{dailyReport.paidAmount}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded">
                            <p className="text-gray-600">Unpaid Amount</p>
                            <p className="text-2xl font-bold">₹{dailyReport.unpaidAmount}</p>
                        </div>
                    </div>
                )}
                {dailyReport && dailyReport.topItems && dailyReport.topItems.length > 0 && (
                    <div className="mt-4">
                        <h3 className="font-semibold mb-2">Top Selling Items</h3>
                        <div className="space-y-2">
                            {dailyReport.topItems.slice(0, 5).map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                    <span>{item.name}</span>
                                    <span>Quantity: {item.quantity}</span>
                                    <span className="font-semibold">₹{item.revenue}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            {/* Monthly Report */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Monthly Sales Report</h2>
                <div className="flex space-x-4 mb-4">
                    <input
                        type="number"
                        placeholder="Year"
                        value={monthlyYear}
                        onChange={(e) => setMonthlyYear(e.target.value)}
                        className="border rounded-lg px-4 py-2 w-24"
                    />
                    <input
                        type="number"
                        placeholder="Month"
                        value={monthlyMonth}
                        onChange={(e) => setMonthlyMonth(e.target.value)}
                        className="border rounded-lg px-4 py-2 w-24"
                        min="1"
                        max="12"
                    />
                    <button
                        onClick={loadMonthlyReport}
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Load Report
                    </button>
                </div>
                {monthlyReport && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-4 rounded">
                            <p className="text-gray-600">Total Orders</p>
                            <p className="text-2xl font-bold">{monthlyReport.totalOrders}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded">
                            <p className="text-gray-600">Total Sales</p>
                            <p className="text-2xl font-bold text-green-600">₹{monthlyReport.totalSales}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded">
                            <p className="text-gray-600">Average Order Value</p>
                            <p className="text-2xl font-bold">₹{monthlyReport.averageOrderValue.toFixed(2)}</p>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Profit Report */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Profit Report</h2>
                <div className="flex space-x-4 mb-4">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={profitStart}
                            onChange={(e) => setProfitStart(e.target.value)}
                            className="border rounded-lg px-4 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">End Date</label>
                        <input
                            type="date"
                            value={profitEnd}
                            onChange={(e) => setProfitEnd(e.target.value)}
                            className="border rounded-lg px-4 py-2"
                        />
                    </div>
                    <button
                        onClick={loadProfitReport}
                        disabled={loading}
                        className="self-end bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Calculate Profit
                    </button>
                </div>
                {profitReport && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-4 rounded">
                            <p className="text-gray-600">Total Revenue</p>
                            <p className="text-2xl font-bold">₹{profitReport.totalRevenue}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded">
                            <p className="text-gray-600">Estimated Cost</p>
                            <p className="text-2xl font-bold">₹{profitReport.estimatedCost}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded">
                            <p className="text-gray-600">Estimated Profit</p>
                            <p className="text-2xl font-bold text-green-600">₹{profitReport.estimatedProfit}</p>
                        </div>
                        <div className="md:col-span-3 bg-gray-50 p-4 rounded">
                            <p className="text-gray-600">Profit Margin</p>
                            <p className="text-2xl font-bold text-blue-600">{profitReport.profitMargin}%</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportsPage;