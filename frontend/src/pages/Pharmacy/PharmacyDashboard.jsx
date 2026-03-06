import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { PharmacyContext } from '../../context/PharmacyContext';
import { useTranslation } from 'react-i18next';
import IconTexture from '../../components/IconTexture';
import {
  FaBox, FaShoppingCart, FaPills, FaExclamationTriangle,
  FaCheckCircle, FaClock, FaTruck, FaChartLine
} from 'react-icons/fa';
import { LoadingComponents } from '../../components/LoadingComponents';

const PharmacyDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pToken, dashboard, getDashboard, pharmacyUser } = useContext(PharmacyContext);

  useEffect(() => {
    if (pToken) {
      getDashboard();
    } else {
      navigate('/login');
    }
  }, [pToken]);

  if (!dashboard) {
    return <LoadingComponents.DashboardLoader text={t('pharmacy.dashboard.loading') || 'Loading pharmacy dashboard...'} />;
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="flex gap-6 p-6">
        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          {/* Welcome Banner */}
          <div className="bg-[#006838] text-white roun-xl p-8 border border-border relative overflow-hidden">
            <IconTexture opacity={0.1} size={24} className="text-white" />
            <div className="relative z-10">
              <h1 className="text-3xl font-bold text-white mb-2">
                {t('pharmacy.dashboard.welcome') || 'Welcome'} {pharmacyUser?.name || ''}
              </h1>
              <p className="text-white/80">
                {t('pharmacy.dashboard.subtitle') || 'Manage your pharmacy operations from here'}
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white roun-xl p-6 flex items-center gap-4 shadow-sm relative overflow-hidden group">
              <IconTexture opacity={0.03} size={12} className="text-primary" />
              <div className="w-12 h-12 roun-full bg-primary/10 flex items-center justify-center relative z-10">
                <FaShoppingCart className="w-6 h-6 text-primary" />
              </div>
              <div className="relative z-10">
                <p className="text-2xl font-bold text-gray-800">{dashboard.totalOrders || 0}</p>
                <p className="text-sm text-gray-500">{t('pharmacy.dashboard.totalOrders') || 'Total Orders'}</p>
              </div>
            </div>

            <div className="bg-white roun-xl p-6 flex items-center gap-4 shadow-sm relative overflow-hidden group">
              <IconTexture opacity={0.03} size={12} className="text-primary" />
              <div className="w-12 h-12 roun-full bg-yellow/10 flex items-center justify-center relative z-10">
                <FaClock className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="relative z-10">
                <p className="text-2xl font-bold text-gray-800">{dashboard.pendingOrders || 0}</p>
                <p className="text-sm text-gray-500">{t('pharmacy.dashboard.pendingOrders') || 'Pending Orders'}</p>
              </div>
            </div>

            <div className="bg-white roun-xl p-6 flex items-center gap-4 shadow-sm relative overflow-hidden group">
              <IconTexture opacity={0.03} size={12} className="text-primary" />
              <div className="w-12 h-12 roun-full bg-emerald-500/10 flex items-center justify-center relative z-10">
                <FaPills className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="relative z-10">
                <p className="text-2xl font-bold text-gray-800">{dashboard.totalMedications || 0}</p>
                <p className="text-sm text-gray-500">{t('pharmacy.dashboard.medications') || 'Medications'}</p>
              </div>
            </div>

            <div className="bg-white roun-xl p-6 flex items-center gap-4 shadow-sm relative overflow-hidden group">
              <IconTexture opacity={0.03} size={12} className="text-primary" />
              <div className="w-12 h-12 roun-full bg-red/10 flex items-center justify-center relative z-10">
                <FaExclamationTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div className="relative z-10">
                <p className="text-2xl font-bold text-gray-800">{dashboard.lowStockMedications || 0}</p>
                <p className="text-sm text-gray-500">{t('pharmacy.dashboard.lowStock') || 'Low Stock'}</p>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white roun-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {t('pharmacy.dashboard.recentOrders') || 'Recent Orders'}
              </h2>
              <button
                onClick={() => navigate('/pharmacy-orders')}
                className="text-primary hover:text-primary-dark text-sm font-medium"
              >
                {t('pharmacy.dashboard.viewAll') || 'View All'}
              </button>
            </div>

            {dashboard.recentOrders && dashboard.recentOrders.length > 0 ? (
              <div className="space-y-3">
                {dashboard.recentOrders.slice(0, 5).map((order) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between p-4 border border-gray-200 roun-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/pharmacy-orders/${order._id}`)}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {order.patientId?.name || t('pharmacy.dashboard.unknownPatient') || 'Unknown Patient'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()} • {order.items?.length || 0} {t('pharmacy.dashboard.items') || 'items'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 roun-full text-xs font-medium ${order.orderStatus === 'Delivered' ? 'bg-emerald-500/10 text-emerald-600' :
                        order.orderStatus === 'Shipped' ? 'bg-emerald-500/10 text-emerald-500' :
                          order.orderStatus === 'Verified' ? 'bg-yellow-500/10 text-yellow-600' :
                            'bg-gray-500/10 text-gray-600'
                        }`}>
                        {order.orderStatus}
                      </span>
                      <span className="font-bold text-gray-900">
                        {order.total?.toLocaleString()} RWF
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                {t('pharmacy.dashboard.noOrders') || 'No recent orders'}
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/pharmacy-inventory')}
              className="bg-white roun-xl p-6 shadow-sm hover:shadow-md transition-shadow text-left"
            >
              <FaBox className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">
                {t('pharmacy.dashboard.manageInventory') || 'Manage Inventory'}
              </h3>
              <p className="text-sm text-gray-500">
                {t('pharmacy.dashboard.manageInventoryDesc') || 'Add, update, or remove medications'}
              </p>
            </button>

            <button
              onClick={() => navigate('/pharmacy-orders')}
              className="bg-white roun-xl p-6 shadow-sm hover:shadow-md transition-shadow text-left"
            >
              <FaShoppingCart className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">
                {t('pharmacy.dashboard.viewOrders') || 'View Orders'}
              </h3>
              <p className="text-sm text-gray-500">
                {t('pharmacy.dashboard.viewOrdersDesc') || 'Process and manage customer orders'}
              </p>
            </button>

            <button
              onClick={() => navigate('/pharmacy-reports')}
              className="bg-white roun-xl p-6 shadow-sm hover:shadow-md transition-shadow text-left"
            >
              <FaChartLine className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">
                {t('pharmacy.dashboard.viewReports') || 'View Reports'}
              </h3>
              <p className="text-sm text-gray-500">
                {t('pharmacy.dashboard.viewReportsDesc') || 'Sales analytics and insights'}
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyDashboard;

