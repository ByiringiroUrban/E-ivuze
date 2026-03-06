import React, { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';
import { DoctorContext } from '../context/DoctorContext';
import { FaPaperPlane, FaHospital } from 'react-icons/fa';

const DoctorReferralModal = ({ isOpen, onClose, patientId, patientName, appointmentId }) => {
    const { backendUrl } = useContext(AppContext);
    const { dToken } = useContext(DoctorContext);

    const [loading, setLoading] = useState(false);
    const [referralReason, setReferralReason] = useState('');
    const [clinicalSummary, setClinicalSummary] = useState('');
    const [hospitals, setHospitals] = useState([]);
    const [targetFacility, setTargetFacility] = useState('');
    const [priority, setPriority] = useState('Routine');

    useEffect(() => {
        const fetchHospitals = async () => {
            try {
                const { data } = await axios.get(`${backendUrl}/api/hospital/approved`);
                if (data.success) {
                    setHospitals(data.hospitals);
                }
            } catch (error) {
                console.error("Failed to fetch hospitals", error);
            }
        };
        fetchHospitals();
    }, [backendUrl]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!referralReason || !targetFacility) {
            toast.error("Please specify reason and target facility.");
            return;
        }

        setLoading(true);
        try {
            const { data } = await axios.post(`${backendUrl}/api/clinical/referral/create`, {
                patientId,
                toHospital: targetFacility,
                reason: referralReason,
                clinicalSummary,
                priority,
                appointmentId
            }, { headers: { dToken } });

            if (data.success) {
                toast.success("Referral request sent successfully");
                onClose();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000000] p-4">
            <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl overflow-hidden">
                <div className="bg-primary text-white p-4 flex justify-between items-center">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FaHospital size={20} /> Refer Patient
                    </h3>
                    <button onClick={onClose} className="text-white hover:bg-white/20 p-1 rounded transition-colors">&times;</button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="bg-blue-50 p-3 rounded text-sm text-blue-800">
                        Referring <strong>{patientName}</strong> for further management.
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Target Facility</label>
                        <select
                            className="w-full border rounded-lg p-2 text-sm"
                            value={targetFacility}
                            onChange={(e) => setTargetFacility(e.target.value)}
                        >
                            <option value="">Select a Hospital</option>
                            {hospitals.map(h => (
                                <option key={h._id} value={h._id}>{h.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select
                            className="w-full border rounded-lg p-2 text-sm"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                        >
                            <option value="Routine">Routine (Standard)</option>
                            <option value="Urgent">Urgent (24-48h)</option>
                            <option value="Emergency">Emergency (Immediate)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Referral</label>
                        <input
                            className="w-full border rounded-lg p-2 text-sm"
                            placeholder="Primary reason..."
                            value={referralReason}
                            onChange={(e) => setReferralReason(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Clinical Summary</label>
                        <textarea
                            className="w-full border rounded-lg p-2 text-sm"
                            rows="3"
                            placeholder="Brief context for the receiving doctor..."
                            value={clinicalSummary}
                            onChange={(e) => setClinicalSummary(e.target.value)}
                        />
                    </div>
                </div>

                <div className="p-4 bg-gray-50 flex justify-end gap-2 border-t border-gray-100">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded text-sm font-medium">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-2 bg-primary text-white rounded text-sm font-medium hover:bg-primary-dark flex items-center gap-2"
                    >
                        {loading ? 'Sending...' : 'Send Referral'} <FaPaperPlane size={14} />
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default DoctorReferralModal;
