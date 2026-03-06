import React, { useEffect, useContext, useState } from 'react';
import { HospitalContext } from '../../context/HospitalContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import IconTexture from '../../components/IconTexture';
import { assets } from '../../assets/assets';
import { FaChartBar, FaClipboardList, FaShoppingBag, FaUserPlus } from "react-icons/fa";
import { getDoctorImageSrc } from '../../utils/doctorImage';
import { StatCard, VisitorInsightsChart, TotalRevenueChart, CustomerSatisfactionChart, TargetRealityChart, TopDoctors } from "../../components/DashboardCharts";
import { LoadingComponents } from '../../components/LoadingComponents';

const HospitalDashboardMain = () => {
  const { hospital, doctors, patients, transfers, getHospitalDoctors, getHospitalPatients, getHospitalTransfers, getDashData, loading } = useContext(HospitalContext);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [dashData, setDashData] = useState(null);

  useEffect(() => {
    getHospitalDoctors();
    getHospitalPatients();
    getHospitalTransfers();
    if (getDashData) {
      getDashData().then(data => {
        if (data) setDashData(data);
      });
    }
  }, []);

  if (loading && !dashData) return <LoadingComponents.DashboardLoader text={t('hospital.dashboard.loading') || 'Loading dashboard...'} />;

  const stats = {
    doctors: dashData?.doctors || doctors?.length || 0,
    patients: dashData?.patients || patients?.length || 0,
    pendingTransfers: transfers?.incoming?.filter(t => t.status === 'PENDING').length || 0,
    outgoingTransfers: transfers?.outgoing?.length || 0
  };

  return (
    <div className='bg-white min-h-screen'>
      <div className='flex flex-col lg:flex-row gap-4 sm:gap-6 p-4 sm:p-6'>
        {/* Main Content Area */}
        <div className='flex-1 space-y-4 sm:space-y-6'>
          {/* Welcome Banner Card */}
          <div className='bg-[#006838] text-white rounded-xl p-4 sm:p-6 lg:p-8 border border-border relative overflow-hidden'>
            <IconTexture opacity={0.1} size={24} className="text-white" />
            <div className='flex flex-col lg:flex-row items-start lg:items-center justify-between relative z-10 gap-4 lg:gap-0'>
              <div className='flex-1'>
                <p className='text-[10px] sm:text-xs   tracking-widest text-white/70 mb-2'>{t('hospital.dashboard.welcome')}</p>
                <p className='text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6'>{hospital?.name || t('hospital.dashboard.title')}</p>
                <div className='flex gap-2 sm:gap-3 flex-wrap'>
                  <button
                    onClick={() => navigate('/hospital-dashboard/doctors')}
                    className='bg-white text-[#006838] px-4 sm:px-6 py-2 sm:py-3 text-[10px] sm:text-xs   tracking-wider hover:bg-light-bg transition-all rounded-lg'
                  >
                    {t('hospital.dashboard.manageDoctors')}
                  </button>
                  <button
                    onClick={() => navigate('/hospital-dashboard/reports')}
                    className='border border-white text-white px-4 sm:px-6 py-2 sm:py-3 text-[10px] sm:text-xs   tracking-wider hover:bg-white/10 transition-all rounded-lg'
                  >
                    {t('hospital.dashboard.viewReportsAction')}
                  </button>
                </div>
              </div>
              <div className='hidden lg:block w-48 lg:w-64 h-48 lg:h-64 relative'>
                <img className='w-full h-full object-contain' src={assets.appointment_img} alt="Hospital" />
              </div>
            </div>
          </div>

          {/* --- NEW DASHBOARD WIDGETS --- */}
          <div className="space-y-6">
            {/* 1. Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                color="red"
                value={stats.doctors}
                label={t('hospital.dashboard.doctors')}
                icon={<FaChartBar />}
                subtext="+2 New this week"
              />
              <StatCard
                color="yellow"
                value={stats.patients}
                label={t('hospital.dashboard.patients')}
                icon={<FaClipboardList />}
                subtext="+5% from last month"
              />
              <StatCard
                color="green"
                value={stats.pendingTransfers}
                label={t('hospital.dashboard.pendingTransfers')}
                icon={<FaShoppingBag />}
                subtext="Action required"
              />
              <StatCard
                color="purple"
                value={stats.outgoingTransfers}
                label={t('hospital.dashboard.outgoingTransfers')}
                icon={<FaUserPlus />}
                subtext="Transferred out"
              />
            </div>

            {/* 2. Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
              <VisitorInsightsChart data={dashData?.charts?.visitors} />
              <TotalRevenueChart data={dashData?.charts?.revenue} />
            </div>

            {/* 3. Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <CustomerSatisfactionChart />
              <TargetRealityChart data={dashData?.charts?.target} />
              <TopDoctors data={dashData?.charts?.topDoctors} />
            </div>
          </div>
          {/* --- END WIDGETS --- */}

          {/* Recent Activity */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'>
            <div className='bg-white rounded-xl p-4 sm:p-6 shadow-sm'>
              <div className='flex justify-between items-center mb-4'>
                <div>
                  <p className='text-base sm:text-lg font-semibold text-gray-800'>{t('hospital.dashboard.recentDoctors')}</p>
                  <p className='text-xs sm:text-sm text-gray-500'>{doctors?.length || 0} {t('hospital.dashboard.totalDoctors')}</p>
                </div>
              </div>
              <div className='space-y-3'>
                {doctors?.slice(0, 5).map((doctor, index) => (
                  <div key={index} className='flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all'>
                    <img className='w-10 h-10 rounded-full object-cover flex-shrink-0' src={getDoctorImageSrc(doctor)} alt={doctor.name} />
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-gray-800 truncate'>{doctor.name}</p>
                      <p className='text-xs text-gray-500 truncate'>{doctor.speciality}</p>
                    </div>
                  </div>
                ))}
                {(!doctors || doctors.length === 0) && (
                  <p className='text-sm text-gray-500 text-center py-4'>{t('hospital.dashboard.noDoctors')}</p>
                )}
              </div>
            </div>

            <div className='bg-white rounded-xl p-4 sm:p-6 shadow-sm'>
              <div className='flex justify-between items-center mb-4'>
                <div>
                  <p className='text-base sm:text-lg font-semibold text-gray-800'>{t('hospital.dashboard.recentPatients')}</p>
                  <p className='text-xs sm:text-sm text-gray-500'>{patients?.length || 0} {t('hospital.dashboard.totalPatients')}</p>
                </div>
              </div>
              <div className='space-y-3'>
                {patients?.slice(0, 5).map((patient, index) => (
                  <div key={index} className='flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all'>
                    <div className='w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0'>
                      <svg className='w-5 h-5 text-emerald-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                      </svg>
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-gray-800 truncate'>{patient.name}</p>
                      <p className='text-xs text-gray-500 truncate'>{patient.email}</p>
                    </div>
                  </div>
                ))}
                {(!patients || patients.length === 0) && (
                  <p className='text-sm text-gray-500 text-center py-4'>{t('hospital.dashboard.noPatients')}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className='w-full lg:w-80 space-y-4 sm:space-y-6'>
          {/* Hospital Info Card */}
          <div className='bg-white rounded-xl p-4 sm:p-6 shadow-sm'>
            <div className='flex items-center justify-between mb-4'>
              <p className='text-base sm:text-lg font-semibold text-gray-800'>{t('hospital.dashboard.hospitalInformation')}</p>
            </div>
            <div className='space-y-3'>
              <div>
                <p className='text-xs text-gray-500 mb-1'>{t('hospital.dashboard.status')}</p>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${hospital?.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                  hospital?.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                  {hospital?.status || 'Unknown'}
                </span>
              </div>
              {hospital?.address && (
                <div>
                  <p className='text-xs text-gray-500 mb-1'>{t('hospital.dashboard.address')}</p>
                  <p className='text-sm text-gray-800 break-words'>{hospital.address.line1}, {hospital.address.city}</p>
                </div>
              )}
              {hospital?.phone && (
                <div>
                  <p className='text-xs text-gray-500 mb-1'>{t('hospital.dashboard.phone')}</p>
                  <p className='text-sm text-gray-800'>{hospital.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className='bg-white rounded-xl p-4 sm:p-6 shadow-sm'>
            <p className='text-base sm:text-lg font-semibold text-gray-800 mb-4'>{t('hospital.dashboard.quickActions')}</p>
            <div className='space-y-2'>
              <button
                onClick={() => navigate('/hospital-dashboard/doctors')}
                className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors'
              >
                {t('hospital.dashboard.addNewDoctor')}
              </button>
              <button
                onClick={() => navigate('/hospital-dashboard/transfers')}
                className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors'
              >
                {t('hospital.dashboard.createTransfer')}
              </button>
              <button
                onClick={() => navigate('/hospital-dashboard/reports')}
                className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors'
              >
                {t('hospital.dashboard.viewReportsAction')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboardMain;

