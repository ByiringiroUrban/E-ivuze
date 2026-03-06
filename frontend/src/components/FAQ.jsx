import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const FAQ = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState(0); // First item open by default
  const faqContainerRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  const faqs = [
    {
      question: t('pages.faq.howToRegister.question') || 'How do I create an account?',
      answer: t('pages.faq.howToRegister.answer') || 'To create an account, click on "Register" or "Create Account" in the navigation bar. Choose your role (Patient or Doctor), fill in your details including name, email, and password (minimum 8 characters). For doctors, you\'ll also need to provide your medical license number, specialty, degree, and experience. Once registered, you can log in and start using the platform.'
    },
    {
      question: t('pages.faq.howToBookAppointment.question') || 'How do I book an appointment with a doctor?',
      answer: t('pages.faq.howToBookAppointment.answer') || 'First, make sure you\'re logged in. Browse doctors by specialty or view all available doctors. Click on a doctor\'s profile to see their availability and appointment fees. Select an available time slot, confirm your appointment details, and submit. The doctor will review and approve your appointment request. Once approved, you\'ll receive a notification and can proceed with payment.'
    },
    {
      question: t('pages.faq.howToPay.question') || 'How do I pay for my appointment?',
      answer: t('pages.faq.howToPay.answer') || 'After your appointment is approved by the doctor, you\'ll see a payment option. Click "Pay Online" and you\'ll receive a payment code. Dial this code on your mobile money service (MTN, Airtel, etc.), complete the payment, take a screenshot of the confirmation, and upload it as payment proof. Once verified, your appointment will be confirmed.'
    },
    {
      question: t('pages.faq.videoConsultation.question') || 'How do I join a video consultation?',
      answer: t('pages.faq.videoConsultation.answer') || 'When your appointment time arrives and payment is confirmed, you\'ll see a "Join Meeting" button in your appointment details. Click it to enter the video consultation room. Make sure you have a stable internet connection and allow camera/microphone permissions when prompted. The doctor will join you in the virtual consultation room.'
    },
    {
      question: t('pages.faq.hospitalRegistration.question') || 'How do hospitals register on the platform?',
      answer: t('pages.faq.hospitalRegistration.answer') || 'Hospitals can register by clicking "Register Your Hospital" on the login page. Fill in your hospital details including name, address, and create an admin account. Your registration will be reviewed by our admin team. Once approved, you\'ll receive a notification and can log in to manage your hospital doctors, view patients, and handle patient transfers.'
    },
    {
      question: t('pages.faq.healthRecords.question') || 'How can I access my health records and prescriptions?',
      answer: t('pages.faq.healthRecords.answer') || 'After your appointment is completed, you can access your health records and prescriptions from your dashboard. Go to "My Prescriptions" to view all prescriptions issued by doctors. Your medical records are securely stored and can be accessed anytime from your profile. Doctors can also add records and prescriptions during or after consultations.'
    },
    {
      question: t('pages.faq.cancelAppointment.question') || 'Can I cancel or reschedule my appointment?',
      answer: t('pages.faq.cancelAppointment.answer') || 'Yes, you can cancel appointments that haven\'t been completed yet. Go to "My Appointments" in your dashboard, find the appointment you want to cancel, and click "Cancel Appointment". Note that cancellation policies may vary, and refunds (if applicable) will be processed according to the platform\'s terms. To reschedule, cancel the current appointment and book a new one with your preferred time slot.'
    },
    {
      question: t('pages.faq.doctorRequirements.question') || 'What are the requirements for doctors to join?',
      answer: t('pages.faq.doctorRequirements.answer') || 'Doctors need to provide: a valid medical license number (minimum 5 characters), their medical specialty, educational degree (e.g., MBBS, MD), years of experience, professional bio, and address. A profile picture is optional but recommended. All information is verified to ensure quality healthcare services on the platform.'
    },
    {
      question: t('pages.faq.passwordReset.question') || 'What if I forget my password?',
      answer: t('pages.faq.passwordReset.answer') || 'If you forget your password, please contact our support team at team@E-ivuze.com. We\'ll help you reset your account. For security reasons, password reset must be done through our support team. Make sure to use a strong password (minimum 8 characters) when creating your account.'
    },
    {
      question: t('pages.faq.patientTransfer.question') || 'What is the patient transfer feature for hospitals?',
      answer: t('pages.faq.patientTransfer.answer') || 'Hospitals can transfer patient records to other approved hospitals on the platform. This is useful when a patient needs to be referred to another facility. The receiving hospital can accept or reject the transfer. When accepted, a copy of the patient record is created in the receiving hospital\'s system, allowing seamless continuity of care.'
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Auto-scroll when reaching 4 items
  useEffect(() => {
    if (openIndex >= 3 && faqContainerRef.current) {
      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Wait a bit for the accordion to expand, then scroll
      scrollTimeoutRef.current = setTimeout(() => {
        const faqElement = faqContainerRef.current?.querySelector(`[data-faq-index="${openIndex}"]`);
        if (faqElement) {
          faqElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 300);
    }

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [openIndex]);

  return (
    <div className="relative py-16 md:py-24 bg-primary-light/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* Left side - Animated GIF */}
          <div className="w-full lg:w-1/3 flex-shrink-0 lg:sticky lg:top-24">
            <div className="relative h-[600px] flex items-center justify-center">
              <img
                src="https://hrsoftbd.com/assets/servicePhoto/_20210901140804.gif"
                alt="FAQ Illustration"
                className="w-full h-full object-contain roun-xl"
                loading="lazy"
              />
            </div>
          </div>

          {/* Right side - FAQ Content */}
          <div className="flex-1 w-full lg:w-2/3">
            {/* Header */}
            <div className="text-left mb-6">
              <p className="text-sm uppercase tracking-wider text-primary-dark/70 font-medium mb-2">
                {t('pages.faq.trustedBy') || 'TRUSTED BY'}
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-primary-dark mb-4">
                {t('pages.faq.title') || 'Frequently Asked Questions'}
              </h2>
            </div>

            {/* FAQ Items with custom scrollbar - Fixed to show 4 items */}
            <div
              ref={faqContainerRef}
              className="space-y-4 h-[600px] overflow-y-auto pr-2 custom-scrollbar"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#10b981 transparent'
              }}
            >
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  data-faq-index={index}
                  className={`roun-xl shadow-md transition-all duration-300 overflow-hidden ${openIndex === index
                      ? 'bg-primary/10 border-2 border-primary/30'
                      : 'bg-transparent border border-primary/20 hover:border-primary/40'
                    }`}
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none group"
                  >
                    <span className={`text-base md:text-lg font-semibold flex-1 pr-4 ${openIndex === index ? 'text-primary-dark' : 'text-gray-800 group-hover:text-primary-dark'
                      } transition-colors`}>
                      {faq.question}
                    </span>
                    <div className={`flex-shrink-0 w-8 h-8 roun-full flex items-center justify-center transition-all duration-300 ${openIndex === index
                        ? 'bg-primary text-white rotate-45'
                        : 'bg-primary/20 text-primary-dark group-hover:bg-primary/30'
                      }`}>
                      {openIndex === index ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      )}
                    </div>
                  </button>

                  {openIndex === index && (
                    <div className="px-6 pb-5">
                      <div className="pt-2 border-t border-primary/20">
                        <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #10b981 0%, #059669 100%);
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #059669 0%, #047857 100%);
          background-clip: padding-box;
        }
        
        /* For Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #10b981 transparent;
        }
      `}</style>
    </div>
  );
};

export default FAQ;
