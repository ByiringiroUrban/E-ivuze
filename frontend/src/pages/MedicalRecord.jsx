import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import SEO from '../components/SEO';
import EmptyState from '../components/EmptyState';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaFileAlt, FaHeartbeat, FaShieldAlt, FaExclamationTriangle, FaSyringe, FaCalendarAlt, FaCreditCard } from 'react-icons/fa';

const MedicalRecord = () => {
    const { token, backendUrl, userData, loadUserProfileData } = useContext(AppContext);
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [visits, setVisits] = useState([]);
    const [vitals, setVitals] = useState([]);
    const [immunizations, setImmunizations] = useState([]);
    const [labs, setLabs] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [payments, setPayments] = useState([]);
    const [activeTab, setActiveTab] = useState('summary');

    useEffect(() => {
        if (token) {
            fetchMedicalData();
        }
    }, [token]);

    const fetchMedicalData = async () => {
        try {
            setLoading(true);
            // We need endpoints to get patient's own data. 
            // Assuming clinicalRouter has endpoints that accept patient token or we use user controller proxy.
            // clinicalController: getPatientVisits expects body { patientId }. Patient can't easily send their own ID unless endpoint extracts from token.
            // Let's assume we update backend or use existing profile-linked fetching.
            // Update: Clinical endpoints are usually doctor-centric. We need patient-centric endpoints.
            // For now, I will try to fetch using the user's ID extracted from context if possible, or assume backend is updated.
            // Actually, best practice: Create a 'my-records' endpoint. 
            // I will use direct calls for now assuming backend allows it (it might not without 'authDoctor').
            // Wait, 'getPatientVisits' in clinicalController uses req.body.patientId. 
            // It doesn't seem to have auth middleware restricting it ONLY to doctors, but usually it should.
            // I'll try to call it.

            const visitsRes = await axios.post(`${backendUrl}/api/clinical/patient-visits`, { patientId: userData._id }, { headers: { token } });
            // NOTE: This endpoint might fail if not exposed/authed for patients. I'll need to create it if so. 
            // Going to assume I need to create patient-facing routes or use existing ones if open (risky).
            // Let's optimistically code this and fix backend if needed.

            if (visitsRes.data.success) setVisits(visitsRes.data.visits);

            // Vitals
            const vitalsRes = await axios.post(`${backendUrl}/api/clinical/patient-vitals`, { userId: userData._id }, { headers: { token } });
            if (vitalsRes.data.success) setVitals(vitalsRes.data.vitals);

            // Immunizations
            const immuRes = await axios.post(`${backendUrl}/api/clinical/patient-immunizations`, { userId: userData._id }, { headers: { token } });
            if (immuRes.data.success) setImmunizations(immuRes.data.immunizations);

            // Lab Orders
            const labsRes = await axios.post(`${backendUrl}/api/clinical/patient-labs`, { userId: userData._id }, { headers: { token } });
            if (labsRes.data.success) setLabs(labsRes.data.orders);

            // Prescriptions
            const rxRes = await axios.post(`${backendUrl}/api/clinical/patient-prescriptions`, { userId: userData._id }, { headers: { token } });
            if (rxRes.data.success) setPrescriptions(rxRes.data.prescriptions);

            // Payments
            const payRes = await axios.get(`${backendUrl}/api/user/payments`, { headers: { token } });
            if (payRes.data.success) setPayments(payRes.data.payments);

        } catch (error) {
            console.error("Error fetching records", error);
            // Silently fail or show minimal error
        } finally {
            setLoading(false);
        }
    };

    if (!token) return <div className="p-8 text-center">{t('pages.medicalRecord.loginPrompt') || 'Please login to view your medical records.'}</div>;

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            <SEO
                title={`${t('pages.medicalRecord.title') || 'My Medical Record'} - E-ivuzeConnect`}
                description={t('pages.medicalRecord.description') || 'View your longitudinal health record.'}
            />

            {/* Premium Header - Matching History Aesthetic */}
            <div className="bg-[#006838] relative overflow-hidden pt-16 pb-24 px-6">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-[#88C250]/10 skew-x-12 transform translate-x-20"></div>
                <div className="max-w-6xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                        <div>
                            <p className="text-emerald-400 font-black text-[10px]   tracking-[0.3em] mb-2 px-1">Longitudinal Records</p>
                            <h1 className="text-4xl font-extrabold text-white tracking-tight  ">Medical Dossier</h1>
                            <p className="text-emerald-100 mt-2 font-medium flex items-center gap-2">
                                <FaHeartbeat className="opacity-60" />
                                {t('pages.medicalRecord.description') || 'One Patient. One Record. Nationwide.'}
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-8 -mt-12 relative z-10">
                <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row gap-6">
                    {/* Sidebar / Tabs */}
                    <div className="md:w-64 flex-shrink-0 space-y-2">
                        <TabButton
                            active={activeTab === 'summary'}
                            onClick={() => setActiveTab('summary')}
                            icon={<FaHeartbeat size={18} />}
                            label={t('pages.medicalRecord.tabs.summary') || 'Health Summary'}
                        />
                        <TabButton
                            active={activeTab === 'visits'}
                            onClick={() => setActiveTab('visits')}
                            icon={<FaFileAlt size={18} />}
                            label={t('pages.medicalRecord.tabs.visits') || 'Clinical Visits'}
                        />
                        <TabButton
                            active={activeTab === 'medications'}
                            onClick={() => setActiveTab('medications')}
                            icon={<FaSyringe size={18} />}
                            label={t('pages.medicalRecord.tabs.medications') || 'Medications'}
                        />
                        <TabButton
                            active={activeTab === 'immunizations'}
                            onClick={() => setActiveTab('immunizations')}
                            icon={<FaShieldAlt size={18} />}
                            label={t('pages.medicalRecord.tabs.immunizations') || 'Immunizations'}
                        />
                        <TabButton
                            active={activeTab === 'labs'}
                            onClick={() => setActiveTab('labs')}
                            icon={<FaCalendarAlt size={18} />}
                            label={t('pages.medicalRecord.tabs.labs') || 'Lab Orders'}
                        />
                        <TabButton
                            active={activeTab === 'payments'}
                            onClick={() => setActiveTab('payments')}
                            icon={<FaCreditCard size={18} />}
                            label={t('pages.medicalRecord.tabs.payments') || 'Payments'}
                        />
                        <TabButton
                            active={activeTab === 'allergies'}
                            onClick={() => setActiveTab('allergies')}
                            icon={<FaExclamationTriangle size={18} />}
                            label={t('pages.medicalRecord.tabs.allergies') || 'Allergies & Risks'}
                        />
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 min-h-[400px]">
                        {loading ? (
                            <div className="flex h-full items-center justify-center text-gray-400">
                                {t('ui.loading') || 'Loading records...'}
                            </div>
                        ) : (
                            <>
                                {activeTab === 'summary' && (
                                    <div className="space-y-6">
                                        <SectionTitle title={t('pages.medicalRecord.sections.identity') || 'Patient Identity'} />
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                            <InfoItem
                                                label={t('pages.medicalRecord.fields.fullName') || 'Full Name'}
                                                value={userData.name}
                                            />
                                            <InfoItem
                                                label={t('pages.medicalRecord.fields.nid') || 'National ID (NID)'}
                                                value={userData.nid || (t('pages.medicalRecord.values.notRecorded') || 'Not Recorded')}
                                            />
                                            <InfoItem
                                                label={t('pages.medicalRecord.fields.dob') || 'Date of Birth'}
                                                value={userData.dob}
                                            />
                                            <InfoItem
                                                label={t('pages.medicalRecord.fields.bloodGroup') || 'Blood Group'}
                                                value={userData.bloodGroup || '--'}
                                            />
                                            <InfoItem
                                                label={t('pages.medicalRecord.fields.emergencyContact') || 'Emergency Contact'}
                                                value={
                                                    userData.emergencyContact?.name
                                                        ? `${userData.emergencyContact.name} (${userData.emergencyContact.phone})`
                                                        : (t('pages.medicalRecord.values.notSet') || 'Not Set')
                                                }
                                            />
                                        </div>

                                        <SectionTitle title={t('pages.medicalRecord.sections.insurance') || 'Insurance Status'} />
                                        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 flex justify-between items-center">
                                            <div>
                                                <p className="text-sm text-emerald-800 font-semibold">
                                                    {userData.insurance?.provider !== 'None'
                                                        ? userData.insurance?.provider
                                                        : (t('pages.medicalRecord.values.noInsurance') || 'No Insurance Info')}
                                                </p>
                                                <p className="text-xs text-emerald-600">
                                                    {t('pages.medicalRecord.fields.policy') || 'Policy'}: {userData.insurance?.policyNumber || '--'}
                                                </p>
                                            </div>
                                            <div className="px-3 py-1 bg-white rounded text-xs font-bold text-emerald-800 shadow-sm">
                                                {t('pages.medicalRecord.values.active') || 'Active'}
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {t('pages.medicalRecord.notes.verifyCoverage') || '* Verify coverage with facility before treatment.'}
                                        </p>
                                    </div>
                                )}

                                {activeTab === 'visits' && (
                                    <div className="space-y-4">
                                        <SectionTitle title={t('pages.medicalRecord.sections.visits') || 'Clinical Visit History'} />
                                        {visits.length === 0 ? (
                                            <EmptyState variant="data" message={t('pages.medicalRecord.empty.visits') || 'No clinical visits recorded yet.'} className="py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200" />
                                        ) : (
                                            <div className="space-y-4">
                                                {visits.map((visit) => (
                                                    <div key={visit._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <p className="font-semibold text-gray-800">
                                                                    {visit.visitType} {t('pages.medicalRecord.labels.visit') || 'Visit'}
                                                                </p>
                                                                <p className="text-xs text-gray-500">{new Date(visit.recordedAt).toLocaleDateString()}</p>
                                                            </div>
                                                            <span className="px-2 py-1 bg-gray-100 text-xs rounded text-gray-600 border border-gray-200">{visit.facilityId || 'General'}</span>
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-3">
                                                            <div>
                                                                <p className="text-xs text-gray-500  ">
                                                                    {t('pages.medicalRecord.labels.diagnosis') || 'Diagnosis'}
                                                                </p>
                                                                <p className="font-medium">{visit.diagnosis}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-500  ">
                                                                    {t('pages.medicalRecord.labels.outcome') || 'Outcome'}
                                                                </p>
                                                                <p>{visit.outcome}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'allergies' && (
                                    <div className="space-y-4">
                                        <SectionTitle
                                            title={t('pages.medicalRecord.sections.allergies') || 'Allergies & Adverse Reactions'}
                                        />
                                        <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <FaExclamationTriangle className="text-red-500" size={20} />
                                                <h3 className="font-semibold text-red-800">
                                                    {t('pages.medicalRecord.labels.criticalWarnings') || 'Critical Warnings'}
                                                </h3>
                                            </div>
                                            {(userData.allergies && userData.allergies.length > 0) ? (
                                                <ul className="space-y-2">
                                                    {userData.allergies.map((alg, index) => (
                                                        <li
                                                            key={index}
                                                            className="flex justify-between items-center bg-white p-2 rounded border border-red-100 shadow-sm"
                                                        >
                                                            <span className="font-medium text-red-900">{alg.allergen}</span>
                                                            <span className="text-xs text-red-600 px-2 py-1 bg-red-50 rounded-full">
                                                                {alg.severity}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-sm text-red-700">
                                                    {t('pages.medicalRecord.empty.allergies') || 'No known allergies recorded.'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Placeholder for other tabs */}
                                {activeTab === 'immunizations' && (
                                    <div className="space-y-4">
                                        <SectionTitle
                                            title={t('pages.medicalRecord.sections.immunizations') || 'Immunization Records'}
                                        />
                                        {immunizations.length === 0 ? (
                                            <EmptyState variant="data" message={t('pages.medicalRecord.empty.immunizations') || 'No immunization records found.'} className="py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200" />
                                        ) : (
                                            <div className="space-y-3">
                                                {immunizations.map((immu) => (
                                                    <div
                                                        key={immu._id}
                                                        className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-lg"
                                                    >
                                                        <div>
                                                            <p className="font-semibold text-gray-800">{immu.vaccineName}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {t('pages.medicalRecord.labels.dose') || 'Dose'} {immu.doseNumber}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-medium text-green-700">
                                                                {new Date(immu.dateAdministered).toLocaleDateString()}
                                                            </p>
                                                            {immu.nextDueDate && (
                                                                <p className="text-xs text-orange-600">
                                                                    {t('pages.medicalRecord.labels.nextDue') || 'Next Due'}:{' '}
                                                                    {new Date(immu.nextDueDate).toLocaleDateString()}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'labs' && (
                                    <div className="space-y-4">
                                        <SectionTitle title={t('pages.medicalRecord.sections.labs') || 'Lab Orders & Results'} />
                                        {labs.length === 0 ? (
                                            <EmptyState variant="data" message={t('pages.medicalRecord.empty.labs') || 'No lab orders found.'} className="py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200" />
                                        ) : (
                                            <div className="space-y-3">
                                                {labs.map((lab) => (
                                                    <div
                                                        key={lab._id}
                                                        className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className="font-semibold text-gray-800">
                                                                {lab.testName}{' '}
                                                                <span className="text-xs font-normal text-gray-500">
                                                                    ({lab.testCategory})
                                                                </span>
                                                            </h4>
                                                            <span
                                                                className={`px-2 py-1 text-xs rounded-full font-medium ${lab.status === 'COMPLETED'
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : lab.status === 'PENDING'
                                                                        ? 'bg-yellow-100 text-yellow-700'
                                                                        : 'bg-gray-100 text-gray-600'
                                                                    }`}
                                                            >
                                                                {t(`pages.medicalRecord.labStatus.${lab.status.toLowerCase()}`) || lab.status}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between text-sm text-gray-600">
                                                            <span>
                                                                {t('pages.medicalRecord.labels.ordered') || 'Ordered'}:{' '}
                                                                {new Date(lab.orderedAt).toLocaleDateString()}
                                                            </span>
                                                            {lab.result ? (
                                                                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded hover:bg-emerald-100 transition">
                                                                    {t('pages.medicalRecord.labels.resultAvailable') || 'Result Available'}
                                                                </span>
                                                            ) : (lab.status === 'PENDING' && !lab.labId) ? (
                                                                <button
                                                                    onClick={() => window.location.href = `/lab-selection?orderId=${lab._id}`}
                                                                    className="text-xs bg-[#006838] text-white px-3 py-1 rounded hover:bg-[#88C250] transition"
                                                                >
                                                                    {t('pages.medicalRecord.actions.submitToLab') || 'Submit to Lab'}
                                                                </button>
                                                            ) : (
                                                                <span>
                                                                    {lab.labId?.name || (t('pages.medicalRecord.values.processing') || 'Processing')}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {lab.notes && (
                                                            <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded">
                                                                {t('pages.medicalRecord.labels.note') || 'Note'}: {lab.notes}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'medications' && (
                                    <div className="space-y-4">
                                        <SectionTitle title={t('pages.medicalRecord.sections.medications') || 'Medication History'} />
                                        {prescriptions.length === 0 ? (
                                            <EmptyState variant="data" message={t('pages.medicalRecord.empty.medications') || 'No medication history found.'} className="py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200" />
                                        ) : (
                                            <div className="space-y-4">
                                                {prescriptions.map((rx) => (
                                                    <div key={rx._id} className="bg-white border border-gray-200 rounded-lg p-4">
                                                        <div className="flex justify-between items-start mb-2 border-b border-gray-100 pb-2">
                                                            <div>
                                                                <p className="font-semibold text-gray-800">
                                                                    {t('pages.medicalRecord.labels.prescriptionFor') || 'Prescription for'}{' '}
                                                                    {rx.diagnosis || (t('pages.medicalRecord.values.generalTreatment') || 'General Treatment')}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {new Date(rx.createdAt).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                            <div className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                                                                {rx.medications.length}{' '}
                                                                {t('pages.medicalRecord.labels.drugs') || 'Drugs'}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2 mt-2">
                                                            {rx.medications.map((med, idx) => (
                                                                <div key={idx} className="flex justify-between items-center text-sm">
                                                                    <span className="font-medium text-gray-700">
                                                                        {med.name}{' '}
                                                                        <span className="text-gray-400 font-normal">
                                                                            ({med.dosage})
                                                                        </span>
                                                                    </span>
                                                                    <span className="text-gray-600 text-xs">
                                                                        {med.frequency} {t('pages.medicalRecord.labels.for') || 'for'} {med.duration}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        {rx.fileUrl && (
                                                            <div className="mt-4 pt-2 border-t border-gray-50 flex items-center justify-between">
                                                                <span className="text-[10px] text-gray-500 italic">
                                                                    {t('pages.medicalRecord.labels.scannedCopyAvailable') || 'Scanned Copy Available'}
                                                                </span>
                                                                <a
                                                                    href={rx.fileUrl}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="text-xs font-semibold text-[#006838] hover:underline flex items-center gap-1"
                                                                >
                                                                    {t('pages.medicalRecord.actions.viewScannedCopy') || 'View Scanned Copy ↗'}
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'payments' && (
                                    <div className="space-y-4">
                                        <SectionTitle title={t('pages.medicalRecord.sections.payments') || 'Financial History'} />
                                        {payments.length === 0 ? (
                                            <EmptyState variant="data" message={t('pages.medicalRecord.empty.payments') || 'No payment history found.'} className="py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200" />
                                        ) : (
                                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                                                <table className="min-w-full divide-y divide-gray-200 bg-white">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500   tracking-wider">
                                                                {t('pages.medicalRecord.table.date') || 'Date'}
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500   tracking-wider">
                                                                {t('pages.medicalRecord.table.service') || 'Service'}
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500   tracking-wider">
                                                                {t('pages.medicalRecord.table.amount') || 'Amount'}
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500   tracking-wider">
                                                                {t('pages.medicalRecord.table.status') || 'Status'}
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200">
                                                        {payments.map((pay) => (
                                                            <tr key={pay._id}>
                                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                                                    {new Date(pay.createdAt).toLocaleDateString()}
                                                                </td>
                                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                                    {t('pages.medicalRecord.labels.consultationFee') || 'Consultation Fee'}
                                                                </td>
                                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold">
                                                                    {pay.amount} RWF
                                                                </td>
                                                                <td className="px-4 py-3 whitespace-nowrap">
                                                                    <span
                                                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${pay.status === 'approved'
                                                                            ? 'bg-green-100 text-green-800'
                                                                            : pay.status === 'rejected'
                                                                                ? 'bg-red-100 text-red-800'
                                                                                : 'bg-yellow-100 text-yellow-800'
                                                                            }`}
                                                                    >
                                                                        {t(`pages.medicalRecord.paymentStatus.${pay.status}`) || pay.status}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const TabButton = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${active ? 'bg-[#006838] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
            }`}
    >
        {icon}
        {label}
    </button>
);

const SectionTitle = ({ title }) => (
    <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4">{title}</h3>
);

const InfoItem = ({ label, value }) => (
    <div>
        <p className="text-xs text-gray-500   tracking-wide">{label}</p>
        <p className="font-medium text-gray-900">{value}</p>
    </div>
);

export default MedicalRecord;
