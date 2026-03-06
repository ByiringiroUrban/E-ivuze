import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { DoctorContext } from '../context/DoctorContext'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import { LoadingComponents } from './LoadingComponents'

const DoctorApprovalGuard = ({ children }) => {
  const { dToken, backendUrl } = useContext(DoctorContext)
  const { pageLoading } = useContext(AppContext)
  const [isApproved, setIsApproved] = useState(null) // null = checking, true = approved, false = not approved
  const [doctorStatus, setDoctorStatus] = useState(null)
  const navigate = useNavigate()
  const { t } = useTranslation()

  useEffect(() => {
    const checkApprovalStatus = async () => {
      if (!dToken) {
        setIsApproved(false)
        return
      }

      try {
        const { data } = await axios.get(
          backendUrl + '/api/doctor/profile',
          { headers: { dToken } }
        )

        if (data.success && data.profileData) {
          const status = data.profileData.status
          setDoctorStatus(status)

          if (status === 'approved') {
            setIsApproved(true)
          } else {
            setIsApproved(false)
            // Show appropriate message based on status
            if (status === 'pending') {
              toast.info(
                t('doctor_registration.pending_message') ||
                'Your account is pending approval. Please wait for admin approval to access all features.',
                { autoClose: 5000 }
              )
            } else if (status === 'rejected') {
              const reason = data.profileData.rejection_reason
                ? ` Reason: ${data.profileData.rejection_reason}`
                : ''
              toast.error(
                (t('doctor_registration.rejected_message') ||
                  `Your account has been rejected.${reason}`),
                { autoClose: 7000 }
              )
            }
          }
        } else {
          setIsApproved(false)
        }
      } catch (error) {
        console.error('Error checking doctor approval status:', error)
        // If the error is due to not being approved, the middleware will handle it
        if (error.response?.data?.message) {
          const message = error.response.data.message
          if (message.includes('pending') || message.includes('approval')) {
            setIsApproved(false)
            setDoctorStatus('pending')
            toast.info(message, { autoClose: 5000 })
          } else if (message.includes('rejected')) {
            setIsApproved(false)
            setDoctorStatus('rejected')
            toast.error(message, { autoClose: 7000 })
          } else {
            setIsApproved(false)
          }
        } else {
          setIsApproved(false)
        }
      }
    }

    checkApprovalStatus()
  }, [dToken, backendUrl, t])

  // Show loading while checking
  if (isApproved === null || pageLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gray-50'>
        <div className='text-center'>
          <div className='text-center'>
            <LoadingComponents.PageLoader />
          </div>
        </div>
      </div>
    )
  }

  // If not approved, show message but still allow access to dashboard
  // The backend middleware will block API calls anyway
  if (!isApproved && doctorStatus === 'pending') {
    return (
      <div className='min-h-screen bg-gray-50'>
        <div className='bg-yellow-50 border-l-4 border-yellow-400 p-4 m-4 rounded'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              <svg className='h-5 w-5 text-yellow-400' viewBox='0 0 20 20' fill='currentColor'>
                <path fillRule='evenodd' d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z' clipRule='evenodd' />
              </svg>
            </div>
            <div className='ml-3'>
              <p className='text-sm text-yellow-700'>
                <strong>Account Pending Approval</strong>
              </p>
              <p className='text-sm text-yellow-700 mt-1'>
                Your account is pending approval. Please wait for the admin to approve your account.
                You will be able to access all features once approved.
              </p>
            </div>
          </div>
        </div>
        {children}
      </div>
    )
  }

  if (!isApproved && doctorStatus === 'rejected') {
    return (
      <div className='min-h-screen bg-gray-50'>
        <div className='bg-red-50 border-l-4 border-red-400 p-4 m-4 rounded'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              <svg className='h-5 w-5 text-red-400' viewBox='0 0 20 20' fill='currentColor'>
                <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
              </svg>
            </div>
            <div className='ml-3'>
              <p className='text-sm text-red-700'>
                <strong>Account Rejected</strong>
              </p>
              <p className='text-sm text-red-700 mt-1'>
                Your account has been rejected. Please contact support for more information.
              </p>
            </div>
          </div>
        </div>
        {children}
      </div>
    )
  }

  // Approved - render children normally
  return <>{children}</>
}

export default DoctorApprovalGuard
