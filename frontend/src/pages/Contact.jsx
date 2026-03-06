import React, { useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { AppContext } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import { motion } from 'framer-motion';

const Contact = () => {
  const { backendUrl } = useContext(AppContext);
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error(t('pages.contact.form.error') || 'Please fill all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.post(`${backendUrl}/api/public/contact`, formData);
      toast.success('Thank you! Your message has been sent. You will receive a confirmation email shortly.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f9f9f9]">
      <SEO
        title={t('pages.contact.title') + ' - e-Ivuze Connect'}
        description={t('pages.contact.subtitle')}
      />

      <PageHeader
        title={t('pages.contact.title') || "Contact Us"}
        breadcrumbs={[{ label: t('pages.contact.title') || "Contact Us" }]}
        bgImage="/contact-innovative-bg.png"
      />

      {/* Contact Info Cards */}
      <section className="py-24">
        <div className="max-w-[90rem] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Our Location",
                info: "Kigali, Rwanda",
                subInfo: "KN 78 St, Kigali",
                icon: "lni lni-map-marker"
              },
              {
                title: "Phone Number",
                info: "+250 788 000 000",
                subInfo: "24/7 Priority Support",
                icon: "lni lni-phone"
              },
              {
                title: "Email Address",
                info: "support@E-ivuze.rw",
                subInfo: "Response within 24 hours",
                icon: "lni lni-envelope"
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="bg-white p-10 rounded-sm border border-gray-100 shadow-sm transition-all text-center group"
              >
                <div className="w-16 h-16 bg-[#f9f9f9] rounded-full flex items-center justify-center mx-auto mb-8 text-[#88C250] text-2xl group-hover:bg-[#88C250] group-hover:text-white transition-colors">
                  <i className={item.icon}></i>
                </div>
                <h3 className="text-xl font-bold text-[#081828] mb-3 font-merriweather">{item.title}</h3>
                <p className="text-[#006838] font-bold mb-1">{item.info}</p>
                <p className="text-gray-500 text-sm">{item.subInfo}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Split Contact Form & Map */}
      <section className="pb-24">
        <div className="max-w-[90rem] mx-auto px-6 lg:px-12">
          <div className="flex flex-wrap -mx-4">
            <div className="w-full lg:w-7/12 px-4 mb-12 lg:mb-0">
              <div className="bg-white p-8 lg:p-12 shadow-xl rounded-sm border-t-4 border-[#006838]">
                <h2 className="text-3xl font-bold text-[#081828] mb-8 font-merriweather">Send us a message</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-bold text-[#081828] mb-2 block   tracking-wider">{t('pages.contact.form.name')}</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full border border-gray-200 px-5 py-4 text-sm focus:border-[#88C250] focus:ring-1 focus:ring-[#88C250]/30 outline-none transition-all"
                      placeholder="e.g. Jean Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-[#081828] mb-2 block   tracking-wider">{t('pages.contact.form.email')}</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full border border-gray-200 px-5 py-4 text-sm focus:border-[#88C250] focus:ring-1 focus:ring-[#88C250]/30 outline-none transition-all"
                      placeholder="e.g. user@example.com"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-bold text-[#081828] mb-2 block   tracking-wider">{t('pages.contact.form.subject')}</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full border border-gray-200 px-5 py-4 text-sm focus:border-[#88C250] focus:ring-1 focus:ring-[#88C250]/30 outline-none transition-all"
                      placeholder="Inquiry about services"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-bold text-[#081828] mb-2 block   tracking-wider">{t('pages.contact.form.message')}</label>
                    <textarea
                      name="message"
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full border border-gray-200 px-5 py-4 text-sm focus:border-[#88C250] focus:ring-1 focus:ring-[#88C250]/30 outline-none transition-all resize-none"
                      placeholder="How can we help you?"
                      required
                    ></textarea>
                  </div>
                  <div className="md:col-span-2 pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full lg:w-auto bg-[#006838] text-white px-12 py-5 font-bold hover:bg-[#88C250] transition-all rounded-sm shadow-lg disabled:opacity-70"
                    >
                      {isSubmitting ? 'Sending Message...' : 'Submit Request'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="w-full lg:w-5/12 px-4">
              <div className="h-full min-h-[500px] w-full relative rounded-sm overflow-hidden shadow-lg grayscale hover:grayscale-0 transition-all duration-500">
                <iframe
                  title="Kigali Map"
                  className="absolute inset-0 w-full h-full"
                  frameBorder="0"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127602.82276527582!2d30.015241477755123!3d-1.9301138865805566!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca429ed86fd2b%3A0x2ad2cabc7a233c5d!2sKigali!5e0!3m2!1sen!2srw!4v1709569000000!5m2!1sen!2srw"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
