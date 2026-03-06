import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AdminContext } from '../../context/AdminContext';
import { AppContext } from '../../context/AppContext';
import { useTranslation } from 'react-i18next';
import { LoadingComponents } from '../../components/LoadingComponents';
import LanguageSwitch from '../../components/LanguageSwitch';
import Pagination from '../../components/Pagination';

const PaymentApprovals = () => {
  const { backendUrl, aToken } = useContext(AdminContext);
  const { currency } = useContext(AppContext);
  const { t } = useTranslation();
  const [patientPayments, setPatientPayments] = useState([]);
  const [hospitalPayments, setHospitalPayments] = useState([]);
  const [allPatientPayments, setAllPatientPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentType, setPaymentType] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showAllPayments, setShowAllPayments] = useState(true); // Changed to true - show all by default
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const FIXED_PAYMENT_CODE = '017654';
  const [formData, setFormData] = useState({
    appointmentId: '',
    userId: '',
    docId: '',
    amount: '',
    paymentCode: FIXED_PAYMENT_CODE,
    paymentProof: '',
    status: 'pending',
    adminNotes: ''
  });

  useEffect(() => {
    fetchAllPayments(); // Fetch all payments by default
  }, []);

  const fetchAllPendingPayments = async () => {
    try {
      setLoading(true);
      const [patientData, hospitalData] = await Promise.all([
        axios.get(backendUrl + '/api/admin/payments/pending', { headers: { aToken } }),
        axios.get(backendUrl + '/api/admin/payments/hospital/pending', { headers: { aToken } })
      ]);

      if (patientData.data.success) {
        setPatientPayments(patientData.data.payments || []);
      }
      if (hospitalData.data.success) {
        setHospitalPayments(hospitalData.data.payments || []);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error(error.response?.data?.message || t('admin.paymentApprovals.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPayments = async (status = null) => {
    try {
      setLoading(true);
      const url = status
        ? `${backendUrl}/api/admin/payments?status=${status}`
        : `${backendUrl}/api/admin/payments`;

      const { data } = await axios.get(url, { headers: { aToken } });

      if (data.success) {
        setAllPatientPayments(data.payments || []);
        setShowAllPayments(true);
      }
    } catch (error) {
      console.error('Error fetching all payments:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const allPayments = showAllPayments
    ? allPatientPayments.map(p => ({ ...p, type: 'patient' }))
    : [
      ...patientPayments.map(p => ({ ...p, type: 'patient' })),
      ...hospitalPayments.map(p => ({ ...p, type: 'hospital' }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const filteredPayments = activeTab === 'all'
    ? allPayments
    : activeTab === 'patient'
      ? allPayments.filter(p => p.type === 'patient')
      : allPayments.filter(p => p.type === 'hospital');

  // Pagination logic
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPayments = filteredPayments.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, showAllPayments]);

  const handleApprove = async (paymentId, type) => {
    try {
      const endpoint = type === 'hospital'
        ? '/api/admin/payment/hospital/approve'
        : '/api/admin/payment/approve';

      const { data } = await axios.post(
        backendUrl + endpoint,
        { paymentId, adminNotes: adminNotes || '' },
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success(t('admin.paymentApprovals.approveSuccess'));
        setSelectedPayment(null);
        setPaymentType(null);
        setAdminNotes('');
        fetchAllPendingPayments();
      } else {
        toast.error(data.message || t('admin.paymentApprovals.approveFailed'));
      }
    } catch (error) {
      console.error('Error approving payment:', error);
      toast.error(error.response?.data?.message || t('admin.paymentApprovals.approveFailed'));
    }
  };

  const handleReject = async (paymentId, type) => {
    if (!adminNotes.trim()) {
      toast.error(t('admin.paymentApprovals.rejectionReasonRequired'));
      return;
    }

    try {
      const endpoint = type === 'hospital'
        ? '/api/admin/payment/hospital/reject'
        : '/api/admin/payment/reject';

      const { data } = await axios.post(
        backendUrl + endpoint,
        { paymentId, adminNotes },
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success(t('admin.paymentApprovals.rejectSuccess'));
        setSelectedPayment(null);
        setPaymentType(null);
        setAdminNotes('');
        fetchAllPendingPayments();
        if (showAllPayments) fetchAllPayments();
      } else {
        toast.error(data.message || t('admin.paymentApprovals.rejectFailed'));
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast.error(error.response?.data?.message || t('admin.paymentApprovals.rejectFailed'));
    }
  };

  const handleCreate = async () => {
    try {
      if (!formData.appointmentId || !formData.userId || !formData.docId || !formData.amount || !formData.paymentCode) {
        toast.error('Please fill in all required fields including Payment Code');
        return;
      }

      const { data } = await axios.post(
        backendUrl + '/api/admin/payments',
        formData,
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success('Payment created successfully');
        setShowCreateModal(false);
        setFormData({
          appointmentId: '',
          userId: '',
          docId: '',
          amount: '',
          paymentCode: '',
          paymentProof: '',
          status: 'pending',
          adminNotes: ''
        });
        fetchAllPendingPayments();
        if (showAllPayments) fetchAllPayments();
      } else {
        toast.error(data.message || 'Failed to create payment');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error(error.response?.data?.message || 'Failed to create payment');
    }
  };

  const handleUpdate = async () => {
    try {
      if (!editingPayment) return;

      const { data } = await axios.put(
        backendUrl + `/api/admin/payments/${editingPayment._id}`,
        formData,
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success('Payment updated successfully');
        setShowEditModal(false);
        setEditingPayment(null);
        setFormData({
          appointmentId: '',
          userId: '',
          docId: '',
          amount: '',
          paymentCode: '',
          paymentProof: '',
          status: 'pending',
          adminNotes: ''
        });
        fetchAllPendingPayments();
        if (showAllPayments) fetchAllPayments();
      } else {
        toast.error(data.message || 'Failed to update payment');
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      toast.error(error.response?.data?.message || 'Failed to update payment');
    }
  };

  const handleDelete = async (paymentId) => {
    if (!window.confirm('Are you sure you want to delete this payment? This action cannot be undone.')) {
      return;
    }

    try {
      const { data } = await axios.delete(
        backendUrl + `/api/admin/payments/${paymentId}`,
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success('Payment deleted successfully');
        fetchAllPendingPayments();
        if (showAllPayments) fetchAllPayments();
      } else {
        toast.error(data.message || 'Failed to delete payment');
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast.error(error.response?.data?.message || 'Failed to delete payment');
    }
  };

  const fetchDropdownData = async () => {
    try {
      setLoadingDropdowns(true);
      const [appointmentsRes, usersRes, doctorsRes] = await Promise.all([
        axios.get(backendUrl + '/api/admin/appointments', { headers: { aToken } }),
        axios.get(backendUrl + '/api/admin/users', { headers: { aToken } }),
        axios.post(backendUrl + '/api/admin/all-doctor', {}, { headers: { aToken } })
      ]);

      if (appointmentsRes.data.success) {
        setAppointments(appointmentsRes.data.appointments || []);
      }
      if (usersRes.data.success) {
        setUsers(usersRes.data.users || []);
      }
      if (doctorsRes.data.success) {
        setDoctors(doctorsRes.data.doctors || []);
      }
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      toast.error('Failed to load dropdown data');
    } finally {
      setLoadingDropdowns(false);
    }
  };

  const handleOpenCreateModal = () => {
    setFormData({
      appointmentId: '',
      userId: '',
      docId: '',
      amount: '',
      paymentCode: FIXED_PAYMENT_CODE, // Set default payment code
      paymentProof: '',
      status: 'pending',
      adminNotes: ''
    });
    setShowCreateModal(true);
    fetchDropdownData();
  };

  const openEditModal = (payment) => {
    setEditingPayment(payment);
    setFormData({
      appointmentId: payment.appointmentId || '',
      userId: payment.userId?._id || payment.userId || '',
      docId: payment.docId?._id || payment.docId || '',
      amount: payment.amount || '',
      paymentCode: FIXED_PAYMENT_CODE, // Always use fixed code
      paymentProof: payment.paymentProof || '',
      status: payment.status || 'pending',
      adminNotes: payment.adminNotes || ''
    });
    setShowEditModal(true);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-100 px-4 sm:px-8 lg:px-12 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <p className="text-xs tracking-widest text-[#064e3b] font-semibold">{t('admin.paymentApprovals.title') || t('admin.paymentApprovalsTitle') || 'Payment Approvals'}</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{t('admin.paymentApprovalsTitle')}</h1>
            <p className="text-sm text-gray-500 max-w-3xl pt-1">{t('admin.paymentApprovalsSubtitle')}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <LanguageSwitch />
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-10 sm:py-12">
        <div className="w-full px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto space-y-6">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-between items-center">
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAllPayments(!showAllPayments);
                  if (!showAllPayments) {
                    fetchAllPayments();
                  } else {
                    fetchAllPendingPayments();
                  }
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors shadow-sm"
              >
                {showAllPayments ? 'Show Pending Only' : 'Show All Payments'}
              </button>
              <button
                onClick={handleOpenCreateModal}
                className="px-6 py-2 bg-[#006838] text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-md flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Payment
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'all'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              {t('admin.allPayments')} ({allPayments.length})
            </button>
            <button
              onClick={() => setActiveTab('patient')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'patient'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              {t('admin.patientPayments')} ({patientPayments.length})
            </button>
            <button
              onClick={() => setActiveTab('hospital')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'hospital'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              {t('admin.hospitalPayments')} ({hospitalPayments.length})
            </button>
          </div>

          {/* Payments Cards - Professional Design */}
          {loading ? (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-12 text-center">
              <LoadingComponents.InlineLoader />
              <p className="text-gray-500 mt-4">{t('admin.paymentApprovals.loading')}</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 mt-4 text-lg">{t('admin.noPendingPayments')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedPayments.map((payment) => (
                <div
                  key={payment._id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  <div className="p-6">
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${payment.type === 'hospital'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                            }`}>
                            {payment.type === 'hospital' ? t('admin.hospital') : t('admin.patient')}
                          </span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${payment.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : payment.status === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                            }`}>
                            {payment.status === 'approved' ? '✓ Approved' : payment.status === 'rejected' ? '✗ Rejected' : '⏳ Pending'}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {payment.type === 'hospital'
                            ? payment.hospitalId?.name || 'Hospital Account'
                            : payment.userId?.name || 'Unknown User'}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          {payment.userId?.email && (
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span>{payment.userId.email}</span>
                            </div>
                          )}
                          {payment.userId?.phone && (
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              <span>{payment.userId.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{new Date(payment.createdAt).toLocaleDateString()}</span>
                            <span className="text-gray-400">•</span>
                            <span>{new Date(payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            {currency} {payment.amount?.toLocaleString() || payment.amount}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 font-mono bg-gray-50 px-2 py-1 rounded">
                            Code: {payment.paymentCode || FIXED_PAYMENT_CODE}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Details Section */}
                    <div className="border-t border-gray-100 pt-4 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {payment.type === 'hospital' ? (
                          <>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs font-semibold text-gray-500   mb-1">{t('admin.plan')}</p>
                              <p className="text-sm font-medium text-gray-900">
                                {payment.planType?.charAt(0).toUpperCase() + payment.planType?.slice(1)} Plan
                              </p>
                              <p className="text-xs text-gray-600 capitalize mt-1">{payment.billingPeriod}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="bg-blue-50 rounded-lg p-3">
                              <p className="text-xs font-semibold text-blue-600   mb-1">{t('admin.appointmentWith')}</p>
                              <p className="text-sm font-semibold text-gray-900 mb-1">
                                {payment.docId?.name || 'Unknown Doctor'}
                              </p>
                              {payment.docId?.speciality && (
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                  <span className="text-xs text-gray-600 bg-white px-2 py-0.5 rounded">
                                    {payment.docId.speciality}
                                  </span>
                                  {payment.docId.degree && (
                                    <span className="text-xs text-gray-600 bg-white px-2 py-0.5 rounded">
                                      {payment.docId.degree}
                                    </span>
                                  )}
                                  {payment.docId.experience && (
                                    <span className="text-xs text-gray-600 bg-white px-2 py-0.5 rounded">
                                      {payment.docId.experience} exp.
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs font-semibold text-gray-500   mb-1">Appointment Details</p>
                              {payment.appointmentId?.slotDate && (
                                <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span>{new Date(payment.appointmentId.slotDate).toLocaleDateString()}</span>
                                  {payment.appointmentId.slotTime && (
                                    <>
                                      <span className="text-gray-400">•</span>
                                      <span>{payment.appointmentId.slotTime}</span>
                                    </>
                                  )}
                                </div>
                              )}
                              {payment.appointmentId?.amount && (
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="font-medium">{currency} {payment.appointmentId.amount?.toLocaleString()}</span>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="border-t border-gray-100 pt-4 mt-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {payment.paymentProof ? (
                          <button
                            onClick={() => {
                              setSelectedPayment(payment);
                              setPaymentType(payment.type);
                              setAdminNotes('');
                            }}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {t('admin.viewProof')}
                          </button>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1.5 text-xs text-gray-400 bg-gray-50 rounded-lg">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            {t('admin.noProof')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedPayment(payment);
                            setPaymentType(payment.type);
                            setAdminNotes('');
                          }}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors shadow-sm"
                        >
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {t('admin.review')}
                        </button>
                        {payment.type === 'patient' && (
                          <>
                            <button
                              onClick={() => openEditModal(payment)}
                              className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            {payment.status !== 'approved' && (
                              <button
                                onClick={() => handleDelete(payment._id)}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                              >
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {filteredPayments.length > itemsPerPage && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredPayments.length}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Review Modal - Professional Design */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('admin.reviewPayment')}</h3>
                <p className="text-sm text-gray-500 mt-1">Review and manage payment details</p>
              </div>
              <button
                onClick={() => {
                  setSelectedPayment(null);
                  setPaymentType(null);
                  setAdminNotes('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Payer Information Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs font-semibold text-blue-600   mb-2">{t('admin.payer')}</p>
                    <h4 className="text-xl font-bold text-gray-900 mb-1">
                      {paymentType === 'hospital'
                        ? selectedPayment.hospitalId?.name || 'Hospital Account'
                        : selectedPayment.userId?.name || 'Unknown User'}
                    </h4>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {paymentType === 'hospital'
                          ? (selectedPayment.hospitalId?.adminUser?.email || selectedPayment.hospitalId?.adminUser?.name || 'N/A')
                          : selectedPayment.userId?.email || 'N/A'}
                      </p>
                      {selectedPayment.userId?.phone && (
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {selectedPayment.userId.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${paymentType === 'hospital'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-100 text-blue-700'
                    }`}>
                    {paymentType === 'hospital' ? t('admin.hospital') : t('admin.patient')}
                  </span>
                </div>
              </div>

              {/* Appointment/Plan Details Card */}
              {paymentType === 'hospital' ? (
                <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
                  <p className="text-xs font-semibold text-purple-600   mb-2">{t('admin.plan')}</p>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedPayment.planType?.charAt(0).toUpperCase() + selectedPayment.planType?.slice(1)} Plan
                  </p>
                  <p className="text-sm text-gray-600 capitalize mt-1">{selectedPayment.billingPeriod}</p>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
                  <p className="text-xs font-semibold text-green-600   mb-3">{t('admin.appointment')}</p>
                  <h4 className="text-lg font-bold text-gray-900 mb-3">
                    {t('admin.appointmentWith')} {selectedPayment.docId?.name || 'Unknown Doctor'}
                  </h4>
                  {selectedPayment.docId?.speciality && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-gray-700">
                        {selectedPayment.docId.speciality}
                      </span>
                      {selectedPayment.docId.degree && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-gray-700">
                          {selectedPayment.docId.degree}
                        </span>
                      )}
                      {selectedPayment.docId.experience && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-gray-700">
                          {selectedPayment.docId.experience} experience
                        </span>
                      )}
                    </div>
                  )}
                  <div className="space-y-2 pt-3 border-t border-green-200">
                    {selectedPayment.appointmentId?.slotDate && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium">
                          {new Date(selectedPayment.appointmentId.slotDate).toLocaleDateString()}
                          {selectedPayment.appointmentId.slotTime && ` at ${selectedPayment.appointmentId.slotTime}`}
                        </span>
                      </div>
                    )}
                    {selectedPayment.appointmentId?.amount && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">{currency} {selectedPayment.appointmentId.amount?.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Details Card */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500   mb-2">{t('admin.paymentCode')}</p>
                    <p className="font-mono text-lg font-bold text-gray-900 bg-white px-3 py-2 rounded-lg border border-gray-200">
                      {selectedPayment.paymentCode || FIXED_PAYMENT_CODE}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500   mb-2">{t('admin.amount')}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {currency} {selectedPayment.amount?.toLocaleString() || selectedPayment.amount}
                    </p>
                  </div>
                </div>
              </div>

              {selectedPayment.paymentProof && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">{t('admin.paymentProof')}:</p>
                  <img
                    src={selectedPayment.paymentProof}
                    alt="Payment proof"
                    className="max-w-full h-auto border rounded-lg"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.adminNotes')} ({t('admin.requiredForRejection')}):
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows="3"
                  placeholder={t('admin.addNotesPlaceholder')}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleReject(selectedPayment._id, paymentType)}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  {t('admin.reject')}
                </button>
                <button
                  onClick={() => handleApprove(selectedPayment._id, paymentType)}
                  className="flex-1 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors"
                >
                  {t('admin.approve')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Payment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 sm:p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-800">Create Payment</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({
                    appointmentId: '',
                    userId: '',
                    docId: '',
                    amount: '',
                    paymentCode: '',
                    paymentProof: '',
                    status: 'pending',
                    adminNotes: ''
                  });
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {loadingDropdowns ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">Loading data...</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Appointment *</label>
                    <select
                      value={formData.appointmentId}
                      onChange={(e) => {
                        const selectedAppointment = appointments.find(a => a._id === e.target.value);
                        setFormData({
                          ...formData,
                          appointmentId: e.target.value,
                          userId: selectedAppointment?.userId?._id || selectedAppointment?.userId || formData.userId,
                          docId: selectedAppointment?.docId?._id || selectedAppointment?.docId || formData.docId
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option value="">Select Appointment</option>
                      {appointments.map((appointment) => (
                        <option key={appointment._id} value={appointment._id}>
                          {appointment.userId?.name || 'User'} - {appointment.docId?.name || 'Doctor'} - {appointment.slotDate ? new Date(appointment.slotDate).toLocaleDateString() : 'N/A'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">User *</label>
                    <select
                      value={formData.userId}
                      onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option value="">Select User</option>
                      {users.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Doctor *</label>
                    <select
                      value={formData.docId}
                      onChange={(e) => setFormData({ ...formData, docId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option value="">Select Doctor</option>
                      {doctors.map((doctor) => (
                        <option key={doctor._id} value={doctor._id}>
                          {doctor.name} - {doctor.speciality}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Code *</label>
                    <input
                      type="text"
                      value={FIXED_PAYMENT_CODE}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 font-mono"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Payment code is fixed: {FIXED_PAYMENT_CODE}</p>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Proof URL</label>
                <input
                  type="text"
                  value={formData.paymentProof}
                  onChange={(e) => setFormData({ ...formData, paymentProof: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes</label>
                <textarea
                  value={formData.adminNotes}
                  onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows="3"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({
                      appointmentId: '',
                      userId: '',
                      docId: '',
                      amount: '',
                      paymentCode: '',
                      paymentProof: '',
                      status: 'pending',
                      adminNotes: ''
                    });
                  }}
                  className="flex-1 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="flex-1 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors"
                >
                  Create Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Payment Modal */}
      {showEditModal && editingPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 sm:p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-800">Edit Payment</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingPayment(null);
                  setFormData({
                    appointmentId: '',
                    userId: '',
                    docId: '',
                    amount: '',
                    paymentCode: '',
                    paymentProof: '',
                    status: 'pending',
                    adminNotes: ''
                  });
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Code</label>
                <input
                  type="text"
                  value={FIXED_PAYMENT_CODE}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">Payment code is fixed: {FIXED_PAYMENT_CODE}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Proof URL</label>
                <input
                  type="text"
                  value={formData.paymentProof}
                  onChange={(e) => setFormData({ ...formData, paymentProof: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes</label>
                <textarea
                  value={formData.adminNotes}
                  onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows="3"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPayment(null);
                    setFormData({
                      appointmentId: '',
                      userId: '',
                      docId: '',
                      amount: '',
                      paymentCode: '',
                      paymentProof: '',
                      status: 'pending',
                      adminNotes: ''
                    });
                  }}
                  className="flex-1 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="flex-1 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors"
                >
                  Update Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentApprovals;
