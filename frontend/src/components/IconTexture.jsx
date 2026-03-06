import React from 'react';
import { 
  FaHeartbeat, 
  FaStethoscope, 
  FaHospital, 
  FaPills, 
  FaUserMd, 
  FaSyringe,
  FaHeart,
  FaLungs,
  FaBrain,
  FaTooth,
  FaEye,
  FaMicroscope
} from 'react-icons/fa';

const IconTexture = ({ className = '', opacity = 0.1, size = 20, spacing = 40 }) => {
  const icons = [
    FaHeartbeat, FaStethoscope, FaHospital, FaPills, 
    FaUserMd, FaSyringe, FaHeart, FaLungs, 
    FaBrain, FaTooth, FaEye, FaMicroscope
  ];

  const iconStyle = {
    opacity,
    fontSize: `${size}px`,
  };

  return (
    <div 
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{
        backgroundImage: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent ${spacing}px,
          rgba(0,0,0,0) ${spacing}px,
          rgba(0,0,0,0) ${spacing * 2}px
        )`,
      }}
    >
      {Array.from({ length: 50 }).map((_, i) => {
        const Icon = icons[i % icons.length];
        return (
          <Icon
            key={i}
            style={{
              ...iconStyle,
              position: 'absolute',
              left: `${(i * 37) % 100}%`,
              top: `${(i * 23) % 100}%`,
              transform: `rotate(${(i * 15) % 360}deg)`,
            }}
            className="text-current"
          />
        );
      })}
    </div>
  );
};

export default IconTexture;

