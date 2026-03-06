import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const AboutUs = () => {
    const navigate = useNavigate();
    const [isVideoOpen, setIsVideoOpen] = useState(false);

    return (
        <section className="about-us py-24 bg-[#e0f0e6] relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-white/40 rounded-full blur-[100px] opacity-40 -z-10" />

            {/* Background Watermark */}
            <div className="absolute top-20 right-0 left-0 flex justify-center pointer-events-none z-0 overflow-hidden">
                <span className="text-[120px] md:text-[180px] font-bold uppercase text-white/50 whitespace-nowrap select-none font-merriweather">
                    ABOUT US
                </span>
            </div>

            <div className="max-w-[90rem] mx-auto px-6 lg:px-12 relative z-10">
                <div className="row flex flex-wrap items-center -mx-4">
                    <div className="w-full lg:w-1/2 px-4 mb-16 lg:mb-0">
                        <div className="content-left relative group">
                            {/* Decorative Imigongo Shape behind image */}
                            <svg
                                className="absolute -top-10 -left-10 w-48 h-48 opacity-[0.03] text-[#006838]"
                                viewBox="0 0 100 100" fill="currentColor"
                            >
                                <path d="M0 50 L25 0 L50 50 L75 0 L100 50 L75 100 L50 50 L25 100 Z" />
                            </svg>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                className="relative z-10"
                            >
                                <motion.div
                                    animate={{ y: [0, -15, 0] }}
                                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                    className="relative"
                                >
                                    <img
                                        src="/aboutPage.png"
                                        alt="e-Ivuze Connect Community"
                                        className="w-full h-auto drop-shadow-[0_20px_50px_rgba(0,104,56,0.15)]"
                                    />
                                    {/* Innovative light aura */}
                                    <div className="absolute inset-x-0 -bottom-10 h-20 bg-emerald-400/10 blur-[60px] rounded-full" />
                                </motion.div>

                                {/* Play button floating */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                                    <button
                                        onClick={() => setIsVideoOpen(true)}
                                        className="w-20 h-20 bg-white text-[#006838] rounded-full flex items-center justify-center text-xl shadow-2xl hover:scale-110 transition-transform duration-300 group"
                                    >
                                        <i className="lni lni-play ml-1 group-hover:scale-110 transition-transform"></i>
                                        <span className="absolute inset-0 border-2 border-[#006838]/20 rounded-full animate-ping"></span>
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                    <div className="w-full lg:w-1/2 px-4">
                        <div className="content-right pl-0 lg:pl-16">
                            <motion.span
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="bg-emerald-100 text-[#006838] text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.2em] mb-6 inline-block"
                            >
                                Empowering Rwanda
                            </motion.span>
                            <h2 className="text-3xl lg:text-5xl font-bold text-[#081828] mb-6 leading-tight font-merriweather relative">
                                Healthcare Connected <br /> For Every Profession.
                            </h2>

                            {/* Green Underline Design */}
                            <div className="w-20 h-1.5 bg-[#006838] mb-10 rounded-full"></div>
                            <p className="text-gray-500 mb-10 leading-relaxed text-lg">
                                Whether you're a doctor, a constructor, a farmer, or an artist, e-Ivuze Connect brings world-class medical consultation to your fingertips. We are bridging the gap between professional care and your daily life through seamless digital accessibility.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-10">
                                <ul className="space-y-4">
                                    <li className="flex items-center text-gray-700 font-medium">
                                        <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center mr-3">
                                            <i className="lni lni-check-mark-circle text-[#006838] text-sm"></i>
                                        </div>
                                        Verified Specialists
                                    </li>
                                    <li className="flex items-center text-gray-700 font-medium">
                                        <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center mr-3">
                                            <i className="lni lni-check-mark-circle text-[#006838] text-sm"></i>
                                        </div>
                                        24/7 Digital Access
                                    </li>
                                </ul>
                                <ul className="space-y-4">
                                    <li className="flex items-center text-gray-700 font-medium">
                                        <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center mr-3">
                                            <i className="lni lni-check-mark-circle text-[#006838] text-sm"></i>
                                        </div>
                                        Secure Health Vault
                                    </li>
                                    <li className="flex items-center text-gray-700 font-medium">
                                        <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center mr-3">
                                            <i className="lni lni-check-mark-circle text-[#006838] text-sm"></i>
                                        </div>
                                        AI-Powered Triage
                                    </li>
                                </ul>
                            </div>

                            <div className="button">
                                <button
                                    onClick={() => navigate('/about')}
                                    className="bg-[#006838] text-white px-10 py-4 font-bold rounded-sm hover:bg-[#004d2a] hover:translate-x-2 transition-all duration-300 shadow-xl shadow-emerald-900/10"
                                >
                                    Our Full Story
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Video Modal */}
            <AnimatePresence>
                {isVideoOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-10"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            className="relative w-full max-w-5xl aspect-video bg-[#081828] rounded-2xl overflow-hidden shadow-[0_0_100px_rgba(0,104,56,0.3)] border border-emerald-500/20"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setIsVideoOpen(false)}
                                className="absolute top-4 right-4 z-[100] w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-md border border-white/10"
                            >
                                <i className="lni lni-close text-xl"></i>
                            </button>

                            {/* Loading State Spinner */}
                            <div className="absolute inset-0 flex items-center justify-center -z-10">
                                <span className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
                            </div>

                            <iframe
                                width="100%"
                                height="100%"
                                src="https://www.youtube.com/embed/r44RKWyfcFw?autoplay=1&rel=0"
                                title="e-Ivuze Video"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full"
                            ></iframe>
                        </motion.div>

                        {/* Overlay click to close */}
                        <div
                            className="absolute inset-0 -z-10"
                            onClick={() => setIsVideoOpen(false)}
                        ></div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default AboutUs;
