import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { FaFileAlt, FaCalendar, FaDownload, FaEye } from 'react-icons/fa';
import toast from 'react-hot-toast';

const BillViewer = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedBill, setSelectedBill] = useState(null);

    useEffect(() => {
        loadBills();
    }, []);

    const loadBills = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/bills/list');
            setBills(response.data.bills);
        } catch (error) {
            console.error('Error loading bills:', error);
            toast.error('Error loading bills');
        } finally {
            setLoading(false);
        }
    };

    const viewBill = async (date, filename) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/bills/view/${date}/${filename}`);
            const billWindow = window.open('', '_blank');
            billWindow.document.write(response.data.content);
            billWindow.document.close();
        } catch (error) {
            console.error('Error viewing bill:', error);
            toast.error('Error viewing bill');
        }
    };

    const getBillIcon = (filename) => {
        return filename.includes('Thermal') ? '🖨️' : '📄';
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center">
                    <FaFileAlt className="mr-2 text-blue-600" />
                    Saved Bills
                </h2>
                <button
                    onClick={loadBills}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Refresh
                </button>
            </div>

            {loading ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading bills...</p>
                </div>
            ) : bills.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <FaFileAlt className="text-5xl mx-auto mb-3 text-gray-300" />
                    <p>No bills saved yet</p>
                    <p className="text-sm mt-2">Bills will appear here after you save them</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {bills.map((bill, idx) => (
                        <div
                            key={idx}
                            className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                            onClick={() => viewBill(bill.date, bill.fileName)}
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl">{getBillIcon(bill.fileName)}</span>
                                    <div>
                                        <p className="font-semibold">{bill.fileName}</p>
                                        <div className="flex items-center text-sm text-gray-500 mt-1">
                                            <FaCalendar className="mr-1" size={12} />
                                            <span>{format(new Date(bill.created), 'dd/MM/yyyy hh:mm a')}</span>
                                            <span className="mx-2">•</span>
                                            <span>{(bill.size / 1024).toFixed(2)} KB</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        viewBill(bill.date, bill.fileName);
                                    }}
                                    className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 flex items-center space-x-1"
                                >
                                    <FaEye size={12} />
                                    <span>View</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BillViewer;