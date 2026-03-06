import React from 'react';

const LatestNewsAppointment = () => {
  const news = [
    {
      date: '10 MAR 19',
      title: '7 Reasons to Women Doctor\'s Help',
      description: 'Providing exceptional care with understanding and expertise tailored for women\'s health needs.'
    },
    {
      date: '10 APR 19',
      title: 'Top Hacks Tips for 2024',
      description: 'Essential health tips and preventive care strategies for maintaining optimal wellness.'
    },
    {
      date: '11 MAY 19',
      title: 'The Care of Meningococcal',
      description: 'Understanding symptoms, treatment options, and prevention of meningococcal infections.'
    }
  ];

  return (
    <div className='bg-light-bg py-16 px-6 md:px-10 lg:px-20'>
      <div className='max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12'>
        {/* Latest News Section */}
        <div>
          <h2 className='text-3xl font-bold text-accent mb-8'>LATEST NEWS</h2>
          <div className='space-y-6'>
            {news.map((item, index) => (
              <div key={index} className='flex gap-4 bg-white p-4 roun-lg shadow-sm hover:shadow-md transition-shadow'>
                <div className='flex-shrink-0'>
                  <div className='bg-secondary text-white w-16 h-16 roun-lg flex flex-col items-center justify-center'>
                    <span className='text-2xl font-bold'>{item.date.split(' ')[0]}</span>
                    <span className='text-xs'>{item.date.split(' ')[1]}</span>
                  </div>
                </div>
                <div>
                  <h3 className='font-semibold text-accent mb-2'>{item.title}</h3>
                  <p className='text-sm text-gray-text'>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Appointment Form */}
        <div className='bg-primary text-white p-8 roun-lg'>
          <h2 className='text-3xl font-bold mb-6'>MAKE AN APPOINTMENT</h2>
          <form className='space-y-4'>
            <div>
              <label className='block text-sm mb-2'>Find A Doctor</label>
              <select className='w-full px-4 py-2 roun-md text-gray-800'>
                <option>Select Doctor</option>
                <option>Dr. John Smith</option>
                <option>Dr. Sarah Johnson</option>
              </select>
            </div>
            <div>
              <label className='block text-sm mb-2'>Find A Service</label>
              <select className='w-full px-4 py-2 roun-md text-gray-800'>
                <option>Select Service</option>
                <option>General Consultation</option>
                <option>Specialist Consultation</option>
              </select>
            </div>
            <div>
              <label className='block text-sm mb-2'>Appointment Date</label>
              <input 
                type='date' 
                className='w-full px-4 py-2 roun-md text-gray-800'
              />
            </div>
            <button 
              type='submit'
              className='w-full bg-secondary hover:bg-secondary/90 text-white py-3 roun-md font-semibold transition-colors'
            >
              BOOK APPOINTMENT
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LatestNewsAppointment;
