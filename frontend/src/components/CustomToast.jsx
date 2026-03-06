import React from 'react';
import { FaCheck, FaTimes, FaInfo, FaExclamation, FaCommentDots } from 'react-icons/fa';

/**
 * Custom Toast Notification Component
 * Replicates the "Flash Message" bubbly design
 */
const CustomToast = ({ type, title, message, closeToast }) => {
    // Configuration for each type
    const config = {
        success: {
            bg: 'bg-[#2ecc71]', // Green
            darkBg: 'bg-[#27ae60]',
            icon: <FaCheck />,
            defaultTitle: 'Well done!',
            blobColor: 'bg-[#27ae60]'
        },
        error: {
            bg: 'bg-[#205c90]', // OneHealth Blue (previously red)
            darkBg: 'bg-[#14324f]',
            icon: <FaInfo />,
            defaultTitle: 'Attention',
            blobColor: 'bg-[#14324f]'
        },
        warning: {
            bg: 'bg-[#f1c40f]', // Yellow/Orange
            darkBg: 'bg-[#f39c12]',
            icon: <FaExclamation />,
            defaultTitle: 'Warning!',
            blobColor: 'bg-[#f39c12]'
        },
        info: {
            bg: 'bg-[#3498db]', // Blue
            darkBg: 'bg-[#2980b9]',
            icon: <FaInfo />,
            defaultTitle: 'Hi there!',
            blobColor: 'bg-[#2980b9]'
        },
        default: {
            bg: 'bg-[#34495E]', // Dark
            darkBg: 'bg-[#2c3e50]',
            icon: <FaCommentDots />,
            defaultTitle: 'Notification',
            blobColor: 'bg-[#2c3e50]'
        }
    };

    const style = config[type] || config.default;
    const displayTitle = title || style.defaultTitle;

    return (
        <div className={`relative overflow-hidden w-full min-h-[90px] rounded-2xl flex shadow-lg ${style.bg} text-white`}>

            {/* Background Blobs (Decoration) */}
            <div className={`absolute -left-6 -bottom-6 w-24 h-24 rounded-full ${style.blobColor} opacity-50 z-0`}></div>
            <div className={`absolute left-10 -top-6 w-20 h-20 rounded-full ${style.blobColor} opacity-40 z-0`}></div>
            <div className={`absolute left-2 top-10 w-8 h-8 rounded-full ${style.blobColor} opacity-30 z-0`}></div>

            {/* Icon Container - Larger to match design */}
            <div className="relative z-10 w-24 flex items-center justify-center shrink-0 pl-2">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shadow-inner border border-white/10">
                    {style.icon}
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 py-4 pr-8 flex flex-col justify-center">
                <h4 className="font-bold text-lg leading-tight mb-1">
                    {displayTitle}
                </h4>
                <p className="text-sm text-white/90 leading-snug font-medium">
                    {message}
                </p>
            </div>

            {/* Close Button */}
            <button
                onClick={closeToast}
                className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
            >
                <FaTimes size={14} />
            </button>

            {/* Side Curve Effect */}
            <svg className="absolute left-0 top-0 h-full w-24 text-white opacity-5 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 0 C 40 0 60 40 60 50 C 60 60 40 100 0 100 Z" fill="currentColor" />
            </svg>
        </div>
    );
};

export default CustomToast;
