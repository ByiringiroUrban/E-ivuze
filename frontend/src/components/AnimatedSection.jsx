import React from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const AnimatedSection = ({ 
  children, 
  animation = 'fadeInUp', 
  delay = 0,
  className = '',
  threshold = 0.1 
}) => {
  const [ref, isVisible] = useScrollAnimation({ threshold });

  const animationClasses = {
    fadeInUp: 'animate-fade-in-up',
    fadeInDown: 'animate-fade-in-down',
    fadeInLeft: 'animate-fade-in-left',
    fadeInRight: 'animate-fade-in-right',
    fadeIn: 'animate-fade-in',
    scaleIn: 'animate-scale-in',
    slideInUp: 'animate-slide-in-up'
  };

  const delayClasses = {
    0: '',
    100: 'animate-delay-100',
    200: 'animate-delay-200',
    300: 'animate-delay-300',
    400: 'animate-delay-400',
    500: 'animate-delay-500'
  };

  return (
    <div
      ref={ref}
      className={`
        ${!isVisible ? 'opacity-0' : `${animationClasses[animation]} ${delayClasses[delay]}`}
        ${className}
      `}
      style={!isVisible ? { transform: animation === 'fadeInUp' ? 'translateY(30px)' : animation === 'fadeInDown' ? 'translateY(-30px)' : animation === 'fadeInLeft' ? 'translateX(-30px)' : animation === 'fadeInRight' ? 'translateX(30px)' : animation === 'scaleIn' ? 'scale(0.9)' : 'none' } : {}}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;

