import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import axios from "axios";
import { useTranslation } from "react-i18next";
import LanguageSwitch from "../../components/LanguageSwitch";

const Settings = () => {
  const { backendUrl, aToken } = useContext(AdminContext);
  const { t } = useTranslation();
  const [consultationFee, setConsultationFee] = useState(3000);
  const [platformPercentage, setPlatformPercentage] = useState(10);
  const [isChristmasThemeActive, setIsChristmasThemeActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(backendUrl + "/api/admin/settings", {
        headers: { aToken },
      });

      if (data.success && data.settings) {
        setConsultationFee(data.settings.consultationFee || 3000);
        setPlatformPercentage(data.settings.platformPercentage || 10);
        setIsChristmasThemeActive(data.settings.isChristmasThemeActive || false);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error(t('admin.settings.fetchError') || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (consultationFee < 0) {
      toast.error(t('admin.settings.feeNegativeError') || "Consultation fee cannot be negative");
      return;
    }

    if (platformPercentage < 0 || platformPercentage > 100) {
      toast.error(t('admin.settings.percentageError') || "Platform percentage must be between 0 and 100");
      return;
    }

    try {
      setSaving(true);
      console.log('Sending settings update:', {
        consultationFee,
        platformPercentage,
        isChristmasThemeActive
      });

      const { data } = await axios.post(
        backendUrl + "/api/admin/settings",
        {
          consultationFee: Number(consultationFee),
          platformPercentage: Number(platformPercentage),
          isChristmasThemeActive: isChristmasThemeActive, // Boolean value
        },
        {
          headers: { aToken },
        }
      );

      console.log('Save response:', data);

      if (data.success) {
        toast.success(t('admin.settings.updateSuccess') || "Settings updated successfully");
      } else {
        toast.error(data.message || t('admin.settings.updateError') || "Failed to update settings");
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error(t('admin.settings.updateError') || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <p className="text-gray-500">{t('admin.settings.loading') || "Loading settings..."}</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-100 px-4 sm:px-8 lg:px-12 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <p className="text-xs tracking-widest text-[#064e3b] font-semibold">{t('admin.settings.title')}</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{t('admin.settings.hero')}</h1>
            <p className="text-sm text-gray-500 max-w-3xl pt-1">{t('admin.settings.subtitle')}</p>
          </div>
          <LanguageSwitch />
        </div>
      </section>

      {/* Content Section */}
      <section className="py-10 sm:py-12">
        <div className="w-full px-4 sm:px-8 lg:px-12 max-w-4xl mx-auto">
          <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-8">
            <div className="space-y-6">
              {/* Consultation Fee */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  {t('admin.settings.consultationFeeLabel')} *
                </label>
                <input
                  type="number"
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  min="0"
                  required
                />
                <p className="text-xs text-gray-500">
                  {t('admin.settings.consultationFeeDescription')}
                </p>
              </div>

              {/* Platform Percentage */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  {t('admin.settings.platformPercentageLabel')} *
                </label>
                <input
                  type="number"
                  value={platformPercentage}
                  onChange={(e) => setPlatformPercentage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  min="0"
                  max="100"
                  step="0.1"
                  required
                />
                <p className="text-xs text-gray-500">
                  {t('admin.settings.platformPercentageDescription')}
                </p>
              </div>

              {/* Christmas Theme Toggle */}
              <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">Christmas / Holiday Theme</span>
                    <span className="text-xs text-gray-500 mt-1">Enable snowflakes and festive styling for the entire application.</span>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={isChristmasThemeActive}
                      onChange={(e) => setIsChristmasThemeActive(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {saving ? (t('admin.settings.saving') || "Saving...") : (t('admin.settings.saveButton') || "Save Settings")}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Settings;
