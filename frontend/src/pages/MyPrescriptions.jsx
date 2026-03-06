import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPills, FaFileMedical, FaPrescriptionBottle, FaDownload, FaEye, FaEyeSlash, FaClinicMedical, FaUserMd, FaChevronRight, FaPaperPlane, FaTimes, FaHistory, FaCalendarAlt, FaFilePdf, FaCloudDownloadAlt, FaFileCode } from 'react-icons/fa';
import { LoadingComponents } from '../components/LoadingComponents';

const MyPrescriptions = () => {
  const { backendUrl, token, userData } = useContext(AppContext);
  const { t, i18n } = useTranslation();

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (token && userData) {
      fetchPrescriptions();
    }
  }, [token, userData]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${backendUrl}/api/clinical/patient-prescriptions`,
        { userId: userData._id },
        { headers: { token } }
      );

      if (data.success) {
        setPrescriptions(data.prescriptions);
      } else {
        toast.error(data.message || t('pages.myPrescriptions.fetchError'));
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      toast.error(
        error.response?.data?.message || t('pages.myPrescriptions.fetchError')
      );
    } finally {
      setLoading(false);
    }
  };

  const closeOrderModal = () => {
    setSelectedOrder(null);
    setShowOrderModal(false);
  };

  const openOrderModal = async (orderId) => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/pharmacy/order/${orderId}`, { headers: { token } });
      if (data.success && data.order) {
        setSelectedOrder(data.order);
        setShowOrderModal(true);
      } else {
        toast.error(data.message || "Failed to load order details");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error loading order.");
    }
  };

  const handleSendMessage = async (text) => {
    if (!selectedOrder || !text.trim()) return;

    try {
      const { data } = await axios.post(`${backendUrl}/api/user/pharmacy/order/${selectedOrder._id}/message`,
        { text },
        { headers: { token } }
      );

      if (data.success) {
        setSelectedOrder(prev => ({
          ...prev,
          messages: [...(prev.messages || []), {
            sender: 'patient',
            text,
            createdAt: new Date().toISOString()
          }]
        }));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message");
    }
  };

  const formatDate = (dateString, isFull = false) => {
    if (!dateString) return t('pages.myPrescriptions.na');
    return new Date(dateString).toLocaleDateString(
      i18n.language || 'en-US',
      isFull ? { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' } : { year: 'numeric', month: 'long', day: 'numeric' }
    );
  };

  const renderPrescription = (prescription, idx) => {
    const isExpanded = expandedId === prescription._id;
    return (
      <motion.div
        key={prescription._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.1 }}
        className="bg-white border border-slate-200 overflow-hidden shadow-xl"
      >
        <div className="p-0">
          <div className="flex flex-col lg:grid lg:grid-cols-[200px_1fr_200px]">
            {/* Meta Section */}
            <div className="bg-[#004d2a] p-6 flex lg:flex-col items-center justify-center lg:justify-center gap-4 text-center">
              <div className="w-16 h-16 bg-white/10 flex flex-col items-center justify-center border-b-2 border-emerald-400">
                <span className="text-[10px] font-black text-emerald-200   leading-none">{new Date(prescription.createdAt).toLocaleString('default', { month: 'short' })}</span>
                <span className="text-2xl font-black text-white">{new Date(prescription.createdAt).getDate()}</span>
              </div>
              <div className="text-left lg:text-center">
                <p className="text-[9px] font-black text-emerald-400   tracking-widest leading-none mb-1">REFERENCE NO.</p>
                <p className="text-xs font-mono font-bold text-white   tracking-tighter">PR-{prescription._id.slice(-8).toUpperCase()}</p>
              </div>
            </div>

            {/* Main Info */}
            <div className="p-6 lg:p-8 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="bg-primary/10 text-primary text-[9px] font-black px-2 py-0.5   tracking-widest border border-primary/20">Active RX Card</span>
                  {prescription.pharmacyOrderId && (
                    <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-2 py-0.5   tracking-widest border border-emerald-100 flex items-center gap-1">
                      <FaClinicMedical /> Locked to Pharmacy
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-black text-slate-900   tracking-tight">
                  {prescription.diagnosis || t('pages.myPrescriptions.prescription')}
                </h3>
                <div className="mt-4 flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <FaUserMd className="text-emerald-600 opacity-50" />
                    <div className="flex flex-col">
                      <p className="text-[9px] font-black text-slate-400   tracking-widest leading-none">Prescribing Doctor</p>
                      <p className="text-sm font-bold text-slate-700  ">{prescription.docId?.name || 'Dr. Medical Provider'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaPills className="text-emerald-600 opacity-50" />
                    <div className="flex flex-col">
                      <p className="text-[9px] font-black text-slate-400   tracking-widest leading-none">Items count</p>
                      <p className="text-sm font-bold text-slate-700  ">{prescription.medications?.length || 0} Medications</p>
                    </div>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-8 border-t border-slate-100 pt-8"
                  >
                    <p className="text-[10px] font-black text-[#006838]   tracking-[0.3em] mb-6 flex items-center gap-3">
                      <span className="w-8 h-[2px] bg-[#006838]"></span> Med Management List
                    </p>

                    <div className="grid gap-4">
                      {prescription.medications?.map((med, mIdx) => (
                        <div key={mIdx} className="bg-slate-50 border border-slate-100 p-6 grid grid-cols-1 md:grid-cols-4 gap-6 hover:bg-white transition-colors">
                          <div className="md:col-span-1">
                            <p className="text-[9px] font-black text-slate-400   tracking-widest mb-1">Medication</p>
                            <p className="text-sm font-black text-slate-900   tracking-tight">{med.name}</p>
                          </div>
                          <div className="md:col-span-1">
                            <p className="text-[9px] font-black text-slate-400   tracking-widest mb-1">Dosage / Frequency</p>
                            <p className="text-xs font-bold text-slate-700">{med.dosage} • {med.frequency}</p>
                          </div>
                          <div className="md:col-span-1">
                            <p className="text-[9px] font-black text-slate-400   tracking-widest mb-1">Duration</p>
                            <p className="text-xs font-bold text-slate-700">{med.duration}</p>
                          </div>
                          {med.instructions && (
                            <div className="md:col-span-1">
                              <p className="text-[9px] font-black text-slate-400   tracking-widest mb-1">Special Instructions</p>
                              <p className="text-[11px] font-medium text-slate-600 leading-tight italic">"{med.instructions}"</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {prescription.notes && (
                      <div className="mt-6 p-4 bg-amber-50 border-l-4 border-amber-400">
                        <p className="text-[10px] font-black text-amber-600   tracking-widest mb-1">Doctor's Clinical Notes</p>
                        <p className="text-xs font-bold text-amber-900 leading-relaxed">"{prescription.notes}"</p>
                      </div>
                    )}

                    {prescription.followUpDate && (
                      <div className="mt-6 flex items-center gap-4 bg-emerald-50 border border-emerald-100 p-4">
                        <div className="text-emerald-500 bg-white p-3 shadow-md">
                          <FaCalendarAlt size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-emerald-400   tracking-widest leading-none">Next Clinical Follow-up</p>
                          <p className="text-sm font-black text-emerald-900 mt-1  ">{formatDate(prescription.followUpDate)}</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Bar */}
            <div className="bg-slate-50 p-6 flex flex-col justify-center gap-3 border-t lg:border-t-0 lg:border-l border-slate-100 min-w-[220px]">
              <button
                onClick={() => setExpandedId(isExpanded ? null : prescription._id)}
                className="w-full bg-white text-[#006838] border border-slate-200 px-4 py-4 font-black text-[10px]   tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-50 transition shadow-sm"
              >
                {isExpanded ? <><FaEyeSlash /> Hide Intelligence</> : <><FaEye /> Full Intel Report</>}
              </button>

              {prescription.fileUrl ? (
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={prescription.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#004d2a] text-white px-2 py-3 font-black text-[9px]   tracking-widest flex items-center justify-center gap-2 hover:bg-[#006838] transition shadow-lg shadow-slate-200"
                  >
                    <FaFilePdf /> View
                  </a>
                  <a
                    href={prescription.fileUrl}
                    download
                    className="bg-primary text-white px-2 py-3 font-black text-[9px]   tracking-widest flex items-center justify-center gap-2 hover:bg-primary-dark transition shadow-lg shadow-primary/20"
                  >
                    <FaCloudDownloadAlt /> Get
                  </a>
                </div>
              ) : (
                <div className="p-3 border border-slate-200 bg-white flex flex-col items-center justify-center opacity-40">
                  <FaFileCode className="text-slate-300 mb-1" />
                  <p className="text-[8px] font-black   text-slate-400">Digital ONLY RX</p>
                </div>
              )}

              {prescription.pharmacyOrderId ? (
                <button
                  onClick={() => openOrderModal(prescription.pharmacyOrderId._id || prescription.pharmacyOrderId)}
                  className="w-full bg-emerald-500 text-white px-4 py-4 font-black text-[10px]   tracking-[0.1em] flex items-center justify-center gap-2 hover:bg-emerald-600 transition shadow-lg shadow-emerald-100"
                >
                  Track Fulfillment <FaChevronRight size={10} />
                </button>
              ) : (
                !prescription.submittedToPharmacy && (
                  <button
                    onClick={() => {
                      if (window.confirm('Submit this prescription to a pharmacy?')) {
                        window.location.href = `/pharmacy?prescriptionId=${prescription._id}`;
                      }
                    }}
                    className="w-full bg-amber-500 text-white px-4 py-4 font-black text-[10px]   tracking-widest flex items-center justify-center gap-2 hover:bg-amber-600 transition shadow-lg animate-pulse"
                  >
                    <FaClinicMedical /> Forward to Pharmacy
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-20">
      <SEO title={t('pages.myPrescriptions.title')} description={t('pages.myPrescriptions.subtitle')} />

      {/* Premium Header - Matching History Aesthetic */}
      <div className="bg-[#006838] relative overflow-hidden pt-16 pb-24 px-6">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-400/10 skew-x-12 transform translate-x-20"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div>
              <p className="text-emerald-400 font-black text-[10px]   tracking-[0.3em] mb-2 px-1">Prescription Intelligence</p>
              <h1 className="text-4xl font-extrabold text-white tracking-tight  ">Ibyanditswe N'umuganga</h1>
              <p className="text-emerald-200 mt-2 font-medium flex items-center gap-2">
                <FaPills className="opacity-60" />
                Comprehensive log of your medicinal therapies
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-none border border-white/20 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-none flex items-center justify-center text-primary-light text-2xl">
                <FaHistory />
              </div>
              <div>
                <p className="text-[10px] font-black   text-emerald-200 leading-none tracking-widest">Archive Size</p>
                <p className="text-2xl font-black text-white mt-1 leading-none">{prescriptions.length}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-12 relative z-10">
        {loading ? (
          <LoadingComponents.MedicalLoader text="Verifying Medical Records..." />
        ) : prescriptions.length === 0 ? (
          <div className="bg-white shadow-xl border border-slate-200 p-20 text-center">
            <div className="w-20 h-20 bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-6 text-slate-300">
              <FaPrescriptionBottle size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-900   tracking-tight">No Active Prescriptions</h3>
            <p className="text-slate-400 mt-2 font-medium">Your medicinal therapy records are currently empty. New prescriptions will appear here after consultation.</p>
          </div>
        ) : (
          <div className="space-y-10">{prescriptions.map((p, i) => renderPrescription(p, i))}</div>
        )}
      </div>

      {/* Order Details Modal (Pharmacy Interaction) */}
      <AnimatePresence>
        {showOrderModal && selectedOrder && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b-4 border-emerald-500 flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="font-black text-xl text-slate-900   tracking-tight">Pharmacy Order Insight</h3>
                  <p className="text-[10px] font-black text-emerald-600   tracking-widest">Tracking Fulfillment Step • Order #{selectedOrder._id.slice(-6)}</p>
                </div>
                <button onClick={closeOrderModal} className="w-10 h-10 bg-[#004d2a] text-white flex items-center justify-center hover:bg-[#006838] transition shadow-lg"><FaTimes /></button>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto p-8 space-y-8 flex-1 bg-white">
                {/* Status Steps Dashboard */}
                <div className="grid grid-cols-4 gap-2">
                  {['Pending', 'Verified', 'Shipped', 'Delivered'].map((step, idx) => {
                    const currentIdx = ['Pending', 'Verified', 'Shipped', 'Delivered'].indexOf(selectedOrder.orderStatus);
                    const isPast = idx <= currentIdx;
                    return (
                      <div key={step} className="flex flex-col items-center">
                        <div className={`w-full h-2 mb-2 ${isPast ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-slate-100'}`}></div>
                        <span className={`text-[9px] font-black   tracking-widest ${isPast ? 'text-emerald-600' : 'text-slate-300'}`}>{step}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Pricing/Delivery Group */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-slate-200">
                  <div className="p-6 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200">
                    <p className="text-[9px] font-black   text-slate-400 tracking-widest mb-3 flex items-center gap-2">
                      <span className="w-3 h-3 bg-emerald-500 rounded-full"></span> Financial Quote
                    </p>
                    <p className="text-3xl font-black text-[#006838]">{selectedOrder.total > 0 ? selectedOrder.total.toLocaleString() + ' RWF' : 'PENDING'}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1  ">Inclusive of VAT & Delivery</p>
                  </div>
                  <div className="p-6 bg-white">
                    <p className="font-black text-[9px]   text-slate-400 tracking-widest mb-3 flex items-center gap-2">
                      <FaClinicMedical className="text-emerald-600" /> Fulfilling Pharmacy
                    </p>
                    <p className="text-sm font-black text-slate-900   leading-none">{selectedOrder.pharmacyId?.name || 'Authorized Pharmacy'}</p>
                    <p className="text-xs font-bold text-slate-400 mt-2 italic leading-tight">{selectedOrder.deliveryAddress?.line1}, {selectedOrder.deliveryAddress?.city}</p>
                  </div>
                </div>

                {/* Messaging Segment */}
                <div className="flex flex-col h-80 border-2 border-[#006838] bg-slate-50">
                  <div className="bg-[#006838] px-4 py-3 text-[10px] font-black text-white   tracking-widest flex items-center gap-2">
                    <FaPaperPlane className="text-primary-light" /> Pharmacy Communication Link
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {selectedOrder.messages && selectedOrder.messages.length > 0 ? (
                      selectedOrder.messages.map((msg, i) => (
                        <div key={i} className={`flex flex-col ${msg.sender === 'patient' ? 'items-end' : 'items-start'}`}>
                          <div className={`max-w-[85%] px-5 py-3 shadow-lg text-sm font-medium ${msg.sender === 'patient' ? 'bg-[#14324f] text-white' : 'bg-white text-slate-700 border border-slate-200'}`}>
                            {msg.text}
                          </div>
                          <span className="text-[9px] font-black text-slate-400 mt-2   tracking-widest px-1">{formatDate(msg.createdAt, true)}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-300 opacity-50">
                        <FaPaperPlane size={30} className="mb-2" />
                        <p className="text-center text-xs font-black   tracking-widest">No Active Thread</p>
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-white border-t-2 border-[#006838] flex gap-3">
                    <input
                      type="text"
                      placeholder="MESSAGE PHARMACY COMMAND..."
                      className="flex-1 bg-slate-50 border border-slate-200 px-4 py-3 text-xs font-black   tracking-widest outline-none focus:bg-white focus:border-primary transition-all"
                      id="patient-chat-input"
                      onKeyDown={(e) => e.key === 'Enter' && (handleSendMessage(e.target.value), e.target.value = '')}
                    />
                    <button
                      className="bg-primary text-white p-4 hover:bg-primary-dark transition shadow-xl"
                      onClick={() => {
                        const el = document.getElementById('patient-chat-input');
                        if (el) { handleSendMessage(el.value); el.value = ''; }
                      }}
                    >
                      <FaPaperPlane />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyPrescriptions;
