import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import { HospitalContext } from '../context/HospitalContext';
import { useTranslation } from 'react-i18next';
import { useSidebar } from '../hooks/useSidebar';

const HospitalSideBar = () => {
    const navigate = useNavigate();
    const { hToken, setHToken, logoutHospital } = useContext(HospitalContext);
    const { t } = useTranslation();
    const { isOpen } = useSidebar();

    const handleLogout = () => {
        logoutHospital();
        navigate('/login');
    };

    return (
        <div className={`sticky top-[65px] min-h-[calc(100vh-65px)] h-full bg-[#064e3b] text-white flex flex-col items-center md:items-start overflow-y-auto transition-all duration-300 ${isOpen
            ? 'w-16 sm:w-20 md:w-64 py-3 sm:py-4 md:py-6 border-r border-border'
            : 'w-0 py-0 overflow-hidden border-r-0'
            }`}>
            {isOpen && (
                <>
                    <div className='mb-4 sm:mb-6 md:mb-8 w-full flex justify-center md:justify-start md:px-4'>
                        <img src={assets.logo} alt="E-ivuze" className='w-10 h-10 object-contain hidden md:block' />
                        <div className='grid grid-cols-3 gap-1 md:hidden'>
                            {[...Array(9)].map((_, i) => (
                                <div key={i} className={`w-2 h-2 rounded ${i === 4 ? 'bg-white' : 'bg-white/30'}`}></div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Icons */}
                    {hToken && (
                        <ul className='flex flex-col gap-2 sm:gap-3 md:gap-3 w-full items-center md:items-start md:px-4'>
                            <NavLink
                                className={({ isActive }) => `w-10 h-10 sm:w-12 sm:h-12 md:w-full md:h-auto md:px-4 md:py-3 rounded-md flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-all ${isActive ? 'bg-white text-[#064e3b]' : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'}`}
                                to={'/hospital-dashboard/'}
                                end
                            >
                                <img src={assets.home_icon} alt="" className='w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0' />
                                <span className='hidden md:block text-sm font-medium'>{t('hospital.sidebar.dashboard') || 'Dashboard'}</span>
                            </NavLink>

                            <NavLink
                                className={({ isActive }) => `w-10 h-10 sm:w-12 sm:h-12 md:w-full md:h-auto md:px-4 md:py-3 rounded-md flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-all ${isActive ? 'bg-white text-[#064e3b]' : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'}`}
                                to={'/hospital-dashboard/doctors'}
                            >
                                <img src={assets.appointment_icon} alt="" className='w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0' />
                                <span className='hidden md:block text-sm font-medium'>{t('hospital.sidebar.doctors') || 'Doctors'}</span>
                            </NavLink>

                            <NavLink
                                className={({ isActive }) => `w-10 h-10 sm:w-12 sm:h-12 md:w-full md:h-auto md:px-4 md:py-3 rounded-md flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-all ${isActive ? 'bg-white text-[#064e3b]' : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'}`}
                                to={'/hospital-dashboard/patients'}
                            >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span className='hidden md:block text-sm font-medium'>{t('hospital.sidebar.patients') || 'Patients'}</span>
                            </NavLink>

                            <NavLink
                                className={({ isActive }) => `w-10 h-10 sm:w-12 sm:h-12 md:w-full md:h-auto md:px-4 md:py-3 rounded-md flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-all ${isActive ? 'bg-white text-[#064e3b]' : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'}`}
                                to={'/hospital-dashboard/transfers'}
                            >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                                <span className='hidden md:block text-sm font-medium'>{t('hospital.sidebar.transfers') || 'Transfers'}</span>
                            </NavLink>

                            <NavLink
                                className={({ isActive }) => `w-10 h-10 sm:w-12 sm:h-12 md:w-full md:h-auto md:px-4 md:py-3 rounded-md flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-all ${isActive ? 'bg-white text-[#064e3b]' : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'}`}
                                to={'/hospital-dashboard/reports'}
                            >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-8 0h8m-8 0H7a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2" />
                                </svg>
                                <span className='hidden md:block text-sm font-medium'>{t('hospital.sidebar.reports') || 'Reports'}</span>
                            </NavLink>

                            <NavLink
                                className={({ isActive }) => `w-10 h-10 sm:w-12 sm:h-12 md:w-full md:h-auto md:px-4 md:py-3 rounded-md flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-all ${isActive ? 'bg-white text-[#064e3b]' : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'}`}
                                to={'/hospital-dashboard/settings'}
                            >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className='hidden md:block text-sm font-medium'>{t('nav.settings') || 'Settings'}</span>
                            </NavLink>

                            <button
                                onClick={handleLogout}
                                className='w-10 h-10 sm:w-12 sm:h-12 md:w-full md:h-auto md:px-4 md:py-3 rounded-md flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-all bg-white/10 text-white border border-white/20 hover:bg-red-500/20'
                            >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span className='hidden md:block text-sm font-medium'>{t('nav.logout')}</span>
                            </button>
                        </ul>
                    )}
                </>
            )}
        </div>
    );
};

export default HospitalSideBar;
