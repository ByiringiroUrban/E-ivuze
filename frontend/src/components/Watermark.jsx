import React from 'react';
import { assets } from '../assets/assets';

const Watermark = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
      <img 
        src={assets.logo} 
        alt="Watermark" 
        className="w-96 h-96 opacity-5 grayscale"
        style={{ maxWidth: '60vw', maxHeight: '60vh' }}
      />
    </div>
  );
};

export default Watermark;

