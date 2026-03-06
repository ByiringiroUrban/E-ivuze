import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationTriangle, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';

const GlobalAlertModal = ({ isOpen, type, title, message, onClose }) => {
    if (!isOpen) return null;

    const getTheme = () => {
        switch (type) {
            case 'error':
                return {
                    icon: <FaExclamationTriangle className="text-4xl" />,
                    bgColor: 'bg-red-50',
                    textColor: 'text-red-500',
                    defaultTitle: 'Attention'
                };
            case 'success':
                return {
                    icon: <FaCheckCircle className="text-4xl" />,
                    bgColor: 'bg-green-50',
                    textColor: 'text-green-500',
                    defaultTitle: 'Success'
                };
            default:
                return {
                    icon: <FaInfoCircle className="text-4xl" />,
                    bgColor: 'bg-blue-50',
                    textColor: 'text-blue-500',
                    defaultTitle: 'Notification'
                };
        }
    };

    const theme = getTheme();

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                {/* Backdrop overlay */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-[#0f1f33]/60 backdrop-blur-md"
                />

                {/* Modal content container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white w-full max-w-[440px] rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col items-center"
                >
                    {/* Top visual section: Centered icon */}
                    <div className="pt-14 pb-8">
                        <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center shadow-lg ${theme.bgColor} ${theme.textColor}`}>
                            {theme.icon}
                        </div>
                    </div>

                    {/* Main text area: Centered title and message */}
                    <div className="px-12 pb-10 text-center w-full">
                        <h3 className="text-3xl font-extrabold text-[#111827] mb-4 tracking-tight">
                            {title || theme.defaultTitle}
                        </h3>
                        <p className="text-[#6b7280] text-lg leading-relaxed font-medium break-words">
                            {message}
                        </p>
                    </div>

                    {/* Footer: Prominent action button */}
                    <div className="w-full px-10 pb-12">
                        <button
                            onClick={onClose}
                            className="w-full bg-[#111827] hover:bg-black text-white font-black py-5 px-6 rounded-3xl transition-all duration-300 shadow-2xl active:scale-[0.97] transform"
                        >
                            DONE
                        </button>
                    </div>

                    {/* Hidden utility: Secondary close X */}
                    <button
                        onClick={onClose}
                        className="absolute top-8 right-10 p-2 text-gray-300 hover:text-gray-500 transition-colors"
                        aria-label="Close"
                    >
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default GlobalAlertModal;
