import React, { useContext, useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { PharmacyContext } from "../context/PharmacyContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSidebar } from "../hooks/useSidebar";
import { Link } from 'react-router-dom';
import { FaSignOutAlt, FaUser, FaRobot } from "react-icons/fa";
import MessageIcon from './MessageIcon';
import LanguageSwitch from './LanguageSwitch';
import AppBarSearch from './AppBarSearch';

const PharmacyNavBar = () => {
  const { pToken, pharmacyUser, pharmacy, logoutPharmacy, getProfile } = useContext(PharmacyContext);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toggle: toggleSidebar, isOpen: sidebarOpen } = useSidebar();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    if (pToken && !pharmacy) {
      getProfile();
    }
  }, [pToken]);

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
    logoutPharmacy();
    navigate('/');
  };

  return (
    <div className="bg-[#0f1f33] text-white border-b border-white/10 relative z-20">
      <div className="px-4 sm:px-6 py-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
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
          <img src={assets.logo} alt="Logo" className="w-8 h-8 object-contain" />
          <div>
            <p className="text-[11px]   tracking-[0.4em] text-white/60">
              {t('pharmacy.navbar.eyebrow') || 'Pharmacy Control'}
            </p>
            <h1 className="text-lg sm:text-xl font-semibold">
              {pharmacy?.name || pharmacyUser?.pharmacyName || 'Pharmacy Dashboard'}
            </h1>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3 sm:gap-4">
          <LanguageSwitch variant="headerIcon" />
          {pToken && (
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
          <div className="relative profile-dropdown">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-2 px-3 py-2 border border-white/30 text-xs   tracking-[0.3em] hover:bg-white/10 transition"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <FaUser />
              </div>
              <span className="hidden md:block">
                {pharmacyUser?.name || 'Pharmacy Admin'}
              </span>
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-52 bg-white text-accent roun-lg shadow-2xl border border-border py-2 z-50">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold">{pharmacyUser?.name}</p>
                  <p className="text-xs text-muted-foreground">{pharmacyUser?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <FaSignOutAlt />
                  {t('pharmacy.navbar.logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyNavBar;

