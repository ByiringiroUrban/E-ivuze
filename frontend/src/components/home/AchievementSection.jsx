import React, { useEffect, useRef, useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { AppContext } from '../../context/AppContext';

const baseStats = [
    { icon: 'lni lni-apartment', end: 1250, label: 'Hospital Rooms' },
    { icon: 'lni lni-sthethoscope', end: 350, label: 'Specialist Doctors' },
    { icon: 'lni lni-users', end: 2500, label: 'Happy Patients' },
    { icon: 'lni lni-certificate', end: 35, label: 'Years of Experience' },
];

function useCountUp(end, duration = 2000, trigger) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!trigger) return;
        let start = 0;
        const step = end / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);
        return () => clearInterval(timer);
    }, [end, duration, trigger]);
    return count;
}

const StatCard = ({ icon, end, label, delay }) => {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setInView(true); },
            { threshold: 0.3 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    const count = useCountUp(end, 2000, inView);

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay }}
            className="text-center px-6 py-4"
        >
            <div className="w-[70px] h-[70px] mx-auto mb-6 flex items-center justify-center bg-white rounded-sm shadow-lg">
                <i className={`${icon} text-3xl text-[#006838]`}></i>
            </div>
            <h3 className="text-4xl font-bold text-white mb-2">{count.toLocaleString()}+</h3>
            <p className="text-white/80 font-medium text-xs   tracking-[0.2em]">{label}</p>
        </motion.div>
    );
};

const Achievement = () => {
    const { doctors } = useContext(AppContext);

    // Update specialist doctors count from real data if available
    const stats = baseStats.map(s =>
        s.label === 'Specialist Doctors' && doctors?.length > 0
            ? { ...s, end: doctors.length }
            : s
    );

    return (
        <section
            className="our-achievement py-24 relative overflow-hidden bg-[#006838]"
        >
            {/* Background Image with strong overlay to fix low quality texture */}
            <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: 'url(/topographic-pattern.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />
            {/* Extra Gradient Overlay for smooth blending */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#006838]/50 to-[#006838]/90 pointer-events-none" />

            <div className="max-w-[90rem] mx-auto px-6 lg:px-12 relative z-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((s, i) => (
                        <StatCard key={i} {...s} delay={i * 0.15} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Achievement;
