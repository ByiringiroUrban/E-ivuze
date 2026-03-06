import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { DoctorContext } from '../../context/DoctorContext'
import { useEffect } from 'react'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import IconTexture from '../../components/IconTexture'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { toast } from 'react-toastify'
import DoctorSkeletonLoaders from '../../components/DoctorSkeletonLoaders'
import EmptyState from '../../components/EmptyState'

const DoctorDashboard = () => {
  const { dToken, dashData, setDashData, getDashData, completeAppointment, cancelAppointment, profileData, backendUrl } = useContext(DoctorContext)
  const { currency, slotDateFormat } = useContext(AppContext)
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const { t } = useTranslation()

  const normalizeToArray = (value, fallback) => {
    if (Array.isArray(value)) {
      return value
    }
    if (value && typeof value === 'object') {
      return Object.values(value)
    }
    if (typeof value === 'string') {
      return value.split(',').map(item => item.trim()).filter(Boolean)
    }
    return fallback
  }

  useEffect(() => {
    if (dToken) {
      // Check doctor status before loading dashboard
      checkDoctorStatus()
      getDashData()
      fetchAppointments()
    }
  }, [dToken])

  const fetchAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/appointments`, {
        headers: { dToken }
      })
      if (data.success) {
        setAppointments(data.appointments || [])
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkDoctorStatus = async () => {
    if (!dToken) return
    try {
      const { data } = await axios.get(
        backendUrl + '/api/doctor/profile',
        { headers: { dToken } }
      )
      if (data.success && data.profileData) {
        const status = data.profileData.status
        if (status !== 'approved') {
          if (status === 'pending') {
            toast.info(t('doctor_registration.pending_message') || 'Your account is pending approval. Please wait for the E-ivuzeteam to approve your account.')
          } else if (status === 'rejected') {
            const reason = data.profileData.rejection_reason ? ` Reason: ${data.profileData.rejection_reason}` : ''
            toast.error(t('doctor_registration.rejected_message') || `Your account has been rejected.${reason}`)
          }
        }
      }
    } catch (error) {
      // If API call fails due to status check, the error message will be shown
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      }
    }
  }

  const handleViewReport = () => {
    navigate('/doctor-reports')
  }

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const getAppointmentsForDate = (date) => {
    if (!date) return []
    const dateStr = `${date.getDate()}_${date.getMonth() + 1}_${date.getFullYear()}`
    return appointments.filter(apt => apt.slotDate === dateStr)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-500'
      case 'Approved':
        return 'bg-green-500'
      case 'Pending':
        return 'bg-yellow-500'
      case 'Cancelled':
        return 'bg-red-500'
      default:
        return 'bg-gray-400'
    }
  }

  const defaultMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const defaultDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const translatedMonths = t('calendar.months', { returnObjects: true })
  const translatedDays = t('calendar.daysShort', { returnObjects: true })
  const monthNames = normalizeToArray(translatedMonths, defaultMonths)
  const dayNames = normalizeToArray(translatedDays, defaultDays)

  if (dToken && !dashData) {
    return <DoctorSkeletonLoaders.DashboardSkeleton />
  }

  return dashData && (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50'>
      <div className='max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8'>
        {/* Header Section */}
        <div className='mb-8'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div>
              <h1 className='text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-2'>Dashboard</h1>
              <p className='text-gray-600 text-lg'>Welcome back, Dr. {profileData?.name || 'Doctor'}</p>
            </div>
            <div className='flex items-center gap-3'>
              <div className='text-right'>
                <p className='text-sm text-gray-500'>Current Time</p>
                <p className='text-lg font-semibold text-gray-900'>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div className='w-12 h-12 rounded-full bg-gradient-to-br from-[#006838] to-[#004d2a] flex items-center justify-center shadow-lg'>
                <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6v6m0 0v6m0-6h6m-6 0H6' />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className='flex flex-col xl:flex-row gap-6 lg:gap-8'>
          {/* Main Content Area */}
          <div className='flex-1 space-y-4 sm:space-y-6'>
            {/* Reminder Banner Card */}
            <div className='bg-gradient-to-r from-[#004d2a] via-[#006838] to-[#004d2a] text-white rounded-2xl p-6 lg:p-8 relative overflow-hidden shadow-2xl border border-emerald-700/30'>
              <div className='absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl'></div>
              <IconTexture opacity={0.08} size={32} className="text-white absolute inset-0" />
              <div className='flex flex-col lg:flex-row items-start lg:items-center justify-between relative z-10 gap-6 lg:gap-0'>
                <div className='flex-1'>
                  <div className='inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-medium mb-4'>
                    <svg className='w-3 h-3 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                      <path d='M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zm0 16a3 3 0 01-3-3h6a3 3 0 01-3 3z' />
                    </svg>
                    {t('doctor.dashboardReminder')}
                  </div>
                  <h2 className='text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 leading-tight'>{t('doctor.dashboardReminderTitle')}</h2>
                  <p className='text-gray-300 mb-6 max-w-lg'>Stay on top of your schedule and provide the best care for your patients.</p>
                  <div className='flex gap-3 flex-wrap'>
                    <button className='bg-white text-[#006838] px-6 py-3 text-sm font-semibold rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'>
                      {t('doctor.dashboardCheckNow')}
                    </button>
                    <button
                      onClick={handleViewReport}
                      className='border border-white/30 text-white px-6 py-3 text-sm font-semibold rounded-xl hover:bg-white/10 transition-all duration-200 backdrop-blur-sm'
                    >
                      {t('doctor.dashboardViewReport')}
                    </button>
                  </div>
                </div>
                <div className='hidden lg:block w-56 h-56 relative'>
                  <div className='absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-2xl blur-2xl'></div>
                  <img className='w-full h-full object-contain relative z-10' src={assets.appointment_img} alt="Doctor" />
                </div>
              </div>
            </div>

            {/* Health Metrics Cards */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6'>
              <div className='bg-white rounded-2xl p-6 flex items-center gap-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100'>
                <div className='w-14 h-14 rounded-2xl bg-emerald-700 flex items-center justify-center flex-shrink-0 shadow-lg'>
                  <svg className='w-7 h-7 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' />
                  </svg>
                </div>
                <div className='flex-1'>
                  <p className='text-3xl font-bold text-gray-900 mb-1'>{dashData.appointments || 0}</p>
                  <p className='text-sm font-medium text-gray-600'>{t('doctor.dashboardAppointments')}</p>
                  <div className='flex items-center gap-1 mt-2'>
                    <svg className='w-4 h-4 text-green-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' />
                    </svg>
                    <span className='text-xs text-green-600 font-medium'>12% from last week</span>
                  </div>
                </div>
              </div>

              <div className='bg-white rounded-2xl p-6 flex items-center gap-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100'>
                <div className='w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg'>
                  <svg className='w-7 h-7 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                  </svg>
                </div>
                <div className='flex-1'>
                  <p className='text-3xl font-bold text-gray-900 mb-1'>{dashData.patients || 0}</p>
                  <p className='text-sm font-medium text-gray-600'>{t('doctor.dashboardPatients')}</p>
                  <div className='flex items-center gap-1 mt-2'>
                    <svg className='w-4 h-4 text-green-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' />
                    </svg>
                    <span className='text-xs text-green-600 font-medium'>8% from last month</span>
                  </div>
                </div>
              </div>

              <div className='bg-white rounded-2xl p-6 flex items-center gap-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 sm:col-span-2 lg:col-span-1'>
                <div className='w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg'>
                  <svg className='w-7 h-7 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                </div>
                <div className='flex-1'>
                  <p className='text-2xl lg:text-3xl font-bold text-gray-900 mb-1'>{currency} {dashData.earnings || 0}</p>
                  <p className='text-sm font-medium text-gray-600'>{t('doctor.dashboardEarnings')}</p>
                  <div className='flex items-center gap-1 mt-2'>
                    <svg className='w-4 h-4 text-green-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' />
                    </svg>
                    <span className='text-xs text-green-600 font-medium'>23% from last month</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Real Charts Section */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
              {/* Appointments Over Time Chart */}
              <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-100 lg:col-span-2'>
                <div className='flex items-center justify-between mb-6'>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900 mb-1'>Appointments Trend</h3>
                    <p className='text-sm text-gray-600'>Last 7 days performance</p>
                  </div>
                  <div className='flex items-center gap-2 text-sm text-green-600 font-medium'>
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' />
                    </svg>
                    +12.5%
                  </div>
                </div>
                <div className='h-64 flex items-end justify-between gap-3 px-2'>
                  {(() => {
                    const last7Days = []
                    const today = new Date()
                    for (let i = 6; i >= 0; i--) {
                      const date = new Date(today)
                      date.setDate(date.getDate() - i)
                      const dateStr = `${date.getDate()}_${date.getMonth() + 1}_${date.getFullYear()}`
                      const dayAppointments = appointments.filter(apt => apt.slotDate === dateStr)
                      last7Days.push({
                        date: date.toLocaleDateString('en', { weekday: 'short' }),
                        count: dayAppointments.length
                      })
                    }
                    const maxCount = Math.max(...last7Days.map(d => d.count), 1)
                    return last7Days.map((day, index) => (
                      <div key={index} className='flex-1 flex flex-col items-center gap-2'>
                        <div className='w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg relative hover:from-emerald-700 hover:to-emerald-600 transition-all duration-200 shadow-lg' style={{ height: `${(day.count / maxCount) * 100}%` }}>
                          <div className='absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap'>
                            {day.count} appointments
                          </div>
                        </div>
                        <div className='text-xs font-medium text-gray-600'>{day.date}</div>
                        <div className='text-sm font-bold text-gray-900'>{day.count}</div>
                      </div>
                    ))
                  })()}
                </div>
              </div>

              {/* Appointment Status Donut */}
              <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-100'>
                <div className='mb-6'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-1'>Status Breakdown</h3>
                  <p className='text-sm text-gray-600'>All appointments</p>
                </div>
                <div className='flex items-center justify-center h-48'>
                  {(() => {
                    const completed = appointments.filter(a => a.isCompleted && !a.cancelled).length
                    const pending = appointments.filter(a => !a.isCompleted && !a.cancelled).length
                    const cancelled = appointments.filter(a => a.cancelled).length
                    const total = completed + pending + cancelled
                    if (total === 0) {
                      return <EmptyState variant="data" title="No appointments" iconSize="w-12 h-12" className="py-8" />
                    }
                    const completedPercent = Math.round((completed / total) * 100)
                    const pendingPercent = Math.round((pending / total) * 100)
                    const cancelledPercent = Math.round((cancelled / total) * 100)
                    return (
                      <div className='relative'>
                        <svg className='w-40 h-40 transform -rotate-90 drop-shadow-lg'>
                          <circle cx='80' cy='80' r='70' stroke='#f3f4f6' strokeWidth='12' fill='none' />
                          <circle cx='80' cy='80' r='70' stroke='url(#greenGradient)' strokeWidth='12' fill='none'
                            strokeDasharray={`${(completedPercent / 100) * 439.82} 439.82`}
                            strokeLinecap='round' />
                          <circle cx='80' cy='80' r='70' stroke='url(#yellowGradient)' strokeWidth='12' fill='none'
                            strokeDasharray={`${(pendingPercent / 100) * 439.82} 439.82`}
                            strokeDashoffset={`-${(completedPercent / 100) * 439.82}`}
                            strokeLinecap='round' />
                          <circle cx='80' cy='80' r='70' stroke='url(#redGradient)' strokeWidth='12' fill='none'
                            strokeDasharray={`${(cancelledPercent / 100) * 439.82} 439.82`}
                            strokeDashoffset={`-${((completedPercent + pendingPercent) / 100) * 439.82}`}
                            strokeLinecap='round' />
                          <defs>
                            <linearGradient id='greenGradient' x1='0%' y1='0%' x2='100%' y2='100%'>
                              <stop offset='0%' stopColor='#10b981' />
                              <stop offset='100%' stopColor='#059669' />
                            </linearGradient>
                            <linearGradient id='yellowGradient' x1='0%' y1='0%' x2='100%' y2='100%'>
                              <stop offset='0%' stopColor='#f59e0b' />
                              <stop offset='100%' stopColor='#d97706' />
                            </linearGradient>
                            <linearGradient id='redGradient' x1='0%' y1='0%' x2='100%' y2='100%'>
                              <stop offset='0%' stopColor='#ef4444' />
                              <stop offset='100%' stopColor='#dc2626' />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className='absolute inset-0 flex items-center justify-center'>
                          <div className='text-center'>
                            <p className='text-3xl font-bold text-gray-900'>{total}</p>
                            <p className='text-xs text-gray-600'>Total</p>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>
                <div className='mt-6 space-y-3'>
                  <div className='flex items-center justify-between text-sm'>
                    <div className='flex items-center gap-2'>
                      <div className='w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 shadow-sm'></div>
                      <span className='text-gray-700 font-medium'>Completed</span>
                    </div>
                    <span className='font-bold text-gray-900'>
                      {appointments.filter(a => a.isCompleted && !a.cancelled).length}
                    </span>
                  </div>
                  <div className='flex items-center justify-between text-sm'>
                    <div className='flex items-center gap-2'>
                      <div className='w-3 h-3 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-sm'></div>
                      <span className='text-gray-700 font-medium'>Pending</span>
                    </div>
                    <span className='font-bold text-gray-900'>
                      {appointments.filter(a => !a.isCompleted && !a.cancelled).length}
                    </span>
                  </div>
                  <div className='flex items-center justify-between text-sm'>
                    <div className='flex items-center gap-2'>
                      <div className='w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-red-600 shadow-sm'></div>
                      <span className='text-gray-700 font-medium'>Cancelled</span>
                    </div>
                    <span className='font-bold text-gray-900'>
                      {appointments.filter(a => a.cancelled).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Patient Statistics */}
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
              <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300'>
                <div className='flex items-center gap-4 mb-4'>
                  <div className='w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg'>
                    <svg className='w-7 h-7 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                    </svg>
                  </div>
                  <div className='flex-1'>
                    <p className='text-sm text-gray-600 font-medium mb-1'>Total Patients</p>
                    <p className='text-3xl font-bold text-gray-900'>
                      {dashData.patients || 0}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-2 text-sm text-gray-500'>
                  <svg className='w-4 h-4 text-emerald-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                  <span>All time statistics</span>
                </div>
              </div>

              <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300'>
                <div className='flex items-center gap-4 mb-4'>
                  <div className='w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg'>
                    <svg className='w-7 h-7 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' />
                    </svg>
                  </div>
                  <div className='flex-1'>
                    <p className='text-sm text-gray-600 font-medium mb-1'>New Patients</p>
                    <p className='text-3xl font-bold text-gray-900'>
                      {appointments.filter(a => a.userData?.firstVisit).length || 0}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-2 text-sm text-green-600 font-medium'>
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' />
                  </svg>
                  <span>+15% this month</span>
                </div>
              </div>

              <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300'>
                <div className='flex items-center gap-4 mb-4'>
                  <div className='w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg'>
                    <svg className='w-7 h-7 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' />
                    </svg>
                  </div>
                  <div className='flex-1'>
                    <p className='text-sm text-gray-600 font-medium mb-1'>Returning</p>
                    <p className='text-3xl font-bold text-gray-900'>
                      {appointments.filter(a => !a.userData?.firstVisit).length || 0}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-2 text-sm text-emerald-600 font-medium'>
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                  <span>Stable growth</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className='w-full xl:w-96 space-y-6'>
            {/* Mini Calendar Card */}
            <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-100'>
              <div className='flex items-center justify-between mb-4'>
                <div>
                  <h3 className='text-lg font-semibold text-gray-900 mb-1'>Calendar</h3>
                  <p className='text-sm text-gray-600'>{monthNames[new Date().getMonth()]} {new Date().getFullYear()}</p>
                </div>
                <button
                  onClick={() => navigate('/doctor-calendar')}
                  className='text-sm font-medium text-[#006838] hover:text-[#004d2a] transition-colors flex items-center gap-1'
                >
                  View Full
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                  </svg>
                </button>
              </div>
              <div className='grid grid-cols-7 gap-1 mb-2'>
                {dayNames.map(day => (
                  <div key={day} className='text-xs text-center text-gray-500 font-medium py-2'>
                    {day}
                  </div>
                ))}
              </div>
              <div className='grid grid-cols-7 gap-1'>
                {getDaysInMonth(new Date()).map((date, index) => {
                  const dayAppointments = date ? getAppointmentsForDate(date) : []
                  const isToday = date && new Date().toDateString() === date.toDateString()

                  return (
                    <div
                      key={index}
                      onClick={() => date && navigate('/doctor-calendar')}
                      className={`aspect-square flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all duration-200 text-xs relative ${isToday
                        ? 'bg-[#006838] text-white font-semibold shadow-lg'
                        : date
                          ? 'text-gray-700 hover:bg-gray-100 hover:shadow-md'
                          : 'text-transparent'
                        }`}
                    >
                      {date && (
                        <>
                          <div className='text-sm font-medium'>{date.getDate()}</div>
                          {dayAppointments.length > 0 && (
                            <div className='flex justify-center gap-0.5 mt-1'>
                              {dayAppointments.slice(0, 3).map((apt, i) => (
                                <div
                                  key={i}
                                  className={`w-1.5 h-1.5 rounded-full ${isToday ? 'bg-white' : getStatusColor(apt.cancelled ? 'Cancelled' : apt.isCompleted ? 'Completed' : 'Pending')}`}
                                />
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
              <div className='mt-4 pt-4 border-t border-gray-100'>
                <div className='flex items-center justify-between text-xs'>
                  <div className='flex items-center gap-2'>
                    <div className='w-2 h-2 rounded-full bg-green-500'></div>
                    <span className='text-gray-600'>Approved</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='w-2 h-2 rounded-full bg-yellow-500'></div>
                    <span className='text-gray-600'>Pending</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='w-2 h-2 rounded-full bg-red-500'></div>
                    <span className='text-gray-600'>Cancelled</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Appointments Card */}
            <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-100'>
              <div className='flex items-center justify-between mb-4'>
                <div>
                  <h3 className='text-lg font-semibold text-gray-900 mb-1'>Recent Appointments</h3>
                  <p className='text-sm text-gray-600'>Latest patient visits</p>
                </div>
                <div className='w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center'>
                  <svg className='w-5 h-5 text-emerald-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                </div>
              </div>
              <div className='space-y-3'>
                {dashData.latestAppointments?.slice(0, 3).map((item, index) => (
                  <div key={index} className='flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-gray-100'>
                    <div className='w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-md'>
                      <svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                      </svg>
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-semibold text-gray-900 truncate'>{item.userData?.name || 'Patient'}</p>
                      <p className='text-xs text-gray-600 truncate'>{slotDateFormat(item.slotDate)}</p>
                    </div>
                    {item.cancelled ? (
                      <span className='px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full'>Cancelled</span>
                    ) : item.isCompleted ? (
                      <span className='px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full'>Completed</span>
                    ) : (
                      <span className='px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full'>Pending</span>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => navigate('/doctor-appointments')}
                  className='w-full text-center text-sm font-medium text-[#006838] hover:text-[#004d2a] transition-colors py-2 rounded-xl hover:bg-emerald-50'
                >
                  View All Appointments
                </button>
              </div>
            </div>

            {/* Earnings Card */}
            <div className='bg-[#006838] rounded-2xl p-6 shadow-xl text-white relative overflow-hidden'>
              <div className='absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl'></div>
              <div className='relative z-10'>
                <div className='flex items-center justify-between mb-4'>
                  <div>
                    <h3 className='text-lg font-semibold mb-1'>Total Earnings</h3>
                    <p className='text-sm text-white/80'>Your current balance</p>
                  </div>
                  <div className='w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm'>
                    <svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' />
                    </svg>
                  </div>
                </div>
                <div className='mb-4'>
                  <p className='text-3xl font-bold mb-1'>{currency} {dashData.earnings || 0}</p>
                  <div className='flex items-center gap-2 text-sm text-white/80'>
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' />
                    </svg>
                    <span>+23% from last month</span>
                  </div>
                </div>
                <button className='w-full bg-white/20 backdrop-blur-sm text-white py-3 rounded-xl font-medium hover:bg-white/30 transition-all duration-200 border border-white/30'>
                  View Detailed Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboard
