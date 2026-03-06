import React, { useState, useEffect, useContext } from 'react';
import { LabContext } from '../../context/LabContext';
import { LoadingComponents } from '../../components/LoadingComponents';
import { useNavigate } from 'react-router-dom';
import { FaFlask, FaClock, FaCheckCircle, FaUser, FaUpload, FaComments } from 'react-icons/fa';
import { toast } from 'react-toastify';

const LabDashboard = () => {
    const { lToken, labOrders, getLabOrders } = useContext(LabContext);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0
    });
    const navigate = useNavigate();

    // Data is fetched by LabContext automatically when lToken changes
    // We just listen to labOrders state

    const fetchOrders = async () => {
        setLoading(true);
        try {
            await getLabOrders();
        } catch (error) {
            toast.error('Failed to load test orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!lToken) {
            navigate('/login');
            return;
        }

        if (labOrders) {
            setStats({
                total: labOrders.length,
                pending: labOrders.filter(o => o.status === 'PENDING').length,
                inProgress: labOrders.filter(o => o.status === 'IN_PROGRESS').length,
                completed: labOrders.filter(o => o.status === 'COMPLETED').length
            });
            // We got the orders, so loading is finished
            setLoading(false);
        }
    }, [labOrders, lToken, navigate]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-700';
            case 'IN_PROGRESS': return 'bg-emerald-100 text-emerald-700';
            case 'COMPLETED': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'EMERGENCY': return 'bg-red-100 text-red-700 border-red-300';
            case 'URGENT': return 'bg-orange-100 text-orange-700 border-orange-300';
            default: return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    if (loading && (!labOrders || labOrders.length === 0)) {
        return <LoadingComponents.DashboardLoader text="Loading lab dashboard..." />;
    }

    return (
        <div className="bg-white min-h-screen">
            {/* Header */}
            <section className="bg-primary text-white px-4 sm:px-8 lg:px-12 py-10 sm:py-14">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl sm:text-4xl font-semibold mb-2">Lab Dashboard</h1>
                    <p className="text-sm sm:text-base text-white/80">
                        Manage test orders and upload results
                    </p>
                </div>
            </section>

            {/* Content */}
            <section className="py-10 sm:py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
                    {loading ? (
                        <LoadingComponents.DataLoader text="Loading test orders..." />
                    ) : (
                        <>
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500   tracking-wider">Total Tests</p>
                                            <p className="text-3xl font-bold text-gray-800 mt-1">{stats.total}</p>
                                        </div>
                                        <div className="bg-primary/10 p-3 rounded-lg">
                                            <FaFlask className="text-2xl text-primary" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500   tracking-wider">Pending</p>
                                            <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
                                        </div>
                                        <div className="bg-yellow-100 p-3 rounded-lg">
                                            <FaClock className="text-2xl text-yellow-600" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500   tracking-wider">In Progress</p>
                                            <p className="text-3xl font-bold text-emerald-600 mt-1">{stats.inProgress}</p>
                                        </div>
                                        <div className="bg-emerald-100 p-3 rounded-lg">
                                            <FaFlask className="text-2xl text-emerald-600" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500   tracking-wider">Completed</p>
                                            <p className="text-3xl font-bold text-green-600 mt-1">{stats.completed}</p>
                                        </div>
                                        <div className="bg-green-100 p-3 rounded-lg">
                                            <FaCheckCircle className="text-2xl text-green-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Orders */}
                            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800">Recent Test Orders</h2>
                                        <p className="text-sm text-gray-500">Manage and upload test results</p>
                                    </div>
                                    <button
                                        onClick={() => navigate('/lab-orders')}
                                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
                                    >
                                        View All Orders
                                    </button>
                                </div>

                                {labOrders && labOrders.length > 0 ? (
                                    <div className="divide-y divide-gray-200">
                                        {labOrders.slice(0, 5).map((order) => (
                                            <div key={order._id} className="p-6 hover:bg-gray-50 transition-colors">
                                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                                    {/* Order Info */}
                                                    <div className="flex-1">
                                                        <div className="flex items-start gap-3">
                                                            <div className="bg-primary/10 p-2 rounded-lg">
                                                                <FaFlask className="text-primary" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <h3 className="font-semibold text-gray-800 text-lg">
                                                                    {order.testName}
                                                                </h3>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <FaUser className="text-gray-400 text-sm" />
                                                                    <span className="text-sm text-gray-600">
                                                                        {order.patientId?.name || 'Unknown Patient'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex flex-wrap gap-2 mt-2">
                                                                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(order.status)}`}>
                                                                        {order.status}
                                                                    </span>
                                                                    {order.priority && order.priority !== 'ROUTINE' && (
                                                                        <span className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(order.priority)}`}>
                                                                            {order.priority}
                                                                        </span>
                                                                    )}
                                                                    <span className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded">
                                                                        {order.testCategory}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex gap-2">
                                                        {order.status !== 'COMPLETED' && (
                                                            <button
                                                                onClick={() => navigate(`/lab-orders?upload=${order._id}`)}
                                                                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
                                                            >
                                                                <FaUpload />
                                                                <span className="hidden sm:inline">Upload Result</span>
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => navigate(`/lab-messages?order=${order._id}`)}
                                                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                                                        >
                                                            <FaComments />
                                                            <span className="hidden sm:inline">Message</span>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Notes */}
                                                {order.notes && (
                                                    <div className="mt-3 ml-11 p-3 bg-emerald-50 border border-emerald-200 rounded text-sm text-emerald-800">
                                                        <span className="font-semibold">Clinical Notes:</span> {order.notes}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center">
                                        <FaFlask className="mx-auto text-6xl text-gray-300 mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Test Orders Yet</h3>
                                        <p className="text-gray-500">Test orders will appear here when doctors assign tests to your lab</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </section>
        </div>
    );
};

export default LabDashboard;
