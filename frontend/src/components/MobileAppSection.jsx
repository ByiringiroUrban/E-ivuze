import React from 'react';

const MobileAppSection = () => {
  return (
    <div className='py-16 px-6 md:px-10 lg:px-20'>
      <div className='max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
        {/* Left - Mobile App Mockup */}
        <div className='flex justify-center'>
          <div className='relative'>
            <img 
              src="https://via.placeholder.com/300x600/E8E8E8/666666?text=App+Screenshot" 
              alt="Mobile App" 
              className='roun-3xl shadow-2xl'
            />
            <div className='absolute -right-20 top-20'>
              <img 
                src="https://via.placeholder.com/150x150/4A8FBF/FFFFFF?text=Watch" 
                alt="Smartwatch" 
                className='roun-full shadow-xl'
              />
            </div>
          </div>
        </div>

        {/* Right - Content */}
        <div>
          <h3 className='text-secondary text-lg font-semibold mb-2'>GET THE LINK TO DOWNLOAD THE APP</h3>
          <h2 className='text-4xl font-bold mb-4'>
            <span className='text-accent'>ANYTIME</span>
            <span className='text-secondary'> & ANYWHERE</span>
          </h2>
          <p className='text-gray-text leading-relaxed mb-8'>
            The Best Medical App for you & your family. Healthcare For you anytime, anywhere. 
            Get our mobile app and access quality healthcare services on the go. Book appointments, 
            consult with doctors, and manage your health records all in one place.
          </p>
          <div className='flex gap-4'>
            <img 
              src="https://via.placeholder.com/150x50/000000/FFFFFF?text=App+Store" 
              alt="Download on App Store" 
              className='h-12 cursor-pointer hover:opacity-80 transition-opacity'
            />
            <img 
              src="https://via.placeholder.com/150x50/000000/FFFFFF?text=Google+Play" 
              alt="Get it on Google Play" 
              className='h-12 cursor-pointer hover:opacity-80 transition-opacity'
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileAppSection;
