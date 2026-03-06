import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LabContext } from '../context/LabContext';
import { useSidebar } from '../hooks/useSidebar';
import { useTranslation } from 'react-i18next';
import { FaHome, FaFlask, FaClipboardCheck, FaEnvelope, FaUserCircle, FaCog, FaSignOutAlt } from 'react-icons/fa';
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

    const menuItems = [
        { to: '/lab-dashboard', icon: <FaHome />, label: t('lab.dashboard') || 'Dashboard', end: true },
        { to: '/lab-orders', icon: <FaFlask />, label: t('lab.orders') || 'Test Orders' },
        { to: '/lab-results', icon: <FaClipboardCheck />, label: t('lab.results') || 'Results' },
        { to: '/lab-messages', icon: <FaEnvelope />, label: t('lab.messages') || 'Messages' },
        { to: '/lab-profile', icon: <FaUserCircle />, label: t('lab.profile') || 'Profile' },
        { to: '/lab-settings', icon: <FaCog />, label: t('nav.settings') || 'Settings' },
    ];

    if (!lToken) return null;

    return (
        <div
            className={`relative h-full bg-[#064e3b] text-white flex flex-col transition-all duration-300 ease-in-out border-r border-[#ffffff10] z-[40] ${isOpen ? 'w-64' : 'w-20'
                }`}
        >
            {/* Sidebar Header / Logo Section */}
            <div className={`flex items-center h-16 px-4 border-b border-[#ffffff10] ${!isOpen && 'justify-center'}`}>
                {isOpen ? (
                    <div className="flex items-center gap-3">
                        <img src={assets.logo} alt="Logo" className="w-8 h-8 object-contain" />
                        <span className="font-bold text-lg tracking-tight uppercase whitespace-nowrap overflow-hidden">LABORATORY</span>
                    </div>
                ) : (
                    <img src={assets.logo} alt="Logo" className="w-8 h-8 object-contain" />
                )}
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
                <ul className="space-y-1 px-3">
                    {menuItems.map((item) => (
                        <li key={item.to}>
                            <NavLink
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${isActive
                                        ? 'bg-white text-[#064e3b] shadow-lg'
                                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                                    }`
                                }
                            >
                                <div className={`text-xl flex-shrink-0 ${!isOpen && 'w-full flex justify-center'}`}>
                                    {item.icon}
                                </div>
                                {isOpen && (
                                    <span className="text-sm font-medium whitespace-nowrap overflow-hidden">
                                        {item.label}
                                    </span>
                                )}
                                {/* Tooltip for collapsed state */}
                                {!isOpen && (
                                    <div className="absolute left-full ml-4 px-3 py-2 bg-[#064e3b] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-white/10">
                                        {item.label}
                                    </div>
                                )}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Bottom Actions / Logout */}
            <div className="p-3 border-t border-[#ffffff10]">
                <button
                    onClick={handleLogout}
                    className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-all duration-200 text-white/70 hover:bg-red-500/10 hover:text-red-400 group relative ${!isOpen && 'justify-center'}`}
                >
                    <div className="text-xl flex-shrink-0">
                        <FaSignOutAlt />
                    </div>
                    {isOpen && (
                        <span className="text-sm font-medium whitespace-nowrap overflow-hidden">
                            {t('nav.logout')}
                        </span>
                    )}
                    {!isOpen && (
                        <div className="absolute left-full ml-4 px-3 py-2 bg-red-600 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
                            {t('nav.logout')}
                        </div>
                    )}
                </button>
            </div>
        </div>
    );
};

export default LabSideBar;
