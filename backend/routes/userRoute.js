import express from 'express'
import { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, changePassword, googleLogin, googleRegisterUser, submitLabOrder, completeOnboarding } from '../controllers/userController.js'
import { generateVideoToken, endVideoCall, serveVideoCallPage } from '../controllers/videoCallController.js'
import { createPaymentRequest, uploadPaymentProof, getUserPayments } from '../controllers/paymentController.js'
import { getPrescriptionByAppointment, getUserPrescriptions, submitPrescriptionToPharmacy } from '../controllers/prescriptionController.js'
import { getRecordsByAppointment, getUserRecords } from '../controllers/recordController.js'
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, getUnreadCount, deleteNotification } from '../controllers/notificationController.js'
import { createOrderFromPatient, addOrderMessageFromPatient, getPatientOrder } from '../controllers/pharmacyOrdersController.js'
import authUser from '../middleware/authUser.js'
import onboardingGuard from '../middleware/onboardingGuard.js'
import upload from '../middleware/multer.js'

const userRouter = express.Router()

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.post('/google-login', googleLogin)
userRouter.post('/google-register', googleRegisterUser)

userRouter.get('/get-profile', authUser, getProfile)
userRouter.post('/update-profile', upload.single('image'), authUser, onboardingGuard, updateProfile)
userRouter.post('/complete-onboarding', authUser, completeOnboarding)
userRouter.post('/change-password', authUser, changePassword)
userRouter.post('/book-appointment', authUser, onboardingGuard, bookAppointment)
userRouter.get('/appointments', authUser, onboardingGuard, listAppointment)
userRouter.post('/cancel-appointment', authUser, onboardingGuard, cancelAppointment)
userRouter.post('/video-call/token', authUser, onboardingGuard, generateVideoToken)
userRouter.post('/video-call/end', authUser, onboardingGuard, endVideoCall)

// Payment routes
userRouter.post('/payment/create', authUser, onboardingGuard, createPaymentRequest)
userRouter.post('/payment/upload-proof', upload.single('paymentProof'), authUser, onboardingGuard, uploadPaymentProof)
userRouter.get('/payments', authUser, onboardingGuard, getUserPayments)

// Prescription routes
userRouter.post('/prescription/get', authUser, onboardingGuard, getPrescriptionByAppointment)
userRouter.get('/prescriptions', authUser, onboardingGuard, getUserPrescriptions)
userRouter.post('/prescription/submit-to-pharmacy', authUser, onboardingGuard, submitPrescriptionToPharmacy)

// Pharmacy order routes (patient)
userRouter.post('/pharmacy/order', authUser, onboardingGuard, upload.single('prescriptionImage'), createOrderFromPatient)
userRouter.post('/pharmacy/order/:id/message', authUser, onboardingGuard, addOrderMessageFromPatient)
userRouter.get('/pharmacy/order/:id', authUser, onboardingGuard, getPatientOrder)

// Record routes
userRouter.post('/records/get', authUser, onboardingGuard, getRecordsByAppointment)
userRouter.get('/records', authUser, onboardingGuard, getUserRecords)

// Notification routes
userRouter.get('/notifications', authUser, onboardingGuard, getUserNotifications)
userRouter.post('/notification/read', authUser, onboardingGuard, markNotificationAsRead)
userRouter.post('/notifications/read-all', authUser, onboardingGuard, markAllNotificationsAsRead)
userRouter.get('/notifications/unread-count', authUser, onboardingGuard, getUnreadCount)
userRouter.post('/notification/delete', authUser, onboardingGuard, deleteNotification)

// Lab Order Routes
userRouter.post('/lab-order/submit', authUser, onboardingGuard, submitLabOrder)

export default userRouter