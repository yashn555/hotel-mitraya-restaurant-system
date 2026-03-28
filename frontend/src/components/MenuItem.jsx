import React from 'react';

const MenuItem = ({ item, onAdd, quantity = 0 }) => {
    if (!item) return null;
    
    return (
        <div className="bg-white rounded-lg shadow p-4 flex justify-between items-center hover:shadow-lg transition border border-gray-100">
            <div className="flex-1">
                <div className="flex items-center mb-1">
                    {item.isVeg ? (
                        <span className="w-4 h-4 bg-green-500 rounded-full mr-2" title="Vegetarian"></span>
                    ) : (
                        <span className="w-4 h-4 bg-red-500 rounded-full mr-2" title="Non-Vegetarian"></span>
                    )}
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                </div>
                <p className="text-gray-600 font-bold">₹{item.price}</p>
                {item.subCategory && (
                    <p className="text-xs text-gray-500 mt-1">{item.subCategory}</p>
                )}
                {!item.isAvailable && (
                    <span className="inline-block mt-1 text-red-500 text-xs font-semibold bg-red-50 px-2 py-1 rounded">
                        Currently Unavailable
                    </span>
                )}
            </div>
            <div className="flex items-center space-x-2">
                {quantity > 0 && (
                    <span className="text-lg font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {quantity}
                    </span>
                )}
                <button
                    onClick={() => onAdd(item)}
                    disabled={!item.isAvailable}
                    className={`px-4 py-2 rounded-lg transition font-medium ${
                        item.isAvailable
                            ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    {item.isAvailable ? 'Add to Cart' : 'Unavailable'}
                </button>
            </div>
        </div>
    );
};

export default MenuItem;