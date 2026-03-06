import React, { useContext, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { getDoctorImageSrc } from '../../utils/doctorImage';
import { toast } from 'react-toastify';

// Gradient avatars cycling through brand colours
const avatarColors = [
    'from-[#006838] to-[#88C250]',
    'from-[#081828] to-[#006838]',
    'from-[#88C250] to-[#006838]',
    'from-[#006838] to-[#081828]',
];

const DoctorCard = ({ doctor, index, onBook }) => {
    const imgSrc = getDoctorImageSrc(doctor);
    const initials = (doctor.name || '??').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.12, duration: 0.5 }}
            className="group relative bg-white border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
        >
            {/* Image / Avatar area */}
            <div className="relative overflow-hidden">
                {imgSrc ? (
                    <img
                        src={imgSrc}
                        alt={doctor.name}
                        className="w-full h-[280px] object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className={`w-full h-[280px] bg-gradient-to-br ${avatarColors[index % avatarColors.length]} flex items-center justify-center`}>
                        <span className="text-white text-6xl font-bold font-merriweather opacity-80">
                            {initials}
                        </span>
                    </div>
                )}

                {/* Social overlay */}
                <div className="absolute inset-0 bg-[#006838]/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                        onClick={() => onBook(doctor._id)}
                        className="bg-white text-[#006838] font-semibold px-6 py-2.5 hover:bg-[#006838] hover:text-white transition-all text-sm"
                    >
                        Book Appointment
                    </button>
                </div>

                {/* Specialty tag ribbon */}
                <div className="absolute bottom-0 left-0 right-0 bg-[#006838] text-white text-center text-xs font-semibold py-2 tracking-widest   translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    {doctor.speciality}
                </div>

                {/* Available badge */}
                {doctor.available !== false && (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 text-[#006838] px-2.5 py-1 text-[10px] font-bold   tracking-widest">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        Available
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-6 text-center border-t border-gray-100">
                <h4 className="text-[#081828] font-bold text-lg mb-1 font-merriweather">{doctor.name}</h4>
                <p className="text-[#006838] text-sm font-medium">{doctor.speciality}</p>
                {doctor.degree && (
                    <p className="text-gray-400 text-xs mt-1">{doctor.degree}</p>
                )}
            </div>
        </motion.div>
    );
};

const Doctors = () => {
    const { doctors, token } = useContext(AppContext);
    const navigate = useNavigate();

    // Take first 4 doctors regardless of available status for display
    const curatedDoctors = useMemo(() => {
        if (!doctors?.length) return [];
        return doctors.slice(0, 4);
    }, [doctors]);

    const handleBook = (doctorId) => {
        if (!token) {
            toast.info('Please sign in to book an appointment.');
            navigate('/login');
            return;
        }
        navigate(`/appointment/${doctorId}`);
    };

    return (
        <section className="doctors py-24 bg-[#f9f9f9] relative overflow-hidden">
            {/* Background watermark */}
            <div className="absolute top-6 left-0 right-0 flex justify-center pointer-events-none z-0 overflow-hidden">
                <span className="text-[60px] md:text-[80px] lg:text-[100px] font-bold   text-gray-200 whitespace-nowrap select-none font-merriweather opacity-60">
                    doctors
                </span>
            </div>

            <div className="max-w-[90rem] mx-auto px-6 lg:px-12 relative z-10">
                {/* Section Title */}
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1, duration: 0.8 }}
                        className="text-3xl lg:text-4xl font-bold text-[#081828] mb-4 relative inline-block font-merriweather
              after:content-[''] after:absolute after:-bottom-3 after:left-1/2 after:-translate-x-1/2
              after:w-12 after:h-1 after:bg-[#006838]"
                    >
                        Our Expert Doctors
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="text-gray-500 max-w-lg mx-auto text-sm leading-relaxed mt-8"
                    >
                        Our team of highly qualified and experienced doctors are committed to providing the best healthcare services to our patients.
                    </motion.p>
                </div>

                {/* Cards — real data, explicit flex grid */}
                {curatedDoctors.length > 0 ? (
                    <div className="flex flex-wrap -mx-3">
                        {curatedDoctors.map((doc, i) => (
                            <div key={doc._id} className="w-full sm:w-1/2 lg:w-1/4 px-3 mb-6">
                                <DoctorCard doctor={doc} index={i} onBook={handleBook} />
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Skeleton loading */
                    <div className="flex flex-wrap -mx-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-full sm:w-1/2 lg:w-1/4 px-3 mb-6">
                                <div className="bg-white border border-gray-100 overflow-hidden animate-pulse">
                                    <div className="h-[280px] bg-gray-100" />
                                    <div className="p-6 space-y-3">
                                        <div className="h-4 bg-gray-100 w-3/4 mx-auto" />
                                        <div className="h-3 bg-gray-100 w-1/2 mx-auto" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* View All button */}
                <div className="text-center mt-10">
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}
                        onClick={() => navigate('/doctors')}
                        className="inline-block bg-[#006838] text-white font-semibold px-10 py-4 hover:bg-[#289665] transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                        View All Doctors
                    </motion.button>
                </div>
            </div>
        </section>
    );
};

export default Doctors;
