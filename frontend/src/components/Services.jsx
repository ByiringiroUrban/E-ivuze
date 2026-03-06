import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import IconTexture from './IconTexture';
import { 
  FaCalendarCheck, 
  FaVideo, 
  FaFileMedical, 
  FaHospital,
  FaMoneyBill,
  FaPills,
  FaStore,
  FaBell,
  FaRobot
} from 'react-icons/fa';

const Services = () => {
  const { t } = useTranslation();
  const leftDotsRef = useRef(null);
  const rightDotsRef = useRef(null);

  useEffect(() => {
    // Create animated dot patterns
    const createDotPattern = (container, direction = 'normal') => {
      if (!container) return;
      
      const dots = [];
      const rows = 10;
      const cols = 15;
      const spacing = 35;
      
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const dot = document.createElement('div');
          dot.className = 'absolute w-2 h-2 bg-primary/30 roun-full';
          dot.style.left = `${j * spacing}px`;
          dot.style.top = `${i * spacing}px`;
          dot.style.animation = `float${direction === 'reverse' ? 'Reverse' : ''} ${4 + Math.random() * 3}s ease-in-out infinite`;
          dot.style.animationDelay = `${(i * j) * 0.05}s`;
          container.appendChild(dot);
          dots.push(dot);
        }
      }
      
      return dots;
    };

    if (leftDotsRef.current && rightDotsRef.current) {
      const leftDots = createDotPattern(leftDotsRef.current, 'normal');
      const rightDots = createDotPattern(rightDotsRef.current, 'reverse');
      
      return () => {
        leftDots?.forEach(dot => dot.remove());
        rightDots?.forEach(dot => dot.remove());
      };
    }
  }, []);

  const services = [
    {
      icon: FaCalendarCheck,
      iconColor: 'text-red-500',
      title: t('pages.services.onlineAppointments.title') || 'ONLINE APPOINTMENTS',
      description: t('pages.services.onlineAppointments.description') || 'Book appointments with trusted doctors instantly. Browse by specialty, view availability, and schedule consultations at your convenience.'
    },
    {
      icon: FaVideo,
      iconColor: 'text-primary-500',
      title: t('pages.services.telemedicine.title') || 'TELEMEDICINE',
      description: t('pages.services.telemedicine.description') || 'Connect with healthcare providers through secure video consultations. Get medical advice from the comfort of your home.'
    },
    {
      icon: FaFileMedical,
      iconColor: 'text-primary-500',
      title: t('pages.services.healthRecords.title') || 'HEALTH RECORDS',
      description: t('pages.services.healthRecords.description') || 'Manage your medical records, prescriptions, and appointment history in one secure place. Access your health information anytime.'
    },
    {
      icon: FaHospital,
      iconColor: 'text-primary-500',
      title: t('pages.services.hospitalManagement.title') || 'HOSPITAL MANAGEMENT',
      description: t('pages.services.hospitalManagement.description') || 'Comprehensive platform for hospitals to manage doctors, patients, and transfers. Streamline healthcare operations efficiently.'
    }
    ,
    // Additional services available in the system
    {
      icon: FaMoneyBill,
      iconColor: 'text-teal-500',
      title: t('pages.services.payments.title') || 'PAYMENTS',
      description: t('pages.services.payments.description') || 'Secure payment processing for appointments and services. Submit payment proof and track approvals.'
    },
    {
      icon: FaPills,
      iconColor: 'text-purple-500',
      title: t('pages.services.prescriptions.title') || 'PRESCRIPTIONS',
      description: t('pages.services.prescriptions.description') || 'View and manage prescriptions issued by doctors. Download and share with pharmacies.'
    },
    {
      icon: FaStore,
      iconColor: 'text-orange-500',
      title: t('pages.services.pharmacy.title') || 'PHARMACY SERVICES',
      description: t('pages.services.pharmacy.description') || 'Integrated pharmacy inventory, orders and fulfillment — search, order and manage medicines.'
    },
    {
      icon: FaBell,
      iconColor: 'text-yellow-600',
      title: t('pages.services.notifications.title') || 'NOTIFICATIONS',
      description: t('pages.services.notifications.description') || 'Real-time notifications for appointments, approvals and messages.'
    },
    {
      icon: FaRobot,
      iconColor: 'text-indigo-500',
      title: t('pages.services.aiAssistant.title') || 'AI ASSISTANT',
      description: t('pages.services.aiAssistant.description') || 'AI-powered assistant to help with triage, FAQs and patient support.'
    }
  ];

  return (
    <div className="relative py-16 md:py-24  overflow-hidden">
        <IconTexture opacity={0.15} size={24} className="text-white" />
      {/* Animated dot patterns on opposite sides */}
      <div 
        ref={leftDotsRef}
        className="absolute left-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-40 pointer-events-none"
        style={{ 
          animation: 'carouselLeft 25s linear infinite',
          transform: 'translateY(-50%)'
        }}
      />
      <div 
        ref={rightDotsRef}
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-40 pointer-events-none"
        style={{ 
          animation: 'carouselRight 25s linear infinite',
          transform: 'translateY(-50%)'
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-dark mb-4">
            {t('pages.services.title') || 'Services'}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {t('pages.services.description') || 'Our support team will get assistance from AI-powered suggestions, making it quicker than ever to handle support requests.'}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div
                key={index}
                className="bg-transparent border border-primary/20 roun-xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/40 relative group"
              >
                <div className="flex items-start gap-4">
                  <div className={`${service.iconColor} text-3xl lg:text-4xl flex-shrink-0`}>
                    <IconComponent />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg lg:text-xl font-bold text-gray-800 mb-2 group-hover:text-primary-dark transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-10px);
            opacity: 0.4;
          }
        }
        
        @keyframes floatReverse {
          0%, 100% {
            transform: translateY(0px);
            opacity: 0.2;
          }
          50% {
            transform: translateY(10px);
            opacity: 0.4;
          }
        }
        
        @keyframes carouselLeft {
          0% {
            transform: translateY(-50%) translateX(0) rotate(0deg);
          }
          100% {
            transform: translateY(-50%) translateX(-150px) rotate(360deg);
          }
        }
        
        @keyframes carouselRight {
          0% {
            transform: translateY(-50%) translateX(0) rotate(0deg);
          }
          100% {
            transform: translateY(-50%) translateX(150px) rotate(-360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Services;
