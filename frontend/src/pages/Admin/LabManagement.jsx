import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AdminContext } from '../../context/AdminContext';
import AddLabModal from '../../components/AddLabModal';
import { LoadingComponents } from '../../components/LoadingComponents';
import EmptyState from '../../components/EmptyState';
import { FaPlus, FaMapMarkerAlt, FaPhone, FaEnvelope, FaToggleOn, FaToggleOff, FaMicroscope } from 'react-icons/fa';

const LabManagement = () => {
    const { aToken, backendUrl } = useContext(AdminContext);
    const [labs, setLabs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        if (aToken) {
            fetchLabs();
        }
    }, [aToken]);

    const fetchLabs = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${backendUrl}/api/lab/all`);
            if (data.success) {
                setLabs(data.labs || []);
            }
        } catch (error) {
            console.error('Error fetching labs:', error);
            toast.error('Failed to load diagnostic centers');
        } finally {
            setLoading(false);
        }
    };

    const handleAddSuccess = () => {
        fetchLabs(); // Refresh the list
    };

    if (loading && labs.length === 0) {
        return <LoadingComponents.DashboardLoader text="Loading dashboard..." />;
    }

    return (
        <div className="bg-white min-h-screen">
            {/* Header Section */}
            <section className="bg-primary text-white px-4 sm:px-8 lg:px-12 py-10 sm:py-14">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-3">
                            <p className="text-xs   tracking-[0.45em] text-white/70">
                                Diagnostic Centers
                            </p>
                            <h1 className="text-3xl sm:text-4xl font-semibold">
                                Lab Management
                            </h1>
                            <p className="text-sm sm:text-base text-white/80 max-w-3xl">
                                Register and manage diagnostic centers across the network
                            </p>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-lg hover:bg-white/90 transition-colors font-medium"
                        >
                            <FaPlus />
                            <span>Register New Lab</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-10 sm:py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
                    {loading ? (
                        <LoadingComponents.DataLoader text="Loading diagnostic centers..." />
                    ) : labs.length === 0 ? (
                        <EmptyState variant="data" title="No Diagnostic Centers Registered" message="Get started by registering your first diagnostic center">
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="mt-6 inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
                            >
                                <FaPlus />
                                <span>Register Lab</span>
                            </button>
                        </EmptyState>
                    ) : (
                        <>
                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500   tracking-wider">Total Labs</p>
                                            <p className="text-3xl font-bold text-gray-800 mt-1">{labs.length}</p>
                                        </div>
                                        <div className="bg-primary/10 p-3 rounded-lg">
                                            <FaMicroscope className="text-2xl text-primary" />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500   tracking-wider">Active Labs</p>
                                            <p className="text-3xl font-bold text-green-600 mt-1">
                                                {labs.filter(lab => lab.available).length}
                                            </p>
                                        </div>
                                        <div className="bg-green-100 p-3 rounded-lg">
                                            <FaToggleOn className="text-2xl text-green-600" />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500   tracking-wider">Inactive Labs</p>
                                            <p className="text-3xl font-bold text-gray-400 mt-1">
                                                {labs.filter(lab => !lab.available).length}
                                            </p>
                                        </div>
                                        <div className="bg-gray-100 p-3 rounded-lg">
                                            <FaToggleOff className="text-2xl text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Labs Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {labs.map((lab) => (
                                    <div
                                        key={lab._id}
                                        className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                                    >
                                        <div className="p-6">
                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-primary/10 p-3 rounded-lg">
                                                        <FaMicroscope className="text-xl text-primary" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-800 text-lg">
                                                            {lab.name}
                                                        </h3>
                                                        <span
                                                            className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${lab.available
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-gray-100 text-gray-600'
                                                                }`}
                                                        >
                                                            {lab.available ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Contact Info */}
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <FaEnvelope className="text-gray-400 flex-shrink-0" />
                                                    <span className="truncate">{lab.email}</span>
                                                </div>
                                                {lab.phone && (
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <FaPhone className="text-gray-400 flex-shrink-0" />
                                                        <span>{lab.phone}</span>
                                                    </div>
                                                )}
                                                {lab.address && (lab.address.line1 || lab.address.city) && (
                                                    <div className="flex items-start gap-2 text-gray-600">
                                                        <FaMapMarkerAlt className="text-gray-400 flex-shrink-0 mt-1" />
                                                        <span className="flex-1">
                                                            {lab.address.line1 && `${lab.address.line1}`}
                                                            {lab.address.line2 && `, ${lab.address.line2}`}
                                                            {lab.address.city && (
                                                                <span className="block text-xs text-gray-500 mt-1">
                                                                    {lab.address.city}
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Specialties */}
                                            {lab.speciality && lab.speciality.length > 0 && (
                                                <div className="mt-4 pt-4 border-t border-gray-100">
                                                    <p className="text-xs text-gray-500   tracking-wider mb-2">
                                                        Specialties
                                                    </p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {lab.speciality.map((spec, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                                                            >
                                                                {spec}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* Add Lab Modal */}
            <AddLabModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={handleAddSuccess}
            />
        </div>
    );
};

export default LabManagement;
