import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AdminContext } from '../../context/AdminContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitch from '../../components/LanguageSwitch';

const HospitalTrials = () => {
  const { backendUrl, aToken } = useContext(AdminContext);
  const { t } = useTranslation();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, active, expired, subscribed
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [selectedHospitals, setSelectedHospitals] = useState([]);
  const [trialAction, setTrialAction] = useState(''); // 'increase', 'decrease', 'remove'
  const [trialMonths, setTrialMonths] = useState(0);
  const [trialDays, setTrialDays] = useState(0);
  const [applyToAll, setApplyToAll] = useState(false);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        backendUrl + '/api/admin/hospitals',
        { headers: { aToken } }
      );

      if (data.success) {
        const hospitalsWithStatus = data.hospitals.map(hospital => {
          const now = new Date();
          const trialEndsAt = hospital.trialEndsAt ? new Date(hospital.trialEndsAt) : null;
          const subscriptionExpiresAt = hospital.subscriptionExpiresAt ? new Date(hospital.subscriptionExpiresAt) : null;
          const hasActiveSubscription = subscriptionExpiresAt && subscriptionExpiresAt > now;
          const trialExpired = trialEndsAt && trialEndsAt < now;
          const trialActive = trialEndsAt && trialEndsAt > now;

          let trialStatus = 'unknown';
          if (hasActiveSubscription) {
            trialStatus = 'subscribed';
          } else if (trialExpired) {
            trialStatus = 'expired';
          } else if (trialActive) {
            trialStatus = 'active';
          }

          return {
            ...hospital,
            trialStatus,
            daysRemaining: trialEndsAt ? Math.ceil((trialEndsAt - now) / (1000 * 60 * 60 * 24)) : null
          };
        });

        setHospitals(hospitalsWithStatus);
      } else {
        toast.error(data.message || t('admin.hospitalTrials.fetchError'));
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      toast.error(error.response?.data?.message || t('admin.hospitalTrials.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHospital = (hospitalId) => {
    setSelectedHospitals(prev => 
      prev.includes(hospitalId) 
        ? prev.filter(id => id !== hospitalId)
        : [...prev, hospitalId]
    );
  };

  const handleSelectAll = () => {
    if (selectedHospitals.length === filteredHospitals.length) {
      setSelectedHospitals([]);
    } else {
      setSelectedHospitals(filteredHospitals.map(h => h._id));
    }
  };

  const handleTrialAction = async () => {
    if (!trialAction) {
      toast.error(t('admin.hospitalTrials.selectAction'));
      return;
    }

    if (trialAction === 'remove') {
      if (!window.confirm(t('admin.hospitalTrials.confirmRemove'))) return;
    } else {
      if (trialMonths === 0 && trialDays === 0) {
        toast.error(t('admin.hospitalTrials.enterDaysOrMonths'));
        return;
      }
    }

    const hospitalIds = applyToAll ? filteredHospitals.map(h => h._id) : selectedHospitals;
    
    if (hospitalIds.length === 0) {
      toast.error(t('admin.hospitalTrials.selectHospitals'));
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(
        backendUrl + '/api/admin/hospital-trials/update',
        {
          hospitalIds,
          action: trialAction,
          months: trialMonths,
          days: trialDays
        },
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success(data.message || t('admin.hospitalTrials.updateSuccess'));
        setShowTrialModal(false);
        setSelectedHospitals([]);
        setTrialAction('');
        setTrialMonths(0);
        setTrialDays(0);
        setApplyToAll(false);
        fetchHospitals();
      } else {
        toast.error(data.message || t('admin.hospitalTrials.updateError'));
      }
    } catch (error) {
      console.error('Error updating trial period:', error);
      toast.error(error.response?.data?.message || t('admin.hospitalTrials.updateError'));
    } finally {
      setLoading(false);
    }
  };

  const filteredHospitals = hospitals.filter(hospital => {
    if (filter === 'all') return true;
    return hospital.trialStatus === filter;
  });

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      subscribed: 'bg-blue-100 text-blue-800',
      unknown: 'bg-gray-100 text-gray-800'
    };
    return badges[status] || badges.unknown;
  };

  const getStatusText = (status) => {
    const texts = {
      active: t('admin.hospitalTrials.statusActive'),
      expired: t('admin.hospitalTrials.statusExpired'),
      subscribed: t('admin.hospitalTrials.statusSubscribed'),
      unknown: t('admin.hospitalTrials.statusUnknown')
    };
    return texts[status] || texts.unknown;
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-[#14324f] text-white px-4 sm:px-8 lg:px-12 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.45em] text-white/70">{t('admin.hospitalTrials.title')}</p>
            <h1 className="text-3xl sm:text-4xl font-semibold">{t('admin.hospitalTrials.hero')}</h1>
            <p className="text-sm sm:text-base text-white/80 max-w-3xl">{t('admin.hospitalTrials.subtitle')}</p>
          </div>
          <LanguageSwitch />
        </div>
      </section>

      {/* Content Section */}
      <section className="py-10 sm:py-12">
        <div className="w-full px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto space-y-6">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setTrialAction('increase');
                  setShowTrialModal(true);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                {t('admin.hospitalTrials.increaseTrial')}
              </button>
              <button
                onClick={() => {
                  setTrialAction('decrease');
                  setShowTrialModal(true);
                }}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
              >
                {t('admin.hospitalTrials.decreaseTrial')}
              </button>
              <button
                onClick={() => {
                  setTrialAction('remove');
                  setShowTrialModal(true);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                {t('admin.hospitalTrials.removeTrial')}
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'all' 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t('admin.hospitalTrials.filterAll')} ({hospitals.length})
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'active' 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t('admin.hospitalTrials.filterActive')} ({hospitals.filter(h => h.trialStatus === 'active').length})
              </button>
              <button
                onClick={() => setFilter('expired')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'expired' 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t('admin.hospitalTrials.filterExpired')} ({hospitals.filter(h => h.trialStatus === 'expired').length})
              </button>
              <button
                onClick={() => setFilter('subscribed')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'subscribed' 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t('admin.hospitalTrials.filterSubscribed')} ({hospitals.filter(h => h.trialStatus === 'subscribed').length})
              </button>
            </div>
          </div>

          {/* Hospitals Table */}
          {loading ? (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500">{t('admin.hospitalTrials.loading')}</p>
            </div>
          ) : filteredHospitals.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500">{t('admin.hospitalTrials.noHospitals')}</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedHospitals.length === filteredHospitals.length && filteredHospitals.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.hospitalTrials.hospitalName')}
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.hospitalTrials.status')}
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.hospitalTrials.trialPeriod')}
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.hospitalTrials.daysRemaining')}
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.hospitalTrials.subscription')}
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.hospitalTrials.approvedDate')}
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.hospitalTrials.contact')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredHospitals.map((hospital) => (
                      <tr key={hospital._id} className="hover:bg-gray-50">
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedHospitals.includes(hospital._id)}
                            onChange={() => handleSelectHospital(hospital._id)}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-medium text-gray-900">{hospital.name}</p>
                          {hospital.address && (
                            <p className="text-xs text-gray-500">{hospital.address.city}, {hospital.address.country}</p>
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(hospital.trialStatus)}`}>
                            {getStatusText(hospital.trialStatus)}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {hospital.trialEndsAt ? (
                            <>
                              <p>{new Date(hospital.trialEndsAt).toLocaleDateString()}</p>
                              <p className="text-xs">{new Date(hospital.trialEndsAt).toLocaleTimeString()}</p>
                            </>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                          {hospital.daysRemaining !== null ? (
                            <span className={`font-medium ${
                              hospital.daysRemaining < 0 ? 'text-red-600' :
                              hospital.daysRemaining < 7 ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {hospital.daysRemaining < 0 
                                ? `${t('admin.hospitalTrials.expired')} ${Math.abs(hospital.daysRemaining)} ${t('admin.hospitalTrials.daysAgo')}`
                                : `${hospital.daysRemaining} ${t('admin.hospitalTrials.days')}`
                              }
                            </span>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {hospital.subscriptionPlan ? (
                            <>
                              <p className="font-medium">{hospital.subscriptionPlan.charAt(0).toUpperCase() + hospital.subscriptionPlan.slice(1)}</p>
                              {hospital.subscriptionExpiresAt && (
                                <p className="text-xs">{t('admin.hospitalTrials.expires')}: {new Date(hospital.subscriptionExpiresAt).toLocaleDateString()}</p>
                              )}
                            </>
                          ) : (
                            t('admin.hospitalTrials.noSubscription')
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {hospital.approvedAt ? new Date(hospital.approvedAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <p>{hospital.phone || 'N/A'}</p>
                          {hospital.website && (
                            <a href={hospital.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline text-xs">
                              {t('admin.hospitalTrials.website')}
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Trial Period Management Modal */}
      {showTrialModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                {trialAction === 'increase' && t('admin.hospitalTrials.increaseTrial')}
                {trialAction === 'decrease' && t('admin.hospitalTrials.decreaseTrial')}
                {trialAction === 'remove' && t('admin.hospitalTrials.removeTrial')}
              </h3>
              <button
                onClick={() => {
                  setShowTrialModal(false);
                  setTrialAction('');
                  setTrialMonths(0);
                  setTrialDays(0);
                  setApplyToAll(false);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {trialAction !== 'remove' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin.hospitalTrials.months')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={trialMonths}
                      onChange={(e) => setTrialMonths(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin.hospitalTrials.days')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={trialDays}
                      onChange={(e) => setTrialDays(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyToAll}
                    onChange={(e) => setApplyToAll(e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">{t('admin.hospitalTrials.applyToAll')}</span>
                </label>
              </div>

              {!applyToAll && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-sm text-gray-600 mb-2">
                    {t('admin.hospitalTrials.selectedHospitals')}: {selectedHospitals.length}
                  </p>
                  {selectedHospitals.length === 0 && (
                    <p className="text-xs text-red-600">{t('admin.hospitalTrials.selectHospitals')}</p>
                  )}
                </div>
              )}

              {trialAction === 'remove' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">
                    <strong>{t('admin.hospitalTrials.warning')}:</strong> {t('admin.hospitalTrials.removeWarning')}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowTrialModal(false);
                    setTrialAction('');
                    setTrialMonths(0);
                    setTrialDays(0);
                    setApplyToAll(false);
                  }}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  {t('admin.hospitalTrials.cancel')}
                </button>
                <button
                  onClick={handleTrialAction}
                  disabled={loading}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    trialAction === 'remove'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-primary hover:bg-primary-dark text-white'
                  } disabled:opacity-50`}
                >
                  {loading ? t('admin.hospitalTrials.processing') : t('admin.hospitalTrials.apply')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalTrials;
