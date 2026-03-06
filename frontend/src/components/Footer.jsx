import React, { useState, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import axios from 'axios';

const Footer = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) {
      toast.error(t('footer.newsletterError') || 'Please enter a valid email.');
      return;
    }
    try {
      setIsSubmitting(true);
      await axios.post(`${backendUrl}/api/public/newsletter`, { email: newsletterEmail });
      toast.success(t('footer.newsletterSuccess') || 'Successfully subscribed to our newsletter!');
      setNewsletterEmail('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="footer relative z-10 overflow-hidden" style={{ background: '#091e18' }}>
      {/* Subtle emerald patterns like the ones used in achievement section */}
      <div className="absolute inset-0 bg-[radial-gradient(#006838_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent pointer-events-none z-0" />

      {/* Footer Top - Newsletter */}
      <div className="footer-top border-b border-white/5 relative z-10">
        <div className="max-w-[90rem] mx-auto px-6 lg:px-12">
          <div className="flex flex-wrap items-center py-12 -mx-4">
            <div className="w-full lg:w-1/2 px-4 mb-8 lg:mb-0">
              <div className="cta flex items-start gap-4">
                <div className="w-14 h-14 bg-[#006838] rounded-full flex items-center justify-center flex-shrink-0 text-white shadow-lg">
                  <i className="lni lni-headphone-alt text-2xl"></i>
                </div>
                <div>
                  <h3 className="text-white text-2xl font-bold mb-1">Professional Support</h3>
                  <p className="text-white/50 text-sm max-w-md">
                    Connect with our dedicated medical assistance team for any technical or health inquiries. Call us at{' '}
                    <a href="tel:+250780000000" className="text-[#88C250] hover:underline font-bold transition-all">
                      +250 788 000 000
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-1/2 px-4">
              <div className="bg-white/5 p-2 rounded-sm border border-white/10">
                <form className="flex" onSubmit={handleNewsletterSubmit}>
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={e => setNewsletterEmail(e.target.value)}
                    placeholder="Subscribe to Medical Updates"
                    className="flex-1 px-6 py-4 bg-transparent text-white placeholder-white/30 focus:outline-none text-sm font-medium"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#006838] text-white px-10 py-4 font-bold hover:bg-[#88C250] transition-all whitespace-nowrap text-xs  tracking-widest disabled:opacity-70 shadow-xl"
                  >
                    {isSubmitting ? 'Wait...' : 'Keep me updated'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Middle - 4 Columns */}
      <div className="footer-middle py-20 relative z-10">
        <div className="max-w-[90rem] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-white">
            {/* About */}
            <div className="space-y-8">
              <div className="flex items-center bg-white p-2 rounded-sm w-fit shadow-md">
                <img src={assets.logo} alt="Logo" className="h-10 w-auto" />
              </div>
              <p className="text-white/50 text-sm leading-relaxed">
                Empowering Rwandans with world-class digital health infrastructure. Bridging the gap between specialized medical care and those who need it most.
              </p>
              <ul className="flex space-x-4">
                {[
                  { icon: 'lni lni-facebook-filled', href: '#' },
                  { icon: 'lni lni-twitter-original', href: '#' },
                  { icon: 'lni lni-instagram', href: '#' },
                  { icon: 'lni lni-linkedin-original', href: '#' },
                ].map((s, i) => (
                  <li key={i}>
                    <a
                      href={s.href}
                      className="w-10 h-10 flex items-center justify-center bg-white/5 text-white/50 border border-white/10 hover:bg-[#006838] hover:text-white hover:border-[#006838] hover:-translate-y-1 transition-all text-base shadow-sm"
                    >
                      <i className={s.icon}></i>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Navigation Sections */}
            <div>
              <h3 className="text-white font-bold text-lg mb-8 pb-4 border-b border-white/5">Digital Solutions</h3>
              <ul className="space-y-4">
                {[
                  { to: '/doctors', label: 'Specialist Directory' },
                  { to: '/about', label: 'How it Works' },
                  { to: '/contact', label: 'Support Center' },
                  { to: '/messages', label: 'Telemedicine Panel' }
                ].map((link, lidx) => (
                  <li key={lidx}>
                    <NavLink to={link.to} className="text-white/50 text-sm hover:text-[#88C250] transition-colors flex items-center group">
                      <span className="w-1.5 h-1.5 bg-[#006838] rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-all"></span>
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Opening Hours */}
            <div>
              <h3 className="text-white font-bold text-lg mb-8 pb-4 border-b border-white/5">Operating Hours</h3>
              <ul className="space-y-4">
                {[
                  { day: 'Mon - Fri', time: '08:00 - 20:00' },
                  { day: 'Saturday', time: '09:00 - 18:00' },
                  { day: 'Sunday', time: 'Emergency Call Only' },
                  { day: 'Telehealth', time: '24/7 Digital Access' },
                ].map((h, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className="text-white/50 font-medium">{h.day}</span>
                    <span className="text-white/80 font-bold">{h.time}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Location & Contact */}
            <div>
              <h3 className="text-white font-bold text-lg mb-8 pb-4 border-b border-white/5">HQ Location</h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4 text-white/50 text-sm leading-relaxed">
                  <i className="lni lni-map-marker text-[#88C250] text-xl mt-1"></i>
                  E-ivuzeHub, KN 78 St,<br />Kigali Business District, Rwanda
                </li>
                <li className="flex items-center gap-4 text-white/50 text-sm">
                  <i className="lni lni-envelope text-[#88C250] text-xl"></i>
                  contact@E-ivuze.rw
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom border-t border-white/5 py-8 relative z-10 bg-black/20">
        <div className="max-w-[90rem] mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-white/30 text-xs font-medium  tracking-[0.2em]">
              &copy; {new Date().getFullYear()} e-Ivuze Connect — Powered by E-ivuzeTech.
            </p>
            <ul className="flex items-center space-x-8">
              <li><NavLink to="/terms" className="text-white/30 text-[10px]  font-bold tracking-widest hover:text-[#88C250] transition-colors">Legal Terms</NavLink></li>
              <li><NavLink to="/privacy" className="text-white/30 text-[10px]  font-bold tracking-widest hover:text-[#88C250] transition-colors">Data Privacy</NavLink></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;