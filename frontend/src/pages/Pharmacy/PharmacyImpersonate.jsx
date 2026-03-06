import React, { useState, useContext } from 'react';
import { PharmacyContext } from '../../context/PharmacyContext';
import { useTranslation } from 'react-i18next';
import { FaUser, FaUserMd, FaHospital, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import DashboardHero from '../../components/DashboardHero';
import { LoadingComponents } from '../../components/LoadingComponents';

const PharmacyImpersonate = () => {
  const { t } = useTranslation();
  const { pToken, backendUrl, pharmacy } = useContext(PharmacyContext);

  const [userType, setUserType] = useState('user');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canImpersonate = pharmacy?.settings?.can_impersonate || false;

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError(t('pharmacy.impersonate.enterSearch') || 'Please enter a search term');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Search for users based on type
      let endpoint = '';
      if (userType === 'user') {
        endpoint = `${backendUrl}/api/user/search?q=${encodeURIComponent(searchTerm)}`;
      } else if (userType === 'doctor') {
        endpoint = `${backendUrl}/api/doctor/search?q=${encodeURIComponent(searchTerm)}`;
      } else if (userType === 'hospital') {
        endpoint = `${backendUrl}/api/hospitals/search?q=${encodeURIComponent(searchTerm)}`;
      } else {
        throw new Error('Invalid user type');
      }

      const { data } = await axios.get(endpoint, {
        headers: { token: pToken }
      });

      if (data && data.success) {
        setSearchResults(data.results || []);
      } else {
        setError((data && data.message) || t('pharmacy.impersonate.searchFailed') || 'Search failed');
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.response?.data?.message || t('pharmacy.impersonate.searchError') || 'Error searching');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImpersonate = async (userId) => {
    if (!window.confirm(t('pharmacy.impersonate.confirm') || 'Are you sure you want to impersonate this user?')) {
      return;
    }

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/pharmacy/impersonate`,
        {
          impersonatedUserId: userId,
          impersonatedUserType: userType
        },
        {
          headers: { token: pToken }
        }
      );

      if (data && data.success) {
        // Store impersonation token and redirect
        localStorage.setItem('impersonationToken', data.token);
        if (data.impersonationLogId) localStorage.setItem('impersonationLogId', data.impersonationLogId);
        if (data.user) localStorage.setItem('impersonatedUser', JSON.stringify(data.user));

        // Redirect based on user type
        if (userType === 'user') {
          window.location.href = '/my-profile';
        } else if (userType === 'doctor') {
          window.location.href = '/doctor-appointments';
        } else if (userType === 'hospital') {
          window.location.href = '/hospital-dashboard';
        }
      } else {
        setError((data && data.message) || t('pharmacy.impersonate.failed') || 'Impersonation failed');
      }
    } catch (err) {
      console.error('Impersonation error:', err);
      setError(err.response?.data?.message || t('pharmacy.impersonate.error') || 'Error starting impersonation');
    }
  };

  if (!canImpersonate) {
    return (
      <div className="bg-white min-h-screen px-4 sm:px-8 py-8 flex items-center justify-center">
        <div className="border border-yellow-300 bg-yellow-50 max-w-xl w-full p-8 text-center space-y-4">
          <FaExclamationTriangle className="w-12 h-12 text-yellow-600 mx-auto" />
          <p className="text-xs uppercase tracking-[0.35em] text-yellow-700">
            {t('pharmacy.impersonate.notAllowed') || 'Impersonation Not Allowed'}
          </p>
          <p className="text-sm text-yellow-900">
            {t('pharmacy.impersonate.notAllowedMessage') ||
              'Your pharmacy account does not have permission to impersonate users. Please contact an administrator to enable this feature.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen px-4 sm:px-8 py-8 space-y-8">
      <DashboardHero
        eyebrow={t('pharmacy.impersonate.eyebrow') || 'Escalations'}
        title={t('pharmacy.impersonate.title') || 'Impersonate User'}
        description={t('pharmacy.impersonate.subtitle') || 'Search across patients, doctors or hospitals to troubleshoot on their behalf.'}
      >
        <div className="mt-2 border border-yellow-200 bg-yellow-50 text-yellow-800 text-sm px-4 py-3">
          <strong>{t('pharmacy.impersonate.warning') || 'Warning:'}</strong>{' '}
          {t('pharmacy.impersonate.warningMessage') ||
            'All impersonation actions are logged and audited. Use this feature responsibly.'}
        </div>
      </DashboardHero>

      {/* Search Form */}
      <div className="border border-border bg-white p-6 space-y-6 max-w-4xl mx-auto">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('pharmacy.impersonate.userType') || 'User Type'}
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="user"
                  checked={userType === 'user'}
                  onChange={(e) => {
                    setUserType(e.target.value);
                    setSearchResults([]);
                  }}
                  className="text-primary focus:ring-primary"
                />
                <FaUser className="text-gray-600" />
                <span>{t('pharmacy.impersonate.patient') || 'Patient'}</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="doctor"
                  checked={userType === 'doctor'}
                  onChange={(e) => {
                    setUserType(e.target.value);
                    setSearchResults([]);
                  }}
                  className="text-primary focus:ring-primary"
                />
                <FaUserMd className="text-gray-600" />
                <span>{t('pharmacy.impersonate.doctor') || 'Doctor'}</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="hospital"
                  checked={userType === 'hospital'}
                  onChange={(e) => {
                    setUserType(e.target.value);
                    setSearchResults([]);
                  }}
                  className="text-primary focus:ring-primary"
                />
                <FaHospital className="text-gray-600" />
                <span>{t('pharmacy.impersonate.hospital') || 'Hospital'}</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              placeholder={t('pharmacy.impersonate.searchPlaceholder') || 'Search by name or email...'}
              className="flex-1 px-4 py-2 border border-gray-300 roun-lg focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label={t('pharmacy.impersonate.searchPlaceholder') || 'Search by name or email'}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-primary text-white px-6 py-2 roun-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {loading ? <LoadingComponents.ButtonLoader /> : (t('pharmacy.impersonate.search') || 'Search')}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 roun-lg">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="border border-border bg-white overflow-hidden max-w-4xl mx-auto">
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {t('pharmacy.impersonate.results') || 'Search Results'}
            </h2>
            <div className="space-y-2">
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-4 border border-gray-200 roun-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <button
                    onClick={() => handleImpersonate(user._id)}
                    className="bg-primary text-white px-4 py-2 roun-lg hover:bg-primary-dark transition-colors text-sm"
                  >
                    {t('pharmacy.impersonate.impersonate') || 'Impersonate'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyImpersonate;
