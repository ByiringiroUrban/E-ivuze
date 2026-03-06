import React from 'react';

const DepartmentsSection = () => {
  const departments = [
    {
      icon: (
        <svg className="w-12 h-12 text-secondary" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
        </svg>
      ),
      title: 'General Practitioners',
      description: 'Expert general physicians providing comprehensive healthcare services and consultations.'
    },
    {
      icon: (
        <svg className="w-12 h-12 text-secondary" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"/>
        </svg>
      ),
      title: 'Emergency Care',
      description: '24/7 emergency medical services with experienced staff ready to help.'
    },
    {
      icon: (
        <svg className="w-12 h-12 text-secondary" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 100-4V6z"/>
        </svg>
      ),
      title: 'Pediatric Care',
      description: 'Specialized care for infants, children, and adolescents with dedicated pediatricians.'
    },
    {
      icon: (
        <svg className="w-12 h-12 text-secondary" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
        </svg>
      ),
      title: 'Cardiology',
      description: 'Expert heart specialists providing comprehensive cardiac care and diagnostics.'
    },
    {
      icon: (
        <svg className="w-12 h-12 text-secondary" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
        </svg>
      ),
      title: 'Ophthalmology',
      description: 'Complete eye care services from routine exams to advanced treatments.'
    },
    {
      icon: (
        <svg className="w-12 h-12 text-secondary" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
        </svg>
      ),
      title: 'Diagnostics',
      description: 'State-of-the-art diagnostic facilities with advanced imaging and lab services.'
    },
  ];

  return (
    <div className='bg-light-bg py-16 px-6 md:px-10 lg:px-20'>
      <h2 className='text-3xl font-bold text-center text-accent mb-4'>DEPARTMENTS</h2>
      <div className='w-20 h-1 bg-secondary mx-auto mb-12'></div>
      
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto'>
        {departments.map((dept, index) => (
          <div key={index} className='bg-white p-6 roun-lg shadow-md hover:shadow-xl transition-shadow duration-300'>
            <div className='flex flex-col items-center text-center'>
              <div className='mb-4'>
                {dept.icon}
              </div>
              <h3 className='text-xl font-semibold text-accent mb-3'>{dept.title}</h3>
              <p className='text-gray-text text-sm leading-relaxed'>{dept.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DepartmentsSection;
