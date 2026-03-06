import React, { useContext, useEffect, useState } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import MeetingPage from '../../components/MeetingPage';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import DoctorSkeletonLoaders from '../../components/DoctorSkeletonLoaders';

import DoctorClinicalNoteModal from '../../components/DoctorClinicalNoteModal';
import DoctorReferralModal from '../../components/DoctorReferralModal';
import DoctorLabOrderModal from '../../components/DoctorLabOrderModal';
import DoctorImmunizationModal from '../../components/DoctorImmunizationModal';
import DoctorPrescriptionModal from '../../components/DoctorPrescriptionModal';

const DoctorAppointment = () => {
  const { dToken, appointments, getAppointments, completeAppointment, cancelAppointment, approveAppointment, rejectAppointment, backendUrl } = useContext(DoctorContext);
  const [activeVideoCall, setActiveVideoCall] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [rejectionMessage, setRejectionMessage] = useState('');
  const [approvingId, setApprovingId] = useState(null);
  const [showSoapModal, setShowSoapModal] = useState(null);
  const [showReferralModal, setShowReferralModal] = useState(null);
  const [showLabModal, setShowLabModal] = useState(null);
  const [showImmunizationModal, setShowImmunizationModal] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useTranslation();

  const { calculateAge, slotDateFormat, currency } = useContext(AppContext)


  useEffect(() => {
    if (dToken) {
      setLoading(true);
      getAppointments().finally(() => setLoading(false));
    }
  }, [dToken]);

  // Safe reverse - check if appointments exists and is an array
  const appointmentsList = Array.isArray(appointments) ? [...appointments].reverse() : [];

  const filteredAppointments = appointmentsList.filter(item =>
    item.userData?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show skeleton loader while loading
  if (loading) {
    return <DoctorSkeletonLoaders.AppointmentsSkeleton />;
  }

  return (
    <div className='flex-1 bg-gray-50 min-h-screen p-3 sm:p-4 lg:p-6'>
      <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
        <div className='px-4 sm:px-6 py-3 sm:py-4 border-b bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
          <p className='text-lg sm:text-xl font-semibold text-gray-800'>{t('doctor.appointments')}</p>
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search by patient name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006838]/20 focus:border-[#006838] transition-all text-sm"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div className='overflow-y-auto max-h-[80vh]'>
          <div className='hidden lg:grid grid-cols-[0.5fr_2fr_1fr_1fr_1fr_3fr_1fr_1.5fr] gap-1 py-3 sm:py-4 px-4 sm:px-6 bg-gray-50 border-b'>
            <p className='text-sm font-semibold text-gray-700'>#</p>
            <p className='text-sm font-semibold text-gray-700'>{t('doctor.appointmentsTable.patientDetails')}</p>
            <p className='text-sm font-semibold text-gray-700'>{t('doctor.appointmentsTable.approval')}</p>
            <p className='text-sm font-semibold text-gray-700'>{t('doctor.appointmentsTable.payment')}</p>
            <p className='text-sm font-semibold text-gray-700'>{t('doctor.appointmentsTable.age')}</p>
            <p className='text-sm font-semibold text-gray-700'>{t('doctor.appointmentsTable.dateTime')}</p>
            <p className='text-sm font-semibold text-gray-700'>{t('doctor.appointmentsTable.fee')}</p>
            <p className='text-sm font-semibold text-gray-700'>{t('doctor.appointmentsTable.action')}</p>
          </div>

          {
            filteredAppointments.length > 0 ? filteredAppointments.map((item, index) => (
              <React.Fragment key={index}>
                <div className='flex flex-col lg:grid lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr_3fr_1fr_1.5fr] gap-2 lg:gap-1 items-start lg:items-center text-gray-600 py-3 sm:py-4 px-4 sm:px-6 border-b hover:bg-emerald-50 transition-all'>
                  <p className='hidden lg:block text-sm'>{index + 1}</p>
                  <div className='flex items-center gap-2 min-w-0'>
                    <img className='w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0' src={item.userData?.image || ''} alt="" />
                    <p className='text-sm sm:text-base font-medium truncate'>{item.userData?.name || 'N/A'}</p>
                  </div>
                  <div className='flex flex-wrap gap-1 lg:block'>
                    {item.approvalStatus === 'pending' && (
                      <p className='text-[10px] sm:text-xs inline px-2 sm:px-3 py-1 rounded-full font-medium bg-yellow-100 text-yellow-700 border border-yellow-300'>{t('doctor.appointmentsTable.pending')}</p>
                    )}
                    {item.approvalStatus === 'approved' && (
                      <p className='text-[10px] sm:text-xs inline px-2 sm:px-3 py-1 rounded-full font-medium bg-emerald-100 text-[#006838] border border-emerald-300'>{t('doctor.appointmentsTable.approved')}</p>
                    )}
                    {item.approvalStatus === 'rejected' && (
                      <p className='text-[10px] sm:text-xs inline px-2 sm:px-3 py-1 rounded-full font-medium bg-red-100 text-red-700 border border-red-300'>{t('doctor.appointmentsTable.rejected')}</p>
                    )}
                  </div>
                  <div className='flex flex-wrap gap-1 lg:block'>
                    {item.paymentStatus === 'approved' || item.payment ? (
                      <p className='text-[10px] sm:text-xs inline px-2 sm:px-3 py-1 rounded-full font-medium bg-emerald-100 text-[#006838] border border-emerald-300'>{t('doctor.appointmentsTable.paid')}</p>
                    ) : item.paymentStatus === 'pending' ? (
                      <p className='text-[10px] sm:text-xs inline px-2 sm:px-3 py-1 rounded-full font-medium bg-yellow-100 text-yellow-700 border border-yellow-300'>{t('doctor.appointmentsTable.paymentPending')}</p>
                    ) : item.paymentStatus === 'rejected' ? (
                      <p className='text-[10px] sm:text-xs inline px-2 sm:px-3 py-1 rounded-full font-medium bg-red-100 text-red-700 border border-red-300'>{t('doctor.appointmentsTable.paymentRejected')}</p>
                    ) : (
                      <p className='text-[10px] sm:text-xs inline px-2 sm:px-3 py-1 rounded-full font-medium bg-gray-100 text-gray-600 border border-gray-200'>{t('doctor.appointmentsTable.notPaid')}</p>
                    )}
                  </div>
                  <p className='hidden lg:block text-sm'>{item.userData?.dob ? calculateAge(item.userData.dob) : 'N/A'}</p>
                  <p className='text-xs sm:text-sm'>{item.slotDate ? slotDateFormat(item.slotDate) : 'N/A'}, {item.slotTime || 'N/A'}</p>
                  <p className='text-sm sm:text-base font-medium'>{currency}{item.amount || 0}</p>
                  {
                    item.cancelled
                      ? <p className='text-red-400 text-xs font-medium'>{t('doctor.appointmentsTable.cancelled')}</p>
                      : item.isCompleted
                        ? <p className='text-emerald-500 text-xs font-medium'>{t('doctor.appointmentsTable.completed')}</p>
                        : item.approvalStatus === 'pending'
                          ? <div className='flex flex-wrap gap-2 items-center w-full lg:w-auto'>
                            <button
                              onClick={() => {
                                setApprovingId(item._id);
                                approveAppointment(item._id, setApprovingId);
                              }}
                              disabled={approvingId === item._id}
                              className='px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-medium bg-[#006838] hover:bg-[#004d2a] text-white transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none'
                            >
                              {approvingId === item._id ? t('doctor.appointmentsTable.approving') : t('doctor.appointmentsTable.approve')}
                            </button>
                            <button
                              onClick={() => setShowRejectModal(item._id)}
                              className='px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-medium bg-red-50 hover:bg-red-100 text-red-600 border border-red-300 transition-all duration-300 flex-1 sm:flex-none'
                            >
                              {t('doctor.appointmentsTable.reject')}
                            </button>
                          </div>
                          : item.approvalStatus === 'approved'
                            ? <div className='flex flex-wrap gap-2 items-center w-full lg:w-auto'>
                              <button
                                onClick={() => {
                                  // Check if payment is approved before allowing video call
                                  if (item.paymentStatus !== 'approved' && !item.payment) {
                                    toast.warning('Patient has not paid yet. Please wait for payment approval before joining the video call.');
                                    return;
                                  }
                                  setActiveVideoCall(activeVideoCall === item._id ? null : item._id);
                                }}
                                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-medium transition-all duration-300 flex-1 sm:flex-none ${activeVideoCall === item._id
                                  ? 'bg-[#006838] hover:bg-[#004d2a] text-white shadow-md'
                                  : (item.paymentStatus === 'approved' || item.payment)
                                    ? 'bg-emerald-100 hover:bg-emerald-200 text-[#006838] border border-emerald-300'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-500 border border-gray-300 cursor-not-allowed'
                                  }`}
                                disabled={item.paymentStatus !== 'approved' && !item.payment}
                                title={item.paymentStatus !== 'approved' && !item.payment ? 'Patient has not paid yet' : ''}
                              >
                                {activeVideoCall === item._id ? t('doctor.appointmentsTable.hideVideo') : t('doctor.appointmentsTable.videoCall')}
                              </button>
                              <button
                                onClick={() => setShowSoapModal({ appointmentId: item._id, patientId: item.userData._id, name: item.userData.name })}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-medium bg-green-50 hover:bg-green-100 text-green-700 border border-green-300 transition-all flex-1 sm:flex-none"
                                title="Add Clinical Consultation Notes"
                              >
                                Notes
                              </button>
                              <button
                                onClick={() => setShowReferralModal({ appointmentId: item._id, patientId: item.userData._id, name: item.userData.name })}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 transition-all flex-1 sm:flex-none"
                                title="Refer Patient"
                              >
                                Refer
                              </button>
                              <button
                                onClick={() => setShowPrescriptionModal({ appointmentId: item._id, patientId: item.userData._id, name: item.userData.name })}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-medium bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-300 transition-all flex-1 sm:flex-none"
                                title="Write Prescription"
                              >
                                Rx
                              </button>
                              <button
                                onClick={() => setShowLabModal({ appointmentId: item._id, patientId: item.userData._id, name: item.userData.name })}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-[#006838] border border-emerald-300 transition-all flex-1 sm:flex-none"
                                title="Order Lab Test"
                              >
                                Lab
                              </button>
                              <button
                                onClick={() => setShowImmunizationModal({ appointmentId: item._id, patientId: item.userData._id, name: item.userData.name })}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-medium bg-green-50 hover:bg-green-100 text-green-700 border border-green-300 transition-all flex-1 sm:flex-none"
                                title="Record Immunization"
                              >
                                Vaccine
                              </button>
                              <button onClick={() => cancelAppointment(item._id)} className='w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-red-50 flex items-center justify-center hover:bg-red-100 transition-all flex-shrink-0'>
                                <svg className='w-4 h-4 sm:w-5 sm:h-5 text-red-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' /></svg>
                              </button>
                              <button onClick={() => completeAppointment(item._id)} className='w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-50 flex items-center justify-center hover:bg-emerald-100 transition-all flex-shrink-0'>
                                <svg className='w-4 h-4 sm:w-5 sm:h-5 text-emerald-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' /></svg>
                              </button>
                            </div>
                            : <p className='text-red-400 text-xs sm:text-sm font-medium'>{t('doctor.appointmentsTable.rejected')}</p>
                  }

                </div>
                {activeVideoCall === item._id && (item.paymentStatus === 'approved' || item.payment) && (
                  <MeetingPage
                    appointmentId={item._id}
                    patientId={item.userData._id}
                    backendUrl={backendUrl}
                    token={dToken}
                    role="doctor"
                    onEndCall={() => setActiveVideoCall(null)}
                    userName={item.docData?.name || 'Doctor'}
                    otherUserName={item.userData?.name || 'Patient'}
                    onShowNotes={() => setShowSoapModal({ appointmentId: item._id, patientId: item.userData._id, name: item.userData.name })}
                    onShowRefer={() => setShowReferralModal({ appointmentId: item._id, patientId: item.userData._id, name: item.userData.name })}
                    onShowRx={() => setShowPrescriptionModal({ appointmentId: item._id, patientId: item.userData._id, name: item.userData.name })}
                    onShowLab={() => setShowLabModal({ appointmentId: item._id, patientId: item.userData._id, name: item.userData.name })}
                    onShowVaccine={() => setShowImmunizationModal({ appointmentId: item._id, patientId: item.userData._id, name: item.userData.name })}
                  />
                )}
              </React.Fragment>
            )) : (
              <div className='p-12 text-center'>
                <p className='text-gray-500'>{t('doctor.appointmentsTable.noAppointments')}</p>
              </div>
            )
          }
        </div>
      </div>

      {/* Global Clinical Modals (Moved outside loop for reliability) */}
      {showSoapModal && (
        <DoctorClinicalNoteModal
          isOpen={true}
          onClose={() => setShowSoapModal(null)}
          appointmentId={showSoapModal.appointmentId}
          patientId={showSoapModal.patientId}
          patientName={showSoapModal.name}
        />
      )}

      {showReferralModal && (
        <DoctorReferralModal
          isOpen={true}
          onClose={() => setShowReferralModal(null)}
          appointmentId={showReferralModal.appointmentId}
          patientId={showReferralModal.patientId}
          patientName={showReferralModal.name}
        />
      )}

      {showPrescriptionModal && (
        <DoctorPrescriptionModal
          isOpen={true}
          onClose={() => setShowPrescriptionModal(null)}
          appointmentId={showPrescriptionModal.appointmentId}
          patientId={showPrescriptionModal.patientId}
          patientName={showPrescriptionModal.name}
        />
      )}

      {showLabModal && (
        <DoctorLabOrderModal
          isOpen={true}
          onClose={() => setShowLabModal(null)}
          appointmentId={showLabModal.appointmentId}
          patientId={showLabModal.patientId}
          patientName={showLabModal.name}
        />
      )}

      {showImmunizationModal && (
        <DoctorImmunizationModal
          isOpen={true}
          onClose={() => setShowImmunizationModal(null)}
          appointmentId={showImmunizationModal.appointmentId}
          patientId={showImmunizationModal.patientId}
          patientName={showImmunizationModal.name}
        />
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-xl p-4 sm:p-6 max-w-md w-full shadow-2xl'>
            <h3 className='text-lg sm:text-xl font-semibold mb-3 sm:mb-4'>{t('doctor.appointmentsTable.rejectAppointment')}</h3>
            <p className='text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4'>{t('doctor.appointmentsTable.rejectReason')}</p>
            <textarea
              value={rejectionMessage}
              onChange={(e) => setRejectionMessage(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006838] mb-3 sm:mb-4 text-sm'
              rows={4}
              placeholder={t('doctor.appointmentsTable.rejectPlaceholder')}
            />
            <div className='flex flex-col sm:flex-row gap-2 sm:gap-3'>
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectionMessage('');
                }}
                className='flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm'
              >
                {t('buttons.cancel')}
              </button>
              <button
                onClick={() => {
                  rejectAppointment(showRejectModal, rejectionMessage);
                  setShowRejectModal(null);
                  setRejectionMessage('');
                }}
                className='flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-300 text-sm'
              >
                {t('doctor.appointmentsTable.reject')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointment;

