import { useState, useEffect, useRef } from 'react';

/**
 * Hook that animates a number counting up from 0 to target when element enters viewport
 * @param {number|string} target - Target number to count to (can be string with + suffix)
 * @param {number} duration - Animation duration in milliseconds
 * @param {number} threshold - Intersection observer threshold (0-1)
 * @returns {object} - { count, ref, isVisible }
 */
export const useCountUp = (target, duration = 2000, threshold = 0.1) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  // Parse target value (handle strings like "125+")
  const parseTarget = (val) => {
    if (typeof val === 'string') {
      const numStr = val.replace(/[^0-9]/g, '');
      return parseInt(numStr, 10) || 0;
    }
    return typeof val === 'number' ? val : 0;
  };

  const targetNumber = parseTarget(target);
  const hasSuffix = typeof target === 'string' && target.includes('+');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold, isVisible]);

  useEffect(() => {
    if (!isVisible || hasAnimated) return;

    const startTime = Date.now();
    const startValue = 0;
    const endValue = targetNumber;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(startValue + (endValue - startValue) * easeOut);

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(endValue);
        setHasAnimated(true);
      }
    };

    // Small delay to ensure smooth start
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(animate);
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [isVisible, targetNumber, duration, hasAnimated]);

  const displayValue = hasSuffix ? `${count}+` : count.toString();

  return { count: displayValue, ref, isVisible };
};

