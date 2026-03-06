import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { HospitalContext } from '../../context/HospitalContext';
import LanguageSwitch from '../../components/LanguageSwitch';
import { useTranslation } from 'react-i18next';

const HospitalPending = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { hToken, hospital, getHospitalDetails } = useContext(HospitalContext);

  useEffect(() => {
    if (!hToken) {
      navigate('/login');
      return;
    }

    if (hospital && hospital.status === 'APPROVED') {
      navigate('/hospital-dashboard');
      return;
    }

    // Fetch latest hospital status
    if (getHospitalDetails) {
      getHospitalDetails();
    }
  }, [hToken, hospital, navigate, getHospitalDetails]);

  const getStatusMessage = () => {
    if (!hospital) return { title: t('hospital.pending.loading'), message: t('hospital.pending.pleaseWait'), icon: '⏳' };

    switch (hospital.status) {
      case 'PENDING':
        return {
          title: t('hospital.pending.title'),
          message: t('hospital.pending.messagePending'),
          icon: '⏳'
        };
      case 'REJECTED':
        return {
          title: t('hospital.pending.rejected'),
          message: hospital.rejectionReason
            ? `${t('hospital.pending.messageRejected')} Reason: ${hospital.rejectionReason}`
            : t('hospital.pending.messageRejected'),
          icon: '❌'
        };
      default:
        return {
          title: t('hospital.pending.loading'),
          message: t('hospital.pending.pleaseWait'),
          icon: '❓'
        };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <LanguageSwitch />
      <div className="max-w-2xl w-full">
        <div className="bg-white shadow-lg roun-lg p-8 text-center">
          <div className="text-6xl mb-4">{statusInfo.icon}</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{statusInfo.title}</h1>
          <p className="text-gray-600 mb-8">{statusInfo.message}</p>

          {hospital && (
            <div className="bg-gray-50 roun-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('hospital.pending.hospitalInfo')}</h3>
              <div className="text-left space-y-2">
                <p><strong>{t('hospital.pending.name')}</strong> {hospital.name}</p>
                <p><strong>{t('hospital.pending.status')}</strong> <span className={`font-semibold ${hospital.status === 'PENDING' ? 'text-yellow-600' :
                    hospital.status === 'APPROVED' ? 'text-primary-600' :
                      'text-red-600'
                  }`}>{hospital.status}</span></p>
                {hospital.address && (
                  <p><strong>{t('hospital.pending.address')}</strong> {hospital.address.line1}, {hospital.address.city}</p>
                )}
                {hospital.phone && <p><strong>{t('hospital.pending.phone')}</strong> {hospital.phone}</p>}
              </div>
            </div>
          )}

          <div className="bg-primary-50 border border-primary-200 roun-lg p-4 mb-6">
            <p className="text-sm text-primary-800">
              <strong>{t('hospital.pending.trialNote')}</strong> {t('hospital.pending.trialText')}
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            {hospital?.status === 'PENDING' && (
              <button
                onClick={() => getHospitalDetails && getHospitalDetails()}
                className="px-6 py-3 bg-primary text-white roun-lg font-medium hover:bg-primary-dark transition-colors"
              >
                {t('hospital.pending.refreshStatus')}
              </button>
            )}
            <a
              href="mailto:support@E-ivuzeconnect.rw"
              className="px-6 py-3 border border-gray-300 roun-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {t('hospital.pending.contactSupportButton') || 'Contact Support'}
            </a>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            {t('hospital.pending.supportContact')} <a href="mailto:support@E-ivuzeconnect.rw" className="text-primary hover:underline">support@E-ivuzeconnect.rw</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default HospitalPending;
