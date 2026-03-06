import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AdminContext } from '../../context/AdminContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import LanguageSwitch from '../../components/LanguageSwitch';
import { LoadingComponents } from '../../components/LoadingComponents';

const DoctorApprovals = () => {
  const { aToken, backendUrl } = useContext(AdminContext);
  const { t } = useTranslation();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('pending'); // 'pending', 'approved', 'rejected', 'all'
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    fetchDoctors();
  }, [selectedTab]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(backendUrl + '/api/admin/doctor-approvals', {
        headers: { aToken }
      });
      if (data.success) {
        setDoctors(data.doctors);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.doctorApprovals.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (doctorId) => {
    if (!window.confirm(t('admin.doctorApprovals.confirmApprove'))) return;

    setLoading(true);
    try {
      const { data } = await axios.post(
        backendUrl + `/api/admin/doctor-approvals/${doctorId}/approve`,
        {},
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(t('admin.doctorApprovals.approveSuccess'));
        fetchDoctors();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.doctorApprovals.approveError'));
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (doctorId) => {
    if (!rejectionReason.trim()) {
      toast.error(t('admin.doctorApprovals.rejectionReasonRequired'));
      return;
    }

    if (!window.confirm(t('admin.doctorApprovals.confirmReject'))) return;

    setLoading(true);
    try {
      const { data } = await axios.post(
        backendUrl + `/api/admin/doctor-approvals/${doctorId}/reject`,
        { reason: rejectionReason },
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(t('admin.doctorApprovals.rejectSuccess'));
        setSelectedDoctor(null);
        setRejectionReason('');
        fetchDoctors();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.doctorApprovals.rejectError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (doctorId, hardDelete = false) => {
    const confirmMessage = hardDelete
      ? t('admin.doctorApprovals.confirmHardDelete')
      : t('admin.doctorApprovals.confirmDelete');

    if (!window.confirm(confirmMessage)) return;

    setLoading(true);
    try {
      const { data } = await axios.delete(
        backendUrl + `/api/admin/doctor-approvals/${doctorId}${hardDelete ? '?hard=true' : ''}`,
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        fetchDoctors();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.doctorApprovals.deleteError'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (doctor) => {
    setEditFormData({
      name: doctor.name,
      email: doctor.email,
      speciality: doctor.speciality,
      degree: doctor.degree,
      licenseNumber: doctor.licenseNumber,
      experience: doctor.experience,
      about: doctor.about,
      available: doctor.available,
      fees: doctor.fees || '',
      // National e-Health Fields
      nid: doctor.nid || '',
      department: doctor.department || '',
      subSpeciality: doctor.subSpeciality || '',
      employmentType: doctor.employmentType || 'Full-Time'
    });
    setSelectedDoctor(doctor);
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(editFormData).forEach(key => {
        if (key === 'address') {
          formData.append(key, JSON.stringify(editFormData[key]));
        } else if (key === 'image' && editFormData[key]) {
          formData.append(key, editFormData[key]);
        } else {
          formData.append(key, editFormData[key]);
        }
      });

      const { data } = await axios.put(
        backendUrl + `/api/admin/doctor-approvals/${selectedDoctor._id}`,
        formData,
        { headers: { aToken, 'Content-Type': 'multipart/form-data' } }
      );
      if (data.success) {
        toast.success(t('admin.doctorApprovals.updateSuccess'));
        setShowEditModal(false);
        setSelectedDoctor(null);
        fetchDoctors();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.doctorApprovals.updateError'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-primary-100 text-primary-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredDoctors = selectedTab === 'all'
    ? doctors
    : doctors.filter(d => d.status === selectedTab);

  const tabCounts = useMemo(() => ({
    all: doctors.length,
    pending: doctors.filter(d => d.status === 'pending').length,
    approved: doctors.filter(d => d.status === 'approved').length,
    rejected: doctors.filter(d => d.status === 'rejected').length
  }), [doctors]);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-100 px-4 sm:px-8 lg:px-12 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <p className="text-xs tracking-widest text-[#064e3b] font-semibold">{t('admin.doctorApprovals.title')}</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{t('admin.doctorApprovals.hero')}</h1>
            <p className="text-sm text-gray-500 max-w-3xl pt-1">{t('admin.doctorApprovals.subtitle')}</p>
          </div>
          <LanguageSwitch />
        </div>
      </section>

      {/* Content Section */}
      <section className="py-10 sm:py-12">
        <div className="w-full px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto space-y-8">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {['pending', 'approved', 'rejected', 'all'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${selectedTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  {t(`admin.doctorApprovals.tabs.${tab}`)} ({tabCounts[tab]})
                </button>
              ))}
            </nav>
          </div>

          {/* Doctors Table */}
          {loading && filteredDoctors.length === 0 ? (
            <div className="text-center py-12">
              <LoadingComponents.DataLoader />
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500">{t('admin.doctorApprovals.noDoctors')}</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500   tracking-wider">
                        {t('admin.doctorApprovals.name')}
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500   tracking-wider">
                        {t('admin.doctorApprovals.email')}
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500   tracking-wider">
                        {t('admin.doctorApprovals.speciality')}
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500   tracking-wider">
                        {t('admin.doctorApprovals.licenseNumber')}
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500   tracking-wider">
                        NID
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500   tracking-wider">
                        {t('admin.doctorApprovals.status')}
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500   tracking-wider">
                        {t('admin.doctorApprovals.registrationDate')}
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500   tracking-wider">
                        {t('admin.doctorApprovals.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDoctors.map(doctor => (
                      <tr key={doctor._id} className="hover:bg-gray-50">
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {doctor.name}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doctor.email}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doctor.speciality}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doctor.licenseNumber}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doctor.nid || '--'}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(doctor.status)}`}>
                            {t(`admin.doctorApprovals.statuses.${doctor.status}`)}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(doctor.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex flex-wrap gap-2">
                            {doctor.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(doctor._id)}
                                  disabled={loading}
                                  className="px-3 py-1 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 text-xs font-medium transition-colors"
                                >
                                  {loading ? <LoadingComponents.ButtonLoader /> : t('admin.doctorApprovals.approve')}
                                </button>
                                <button
                                  onClick={() => setSelectedDoctor(doctor)}
                                  disabled={loading}
                                  className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 text-xs font-medium transition-colors"
                                >
                                  {t('admin.doctorApprovals.reject')}
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleEdit(doctor)}
                              disabled={loading}
                              className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-xs font-medium transition-colors"
                            >
                              {t('admin.doctorApprovals.edit')}
                            </button>
                            <button
                              onClick={() => handleDelete(doctor._id)}
                              disabled={loading}
                              className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-xs font-medium transition-colors"
                            >
                              {t('admin.doctorApprovals.delete')}
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
      </section>

      {/* Rejection Modal */}
      {selectedDoctor && selectedDoctor.status === 'pending' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-gray-800">{t('admin.doctorApprovals.rejectModalTitle')}</h3>
            <p className="text-sm text-gray-600 mb-4">
              {t('admin.doctorApprovals.rejecting')} <strong>{selectedDoctor.name}</strong>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {t('admin.doctorApprovals.rejectionReason')}
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                placeholder={t('admin.doctorApprovals.rejectionReasonPlaceholder')}
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => handleReject(selectedDoctor._id)}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 font-medium transition-colors"
              >
                {loading ? <LoadingComponents.ButtonLoader /> : t('admin.doctorApprovals.reject')}
              </button>
              <button
                onClick={() => {
                  setSelectedDoctor(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
              >
                {t('admin.doctorApprovals.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-2xl my-8">
            <h3 className="text-xl font-bold mb-4 text-gray-800">{t('admin.doctorApprovals.editModalTitle')}</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">{t('admin.doctorApprovals.name')}</label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">{t('admin.doctorApprovals.email')}</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">{t('admin.doctorApprovals.speciality')}</label>
                  <input
                    type="text"
                    value={editFormData.speciality}
                    onChange={(e) => setEditFormData({ ...editFormData, speciality: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">{t('admin.doctorApprovals.degree')}</label>
                  <input
                    type="text"
                    value={editFormData.degree}
                    onChange={(e) => setEditFormData({ ...editFormData, degree: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">{t('admin.doctorApprovals.licenseNumber')}</label>
                  <input
                    type="text"
                    value={editFormData.licenseNumber}
                    onChange={(e) => setEditFormData({ ...editFormData, licenseNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">{t('admin.doctorApprovals.experience')}</label>
                  <input
                    type="text"
                    value={editFormData.experience}
                    onChange={(e) => setEditFormData({ ...editFormData, experience: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-gray-700">{t('admin.doctorApprovals.about')}</label>
                  <textarea
                    value={editFormData.about}
                    onChange={(e) => setEditFormData({ ...editFormData, about: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">{t('admin.doctorApprovals.fees')}</label>
                  <input
                    type="number"
                    value={editFormData.fees}
                    onChange={(e) => setEditFormData({ ...editFormData, fees: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">{t('admin.doctorApprovals.available')}</label>
                  <select
                    value={editFormData.available}
                    onChange={(e) => setEditFormData({ ...editFormData, available: e.target.value === 'true' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value={false}>{t('admin.doctorApprovals.no')}</option>
                  </select>
                </div>

                {/* National e-Health Fields */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">National ID (NID)</label>
                  <input
                    type="text"
                    value={editFormData.nid || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, nid: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="National ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Department</label>
                  <input
                    type="text"
                    value={editFormData.department || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g. Surgery"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Sub-Speciality</label>
                  <input
                    type="text"
                    value={editFormData.subSpeciality || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, subSpeciality: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g. Pediatric Cardiology"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Employment Type</label>
                  <select
                    value={editFormData.employmentType || 'Full-Time'}
                    onChange={(e) => setEditFormData({ ...editFormData, employmentType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Visiting">Visiting</option>
                    <option value="Volunteer">Volunteer</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 font-medium transition-colors"
                >
                  {loading ? <LoadingComponents.ButtonLoader /> : t('admin.doctorApprovals.update')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedDoctor(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                >
                  {t('admin.doctorApprovals.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorApprovals;
