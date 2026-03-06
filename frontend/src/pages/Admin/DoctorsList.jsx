import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitch from '../../components/LanguageSwitch';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../../assets/assets';
import { LoadingComponents } from '../../components/LoadingComponents';
import EmptyState from '../../components/EmptyState';
import { getDoctorImageSrc } from '../../utils/doctorImage';

const DoctorsList = () => {
  const { doctors, aToken, getAllDoctors, changeAvailbility, backendUrl, loading: globalLoading } = useContext(AdminContext);
  const { t } = useTranslation();
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingDoctorId, setDeletingDoctorId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'approved', 'pending', 'rejected'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    speciality: '',
    degree: '',
    licenseNumber: '',
    experience: '',
    about: '',
    address1: '',
    address2: '',
    available: true
  });
  const [docImg, setDocImg] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filter doctors by status (handle undefined/null status as 'pending')
  const filteredDoctors = statusFilter === 'all'
    ? doctors
    : doctors.filter(doctor => {
      const doctorStatus = doctor.status || 'pending';
      return doctorStatus === statusFilter;
    });

  // Get status badge styling (handle undefined/null status)
  const getStatusBadge = (status) => {
    const doctorStatus = status || 'pending';
    switch (doctorStatus) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get status text (handle undefined/null status)
  const getStatusText = (status) => {
    const doctorStatus = status || 'pending';
    switch (doctorStatus) {
      case 'approved':
        return t('admin.doctorsList.statusApproved') || 'Approved';
      case 'pending':
        return t('admin.doctorsList.statusPending') || 'Pending';
      case 'rejected':
        return t('admin.doctorsList.statusRejected') || 'Rejected';
      default:
        return doctorStatus || 'Pending';
    }
  };

  useEffect(() => {
    if (aToken) {
      getAllDoctors();
    }
  }, [aToken, getAllDoctors]);

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name || '',
      email: doctor.email || '',
      speciality: doctor.speciality || '',
      degree: doctor.degree || '',
      licenseNumber: doctor.licenseNumber || '',
      experience: doctor.experience || '',
      about: doctor.about || '',
      address1: doctor.address?.line1 || '',
      address2: doctor.address?.line2 || '',
      available: doctor.available !== false,
      status: doctor.status || 'pending'
    });
    setDocImg(null);
    setShowEditModal(true);
  };

  const handleApprove = async (doctorId) => {
    if (!window.confirm(t('admin.doctorsList.confirmApprove') || 'Are you sure you want to approve this doctor?')) return;

    try {
      setLoading(true);
      const { data } = await axios.post(
        backendUrl + `/api/admin/doctor-approvals/${doctorId}/approve`,
        {},
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(t('admin.doctorsList.approveSuccess') || 'Doctor approved successfully');
        getAllDoctors();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.doctorsList.approveError') || 'Failed to approve doctor');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (doctorId) => {
    const reason = window.prompt(t('admin.doctorsList.rejectionReasonPrompt') || 'Please provide a reason for rejection:');
    if (!reason || !reason.trim()) {
      if (reason !== null) { // User clicked cancel
        toast.error(t('admin.doctorsList.rejectionReasonRequired') || 'Rejection reason is required');
      }
      return;
    }

    if (!window.confirm(t('admin.doctorsList.confirmReject') || 'Are you sure you want to reject this doctor?')) return;

    try {
      setLoading(true);
      const { data } = await axios.post(
        backendUrl + `/api/admin/doctor-approvals/${doctorId}/reject`,
        { reason: reason.trim() },
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(t('admin.doctorsList.rejectSuccess') || 'Doctor rejected successfully');
        getAllDoctors();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.doctorsList.rejectError') || 'Failed to reject doctor');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (doctorId) => {
    setDeletingDoctorId(doctorId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      const { data } = await axios.delete(
        backendUrl + `/api/admin/doctors/${deletingDoctorId}`,
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success(t('admin.doctorsList.deleteSuccess') || 'Doctor deleted successfully');
        getAllDoctors();
        setShowDeleteModal(false);
        setDeletingDoctorId(null);
      } else {
        toast.error(data.message || t('admin.doctorsList.deleteError'));
      }
    } catch (error) {
      console.error('Error deleting doctor:', error);
      toast.error(error.response?.data?.message || t('admin.doctorsList.deleteError'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.speciality || !formData.degree || !formData.licenseNumber || !formData.experience || !formData.about || !formData.address1) {
      toast.error(t('admin.doctorsList.fillAllFields') || 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const updateFormData = new FormData();
      updateFormData.append('name', formData.name);
      updateFormData.append('email', formData.email);
      updateFormData.append('speciality', formData.speciality);
      updateFormData.append('degree', formData.degree);
      updateFormData.append('licenseNumber', formData.licenseNumber);
      updateFormData.append('experience', formData.experience);
      updateFormData.append('about', formData.about);
      updateFormData.append('address', JSON.stringify({ line1: formData.address1, line2: formData.address2 }));
      updateFormData.append('available', formData.available);
      updateFormData.append('status', formData.status);
      if (docImg) {
        updateFormData.append('image', docImg);
      }

      const { data } = await axios.put(
        backendUrl + `/api/admin/doctors/${editingDoctor._id}`,
        updateFormData,
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success(t('admin.doctorsList.updateSuccess') || 'Doctor updated successfully');
        getAllDoctors();
        setShowEditModal(false);
        setEditingDoctor(null);
        setDocImg(null);
      } else {
        toast.error(data.message || t('admin.doctorsList.updateError'));
      }
    } catch (error) {
      console.error('Error updating doctor:', error);
      toast.error(error.response?.data?.message || t('admin.doctorsList.updateError'));
    } finally {
      setLoading(false);
    }
  };

  if (globalLoading && doctors.length === 0) {
    return <LoadingComponents.DashboardLoader text={t('admin.dashboardLoading') || 'Loading dashboard...'} />;
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-[#14324f] text-white px-4 sm:px-8 lg:px-12 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-3">
            <p className="text-xs   tracking-widest text-white/70">{t('admin.doctorsList.title') || t('admin.doctorsListTitle') || 'Doctors List'}</p>
            <h1 className="text-3xl sm:text-4xl font-semibold">{t('admin.doctorsListTitle')}</h1>
            <p className="text-sm sm:text-base text-white/80 max-w-3xl">{t('admin.doctorsListSubtitle')}</p>
          </div>
          <LanguageSwitch />
        </div>
      </section>

      {/* Content Section */}
      <section className="py-10 sm:py-12">
        <div className="w-full px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
          {/* Status Filter */}
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${statusFilter === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {t('admin.doctorsList.all') || 'All'} ({doctors.length})
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${statusFilter === 'approved'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {t('admin.doctorsList.approved') || 'Approved'} ({doctors.filter(d => (d.status || 'pending') === 'approved').length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${statusFilter === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {t('admin.doctorsList.pending') || 'Pending'} ({doctors.filter(d => !d.status || d.status === 'pending').length})
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${statusFilter === 'rejected'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {t('admin.doctorsList.rejected') || 'Rejected'} ({doctors.filter(d => d.status === 'rejected').length})
            </button>
          </div>

          {filteredDoctors.length === 0 ? (
            <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-8">
              <EmptyState variant="data" title={statusFilter === 'all' ? t('admin.doctorsList.noDoctors') : (t('admin.doctorsList.noDoctorsWithStatus', { status: statusFilter }) || `No ${statusFilter} doctors found`)} message="Try changing the status filter" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredDoctors.map((item) => (
                <div
                  key={item._id}
                  className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <img
                    className="w-full h-48 object-cover bg-gradient-to-br from-primary/10 to-primary-light/10"
                    src={item.image}
                    alt={item.name}
                  />
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-gray-900 text-lg font-semibold mb-1">{item.name}</p>
                        <p className="text-gray-600 text-sm mb-1">{item.speciality}</p>
                        <p className="text-gray-500 text-xs mb-2">{item.degree}</p>
                      </div>
                    </div>
                    {/* Status Badge */}
                    <div className="mb-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(item.status)}`}>
                        {getStatusText(item.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm mb-4">
                      <input
                        onChange={() => changeAvailbility(item._id)}
                        type="checkbox"
                        checked={item.available !== false}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <p className="text-gray-700">{t('admin.doctorsList.available')}</p>
                    </div>
                    {/* Action Buttons */}
                    <div className="space-y-2 pt-3 border-t border-gray-100">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="flex-1 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
                        >
                          {t('admin.doctorsList.edit')}
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                          {t('admin.doctorsList.delete')}
                        </button>
                      </div>
                      {/* Status Action Buttons */}
                      {(!item.status || item.status === 'pending') && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(item._id)}
                            disabled={loading}
                            className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                          >
                            {t('admin.doctorsList.approve') || 'Approve'}
                          </button>
                          <button
                            onClick={() => handleReject(item._id)}
                            disabled={loading}
                            className="flex-1 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium disabled:opacity-50"
                          >
                            {t('admin.doctorsList.reject') || 'Reject'}
                          </button>
                        </div>
                      )}
                      {item.status === 'rejected' && (
                        <button
                          onClick={() => handleApprove(item._id)}
                          disabled={loading}
                          className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          {t('admin.doctorsList.approve') || 'Approve'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Edit Modal */}
      {showEditModal && editingDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">{t('admin.doctorsList.editDoctor')}</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingDoctor(null);
                  setDocImg(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <label htmlFor="edit-doc-img" className="cursor-pointer">
                  <img
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                    src={docImg ? URL.createObjectURL(docImg) : getDoctorImageSrc(editingDoctor)}
                    alt="Doctor"
                  />
                </label>
                <input
                  onChange={(e) => setDocImg(e.target.files[0])}
                  type="file"
                  id="edit-doc-img"
                  accept="image/*"
                  hidden
                />
                <div>
                  <p className="text-sm font-medium text-gray-700">{t('admin.doctorsList.changePhoto')}</p>
                  <p className="text-xs text-gray-500">{t('admin.doctorsList.photoHint')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.addDoctorForm.doctorName')} *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.addDoctorForm.doctorEmail')} *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.addDoctorForm.speciality')} *</label>
                  <input
                    type="text"
                    value={formData.speciality}
                    onChange={(e) => setFormData({ ...formData, speciality: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.addDoctorForm.education')} *</label>
                  <input
                    type="text"
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.addDoctorForm.licenseNumber')} *</label>
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.addDoctorForm.experience')} *</label>
                  <input
                    type="text"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>


                {/* National e-Health Fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">National ID (NID)</label>
                  <input
                    type="text"
                    value={formData.nid || ''}
                    onChange={(e) => setFormData({ ...formData, nid: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="National ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department || ''}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g. Surgery"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Speciality</label>
                  <input
                    type="text"
                    value={formData.subSpeciality || ''}
                    onChange={(e) => setFormData({ ...formData, subSpeciality: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g. Pediatric Cardiology"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                  <select
                    value={formData.employmentType || 'Full-Time'}
                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Visiting">Visiting</option>
                    <option value="Volunteer">Volunteer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.addDoctorForm.aboutDoctor')} *</label>
                <textarea
                  value={formData.about}
                  onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows="3"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.addDoctorForm.address')} (Line 1) *</label>
                  <input
                    type="text"
                    value={formData.address1}
                    onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.addDoctorForm.address')} (Line 2)</label>
                  <input
                    type="text"
                    value={formData.address2}
                    onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label className="text-sm text-gray-700">{t('admin.doctorsList.available')}</label>
                </div>
                {/* Status Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.doctorsList.status') || 'Status'} *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="pending">{t('admin.doctorsList.statusPending') || 'Pending'}</option>
                    <option value="approved">{t('admin.doctorsList.statusApproved') || 'Approved'}</option>
                    <option value="rejected">{t('admin.doctorsList.statusRejected') || 'Rejected'}</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingDoctor(null);
                    setDocImg(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  {t('admin.doctorsList.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? t('admin.doctorsList.updating') : t('admin.doctorsList.update')}
                </button>
              </div>
            </form>
          </div>
        </div >
      )}

      {/* Delete Confirmation Modal */}
      {
        showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('admin.doctorsList.confirmDelete')}</h3>
              <p className="text-gray-600 mb-6">{t('admin.doctorsList.deleteWarning')}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingDoctorId(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  {t('admin.doctorsList.cancel')}
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? t('admin.doctorsList.deleting') : t('admin.doctorsList.confirmDeleteBtn')}
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default DoctorsList;
