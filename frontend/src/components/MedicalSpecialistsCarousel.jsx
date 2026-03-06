import React, { useState } from 'react';

const MedicalSpecialistsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const specialists = [
    {
      name: 'Dr. Sarah Johnson',
      specialty: 'Cardiologist',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=400&fit=crop'
    },
    {
      name: 'Dr. Michael Chen',
      specialty: 'Neurologist',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=400&fit=crop'
    },
    {
      name: 'Dr. Emily White',
      specialty: 'Pediatrician',
      image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=300&h=400&fit=crop'
    },
    {
      name: 'Dr. James Brown',
      specialty: 'Orthopedic',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=400&fit=crop'
    },
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % specialists.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + specialists.length) % specialists.length);
  };

  return (
    <div className='bg-primary py-16 px-6 md:px-10 lg:px-20'>
      <div className='max-w-7xl mx-auto'>
        <div className='flex justify-between items-center mb-8'>
          <h2 className='text-3xl font-bold text-white'>MEDICAL SPECIALISTS</h2>
          <button className='text-white hover:text-secondary transition-colors'>
            VIEW ALL →
          </button>
        </div>
        
        <div className='relative'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {specialists.map((specialist, index) => (
              <div 
                key={index} 
                className='bg-white roun-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300'
              >
                <img 
                  src={specialist.image} 
                  alt={specialist.name} 
                  className='w-full h-80 object-cover'
                />
                <div className='p-4 text-center'>
                  <h3 className='font-semibold text-accent text-lg'>{specialist.name}</h3>
                  <p className='text-secondary text-sm'>{specialist.specialty}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className='flex justify-center gap-2 mt-6'>
            <button 
              onClick={prevSlide}
              className='w-2 h-2 roun-full bg-white/50 hover:bg-white transition-colors'
            ></button>
            <button 
              onClick={nextSlide}
              className='w-2 h-2 roun-full bg-white hover:bg-white/50 transition-colors'
            ></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalSpecialistsCarousel;
