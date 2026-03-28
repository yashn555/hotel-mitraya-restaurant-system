import React, { useState, useEffect } from 'react';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem, toggleMenuItem } from '../services/api';
import toast from 'react-hot-toast';

const MenuManagement = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: 'Veg',
        subCategory: 'Appetizer',
        isAvailable: true
    });

    // Define categories and subcategories
    const categories = ['Veg', 'Non-Veg', 'Beverages', 'Desserts'];
    const subCategories = {
        'Veg': ['Appetizer', 'Main Course', 'Rice', 'Breads', 'Soups', 'Curries'],
        'Non-Veg': ['Appetizer', 'Main Course', 'Rice', 'Curries', 'Grills'],
        'Beverages': ['Hot Beverages', 'Cold Beverages', 'Mocktails', 'Juices', 'Soft Drinks'],
        'Desserts': ['Indian Sweets', 'Ice Creams', 'Pastries', 'Cakes', 'Fruit Platter']
    };

    useEffect(() => {
        loadMenuItems();
    }, []);

    const loadMenuItems = async () => {
        try {
            const response = await getMenuItems();
            setMenuItems(response.data);
        } catch (error) {
            console.error('Error loading menu items:', error);
            toast.error('Error loading menu items');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!formData.name.trim()) {
            toast.error('Please enter item name');
            return;
        }
        if (!formData.price || formData.price <= 0) {
            toast.error('Please enter valid price');
            return;
        }

        try {
            const itemData = {
                name: formData.name.trim(),
                price: parseFloat(formData.price),
                category: formData.category,
                subCategory: formData.subCategory,
                isAvailable: formData.isAvailable
            };

            if (editingItem) {
                await updateMenuItem(editingItem._id, itemData);
                toast.success('Menu item updated successfully');
            } else {
                await createMenuItem(itemData);
                toast.success('Menu item added successfully');
            }
            
            // Reset form
            setFormData({ 
                name: '', 
                price: '', 
                category: 'Veg', 
                subCategory: 'Appetizer', 
                isAvailable: true 
            });
            setEditingItem(null);
            loadMenuItems();
        } catch (error) {
            console.error('Error saving menu item:', error);
            toast.error(error.response?.data?.message || 'Error saving menu item');
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            price: item.price,
            category: item.category,
            subCategory: item.subCategory || (subCategories[item.category] ? subCategories[item.category][0] : 'Appetizer'),
            isAvailable: item.isAvailable
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await deleteMenuItem(id);
                toast.success('Menu item deleted successfully');
                loadMenuItems();
            } catch (error) {
                console.error('Error deleting menu item:', error);
                toast.error('Error deleting menu item');
            }
        }
    };

    const handleToggleAvailability = async (id) => {
        try {
            await toggleMenuItem(id);
            toast.success('Availability toggled');
            loadMenuItems();
        } catch (error) {
            console.error('Error toggling availability:', error);
            toast.error('Error toggling availability');
        }
    };

    // Handle category change
    const handleCategoryChange = (category) => {
        const defaultSubCategory = subCategories[category] ? subCategories[category][0] : 'Appetizer';
        setFormData({ 
            ...formData, 
            category: category,
            subCategory: defaultSubCategory
        });
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Menu Management</h1>
            
            {/* Add/Edit Form */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">
                    {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                        <input
                            type="text"
                            placeholder="Enter item name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                        <input
                            type="number"
                            placeholder="Enter price"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            step="1"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                        <select
                            value={formData.category}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category *</label>
                        <select
                            value={formData.subCategory}
                            onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {subCategories[formData.category] && subCategories[formData.category].map(sub => (
                                <option key={sub} value={sub}>{sub}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="flex items-center">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isAvailable}
                                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                                className="mr-2 w-4 h-4"
                            />
                            <span className="text-sm font-medium text-gray-700">Available for ordering</span>
                        </label>
                    </div>
                    
                    <div className="md:col-span-2 flex space-x-3">
                        <button 
                            type="submit" 
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            {editingItem ? 'Update Item' : 'Add Item'}
                        </button>
                        {editingItem && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingItem(null);
                                    setFormData({ 
                                        name: '', 
                                        price: '', 
                                        category: 'Veg', 
                                        subCategory: 'Appetizer', 
                                        isAvailable: true 
                                    });
                                }}
                                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>
            
            {/* Menu Items List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {menuItems.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                        No menu items found. Click "Add Item" to create your first menu item.
                                    </td>
                                </tr>
                            ) : (
                                menuItems.map(item => (
                                    <tr key={item._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {item.isVeg ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    🟢 Veg
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    🔴 Non-Veg
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                            {item.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                            {item.category}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                            {item.subCategory || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                                            ₹{item.price}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {item.isAvailable ? 'Available' : 'Unavailable'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="text-blue-600 hover:text-blue-900 font-medium"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleToggleAvailability(item._id)}
                                                className="text-yellow-600 hover:text-yellow-900 font-medium"
                                            >
                                                Toggle
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                className="text-red-600 hover:text-red-900 font-medium"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MenuManagement;