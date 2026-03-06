import express from 'express'
import { appointmentsDoctor, doctorList, registerDoctor, loginDoctor, appointmentComplete, appointmentCancel, approveAppointment, rejectAppointment, doctorDashboard, doctorProfile, updateDoctorProfile, getDoctorPatients, addPatient, changePassword, googleLoginDoctor, googleRegisterDoctor } from '../controllers/doctorController.js'
import { generateVideoToken, endVideoCall, serveVideoCallPage } from '../controllers/videoCallController.js'
import { createPrescription, getPrescriptionByAppointment, getDoctorPrescriptions } from '../controllers/prescriptionController.js'
import { createRecord, getRecordsByAppointment, getDoctorRecords, getPatientRecords, updateRecord, deleteRecord } from '../controllers/recordController.js'
import { getDoctorNotifications, markDoctorNotificationAsRead, markAllDoctorNotificationsAsRead, getDoctorUnreadCount, deleteDoctorNotification } from '../controllers/notificationController.js'
import authDoctor from '../middleware/authDoctor.js'
import upload from '../middleware/multer.js'

const doctorRouter = express.Router()

doctorRouter.get('/list',doctorList)
doctorRouter.post('/register', upload.single('image'), registerDoctor)
doctorRouter.post('/login',loginDoctor)
doctorRouter.post('/google-login', googleLoginDoctor)
doctorRouter.post('/google-register', upload.single('image'), googleRegisterDoctor)
doctorRouter.get('/appointments',authDoctor,appointmentsDoctor)
doctorRouter.post('/approve-appointment',authDoctor,approveAppointment)
doctorRouter.post('/reject-appointment',authDoctor,rejectAppointment)
doctorRouter.post('/complete-appointment',authDoctor,appointmentComplete)
doctorRouter.post('/cancel-appointment',authDoctor,appointmentCancel)
doctorRouter.get('/dashboard',authDoctor,doctorDashboard)
doctorRouter.get('/profile',authDoctor,doctorProfile)
doctorRouter.post('/update-profile',upload.single('image'),authDoctor,updateDoctorProfile)
doctorRouter.post('/change-password',authDoctor,changePassword)
doctorRouter.post('/video-call/token', (req, res, next) => {
    console.log('🟢 DOCTOR VIDEO CALL TOKEN ROUTE HIT');
    console.log('Path:', req.path);
    console.log('Method:', req.method);
    next();
}, authDoctor, generateVideoToken)

doctorRouter.post('/video-call/end', (req, res, next) => {
    console.log('🟢 DOCTOR VIDEO CALL END ROUTE HIT');
    console.log('Path:', req.path);
    console.log('Method:', req.method);
    next();
}, authDoctor, endVideoCall)

// Serve video call HTML page (public route for browser access)
doctorRouter.get('/video-call/page', serveVideoCallPage)

// Prescription routes
doctorRouter.post('/prescription/create', authDoctor, upload.single('prescriptionFile'), createPrescription)
doctorRouter.post('/prescription/get', authDoctor, getPrescriptionByAppointment)
doctorRouter.get('/prescriptions', authDoctor, getDoctorPrescriptions)

// Record routes
doctorRouter.post('/record/create', upload.array('attachments', 5), authDoctor, createRecord)
doctorRouter.post('/records/get', authDoctor, getRecordsByAppointment)
doctorRouter.get('/records', authDoctor, getDoctorRecords)
doctorRouter.post('/patient/records', authDoctor, getPatientRecords)
doctorRouter.post('/record/update', authDoctor, updateRecord)
doctorRouter.post('/record/delete', authDoctor, deleteRecord)

// Patient management routes
doctorRouter.get('/patients', authDoctor, getDoctorPatients)
doctorRouter.post('/add-patient', authDoctor, addPatient)

// Notification routes
doctorRouter.get('/notifications', authDoctor, getDoctorNotifications)
doctorRouter.post('/notification/read', authDoctor, markDoctorNotificationAsRead)
doctorRouter.post('/notifications/read-all', authDoctor, markAllDoctorNotificationsAsRead)
doctorRouter.get('/notifications/unread-count', authDoctor, getDoctorUnreadCount)
doctorRouter.post('/notification/delete', authDoctor, deleteDoctorNotification)

export default doctorRouter
