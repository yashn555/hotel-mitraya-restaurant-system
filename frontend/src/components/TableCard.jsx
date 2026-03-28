import React from 'react';

const TableCard = ({ tableNumber, status, onClick }) => {
    const getStatusColor = () => {
        switch(status) {
            case 'Free':
                return 'bg-green-500 hover:bg-green-600';
            case 'Occupied':
                return 'bg-red-500 hover:bg-red-600';
            case 'Preparing':
                return 'bg-yellow-500 hover:bg-yellow-600';
            case 'Ready to Serve':
                return 'bg-blue-500 hover:bg-blue-600';
            case 'Served':
                return 'bg-purple-500 hover:bg-purple-600';
            case 'Eating':
                return 'bg-pink-500 hover:bg-pink-600';
            case 'Paid':
                return 'bg-gray-500 hover:bg-gray-600';
            default:
                return 'bg-gray-300 hover:bg-gray-400';
        }
    };

    const getStatusText = () => {
        switch(status) {
            case 'Free':
                return 'Free';
            case 'Occupied':
                return 'Occupied';
            case 'Preparing':
                return 'Preparing';
            case 'Ready to Serve':
                return 'Ready to Serve';
            case 'Served':
                return 'Served';
            case 'Eating':
                return 'Eating';
            case 'Paid':
                return 'Paid';
            default:
                return status || 'Unknown';
        }
    };

    return (
        <div 
            onClick={onClick}
            className={`${getStatusColor()} text-white rounded-lg shadow-lg p-6 cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl`}
        >
            <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">Table {tableNumber}</h3>
                <div className="text-lg font-semibold bg-white bg-opacity-20 rounded-lg px-3 py-1 inline-block">
                    {getStatusText()}
                </div>
            </div>
        </div>
    );
};

export default TableCard;