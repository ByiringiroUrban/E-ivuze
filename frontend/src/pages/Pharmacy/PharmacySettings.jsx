import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { PharmacyContext } from '../../context/PharmacyContext';
import { useTranslation } from 'react-i18next';
import { FaSave } from 'react-icons/fa';
import { toast } from 'react-toastify';
import DashboardHero from '../../components/DashboardHero';
import { LoadingComponents } from '../../components/LoadingComponents';

const PharmacySettings = () => {
  const { t } = useTranslation();
  const { pToken, pharmacy, getProfile, backendUrl } = useContext(PharmacyContext);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      country: 'Rwanda'
    },
    deliveryZones: []
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (pharmacy) {
      setFormData({
        name: pharmacy.name || '',
        phone: pharmacy.phone || '',
        address: pharmacy.address || {
          line1: '',
          line2: '',
          city: '',
          country: 'Rwanda'
        },
        deliveryZones: pharmacy.deliveryZones || []
      });
    } else {
      getProfile();
    }
  }, [pharmacy]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    try {
      const { data } = await axios.put(
        `${backendUrl}/api/pharmacy/profile`,
        formData,
        {
          headers: { token: pToken }
        }
      );

      if (data.success) {
        toast.success(data.message || t('pharmacy.settings.saved') || 'Settings saved successfully!');
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        await getProfile(); // Refresh profile data
      } else {
        toast.error(data.message || t('pharmacy.settings.error') || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen px-4 sm:px-8 py-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <DashboardHero
          eyebrow={t('pharmacy.settings.eyebrow') || 'Workspace'}
          title={t('pharmacy.settings.title') || 'Pharmacy Settings'}
          description={t('pharmacy.settings.subtitle') || 'Manage contact details, delivery zones and regulatory information.'}
        />

        {/* Settings Form */}
        <form onSubmit={handleSubmit} className="border border-border bg-white p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('pharmacy.settings.name') || 'Pharmacy Name'} *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 roun-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('pharmacy.settings.phone') || 'Phone Number'} *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 roun-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('pharmacy.settings.address') || 'Address Line 1'} *
            </label>
            <input
              type="text"
              name="address.line1"
              value={formData.address.line1}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 roun-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('pharmacy.settings.addressLine2') || 'Address Line 2'}
            </label>
            <input
              type="text"
              name="address.line2"
              value={formData.address.line2}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 roun-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('pharmacy.settings.city') || 'City'} *
              </label>
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 roun-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('pharmacy.settings.country') || 'Country'} *
              </label>
              <input
                type="text"
                name="address.country"
                value={formData.address.country}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 roun-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {saved && (
            <div className="bg-primary-50 border border-primary-200 text-primary-700 px-4 py-3 roun-lg">
              {t('pharmacy.settings.saved') || 'Settings saved successfully!'}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 roun-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <FaSave />
            {loading ? <LoadingComponents.ButtonLoader /> : (t('pharmacy.settings.save') || 'Save Settings')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PharmacySettings;

