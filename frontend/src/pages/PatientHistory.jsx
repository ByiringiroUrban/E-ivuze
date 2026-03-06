import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import SEO from '../components/SEO';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaHistory, FaFileMedical, FaPills, FaFlask, FaUserMd, FaCalendar, FaDownload,
    FaChevronRight, FaCode, FaCreditCard, FaTimes, FaExternalLinkAlt, FaSyringe, FaNotesMedical,
    FaExclamationTriangle
} from 'react-icons/fa';
import { LoadingComponents } from '../components/LoadingComponents';

const PatientHistory = () => {
    const { token, backendUrl, userData } = useContext(AppContext);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('clinical');
    const [history, setHistory] = useState({
        visits: [],
        payments: [],
        prescriptions: [],
        labs: [],
        referrals: [],
        immunizations: []
    });
    const [filter, setFilter] = useState('all');
    const [selectedVisit, setSelectedVisit] = useState(null);

    useEffect(() => {
        if (token && userData?._id) {
            fetchFullHistory();
        }
    }, [token, userData?._id]);

    const fetchFullHistory = async () => {
        try {
            setLoading(true);
            const [visitsRes, paymentsRes, rxRes, labsRes, referralsRes, immunizationsRes] = await Promise.all([
                axios.post(`${backendUrl}/api/clinical/patient-visits`, { patientId: userData._id }, { headers: { token } }),
                axios.get(`${backendUrl}/api/user/payments`, { headers: { token } }),
                axios.post(`${backendUrl}/api/clinical/patient-prescriptions`, { userId: userData._id }, { headers: { token } }),
                axios.post(`${backendUrl}/api/clinical/patient-labs`, { userId: userData._id }, { headers: { token } }),
                axios.post(`${backendUrl}/api/clinical/patient-referrals`, { userId: userData._id }, { headers: { token } }),
                axios.post(`${backendUrl}/api/clinical/patient-immunizations`, { userId: userData._id }, { headers: { token } })
            ]);

            setHistory({
                visits: visitsRes.data.success ? visitsRes.data.visits : [],
                payments: paymentsRes.data.success ? paymentsRes.data.payments : [],
                prescriptions: rxRes.data.success ? rxRes.data.prescriptions : [],
                labs: labsRes.data.success ? labsRes.data.orders : [],
                referrals: referralsRes.data.success ? referralsRes.data.referrals : [],
                immunizations: immunizationsRes.data.success ? immunizationsRes.data.immunizations : []
            });
        } catch (error) {
            console.error("History fetch error:", error);
            toast.error("Failed to load some history entries");
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'clinical', label: 'Medical History', icon: <FaHistory /> },
        { id: 'codes', label: 'Diagnosis Codes', icon: <FaUserMd /> },
        { id: 'prescriptions', label: 'Prescriptions', icon: <FaPills /> },
        { id: 'labs', label: 'Lab Orders', icon: <FaFlask /> },
        { id: 'payments', label: 'Payment Logs', icon: <FaCalendar /> }
    ];

    if (!token) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center p-8 bg-white rounded-none shadow-xl">
                <FaFileMedical className="mx-auto text-primary text-5xl mb-4 opacity-20" />
                <h2 className="text-2xl font-bold text-gray-800">Access Restricted</h2>
                <p className="text-gray-500 mt-2">Please login to view your personal history.</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20">
            <SEO title="My History - Onehealthline" description="Comprehensive medical and financial history." />

            {/* Premium Header */}
            <div className="bg-[#006838] relative overflow-hidden pt-16 pb-24 px-6">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-[#88C250]/10 skew-x-12 transform translate-x-20"></div>
                <div className="max-w-6xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                        <div>
                            <h1 className="text-4xl font-extrabold text-white tracking-tight">Personal Archive</h1>
                            <p className="text-blue-200 mt-2 font-medium flex items-center gap-2">
                                <FaCalendar className="opacity-60" />
                                Comprehensive records of your health journey
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={fetchFullHistory}
                                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-none backdrop-blur-md border border-white/20 transition-all font-semibold flex items-center gap-2"
                            >
                                <FaDownload /> Export PDF
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Content Container */}
            <div className="max-w-6xl mx-auto px-6 -mt-12 relative z-10">
                <div className="bg-white rounded-none shadow-2xl shadow-blue-900/5 border border-white overflow-hidden">
                    {/* Tab Navigation */}
                    <div className="flex border-b border-gray-100 bg-gray-50/50 p-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 text-sm font-bold tracking-normal uppercase transition-all rounded-none ${activeTab === tab.id
                                    ? 'bg-white text-[#006838] shadow-sm border border-gray-100 translate-y-0'
                                    : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-8">
                        {loading ? (
                            <LoadingComponents.RecordsLoader text="Loading history..." />
                        ) : (
                            <AnimatePresence mode="wait">
                                {activeTab === 'clinical' && (
                                    <motion.div
                                        key="clinical"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-xl font-bold text-gray-800">Clinical Consultations</h3>
                                            <div className="flex gap-2">
                                                <select
                                                    value={filter}
                                                    onChange={(e) => setFilter(e.target.value)}
                                                    className="bg-gray-50 border-none rounded-none px-4 py-2 text-sm font-bold text-gray-600 focus:ring-2 focus:ring-primary/20"
                                                >
                                                    <option value="all">Recent First</option>
                                                    <option value="oldest">Oldest First</option>
                                                </select>
                                            </div>
                                        </div>

                                        {history.visits.length === 0 ? (
                                            <EmptyState message="No clinical visits found in our records." />
                                        ) : (
                                            <div className="grid gap-4">
                                                {history.visits.map((visit, idx) => (
                                                    <VisitCard
                                                        key={visit._id}
                                                        visit={visit}
                                                        index={idx}
                                                        onOpen={() => setSelectedVisit(visit)}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === 'codes' && (
                                    <motion.div
                                        key="codes"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl flex items-start gap-4 mb-8">
                                            <div className="bg-[#006838] p-3 rounded-xl text-white shadow-lg shadow-emerald-200">
                                                <FaCode size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-emerald-900">Diagnosis Code Ledger</h4>
                                                <p className="text-sm text-emerald-700/70 mt-1">
                                                    Official ICD-10 and Clinical codes assigned by your medical providers during consultations.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="bg-gray-50/80 text-[10px] uppercase tracking-wider font-black text-gray-400">
                                                        <th className="px-6 py-4">Date</th>
                                                        <th className="px-6 py-4">Code</th>
                                                        <th className="px-6 py-4">Description</th>
                                                        <th className="px-6 py-4">Type</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {history.visits.flatMap(v => (v.diagnosis || []).map(d => ({ ...d, date: v.visitDate || v.recordedAt }))).map((diag, i) => (
                                                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="px-6 py-4 text-sm text-gray-500">{new Date(diag.date).toLocaleDateString()}</td>
                                                            <td className="px-6 py-4">
                                                                <span className="font-mono text-xs font-bold bg-primary/5 text-primary px-2 py-1 rounded-lg">
                                                                    {diag.code || 'N/A'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm font-semibold text-gray-800">{diag.description}</td>
                                                            <td className="px-6 py-4">
                                                                <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full ${diag.type === 'Primary' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                                                                    }`}>
                                                                    {diag.type || 'Secondary'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {history.visits.length === 0 && <div className="p-12 text-center text-gray-400 italic">No diagnostic codes recorded.</div>}
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'prescriptions' && (
                                    <motion.div
                                        key="prescriptions"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <h3 className="text-xl font-bold text-gray-800">Medication History</h3>
                                        <div className="grid gap-4">
                                            {history.prescriptions.length === 0 ? <EmptyState message="No prescriptions found." /> : (
                                                history.prescriptions.map((rx) => (
                                                    <div key={rx._id} className="p-6 bg-white border border-gray-100 rounded-2xl">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div>
                                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Prescribed On</p>
                                                                <p className="font-bold text-gray-800">{new Date(rx.createdAt).toLocaleDateString()}</p>
                                                            </div>
                                                            <div className="bg-emerald-50 text-[#006838] text-[10px] font-black px-2 py-1 rounded-lg">
                                                                {rx.medications?.length || 0} ITEMS
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            {rx.medications?.map((med, i) => (
                                                                <div key={i} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                                                                    <span className="font-semibold text-gray-700">{med.name}</span>
                                                                    <span className="text-gray-400 text-xs">{med.dosage} • {med.duration}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'labs' && (
                                    <motion.div
                                        key="labs"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <h3 className="text-xl font-bold text-gray-800">Laboratory Archives</h3>
                                        <div className="grid gap-4">
                                            {history.labs.length === 0 ? <EmptyState message="No lab orders found." /> : (
                                                history.labs.map((lab) => (
                                                    <div key={lab._id} className="p-6 bg-white border border-gray-100 rounded-2xl flex justify-between items-center">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-primary">
                                                                <FaFlask />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-800">{lab.testName}</p>
                                                                <p className="text-xs text-gray-400">{new Date(lab.orderedAt).toLocaleDateString()} • {lab.testCategory}</p>
                                                            </div>
                                                        </div>
                                                        <span className={`text-[10px] font-black px-3 py-1 rounded-full ${lab.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                            }`}>
                                                            {lab.status}
                                                        </span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'payments' && (
                                    <motion.div
                                        key="payments"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xl font-bold text-gray-800">Financial Ledger</h3>
                                            <div className="flex flex-col text-right">
                                                <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Total Expenses</span>
                                                <span className="text-2xl font-black text-[#006838]">
                                                    {history.payments.filter(p => p.status === 'approved').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()} RWF
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {history.payments.length === 0 ? <EmptyState message="No payment transactions found." /> : (
                                                history.payments.map((pay) => (
                                                    <div key={pay._id} className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl hover:border-primary/20 transition-all group">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                                                                <FaCreditCard size={20} />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-800">Consultation Fee</p>
                                                                <p className="text-xs text-gray-400">{new Date(pay.createdAt).toLocaleDateString()} • {new Date(pay.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-lg font-black text-gray-800">{pay.amount.toLocaleString()} RWF</p>
                                                            <span className={`text-[10px] font-black uppercase tracking-wider ${pay.status === 'approved' ? 'text-emerald-500' :
                                                                pay.status === 'rejected' ? 'text-rose-500' : 'text-amber-500'
                                                                }`}>
                                                                {pay.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        )}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {selectedVisit && (
                    <VisitSummaryModal
                        visit={selectedVisit}
                        onClose={() => setSelectedVisit(null)}
                        linkedData={{
                            prescriptions: history.prescriptions.filter(p => p.appointmentId === selectedVisit.appointmentId),
                            labs: history.labs.filter(l => l.appointmentId === selectedVisit.appointmentId),
                            referrals: history.referrals.filter(r => r.appointmentId === selectedVisit.appointmentId || r.clinicalSummary?.includes(selectedVisit._id)),
                            immunizations: history.immunizations.filter(i => i.appointmentId === selectedVisit.appointmentId)
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

const VisitCard = ({ visit, index, onOpen }) => {
    const visitDate = visit.visitDate || visit.recordedAt || visit.createdAt;
    const dateObj = new Date(visitDate);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-6 bg-white border border-gray-100 rounded-none hover:shadow-xl hover:shadow-blue-900/5 transition-all group"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4">
                    <div className="w-14 h-14 bg-emerald-50 rounded-none flex flex-col items-center justify-center border border-emerald-100">
                        <span className="text-[10px] uppercase font-black text-emerald-400 leading-none">
                            {dateObj.toLocaleString('default', { month: 'short' })}
                        </span>
                        <span className="text-lg font-black text-emerald-900 leading-none">
                            {dateObj.getDate()}
                        </span>
                    </div>
                    <div>
                        <h4 className="text-lg font-extrabold text-gray-900 group-hover:text-primary transition-colors">{visit.visitType} Session</h4>
                        <p className="text-sm text-gray-500 font-medium">{visit.facilityId || 'General Healthcare Facility'}</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#006838] bg-emerald-50 px-2 py-1 rounded-none border border-emerald-100">
                        {visit.outcome}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-50">
                <div>
                    <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider block mb-1">Chief Complaint</span>
                    <p className="text-sm text-gray-700 font-medium line-clamp-2 italic">"{visit.chiefComplaint}"</p>
                </div>
                <div>
                    <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider block mb-1">Diagnoses</span>
                    <div className="flex flex-wrap gap-1">
                        {(visit.diagnosis || []).map((d, i) => (
                            <span key={i} className="text-xs font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-md">
                                {d.description} {d.code && <span className="text-[9px] text-primary/60 ml-1">[{d.code}]</span>}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="flex items-end justify-end">
                    <button
                        onClick={onOpen}
                        className="text-primary text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all"
                    >
                        View Full Summary <FaChevronRight size={10} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const EmptyState = ({ message }) => (
    <div className="py-20 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-none flex items-center justify-center mb-4">
            <FaHistory className="text-gray-200 text-3xl" />
        </div>
        <p className="text-gray-400 font-medium max-w-xs">{message}</p>
    </div>
);

const VisitSummaryModal = ({ visit, onClose, linkedData }) => {
    const visitDate = visit.visitDate || visit.recordedAt || visit.createdAt;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">{visit.visitType} Summary</h2>
                        <p className="text-sm text-gray-500 font-medium">Recorded on {new Date(visitDate).toLocaleDateString()} at {visit.facilityId || 'General Healthcare'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <FaTimes className="text-gray-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {/* Clinical Notes (SOAP) */}
                    <section>
                        <div className="flex items-center gap-2 mb-4 text-primary">
                            <FaNotesMedical size={18} />
                            <h3 className="text-sm font-black uppercase tracking-wider text-gray-900">Consultation Notes</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Chief Complaint</h4>
                                <p className="text-sm text-slate-700 font-medium italic">"{visit.chiefComplaint}"</p>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Outcome</h4>
                                <p className="text-sm text-slate-900 font-bold">{visit.outcome}</p>
                            </div>
                            <div className="md:col-span-2">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Diagnostic Assessment</h4>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {(visit.diagnosis || []).map((d, i) => (
                                        <div key={i} className="bg-white border border-slate-200 px-3 py-2 rounded-xl text-sm">
                                            <span className="font-bold text-slate-900">{d.description}</span>
                                            {d.code && <span className="text-primary text-xs ml-2 font-mono bg-primary/5 px-1.5 py-0.5 rounded">[{d.code}]</span>}
                                            <span className="block text-[10px] text-slate-400 uppercase font-bold mt-1">{d.type}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Detailed Plan</h4>
                                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{visit.treatmentPlan}</p>
                            </div>
                        </div>
                    </section>

                    {/* Rx & Labs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <section>
                            <div className="flex items-center gap-2 mb-4 text-emerald-600">
                                <FaPills size={18} />
                                <h3 className="text-sm font-black uppercase tracking-wider text-gray-900">Prescriptions</h3>
                            </div>
                            {linkedData.prescriptions.length === 0 ? (
                                <p className="text-sm text-gray-400 italic">No electronic prescriptions linked to this visit.</p>
                            ) : (
                                <div className="space-y-3">
                                    {linkedData.prescriptions.map(rx => (
                                        <div key={rx._id} className="p-4 border border-emerald-100 bg-emerald-50/30 rounded-2xl">
                                            {rx.medications.map((med, i) => (
                                                <div key={i} className="text-sm mb-2 last:mb-0">
                                                    <p className="font-bold text-emerald-900">{med.name} <span className="text-xs font-medium text-emerald-600">({med.dosage})</span></p>
                                                    <p className="text-xs text-emerald-700 opacity-70">{med.frequency} for {med.duration}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section>
                            <div className="flex items-center gap-2 mb-4 text-blue-600">
                                <FaFlask size={18} />
                                <h3 className="text-sm font-black uppercase tracking-wider text-gray-900">Lab Orders</h3>
                            </div>
                            {linkedData.labs.length === 0 ? (
                                <p className="text-sm text-gray-400 italic">No lab orders issued during this visit.</p>
                            ) : (
                                <div className="space-y-3">
                                    {linkedData.labs.map(lab => (
                                        <div key={lab._id} className="p-4 border border-emerald-100 bg-emerald-50/30 rounded-2xl flex justify-between items-center">
                                            <div>
                                                <p className="text-sm font-bold text-emerald-900">{lab.testName}</p>
                                                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">{lab.testCategory}</p>
                                            </div>
                                            <span className="text-[10px] font-black bg-white px-2 py-1 rounded-lg border border-emerald-100">{lab.status}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Referrals & Vaccines */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <section>
                            <div className="flex items-center gap-2 mb-4 text-purple-600">
                                <FaExternalLinkAlt size={16} />
                                <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Referrals</h3>
                            </div>
                            {linkedData.referrals.length === 0 ? (
                                <p className="text-sm text-gray-400 italic">No referrals made.</p>
                            ) : (
                                <div className="space-y-3">
                                    {linkedData.referrals.map(refer => (
                                        <div key={refer._id} className="p-4 border border-purple-100 bg-purple-50/30 rounded-2xl">
                                            <p className="text-[10px] font-black text-purple-400 uppercase tracking-wider mb-1">Referred To</p>
                                            <p className="text-sm font-bold text-purple-900">{refer.toHospital}</p>
                                            <p className="text-xs text-purple-700 mt-2 font-medium">{refer.reason}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section>
                            <div className="flex items-center gap-2 mb-4 text-orange-600">
                                <FaSyringe size={18} />
                                <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Vaccines</h3>
                            </div>
                            {linkedData.immunizations.length === 0 ? (
                                <p className="text-sm text-gray-400 italic">No vaccinations recorded.</p>
                            ) : (
                                <div className="space-y-3">
                                    {linkedData.immunizations.map(immu => (
                                        <div key={immu._id} className="p-4 border border-orange-100 bg-orange-50/30 rounded-2xl flex justify-between items-center">
                                            <div>
                                                <p className="text-sm font-bold text-orange-900">{immu.vaccineName}</p>
                                                <p className="text-xs text-orange-600">Dose {immu.doseNumber}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-orange-400 uppercase tracking-wider font-bold">Administered</p>
                                                <p className="text-xs font-bold text-orange-900">{new Date(immu.dateAdministered).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button
                        onClick={() => window.print()}
                        className="px-6 py-2 bg-[#006838] text-white rounded-xl font-bold flex items-center gap-2 hover:bg-[#88C250] transition-all shadow-lg shadow-emerald-900/10"
                    >
                        <FaDownload /> Download Report
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default PatientHistory;
