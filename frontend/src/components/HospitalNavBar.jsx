import React, { useContext, useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { HospitalContext } from "../context/HospitalContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSidebar } from "../hooks/useSidebar";
import { Link } from 'react-router-dom';
import { FaRobot } from 'react-icons/fa';
import MessageIcon from './MessageIcon';
import LanguageSwitch from './LanguageSwitch';
import AppBarSearch from './AppBarSearch';

const HospitalNavBar = () => {
  const { hToken, hospital, logoutHospital } = useContext(HospitalContext);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toggle: toggleSidebar, isOpen: sidebarOpen } = useSidebar();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showProfileDropdown]);

  const handleLogout = () => {
    logoutHospital();
    navigate('/');
  };

  return (
    <>
      <div className="flex justify-between items-center px-4 sm:px-6 py-4 border-b border-border bg-[#102438] text-white relative z-20">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Sidebar Toggle Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSidebar();
            }}
            className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all z-30 relative"
            aria-label={t('nav.toggleSidebar') || 'Toggle sidebar'}
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
          <img src={assets.logo} alt="Logo" className="w-8 h-8 sm:hidden" />
          <div className="hidden sm:block">
            <h1 className="text-lg sm:text-xl font-bold">
              {hospital?.name || (t('hospital.nav.dashboardTitle') || 'Hospital Dashboard')}
            </h1>
            <p className="text-xs sm:text-sm text-white/70 hidden md:block">
              {t('hospital.nav.subtitle') || 'Manage your hospital operations'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <LanguageSwitch variant="headerIcon" />
          {hToken && (
            <>
              <Link
                to="/ai-assistant"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 text-white transition-all hidden sm:flex"
                title={t('ai.helpCenter') || 'AI Help Center'}
                aria-label={t('ai.helpCenter') || 'AI Help Center'}
              >
                <FaRobot className="w-5 h-5" />
              </Link>
              <div className="hidden sm:block">
                <AppBarSearch variant="dark" />
              </div>
              <div className="hidden sm:block">
                <MessageIcon />
              </div>
            </>
          )}
          {/* Profile Section */}
          <div className="relative profile-dropdown">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-2 sm:gap-3 hover:bg-white/10 rounded-lg px-2 sm:px-3 py-2 transition-colors"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium">{hospital?.name || 'Hospital'}</p>
                <p className="text-xs text-white/70">{hospital?.status || 'Pending'}</p>
              </div>
              <svg className="w-4 h-4 text-white/70 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button
                  onClick={() => {
                    navigate('/hospital-dashboard/settings');
                    setShowProfileDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {t('nav.settings') || 'Settings'}
                </button>
                <button
                  onClick={() => {
                    navigate('/');
                    setShowProfileDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  {t('nav.home')}
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {t('nav.logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default HospitalNavBar;

