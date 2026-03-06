import React, { useState, useContext, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import MeetingPage from '../components/MeetingPage'
import PaymentPopup from '../components/PaymentPopup'
import { useTranslation } from 'react-i18next'
import SEO from '../components/SEO'
import EmptyState from '../components/EmptyState'
import { motion } from 'framer-motion'
import { FaUserMd, FaMapMarkerAlt, FaClock, FaCheckCircle, FaVideo, FaBan, FaMoneyBillWave, FaArrowRight, FaCalendarDay, FaCalendarCheck } from 'react-icons/fa'
import { getDoctorImageSrc } from '../utils/doctorImage'

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext)
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [appointments, setAppointments] = useState([])
  const [activeVideoCall, setActiveVideoCall] = useState(null)
  const [activePayment, setActivePayment] = useState(null)
  const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split('_')
    return `${dateArray[0]} ${months[Number(dateArray[1])]} ${dateArray[2]}`
  }

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/appointments`, { headers: { token } })

      if (data.success) {
        setAppointments(data.appointments.reverse())
      }
    } catch (error) {
      console.error(error)
      toast.error(error.message)
    }
  }

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/user/cancel-appointment`, { appointmentId }, { headers: { token } })

      if (data.success) {
        toast.success(data.message || 'Appointment cancelled successfully')
        getUserAppointments()
        getDoctorsData()
      } else {
        toast.error(data.message || 'Failed to cancel appointment')
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      toast.error(error.response?.data?.message || error.message || 'Failed to cancel appointment')
    }
  }

  useEffect(() => {
    if (token) {
      getUserAppointments()
    }
  }, [token])

  const statusBadge = (item) => {
    if (item.cancelled) return (
      <span className="bg-red-50 text-red-600 border-2 border-red-100 px-4 py-1.5 text-[10px] font-semibold tracking-wider flex items-center gap-2">
        <FaBan /> {t('pages.myAppointments.appointmentCancelled')}
      </span>
    );

    if (item.isCompleted) return (
      <span className="bg-[#88C250]/10 text-[#006838] border-2 border-[#88C250]/20 px-4 py-1.5 text-[10px] font-semibold tracking-wider flex items-center gap-2">
        <FaCheckCircle /> {t('pages.myAppointments.completed')}
      </span>
    );

    if (item.approvalStatus === 'pending') {
      return (
        <span className="bg-amber-50 text-amber-600 border-2 border-amber-100 px-4 py-1.5 text-[10px] font-semibold tracking-wider flex items-center gap-2">
          <FaClock /> {t('pages.myAppointments.waitingApproval')}
        </span>
      )
    }
    if (item.approvalStatus === 'approved') {
      const isPaid = item.paymentStatus === 'approved';
      return (
        <span className={`${isPaid ? 'bg-[#006838]/5 text-[#006838] border-[#006838]/10' : 'bg-[#006838]/5 text-[#006838] border-[#006838]/10'} border-2 px-4 py-1.5 text-[10px] font-semibold tracking-wider flex items-center gap-2`}>
          <FaCheckCircle /> {isPaid ? 'APPROVED & COMPLETED' : t('pages.myAppointments.approvedProceedPayment')}
        </span>
      )
    }
    if (item.approvalStatus === 'rejected') {
      return (
        <span className="bg-red-50 text-red-600 border-2 border-red-100 px-4 py-1.5 text-[10px] font-semibold tracking-wider flex items-center gap-2">
          <FaBan /> {t('pages.myAppointments.rejected')}
        </span>
      )
    }
    return null
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      <SEO
        title={t('pages.myAppointments.title')}
        description={t('pages.myAppointments.description')}
      />

      {/* Official Header */}
      <div className="bg-[#006838] relative overflow-hidden pt-20 pb-40 px-6">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#88C250]/10 skew-x-12 transform translate-x-20"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div>
              <p className="text-[#88C250] font-semibold text-xs tracking-wider mb-2 px-1">Clinical Schedule</p>
              <h1 className="text-4xl md:text-5xl font-bold text-white font-merriweather leading-tight">My Appointments</h1>
              <p className="text-white/70 mt-3 font-medium flex items-center gap-2">
                Official log of your upcoming medical consultations.
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-md px-8 py-5 rounded-none border-2 border-white/10 flex items-center gap-6">
              <div className="w-12 h-12 bg-[#88C250]/20 flex items-center justify-center text-[#88C250] text-2xl">
                <FaCalendarDay />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-white/60 leading-none tracking-wider">Active Sessions</p>
                <p className="text-3xl font-bold text-white mt-1 leading-none">{appointments.filter(a => !a.cancelled && !a.isCompleted).length}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-24 relative z-10">
        <div className="space-y-6">
          {appointments.length === 0 ? (
            <div className="bg-white border-2 border-gray-100 p-24 text-center">
              <EmptyState variant="data" title="No Records Found" message="Your clinical schedule is currently clear. Access the registry to book a consult.">
                <button onClick={() => navigate('/doctors')} className="mt-10 bg-[#006838] text-white px-10 py-5 font-semibold text-sm hover:bg-[#88C250] hover:text-[#006838] transition-all">
                  Browse Medical Practitioners
                </button>
              </EmptyState>
            </div>
          ) : (
            appointments.map((item, index) => (
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={index}
                className="bg-white border-2 border-gray-100 overflow-hidden"
              >
                <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_260px]">
                  {/* Doctor Profile Side */}
                  <div className="relative h-64 lg:h-full border-b lg:border-b-0 lg:border-r-2 border-gray-100 group">
                    <img
                      className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                      src={getDoctorImageSrc(item.docData)}
                      alt={item.docData.name}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#006838]/60 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <p className="text-white text-lg font-bold font-merriweather leading-tight">{item.docData.name}</p>
                      <p className="text-[#88C250] text-[10px] font-semibold   tracking-wider mt-1">{item.docData.speciality}</p>
                    </div>
                  </div>

                  {/* Consultation Details */}
                  <div className="p-10 space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-gray-50 pb-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-[#006838] text-white p-4">
                          <FaCalendarDay size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-[#006838]/60   tracking-wider leading-none">Registered Date</p>
                          <p className="text-xl font-bold text-[#006838] font-merriweather mt-1">{slotDateFormat(item.slotDate)} — {item.slotTime}</p>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {statusBadge(item)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <p className="text-xs font-semibold text-[#006838]/60   tracking-wider flex items-center gap-2">
                          <FaMapMarkerAlt className="text-[#88C250]" /> Healthcare Facility
                        </p>
                        <div className="text-sm font-semibold text-[#006838] bg-gray-50 p-6 border-l-4 border-[#88C250]">
                          {item.docData.address?.line1 || 'Main Medical Center'} <br />
                          <span className="text-[#006838]/40 font-medium">{item.docData.address?.line2 || 'Kigali Division'}</span>
                        </div>
                      </div>

                      {item.approvalStatus === 'rejected' && item.rejectionMessage && (
                        <div className="bg-red-50 p-6 border-l-4 border-red-400">
                          <p className="text-[10px] font-semibold text-red-600   tracking-wider mb-2">Protocol Feedback</p>
                          <p className="text-xs font-semibold text-red-800 italic">"{item.rejectionMessage}"</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Official Action Controls */}
                  <div className="bg-gray-50 p-8 flex flex-col justify-center gap-4 border-t lg:border-t-0 lg:border-l-2 border-gray-100">
                    {!item.cancelled && !item.isCompleted && item.approvalStatus === 'approved' && item.paymentStatus !== 'approved' && (
                      <button
                        onClick={() => setActivePayment(activePayment === item._id ? null : item._id)}
                        className="w-full bg-[#88C250] text-[#006838] px-6 py-5 font-semibold text-xs   tracking-wider flex items-center justify-center gap-3 hover:bg-[#006838] hover:text-white transition-all"
                      >
                        <FaMoneyBillWave /> {item.paymentStatus === 'pending' ? 'Confirming Payment' : 'Complete Payment'}
                      </button>
                    )}

                    {!item.cancelled && !item.isCompleted && item.paymentStatus === 'approved' && (
                      <button
                        onClick={() => setActiveVideoCall(activeVideoCall === item._id ? null : item._id)}
                        className="w-full bg-[#006838] text-white px-6 py-5 font-semibold text-xs tracking-wider flex items-center justify-center gap-3 hover:bg-[#88C250] hover:text-[#006838] transition-all"
                      >
                        <FaVideo /> {activeVideoCall === item._id ? 'Terminate Session' : 'Joint Virtual Consult'}
                      </button>
                    )}

                    {item.isCompleted && (
                      <button
                        onClick={() => navigate('/my-prescriptions')}
                        className="w-full bg-[#006838] text-white px-6 py-5 font-semibold text-xs tracking-wider flex items-center justify-center gap-3 hover:bg-[#88C250] hover:text-[#006838] transition-all"
                      >
                        <FaArrowRight /> Access Prescriptions
                      </button>
                    )}

                    {!item.cancelled && !item.isCompleted && (
                      <button
                        onClick={() => cancelAppointment(item._id)}
                        className="w-full bg-white border-2 border-red-100 text-red-600 px-6 py-4 font-semibold text-xs tracking-wider hover:bg-red-50 transition-all"
                      >
                        Cancel Request
                      </button>
                    )}

                    <div className="mt-4 pt-6 border-t border-gray-200 text-center">
                      <p className="text-[9px] font-semibold text-[#006838]/40   tracking-widest">Transaction Token</p>
                      <p className="text-xs font-mono font-bold text-[#006838] mt-1">RX-{item._id.slice(-8).toUpperCase()}</p>
                    </div>
                  </div>
                </div>

                {/* Overlay components (Meeting, Payment) */}
                {activePayment === item._id && (
                  <div className="p-8 bg-blue-50 border-t border-blue-100">
                    <PaymentPopup
                      appointmentId={item._id}
                      amount={item.amount}
                      onClose={() => setActivePayment(null)}
                      onSuccess={() => {
                        getUserAppointments()
                        setActivePayment(null)
                      }}
                      backendUrl={backendUrl}
                      token={token}
                    />
                  </div>
                )}
                {activeVideoCall === item._id && (
                  <div className="bg-slate-900 border-t border-primary">
                    <MeetingPage
                      appointmentId={item._id}
                      backendUrl={backendUrl}
                      token={token}
                      role="patient"
                      onEndCall={() => setActiveVideoCall(null)}
                      userName={item.userData?.name || 'Patient'}
                      otherUserName={item.docData?.name || 'Doctor'}
                    />
                  </div>
                )}
              </motion.article>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default MyAppointments