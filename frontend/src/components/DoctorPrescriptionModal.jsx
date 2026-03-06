import React, { useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';
import { DoctorContext } from '../context/DoctorContext';
import { FaPills, FaPlus, FaTrash } from 'react-icons/fa';

const DoctorPrescriptionModal = ({ isOpen, onClose, patientId, patientName, appointmentId }) => {
    const { backendUrl } = useContext(AppContext);
    const { dToken } = useContext(DoctorContext);

    const [loading, setLoading] = useState(false);
    const [diagnosis, setDiagnosis] = useState('');
    const [notes, setNotes] = useState('');

    // State & Security
    const [isEmergency, setIsEmergency] = useState(false);
    const [docFile, setDocFile] = useState(null);
    const [medications, setMedications] = useState([
        { name: '', dosage: '', form: 'Tablet', frequency: '1-0-1', duration: '5 days', quantity: 1, route: 'Oral', instructions: 'After meals' }
    ]);

    if (!isOpen) return null;

    const handleMedChange = (index, field, value) => {
        const newMeds = [...medications];
        newMeds[index][field] = value;
        setMedications(newMeds);
    };

    const addMedication = () => {
        setMedications([...medications, { name: '', dosage: '', form: 'Tablet', frequency: '1-0-1', duration: '5 days', quantity: 1, route: 'Oral', instructions: 'After meals' }]);
    };

    const removeMedication = (index) => {
        if (medications.length === 1) return;
        const newMeds = medications.filter((_, i) => i !== index);
        setMedications(newMeds);
    };

    const handleSubmit = async () => {
        // Validation: Must have either medications with names OR a scanned file
        const hasMeds = medications.some(m => m.name.trim() !== '');
        if (!hasMeds && !docFile) {
            toast.error("Please provide either electronic medications or a scanned prescription file.");
            return;
        }

        if (hasMeds && medications.some(m => m.name && !m.dosage)) {
            toast.error("Please fill in dosage for all medications listed.");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('patientId', patientId);
            formData.append('appointmentId', appointmentId);
            formData.append('diagnosis', diagnosis);
            formData.append('notes', notes);
            formData.append('isEmergency', isEmergency);
            formData.append('medications', JSON.stringify(medications.filter(m => m.name.trim() !== '')));

            if (docFile) {
                formData.append('prescriptionFile', docFile);
            }

            const { data } = await axios.post(`${backendUrl}/api/clinical/prescription/create`, formData, {
                headers: { dToken, 'Content-Type': 'multipart/form-data' }
            });

            if (data.success) {
                toast.success("Prescription created successfully");
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
            <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-[#14324f] text-white p-4 flex justify-between items-center flex-shrink-0">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FaPills size={20} /> e-Prescription
                    </h3>
                    <button onClick={onClose} className="text-white hover:bg-white/20 p-1 rounded transition-colors">&times;</button>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                    <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 border border-blue-100">
                        Prescribing for: <strong>{patientName}</strong>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
                            <input
                                className="w-full border rounded-lg p-2 text-sm"
                                placeholder="Diagnosis justification..."
                                value={diagnosis}
                                onChange={(e) => setDiagnosis(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                            <input
                                type="checkbox"
                                id="emergency"
                                checked={isEmergency}
                                onChange={(e) => setIsEmergency(e.target.checked)}
                                className="w-4 h-4 text-red-600 rounded"
                            />
                            <label htmlFor="emergency" className="text-sm font-semibold text-red-600">Mark as Emergency</label>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center border-b pb-2">
                            <label className="block text-sm font-medium text-gray-700">Rx (Medications)</label>
                            <button onClick={addMedication} className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded hover:bg-primary/20">
                                <FaPlus size={14} /> Add Drug
                            </button>
                        </div>

                        {medications.map((med, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100 items-end">
                                <div className="col-span-12 sm:col-span-3">
                                    <label className="text-[10px] text-gray-500  ">Drug Name</label>
                                    <input
                                        className="w-full border rounded p-1.5 text-sm"
                                        placeholder="e.g. Amoxicillin"
                                        value={med.name}
                                        onChange={(e) => handleMedChange(index, 'name', e.target.value)}
                                    />
                                </div>
                                <div className="col-span-4 sm:col-span-2">
                                    <label className="text-[10px] text-gray-500  ">Form</label>
                                    <select
                                        className="w-full border rounded p-1.5 text-sm"
                                        value={med.form}
                                        onChange={(e) => handleMedChange(index, 'form', e.target.value)}
                                    >
                                        <option>Tablet</option>
                                        <option>Capsule</option>
                                        <option>Syrup</option>
                                        <option>Injection</option>
                                        <option>Ointment</option>
                                        <option>Drops</option>
                                    </select>
                                </div>
                                <div className="col-span-4 sm:col-span-2">
                                    <label className="text-[10px] text-gray-500  ">Dosage</label>
                                    <input
                                        className="w-full border rounded p-1.5 text-sm"
                                        placeholder="500mg"
                                        value={med.dosage}
                                        onChange={(e) => handleMedChange(index, 'dosage', e.target.value)}
                                    />
                                </div>
                                <div className="col-span-4 sm:col-span-2">
                                    <label className="text-[10px] text-gray-500  ">Freq</label>
                                    <select
                                        className="w-full border rounded p-1.5 text-sm"
                                        value={med.frequency}
                                        onChange={(e) => handleMedChange(index, 'frequency', e.target.value)}
                                    >
                                        <option>1-0-1</option>
                                        <option>1-1-1</option>
                                        <option>1-0-0</option>
                                        <option>0-0-1</option>
                                        <option>PRN (As needed)</option>
                                        <option>BID (Twice daily)</option>
                                        <option>TID (Thrice daily)</option>
                                        <option>QID (Four times daily)</option>
                                    </select>
                                </div>
                                <div className="col-span-4 sm:col-span-1">
                                    <label className="text-[10px] text-gray-500  ">Dur</label>
                                    <input
                                        className="w-full border rounded p-1.5 text-sm"
                                        placeholder="5d"
                                        value={med.duration}
                                        onChange={(e) => handleMedChange(index, 'duration', e.target.value)}
                                    />
                                </div>
                                <div className="col-span-4 sm:col-span-1">
                                    <label className="text-[10px] text-gray-500  ">Qty</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded p-1.5 text-sm"
                                        value={med.quantity}
                                        onChange={(e) => handleMedChange(index, 'quantity', e.target.value)}
                                    />
                                </div>
                                <div className="col-span-4 sm:col-span-1">
                                    <label className="text-[10px] text-gray-500  ">Route</label>
                                    <select
                                        className="w-full border rounded p-1.5 text-sm"
                                        value={med.route}
                                        onChange={(e) => handleMedChange(index, 'route', e.target.value)}
                                    >
                                        <option>Oral</option>
                                        <option>IV</option>
                                        <option>IM</option>
                                        <option>Topical</option>
                                        <option>SC</option>
                                    </select>
                                </div>
                                <div className="col-span-4 sm:col-span-1 flex justify-center pb-1">
                                    <button onClick={() => removeMedication(index)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                        <FaTrash size={16} />
                                    </button>
                                </div>
                                <div className="col-span-12">
                                    <input
                                        className="w-full border-t border-dashed border-gray-200 bg-transparent p-1.5 text-xs focus:bg-white"
                                        placeholder="Special Instructions (e.g. Take after food)"
                                        value={med.instructions}
                                        onChange={(e) => handleMedChange(index, 'instructions', e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                            <textarea
                                className="w-full border rounded-lg p-2 text-sm"
                                rows="3"
                                placeholder="Lifestyle advice, warnings..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Scanned Prescription (Scanned/Photo)</label>
                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors relative cursor-pointer">
                                <input
                                    type="file"
                                    id="presc-file"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) => setDocFile(e.target.files[0])}
                                    accept="image/*,application/pdf"
                                />
                                <div className="text-center text-gray-500">
                                    {docFile ? (
                                        <p className="text-sm text-green-600 font-medium">Selected: {docFile.name}</p>
                                    ) : (
                                        <>
                                            <p className="text-sm">Click or drag to upload scan</p>
                                            <p className="text-[10px] mt-1 text-gray-400">PDF or Images accepted</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 flex justify-end gap-2 border-t border-gray-100 flex-shrink-0">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded text-sm font-medium">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-2 bg-[#14324f] text-white rounded text-sm font-medium hover:bg-[#102a43]"
                    >
                        {loading ? 'Creating...' : 'Issue Prescription'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DoctorPrescriptionModal;
