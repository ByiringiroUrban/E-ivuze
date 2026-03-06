import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LabContext } from '../context/LabContext';
import { assets } from '../assets/assets';
import { useSidebar } from '../hooks/useSidebar';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes, FaBell, FaRobot } from 'react-icons/fa';
import LanguageSwitch from './LanguageSwitch';
import AppBarSearch from './AppBarSearch';

const LabNavBar = () => {
    const navigate = useNavigate();
    const { lToken, setLToken } = useContext(LabContext);
    const { isOpen, toggle } = useSidebar();

    const handleLogout = () => {
        navigate('/');
        setLToken('');
        localStorage.removeItem('lToken');
    };

    return (
        <div className='sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm'>
            <div className='flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3'>
                {/* Left: Logo & Menu Toggle */}
                <div className='flex items-center gap-4'>
                    <button
                        onClick={toggle}
                        className='p-2 rounded-lg hover:bg-gray-100 transition-colors'
                        aria-label="Toggle sidebar"
                    >
                        {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                    </button>
                    <img
                        src={assets.logo}
                        alt="OneHealth"
                        className='w-8 h-8 object-contain cursor-pointer'
                        onClick={() => navigate('/lab-dashboard')}
                    />
                    <span className='hidden sm:block text-lg font-semibold text-gray-800'>
                        Lab Portal
                    </span>
                </div>

                {/* Right: Language, AI Help Center, Search, Notifications & Profile */}
                <div className='flex items-center gap-4'>
                    <LanguageSwitch variant="headerIconLight" />
                    <Link
                        to="/ai-assistant"
                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 text-gray-700 transition-colors"
                        title="AI Help Center"
                        aria-label="AI Help Center"
                    >
                        <FaRobot className="w-5 h-5" />
                    </Link>
                    <AppBarSearch variant="light" />
                    {/* Notifications */}
                    <button className='relative p-2 rounded-lg hover:bg-gray-100 transition-colors'>
                        <FaBell size={20} className='text-gray-600' />
                        <span className='absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full'></span>
                    </button>

                    {/* Profile Dropdown */}
                    <div className='flex items-center gap-3'>
                        <div className='hidden md:block text-right'>
                            <p className='text-sm font-medium text-gray-800'>Diagnostic Center</p>
                            <p className='text-xs text-gray-500'>Lab Portal</p>
                        </div>
                        <button
                            onClick={() => navigate('/lab-profile')}
                            className='w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center hover:bg-purple-200 transition-colors'
                        >
                            <span className='text-purple-600 font-semibold text-sm'>LAB</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LabNavBar;
