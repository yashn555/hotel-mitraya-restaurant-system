import React, { useState, useEffect } from 'react';
import { getStaff, markAttendance, getAttendanceByDate, getStaffMonthlySummary } from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const AttendancePage = () => {
    const [staff, setStaff] = useState([]);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [attendance, setAttendance] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
    const [monthlySummaries, setMonthlySummaries] = useState([]);

    useEffect(() => {
        loadStaff();
        loadAttendance();
    }, [selectedDate]);

    useEffect(() => {
        loadMonthlySummaries();
    }, [selectedMonth]);

    const loadStaff = async () => {
        try {
            const response = await getStaff();
            setStaff(response.data);
        } catch (error) {
            toast.error('Error loading staff');
        }
    };

    const loadAttendance = async () => {
        try {
            const response = await getAttendanceByDate(selectedDate);
            setAttendance(response.data);
        } catch (error) {
            toast.error('Error loading attendance');
        }
    };

    const loadMonthlySummaries = async () => {
        try {
            const [year, month] = selectedMonth.split('-');
            const summaries = [];
            for (const staffMember of staff) {
                try {
                    const response = await getStaffMonthlySummary(staffMember._id, year, month);
                    summaries.push(response.data);
                } catch (error) {
                    console.error('Error loading summary:', error);
                }
            }
            setMonthlySummaries(summaries);
        } catch (error) {
            toast.error('Error loading monthly summaries');
        }
    };

    const handleMarkAttendance = async (staffId, status) => {
        try {
            await markAttendance({
                staffId,
                date: selectedDate,
                status
            });
            toast.success('Attendance marked successfully');
            loadAttendance();
        } catch (error) {
            toast.error('Error marking attendance');
        }
    };

    const getAttendanceStatus = (staffId) => {
        const record = attendance.find(a => a.staffId === staffId);
        return record ? record.status : 'Absent';
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Attendance Management</h1>
            
            {/* Daily Attendance */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Mark Daily Attendance</h2>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border rounded-lg px-4 py-2"
                    />
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {staff.map(member => {
                                const status = getAttendanceStatus(member._id);
                                return (
                                    <tr key={member._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">{member.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{member.role}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                status === 'Present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                            <button
                                                onClick={() => handleMarkAttendance(member._id, 'Present')}
                                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                            >
                                                Present
                                            </button>
                                            <button
                                                onClick={() => handleMarkAttendance(member._id, 'Absent')}
                                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                                            >
                                                Absent
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Monthly Salary Summary */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Monthly Salary Summary</h2>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Month</label>
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="border rounded-lg px-4 py-2"
                    />
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present Days</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absent Days</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Salary</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calculated Salary</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {monthlySummaries.map((summary, idx) => (
                                <tr key={idx}>
                                    <td className="px-6 py-4 whitespace-nowrap">{summary.staffName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{summary.presentDays}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{summary.absentDays}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">₹{summary.monthlySalary}</td>
                                    <td className="px-6 py-4 whitespace-nowrap font-semibold">₹{summary.calculatedSalary}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AttendancePage;