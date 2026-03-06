import React from 'react';
import { toast } from 'react-toastify';
import CustomToast from '../components/CustomToast';

// Save original methods to avoid infinite loops if we need them
const originalToast = { ...toast };

/**
 * Global Toast Override
 * Intercepts default toast calls and renders the CustomToast component
 */

const overrideToast = () => {

    // Override success
    toast.success = (content, options) => {
        return originalToast.success(
            <CustomToast
                type="success"
                message={content}
                title={options?.title} // Allow passing title in options if needed
            />,
            {
                ...options,
                className: 'custom-toast-container',
                bodyClassName: 'custom-toast-body',
                style: { background: 'transparent', boxShadow: 'none', padding: 0, minHeight: 0 }
            }
        );
    };

    // Override error
    toast.error = (content, options) => {
        return originalToast.error(
            <CustomToast type="error" message={content} title={options?.title} />,
            {
                ...options,
                className: 'custom-toast-container',
                style: { background: 'transparent', boxShadow: 'none', padding: 0, minHeight: 0 }
            }
        );
    };

    // Override warning (react-toastify uses 'warn' sometimes, but let's standardise)
    toast.warn = (content, options) => {
        return originalToast.warn(
            <CustomToast type="warning" message={content} title={options?.title} />,
            {
                ...options,
                className: 'custom-toast-container',
                style: { background: 'transparent', boxShadow: 'none', padding: 0, minHeight: 0 }
            }
        );
    };

    // Override info
    toast.info = (content, options) => {
        return originalToast.info(
            <CustomToast type="info" message={content} title={options?.title} />,
            {
                ...options,
                className: 'custom-toast-container',
                style: { background: 'transparent', boxShadow: 'none', padding: 0, minHeight: 0 }
            }
        );
    };
};

export default overrideToast;
