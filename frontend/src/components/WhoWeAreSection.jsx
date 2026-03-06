import React from 'react';

const WhoWeAreSection = () => {
  return (
    <div className='py-16 px-6 md:px-10 lg:px-20'>
      <div className='max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
        {/* Left Content */}
        <div>
          <div className='mb-6'>
            <div className="text-xl font-bold bg-primary text-white p-2 inline-block">e-Ivuze</div>
          </div>
          <h2 className='text-3xl font-bold text-accent mb-4'>WHO WE ARE</h2>
          <h3 className='text-2xl font-semibold text-primary mb-6'>
            WE ARE COMMITTED TO PROVIDE QUALITY HEALTHCARE IN RWANDA
          </h3>
          <p className='text-gray-text leading-relaxed mb-6'>
            Our healthcare facility in Kigali provides world-class medical services with a team of
            experienced Rwandan doctors and international specialists. We utilize state-of-the-art equipment and
            follow the latest medical protocols to ensure the best patient care possible.
          </p>
          <p className='text-gray-text leading-relaxed mb-8'>
            With decades of combined experience, our medical professionals are dedicated
            to your health and wellbeing. We offer comprehensive healthcare solutions for
            the entire family in a comfortable and caring environment inspired by Rwanda's spirit of excellence.
          </p>
          <button className='bg-primary text-white px-8 py-3 rounded-full hover:bg-primary-dark transition-colors duration-300'>
            READ MORE
          </button>
        </div>

        {/* Right Image */}
        <div className='relative'>
          <img
            src="/rwanda_doctor.png"
            alt="Healthcare Professional"
            className='w-full h-auto rounded-lg shadow-2xl border-4 border-white'
          />
        </div>
      </div>
    </div>
  );
};

export default WhoWeAreSection;
