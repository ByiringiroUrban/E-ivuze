import React from 'react';

const StatsSection = () => {
  const stats = [
    {
      icon: (
        <svg className="w-12 h-12 text-secondary" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
        </svg>
      ),
      number: '1991',
      label: 'Established'
    },
    {
      icon: (
        <svg className="w-12 h-12 text-secondary" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
        </svg>
      ),
      number: '128',
      label: 'Doctors'
    },
    {
      icon: (
        <svg className="w-12 h-12 text-secondary" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
        </svg>
      ),
      number: '1412',
      label: 'Patients'
    },
    {
      icon: (
        <svg className="w-12 h-12 text-secondary" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
          <path d="M3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zm14.38 0l-1.69.723v4.102a8.969 8.969 0 011.05-.174 1 1 0 00.89-.89 11.115 11.115 0 00-.25-3.762z"/>
        </svg>
      ),
      number: '125+',
      label: 'Awards'
    },
  ];

  return (
    <div className='py-16 px-6 md:px-10 lg:px-20 bg-white'>
      <div className='max-w-7xl mx-auto'>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
          {stats.map((stat, index) => (
            <div key={index} className='flex flex-col items-center text-center'>
              <div className='mb-4'>
                {stat.icon}
              </div>
              <h3 className='text-4xl font-bold text-accent mb-2'>{stat.number}</h3>
              <p className='text-gray-text uppercase text-sm'>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
