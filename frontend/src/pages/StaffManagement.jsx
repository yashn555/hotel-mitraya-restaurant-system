import React, { useState, useEffect } from 'react';
import { getStaff, createStaff, updateStaff, deleteStaff } from '../services/api';
import toast from 'react-hot-toast';

const StaffManagement = () => {
    const [staff, setStaff] = useState([]);
    const [editingStaff, setEditingStaff] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        role: 'Waiter',
        monthlySalary: '',
        perDayDeduction: ''
    });

    useEffect(() => {
        loadStaff();
    }, []);

    const loadStaff = async () => {
        try {
            const response = await getStaff();
            setStaff(response.data);
        } catch (error) {
            toast.error('Error loading staff');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingStaff) {
                await updateStaff(editingStaff._id, formData);
                toast.success('Staff updated');
            } else {
                await createStaff(formData);
                toast.success('Staff added');
            }
            setFormData({ name: '', role: 'Waiter', monthlySalary: '', perDayDeduction: '' });
            setEditingStaff(null);
            loadStaff();
        } catch (error) {
            toast.error('Error saving staff');
        }
    };

    const handleEdit = (staffMember) => {
        setEditingStaff(staffMember);
        setFormData({
            name: staffMember.name,
            role: staffMember.role,
            monthlySalary: staffMember.monthlySalary,
            perDayDeduction: staffMember.perDayDeduction
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this staff member?')) {
            try {
                await deleteStaff(id);
                toast.success('Staff deleted');
                loadStaff();
            } catch (error) {
                toast.error('Error deleting staff');
            }
        }
    };

    const roles = ['Chef', 'Waiter', 'Cleaner', 'Manager', 'Cashier'];

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Staff Management</h1>
            
            {/* Add/Edit Form */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">
                    {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                </h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="border rounded-lg px-4 py-2"
                        required
                    />
                    <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="border rounded-lg px-4 py-2"
                    >
                        {roles.map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                    <input
                        type="number"
                        placeholder="Monthly Salary"
                        value={formData.monthlySalary}
                        onChange={(e) => setFormData({ ...formData, monthlySalary: e.target.value })}
                        className="border rounded-lg px-4 py-2"
                        required
                    />
                    <input
                        type="number"
                        placeholder="Per Day Deduction"
                        value={formData.perDayDeduction}
                        onChange={(e) => setFormData({ ...formData, perDayDeduction: e.target.value })}
                        className="border rounded-lg px-4 py-2"
                        required
                    />
                    <div className="md:col-span-2 flex space-x-3">
                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                            {editingStaff ? 'Update' : 'Add'} Staff
                        </button>
                        {editingStaff && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingStaff(null);
                                    setFormData({ name: '', role: 'Waiter', monthlySalary: '', perDayDeduction: '' });
                                }}
                                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>
            
            {/* Staff List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Salary</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Per Day Deduction</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {staff.map(member => (
                            <tr key={member._id}>
                                <td className="px-6 py-4 whitespace-nowrap">{member.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{member.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap">₹{member.monthlySalary}</td>
                                <td className="px-6 py-4 whitespace-nowrap">₹{member.perDayDeduction}</td>
                                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                    <button
                                        onClick={() => handleEdit(member)}
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(member._id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StaffManagement;