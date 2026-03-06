import React from 'react';

const TestimonialSection = () => {
  return (
    <div className='bg-light-bg py-16 px-6 md:px-10 lg:px-20'>
      <div className='max-w-4xl mx-auto text-center'>
        <div className='mb-8'>
          <img 
            src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop" 
            alt="Patient" 
            className='w-32 h-32 roun-full mx-auto object-cover border-4 border-secondary shadow-lg'
          />
        </div>
        <div className='text-6xl text-secondary mb-4'>"</div>
        <p className='text-xl text-gray-text leading-relaxed mb-6 italic'>
          "As the number of acute-care outpatients to outpace the number of desktop users, 
          it should go without saying that designers need to change where they focus their 
          strategy with a modern website."
        </p>
        <div className='mb-2'>
          <h4 className='text-xl font-semibold text-accent'>Prof Goliber</h4>
          <p className='text-gray-text'>Chief Medical Officer</p>
        </div>
        <div className='flex justify-center gap-2 mt-6'>
          <div className='w-2 h-2 roun-full bg-secondary'></div>
          <div className='w-2 h-2 roun-full bg-gray-300'></div>
          <div className='w-2 h-2 roun-full bg-gray-300'></div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialSection;
