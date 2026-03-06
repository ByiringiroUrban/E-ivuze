import React, { useContext, useEffect, useState, useRef } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { AppContext } from '../../context/AppContext';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../../assets/assets';
import { FaUser, FaFlask, FaPills, FaHistory, FaFileMedical, FaSearch, FaChevronLeft, FaPrint, FaFileCsv, FaFileExcel, FaExternalLinkAlt, FaSyringe } from 'react-icons/fa';
import DoctorSkeletonLoaders from '../../components/DoctorSkeletonLoaders';

const DoctorReports = () => {
    const { dToken, backendUrl } = useContext(DoctorContext);
    const { currency, calculateAge } = useContext(AppContext);
    const { t } = useTranslation();

    const [dashData, setDashData] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [filteredEarnings, setFilteredEarnings] = useState(0);
    const [timeRange, setTimeRange] = useState('all');
    const [loading, setLoading] = useState(true);
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [patientData, setPatientData] = useState(null);
    const [loadingPatient, setLoadingPatient] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    const query = new URLSearchParams(location.search);
    const urlPatientId = query.get('patientId');

    const timeRanges = [
        { value: 'all', label: 'All Time' },
        { value: 'today', label: 'Today' },
        { value: 'week', label: 'Last 7 Days' },
        { value: 'month', label: 'Last 30 Days' },
        { value: 'month_2', label: 'Last 2 Months' },
        { value: 'month_3', label: 'Last 3 Months' },
        { value: 'year', label: 'Last Year' }
    ];

    const reportRef = useRef(null);

    useEffect(() => {
        if (dToken) {
            fetchData();
        }
    }, [dToken]);

    useEffect(() => {
        if (urlPatientId) {
            setSelectedPatientId(urlPatientId);
        } else {
            setSelectedPatientId('');
            setPatientData(null);
        }
    }, [urlPatientId]);

    useEffect(() => {
        if (selectedPatientId) {
            fetchPatientDetails(selectedPatientId);
        }
    }, [selectedPatientId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch Dashboard Data
            const dashResponse = await axios.get(backendUrl + '/api/doctor/dashboard', { headers: { dToken } });
            if (dashResponse.data.success) {
                setDashData(dashResponse.data.dashData);
            }

            // Fetch Appointments
            const appResponse = await axios.get(backendUrl + '/api/doctor/appointments', { headers: { dToken } });
            if (appResponse.data.success) {
                setAppointments(appResponse.data.appointments);
            }

            // Fetch Patients
            const patResponse = await axios.get(backendUrl + '/api/doctor/patients', { headers: { dToken } });
            if (patResponse.data.success) {
                setPatients(patResponse.data.patients);
            }

        } catch (error) {
            console.error(error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchPatientDetails = async (patientId) => {
        try {
            setLoadingPatient(true);
            const [visitsRes, labsRes, prescriptionsRes, recordsRes, referralsRes, immunizationsRes] = await Promise.all([
                axios.post(`${backendUrl}/api/clinical/doctor/patient-visits`, { patientId }, { headers: { dToken } }),
                axios.post(`${backendUrl}/api/clinical/doctor/patient-labs`, { patientId }, { headers: { dToken } }),
                axios.post(`${backendUrl}/api/clinical/doctor/patient-prescriptions`, { patientId }, { headers: { dToken } }),
                axios.post(`${backendUrl}/api/doctor/patient/records`, { patientId }, { headers: { dToken } }),
                axios.post(`${backendUrl}/api/clinical/doctor/patient-referrals`, { userId: patientId }, { headers: { dToken } }),
                axios.post(`${backendUrl}/api/clinical/doctor/patient-immunizations`, { userId: patientId }, { headers: { dToken } })
            ]);

            const patientInfo = patients.find(p => p._id === patientId);

            setPatientData({
                info: patientInfo,
                visits: visitsRes.data.success ? visitsRes.data.visits : [],
                labs: labsRes.data.success ? labsRes.data.orders : [],
                prescriptions: prescriptionsRes.data.success ? prescriptionsRes.data.prescriptions : [],
                records: recordsRes.data.success ? recordsRes.data.records : [],
                referrals: referralsRes.data.success ? referralsRes.data.referrals : [],
                immunizations: immunizationsRes.data.success ? immunizationsRes.data.immunizations : []
            });
        } catch (error) {
            console.error("Error fetching patient details:", error);
            toast.error("Failed to load patient history");
        } finally {
            setLoadingPatient(false);
        }
    };

    useEffect(() => {
        filterData();
    }, [appointments, patients, timeRange]);

    const filterData = () => {
        const now = new Date();
        let startDate = null;

        switch (timeRange) {
            case 'today':
                startDate = new Date(now.setHours(0, 0, 0, 0));
                break;
            case 'week':
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case 'month':
                startDate = new Date(now.setDate(now.getDate() - 30));
                break;
            case 'month_2':
                startDate = new Date(now.setDate(now.getDate() - 60));
                break;
            case 'month_3':
                startDate = new Date(now.setDate(now.getDate() - 90));
                break;
            case 'year':
                startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                break;
            default:
                startDate = null;
        }

        let filteredApps = appointments;

        if (startDate) {
            filteredApps = appointments.filter(app => {
                const [day, month, year] = app.slotDate.split('_');
                // Assuming slotDate format is DD_MM_YYYY based on common patterns in this app, need to check if it parses correctly
                // If the app uses a different format, we might need adjustment. 
                // Let's safe check: usually standard JS Date parsing handles YYYY-MM-DD well.
                // If it is DD_MM_YYYY:
                const appDate = new Date(`${year}-${month}-${day}`);
                return appDate >= startDate;
            });
        }

        setFilteredAppointments(filteredApps);

        // Recalculate Earnings
        const earnings = filteredApps.reduce((acc, curr) => {
            if (curr.isCompleted || curr.payment) {
                return acc + curr.amount;
            }
            return acc;
        }, 0);
        setFilteredEarnings(earnings);

        // Filter Patients - Show patients who had appointments in this period
        // Or if 'all', show all fetched patients.
        // Actually, for a report, it usually means "active patients in this period". 
        // But if filteredApps is empty, patient list might be empty.
        // Let's filter patients based on whether ANY of their appointments (in filteredApps) belong to them.

        if (timeRange === 'all') {
            setFilteredPatients(patients);
        } else {
            const activePatientIds = new Set(filteredApps.map(app => app.userId));
            // Note: patient._id and app.userId might need matching type (string)
            const activePatients = patients.filter(pat => activePatientIds.has(pat._id));
            setFilteredPatients(activePatients);
        }
    };

    const downloadPDF = () => {
        const printContent = document.getElementById('report-content').innerHTML;
        const originalContent = document.body.innerHTML;

        document.body.innerHTML = printContent;
        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload(); // Refresh to restore state
    };

    // Fallback for image export since we can't use html2canvas without install
    // We will use a print approach for "PDF/Image" essentially
    // But user asked for specific formats. 
    // Given restrictions, CSV/Excel is done via data URI. 
    // PDF is done via window.print() (browser built-in PDF save).
    // Image is tricky without canvas. We can try to suggest the user use Screenshot for "Image" or implement a hack, 
    // but robustly, window.print() is the best "PDF" solution without libraries.
    // For "Image", we generally need html2canvas. 
    // Let's implement CSV and Excel (xml) exports.

    const downloadCSV = () => {
        let csv = 'Category,Metric,Value\n';

        // Overview
        csv += `Overview,Time Range,${timeRanges.find(tr => tr.value === timeRange).label}\n`;
        csv += `Overview,Earnings,${filteredEarnings}\n`;
        csv += `Overview,Appointments,${filteredAppointments.length}\n`;
        csv += `Overview,Patients,${filteredPatients.length}\n\n`;

        // Appointments Details
        csv += 'Appointments Details\n';
        csv += 'Date,Time,Patient,Status,Amount\n';
        csv += 'Appointments Details\n';
        csv += 'Date,Time,Patient,Status,Amount\n';
        filteredAppointments.forEach(item => {
            csv += `${item.slotDate},${item.slotTime},${item.userData.name},${item.isCompleted ? 'Completed' : item.cancelled ? 'Cancelled' : 'Pending'},${item.amount}\n`;
        });
        csv += '\n';

        // Patient Details
        csv += 'Patient Details\n';
        csv += 'Name,Email,Phone,Last Visit\n';
        // Patient Details
        csv += 'Patient Details\n';
        csv += 'Name,Email,Phone,Last Visit\n';
        filteredPatients.forEach(item => {
            const lastVisit = item.lastAppointment ? new Date(item.lastAppointment.date).toLocaleDateString() : 'N/A';
            csv += `${item.name},${item.email},${item.phone},${lastVisit}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Doctor_Report_${new Date().toLocaleDateString()}.csv`;
        a.click();
    };

    const downloadXLS = () => {
        // varied XML for simple excel opening
        let xls = '<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">';

        // Styles
        xls += '<Styles><Style ss:ID="s1"><Font ss:Bold="1"/></Style></Styles>';

        // Overview Sheet
        xls += '<Worksheet ss:Name="Overview"><Table>';
        xls += '<Row><Cell ss:StyleID="s1"><Data ss:Type="String">Metric</Data></Cell><Cell ss:StyleID="s1"><Data ss:Type="String">Value</Data></Cell></Row>';
        xls += `<Row><Cell><Data ss:Type="String">Earnings</Data></Cell><Cell><Data ss:Type="Number">${dashData.earnings}</Data></Cell></Row>`;
        xls += `<Row><Cell><Data ss:Type="String">Total Appointments</Data></Cell><Cell><Data ss:Type="Number">${dashData.appointments}</Data></Cell></Row>`;
        xls += `<Row><Cell><Data ss:Type="String">Total Patients</Data></Cell><Cell><Data ss:Type="Number">${dashData.patients}</Data></Cell></Row>`;
        xls += '</Table></Worksheet>';

        // Appointments Sheet
        xls += '<Worksheet ss:Name="Appointments"><Table>';
        xls += '<Row><Cell ss:StyleID="s1"><Data ss:Type="String">Date</Data></Cell><Cell ss:StyleID="s1"><Data ss:Type="String">Time</Data></Cell><Cell ss:StyleID="s1"><Data ss:Type="String">Patient</Data></Cell><Cell ss:StyleID="s1"><Data ss:Type="String">Status</Data></Cell><Cell ss:StyleID="s1"><Data ss:Type="String">Amount</Data></Cell></Row>';
        appointments.forEach(item => {
            xls += `<Row><Cell><Data ss:Type="String">${item.slotDate}</Data></Cell><Cell><Data ss:Type="String">${item.slotTime}</Data></Cell><Cell><Data ss:Type="String">${item.userData.name}</Data></Cell><Cell><Data ss:Type="String">${item.isCompleted ? 'Completed' : item.cancelled ? 'Cancelled' : 'Pending'}</Data></Cell><Cell><Data ss:Type="Number">${item.amount}</Data></Cell></Row>`;
        });
        xls += '</Table></Worksheet>';

        // Patients Sheet
        xls += '<Worksheet ss:Name="Patients"><Table>';
        xls += '<Row><Cell ss:StyleID="s1"><Data ss:Type="String">Name</Data></Cell><Cell ss:StyleID="s1"><Data ss:Type="String">Email</Data></Cell><Cell ss:StyleID="s1"><Data ss:Type="String">Phone</Data></Cell><Cell ss:StyleID="s1"><Data ss:Type="String">Last Visit</Data></Cell></Row>';
        patients.forEach(item => {
            const lastVisit = item.lastAppointment ? new Date(item.lastAppointment.date).toLocaleDateString() : 'N/A';
            xls += `<Row><Cell><Data ss:Type="String">${item.name}</Data></Cell><Cell><Data ss:Type="String">${item.email}</Data></Cell><Cell><Data ss:Type="String">${item.phone}</Data></Cell><Cell><Data ss:Type="String">${lastVisit}</Data></Cell></Row>`;
        });
        xls += '</Table></Worksheet>';

        xls += '</Workbook>';

        const blob = new Blob([xls], { type: 'application/vnd.ms-excel' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Doctor_Report_${new Date().toLocaleDateString()}.xls`;
        a.click();
    };

    if (loading || (selectedPatientId && loadingPatient)) {
        return <DoctorSkeletonLoaders.ReportsSkeleton />;
    }

    return (
        <div className="flex-1 bg-gray-50 min-h-screen p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        {selectedPatientId ? (
                            <>
                                <button onClick={() => navigate('/doctor-reports')} className="p-2 hover:bg-gray-200 rounded-full transition-all">
                                    <FaChevronLeft className="text-sm" />
                                </button>
                                Patient Report
                            </>
                        ) : 'Comprehensive Report'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {selectedPatientId ? `Detailed medical history for ${patientData?.info?.name || 'Patient'}` : 'Generate reports for specific time periods'}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {!selectedPatientId && (
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 -transform -translate-y-1/2 text-gray-400" />
                            <select
                                value={selectedPatientId}
                                onChange={(e) => navigate(`/doctor-reports?patientId=${e.target.value}`)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-[#006838] bg-white w-full sm:w-64 appearance-none"
                            >
                                <option value="">Select Patient for Detailed Report</option>
                                {patients.map(p => (
                                    <option key={p._id} value={p._id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {!selectedPatientId && (
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-[#006838] bg-white"
                        >
                            {timeRanges.map(range => (
                                <option key={range.value} value={range.value}>{range.label}</option>
                            ))}
                        </select>
                    )}

                    <div className="flex gap-2">
                        <button onClick={downloadPDF} className="flex-1 sm:flex-none px-4 py-2 bg-gray-800 text-white rounded-none hover:bg-gray-700 transition flex items-center justify-center gap-2">
                            <FaPrint /> <span className="hidden sm:inline">Print</span>
                        </button>
                        <button onClick={downloadCSV} className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded-none hover:bg-green-500 transition flex items-center justify-center gap-2">
                            <FaFileCsv /> <span className="hidden sm:inline">CSV</span>
                        </button>
                        <button onClick={downloadXLS} className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-none hover:bg-blue-500 transition flex items-center justify-center gap-2">
                            <FaFileExcel /> <span className="hidden sm:inline">Excel</span>
                        </button>
                    </div>
                </div>
            </div>

            {selectedPatientId && patientData ? (
                <div id="report-content" className="space-y-6">
                    {/* Patient Profile Overview */}
                    <div className="bg-white p-6 rounded-none shadow-sm border border-gray-100">
                        <div className="flex items-center gap-6 mb-6">
                            <img src={patientData.info?.image || assets.profile_pic} alt="" className="w-20 h-20 rounded-none object-cover border-2 border-[#006838]/20" />
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800">{patientData.info?.name}</h3>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500 uppercase">Age</span>
                                        <span className="font-medium">{calculateAge(patientData.info?.dob)} Years</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500 uppercase">Gender</span>
                                        <span className="font-medium capitalize">{patientData.info?.gender}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500 uppercase">Phone</span>
                                        <span className="font-medium">{patientData.info?.phone}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500 uppercase">Email</span>
                                        <span className="font-medium">{patientData.info?.email}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Clinical Visits Section */}
                    <div className="bg-white p-6 rounded-none shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                            <FaHistory className="text-[#006838]" /> Medical History / Visits
                        </h3>
                        <div className="space-y-4">
                            {patientData.visits.length > 0 ? patientData.visits.map((visit, idx) => (
                                <div key={idx} className="p-4 bg-gray-50 border border-gray-200 rounded-none">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-bold text-gray-700">{visit.appointmentId?.slotDate} | {visit.appointmentId?.slotTime}</p>
                                            <p className="text-xs text-gray-500">Reason: {visit.clinicalSummary}</p>
                                        </div>
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-[10px] font-bold uppercase rounded-none">
                                            {visit.outcome}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                        <div className="text-sm">
                                            <p className="font-bold text-gray-600">Chief Complaint:</p>
                                            <p className="text-gray-700 italic">"{visit.subjective}"</p>
                                        </div>
                                        <div className="text-sm">
                                            <p className="font-bold text-gray-600">Plan:</p>
                                            <p className="text-gray-700">{visit.plan}</p>
                                        </div>
                                    </div>
                                </div>
                            )) : <p className="text-gray-400 italic text-sm">No clinical visits recorded.</p>}
                        </div>
                    </div>

                    {/* Lab Results Section */}
                    <div className="bg-white p-6 rounded-none shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                            <FaFlask className="text-[#006838]" /> Laboratory Findings
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {patientData.labs.length > 0 ? patientData.labs.map((lab, idx) => (
                                <div key={idx} className="p-4 border border-gray-100 bg-emerald-50/30 rounded-none">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="font-bold text-gray-800">{lab.testName}</p>
                                        <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-none ${lab.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {lab.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500">Order ID: {lab._id.slice(-6).toUpperCase()}</p>
                                    <p className="text-sm text-gray-700 mt-2">{lab.resultSummary || 'Awaiting results from the laboratory.'}</p>
                                    {lab.resultDocument && (
                                        <a href={lab.resultDocument} target="_blank" rel="noreferrer" className="text-xs text-[#006838] font-bold mt-3 inline-block hover:underline">
                                            VIEW FULL DOCUMENT →
                                        </a>
                                    )}
                                </div>
                            )) : <p className="text-gray-400 italic text-sm">No lab orders found.</p>}
                        </div>
                    </div>

                    {/* Prescriptions Section */}
                    <div className="bg-white p-6 rounded-none shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                            <FaPills className="text-[#006838]" /> Prescriptions
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                                        <th className="p-3 border-b">Date</th>
                                        <th className="p-3 border-b">Diagnosis</th>
                                        <th className="p-3 border-b">Medications</th>
                                        <th className="p-3 border-b">Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {patientData.prescriptions.length > 0 ? patientData.prescriptions.map((presc, idx) => (
                                        <tr key={idx} className="text-sm border-b hover:bg-gray-50">
                                            <td className="p-3">{new Date(presc.createdAt).toLocaleDateString()}</td>
                                            <td className="p-3 font-medium">{presc.diagnosis}</td>
                                            <td className="p-3">
                                                <ul className="list-disc list-inside">
                                                    {presc.medications?.map((m, i) => (
                                                        <li key={i}>{m.name} ({m.dosage}) - {m.frequency}</li>
                                                    ))}
                                                </ul>
                                            </td>
                                            <td className="p-3 text-gray-500 italic text-xs">{presc.notes}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" className="p-6 text-center text-gray-400 italic">No prescriptions found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Referrals Section */}
                    <div className="bg-white p-6 rounded-none shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                            <FaExternalLinkAlt className="text-[#006838] text-sm" /> Referrals
                        </h3>
                        <div className="space-y-3">
                            {patientData.referrals.length > 0 ? patientData.referrals.map((ref, idx) => (
                                <div key={idx} className="p-4 border border-gray-100 bg-emerald-50/20 rounded-none">
                                    <div className="flex justify-between items-center">
                                        <p className="font-bold text-gray-800">To: {ref.toHospital}</p>
                                        <span className="text-xs text-gray-400">{new Date(ref.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1"><span className="font-bold">Reason:</span> {ref.reason}</p>
                                    <p className="text-xs text-gray-400 mt-1 italic">Type: {ref.transferType}</p>
                                </div>
                            )) : <p className="text-gray-400 italic text-sm">No referrals issued.</p>}
                        </div>
                    </div>

                    {/* Immunizations Section */}
                    <div className="bg-white p-6 rounded-none shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                            <FaSyringe className="text-[#006838]" /> Immunizations
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {patientData.immunizations.length > 0 ? patientData.immunizations.map((imm, idx) => (
                                <div key={idx} className="p-4 border border-gray-100 bg-emerald-50/20 rounded-none flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-gray-800">{imm.vaccineName}</p>
                                        <p className="text-xs text-gray-500">Dose: {imm.doseNumber} | Date: {new Date(imm.administeredDate).toLocaleDateString()}</p>
                                    </div>
                                    <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-none uppercase">Administered</span>
                                </div>
                            )) : <p className="text-gray-400 italic text-sm">No immunization records found.</p>}
                        </div>
                    </div>

                    {/* Other Records / Attachments Section */}
                    <div className="bg-white p-6 rounded-none shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                            <FaFileMedical className="text-[#006838]" /> Supporting Documents & Records
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {patientData.records.length > 0 ? patientData.records.map((record, idx) => (
                                <div key={idx} className="p-4 border border-gray-200 hover:border-[#006838] transition-all rounded-none">
                                    <p className="font-bold text-sm text-gray-800 truncate">{record.title}</p>
                                    <p className="text-xs text-gray-500 mt-1">{record.recordType} | {new Date(record.createdAt).toLocaleDateString()}</p>
                                    <div className="mt-3 flex gap-2">
                                        {record.attachments?.map((att, i) => (
                                            <a key={i} href={att} target="_blank" rel="noreferrer" className="w-8 h-8 bg-gray-100 flex items-center justify-center hover:bg-emerald-100 transition-all">
                                                <FaFileMedical className="text-gray-400 text-xs" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )) : <p className="text-gray-400 italic text-sm">No additional records found.</p>}
                        </div>
                    </div>
                </div>
            ) : (
                <div id="report-content" className="space-y-6">
                    {/* Overview Section */}
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h3 className="text-lg font-semibold text-gray-700">Overview</h3>
                            <span className="text-sm font-medium text-[#006838] px-3 py-1 bg-emerald-50 rounded-full">
                                {timeRanges.find(tr => tr.value === timeRange)?.label}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-4 bg-emerald-50 rounded-lg">
                                <p className="text-sm text-emerald-600 font-medium">Total Earnings</p>
                                <p className="text-2xl font-bold text-gray-800">{currency} {filteredEarnings}</p>
                            </div>
                            <div className="p-4 bg-emerald-50 rounded-lg">
                                <p className="text-sm text-emerald-600 font-medium">Total Appointments</p>
                                <p className="text-2xl font-bold text-gray-800">{filteredAppointments.length}</p>
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg">
                                <p className="text-sm text-green-600 font-medium">Total Patients</p>
                                <p className="text-2xl font-bold text-gray-800">{filteredPatients.length}</p>
                            </div>
                        </div>
                    </div>

                    {/* Appointments Section */}
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Recent Appointments History</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fees</th>
                                    </tr>

                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredAppointments.length > 0 ? (
                                        filteredAppointments.map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    {item.slotDate} | {item.slotTime}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    <div className="flex items-center gap-2">
                                                        <img src={item.userData.image} alt="" className="w-8 h-8 rounded-full object-cover" />
                                                        {item.userData.name}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${item.cancelled ? 'bg-red-100 text-red-800' :
                                                        item.isCompleted ? 'bg-green-100 text-green-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {item.cancelled ? 'Cancelled' : item.isCompleted ? 'Completed' : 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    {currency} {item.amount}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                                                No appointments found for the selected time period.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Patients Section */}
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Patient Database</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visit</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Records</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredPatients.length > 0 ? (
                                        filteredPatients.map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    <div className="flex items-center gap-2">
                                                        <img src={item.image} alt="" className="w-8 h-8 rounded-full object-cover" />
                                                        {item.name}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-500">
                                                    <div className="flex flex-col">
                                                        <span>{item.email}</span>
                                                        <span className="text-xs">{item.phone}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-500">
                                                    {item.lastAppointment ? new Date(item.lastAppointment.date).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-500">
                                                    {item.records ? item.records.length : 0} Records
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                                                No patients active in the selected time period.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorReports;
