import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const slides = [
    {
        title: "Find A Doctor &amp; <br />Book Appointment",
        description: "Since the first days of operating E-ivuzeConnect, our team has been focused on building a high-quality medical service for all Rwandans, making healthcare accessible anywhere, anytime.",
        image: "/hero_1.png",
        btn1: "Book Appointment",
        btn2: "About Us"
    },
    {
        title: "We only give <br />Best care to your family",
        description: "Connecting you with the best medical professionals across Rwanda. Our platform ensures you get the right care at the right time from certified specialists.",
        image: "/hero_2.png",
        btn1: "Book Appointment",
        btn2: "Learn More"
    },
    {
        title: "Superior solutions <br />that help Rwanda shine.",
        description: "Modern healthcare at your fingertips. From local clinics to specialized hospitals, we bridge the gap between patients and quality medical services.",
        image: "/hero_3.png",
        btn1: "Book Appointment",
        btn2: "Contact Us"
    }
];

const Hero = () => {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="hero-area relative bg-[#006838] overflow-hidden min-h-[700px] lg:min-h-[850px] flex items-center">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Orbital Rings - Hidden on small mobile */}
                <div className="hidden sm:block absolute top-[10%] right-[5%] w-[520px] h-[520px] border-[2px] border-white/10 rounded-full animate-pulse"></div>
                <div className="hidden sm:block absolute top-[10%] right-[10%] w-[420px] h-[420px] border-[1px] border-white/5 rounded-full"></div>
                <div className="absolute top-[20%] left-[-150px] lg:left-[-100px] w-[300px] h-[300px] lg:w-[450px] lg:h-[450px] border-[30px] lg:border-[50px] border-white/10 rounded-full"></div>

                {/* Imigongo SVG Art – Bottom Left - Hidden on mobile */}
                <svg
                    className="hidden md:block absolute bottom-0 left-0 w-[280px] h-[320px] opacity-[0.12]"
                    viewBox="0 0 200 230" fill="none" xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Nested chevron/triangle pattern - Imigongo style */}
                    <polygon points="100,10 10,80 10,100 100,30 190,100 190,80" fill="white" />
                    <polygon points="100,30 20,95 20,115 100,50 180,115 180,95" fill="white" />
                    <polygon points="100,50 30,110 30,130 100,70 170,130 170,110" fill="white" />

                    <polygon points="100,80 10,150 10,170 100,100 190,170 190,150" fill="white" />
                    <polygon points="100,100 20,165 20,185 100,120 180,185 180,165" fill="white" />
                    <polygon points="100,120 30,180 30,200 100,140 170,200 170,180" fill="white" />

                    <polygon points="100,150 10,210 10,225 100,170 190,225 190,210" fill="white" />
                    <polygon points="100,168 25,220 25,228 100,185 175,228 175,220" fill="white" />
                </svg>

                {/* Imigongo SVG Art – Top Right - Hidden on mobile */}
                <svg
                    className="hidden md:block absolute top-0 right-0 w-[260px] h-[300px] opacity-[0.10]"
                    viewBox="0 0 200 230" fill="none" xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Mirror chevrons */}
                    <polygon points="10,220 100,150 190,220 190,200 100,130 10,200" fill="white" />
                    <polygon points="10,200 100,130 190,200 190,180 100,110 10,180" fill="white" />
                    <polygon points="10,180 100,110 190,180 190,158 100,88 10,158" fill="white" />

                    <polygon points="10,140 100,70 190,140 190,120 100,50 10,120" fill="white" />
                    <polygon points="10,120 100,50 190,120 190,98 100,28 10,98" fill="white" />
                    <polygon points="10,98 100,28 190,98 190,76 100,6 10,76" fill="white" />
                </svg>

                {/* Extra decorative SVG cross shapes */}
                <motion.svg
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[15%] left-[40%] w-16 h-16 opacity-10"
                    viewBox="0 0 60 60" fill="none"
                >
                    <rect x="26" y="4" width="8" height="52" fill="white" rx="2" />
                    <rect x="4" y="26" width="52" height="8" fill="white" rx="2" />
                    <rect x="12" y="12" width="8" height="8" fill="white" />
                    <rect x="40" y="12" width="8" height="8" fill="white" />
                    <rect x="12" y="40" width="8" height="8" fill="white" />
                    <rect x="40" y="40" width="8" height="8" fill="white" />
                </motion.svg>

                <motion.svg
                    animate={{ rotate: [0, -360] }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[20%] right-[38%] w-12 h-12 opacity-10"
                    viewBox="0 0 60 60" fill="none"
                >
                    <polygon points="30,4 56,56 4,56" fill="none" stroke="white" strokeWidth="4" />
                    <polygon points="30,14 48,50 12,50" fill="none" stroke="white" strokeWidth="3" />
                    <polygon points="30,24 40,44 20,44" fill="none" stroke="white" strokeWidth="2" />
                </motion.svg>

                {/* Floating diamond dots */}
                <motion.div
                    animate={{ y: [0, -20, 0], opacity: [0.15, 0.35, 0.15] }}
                    transition={{ duration: 5, repeat: Infinity }}
                    className="absolute bottom-[25%] left-[10%] w-3 h-3 bg-white/30 rotate-45"
                />
                <motion.div
                    animate={{ y: [0, -15, 0], opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 7, repeat: Infinity, delay: 1 }}
                    className="absolute top-[30%] left-[22%] w-2 h-2 bg-[#88C250]/60 rotate-45"
                />
                <motion.div
                    animate={{ y: [0, -25, 0], opacity: [0.1, 0.4, 0.1] }}
                    transition={{ duration: 6, repeat: Infinity, delay: 2 }}
                    className="absolute top-[20%] right-[40%] w-3 h-3 bg-white/20 rotate-45"
                />

                {/* Floating old SVGs */}
                <motion.img
                    animate={{ y: [0, -40, 0], x: [0, 20, 0], opacity: [0.1, 0.35, 0.1] }}
                    transition={{ duration: 7, repeat: Infinity }}
                    src="/assets/images/hero/05.svg"
                    className="absolute left-[30px] top-[150px] h-[130px] z-1 opacity-20 invert"
                    alt="#"
                />
                <motion.img
                    animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.2, 1] }}
                    transition={{ duration: 9, repeat: Infinity }}
                    src="/assets/images/hero/01.svg"
                    className="absolute right-[30px] bottom-[50px] h-[110px] z-1 opacity-20 invert"
                    alt="#"
                />
            </div>

            <div className="max-w-[90rem] mx-auto px-6 lg:px-12 relative z-10 w-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.8 }}
                        className="row flex flex-wrap items-center -mx-4"
                    >
                        <div className="w-full lg:w-1/2 px-4">
                            <div className="hero-text py-20 lg:py-24">
                                <div className="section-heading">
                                    <motion.h2
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2, duration: 0.6 }}
                                        className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight font-merriweather"
                                        dangerouslySetInnerHTML={{ __html: slides[currentSlide].title }}
                                    />
                                    <motion.p
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4, duration: 0.6 }}
                                        className="text-white/80 text-base lg:text-lg mb-10 max-w-lg leading-relaxed font-normal"
                                    >
                                        {slides[currentSlide].description}
                                    </motion.p>
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6, duration: 0.6 }}
                                        className="flex flex-col sm:flex-row gap-4"
                                    >
                                        <button
                                            onClick={() => navigate('/doctors')}
                                            className="w-full sm:w-auto bg-white text-[#006838] px-10 py-3.5 font-bold text-sm lg:text-base hover:bg-gray-100 transition-all rounded-sm shadow-xl active:scale-95 translate-y-0 hover:-translate-y-1"
                                        >
                                            {slides[currentSlide].btn1}
                                        </button>
                                        <button
                                            onClick={() => navigate('/about')}
                                            className="w-full sm:w-auto bg-transparent border-2 border-white text-white px-10 py-3.5 font-bold text-sm lg:text-base hover:bg-white hover:text-[#006838] transition-all rounded-sm active:scale-95 translate-y-0 hover:-translate-y-1"
                                        >
                                            {slides[currentSlide].btn2}
                                        </button>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-1/2 px-4 flex justify-end">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, x: 50 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                transition={{ delay: 0.3, duration: 1 }}
                                className="hero-image relative max-w-[700px]"
                            >
                                <img
                                    src={slides[currentSlide].image}
                                    alt="Hero Doctor"
                                    className="w-full h-auto object-contain hero-img-glow brightness-105"
                                />
                                <style>{`
                                    @keyframes heroImgGlow {
                                        0%   { filter: brightness(1.05) drop-shadow(0 0 15px rgba(136,194,80,0.3)) drop-shadow(0 0 40px rgba(136,194,80,0.1)); }
                                        50%  { filter: brightness(1.15) drop-shadow(0 0 35px rgba(136,194,80,0.6)) drop-shadow(0 0 80px rgba(136,194,80,0.3)); }
                                        100% { filter: brightness(1.05) drop-shadow(0 0 15px rgba(136,194,80,0.3)) drop-shadow(0 0 40px rgba(136,194,80,0.1)); }
                                    }
                                    .hero-img-glow {
                                        animation: heroImgGlow 4s ease-in-out infinite;
                                    }
                                `}</style>
                                {/* removed original bg and applied total border fade */}
                            </motion.div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Slider Controls */}
            <div className="absolute bottom-10 left-0 right-0 flex justify-center space-x-3 z-20">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide === index ? 'bg-white w-12' : 'bg-white/30 hover:bg-white/50'}`}
                    />
                ))}
            </div>
        </section>
    );
};

export default Hero;
