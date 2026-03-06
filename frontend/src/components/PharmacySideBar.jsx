import React, { useContext } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSidebar } from "../hooks/useSidebar";
import { PharmacyContext } from "../context/PharmacyContext";
import {
    FaHome,
    FaBox,
    FaShoppingCart,
    FaChartLine,
    FaCog,
    FaUserMd,
    FaHospital,
    FaUsers,
    FaSignOutAlt
} from "react-icons/fa";

const PharmacySideBar = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const { isOpen } = useSidebar();
    const { logoutPharmacy } = useContext(PharmacyContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logoutPharmacy();
        navigate('/login');
    };

    const menuItems = [
        {
            path: '/pharmacy-dashboard',
            icon: FaHome,
            label: t('pharmacy.sidebar.dashboard') || 'Dashboard'
        },
        {
            path: '/pharmacy-inventory',
            icon: FaBox,
            label: t('pharmacy.sidebar.inventory') || 'Inventory'
        },
        {
            path: '/pharmacy-orders',
            icon: FaShoppingCart,
            label: t('pharmacy.sidebar.orders') || 'Orders'
        },
        {
            path: '/pharmacy-reports',
            icon: FaChartLine,
            label: t('pharmacy.sidebar.reports') || 'Reports'
        },
        {
            path: '/pharmacy-impersonate',
            icon: FaUsers,
            label: t('pharmacy.sidebar.impersonate') || 'Impersonate User',
            divider: true
        },
        {
            path: '/pharmacy-settings',
            icon: FaCog,
            label: t('pharmacy.sidebar.settings') || 'Settings',
            divider: true
        }
    ];

    return (
        <div className={`bg-[#064e3b] text-white sticky top-[65px] min-h-[calc(100vh-65px)] h-full overflow-y-auto transition-all duration-300 ${isOpen
            ? 'w-64 border-r border-white/5'
            : 'w-0 overflow-hidden border-r-0'
            }`}>
            {isOpen && (
                <div className="p-4 space-y-6">
                    <nav className="space-y-2">
                        {menuItems.map((item, index) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path ||
                                (item.path !== '/pharmacy-dashboard' && location.pathname.startsWith(item.path));

                            return (
                                <React.Fragment key={item.path}>
                                    {item.divider && index > 0 && (
                                        <div className="my-4 border-t border-white/10"></div>
                                    )}
                                    <NavLink
                                        to={item.path}
                                        className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg   text-[11px] tracking-[0.25em] transition-colors
                    ${isActive
                                                ? 'bg-white/10 text-white font-medium border border-white/30'
                                                : 'text-white/70 hover:bg-white/5'
                                            }
                  `}
                                    >
                                        <Icon className="text-lg" />
                                        <span>{item.label}</span>
                                    </NavLink>
                                </React.Fragment>
                            );
                        })}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg   text-[11px] tracking-[0.25em] transition-colors text-white/70 hover:bg-red-500/20 hover:text-white border border-transparent hover:border-red-500/30"
                        >
                            <FaSignOutAlt className="text-lg" />
                            <span>{t('nav.logout')}</span>
                        </button>
                    </nav>
                </div>
            )}
        </div>
    );
};

export default PharmacySideBar;
