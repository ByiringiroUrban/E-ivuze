import React, { useState, useEffect, useContext } from 'react';
import { AdminContext } from '../../context/AdminContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import LanguageSwitch from '../../components/LanguageSwitch';

const HospitalApprovals = () => {
  const { aToken, backendUrl } = useContext(AdminContext);
  const { t } = useTranslation();
  const [pendingHospitals, setPendingHospitals] = useState([]);
  const [allHospitals, setAllHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPendingHospitals();
    fetchAllHospitals();
  }, []);

  const fetchPendingHospitals = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/admin/hospitals/pending', {
        headers: { aToken }
      });
      if (data.success) {
        setPendingHospitals(data.hospitals);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.hospitalApprovals.fetchError'));
    }
  };

  const fetchAllHospitals = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/admin/hospitals', {
        headers: { aToken }
      });
      if (data.success) {
        setAllHospitals(data.hospitals);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.hospitalApprovals.fetchError'));
    }
  };

  const handleApprove = async (hospitalId) => {
    if (!window.confirm(t('admin.hospitalApprovals.confirmApprove'))) return;

    setLoading(true);
    try {
      const { data } = await axios.post(
        backendUrl + `/api/admin/hospitals/${hospitalId}/approve`,
        {},
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(t('admin.hospitalApprovals.approveSuccess'));
        fetchPendingHospitals();
        fetchAllHospitals();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.hospitalApprovals.approveError'));
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (hospitalId) => {
    if (!rejectionReason.trim()) {
      toast.error(t('admin.hospitalApprovals.rejectionReasonRequired'));
      return;
    }

    if (!window.confirm(t('admin.hospitalApprovals.confirmReject'))) return;

    setLoading(true);
    try {
      const { data } = await axios.post(
        backendUrl + `/api/admin/hospitals/${hospitalId}/reject`,
        { rejectionReason },
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(t('admin.hospitalApprovals.rejectSuccess'));
        setSelectedHospital(null);
        setRejectionReason('');
        fetchPendingHospitals();
        fetchAllHospitals();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.hospitalApprovals.rejectError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-100 px-4 sm:px-8 lg:px-12 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <p className="text-xs tracking-widest text-[#064e3b] font-semibold">{t('admin.hospitalApprovals.title')}</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{t('admin.hospitalApprovals.hero')}</h1>
            <p className="text-sm text-gray-500 max-w-3xl pt-1">{t('admin.hospitalApprovals.subtitle')}</p>
          </div>
          <LanguageSwitch />
        </div>
      </section>

      {/* Content Section */}
      <section className="py-10 sm:py-12">
        <div className="w-full px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto space-y-8">
          {/* Pending Hospitals */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">{t('admin.hospitalApprovals.pendingApplications')}</h3>
            {pendingHospitals.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
                <p className="text-gray-500">{t('admin.hospitalApprovals.noPending')}</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500   tracking-wider">
                          {t('admin.hospitalApprovals.hospitalName')}
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500   tracking-wider">
                          {t('admin.hospitalApprovals.address')}
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500   tracking-wider">
                          {t('admin.hospitalApprovals.phone')}
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500   tracking-wider">
                          {t('admin.hospitalApprovals.appliedDate')}
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500   tracking-wider">
                          {t('admin.hospitalApprovals.actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pendingHospitals.map(hospital => (
                        <tr key={hospital._id} className="hover:bg-gray-50">
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {hospital.name}
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-sm text-gray-500">
                            {hospital.address?.line1}, {hospital.address?.city}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {hospital.phone}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(hospital.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprove(hospital._id)}
                                disabled={loading}
                                className="px-3 py-1 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 text-xs font-medium transition-colors"
                              >
                                {t('admin.hospitalApprovals.approve')}
                              </button>
                              <button
                                onClick={() => setSelectedHospital(hospital)}
                                disabled={loading}
                                className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 text-xs font-medium transition-colors"
                              >
                                {t('admin.hospitalApprovals.reject')}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* All Hospitals */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">{t('admin.hospitalApprovals.allHospitals')}</h3>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500   tracking-wider">
                        {t('admin.hospitalApprovals.hospitalName')}
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500   tracking-wider">
                        {t('admin.hospitalApprovals.status')}
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500   tracking-wider">
                        {t('admin.hospitalApprovals.address')}
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500   tracking-wider">
                        {t('admin.hospitalApprovals.phone')}
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500   tracking-wider">
                        {t('admin.hospitalApprovals.date')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allHospitals.map(hospital => (
                      <tr key={hospital._id} className="hover:bg-gray-50">
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {hospital.name}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${hospital.status === 'APPROVED' ? 'bg-primary-100 text-primary-800' :
                            hospital.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                            {hospital.status}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-gray-500">
                          {hospital.address?.line1}, {hospital.address?.city}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {hospital.phone}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(hospital.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rejection Modal */}
      {selectedHospital && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-gray-800">{t('admin.hospitalApprovals.rejectModalTitle')}</h3>
            <p className="text-sm text-gray-600 mb-4">
              {t('admin.hospitalApprovals.rejecting')} <strong>{selectedHospital.name}</strong>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {t('admin.hospitalApprovals.rejectionReason')}
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                placeholder={t('admin.hospitalApprovals.rejectionReasonPlaceholder')}
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => handleReject(selectedHospital._id)}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 font-medium transition-colors"
              >
                {loading ? t('admin.hospitalApprovals.rejectingText') : t('admin.hospitalApprovals.reject')}
              </button>
              <button
                onClick={() => {
                  setSelectedHospital(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
              >
                {t('admin.hospitalApprovals.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalApprovals;
