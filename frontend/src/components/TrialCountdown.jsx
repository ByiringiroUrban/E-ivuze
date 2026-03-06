import React, { useState, useEffect } from 'react';

const TrialCountdown = ({ trialEndsAt, onExpired }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    weeks: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!trialEndsAt) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(trialEndsAt).getTime();
      const difference = end - now;

      if (difference <= 0) {
        setExpired(true);
        if (onExpired) onExpired();
        return {
          days: 0,
          weeks: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        };
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const weeks = Math.floor(days / 7);
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return { days, weeks, hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      if (newTimeLeft.days === 0 && newTimeLeft.hours === 0 && newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
        setExpired(true);
        if (onExpired) onExpired();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [trialEndsAt, onExpired]);

  if (expired) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
        <p className="text-red-800 font-semibold text-lg">⚠️ Trial Period Expired</p>
        <p className="text-red-600 text-sm mt-1">Please subscribe to continue using our services.</p>
      </div>
    );
  }

  return (
    <div className="bg-primary-50 border-2 border-primary-200 rounded-lg p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-primary-800">Trial Period</h3>
          <p className="text-sm text-primary-600">Your 3-month trial ends on {new Date(trialEndsAt).toLocaleDateString()}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg p-3 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-primary">{timeLeft.days}</p>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Days</p>
        </div>
        <div className="bg-white rounded-lg p-3 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-primary">{timeLeft.weeks}</p>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Weeks</p>
        </div>
        <div className="bg-white rounded-lg p-3 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-primary">{String(timeLeft.hours).padStart(2, '0')}</p>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Hours</p>
        </div>
        <div className="bg-white rounded-lg p-3 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-primary">{String(timeLeft.minutes).padStart(2, '0')}</p>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Minutes</p>
        </div>
        <div className="bg-white rounded-lg p-3 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-primary">{String(timeLeft.seconds).padStart(2, '0')}</p>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Seconds</p>
        </div>
      </div>
    </div>
  );
};

export default TrialCountdown;

