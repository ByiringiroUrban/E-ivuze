import React, { useState, useEffect, useContext } from 'react';
import { PharmacyContext } from '../../context/PharmacyContext';
import { useTranslation } from 'react-i18next';
import { LoadingComponents } from '../../components/LoadingComponents';
import { FaChartLine, FaDollarSign, FaShoppingCart, FaClock } from 'react-icons/fa';
import IconTexture from '../../components/IconTexture';
import DashboardHero from '../../components/DashboardHero';

const PharmacyReports = () => {
  const { t } = useTranslation();
  const { getReports } = useContext(PharmacyContext);

  const [reports, setReports] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await getReports(startDate || null, endDate || null);
      setReports(data);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = () => {
    loadReports();
  };

  return (
    <div className="bg-white min-h-screen px-4 sm:px-8 py-8 space-y-8">
      <DashboardHero
        eyebrow={t('pharmacy.reports.eyebrow') || 'Analytics'}
        title={t('pharmacy.reports.title') || 'Reports & Analytics'}
        description={t('pharmacy.reports.subtitle') || 'Understand sales velocity, fulfillment speed and product performance.'}
      />

      {/* Date Filters */}
      <div className="border border-border bg-white p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('pharmacy.reports.startDate') || 'Start Date'}
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 roun-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('pharmacy.reports.endDate') || 'End Date'}
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 roun-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleDateChange}
              className="w-full bg-primary text-white px-4 py-2 roun-lg hover:bg-primary-dark transition-colors"
            >
              {t('pharmacy.reports.apply') || 'Apply Filter'}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingComponents.DashboardLoader text="Loading reports..." />
      ) : reports ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white roun-xl p-6 shadow-sm relative overflow-hidden group">
              <IconTexture opacity={0.03} size={12} className="text-primary" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 roun-full bg-primary/10 flex items-center justify-center">
                  <FaDollarSign className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {reports.totalSales?.toLocaleString() || 0} RWF
                  </p>
                  <p className="text-sm text-gray-500">
                    {t('pharmacy.reports.totalSales') || 'Total Sales'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white roun-xl p-6 shadow-sm relative overflow-hidden group">
              <IconTexture opacity={0.03} size={12} className="text-primary" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 roun-full bg-primary/10 flex items-center justify-center">
                  <FaShoppingCart className="w-6 h-6 text-primary-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {reports.totalOrders || 0}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t('pharmacy.reports.totalOrders') || 'Total Orders'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white roun-xl p-6 shadow-sm relative overflow-hidden group">
              <IconTexture opacity={0.03} size={12} className="text-primary" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 roun-full bg-yellow/10 flex items-center justify-center">
                  <FaClock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {reports.avgFulfillmentTime?.toFixed(1) || 0} {t('pharmacy.reports.hours') || 'hrs'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t('pharmacy.reports.avgFulfillment') || 'Avg Fulfillment Time'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white roun-xl p-6 shadow-sm relative overflow-hidden group">
              <IconTexture opacity={0.03} size={12} className="text-primary" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 roun-full bg-purple/10 flex items-center justify-center">
                  <FaChartLine className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {reports.totalOrders > 0
                      ? (reports.totalSales / reports.totalOrders).toFixed(0)
                      : 0} RWF
                  </p>
                  <p className="text-sm text-gray-500">
                    {t('pharmacy.reports.avgOrderValue') || 'Avg Order Value'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Orders by Status */}
          <div className="bg-white roun-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {t('pharmacy.reports.ordersByStatus') || 'Orders by Status'}
            </h2>
            {reports.ordersByStatus && reports.ordersByStatus.length > 0 ? (
              <div className="space-y-3">
                {reports.ordersByStatus.map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-4 bg-gray-50 roun-lg">
                    <span className="font-medium text-gray-900">{item._id}</span>
                    <span className="text-lg font-bold text-primary">{item.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                {t('pharmacy.reports.noData') || 'No data available for selected period'}
              </p>
            )}
          </div>
        </>
      ) : (
        <div className="bg-white roun-xl shadow-sm p-12 text-center">
          <p className="text-gray-500">
            {t('pharmacy.reports.noData') || 'No data available'}
          </p>
        </div>
      )}
    </div>
  );
};

export default PharmacyReports;

