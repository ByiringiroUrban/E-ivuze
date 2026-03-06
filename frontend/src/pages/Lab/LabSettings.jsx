import React from 'react';
import DashboardHero from '../../components/DashboardHero';

const LabSettings = () => {
    return (
        <div className="bg-white min-h-screen px-4 sm:px-8 py-8 space-y-8">
            <DashboardHero
                eyebrow="Configuration"
                title="Settings"
                description="Manage your account settings and preferences."
            />
            <div className="bg-white border p-8 rounded-lg text-center text-gray-500">
                <p>Settings module coming soon.</p>
                {/* Could add password change here */}
            </div>
        </div>
    );
};

export default LabSettings;
