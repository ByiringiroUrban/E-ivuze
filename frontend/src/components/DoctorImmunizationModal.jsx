import React, { useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';
import { DoctorContext } from '../context/DoctorContext';
import { FaSyringe } from 'react-icons/fa';

const DoctorImmunizationModal = ({ isOpen, onClose, patientId, patientName }) => {
    const { backendUrl } = useContext(AppContext);
    const { dToken } = useContext(DoctorContext);

    const [loading, setLoading] = useState(false);
    const [vaccineName, setVaccineName] = useState('');
    const [doseNumber, setDoseNumber] = useState('1');
    const [batchNumber, setBatchNumber] = useState('');
    const [nextDueDate, setNextDueDate] = useState('');
    const [notes, setNotes] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!vaccineName) {
            toast.error("Please specify vaccine name.");
            return;
        }

        setLoading(true);
        try {
            const { data } = await axios.post(`${backendUrl}/api/clinical/immunization/add`, {
                userId: patientId, // Backend expects userId
                vaccineName,
                doseNumber,
                batchNumber,
                facilityId: "CURRENT", // Placeholder
                administeredBy: "SELF", // Placeholder for current doc
                nextDueDate: nextDueDate || null,
                notes,
                appointmentId
            }, { headers: { dToken } });

            if (data.success) {
                toast.success("Immunization recorded successfully");
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4">
            <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl overflow-hidden">
                <div className="bg-green-700 text-white p-4 flex justify-between items-center">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FaSyringe size={20} /> Record Immunization
                    </h3>
                    <button onClick={onClose} className="text-white hover:bg-white/20 p-1 rounded transition-colors">&times;</button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="bg-green-50 p-3 rounded text-sm text-green-800 border border-green-100">
                        Patient: <strong>{patientName}</strong>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vaccine Name</label>
                        <input
                            className="w-full border rounded-lg p-2 text-sm"
                            placeholder="e.g. Polio, BCG, COVID-19 Pfizer"
                            value={vaccineName}
                            onChange={(e) => setVaccineName(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dose Number</label>
                            <input
                                className="w-full border rounded-lg p-2 text-sm"
                                type="number"
                                value={doseNumber}
                                onChange={(e) => setDoseNumber(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Batch #</label>
                            <input
                                className="w-full border rounded-lg p-2 text-sm"
                                placeholder="Optional"
                                value={batchNumber}
                                onChange={(e) => setBatchNumber(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Next Due Date (Optional)</label>
                        <input
                            type="date"
                            className="w-full border rounded-lg p-2 text-sm"
                            value={nextDueDate}
                            onChange={(e) => setNextDueDate(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Reactions</label>
                        <textarea
                            className="w-full border rounded-lg p-2 text-sm"
                            rows="2"
                            placeholder="Site of injection, any immediate reaction..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                <div className="p-4 bg-gray-50 flex justify-end gap-2 border-t border-gray-100">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded text-sm font-medium">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-2 bg-green-700 text-white rounded text-sm font-medium hover:bg-green-800"
                    >
                        {loading ? 'Saving...' : 'Save Record'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DoctorImmunizationModal;
