import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
import { specialityData } from '../../assets/assets';

const Appointment = () => {
    const { backendUrl } = useContext(AppContext);
    const [form, setForm] = useState({ name: '', email: '', speciality: '', date: '' });
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.date) {
            toast.error('Please fill in your name, email and preferred date.');
            return;
        }
        try {
            setSubmitting(true);
            await axios.post(`${backendUrl}/api/public/appointment-request`, {
                name: form.name,
                email: form.email,
                preferredDate: form.date,
                speciality: form.speciality,
                message: form.speciality ? `Department: ${form.speciality}` : '',
                source: 'home_appointment_bar',
            });
            toast.success('Appointment request sent! You will receive a confirmation email shortly.');
            setForm({ name: '', email: '', speciality: '', date: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="appointment py-24 bg-[#f0f4f2] relative overflow-hidden">
            {/* Background Watermark */}
            <div className="absolute top-10 left-0 right-0 flex justify-center pointer-events-none z-0 overflow-hidden">
                <span className="text-[120px] md:text-[180px] font-bold uppercase text-gray-100/50 whitespace-nowrap select-none font-merriweather">
                    APPOINT
                </span>
            </div>

            {/* Imigongo Art – Right Side Texture (green tones) */}
            <svg
                className="hidden md:block absolute top-0 right-0 h-full w-[260px] opacity-[0.06] pointer-events-none"
                viewBox="0 0 200 600" fill="none" preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Repeating nested chevron rows - Imigongo style */}
                <polygon points="100,0 0,60 0,80 100,20 200,80 200,60" fill="#88C250" />
                <polygon points="100,20 0,80 0,100 100,40 200,100 200,80" fill="#004d2a" />
                <polygon points="100,40 0,100 0,120 100,60 200,120 200,100" fill="#88C250" />

                <polygon points="100,80 0,140 0,160 100,100 200,160 200,140" fill="#88C250" />
                <polygon points="100,100 0,160 0,180 100,120 200,180 200,160" fill="#004d2a" />
                <polygon points="100,120 0,180 0,200 100,140 200,200 200,180" fill="#88C250" />

                <polygon points="100,160 0,220 0,240 100,180 200,240 200,220" fill="#88C250" />
                <polygon points="100,180 0,240 0,260 100,200 200,260 200,240" fill="#004d2a" />
                <polygon points="100,200 0,260 0,280 100,220 200,280 200,260" fill="#88C250" />

                <polygon points="100,240 0,300 0,320 100,260 200,320 200,300" fill="#88C250" />
                <polygon points="100,260 0,320 0,340 100,280 200,340 200,320" fill="#004d2a" />

                <polygon points="100,320 0,380 0,400 100,340 200,400 200,380" fill="#88C250" />
                <polygon points="100,340 0,400 0,420 100,360 200,420 200,400" fill="#004d2a" />
                <polygon points="100,360 0,420 0,440 100,380 200,440 200,420" fill="#88C250" />

                <polygon points="100,400 0,460 0,480 100,420 200,480 200,460" fill="#88C250" />
                <polygon points="100,420 0,480 0,500 100,440 200,500 200,480" fill="#004d2a" />
                <polygon points="100,440 0,500 0,520 100,460 200,520 200,500" fill="#88C250" />

                <polygon points="100,480 0,540 0,560 100,500 200,560 200,540" fill="#88C250" />
                <polygon points="100,500 0,560 0,580 100,520 200,580 200,560" fill="#004d2a" />
                <polygon points="100,520 0,580 0,600 100,540 200,600 200,580" fill="#88C250" />
            </svg>

            {/* Imigongo Art – Left corner accent (small) */}
            <svg
                className="hidden md:block absolute bottom-0 left-0 w-[160px] h-[200px] opacity-[0.05] pointer-events-none"
                viewBox="0 0 160 200" fill="none" xmlns="http://www.w3.org/2000/svg"
            >
                <polygon points="80,0 0,50 0,70 80,20 160,70 160,50" fill="#88C250" />
                <polygon points="80,20 0,70 0,90 80,40 160,90 160,70" fill="#004d2a" />
                <polygon points="80,40 0,90 0,110 80,60 160,110 160,90" fill="#88C250" />
                <polygon points="80,80 0,130 0,150 80,100 160,150 160,130" fill="#88C250" />
                <polygon points="80,100 0,150 0,170 80,120 160,170 160,150" fill="#004d2a" />
                <polygon points="80,130 0,180 0,200 80,150 160,200 160,180" fill="#88C250" />
            </svg>

            <div className="max-w-[90rem] mx-auto px-6 lg:px-12 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                    {/* Left: Content and Form - Increased width */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="w-full lg:w-2/3"
                    >
                        <div className="appointment-title relative mb-10">
                            <div className="inline-block px-4 py-1.5 bg-emerald-100 text-[#006838] rounded-full text-xs font-bold uppercase tracking-wider mb-4 relative z-10">
                                Easy Booking
                            </div>
                            <h2 className="relative z-10 text-4xl lg:text-5xl font-bold text-[#081828] mb-6 font-merriweather">Book An Appointment</h2>

                            {/* Green Underline Design */}
                            <div className="w-20 h-1.5 bg-[#006838] mb-8 rounded-full"></div>

                            <p className="text-gray-500 text-lg leading-relaxed max-w-xl">
                                Please feel welcome to contact our friendly reception staff with any general or medical enquiry. Our doctors will receive or return any urgent calls.
                            </p>
                        </div>

                        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Your Name"
                                    className="w-full h-[60px] border border-gray-200 px-6 pr-12 focus:outline-none focus:border-[#006838] focus:ring-4 focus:ring-emerald-50 transition-all text-sm rounded-lg"
                                />
                                <i className="lni lni-user absolute right-6 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            </div>
                            <div className="relative">
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="Your Email"
                                    className="w-full h-[60px] border border-gray-200 px-6 pr-12 focus:outline-none focus:border-[#006838] focus:ring-4 focus:ring-emerald-50 transition-all text-sm rounded-lg"
                                />
                                <i className="lni lni-envelope absolute right-6 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            </div>
                            <div className="relative">
                                <select
                                    name="speciality"
                                    value={form.speciality}
                                    onChange={handleChange}
                                    className="w-full h-[60px] border border-gray-200 px-6 appearance-none focus:outline-none focus:border-[#006838] focus:ring-4 focus:ring-emerald-50 transition-all text-sm text-gray-500 rounded-lg"
                                >
                                    <option value="" disabled>Select Department</option>
                                    {specialityData.map((item, idx) => (
                                        <option key={idx} value={item.speciality}>{item.speciality}</option>
                                    ))}
                                </select>
                                <i className="lni lni-chevron-down absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                            </div>
                            <div className="relative">
                                <input
                                    type="date"
                                    name="date"
                                    value={form.date}
                                    onChange={handleChange}
                                    className="w-full h-[60px] border border-gray-200 px-6 pr-12 focus:outline-none focus:border-[#006838] focus:ring-4 focus:ring-emerald-50 transition-all text-sm rounded-lg text-gray-500"
                                />
                                <i className="lni lni-calendar absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                            </div>
                            <div className="relative">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full h-[60px] bg-[#006838] text-white font-bold text-sm uppercase tracking-widest hover:bg-[#004d2a] hover:shadow-xl hover:-translate-y-1 transition-all rounded-lg disabled:opacity-60 shadow-lg shadow-emerald-900/10"
                                >
                                    {submitting ? 'Sending Request…' : 'Get Appointment'}
                                </button>
                            </div>
                        </form>
                    </motion.div>

                    {/* Right: Decorative Image - Reduced width to 1/3 and restricted max height */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, x: 50 }}
                        whileInView={{ opacity: 1, scale: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="w-full lg:w-1/3 relative flex justify-center lg:justify-end"
                    >
                        <div className="relative z-10 animate-float max-w-[320px] lg:max-w-none">
                            <img
                                src="/bookappointment.png"
                                alt="Booking Healthcare"
                                className="w-full h-auto object-contain drop-shadow-2xl max-h-[480px]"
                            />
                        </div>
                        {/* Decorative background shape */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-600 rounded-full blur-[80px] opacity-20 -z-10" />
                    </motion.div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-15px); }
                    100% { transform: translateY(0px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
            `}} />
        </section>
    );
};

export default Appointment;
