import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import SEO from '../components/SEO';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFlask, FaDownload, FaMicroscope, FaInfoCircle, FaFileDownload, FaClock, FaCheckCircle, FaExclamationCircle, FaUserMd, FaMapMarkerAlt, FaPhoneAlt, FaCalendarAlt } from 'react-icons/fa';
import { LoadingComponents } from '../components/LoadingComponents';
import EmptyState from '../components/EmptyState';

const LabResults = () => {
    const { token, backendUrl, userData } = useContext(AppContext);
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState([]);

    useEffect(() => {
        if (token && userData?._id) {
            fetchResults();
        }
    }, [token, userData?._id]);

    const fetchResults = async () => {
        try {
            setLoading(true);
            const { data } = await axios.post(`${backendUrl}/api/clinical/patient-labs`, { userId: userData._id }, { headers: { token } });
            if (data.success) {
                setResults(data.orders.filter(order => order.notifiedPatient || order.status === 'COMPLETED'));
            }
        } catch (error) {
            console.error("Lab results fetch error:", error);
            toast.error("Failed to load lab results");
        } finally {
            setLoading(false);
        }
    };

  return (
    <div className="min-h-screen bg-white pb-24">
      <SEO title="Diagnostic Reports - E-ivuze" description="View and download your laboratory test results." />

      {/* Official Header */}
      <div className="bg-[#006838] relative overflow-hidden pt-20 pb-40 px-6">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#88C250]/10 skew-x-12 transform translate-x-20"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-8"
          >
            <div className="max-w-2xl">
              <p className="text-[#88C250] font-semibold text-xs tracking-wider mb-3 px-1">Clinical Diagnostics</p>
              <h1 className="text-4xl md:text-5xl font-bold text-white font-merriweather leading-tight">
                Lab Results
              </h1>
              <p className="text-white/70 mt-4 text-sm md:text-base font-medium flex items-center gap-3 max-w-lg">
                Official registry of certified laboratory findings and clinical reports.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="bg-white/5 backdrop-blur-xl px-10 py-6 border-2 border-white/10">
                <p className="text-[10px] font-semibold text-[#88C250] leading-none tracking-widest mb-2">Verified Findings</p>
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-bold text-white leading-none">{results.length}</span>
                  <FaFlask className="text-[#88C250] text-xl mb-1" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-6xl mx-auto px-6 -mt-24 relative z-20">
        {loading ? (
          <div className="bg-white p-24 border-2 border-gray-100">
            <LoadingComponents.MedicalLoader text="Decrypting Diagnostic Data..." />
          </div>
        ) : results.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-24 border-2 border-gray-100 text-center">
            <EmptyState variant="data" title="Registry Empty" message="No clinical laboratory results have been finalized or shared with your profile yet." />
          </motion.div>
        ) : (
          <div className="grid gap-10">
            {results.map((report, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={report._id}
                className="flex flex-col lg:grid lg:grid-cols-[200px_1fr_260px] border-2 border-gray-100 bg-white hover:border-[#88C250]/50 transition-all"
              >
                {/* Date Section */}
                <div className="bg-[#006838] p-10 flex lg:flex-col items-center justify-center gap-4 text-center border-r-2 border-[#006838]/10">
                  <div className="w-20 h-20 bg-white/10 flex flex-col items-center justify-center border-b-4 border-[#88C250]">
                    <span className="text-[10px] font-semibold text-white/60 leading-none mb-1">{new Date(report.orderedAt).toLocaleString('default', { month: 'short' })}</span>
                    <span className="text-3xl font-bold text-white font-merriweather">{new Date(report.orderedAt).getDate()}</span>
                  </div>
                  <div className="text-left lg:text-center mt-2">
                    <p className="text-[9px] font-semibold text-[#88C250] tracking-widest leading-none mb-1">Record Id</p>
                    <p className="text-xs font-mono font-bold text-white tracking-tight">LAB-{report._id.slice(-8).toUpperCase()}</p>
                  </div>
                </div>

                {/* Report Details */}
                <div className="p-10 lg:p-12 flex flex-col justify-between overflow-hidden relative">
                  <div className="relative z-10">
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                      <span className="bg-[#006838]/5 text-[#006838] text-[10px] font-semibold px-4 py-1.5 tracking-wider border-2 border-[#006838]/10">
                        Official Diagnostics
                      </span>
                      {report.status === 'COMPLETED' ? (
                        <span className="bg-[#88C250]/10 text-[#006838] text-[10px] font-semibold px-4 py-1.5 tracking-wider border-2 border-[#88C250]/20 flex items-center gap-2">
                          <FaCheckCircle className="text-[10px]" /> Finalized
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-600 text-[10px] font-semibold px-4 py-1.5 tracking-wider border-2 border-amber-100 flex items-center gap-2 animate-pulse">
                          <FaClock className="text-[10px]" /> Processing
                        </span>
                      )}
                    </div>

                    <h2 className="text-3xl font-bold text-[#006838] font-merriweather leading-tight mb-2 group-hover:text-[#88C250] transition-colors duration-300">
                      {report.testName}
                    </h2>
                    <p className="text-xs font-semibold text-[#006838]/40 tracking-widest flex items-center gap-2">
                      <FaFlask className="text-[#88C250]" /> {report.testCategory}
                    </p>

                    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gray-50 border-2 border-gray-100 flex items-center justify-center text-[#006838] flex-shrink-0">
                          <FaUserMd size={20} />
                        </div>
                        <div>
                          <p className="text-[9px] font-semibold text-[#006838]/40 tracking-widest leading-none mb-1">Lead Physician</p>
                          <p className="text-sm font-bold text-[#006838] font-merriweather">Dr. {report.docId?.name || 'Medical Provider'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gray-50 border-2 border-gray-100 flex items-center justify-center text-[#006838] flex-shrink-0">
                          <FaMicroscope size={20} />
                        </div>
                        <div>
                          <p className="text-[9px] font-semibold text-[#006838]/40 tracking-widest leading-none mb-1">Network Facility</p>
                          <p className="text-sm font-bold text-[#006838] font-merriweather">{report.labId?.name || 'Official Center'}</p>
                        </div>
                      </div>
                    </div>

                    {report.result && (
                      <div className="mt-10 p-8 bg-gray-50 border-l-4 border-[#88C250] relative overflow-hidden group-hover:bg-white transition-all duration-500">
                        <p className="text-[10px] font-semibold text-[#006838] tracking-widest mb-3 flex items-center gap-2">
                          <FaInfoCircle /> Diagnostic Assessment
                        </p>
                        <p className="text-sm text-[#006838] font-semibold leading-relaxed italic">
                          "{report.result}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-10 lg:p-12 bg-gray-50 border-t lg:border-t-0 lg:border-l-2 border-gray-100 flex flex-col justify-center gap-4 min-w-[280px]">
                  <div className="mb-6">
                    <p className="text-[9px] font-semibold text-[#006838]/40 tracking-widest leading-none mb-2">Location Logistics</p>
                    <p className="text-xs font-bold text-[#006838] leading-tight">
                      {report.labId?.address?.city || 'Main Hub'} • {report.labId?.address?.line1 || 'Facility Primary'}
                    </p>
                  </div>

                  {report.resultFileUrl ? (
                    <div className="space-y-3">
                      <a
                        href={report.resultFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-[#006838] text-white px-8 py-5 font-semibold text-xs tracking-wider flex items-center justify-center gap-3 hover:bg-[#88C250] hover:text-[#006838] transition-all"
                      >
                        <FaDownload /> View Record
                      </a>
                      <a
                        href={report.resultFileUrl}
                        download
                        className="w-full bg-white text-[#006838] border-2 border-[#006838] px-8 py-4 font-semibold text-xs tracking-wider flex items-center justify-center gap-3 hover:bg-[#006838] hover:text-white transition-all"
                      >
                        Vault Download
                      </a>
                    </div>
                  ) : (
                    <div className="p-10 border-2 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center text-center">
                      <FaClock className="text-amber-400 mb-3 animate-spin" />
                      <p className="text-[9px] font-semibold text-[#006838]/40 tracking-widest">Processing PDF Artifact</p>
                    </div>
                  )}

                  <div className="mt-6 pt-6 border-t-2 border-gray-100 flex items-center justify-between text-[9px] font-semibold text-[#006838]/20 tracking-widest">
                    <span>Secure Batch {report._id.slice(0, 4).toUpperCase()}</span>
                    <span className="flex items-center gap-1"><FaCheckCircle className="text-[8px] middle" /> Encrypted</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LabResults;
