import React from 'react';
import { Link } from 'react-router-dom';

const PageHeader = ({ title, breadcrumbs, bgImage }) => {
    return (
        <div className="relative py-24 lg:py-32 overflow-hidden bg-[#006838]">
            {/* Innovative Background Image - Unique for each page */}
            <div className="absolute inset-0 z-0">
                <img
                    src={bgImage || "/doctors-innovative-bg.png"}
                    alt="innovative-bg"
                    className="w-full h-full object-cover opacity-30 mix-blend-overlay"
                />
            </div>

            {/* Background topographic pattern for innovative look */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-center z-0" style={{ backgroundImage: 'url(/topographic-pattern.png)', backgroundSize: 'cover' }} />

            {/* Background dots pattern matching achievement section */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] z-0" />

            {/* Professional Emerald Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#006838]/80 to-[#006838] z-1" />

            <div className="max-w-[90rem] mx-auto px-6 lg:px-12 relative z-10 text-center">
                <div className="max-w-3xl mx-auto space-y-4">
                    <h1 className="text-3xl lg:text-5xl font-bold text-white font-merriweather tracking-tight leading-tight">
                        {title}
                    </h1>
                    <nav className="flex justify-center items-center space-x-3 text-white/50 font-medium tracking-[0.15em]   text-[10px] lg:text-xs">
                        <Link to="/" className="hover:text-white transition-all">Home</Link>
                        {breadcrumbs.map((crumb, index) => (
                            <React.Fragment key={index}>
                                <span className="text-white/20">•</span>
                                {crumb.path ? (
                                    <Link to={crumb.path} className="hover:text-white transition-all">
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span className="text-white font-extrabold">{crumb.label}</span>
                                )}
                            </React.Fragment>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Decorative circles from branding STYLE */}
            <div className="absolute -top-20 -right-20 w-80 h-80 border-[50px] border-white/5 rounded-full z-0 opacity-40"></div>
            <div className="absolute -bottom-10 left-10 w-40 h-40 border-[20px] border-white/5 rounded-full z-0 opacity-30"></div>
            <div className="absolute top-1/2 left-[-50px] w-24 h-24 border-[10px] border-white/5 rounded-full z-0 opacity-20"></div>
        </div>
    );
};

export default PageHeader;
