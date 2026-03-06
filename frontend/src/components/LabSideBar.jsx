import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LabContext } from '../context/LabContext';
import { useSidebar } from '../hooks/useSidebar';
import { useTranslation } from 'react-i18next';
import { FaEnvelope } from 'react-icons/fa';
import { assets } from '../assets/assets';

const LabSideBar = () => {
    const navigate = useNavigate();
    const { lToken, setLToken } = useContext(LabContext);
    const { t } = useTranslation();
    const { isOpen } = useSidebar();

    const handleLogout = () => {
        navigate('/');
        setLToken('');
        localStorage.removeItem('lToken');
    };

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

            {isOpen ? (
                <ul className='flex flex-col gap-2 sm:gap-3 md:gap-3 w-full items-center md:items-start md:px-4'>
                    <NavLink
                        className={({ isActive }) => `w-10 h-10 sm:w-12 sm:h-12 md:w-full md:h-auto md:px-4 md:py-3 rounded-none flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-all ${isActive ? 'bg-white text-[#064e3b]' : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'
                            }`}
                        to={'/lab-dashboard'}
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className='hidden md:block text-sm font-medium'>{t('lab.dashboard') || 'Dashboard'}</span>
                    </NavLink>

                    <NavLink
                        className={({ isActive }) => `w-10 h-10 sm:w-12 sm:h-12 md:w-full md:h-auto md:px-4 md:py-3 rounded-none flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-all ${isActive ? 'bg-white text-[#064e3b]' : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'
                            }`}
                        to={'/lab-orders'}
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        <span className='hidden md:block text-sm font-medium'>{t('lab.orders') || 'Test Orders'}</span>
                    </NavLink>

                    <NavLink
                        className={({ isActive }) => `w-10 h-10 sm:w-12 sm:h-12 md:w-full md:h-auto md:px-4 md:py-3 rounded-none flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-all ${isActive ? 'bg-white text-[#064e3b]' : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'
                            }`}
                        to={'/lab-results'}
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className='hidden md:block text-sm font-medium'>{t('lab.results') || 'Results'}</span>
                    </NavLink>

                    <NavLink
                        className={({ isActive }) => `w-10 h-10 sm:w-12 sm:h-12 md:w-full md:h-auto md:px-4 md:py-3 rounded-none flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-all ${isActive ? 'bg-white text-[#064e3b]' : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'
                            }`}
                        to={'/lab-messages'}
                    >
                        <FaEnvelope className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" />
                        <span className='hidden md:block text-sm font-medium'>{t('lab.messages') || 'Messages'}</span>
                    </NavLink>


                    <NavLink
                        className={({ isActive }) => `w-10 h-10 sm:w-12 sm:h-12 md:w-full md:h-auto md:px-4 md:py-3 rounded-none flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-all ${isActive ? 'bg-white text-[#064e3b]' : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'
                            }`}
                        to={'/lab-profile'}
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className='hidden md:block text-sm font-medium'>{t('lab.profile') || 'Profile'}</span>
                    </NavLink>

                    <NavLink
                        className={({ isActive }) => `w-10 h-10 sm:w-12 sm:h-12 md:w-full md:h-auto md:px-4 md:py-3 rounded-none flex items-center justify-center md:justify-start gap-2 md:gap-3 transition-all ${isActive ? 'bg-white text-[#064e3b]' : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'
                            }`}
                        to={'/lab-settings'}
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className='hidden md:block text-sm font-medium'>{t('nav.settings') || 'Settings'}</span>
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
            ) : (
                <div className='flex flex-col gap-2 items-center w-full px-2'>
                    <NavLink to='/lab-dashboard' className='w-10 h-10 rounded-none flex items-center justify-center bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'>
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                    </NavLink>
                    <NavLink to='/lab-orders' className='w-10 h-10 rounded-none flex items-center justify-center bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'>
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                    </NavLink>
                </div>
            )}
        </div>
    );
};

export default LabSideBar;
