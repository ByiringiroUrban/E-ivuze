import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const GoogleRoleSelection = ({ onSelectRole, googleUserData }) => {
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    onSelectRole(role);
  };

  return (
    <div className="w-full max-w-xl border border-border bg-white/95 shadow-2xl p-6 sm:p-8 space-y-5 text-sm text-zinc-700 rounded-lg">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-primary-dark">
          {t('pages.login.unifiedAccessLabel') || 'Unified Access'}
        </p>
        <h2 className="text-2xl font-semibold text-accent">
          {t('pages.login.selectRole') || 'Select Your Role'}
        </h2>
        <p className="text-muted-foreground">
          {t('pages.login.selectRoleDescription') || 'Please select whether you are registering as a Patient or Doctor'}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {['Patient', 'Doctor'].map(option => (
          <button
            type="button"
            key={option}
            onClick={() => handleRoleSelect(option)}
            className={`flex-1 min-w-[120px] border px-4 py-2.5 text-xs uppercase tracking-[0.35em] ${
              selectedRole === option ? 'bg-primary text-white border-primary' : 'border-border text-accent hover:border-primary/60'
            } transition`}
          >
            {t(`pages.login.${option.toLowerCase()}`)}
          </button>
        ))}
      </div>

      {googleUserData && (
        <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
          <p className="text-xs text-gray-600 mb-2">
            {t('pages.login.googleAccountInfo') || 'Google Account:'}
          </p>
          <p className="text-sm font-medium">{googleUserData.name}</p>
          <p className="text-xs text-gray-500">{googleUserData.email}</p>
        </div>
      )}
    </div>
  );
};

export default GoogleRoleSelection;

