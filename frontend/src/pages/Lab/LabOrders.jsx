import React, { useState, useEffect, useContext } from 'react';
import { LabContext } from '../../context/LabContext';
import { FaEye, FaCheckCircle, FaFlask, FaUpload, FaComments, FaSearch } from 'react-icons/fa';
import DashboardHero from '../../components/DashboardHero';
import { LoadingComponents } from '../../components/LoadingComponents';
import { useTranslation } from 'react-i18next';

const LabOrders = () => {
    const { t } = useTranslation();
    const { labOrders, getLabOrders, updateOrderStatus, uploadResult } = useContext(LabContext);

    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [uploadModal, setUploadModal] = useState(false);
    const [resultFile, setResultFile] = useState(null);
    const [resultSummary, setResultSummary] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getLabOrders();
    }, []);

    const filteredOrders = labOrders.filter(order => {
        const matchesStatus = statusFilter ? order.status === statusFilter : true;
        const matchesSearch = searchTerm ?
            (order.patientId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.testName?.toLowerCase().includes(searchTerm.toLowerCase())) : true;
        return matchesStatus && matchesSearch;
    });

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!resultSummary) {
            // toast handled by context usually, but here checking inputs
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('orderId', selectedOrder._id);
        formData.append('resultSummary', resultSummary);
        if (resultFile) {
            formData.append('image', resultFile);
        }

        const success = await uploadResult(formData);
        if (success) {
            setUploadModal(false);
            setResultFile(null);
            setResultSummary('');
            setSelectedOrder(null);
        }
        setLoading(false);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-700';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700';
            case 'COMPLETED': return 'bg-green-100 text-green-700';
            case 'CANCELLED': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="bg-white min-h-screen px-4 sm:px-8 py-8 space-y-8">
            <DashboardHero
                eyebrow="Laboratory"
                title="Test Orders"
                description="Manage incoming test requests and upload results."
            />

            {/* Filters */}
            <div className="border border-gray-200 bg-white p-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search patient or test..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                </select>
            </div>

            {/* Orders Table */}
            <div className="border border-gray-200 bg-white overflow-hidden rounded-lg">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{order.testName}</div>
                                            <div className="text-xs text-gray-500">{new Date(order.orderedAt).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{order.patientId?.name || 'Unknown'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{order.testCategory}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => { setSelectedOrder(order); setShowModal(true); }}
                                                    className="text-primary hover:text-primary-dark"
                                                    title="View Details"
                                                >
                                                    <FaEye />
                                                </button>
                                                {order.status !== 'COMPLETED' && (
                                                    <button
                                                        onClick={() => { setSelectedOrder(order); setUploadModal(true); }}
                                                        className="text-green-600 hover:text-green-800"
                                                        title="Upload Result"
                                                    >
                                                        <FaUpload />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No orders found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Modal */}
            {showModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full p-6">
                        <h2 className="text-2xl font-bold mb-4">{selectedOrder.testName}</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-gray-700">Clinical Notes</h3>
                                <p className="bg-gray-50 p-3 rounded">{selectedOrder.notes || 'None'}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-700">Sample Type</h3>
                                <p>{selectedOrder.sampleType}</p>
                            </div>
                            {selectedOrder.status === 'PENDING' && (
                                <button
                                    onClick={async () => {
                                        setLoading(true);
                                        await updateOrderStatus(selectedOrder._id, 'IN_PROGRESS');
                                        setShowModal(false);
                                        setLoading(false);
                                    }}
                                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                                >
                                    {loading ? 'Processing...' : 'Mark as In Progress'}
                                </button>
                            )}
                        </div>
                        <button onClick={() => setShowModal(false)} className="mt-4 text-gray-500 w-full text-center">Close</button>
                    </div>
                </div>
            )}

            {/* Upload Modal */}
            {uploadModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6">
                        <h2 className="text-xl font-bold mb-4">Upload Results</h2>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Result Summary *</label>
                                <textarea
                                    value={resultSummary}
                                    onChange={(e) => setResultSummary(e.target.value)}
                                    required
                                    className="w-full border p-2 rounded"
                                    rows="4"
                                    placeholder="Enter textual result summary..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Result File (PDF/Image)</label>
                                <input
                                    type="file"
                                    onChange={(e) => setResultFile(e.target.files[0])}
                                    className="w-full"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" disabled={loading} className="flex-1 bg-primary text-white py-2 rounded">
                                    {loading ? 'Uploading...' : 'Submit Result'}
                                </button>
                                <button type="button" onClick={() => setUploadModal(false)} className="px-4 border rounded">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LabOrders;
