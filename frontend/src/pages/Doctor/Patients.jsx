import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { DoctorContext } from '../../context/DoctorContext';
import { AppContext } from '../../context/AppContext';
import { useTranslation } from 'react-i18next';
import DoctorSkeletonLoaders from '../../components/DoctorSkeletonLoaders';
import EmptyState from '../../components/EmptyState';
import { FaPhone, FaDna, FaShieldAlt, FaExclamationTriangle, FaAddressCard, FaBriefcase, FaUserFriends, FaFlask, FaExchangeAlt, FaSyringe, FaFileMedical, FaHistory } from 'react-icons/fa';

const Patients = () => {
  const { backendUrl, dToken } = useContext(DoctorContext);
  const { calculateAge, currency } = useContext(AppContext);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedPatient, setExpandedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (dToken) {
      fetchPatients();
    }
  }, [dToken]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        backendUrl + '/api/doctor/patients',
        { headers: { dToken } }
      );

      if (data.success) {
        setPatients(data.patients);
      } else {
        toast.error(data.message || 'Failed to fetch patients');
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.includes(searchTerm) ||
    patient.nid?.includes(searchTerm)
  );

  if (loading && patients.length === 0) {
    return <DoctorSkeletonLoaders.PatientsSkeleton />;
  }

  const togglePatientDetails = (patientId) => {
    setExpandedPatient(expandedPatient === patientId ? null : patientId);
  };

  const downloadCSV = (patient) => {
    // Helper to escape CSV fields
    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '';
      const stringValue = String(str);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    let csvContent = "";

    // Header Section - Patient Details
    csvContent += "PATIENT REPORT\n\n";
    csvContent += "Profile Information\n";
    csvContent += "Name,Email,Phone,DOB,Gender,Address\n";
    const address = `${patient.address?.line1 || ''} ${patient.address?.line2 || ''}`.trim();
    csvContent += `${escapeCsv(patient.name)},${escapeCsv(patient.email)},${escapeCsv(patient.phone)},${escapeCsv(patient.dob)},${escapeCsv(patient.gender)},${escapeCsv(address)}\n\n`;

    // Appointments Summary
    csvContent += "Appointment Summary\n";
    csvContent += "Total Appointments,Last Visit Date,Last Visit Status\n";
    const lastVisit = patient.lastAppointment
      ? new Date(patient.lastAppointment.date).toLocaleDateString()
      : 'N/A';
    const lastStatus = patient.lastAppointment?.status || 'N/A';
    csvContent += `${patient.appointmentCount || 0},${lastVisit},${lastStatus}\n\n`;

    // Medical Records
    csvContent += "MEDICAL RECORDS\n";
    csvContent += "Date,Title,Description,Type,Attachments Count\n";
    if (patient.records && patient.records.length > 0) {
      patient.records.forEach(record => {
        const date = new Date(record.createdAt).toLocaleDateString();
        const attachments = record.attachments ? record.attachments.length : 0;
        csvContent += `${escapeCsv(date)},${escapeCsv(record.title)},${escapeCsv(record.description)},${escapeCsv(record.recordType)},${attachments}\n`;
      });
    } else {
      csvContent += "No records found\n";
    }
    csvContent += "\n";

    // Prescriptions
    csvContent += "PRESCRIPTIONS\n";
    csvContent += "Date,Diagnosis,Medications,Notes,Follow Up Date\n";
    if (patient.prescriptions && patient.prescriptions.length > 0) {
      patient.prescriptions.forEach(presc => {
        const date = new Date(presc.createdAt).toLocaleDateString();
        const meds = presc.medications
          ? presc.medications.map(m => `${m.name} (${m.dosage}, ${m.frequency}, ${m.duration})${m.instructions ? ` [${m.instructions}]` : ''}`).join('; ')
          : '';
        const notes = presc.notes || '';
        const followUp = presc.followUpDate ? new Date(presc.followUpDate).toLocaleDateString() : 'N/A';
        csvContent += `${escapeCsv(date)},${escapeCsv(presc.diagnosis)},${escapeCsv(meds)},${escapeCsv(notes)},${followUp}\n`;
      });
    } else {
      csvContent += "No prescriptions found\n";
    }

    // Trigger Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Patient_${patient.name.replace(/\s+/g, '_')}_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllPatientsCSV = () => {
    if (!patients || patients.length === 0) {
      toast.error('No patients to export');
      return;
    }

    // Helper to escape CSV fields
    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '';
      const stringValue = String(str);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    let csvContent = "Patient Name,Email,Phone,DOB,Gender,Address,Item Type,Date,Title/Diagnosis,Details/Medications,Category/Notes,Attachments/FollowUp\n";

    patients.forEach(patient => {
      const address = `${patient.address?.line1 || ''} ${patient.address?.line2 || ''}`.trim();
      const patientInfo = `${escapeCsv(patient.name)},${escapeCsv(patient.email)},${escapeCsv(patient.phone)},${escapeCsv(patient.dob)},${escapeCsv(patient.gender)},${escapeCsv(address)}`;

      // Last Appointment (General Info)
      const lastVisit = patient.lastAppointment
        ? new Date(patient.lastAppointment.date).toLocaleDateString()
        : 'N/A';
      const lastStatus = patient.lastAppointment?.status || 'N/A';
      csvContent += `${patientInfo},Last Appointment,${lastVisit},${escapeCsv(lastStatus)},-,-,-\n`;

      // Medical Records
      if (patient.records && patient.records.length > 0) {
        patient.records.forEach(record => {
          const date = new Date(record.createdAt).toLocaleDateString();
          const attachments = record.attachments ? record.attachments.length : 0;
          csvContent += `${patientInfo},Medical Record,${escapeCsv(date)},${escapeCsv(record.title)},${escapeCsv(record.description)},${escapeCsv(record.recordType)},${attachments}\n`;
        });
      }

      // Prescriptions
      if (patient.prescriptions && patient.prescriptions.length > 0) {
        patient.prescriptions.forEach(presc => {
          const date = new Date(presc.createdAt).toLocaleDateString();
          const meds = presc.medications
            ? presc.medications.map(m => `${m.name} (${m.dosage}, ${m.frequency}, ${m.duration})${m.instructions ? ` [${m.instructions}]` : ''}`).join('; ')
            : '';
          const notes = presc.notes || '';
          const followUp = presc.followUpDate ? new Date(presc.followUpDate).toLocaleDateString() : 'N/A';
          csvContent += `${patientInfo},Prescription,${escapeCsv(date)},${escapeCsv(presc.diagnosis)},${escapeCsv(meds)},${escapeCsv(notes)},${followUp}\n`;
        });
      }
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `All_Patients_Data_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen p-3 sm:p-4 lg:p-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">{t('doctor.patientsPage.title')}</h2>
          <p className="text-sm text-gray-500 mt-1">Manage and view clinical records for your booked patients</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006838]/20 focus:border-[#006838] transition-all text-sm"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {patients && patients.length > 0 && (
            <button
              onClick={downloadAllPatientsCSV}
              className="w-full sm:w-auto px-4 py-2 bg-[#006838] text-white rounded-lg hover:bg-[#004d2a] transition-colors shadow-sm flex items-center justify-center gap-2 text-sm"
            >
              Export All Data
            </button>
          )}
        </div>
      </div>

      {patients.length === 0 ? (
        <div className="bg-white p-8 sm:p-12 rounded-xl shadow-sm">
          <EmptyState variant="users" title={t('doctor.patientsPage.noPatients')} message={t('doctor.patientsPage.noPatientsDescription')} />
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredPatients.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
              <p className="text-gray-500">No patients found matching "{searchTerm}"</p>
            </div>
          ) : (
            filteredPatients.map((patient) => (
              <div key={patient._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                    <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                      <img
                        className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover flex-shrink-0"
                        src={patient.image || 'https://via.placeholder.com/50'}
                        alt={patient.name}
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{patient.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">{patient.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => downloadCSV(patient)}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-[#006838] hover:bg-[#004d2a] rounded-lg transition-all flex-1 sm:flex-none"
                      >
                        Export CSV
                      </button>
                      <button
                        onClick={() => navigate(`/doctor-reports?patientId=${patient._id}`)}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all flex-1 sm:flex-none"
                      >
                        View Report
                      </button>
                      <button
                        onClick={() => togglePatientDetails(patient._id)}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-[#006838] border border-[#006838] hover:bg-emerald-50 rounded-lg transition-all flex-1 sm:flex-none"
                      >
                        {expandedPatient === patient._id ? t('doctor.patientsPage.hideDetails') : t('doctor.patientsPage.viewDetails')}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-3 sm:mt-4">
                    <div>
                      <p className="text-xs text-gray-500">{t('doctor.patientsPage.phone')}</p>
                      <p className="text-sm font-medium text-gray-900">{patient.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{t('doctor.patientsPage.age')}</p>
                      <p className="text-sm font-medium text-gray-900">
                        {patient.dob && patient.dob !== 'Not Selected'
                          ? calculateAge(patient.dob)
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{t('doctor.patientsPage.appointments')}</p>
                      <p className="text-sm font-medium text-gray-900">
                        {patient.appointmentCount || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{t('doctor.patientsPage.lastVisit')}</p>
                      <p className="text-sm font-medium text-gray-900">
                        {patient.lastAppointment
                          ? new Date(patient.lastAppointment.date).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {expandedPatient === patient._id && (
                    <div className="mt-6 border-t pt-6 space-y-8">
                      {/* Comprehensive Patient Profile Area */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        {/* Personal & Identity */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <FaUser className="text-[#006838]" /> Identity & Profile
                          </h4>
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                            <div>
                              <p className="text-xs text-gray-500">National ID (NID)</p>
                              <p className="text-sm font-semibold">{patient.nid || 'Not Provided'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-xs text-gray-500">Gender</p>
                                <p className="text-sm font-semibold capitalize">{patient.gender}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Marital Status</p>
                                <p className="text-sm font-semibold capitalize">{patient.maritalStatus || 'Single'}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Occupation</p>
                              <p className="text-sm font-semibold">{patient.occupation || 'Not Specified'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Residence Address</p>
                              <p className="text-sm font-semibold">{patient.address?.line1} {patient.address?.line2}</p>
                            </div>
                          </div>
                        </div>

                        {/* Health & Insurance */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <FaShieldAlt className="text-blue-500" /> Health & Insurance
                          </h4>
                          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-3">
                            <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-blue-100">
                              <span className="text-xs text-gray-500">Blood Group</span>
                              <span className="text-sm font-bold text-red-600">{patient.bloodGroup || 'N/A'}</span>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Insurance Provider</p>
                              <p className="text-sm font-bold text-blue-700">{patient.insurance?.provider || 'None'}</p>
                            </div>
                            {patient.insurance?.provider !== 'None' && (
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <p className="text-xs text-gray-500">Policy #</p>
                                  <p className="text-sm font-semibold">{patient.insurance?.policyNumber || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Expiry</p>
                                  <p className="text-sm font-semibold">
                                    {patient.insurance?.expiryDate ? new Date(patient.insurance.expiryDate).toLocaleDateString() : 'N/A'}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Emergency & Allergies */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <FaExclamationTriangle className="text-orange-500" /> Urgent Info
                          </h4>
                          <div className="space-y-3">
                            <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                              <p className="text-xs text-orange-600 font-bold mb-2">EMERGENCY CONTACT</p>
                              {patient.emergencyContact?.name ? (
                                <div className="text-sm">
                                  <p className="font-bold text-gray-800">{patient.emergencyContact.name} ({patient.emergencyContact.relation})</p>
                                  <p className="text-gray-600 flex items-center gap-1 mt-1"><FaPhone size={10} /> {patient.emergencyContact.phone}</p>
                                </div>
                              ) : <p className="text-xs text-gray-400 italic">No emergency contact set.</p>}
                            </div>

                            <div className="bg-red-50/50 p-4 rounded-xl border border-red-100">
                              <p className="text-xs text-red-600 font-bold mb-2">KNOWN ALLERGIES</p>
                              {patient.allergies && patient.allergies.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {patient.allergies.map((alg, i) => (
                                    <span key={i} className="px-2 py-1 bg-white border border-red-200 text-red-700 text-[10px] font-bold rounded-full">
                                      {alg.allergen} ({alg.severity})
                                    </span>
                                  ))}
                                </div>
                              ) : <p className="text-xs text-gray-400 italic">No allergies reported.</p>}
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Clinical Tabs / Sections */}
                      <div className="space-y-6">

                        {/* Records & Prescriptions Row */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                          {/* Medical Records */}
                          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
                              <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2"><FaFileMedical className="text-[#006838]" /> Medical Records</h4>
                              <span className="text-xs font-bold text-[#006838] bg-emerald-100 px-2 py-0.5 rounded-full">{patient.records?.length || 0}</span>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto p-4 space-y-3">
                              {patient.records && patient.records.length > 0 ? patient.records.map((record) => (
                                <div key={record._id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-[#006838] transition-all">
                                  <p className="text-sm font-bold text-gray-800">{record.title}</p>
                                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">{record.description}</p>
                                  <div className="flex justify-between items-center mt-2">
                                    <span className="text-[10px] uppercase font-bold text-gray-400">{record.recordType}</span>
                                    <span className="text-[10px] font-bold text-[#006838]">{new Date(record.createdAt).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              )) : <p className="text-xs text-gray-400 italic text-center py-6">No records found.</p>}
                            </div>
                          </div>

                          {/* Prescriptions */}
                          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
                              <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2"><FaHistory className="text-[#006838]" /> Prescriptions</h4>
                              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{patient.prescriptions?.length || 0}</span>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto p-4 space-y-3">
                              {patient.prescriptions && patient.prescriptions.length > 0 ? patient.prescriptions.map((presc) => (
                                <div key={presc._id} className="p-3 bg-blue-50/30 rounded-lg border border-blue-100">
                                  <div className="flex justify-between">
                                    <p className="text-sm font-bold text-gray-800">{presc.diagnosis || 'Therapy Plan'}</p>
                                    <span className="text-[10px] font-bold text-blue-600">{new Date(presc.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  <div className="mt-2 space-y-1">
                                    {presc.medications?.slice(0, 2).map((m, i) => (
                                      <p key={i} className="text-[11px] text-gray-600">• {m.name} ({m.dosage})</p>
                                    ))}
                                    {presc.medications?.length > 2 && <p className="text-[10px] text-primary font-bold">+{presc.medications.length - 2} more</p>}
                                  </div>
                                </div>
                              )) : <p className="text-xs text-gray-400 italic text-center py-6">No prescriptions found.</p>}
                            </div>
                          </div>
                        </div>

                        {/* Labs, Immunizations, Referrals Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                          {/* Lab Results */}
                          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
                              <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2"><FaFlask className="text-[#006838]" /> Lab Results</h4>
                              <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">{patient.labs?.length || 0}</span>
                            </div>
                            <div className="max-h-[250px] overflow-y-auto p-4 space-y-3">
                              {patient.labs && patient.labs.length > 0 ? patient.labs.map((lab) => (
                                <div key={lab._id} className="p-2 border-b border-gray-50 last:border-0">
                                  <p className="text-xs font-bold text-gray-800 flex justify-between">
                                    <span>{lab.testName}</span>
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${lab.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{lab.status}</span>
                                  </p>
                                  <p className="text-[10px] text-gray-400 mt-1">{new Date(lab.orderedAt).toDateString()}</p>
                                </div>
                              )) : <p className="text-xs text-gray-400 italic text-center py-4">No lab orders.</p>}
                            </div>
                          </div>

                          {/* Immunizations */}
                          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
                              <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2"><FaSyringe className="text-[#006838]" /> Immunizations</h4>
                              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{patient.immunizations?.length || 0}</span>
                            </div>
                            <div className="max-h-[250px] overflow-y-auto p-4 space-y-3">
                              {patient.immunizations && patient.immunizations.length > 0 ? patient.immunizations.map((imm) => (
                                <div key={imm._id} className="p-2 border-b border-gray-50 last:border-0">
                                  <p className="text-xs font-bold text-gray-800">{imm.vaccineName}</p>
                                  <p className="text-[10px] text-gray-500 flex justify-between mt-1">
                                    <span>Dose {imm.doseNumber}</span>
                                    <span>{new Date(imm.dateAdministered).toLocaleDateString()}</span>
                                  </p>
                                </div>
                              )) : <p className="text-xs text-gray-400 italic text-center py-4">No vaccine records.</p>}
                            </div>
                          </div>

                          {/* Referrals */}
                          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
                              <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2"><FaExchangeAlt className="text-[#006838]" /> Referrals</h4>
                              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">{patient.referrals?.length || 0}</span>
                            </div>
                            <div className="max-h-[250px] overflow-y-auto p-4 space-y-3">
                              {patient.referrals && patient.referrals.length > 0 ? patient.referrals.map((ref) => (
                                <div key={ref._id} className="p-2 border-b border-gray-50 last:border-0">
                                  <p className="text-xs font-bold text-gray-800">To: {ref.toHospital?.name || 'External Facility'}</p>
                                  <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">{ref.reason}</p>
                                  <p className="text-[9px] text-primary font-bold mt-1 uppercase">{ref.status}</p>
                                </div>
                              )) : <p className="text-xs text-gray-400 italic text-center py-4">No referrals found.</p>}
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Patients;

