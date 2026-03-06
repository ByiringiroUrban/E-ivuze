import React, { useContext, useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { AdminContext } from "../context/AdminContext";
import { useNavigate } from "react-router-dom";
import { DoctorContext } from "../context/DoctorContext";
import NotificationBell from "./NotificationBell";
import DoctorNotificationBell from "./DoctorNotificationBell";
import MessageIcon from './MessageIcon';
import AddPatientModal from "./AddPatientModal";
import { useTranslation } from "react-i18next";
import { useSidebar } from "../hooks/useSidebar";
import { Link } from "react-router-dom";
import { FaRobot } from "react-icons/fa";
import LanguageSwitch from "./LanguageSwitch";
import AppBarSearch from "./AppBarSearch";

const AdminNavBar = () => {
  const { aToken, setAToken } = useContext(AdminContext);
  const { dToken, setDToken, profileData, getProfileData } = useContext(DoctorContext);
  const navigate = useNavigate()
  const { t } = useTranslation();
  const { toggle: toggleSidebar, isOpen: sidebarOpen } = useSidebar();
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    if (dToken && !profileData) {
      getProfileData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dToken])

  const logout = () => {
    navigate('/')
    aToken && setAToken('')
    aToken && localStorage.removeItem('aToken')
    dToken && setDToken('')
    dToken && localStorage.removeItem('dToken')
  }

  const displayName = aToken ? t('roles.admin') : (profileData?.name || t('roles.doctor'))
  const displayImage = aToken ? null : (profileData?.image || '')

  return (
    <>
      <div className="flex justify-between items-center px-4 sm:px-6 py-4 border-b border-border bg-[#022c22] text-white relative z-20">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Sidebar Toggle Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              console.log('Toggle button clicked, current state:', sidebarOpen);
              toggleSidebar();
            }}
            className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all z-30 relative"
            aria-label={t('nav.toggleSidebar') || 'Toggle sidebar'}
            type="button"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {sidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          {/* Logo for small devices, text for larger */}
          <img
            src={assets.logo}
            alt="Logo"
            className="w-8 h-8 sm:hidden object-contain"
          />
          <p className="text-xs sm:text-sm text-white/70 hidden sm:block">{t('app.welcome')} {displayName},</p>
          <p className="text-lg sm:text-xl font-semibold hidden sm:block">{t('app.title')}</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitch variant="headerIcon" />
          {(dToken || aToken) && (
            <div className="hidden sm:flex items-center gap-3">
              <Link
                to="/ai-assistant"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 text-white transition-all"
                title={t('ai.helpCenter') || 'AI Help Center'}
                aria-label={t('ai.helpCenter') || 'AI Help Center'}
              >
                <FaRobot className="w-5 h-5" />
              </Link>
              <AppBarSearch variant="dark" />
              <MessageIcon />
              {dToken ? <DoctorNotificationBell /> : <NotificationBell />}
            </div>
          )}

          {/* Add Patient Icon (Plus Sign) - hidden on small devices */}
          {dToken && (
            <div className="hidden sm:block">
              <div
                onClick={() => setShowAddPatient(true)}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all"
                title={t('modals.addPatientTitle')}
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
          )}

          {/* Profile Dropdown */}
          <div className="relative">
            <div
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-1 sm:gap-2 cursor-pointer hover:bg-white/10 p-1 sm:p-2 rounded-lg transition-all"
            >
              {displayImage ? (
                <img
                  src={displayImage}
                  alt={displayName}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white/40"
                />
              ) : (
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center border-2 border-white/30">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              <span className="text-xs sm:text-sm font-medium text-white hidden md:block">{displayName}</span>
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white/70 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[100]">
                <button
                  onClick={() => {
                    navigate('/');
                    setShowProfileDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    {t('nav.home')}
                  </div>
                </button>
                {dToken && (
                  <button
                    onClick={() => {
                      navigate('/doctor-profile');
                      setShowProfileDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {t('nav.profile')}
                    </div>
                  </button>
                )}
                <hr className="my-1" />
                <button
                  onClick={() => {
                    logout();
                    setShowProfileDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {t('nav.logout')}
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Patient Modal */}
      {showAddPatient && dToken && (
        <AddPatientModal onClose={() => setShowAddPatient(false)} />
      )}

      {/* Click outside to close dropdown */}
      {showProfileDropdown && (
        <div
          className="fixed inset-0 z-[90]"
          onClick={() => setShowProfileDropdown(false)}
        />
      )}
    </>
  );
};

export default AdminNavBar;

