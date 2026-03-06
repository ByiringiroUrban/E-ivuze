import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import SEO from '../components/SEO';
import { FaMapMarkerAlt, FaPhone, FaBuilding, FaPaperPlane, FaSearch, FaMicroscope } from 'react-icons/fa';
import { LoadingComponents } from '../components/LoadingComponents';

const LabSelection = () => {
    const { backendUrl, token, userData } = useContext(AppContext);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderId = searchParams.get('orderId');

    const [labs, setLabs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLab, setSelectedLab] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchLabs();
    }, []);

    const fetchLabs = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/lab/all`);
            if (data.success) {
                setLabs(data.labs);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load diagnostic centers");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectLab = async (lab) => {
        if (!orderId) {
            toast.error("No lab order selected.");
            return;
        }
        setSelectedLab(lab);
    };

    const confirmSubmit = async () => {
        if (!selectedLab) return;

        setSubmitting(true);
        try {
            const { data } = await axios.post(`${backendUrl}/api/user/lab-order/submit`, {
                orderId,
                labId: selectedLab._id,
                userId: userData._id
            }, { headers: { token } });

            if (data.success) {
                toast.success("Order submitted to Diagnostic Center!");
                navigate('/medical-record'); // Go back to medical record
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to submit order");
        } finally {
            setSubmitting(false);
            setSelectedLab(null);
        }
    };

    const filteredLabs = labs.filter(l =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.address && JSON.stringify(l.address).toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            <SEO title="Select Diagnostic Center - One Healthline" description="Choose a diagnostic center for your lab tests." />

            {/* Header */}
            <div className="bg-white border-b py-8 shadow-sm">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Find a Diagnostic Center</h1>
                    {orderId ? (
                        <p className="text-emerald-500 bg-emerald-50 inline-block px-4 py-1 rounded-full text-sm font-medium">
                            Submitting Lab Order
                        </p>
                    ) : (
                        <p className="text-gray-500">Browse our network of approved diagnostic centers</p>
                    )}
                </div>
            </div>

            <div className="container mx-auto px-4 mt-8">
                {/* Search */}
                <div className="max-w-2xl mx-auto mb-8 relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by lab name or location..."
                        className="w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {loading ? (
                    <LoadingComponents.MedicalLoader text="Loading diagnostic centers..." />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {filteredLabs.length > 0 ? filteredLabs.map(lab => (
                            <div key={lab._id} className="bg-white rounded-xl shadow hover:shadow-md transition-shadow p-6 flex flex-col justify-between border border-gray-100">
                                <div>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                                            <FaMicroscope size={24} />
                                        </div>
                                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Approved</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{lab.name}</h3>
                                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                                        <div className="flex items-start gap-2">
                                            <FaMapMarkerAlt size={16} className="mt-0.5 shrink-0" />
                                            <span>
                                                {typeof lab.address === 'string' ? lab.address : (
                                                    `${lab.address?.line1 || ''}, ${lab.address?.city || ''}`
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaPhone size={16} />
                                            <span>{lab.phone}</span>
                                        </div>
                                    </div>
                                    {/* Specialties Tag Cloud */}
                                    {lab.speciality && lab.speciality.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-4">
                                            {lab.speciality.slice(0, 3).map((spec, i) => (
                                                <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                    {spec}
                                                </span>
                                            ))}
                                            {lab.speciality.length > 3 && <span className="text-[10px] text-gray-400">+{lab.speciality.length - 3}</span>}
                                        </div>
                                    )}
                                </div>

                                {orderId && (
                                    <button
                                        onClick={() => handleSelectLab(lab)}
                                        className="w-full mt-4 bg-[#006838] text-white py-2 rounded-lg hover:bg-[#88C250] transition-colors flex items-center justify-center gap-2 font-medium"
                                    >
                                        <FaPaperPlane size={16} /> Send Order
                                    </button>
                                )}
                            </div>
                        )) : (
                            <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed">
                                <p>No diagnostic centers found.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            {selectedLab && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl animation-fade-in">
                        <h3 className="text-xl font-bold mb-4">Confirm Lab Order</h3>
                        <p className="text-gray-600 mb-4 text-sm">
                            You are about to submit your lab test request to <strong>{selectedLab.name}</strong>.
                        </p>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <button
                                onClick={() => setSelectedLab(null)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium"
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmSubmit}
                                disabled={submitting}
                                className="px-4 py-2 bg-[#006838] text-white rounded-lg hover:bg-[#88C250] text-sm font-medium flex items-center gap-2"
                            >
                                {submitting ? 'Submitting...' : 'Confirm & Submit'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LabSelection;
