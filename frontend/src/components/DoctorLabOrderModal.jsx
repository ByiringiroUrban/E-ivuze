import React, { useState, useContext } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';
import { DoctorContext } from '../context/DoctorContext';
import { FaFlask, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
import { LoadingComponents } from './LoadingComponents';

const DoctorLabOrderModal = ({ isOpen, onClose, patientId, patientName, appointmentId }) => {
    const { backendUrl } = useContext(AppContext);
    const { dToken } = useContext(DoctorContext);

    const [loading, setLoading] = useState(false);
    const [labs, setLabs] = useState([]);
    const [selectedLabId, setSelectedLabId] = useState('');
    const [loadingLabs, setLoadingLabs] = useState(false);
    const [testName, setTestName] = useState('');
    const [testCategory, setTestCategory] = useState('Hematology');
    const [sampleType, setSampleType] = useState('Blood');
    const [priority, setPriority] = useState('ROUTINE');
    const [notes, setNotes] = useState('');

    // Fetch labs when modal opens
    React.useEffect(() => {
        if (isOpen) {
            fetchLabs();
        }
    }, [isOpen]);

    const fetchLabs = async () => {
        setLoadingLabs(true);
        try {
            const { data } = await axios.get(`${backendUrl}/api/lab/all`);
            if (data.success) {
                setLabs(data.labs || []);
            }
        } catch (error) {
            console.error('Error fetching labs:', error);
            toast.error('Failed to load diagnostic centers');
        } finally {
            setLoadingLabs(false);
        }
    };

    const selectedLab = labs.find(lab => lab._id === selectedLabId);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!selectedLabId) {
            toast.error("Please select a diagnostic center.");
            return;
        }

        if (!testName) {
            toast.error("Please specify at least one test name.");
            return;
        }

        setLoading(true);
        try {
            const { data } = await axios.post(`${backendUrl}/api/clinical/lab/create`, {
                patientId,
                appointmentId,
                testName,
                testCategory,
                sampleType,
                priority,
                notes,
                labId: selectedLabId || null
            }, { headers: { dToken } });

            if (data.success) {
                toast.success("Lab order placed successfully");
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
                <div className="bg-[#14324f] text-white p-4 flex justify-between items-center">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FaFlask size={20} /> Order Lab Test
                    </h3>
                    <button onClick={onClose} className="text-white hover:bg-white/20 p-1 rounded transition-colors">&times;</button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 border border-blue-100">
                        Ordering for: <strong>{patientName}</strong>
                    </div>

                    {/* Lab Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Diagnostic Center *</label>
                        {loadingLabs ? (
                            <div className="py-4">
                                <LoadingComponents.SearchLoader text="Loading labs..." />
                            </div>
                        ) : (
                            <select
                                className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                value={selectedLabId}
                                onChange={(e) => setSelectedLabId(e.target.value)}
                            >
                                <option value="">-- Select a lab --</option>
                                {labs.map(lab => (
                                    <option key={lab._id} value={lab._id}>
                                        {lab.name} {lab.address?.city ? `- ${lab.address.city}` : ''}
                                    </option>
                                ))}
                            </select>
                        )}
                        {selectedLab && (
                            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-1">
                                <p className="text-sm font-semibold text-blue-900">{selectedLab.name}</p>
                                {selectedLab.address?.line1 && (
                                    <p className="text-xs text-blue-700 flex items-center gap-1">
                                        <FaMapMarkerAlt size={10} />
                                        {selectedLab.address.line1}
                                        {selectedLab.address.line2 && `, ${selectedLab.address.line2}`}
                                        {selectedLab.address.city && `, ${selectedLab.address.city}`}
                                    </p>
                                )}
                                {selectedLab.phone && (
                                    <p className="text-xs text-blue-700 flex items-center gap-1">
                                        <FaPhone size={10} /> {selectedLab.phone}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Test Name / Panel</label>
                        <input
                            className="w-full border rounded-lg p-2 text-sm"
                            placeholder="e.g. CBC, Malaria Smear, Liver Function Test"
                            value={testName}
                            onChange={(e) => setTestName(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                className="w-full border rounded-lg p-2 text-sm"
                                value={testCategory}
                                onChange={(e) => setTestCategory(e.target.value)}
                            >
                                <option>Hematology</option>
                                <option>Biochemistry</option>
                                <option>Microbiology</option>
                                <option>Radiology</option>
                                <option>Pathology</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sample Type</label>
                            <select
                                className="w-full border rounded-lg p-2 text-sm"
                                value={sampleType}
                                onChange={(e) => setSampleType(e.target.value)}
                            >
                                <option>Blood</option>
                                <option>Urine</option>
                                <option>Stool</option>
                                <option>Sputum</option>
                                <option>Swab</option>
                                <option>Fluid</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select
                            className="w-full border rounded-lg p-2 text-sm"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                        >
                            <option value="ROUTINE">Routine</option>
                            <option value="URGENT">Urgent</option>
                            <option value="EMERGENCY">Stat / Emergency</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Clinical Info</label>
                        <textarea
                            className="w-full border rounded-lg p-2 text-sm"
                            rows="2"
                            placeholder="Rule out malaria..."
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
                        className="px-4 py-2 bg-[#14324f] text-white rounded text-sm font-medium hover:bg-[#102a43]"
                    >
                        {loading ? (
                            <>
                                <LoadingComponents.ButtonLoader />
                            </>
                        ) : 'Place Order'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default DoctorLabOrderModal;
