import React from 'react';
import { useTranslation } from 'react-i18next';

const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <div className='px-6 md:px-10 lg:px-20 py-10'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {/* Main Hero Text - Takes up 1 column */}
        <div className='bg-primary-dark text-white p-8 rounded-lg flex flex-col justify-center'>
          <h1 className='text-3xl md:text-4xl font-bold mb-2'>
            BRINGING HEALTH
          </h1>
          <p className='text-xl md:text-2xl'>
            TO LIFE FOR THE
          </p>
          <p className='text-xl md:text-2xl font-semibold'>
            WHOLE FAMILY
          </p>
        </div>

        {/* Family Health Card with Image */}
        <div className='relative bg-gray-200 rounded-lg overflow-hidden h-64'>
          <img
            src="https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=300&fit=crop"
            alt="Family Health"
            className='w-full h-full object-cover'
          />
          <div className='absolute bottom-0 left-0 right-0 bg-primary-dark/90 text-white p-4'>
            <h3 className='text-lg font-semibold'>FAMILY HEALTH</h3>
            <p className='text-sm'>Get ready for healthy life</p>
          </div>
        </div>

        {/* Contact Info Card */}
        <div className='bg-secondary text-white p-6 rounded-lg'>
          <h3 className='text-xl font-bold mb-4'>CONTACT INFO</h3>
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                <path d='M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z' />
              </svg>
              <span>+800 123 45 67</span>
            </div>
            <div className='flex items-center gap-2'>
              <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                <path d='M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z' />
                <path d='M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z' />
              </svg>
              <span>contact@website.com</span>
            </div>
            <div className='flex items-center gap-2'>
              <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z' clipRule='evenodd' />
              </svg>
              <span>123 Main Street</span>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row - Opening Hours and Newsletter */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4'>
        {/* Opening Hours */}
        <div className='bg-primary text-white p-6 rounded-lg'>
          <h3 className='text-xl font-bold mb-4'>OPENING HOURS</h3>
          <div className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span>Mon - Wed</span>
              <span>8:00 - 17:00</span>
            </div>
            <div className='flex justify-between'>
              <span>Thu - Fri</span>
              <span>9:00 - 17:00</span>
            </div>
            <div className='flex justify-between'>
              <span>Sat - Sun</span>
              <span>10:00 - 17:00</span>
            </div>
          </div>
        </div>

        {/* Newsletter Card with Image */}
        <div className='relative bg-gray-200 rounded-lg overflow-hidden h-48'>
          <img
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop"
            alt="Newsletter"
            className='w-full h-full object-cover'
          />
          <div className='absolute bottom-0 left-0 right-0 bg-primary-dark/90 text-white p-4'>
            <h3 className='text-lg font-semibold'>NEWSLETTER</h3>
          </div>
        </div>

        {/* Discount Card with Image */}
        <div className='relative bg-gray-200 rounded-lg overflow-hidden h-48'>
          <img
            src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop"
            alt="Discount"
            className='w-full h-full object-cover'
          />
          <div className='absolute bottom-0 left-0 right-0 bg-primary-dark/90 text-white p-4'>
            <h3 className='text-lg font-semibold'>20% DISCOUNT</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
