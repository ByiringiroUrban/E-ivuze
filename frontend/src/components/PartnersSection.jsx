import React from 'react';

const PartnersSection = () => {
  return (
    <div className='bg-secondary py-12 px-6 md:px-10 lg:px-20'>
      <div className='max-w-7xl mx-auto'>
        <div className='grid grid-cols-3 gap-8 items-center'>
          <div className='flex justify-center'>
            <div className='bg-white/10 roun-lg p-6'>
              <span className='text-white text-xl font-bold'>JOHN HOPKINS</span>
            </div>
          </div>
          <div className='flex justify-center'>
            <div className='bg-white/10 roun-lg p-6'>
              <span className='text-white text-xl font-bold'>CARDIOLOGY</span>
            </div>
          </div>
          <div className='flex justify-center'>
            <div className='bg-white/10 roun-lg p-6'>
              <span className='text-white text-xl font-bold'>ROSER HOSPITAL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnersSection;
