import React, { useContext, useState } from "react";
import PageHeader from "../components/PageHeader";
import AchievementSection from "../components/home/AchievementSection";
import SEO from "../components/SEO";
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const About = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <div className="bg-white">
      <SEO
        title={t('pages.about.title') + ' - e-Ivuze Connect'}
        description={t('pages.about.paragraph1')}
      />

      <PageHeader
        title={t('pages.about.title') || "About Us"}
        breadcrumbs={[{ label: t('pages.about.title') || "About Us" }]}
        bgImage="/about-innovative-bg.png"
      />

      {/* Main Content: About Collage + Text */}
      <section className="py-24 bg-[#f0f4f2] relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-emerald-50/50 rounded-full blur-[100px] opacity-40 -z-10" />

        {/* Background Watermark */}
        <div className="absolute top-20 right-0 left-0 flex justify-center pointer-events-none z-0 overflow-hidden">
          <span className="text-[120px] md:text-[180px] font-bold   text-gray-100/50 whitespace-nowrap select-none font-merriweather">
            ABOUT US
          </span>
        </div>

        <div className="max-w-[90rem] mx-auto px-6 lg:px-12 relative z-10">
          <div className="flex flex-wrap items-center -mx-4">
            {/* Left Side: Innovative Image Setup */}
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
                  className="relative z-10 px-6"
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
                      className="w-24 h-24 bg-white text-[#006838] rounded-full flex items-center justify-center text-2xl shadow-2xl hover:scale-110 transition-transform duration-300 group"
                    >
                      <i className="lni lni-play ml-1 group-hover:scale-110 transition-transform"></i>
                      <span className="absolute inset-0 border-2 border-[#006838]/20 rounded-full animate-ping"></span>
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Right Side: Narrative */}
            <div className="w-full lg:w-1/2 px-4 lg:pl-16">
              <div className="content-right">
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-emerald-100 text-[#006838] text-[10px] font-bold px-5 py-2 rounded-full   tracking-[0.2em] mb-8 inline-block"
                >
                  {t('pages.about.subtitle') || "Empowering Rwanda"}
                </motion.span>
                <h2 className="text-4xl lg:text-6xl font-bold text-[#081828] mb-6 font-merriweather leading-tight relative">
                  {t('pages.about.heroTitle') || "Healthcare Connected For Every Profession."}
                </h2>

                {/* Green Underline Design */}
                <div className="w-20 h-1.5 bg-[#006838] mb-10 rounded-full"></div>

                <p className="text-gray-500 mb-10 leading-relaxed text-lg">
                  {t('pages.about.paragraph1') || "Since the first days of operating E-ivuzeConnect, our team has been focused on building a high-quality medical service for all Rwandans. Whether you're a doctor, a constructor, a farmer, or an artist, e-Ivuze Connect brings world-class medical consultation to your fingertips."}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 mb-12">
                  <ul className="space-y-4">
                    <li className="flex items-center text-[#475569] font-medium">
                      <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center mr-3">
                        <i className="lni lni-check-mark-circle text-[#006838] text-sm"></i>
                      </div>
                      Verified Specialists
                    </li>
                    <li className="flex items-center text-[#475569] font-medium">
                      <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center mr-3">
                        <i className="lni lni-check-mark-circle text-[#006838] text-sm"></i>
                      </div>
                      Telemedicine Available
                    </li>
                  </ul>
                  <ul className="space-y-4">
                    <li className="flex items-center text-[#475569] font-medium">
                      <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center mr-3">
                        <i className="lni lni-check-mark-circle text-[#006838] text-sm"></i>
                      </div>
                      24/7 Digital Support
                    </li>
                    <li className="flex items-center text-[#475569] font-medium">
                      <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center mr-3">
                        <i className="lni lni-check-mark-circle text-[#006838] text-sm"></i>
                      </div>
                      Secure Health Vault
                    </li>
                  </ul>
                </div>

                <div className="button">
                  <button
                    onClick={() => navigate('/doctors')}
                    className="bg-[#006838] text-white px-10 py-4 font-bold rounded-sm hover:bg-[#004d2a] hover:translate-x-2 transition-all duration-300 shadow-xl shadow-emerald-900/10"
                  >
                    Explore Doctors
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

              <div className="absolute inset-0 -z-10" onClick={() => setIsVideoOpen(false)}></div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Stats Section */}
      <AchievementSection />

      {/* Mission & Vision: Elegant Cards */}
      <section className="py-24 bg-[#f9f9f9]">
        <div className="max-w-[90rem] mx-auto px-6 lg:px-12 text-center mb-16">
          <span className="text-[#006838] font-bold text-sm tracking-widest   mb-4 block">Our Purpose</span>
          <h2 className="text-3xl lg:text-4xl font-bold text-[#081828] font-merriweather">Moving Rwandan Healthcare Forward</h2>
        </div>

        <div className="max-w-[90rem] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Our Mission",
              desc: t('pages.about.paragraph2') || "To provide every Rwandan with seamless, high-quality, and instant access to expert healthcare via modern digital solutions.",
              icon: "lni lni-target"
            },
            {
              title: "Our Vision",
              desc: t('pages.about.visionText') || "Becoming Rwanda's leading health-tech ecosystem, bridging the gap between medical institutions and the citizens who need them.",
              icon: "lni lni-eye"
            },
            {
              title: "Our Values",
              desc: "Integrity, compassion, and innovation drive every line of code and every interaction within E-ivuzeConnect.",
              icon: "lni lni-heart"
            }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -10 }}
              className="group bg-white p-10 rounded-sm border border-gray-100 shadow-sm transition-all text-center"
            >
              <div className="w-16 h-16 bg-[#f9f9f9] rounded-full flex items-center justify-center mx-auto mb-8 text-[#006838] text-2xl group-hover:bg-[#006838] group-hover:text-white transition-colors">
                <i className={item.icon}></i>
              </div>
              <h3 className="text-xl font-bold text-[#081828] mb-4 font-merriweather">{item.title}</h3>
              <p className="text-[#64748b] leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team Section - Redesigned to match medical aesthetic */}
      <section className="py-32 bg-[#f0f4f2] relative overflow-hidden">
        {/* Background Watermark */}
        <div className="absolute top-10 left-0 right-0 flex justify-center pointer-events-none z-0 overflow-hidden">
          <span className="text-[100px] md:text-[140px] font-bold   text-gray-50/50 whitespace-nowrap select-none font-merriweather">
            TEAM
          </span>
        </div>

        <div className="max-w-[90rem] mx-auto px-6 lg:px-12 relative z-10">
          <div className="text-center mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-3xl lg:text-4xl font-bold text-[#081828] mb-4 font-merriweather"
            >
              Our Outstanding Team Is Active To Help You!
            </motion.h2>

            {/* Green Underline */}
            <div className="w-16 h-1 bg-[#88C250] mx-auto mb-6"></div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-gray-400 text-sm max-w-2xl mx-auto leading-relaxed"
            >
              Our development team is dedicated to building the future of Rwandan healthcare, ensuring every citizen has access to high-quality digital medical services.
            </motion.p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 lg:gap-10">
            {[
              {
                name: "Irabaruta Willy Norbert",
                role: "Software Developer",
                image: "/willy.png",
                linkedin: "https://www.linkedin.com/in/i-willy-norbert-6662b034a/",
                github: "https://github.com/Willy-Norbert"
              },
              {
                name: "Byiringiro Urban Bobola",
                role: "Software Developer",
                image: "/urban.png",
                linkedin: "https://www.linkedin.com/in/urbain-b-10823031a/",
                github: "https://github.com/ByiringiroUrban"
              }
            ].map((member, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="w-full sm:w-[320px] bg-[#f8f9fa] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/5] overflow-hidden bg-white">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover grayscale brightness-[0.8] group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Social Overlay on Hover */}
                  <div className="absolute inset-0 bg-[#081828]/40 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white text-[#006838] rounded-full flex items-center justify-center hover:bg-[#88C250] hover:text-white transition-all shadow-lg">
                      <i className="lni lni-linkedin-original"></i>
                    </a>
                    <a href={member.github} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white text-[#006838] rounded-full flex items-center justify-center hover:bg-[#88C250] hover:text-white transition-all shadow-lg">
                      <i className="lni lni-github-original"></i>
                    </a>
                  </div>
                </div>

                {/* Footer Info Box */}
                <div className="p-6 text-center bg-[#f8f9fa] border-t border-gray-50">
                  <span className="text-[#88C250] font-bold text-[11px]   tracking-widest block mb-2">
                    {member.role}
                  </span>
                  <h4 className="text-xl font-bold text-[#081828] font-merriweather">
                    {member.name}
                  </h4>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;