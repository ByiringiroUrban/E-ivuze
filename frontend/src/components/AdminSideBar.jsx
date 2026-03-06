import React, { useContext } from 'react'
import { AdminContext } from '../context/AdminContext'
import { NavLink, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { DoctorContext } from '../context/DoctorContext'
import IconTexture from './IconTexture'
import { useTranslation } from 'react-i18next'
import { useSidebar } from '../hooks/useSidebar'

const AdminSideBar = () => {
  const navigate = useNavigate()
  const { aToken, setAToken } = useContext(AdminContext)
  const { dToken, setDToken } = useContext(DoctorContext)
  const { t } = useTranslation()
  const { isOpen } = useSidebar()

  const handleLogout = () => {
    navigate('/')
    aToken && setAToken('')
    aToken && localStorage.removeItem('aToken')
    dToken && setDToken('')
    dToken && localStorage.removeItem('dToken')
  }

  // Always render sidebar - it should be visible by default
  return (
    <div
      className={`sticky top-[65px] min-h-[calc(100vh-65px)] h-full bg-[#064e3b] text-white flex flex-col items-center md:items-start overflow-y-auto transition-all duration-300 ${isOpen
        ? 'w-16 sm:w-20 md:w-64 py-3 sm:py-4 md:py-6 border-r border-border'
        : 'w-16 sm:w-20 py-3 sm:py-4 border-r border-border'
        }`}
    >
      <div className='mb-4 sm:mb-6 md:mb-8 w-full flex justify-center md:justify-start md:px-4'>
        {isOpen ? (
          <>
            <img src={assets.logo} alt="E-ivuze" className='w-10 h-10 object-contain hidden md:block' />
            <div className='grid grid-cols-3 gap-1 md:hidden'>
              {[...Array(9)].map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-none ${i === 4 ? 'bg-white' : 'bg-white/30'}`}></div>
              ))}
            </div>
          </>
        ) : (
          <div className='grid grid-cols-3 gap-1'>
            {[...Array(9)].map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-none ${i === 4 ? 'bg-white' : 'bg-white/30'}`}></div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Icons - Circular with primary background */}
      {isOpen ? (
        <>
          {aToken ? (
            <ul className='flex flex-col gap-2 sm:gap-3 md:gap-3 w-full items-center md:items-start md:px-4'>
              <NavLink
                className={({ isActive }) => `w-10 h-10 sm:w-12 sm:h-12 md:w-full md:h-auto md:px-4 md:py-3 rounded-md flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-all ${isActive ? 'bg-white text-[#064e3b]' : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'}`}
                to={'/admin-dashboard'}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className='hidden md:block text-sm font-medium'>{t('admin.dashboard')}</span>
              </NavLink>

              <NavLink
                className={({ isActive }) => `w-10 h-10 sm:w-12 sm:h-12 md:w-full md:h-auto md:px-4 md:py-3 rounded-md flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-all ${isActive ? 'bg-white text-[#064e3b]' : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'}`}
                to={'/admin-ai-knowledge'}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h9" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                <span className='hidden md:block text-sm font-medium'>AI Knowledge</span>
              </NavLink>

              <NavLink
                className={({ isActive }) => `w-10 h-10 sm:w-12 sm:h-12 md:w-full md:h-auto md:px-4 md:py-3 rounded-none flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-all ${isActive ? 'bg-white text-[#064e3b]' : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'}`}
                to={'/all-appointments'}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className='hidden md:block text-sm font-medium'>{t('admin.allAppointments.title') || t('admin.allAppointmentsTitle') || 'All Appointments'}</span>
              </NavLink>

              <NavLink
                className={({ isActive }) => `w-10 h-10 sm:w-12 sm:h-12 md:w-full md:h-auto md:px-4 md:py-3 rounded-none flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-all ${isActive ? 'bg-white text-[#064e3b]' : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'}`}
                to={'/add-doctor'}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className='hidden md:block text-sm font-medium'>{t('admin.addDoctor')}</span>
              </NavLink>

              <NavLink
                className={({ isActive }) => `w-10 h-10 sm:w-12 sm:h-12 md:w-full md:h-auto md:px-4 md:py-3 rounded-none flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-all ${isActive ? 'bg-white text-[#064e3b]' : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'}`}
                to={'/doctor-list'}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className='hidden md:block text-sm font-medium'>{t('admin.doctorsList.title') || t('admin.doctorsListTitle') || 'Doctors List'}</span>
              </NavLink>

              <NavLink
                className={({ isActive }) => `w-10 h-10 sm:w-12 sm:h-12 md:w-full md:h-auto md:px-4 md:py-3 rounded-none flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-all ${isActive ? 'bg-white text-[#064e3b]' : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'}`}
                to={'/manage-users'}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className='hidden md:block text-sm font-medium'>{t('admin.manageUsers') || 'Manage Users'}</span>
              </NavLink>

              <NavLink
                className={({ isActive }) => `w-10 h-10 sm:w-12 sm:h-12 md:w-full md:h-auto md:px-4 md:py-3 rounded-none flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-all ${isActive ? 'bg-white text-[#064e3b]' : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'}`}
                to={'/payment-approvals'}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className='hidden md:block text-sm font-medium'>{t('admin.paymentApprovals.title') || t('admin.paymentApprovalsTitle') || 'Payment Approvals'}</span>
              </NavLink>

              <NavLink
                className={({ isActive }) => `w-10 h-10 sm:w-12 sm:h-12 md:w-full md:h-auto md:px-4 md:py-3 rounded-none flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-all ${isActive ? 'bg-white text-[#064e3b]' : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'}`}
                to={'/hospital-approvals'}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className='hidden md:block text-sm font-medium'>{t('admin.hospitalApprovals.title') || t('admin.hospitalApprovals.hero') || 'Hospital Approvals'}</span>
              </NavLink>

              <NavLink
                className={({ isActive }) => `w-10 h-10 sm:w-12 sm:h-12 md:w-full md:h-auto md:px-4 md:py-3 rounded-none flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-all ${isActive ? 'bg-white text-[#064e3b]' : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'}`}
                to={'/doctor-approvals'}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className='hidden md:block text-sm font-medium'>{t('admin.nav.doctor_approvals') || t('admin.doctorApprovals.title') || 'Doctor Approvals'}</span>
              </NavLink>

              <NavLink
                className={({ isActive }) => `w-10 h-10 sm:w-12 sm:h-12 md:w-full md:h-auto md:px-4 md:py-3 rounded-none flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-all ${isActive ? 'bg-white text-[#064e3b]' : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'}`}
                to={'/hospital-trials'}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className='hidden md:block text-sm font-medium'>{t('admin.hospitalTrials.title') || 'Hospital Trials'}</span>
              </NavLink>

              <NavLink
                className={({ isActive }) => `w-10 h-10 sm:w-12 sm:h-12 md:w-full md:h-auto md:px-4 md:py-3 rounded-none flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-all ${isActive ? 'bg-white text-[#064e3b]' : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'}`}
                to={'/hospital-register'}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className='hidden md:block text-sm font-medium'>{t('admin.registerHospital') || 'Register Hospital'}</span>
              </NavLink>

              <NavLink
                className={({ isActive }) => `w-10 h-10 sm:w-12 sm:h-12 md:w-full md:h-auto md:px-4 md:py-3 rounded-none flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-all ${isActive ? 'bg-white text-[#064e3b]' : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'}`}
                to={'/pharmacy-management'}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <span className='hidden md:block text-sm font-medium'>{t('admin.pharmacyManagement.title') || 'Pharmacy Management'}</span>
              </NavLink>

              <NavLink
                className={({ isActive }) => `w-10 h-10 sm:w-12 sm:h-12 md:w-full md:h-auto md:px-4 md:py-3 rounded-none flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-all ${isActive ? 'bg-white text-[#064e3b]' : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'}`}
                to={'/lab-management'}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <span className='hidden md:block text-sm font-medium'>{t('admin.labManagement.title') || 'Lab Management'}</span>
              </NavLink>

              <NavLink
                className={({ isActive }) => `w-10 h-10 sm:w-12 sm:h-12 md:w-full md:h-auto md:px-4 md:py-3 rounded-none flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-all ${isActive ? 'bg-white text-[#064e3b]' : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'}`}
                to={'/announcements'}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
                <span className='hidden md:block text-sm font-medium'>{t('admin.announcements.title') || 'Announcements'}</span>
              </NavLink>

              <NavLink
                className={({ isActive }) => `w-10 h-10 sm:w-12 sm:h-12 md:w-full md:h-auto md:px-4 md:py-3 rounded-none flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-all ${isActive ? 'bg-white text-[#064e3b]' : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'}`}
                to={'/email-management'}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className='hidden md:block text-sm font-medium'>Email Management</span>
              </NavLink>

              <NavLink
                className={({ isActive }) => `w-10 h-10 sm:w-12 sm:h-12 md:w-full md:h-auto md:px-4 md:py-3 rounded-none flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-all ${isActive ? 'bg-white text-[#064e3b]' : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'}`}
                to={'/settings'}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className='hidden md:block text-sm font-medium'>{t('nav.settings')}</span>
              </NavLink>

              <button
                onClick={handleLogout}
                className='w-10 h-10 sm:w-12 sm:h-12 md:w-full md:h-auto md:px-4 md:py-3 rounded-none flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-all bg-white/10 text-white border border-white/20 hover:bg-red-500/20'
              >
                <svg className='w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
                </svg>
                <span className='hidden md:block text-sm font-medium'>{t('nav.logout')}</span>
              </button>
            </ul>
          ) : null}

          {dToken ? (
            <ul className='flex flex-col gap-2 sm:gap-3 md:gap-3 w-full items-center md:items-start md:px-4'>
              <NavLink
                className={({ isActive }) => `w-10 h-10 sm:w-12 sm:h-12 md:w-full md:h-auto md:px-4 md:py-3 rounded-none flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-all ${isActive ? 'bg-white text-[#064e3b]' : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'}`}
                to={'/'}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className='hidden md:block text-sm font-medium'>{t('doctor.dashboard')}</span>
              </NavLink>

              <NavLink
                className={({ isActive }) => `w-10 h-10 sm:w-12 sm:h-12 md:w-full md:h-auto md:px-4 md:py-3 rounded-none flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-all ${isActive ? 'bg-white text-[#064e3b]' : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'}`}
                to={'/doctor-appointments'}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className='hidden md:block text-sm font-medium'>{t('doctor.appointments')}</span>
              </NavLink>

              <NavLink
                className={({ isActive }) => `w-10 h-10 sm:w-12 sm:h-12 md:w-full md:h-auto md:px-4 md:py-3 rounded-none flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-all ${isActive ? 'bg-white text-[#064e3b]' : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'}`}
                to={'/doctor-calendar'}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className='hidden md:block text-sm font-medium'>{t('doctor.calendar') || 'Calendar'}</span>
              </NavLink>

              <NavLink
                className={({ isActive }) => `w-10 h-10 sm:w-12 sm:h-12 md:w-full md:h-auto md:px-4 md:py-3 rounded-none flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-all ${isActive ? 'bg-white text-[#064e3b]' : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'}`}
                to={'/doctor-profile'}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className='hidden md:block text-sm font-medium'>{t('doctor.profile')}</span>
              </NavLink>

              <NavLink
                className={({ isActive }) => `w-10 h-10 sm:w-12 sm:h-12 md:w-full md:h-auto md:px-4 md:py-3 rounded-none flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-all ${isActive ? 'bg-white text-[#064e3b]' : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'}`}
                to={'/prescriptions'}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className='hidden md:block text-sm font-medium'>{t('doctor.prescriptions')}</span>
              </NavLink>

              <NavLink
                className={({ isActive }) => `w-10 h-10 sm:w-12 sm:h-12 md:w-full md:h-auto md:px-4 md:py-3 rounded-none flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-all ${isActive ? 'bg-white text-[#064e3b]' : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'}`}
                to={'/records'}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className='hidden md:block text-sm font-medium'>{t('doctor.records')}</span>
              </NavLink>

              <NavLink
                className={({ isActive }) => `w-10 h-10 sm:w-12 sm:h-12 md:w-full md:h-auto md:px-4 md:py-3 rounded-none flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-all ${isActive ? 'bg-white text-[#064e3b]' : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'}`}
                to={'/patients'}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className='hidden md:block text-sm font-medium'>{t('doctor.patients')}</span>
              </NavLink>

              <NavLink
                className={({ isActive }) => `w-10 h-10 sm:w-12 sm:h-12 md:w-full md:h-auto md:px-4 md:py-3 rounded-none flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-all ${isActive ? 'bg-white text-[#064e3b]' : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'}`}
                to={'/lab-results'}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <span className='hidden md:block text-sm font-medium'>Lab Results</span>
              </NavLink>

              <NavLink
                className={({ isActive }) => `w-10 h-10 sm:w-12 sm:h-12 md:w-full md:h-auto md:px-4 md:py-3 rounded-none flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-all ${isActive ? 'bg-white text-[#064e3b]' : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'}`}
                to={'/doctor-reports'}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className='hidden md:block text-sm font-medium'>Reports</span>
              </NavLink>

              <button
                onClick={handleLogout}
                className='w-10 h-10 sm:w-12 sm:h-12 md:w-full md:h-auto md:px-4 md:py-3 rounded-none flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-all bg-white/10 text-white border border-white/20 hover:bg-red-500/20'
              >
                <svg className='w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
                </svg>
                <span className='hidden md:block text-sm font-medium'>{t('nav.logout')}</span>
              </button>
            </ul>
          ) : null}
        </>
      ) : (
        // Show minimal icons when closed
        <div className='flex flex-col gap-2 items-center w-full px-2'>
          {aToken && (
            <>
              <NavLink to='/admin-dashboard' className='w-10 h-10 rounded-none flex items-center justify-center bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </NavLink>
              <NavLink to='/all-appointments' className='w-10 h-10 rounded-none flex items-center justify-center bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </NavLink>
            </>
          )}
          {dToken && (
            <>
              <NavLink to='/' className='w-10 h-10 rounded-none flex items-center justify-center bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </NavLink>
              <NavLink to='/doctor-appointments' className='w-10 h-10 rounded-none flex items-center justify-center bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </NavLink>
              <NavLink to='/doctor-calendar' className='w-10 h-10 rounded-none flex items-center justify-center bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </NavLink>
              <NavLink to='/doctor-reports' className='w-10 h-10 rounded-none flex items-center justify-center bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </NavLink>
              <NavLink to='/lab-results' className='w-10 h-10 rounded-none flex items-center justify-center bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </NavLink>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminSideBar
