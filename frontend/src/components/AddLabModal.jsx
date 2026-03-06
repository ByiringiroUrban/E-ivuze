import React, { useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AdminContext } from '../context/AdminContext';
import { LoadingComponents } from './LoadingComponents';
import { FaMicroscope, FaTimes } from 'react-icons/fa';

const AddLabModal = ({ isOpen, onClose, onSuccess }) => {
    const { aToken, backendUrl } = useContext(AdminContext);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: 'Kigali'
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.email || !formData.password) {
            toast.error('Please fill all required fields');
            return;
        }

        if (formData.password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/lab/add`,
                {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone,
                    address: {
                        line1: formData.addressLine1,
                        line2: formData.addressLine2,
                        city: formData.city
                    }
                },
                { headers: { aToken } }
            );

            if (data.success) {
                toast.success('Lab added successfully!');
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    phone: '',
                    addressLine1: '',
                    addressLine2: '',
                    city: 'Kigali'
                });
                onSuccess && onSuccess();
                onClose();
            } else {
                toast.error(data.message || 'Failed to add lab');
            }
        } catch (error) {
            console.error('Error adding lab:', error);
            toast.error(error.response?.data?.message || 'Failed to add lab');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-primary text-white p-4 flex justify-between items-center">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FaMicroscope size={20} />
                        Register New Diagnostic Center
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 p-1 rounded transition-colors"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Lab Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Lab Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
                            placeholder="e.g., King Faisal Hospital Laboratory"
                            required
                        />
                    </div>

                    {/* Email & Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
                                placeholder="lab@example.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
                                placeholder="+250 788 123 456"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
                            placeholder="Minimum 8 characters"
                            minLength={8}
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">Lab will use this to login to the system</p>
                    </div>

                    {/* Address */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-700 border-b pb-1">Location</h4>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address Line 1
                            </label>
                            <input
                                type="text"
                                name="addressLine1"
                                value={formData.addressLine1}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
                                placeholder="e.g., KG 23 Ave, Remera"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address Line 2
                                </label>
                                <input
                                    type="text"
                                    name="addressLine2"
                                    value={formData.addressLine2}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="Building, Floor, etc."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    City
                                </label>
                                <select
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
                                >
                                    <option value="Kigali">Kigali</option>
                                    <option value="Musanze">Musanze</option>
                                    <option value="Rubavu">Rubavu</option>
                                    <option value="Huye">Huye</option>
                                    <option value="Muhanga">Muhanga</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                        <p className="font-semibold mb-1">📋 Note:</p>
                        <p>The lab will receive login credentials via email. They can change their password after first login.</p>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <LoadingComponents.ButtonLoader />
                                <span>Adding Lab...</span>
                            </>
                        ) : (
                            'Add Diagnostic Center'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddLabModal;
