import React from 'react';
import { LoadingComponents } from './LoadingComponents';

const LoadingButton = ({ loading, disabled, className = '', children, ...props }) => {
    const isDisabled = disabled || loading;
    return (
        <button
            disabled={isDisabled}
            className={`${className} ${isDisabled ? 'opacity-75 cursor-not-allowed' : ''} relative flex items-center justify-center gap-2`}
            {...props}
        >
            {loading && <LoadingComponents.ButtonLoader />}
            <span>{children}</span>
        </button>
    );
};

export default LoadingButton;


