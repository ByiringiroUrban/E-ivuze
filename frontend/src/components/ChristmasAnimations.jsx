import React, { useEffect, useState, useContext } from 'react'
import { AppContext } from '../context/AppContext';

const ChristmasAnimations = () => {
  const { isChristmasThemeActive } = useContext(AppContext);
  const [snowflakes, setSnowflakes] = useState([])

  if (!isChristmasThemeActive) return null;


  useEffect(() => {
    // Create snowflakes
    const newSnowflakes = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDelay: Math.random() * 5,
      animationDuration: 3 + Math.random() * 4,
      size: 4 + Math.random() * 8,
      opacity: 0.4 + Math.random() * 0.4,
      drift: (Math.random() - 0.5) * 20
    }))
    setSnowflakes(newSnowflakes)
  }, [])

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {/* Falling Snowflakes */}
        <div className="absolute inset-0">
          {snowflakes.map((flake) => (
            <div
              key={flake.id}
              className="absolute text-white select-none"
              style={{
                left: `${flake.left}%`,
                top: '-10px',
                animationDelay: `${flake.animationDelay}s`,
                animationDuration: `${flake.animationDuration}s`,
                animationName: 'snowfall',
                animationIterationCount: 'infinite',
                animationTimingFunction: 'linear',
                fontSize: `${flake.size}px`,
                opacity: flake.opacity,
                transform: `translateX(${flake.drift}px)`
              }}
            >
              ❄
            </div>
          ))}
        </div>

        {/* Christmas Lights Border Effect */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-green-500 via-yellow-500 to-red-500 opacity-60">
          <div
            className="h-full bg-gradient-to-r from-red-600 via-green-600 via-yellow-600 to-red-600"
            style={{
              animation: 'shimmer 2s linear infinite',
              backgroundSize: '200% 100%'
            }}
          />
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes snowfall {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: translateY(50vh) translateX(10px) rotate(180deg);
            opacity: 0.8;
          }
          100% {
            transform: translateY(100vh) translateX(0) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </>
  )
}

export default ChristmasAnimations

