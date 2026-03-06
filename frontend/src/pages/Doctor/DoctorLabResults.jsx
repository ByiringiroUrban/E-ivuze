import React, { useContext, useEffect, useState } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFlask, FaUser, FaCheckCircle, FaBell, FaDownload, FaClock, FaSearch, FaHistory, FaEye, FaExclamationCircle } from 'react-icons/fa';
import DoctorSkeletonLoaders from '../../components/DoctorSkeletonLoaders';
import EmptyState from '../../components/EmptyState';

const DoctorLabResults = () => {
    const { dToken, backendUrl, notifyPatientLab } = useContext(DoctorContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (dToken) {
            fetchLabOrders();
        }
    }, [dToken]);

    const fetchLabOrders = async () => {
        try {
            setLoading(true);
            // We'll reuse a generic endpoint or add a new one if needed, 
            // but for now let's assume doctors can fetch their assigned lab orders.
            const { data } = await axios.get(`${backendUrl}/api/lab/orders`, { headers: { dToken } }); // Need to ensure backend supports dToken for this
            // If the above fails, we might need a specific doctor endpoint
            if (data.success) {
                setOrders(data.orders);
            }
        } catch (error) {
            // Fallback: fetch via clinical record logic if lab/orders is restricted
            try {
                const { data } = await axios.get(`${backendUrl}/api/clinical/doctor/all-labs`, { headers: { dToken } });
                if (data.success) setOrders(data.orders);
            } catch (err) {
                console.error("Fetch error:", err);
                toast.error("Failed to load lab results");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleNotify = async (orderId) => {
        const success = await notifyPatientLab(orderId);
        if (success) {
            setOrders(prev => prev.map(o => o._id === orderId ? { ...o, notifiedPatient: true } : o));
        }
    };

    const filteredOrders = orders.filter(o =>
        o.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.patientId && o.patientId.name && o.patientId.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading && (!orders || orders.length === 0)) {
        return <DoctorSkeletonLoaders.LabResultsSkeleton />;
    }

    return (
        <div className="flex-1 bg-gray-50 min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Diagnostic Oversight</h1>
                        <p className="text-gray-500">Review results and notify patients once reviewed.</p>
                    </div>

                    <div className="relative w-full md:w-96">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by test or patient name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-none shadow-sm focus:ring-2 focus:ring-[#006838] outline-none transition-all"
                        />
                    </div>
                </div>

                {loading ? (
                    <DoctorSkeletonLoaders.LabResultsSkeleton />
                ) : filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-none p-20 shadow-sm border border-gray-200">
                        <EmptyState variant="data" title="No results found" message="No lab results match your filters" />
                    </div>
                ) : (
                    <div className="bg-white rounded-none shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Test Info</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Patient</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Findings</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-6 py-5">
                                            <p className="font-bold text-gray-900">{order.testName}</p>
                                            <p className="text-xs text-gray-400">{order.testCategory} • {new Date(order.orderedAt).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-emerald-100 rounded-none flex items-center justify-center text-[#006838] text-xs">
                                                    <FaUser />
                                                </div>
                                                <span className="font-medium text-gray-700">Patient #{order.patientId?.slice(-6) || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 max-w-xs">
                                            {order.result ? (
                                                <p className="text-sm text-gray-600 line-clamp-2 italic">"{order.result}"</p>
                                            ) : (
                                                <span className="text-xs text-gray-400">Waiting for lab...</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-2 py-1 rounded-none text-[10px] font-black uppercase tracking-tighter
                                                ${order.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {order.resultFileUrl && (
                                                    <a
                                                        href={order.resultFileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all"
                                                        title="Download Report"
                                                    >
                                                        <FaFileDownload />
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => navigate(`/doctor-reports?patientId=${order.patientId?._id || order.patientId}`)}
                                                    className="p-2 bg-emerald-50 text-emerald-600 rounded-none hover:bg-emerald-100 transition-all"
                                                    title="View Patient Full Report"
                                                >
                                                    <FaHistory />
                                                </button>
                                                {order.status === 'COMPLETED' && (
                                                    <button
                                                        onClick={() => handleNotify(order._id)}
                                                        disabled={order.notifiedPatient}
                                                        className={`px-4 py-2 rounded-none text-xs font-bold transition-all flex items-center gap-2
                                                            ${order.notifiedPatient
                                                                ? 'bg-emerald-50 text-emerald-600 cursor-default'
                                                                : 'bg-[#006838] text-white hover:bg-[#004d2a] shadow-lg shadow-emerald-900/20'}`}
                                                    >
                                                        {order.notifiedPatient ? (
                                                            <>
                                                                <FaCheckCircle /> Patient Notified
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FaBell /> Share with Patient
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorLabResults;
