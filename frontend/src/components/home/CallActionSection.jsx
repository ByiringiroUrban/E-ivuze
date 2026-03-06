import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';

const CallAction = () => {
    const { token } = useContext(AppContext);
    const navigate = useNavigate();

    return (
        <section
            className="call-action py-24 relative overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, #006838 0%, #006838 60%, #88C250 100%)',
            }}
        >
            {/* decorative circles from newhomepage */}
            <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/5 rounded-full" />
            <div className="absolute -bottom-16 -right-16 w-96 h-96 bg-white/5 rounded-full" />

            <div className="max-w-[90rem] mx-auto px-6 lg:px-12 relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
                    {/* Left Column: Content */}
                    <div className="w-full lg:w-1/2 text-center lg:text-left">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                    opacity: 1,
                                    transition: {
                                        staggerChildren: 0.2
                                    }
                                }
                            }}
                            className="relative z-20"
                        >
                            <motion.h2
                                variants={{
                                    hidden: { opacity: 0, y: 30 },
                                    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
                                }}
                                className="text-3xl lg:text-5xl font-bold text-white mb-6 leading-tight font-merriweather"
                            >
                                {token ? 'Ready To Book Your Next Appointment?' : 'Join Rwanda\'s Most Trusted Medical Network'}
                            </motion.h2>
                            <motion.p
                                variants={{
                                    hidden: { opacity: 0, y: 30 },
                                    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
                                }}
                                className="text-white/80 mb-10 text-lg leading-relaxed max-w-xl mx-auto lg:mx-0"
                            >
                                {token
                                    ? 'Connect with certified specialists across Rwanda in minutes. Comprehensive healthcare is just a click away.'
                                    : 'Create a free account today to access telemedicine, track your medical history, and book appointments with top-tier Rwandan specialists.'}
                            </motion.p>
                            <motion.div
                                variants={{
                                    hidden: { opacity: 0, y: 30 },
                                    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
                                }}
                                className="flex flex-wrap justify-center lg:justify-start gap-4"
                            >
                                <button
                                    onClick={() => navigate(token ? '/doctors' : '/register')}
                                    className="inline-block bg-white text-[#006838] font-bold px-10 py-4 hover:bg-[#88C250] hover:text-white transition-all duration-300 shadow-xl rounded-sm active:scale-95"
                                >
                                    {token ? 'Find a Doctor' : 'Get Started Now'}
                                </button>
                                <button
                                    onClick={() => navigate('/contact')}
                                    className="inline-block border-2 border-white/40 text-white font-bold px-10 py-4 hover:bg-white hover:text-[#006838] transition-all duration-300 rounded-sm active:scale-95"
                                >
                                    Contact Us
                                </button>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Right Column: Glowing Map */}
                    <div className="w-full lg:w-1/2 flex justify-center lg:justify-end relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, x: 50 }}
                            whileInView={{ opacity: 1, scale: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="relative w-full max-w-[500px] md:max-w-[600px] lg:max-w-[700px] pointer-events-none"
                        >
                            <img
                                src="/rwandanmap.png"
                                alt="Rwanda Map"
                                className="w-full h-auto object-contain map-glow-img"
                                style={{
                                    filter: 'brightness(0) invert(1) drop-shadow(0 0 30px rgba(255,255,255,0.6))',
                                }}
                            />
                        </motion.div>
                        {/* Background glow orbs for extra premium feel */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-white rounded-full blur-[120px] opacity-10 pointer-events-none -z-10" />
                    </div>
                </div>

                <style>{`
                    @keyframes mapGlowPulse {
                        0%   { filter: brightness(0) invert(1) drop-shadow(0 0 20px rgba(255,255,255,0.4)); transform: scale(1); }
                        50%  { filter: brightness(0) invert(1) drop-shadow(0 0 50px rgba(255,255,255,0.8)); transform: scale(1.03); }
                        100% { filter: brightness(0) invert(1) drop-shadow(0 0 20px rgba(255,255,255,0.4)); transform: scale(1); }
                    }
                    .map-glow-img {
                        animation: mapGlowPulse 5s ease-in-out infinite;
                        transform-origin: center;
                    }
                `}</style>
            </div>
        </section>
    );
};

export default CallAction;
