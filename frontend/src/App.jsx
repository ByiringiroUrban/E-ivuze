import React, { useContext, useEffect } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import Login from './pages/Login'
import Register from './pages/Register'
import Error404 from './pages/Error404'
import Error401 from './pages/Error401'
import NetworkError from './pages/NetworkError'
import About from './pages/About'
import Contact from './pages/Contact'
import MyProfile from './pages/MyProfile'
import MyAppointments from './pages/MyAppointments'
import PatientHistory from './pages/PatientHistory'
import LabResults from './pages/LabResults'
import DoctorLabResults from './pages/Doctor/DoctorLabResults'
import MedicalRecord from './pages/MedicalRecord'
import MyPrescriptions from './pages/MyPrescriptions'
import Medications from './pages/Medications'
import Appointment from './pages/Appointment'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import Navbar from './components/Navbar'
import Messages from './pages/Messages'
import Onboarding from './pages/Onboarding'
import InternalMail from './pages/InternalMail'
import ChatContextProvider from './context/ChatContext'
import Footer from './components/Footer'
import IconTexture from './components/IconTexture'
import GlobalLoader from './components/GlobalLoader'
import { AppContext } from './context/AppContext'
import PasswordChangeGuard from './components/PasswordChangeGuard'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { FaExclamationTriangle, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';

// === NOTIFICATION TOAST CONFIG — matches homepage design ===
const toastConfig = {
  position: "top-right",
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: false,
  limit: 3,
  icon: ({ type }) => {
    switch (type) {
      case 'success': return <FaCheckCircle className="text-[#006838]" size={20} />;
      case 'error': return <FaExclamationTriangle className="text-[#dc2626]" size={20} />;
      case 'warning': return <FaExclamationTriangle className="text-[#d97706]" size={20} />;
      default: return <FaInfoCircle className="text-[#081828]" size={20} />;
    }
  },
  closeButton: ({ closeToast }) => (
    <button
      onClick={closeToast}
      className="flex-shrink-0 text-gray-400 hover:text-gray-900 transition-colors ml-3 text-2xl leading-none font-light p-1"
      aria-label="Close"
    >
      ×
    </button>
  ),
};

import { AdminContext } from './context/AdminContext';
import { DoctorContext } from './context/DoctorContext';
import { HospitalContext } from './context/HospitalContext';
import { PharmacyContext } from './context/PharmacyContext';
import AdminNavBar from './components/AdminNavBar';
import AdminSideBar from './components/AdminSideBar';
import HospitalNavBar from './components/HospitalNavBar';
import HospitalSideBar from './components/HospitalSideBar';
import PharmacyNavBar from './components/PharmacyNavBar';
import PharmacySideBar from './components/PharmacySideBar';
import LabNavBar from './components/LabNavBar';
import LabSideBar from './components/LabSideBar';
import Watermark from './components/Watermark';
// Pages
import Dashboard from './pages/Admin/Dashboard';
import AllAppointments from './pages/Admin/AllAppointments';
import AddDoctor from './pages/Admin/AddDoctor';
import DoctorsList from './pages/Admin/DoctorsList';
import PaymentApprovals from './pages/Admin/PaymentApprovals';
import HospitalApprovals from './pages/Admin/HospitalApprovals';
import DoctorApprovals from './pages/Admin/DoctorApprovals';
import PharmacyManagement from './pages/Admin/PharmacyManagement';
import LabManagement from './pages/Admin/LabManagement';
import Settings from './pages/Admin/Settings';
import Announcements from './pages/Admin/Announcements';
import EmailManagement from './pages/Admin/EmailManagement';
import ManageUsers from './pages/Admin/ManageUsers';
import AnnouncementTicker from './components/AnnouncementTicker';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorAppointment from './pages/Doctor/DoctorAppointment';
import DoctorProfile from './pages/Doctor/DoctorProfile';
import Prescriptions from './pages/Doctor/Prescriptions';
import Records from './pages/Doctor/Records';
import Patients from './pages/Doctor/Patients';
import DoctorReports from './pages/Doctor/DoctorReports';
import DoctorCalendar from './pages/Doctor/DoctorCalendar';
import DoctorApprovalGuard from './components/DoctorApprovalGuard';
import HospitalPending from './pages/Hospital/HospitalPending';
import HospitalDashboard from './pages/Hospital/HospitalDashboard';
import Chatbot from './components/Chatbot';
import BackToTop from './components/BackToTop';
import LanguageSwitch from './components/LanguageSwitch';
import AIAssistant from './pages/AIAssistant';
import ChristmasAnimations from './components/ChristmasAnimations';
import SemanticSearchWidget from './components/SemanticSearchWidget';
import PharmacyInvite from './pages/Pharmacy/PharmacyInvite';
import PharmacyDashboard from './pages/Pharmacy/PharmacyDashboard';
import PharmacyInventory from './pages/Pharmacy/PharmacyInventory';
import PharmacyOrders from './pages/Pharmacy/PharmacyOrders';
import PharmacyReports from './pages/Pharmacy/PharmacyReports';
import PharmacyImpersonate from './pages/Pharmacy/PharmacyImpersonate';
import PharmacySettings from './pages/Pharmacy/PharmacySettings';
import HospitalRegisterAdmin from './pages/Admin/HospitalRegisterAdmin';
import HospitalTrials from './pages/Admin/HospitalTrials';
import AIKnowledgeIngest from './pages/Admin/AIKnowledgeIngest';
import LabContextProvider, { LabContext } from './context/LabContext';
import LabDashboard from './pages/Lab/LabDashboard';
import LabOrders from './pages/Lab/LabOrders';
import LabProfile from './pages/Lab/LabProfile';
import LabSettings from './pages/Lab/LabSettings';
import LabSelection from './pages/LabSelection';
import PharmacySelection from './pages/PharmacySelection';

const App = () => {
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);
  const { hToken, hospital } = useContext(HospitalContext);
  const { pToken } = useContext(PharmacyContext);
  const { lToken } = useContext(LabContext);
  const { pageLoading, token, backendUrl, userData } = useContext(AppContext);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (token && userData && userData.role === 'user' && !userData.onboardingCompleted) {
      const publicRoutes = ['/onboarding', '/login', '/register', '/404', '/401', '/network-error'];
      if (!publicRoutes.includes(location.pathname)) navigate('/onboarding', { replace: true });
    }
  }, [token, userData, location.pathname, navigate]);

  const chatRole = aToken ? 'admin' : dToken ? 'doctor' : hToken ? 'hospital' : pToken ? 'pharmacy' : lToken ? 'lab' : (token ? 'patient' : 'guest');
  const chatTokens = { token, aToken, dToken, hToken, pToken, lToken };

  // Core layout determination logic
  const renderContent = () => {
    if (location.pathname === '/ai-assistant' || location.pathname === '/messages') {
      const PageComponent = location.pathname === '/ai-assistant' ? AIAssistant : InternalMail;
      return <PageComponent />;
    }

    if (pToken) return (
      <div className='bg-gray-50 flex min-h-screen'>
        <PharmacySideBar />
        <div className='flex-1 overflow-y-auto h-[calc(100vh-65px)]'>
          <PharmacyNavBar />
          <Watermark />
          <Routes>
            <Route path='/pharmacy-dashboard' element={<PharmacyDashboard />} />
            <Route path='/' element={<PharmacyDashboard />} />
            <Route path='/pharmacy-inventory' element={<PharmacyInventory />} />
            <Route path='/pharmacy-orders' element={<PharmacyOrders />} />
            <Route path='/pharmacy-reports' element={<PharmacyReports />} />
            <Route path='/pharmacy-impersonate' element={<PharmacyImpersonate />} />
            <Route path='/pharmacy-settings' element={<PharmacySettings />} />
          </Routes>
        </div>
      </div>
    );

    if (lToken) return (
      <div className='bg-gray-50 flex min-h-screen'>
        <LabSideBar />
        <div className='flex-1 overflow-y-auto h-[calc(100vh-65px)]'>
          <LabNavBar />
          <Watermark />
          <Routes>
            <Route path='/lab-dashboard' element={<LabDashboard />} />
            <Route path='/' element={<LabDashboard />} />
            <Route path='/lab-orders' element={<LabOrders />} />
            <Route path='/lab-profile' element={<LabProfile />} />
            <Route path='/lab-settings' element={<LabSettings />} />
          </Routes>
        </div>
      </div>
    );

    if (hToken) {
      if (!hospital || hospital.status !== 'APPROVED') return <HospitalPending />;
      return (
        <div className='bg-gray-50 flex min-h-screen'>
          <HospitalSideBar />
          <div className='flex-1 overflow-y-auto h-[calc(100vh-65px)]'>
            <HospitalNavBar />
            <Watermark />
            <Routes>
              <Route path='/hospital-dashboard/*' element={<HospitalDashboard />} />
              <Route path='*' element={<HospitalDashboard />} />
            </Routes>
          </div>
        </div>
      );
    }

    if (aToken || dToken) {
      const IsDoctor = !!dToken;
      const MainView = (
        <div className='bg-gray-50 flex min-h-screen'>
          <AdminSideBar />
          <div className='flex-1 overflow-y-auto h-[calc(100vh-65px)]'>
            <AdminNavBar />
            <Watermark />
            <Routes>
              {IsDoctor ? (
                <>
                  <Route path='/' element={<DoctorDashboard />} />
                  <Route path='/doctor-dashboard' element={<DoctorDashboard />} />
                  <Route path='/doctor-calendar' element={<DoctorCalendar />} />
                  <Route path='/doctor-appointments' element={<DoctorAppointment />} />
                  <Route path='/doctor-profile' element={<DoctorProfile />} />
                  <Route path='/prescriptions' element={<Prescriptions />} />
                  <Route path='/records' element={<Records />} />
                  <Route path='/patients' element={<Patients />} />
                  <Route path='/doctor-reports' element={<DoctorReports />} />
                </>
              ) : (
                <>
                  <Route path='/admin-dashboard' element={<Dashboard />} />
                  <Route path='/all-appointments' element={<AllAppointments />} />
                  <Route path='/add-doctor' element={<AddDoctor />} />
                  <Route path='/doctor-list' element={<DoctorsList />} />
                  <Route path='/manage-users' element={<ManageUsers />} />
                  <Route path='/payment-approvals' element={<PaymentApprovals />} />
                  <Route path='/hospital-approvals' element={<HospitalApprovals />} />
                  <Route path='/doctor-approvals' element={<DoctorApprovals />} />
                  <Route path='/announcements' element={<Announcements />} />
                  <Route path='/settings' element={<Settings />} />
                </>
              )}
              <Route path='*' element={IsDoctor ? <DoctorDashboard /> : <Dashboard />} />
            </Routes>
          </div>
        </div>
      );
      return IsDoctor ? <DoctorApprovalGuard>{MainView}</DoctorApprovalGuard> : MainView;
    }

    return (
      <PasswordChangeGuard>
        <div className='bg-light-bg min-h-screen'>
          <IconTexture opacity={0.08} size={18} className="text-primary fixed inset-0 pointer-events-none z-0" />
          <ChristmasAnimations />
          {location.pathname !== '/onboarding' && !location.pathname.startsWith('/meeting') && <Navbar />}
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/doctors' element={<Doctors />} />
            <Route path='/doctors/:speciality' element={<Doctors />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/about' element={<About />} />
            <Route path='/contact' element={<Contact />} />
            <Route path='/404' element={<Error404 />} />
            <Route path='/my-profile' element={<MyProfile />} />
            <Route path='/my-appointments' element={<MyAppointments />} />
            <Route path='/lab-results' element={<LabResults />} />
            <Route path='/my-prescriptions' element={<MyPrescriptions />} />
            <Route path='/medications' element={<Medications />} />
            <Route path='/appointment/:docId' element={<Appointment />} />
            <Route path='/medical-record' element={<MedicalRecord />} />
            <Route path='/history' element={<PatientHistory />} />
            <Route path='/onboarding' element={<Onboarding />} />
            <Route path='/terms' element={<TermsOfService />} />
            <Route path='/privacy' element={<PrivacyPolicy />} />
            <Route path='*' element={<Error404 />} />
          </Routes>
          {location.pathname !== '/onboarding' && !location.pathname.startsWith('/meeting') && <Footer />}
        </div>
      </PasswordChangeGuard>
    );
  };

  return (
    <ChatContextProvider tokens={chatTokens} role={chatRole}>
      <div className="relative z-10 transition-all duration-500 min-h-screen">
        <AnnouncementTicker backendUrl={backendUrl} />
        <ToastContainer {...toastConfig} />
        {pageLoading && <GlobalLoader />}
        {renderContent()}
        <BackToTop />
        <Chatbot />
        <SemanticSearchWidget />
        <LanguageSwitch />
      </div>
    </ChatContextProvider>
  )
}

export default App
