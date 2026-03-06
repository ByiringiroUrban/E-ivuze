import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { LoadingComponents } from '../components/LoadingComponents';
import { AppContext } from '../context/AppContext';
import SEO from '../components/SEO';
import { FaMapMarkerAlt, FaPhone, FaBuilding, FaPaperPlane, FaSearch } from 'react-icons/fa';

const PharmacySelection = () => {
    const { backendUrl, token, userData } = useContext(AppContext);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const prescriptionId = searchParams.get('prescriptionId');

    const [pharmacies, setPharmacies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPharmacy, setSelectedPharmacy] = useState(null);
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchPharmacies();
    }, []);

    useEffect(() => {
        if (userData && userData.address) {
            // Format address from user profile object to string for display/edit
            const addr = userData.address;
            const formatted = typeof addr === 'string'
                ? addr
                : `${addr.line1 || ''}, ${addr.city || ''}`;
            setDeliveryAddress(formatted);
        }
    }, [userData]);

    const fetchPharmacies = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/pharmacy/public/approved`);
            if (data.success) {
                setPharmacies(data.pharmacies);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load pharmacies");
        } finally {
            setLoading(false);
        }
    };

    const handleSendPrescription = async (pharmacy) => {
        if (!prescriptionId) {
            toast.error("No prescription selected to send.");
            return;
        }

        // If not selected, open modal/confirmation logic
        setSelectedPharmacy(pharmacy);
    };

    const confirmSend = async () => {
        if (!selectedPharmacy || !deliveryAddress) {
            toast.error("Please provide a delivery address.");
            return;
        }

        setSubmitting(true);
        try {
            const { data } = await axios.post(`${backendUrl}/api/user/prescription/submit-to-pharmacy`, {
                prescriptionId,
                pharmacyId: selectedPharmacy._id,
                deliveryAddress: deliveryAddress, // Simple string or object depending on backend expectation
                userId: userData._id
            }, { headers: { token } });

            if (data.success) {
                toast.success("Prescription sent successfully!");
                navigate('/my-prescriptions');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to send prescription");
        } finally {
            setSubmitting(false);
            setSelectedPharmacy(null);
        }
    };

    const filteredPharmacies = pharmacies.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.address && JSON.stringify(p.address).toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            <SEO title="Select Pharmacy - One Healthline" description="Choose a pharmacy to fill your prescription." />

            {/* Header */}
            <div className="bg-white border-b py-8 shadow-sm">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Find a Pharmacy</h1>
                    {prescriptionId ? (
                        <p className="text-emerald-600 bg-emerald-50 inline-block px-4 py-1 rounded-full text-sm font-medium">
                            Sending Prescription items
                        </p>
                    ) : (
                        <p className="text-gray-500">Browse our network of approved pharmacies</p>
                    )}
                </div>
            </div>

            <div className="container mx-auto px-4 mt-8">
                {/* Search */}
                <div className="max-w-2xl mx-auto mb-8 relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by pharmacy name or location..."
                        className="w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {loading ? (
                    <LoadingComponents.SearchLoader text="Loading pharmacies..." />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {filteredPharmacies.length > 0 ? filteredPharmacies.map(pharmacy => (
                            <div key={pharmacy._id} className="bg-white rounded-xl shadow hover:shadow-md transition-shadow p-6 flex flex-col justify-between border border-gray-100">
                                <div>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                                            <FaBuilding size={24} />
                                        </div>
                                        {pharmacy.verified && (
                                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Verified</span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{pharmacy.name}</h3>
                                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                                        <div className="flex items-start gap-2">
                                            <FaMapMarkerAlt size={16} className="mt-0.5 shrink-0" />
                                            <span>
                                                {typeof pharmacy.address === 'string' ? pharmacy.address : (
                                                    `${pharmacy.address?.line1 || ''}, ${pharmacy.address?.city || ''}`
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaPhone size={16} />
                                            <span>{pharmacy.phone}</span>
                                        </div>
                                    </div>
                                </div>

                                {prescriptionId && (
                                    <button
                                        onClick={() => handleSendPrescription(pharmacy)}
                                        className="w-full mt-4 bg-[#006838] text-white py-2 rounded-lg hover:bg-[#88C250] transition-colors flex items-center justify-center gap-2 font-medium"
                                    >
                                        <FaPaperPlane size={16} /> Send Prescription
                                    </button>
                                )}
                            </div>
                        )) : (
                            <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed">
                                <p>No pharmacies found matching your search.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            {selectedPharmacy && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl animation-fade-in">
                        <h3 className="text-xl font-bold mb-4">Confirm Order</h3>
                        <p className="text-gray-600 mb-4 text-sm">
                            You are about to send your prescription to <strong>{selectedPharmacy.name}</strong>.
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                            <textarea
                                className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                                rows="3"
                                placeholder="Enter your full delivery address..."
                                value={deliveryAddress}
                                onChange={(e) => setDeliveryAddress(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <button
                                onClick={() => setSelectedPharmacy(null)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium"
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmSend}
                                disabled={submitting}
                                className="px-4 py-2 bg-[#006838] text-white rounded-lg hover:bg-[#88C250] text-sm font-medium flex items-center gap-2"
                            >
                                {submitting ? 'Sending...' : 'Confirm & Send'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PharmacySelection;
