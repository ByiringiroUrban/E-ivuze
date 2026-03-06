import React from 'react';
import { LoadingComponents } from './LoadingComponents';

const GlobalLoader = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" />
            <div className="relative z-10">
                <LoadingComponents.PageLoader text="Loading OneHealth..." />
            </div>
        </div>
    );
};

export default GlobalLoader;
