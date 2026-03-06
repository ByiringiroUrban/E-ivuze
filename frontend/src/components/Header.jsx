import React from 'react';
import { assets } from '../assets/assets';
import IconTexture from './IconTexture';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const { t } = useTranslation();
  return (
    <div className='flex flex-col md:flex-row bg-gradient-to-br from-primary via-primary-dark to-primary roun-lg px-6 md:px-10 lg:px-20 overflow-hidden relative'>
      <IconTexture opacity={0.15} size={24} className="text-white" />
      {/* ----------Left Side-------- */}
      <div className='md:w-1/2 flex flex-col items-start justify-center gap-4 py-10 m-auto md:mb-[-30px]'>
        <p className='text-3xl md:text-4xl lg:text-5xl text-white font-semibold leading-tight md:leading-tight lg:leading-tight'>
          {t('header.heroTitle')}
        </p>
        <div className='flex flex-col md:flex-row items-center gap-3 text-white text-sm font-light'>
          <img className='w-28' src={assets.group_profiles} alt="" />
          <p>
            {t('header.heroSubtitle')}
          </p>
        </div>
        <a
          href="#speciality"
          className='flex items-center gap-2 bg-primary-light px-8 py-3 roun-full text-primary-dark text-sm m-auto md:m-10 hover:bg-primary hover:text-white hover:scale-105 transition-all duration-300'
        >
          {t('header.bookCta')} <img className='w-3' src={assets.arrow_icon} alt="" />
        </a>
      </div>

      {/* ----------Right Side-------- */}
      <div className='md:w-1/2 relative flex items-end justify-end overflow-hidden'>
        <img
          className='w-full h-auto md:max-w-md lg:max-w-lg xl:max-w-xl object-contain object-bottom md:object-right'
          src={assets.header_img}
          alt="Doctors Banner"
        />
      </div>
    </div>
  );
};

export default Header;
