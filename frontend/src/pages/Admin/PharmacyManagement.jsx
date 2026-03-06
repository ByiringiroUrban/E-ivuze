import React, { useState, useEffect, useContext } from 'react';
import { AdminContext } from '../../context/AdminContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { LoadingComponents } from '../../components/LoadingComponents';
import EmptyState from '../../components/EmptyState';

const PharmacyManagement = () => {
  const { aToken, backendUrl } = useContext(AdminContext);
  const { t } = useTranslation();
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPharmacy, setEditingPharmacy] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingPharmacyId, setRejectingPharmacyId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusPharmacyId, setStatusPharmacyId] = useState(null);
  const [statusPharmacyName, setStatusPharmacyName] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    licenseNumber: '',
    deliveryZones: '',
    managerName: '',
    managerPassword: '',
    language: 'en'
  });

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const fetchPharmacies = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(backendUrl + '/api/admin/pharmacies', {
        headers: { aToken }
      });
      if (data.success) {
        setPharmacies(data.pharmacies);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.pharmacyManagement.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreatePharmacy = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.licenseNumber || !formData.managerName || !formData.managerPassword) {
      toast.error(t('admin.pharmacyManagement.fillAllFields'));
      return;
    }

    if (formData.managerPassword.length < 6) {
      toast.error(t('admin.pharmacyManagement.passwordMinLength'));
      return;
    }

    setLoading(true);
    try {
      const deliveryZonesArray = formData.deliveryZones
        ? formData.deliveryZones.split(',').map(zone => zone.trim()).filter(zone => zone)
        : [];

      const { data } = await axios.post(
        backendUrl + '/api/admin/pharmacies',
        {
          ...formData,
          deliveryZones: deliveryZonesArray
        },
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success(t('admin.pharmacyManagement.pharmacyCreated'));
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
          licenseNumber: '',
          deliveryZones: '',
          managerName: '',
          managerPassword: '',
          language: 'en'
        });
        setShowCreateForm(false);
        fetchPharmacies();
        
        // Show invitation details
        if (data.manager) {
          toast.info(
            `${t('admin.pharmacyManagement.managerCreated') || 'Manager created.'} Email: ${data.manager.email}`,
            { autoClose: 8000 }
          );
        }
      } else {
        toast.error(data.message || t('admin.pharmacyManagement.createError'));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.pharmacyManagement.createError'));
    } finally {
      setLoading(false);
    }
  };

  const handleEditPharmacy = async (e) => {
    e.preventDefault();
    
    if (!editingPharmacy) return;

    setLoading(true);
    try {
      const deliveryZonesArray = formData.deliveryZones
        ? formData.deliveryZones.split(',').map(zone => zone.trim()).filter(zone => zone)
        : [];

      const { data } = await axios.put(
        backendUrl + `/api/admin/pharmacies/${editingPharmacy._id}`,
        {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          deliveryZones: deliveryZonesArray
        },
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success(t('admin.pharmacyManagement.pharmacyUpdated'));
        setEditingPharmacy(null);
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
          licenseNumber: '',
          deliveryZones: '',
          language: 'en'
        });
        fetchPharmacies();
      } else {
        toast.error(data.message || t('admin.pharmacyManagement.updateError'));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.pharmacyManagement.updateError'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendInvitation = async (pharmacyId) => {
    if (!window.confirm(t('admin.pharmacyManagement.resendConfirmation'))) return;

    setLoading(true);
    try {
      const { data } = await axios.post(
        backendUrl + `/api/admin/pharmacies/${pharmacyId}/resend-invitation`,
        { language: 'en' },
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success(t('admin.pharmacyManagement.invitationResent'));
      } else {
        toast.error(data.message || t('admin.pharmacyManagement.resendError'));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.pharmacyManagement.resendError'));
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePharmacy = async (pharmacyId, adminNotes = '') => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        backendUrl + `/api/admin/pharmacies/${pharmacyId}/approve`,
        { adminNotes },
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success(t('admin.pharmacyManagement.pharmacyApproved'));
        fetchPharmacies();
      } else {
        toast.error(data.message || t('admin.pharmacyManagement.approveError'));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.pharmacyManagement.approveError'));
    } finally {
      setLoading(false);
    }
  };

  const handleRejectPharmacy = async () => {
    if (!rejectionReason.trim()) {
      toast.error(t('admin.pharmacyManagement.rejectionReasonRequired'));
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        backendUrl + `/api/admin/pharmacies/${rejectingPharmacyId}/reject`,
        { reason: rejectionReason },
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success(t('admin.pharmacyManagement.pharmacyRejected'));
        setShowRejectModal(false);
        setRejectionReason('');
        setRejectingPharmacyId(null);
        fetchPharmacies();
      } else {
        toast.error(data.message || t('admin.pharmacyManagement.rejectError'));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.pharmacyManagement.rejectError'));
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async () => {
    if (!newStatus) {
      toast.error(t('admin.pharmacyManagement.selectStatusError'));
      return;
    }

    setLoading(true);
    try {
      let response;
      
      if (newStatus === 'APPROVED') {
        response = await axios.post(
          backendUrl + `/api/admin/pharmacies/${statusPharmacyId}/approve`,
          {},
          { headers: { aToken } }
        );
      } else if (newStatus === 'REJECTED') {
        toast.error(t('admin.pharmacyManagement.rejectButtonError'));
        setLoading(false);
        return;
      } else if (newStatus === 'PENDING') {
        // Option to reset to pending if needed
        response = await axios.put(
          backendUrl + `/api/admin/pharmacies/${statusPharmacyId}`,
          { status: 'PENDING' },
          { headers: { aToken } }
        );
      }

      if (response?.data?.success) {
        toast.success(`${t('admin.pharmacyManagement.statusUpdated')} ${newStatus}`);
        setShowStatusModal(false);
        setNewStatus('');
        setStatusPharmacyId(null);
        setStatusPharmacyName('');
        fetchPharmacies();
      } else {
        toast.error(response?.data?.message || t('admin.pharmacyManagement.statusUpdateError'));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.pharmacyManagement.statusUpdateError'));
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (pharmacy) => {
    setEditingPharmacy(pharmacy);
    setFormData({
      name: pharmacy.name || '',
      email: pharmacy.email || '',
      phone: pharmacy.phone || '',
      address: pharmacy.address || '',
      licenseNumber: pharmacy.licenseNumber || '',
      deliveryZones: pharmacy.deliveryZones?.join(', ') || '',
      language: 'en'
    });
    setShowCreateForm(true);
  };

  const cancelEdit = () => {
    setEditingPharmacy(null);
    setShowCreateForm(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      licenseNumber: '',
      deliveryZones: '',
      language: 'en'
    });
  };

  if (loading && (!pharmacies || pharmacies.length === 0)) {
    return <LoadingComponents.DashboardLoader text={t('admin.dashboardLoading') || 'Loading dashboard...'} />;
  }

  return (
    <div className="bg-white min-h-screen">
      <section className="bg-[#14324f] text-white px-4 sm:px-8 lg:px-12 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-white/70">
              {t('admin.pharmacyManagement.title') || 'Pharmacy management'}
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold">
              {t('admin.pharmacyManagement.title') || 'Pharmacy management'}
            </h1>
            <p className="text-sm sm:text-base text-white/80 max-w-3xl">
              {t('admin.pharmacyManagement.subtitle') || 'Invite, verify and manage pharmacy partners across the platform.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setEditingPharmacy(null);
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  address: '',
                  licenseNumber: '',
                  deliveryZones: '',
                  managerName: '',
                  managerPassword: '',
                  language: 'en'
                });
                setShowCreateForm(true);
              }}
              className="px-4 py-2 bg-white text-[#14324f] rounded-lg font-semibold hover:bg-white/90 transition-all"
            >
              {t('admin.pharmacyManagement.addPharmacy') || 'Add pharmacy'}
            </button>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-12">
        <div className="w-full px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-primary-dark">
                  {t('admin.pharmacyManagement.listTitle') || 'Registered pharmacies'}
                </p>
                <p className="text-sm text-gray-500">
                  {t('admin.pharmacyManagement.listSubtitle') || 'Review status and send invitations to new partners.'}
                </p>
              </div>
              <button
                onClick={fetchPharmacies}
                disabled={loading}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {loading ? (t('admin.pharmacyManagement.refreshing') || 'Refreshing...') : (t('admin.pharmacyManagement.refresh') || 'Refresh')}
              </button>
            </div>

            <div className="hidden md:grid grid-cols-[1fr_2fr_1.5fr_2fr_1fr_1.75fr] gap-4 py-3 px-6 border-b bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <p>{t('admin.pharmacyManagement.name')}</p>
              <p>{t('admin.pharmacyManagement.email')}</p>
              <p>{t('admin.pharmacyManagement.phone')}</p>
              <p>{t('admin.pharmacyManagement.address')}</p>
              <p>{t('admin.pharmacyManagement.status')}</p>
              <p className="text-right">{t('admin.pharmacyManagement.actions')}</p>
            </div>

            {loading && !pharmacies.length ? (
              <div className="p-10 text-center text-gray-500">{t('admin.pharmacyManagement.loadingPharmacies') || 'Loading pharmacies...'}</div>
            ) : pharmacies.length === 0 ? (
              <div className="p-10"><EmptyState variant="data" title={t('admin.pharmacyManagement.noPharmacies') || 'No pharmacies found.'} /></div>
            ) : (
              pharmacies.map((pharmacy) => (
                <div
                  key={pharmacy._id}
                  className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1.5fr_2fr_1fr_1.75fr] gap-4 py-4 px-6 border-b last:border-0 hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{pharmacy.name}</p>
                    <p className="text-xs text-gray-400 md:hidden truncate">License: {pharmacy.licenseNumber || '—'}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-700 truncate">{pharmacy.email}</p>
                    <p className="text-xs text-gray-400 md:hidden mt-1 truncate">Phone: {pharmacy.phone || '—'}</p>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm text-gray-700">{pharmacy.phone || '—'}</p>
                  </div>
                  <div className="hidden md:block min-w-0">
                    <p className="text-sm text-gray-700 truncate">
                      {typeof pharmacy.address === 'object'
                        ? `${pharmacy.address.line1 || ''}${pharmacy.address.city ? `, ${pharmacy.address.city}` : ''}`
                        : pharmacy.address || '—'}
                    </p>
                  </div>
                  <div>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        pharmacy.invitationAccepted
                          ? 'bg-primary/10 text-primary'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {pharmacy.invitationAccepted
                        ? (t('admin.pharmacyManagement.active') || 'Active')
                        : (t('admin.pharmacyManagement.pending') || 'Pending')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    <button
                      onClick={() => {
                        setStatusPharmacyId(pharmacy._id);
                        setStatusPharmacyName(pharmacy.name);
                        setNewStatus(pharmacy.status || 'PENDING');
                        setShowStatusModal(true);
                      }}
                      className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-all font-semibold"
                      title={t('admin.pharmacyManagement.updateStatus')}
                    >
                      ⚙️ {t('admin.pharmacyManagement.status')}
                    </button>
                    <button
                      onClick={() => startEdit(pharmacy)}
                      className="px-3 py-1 text-xs bg-primary-100 text-primary-700 rounded hover:bg-primary-200 transition-all"
                    >
                      {t('admin.pharmacyManagement.edit')}
                    </button>
                    {!pharmacy.invitationAccepted && (
                      <button
                        onClick={() => handleResendInvitation(pharmacy._id)}
                        className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-all"
                      >
                        {t('admin.pharmacyManagement.resendInvite')}
                      </button>
                    )}
                    {pharmacy.invitationAccepted && !pharmacy.verified && (
                      <>
                        <button
                          onClick={() => handleApprovePharmacy(pharmacy._id)}
                          className="px-3 py-1 text-xs bg-primary-100 text-primary-700 rounded hover:bg-primary-200 transition-all"
                        >
                          {t('admin.pharmacyManagement.approve')}
                        </button>
                        <button
                          onClick={() => {
                            setRejectingPharmacyId(pharmacy._id);
                            setShowRejectModal(true);
                          }}
                          className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-all"
                        >
                          {t('admin.pharmacyManagement.reject')}
                        </button>
                      </>
                    )}
                    {pharmacy.verified && (
                      <span className="px-3 py-1 text-xs bg-primary-100 text-primary-700 rounded font-semibold">
                        {t('admin.pharmacyManagement.verified')}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Create/Edit Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl shadow-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-primary-dark">
                  {editingPharmacy
                    ? (t('admin.pharmacyManagement.editPharmacy') || 'Edit pharmacy')
                    : (t('admin.pharmacyManagement.createNewPharmacy') || 'Add new pharmacy')}
                </p>
                <p className="text-sm text-gray-500">
                  {editingPharmacy
                    ? (t('admin.pharmacyManagement.editPharmacySubtitle') || 'Update contact details and operational info.')
                    : (t('admin.pharmacyManagement.createPharmacySubtitle') || 'Create a pharmacy and send an invitation to the manager.')}
                </p>
              </div>
              <button
                onClick={cancelEdit}
                className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                title={t('admin.pharmacyManagement.close') || 'Close'}
                type="button"
              >
                ×
              </button>
            </div>

            <form onSubmit={editingPharmacy ? handleEditPharmacy : handleCreatePharmacy}>
              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.pharmacyManagement.pharmacyName')} *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.pharmacyManagement.email')} *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!!editingPharmacy}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
                      required={!editingPharmacy}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.pharmacyManagement.phone')} *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  {!editingPharmacy && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('admin.pharmacyManagement.licenseNumber')} *
                      </label>
                      <input
                        type="text"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.pharmacyManagement.address')} *
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.pharmacyManagement.deliveryZones')}
                    </label>
                    <input
                      type="text"
                      name="deliveryZones"
                      value={formData.deliveryZones}
                      onChange={handleInputChange}
                      placeholder={t('admin.pharmacyManagement.deliveryZonesPlaceholder')}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {!editingPharmacy && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('admin.pharmacyManagement.managerName')} *
                        </label>
                        <input
                          type="text"
                          name="managerName"
                          value={formData.managerName}
                          onChange={handleInputChange}
                          placeholder={t('admin.pharmacyManagement.managerNamePlaceholder')}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('admin.pharmacyManagement.managerPassword')} *
                        </label>
                        <input
                          type="password"
                          name="managerPassword"
                          value={formData.managerPassword}
                          onChange={handleInputChange}
                          placeholder={t('admin.pharmacyManagement.managerPasswordPlaceholder')}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('admin.pharmacyManagement.invitationLanguage')}
                        </label>
                        <select
                          name="language"
                          value={formData.language}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="en">English</option>
                          <option value="rw">Kinyarwanda</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="px-6 py-5 border-t border-gray-200 flex flex-col sm:flex-row gap-3 sm:justify-end">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-6 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
                >
                  {t('admin.pharmacyManagement.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading
                    ? (t('admin.pharmacyManagement.saving') || 'Saving...')
                    : editingPharmacy
                      ? (t('admin.pharmacyManagement.updatePharmacy') || 'Update pharmacy')
                      : (t('admin.pharmacyManagement.createPharmacy') || 'Create pharmacy')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-purple-600">{t('admin.pharmacyManagement.updatePharmacyStatus')}</h3>
            <p className="text-gray-600 mb-4">{t('admin.pharmacyManagement.changeStatusFor')} <strong>{statusPharmacyName}</strong></p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.pharmacyManagement.selectStatus')}</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">{t('admin.pharmacyManagement.chooseStatus')}</option>
                <option value="PENDING">{t('admin.pharmacyManagement.pendingReview')}</option>
                <option value="APPROVED">{t('admin.pharmacyManagement.approved')}</option>
                <option value="REJECTED">{t('admin.pharmacyManagement.rejected')}</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setNewStatus('');
                  setStatusPharmacyId(null);
                  setStatusPharmacyName('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-all"
              >
                {t('admin.pharmacyManagement.cancel')}
              </button>
              <button
                onClick={handleChangeStatus}
                disabled={loading || !newStatus}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-all disabled:opacity-50"
              >
                {loading ? t('admin.pharmacyManagement.updating') : t('admin.pharmacyManagement.updateStatus')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-red-600">{t('admin.pharmacyManagement.rejectPharmacy')}</h3>
            <p className="text-gray-600 mb-4">{t('admin.pharmacyManagement.rejectionReasonPrompt')}</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder={t('admin.pharmacyManagement.rejectionReasonPlaceholder')}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              rows="4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                  setRejectingPharmacyId(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-all"
              >
                {t('admin.pharmacyManagement.cancel')}
              </button>
              <button
                onClick={handleRejectPharmacy}
                disabled={loading || !rejectionReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-all disabled:opacity-50"
              >
                {loading ? t('admin.pharmacyManagement.rejecting') : t('admin.pharmacyManagement.reject')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyManagement;

