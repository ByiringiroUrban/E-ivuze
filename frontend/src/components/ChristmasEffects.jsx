
import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';

const ChristmasEffects = () => {
    const { isChristmasThemeActive } = useContext(AppContext);

    if (!isChristmasThemeActive) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            <style>
                {`
                    @keyframes snow {
                        0% { transform: translateY(-10vh) translateX(0); opacity: 1; }
                        100% { transform: translateY(110vh) translateX(20px); opacity: 0.3; }
                    }
                    .snowflake {
                        position: absolute;
                        top: -10px;
                        color: #FFF;
                        font-size: 1em;
                        font-family: Arial;
                        text-shadow: 0 0 1px #000;
                        animation: snow 10s linear infinite;
                    }
                    .snowflake:nth-child(2n) { animation-duration: 7s; animation-delay: 1s; }
                    .snowflake:nth-child(3n) { animation-duration: 12s; animation-delay: 2s; }
                    .snowflake:nth-child(4n) { animation-duration: 8s; animation-delay: 0s; }
                    
                    .festive-border-t {
                        background: repeating-linear-gradient(45deg, #ff0000, #ff0000 10px, #ffffff 10px, #ffffff 20px, #008000 20px, #008000 30px, #ffffff 30px, #ffffff 40px);
                        height: 5px;
                        width: 100%;
                        position: fixed;
                        top: 0;
                        left: 0;
                        z-index: 9999;
                    }
                `}
            </style>

            <div className="festive-border-t"></div>

            {/* Snowflakes */}
            {[...Array(20)].map((_, i) => (
                <div
                    key={i}
                    className="snowflake"
                    style={{
                        left: `${Math.random() * 100}vw`,
                        animationDelay: `${Math.random() * 5}s`,
                        opacity: Math.random(),
                        fontSize: `${Math.random() + 0.5}em`
                    }}
                >
                    ❄
                </div>
            ))}
        </div>
    );
};

export default ChristmasEffects;
