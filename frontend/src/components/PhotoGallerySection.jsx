import React from 'react';

const PhotoGallerySection = () => {
  const photos = [
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1581595220975-119360b1c63b?w=400&h=300&fit=crop',
  ];

  return (
    <div className='bg-light-bg py-16 px-6 md:px-10 lg:px-20'>
      <div className='max-w-7xl mx-auto'>
        <div className='flex justify-between items-center mb-8'>
          <div>
            <h2 className='text-3xl font-bold text-accent mb-2'>PHOTO GALLERY</h2>
            <p className='text-gray-text'>
              Take a look at our state-of-the-art facilities and dedicated healthcare professionals 
              providing quality care.
            </p>
          </div>
          <div className='flex gap-2'>
            <button className='w-10 h-10 roun-full bg-secondary text-white flex items-center justify-center hover:bg-primary transition-colors'>
              ←
            </button>
            <button className='w-10 h-10 roun-full bg-secondary text-white flex items-center justify-center hover:bg-primary transition-colors'>
              →
            </button>
          </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {photos.map((photo, index) => (
            <div key={index} className='relative overflow-hidden roun-lg group cursor-pointer'>
              <img 
                src={photo} 
                alt={`Gallery ${index + 1}`} 
                className='w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300'
              />
              <div className='absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors duration-300'></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PhotoGallerySection;
