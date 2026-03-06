import express from 'express'
import { addDoctor, allDoctors, updateDoctor, deleteDoctor, loginAdmin, appointmentsAdmin, appointmentCancel, adminDashboard, getSettings, updateSettings, getPendingHospitals, getAllHospitals, approveHospital, rejectHospital, updateHospitalTrialPeriod, getAppointmentRequests, updateAppointmentRequestStatus, getContactMessages, updateContactMessageStatus, getNewsletterSubscribers, getAllUserEmails, sendPromotionalEmail, createAnnouncement, getAllAnnouncements, getActiveAnnouncements, updateAnnouncement, deleteAnnouncement, getAllUsers, createUserAdmin, updateUserAdmin, deleteUserAdmin, exportUsersCsvAdmin, importUsersCsvAdmin, getDoctorApprovals, approveDoctor, rejectDoctor, updateDoctorApproval, deleteDoctorApproval } from '../controllers/adminController.js'
import { getAllPendingPayments, getAllPayments, getPaymentById, createPayment, updatePayment, deletePayment, approvePayment, rejectPayment } from '../controllers/paymentController.js'
import { getAllPendingHospitalPayments, approveHospitalPayment, rejectHospitalPayment } from '../controllers/hospitalPaymentController.js'
import { createPharmacy, getAllPharmacies, getPharmacy, updatePharmacy, resendInvitation, approvePharmacy, rejectPharmacy } from '../controllers/pharmacyAdminController.js'
import { registerHospitalByAdmin } from '../controllers/hospitalController.js'
import upload from '../middleware/multer.js'
import authAdmin from '../middleware/authAdmin.js';
import { changeAvailbility } from '../controllers/doctorController.js';
import multer from 'multer';

const adminRouter = express.Router();

const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

adminRouter.post('/add-doctor',authAdmin,upload.single('image'),addDoctor);
adminRouter.put('/doctors/:doctorId',authAdmin,upload.single('image'),updateDoctor);
adminRouter.delete('/doctors/:doctorId',authAdmin,deleteDoctor);
adminRouter.post('/login',loginAdmin);
adminRouter.post('/all-doctor',authAdmin,allDoctors);
adminRouter.post('/change-availbility',authAdmin,changeAvailbility);
adminRouter.get('/appointments',authAdmin,appointmentsAdmin)
adminRouter.get('/users',authAdmin,getAllUsers)
adminRouter.get('/users/export.csv',authAdmin,exportUsersCsvAdmin)
adminRouter.post('/users/import.csv',authAdmin,csvUpload.single('file'),importUsersCsvAdmin)
adminRouter.post('/users',authAdmin,createUserAdmin)
adminRouter.put('/users/:userId',authAdmin,updateUserAdmin)
adminRouter.delete('/users/:userId',authAdmin,deleteUserAdmin)
adminRouter.post('/cancel-appointment',authAdmin,appointmentCancel)
adminRouter.get('/dashboard',authAdmin,adminDashboard)

// Payment approval routes (Patient payments)
adminRouter.get('/payments/pending',authAdmin,getAllPendingPayments)
adminRouter.get('/payments',authAdmin,getAllPayments)
adminRouter.get('/payments/:paymentId',authAdmin,getPaymentById)
adminRouter.post('/payments',authAdmin,createPayment)
adminRouter.put('/payments/:paymentId',authAdmin,updatePayment)
adminRouter.delete('/payments/:paymentId',authAdmin,deletePayment)
adminRouter.post('/payment/approve',authAdmin,approvePayment)
adminRouter.post('/payment/reject',authAdmin,rejectPayment)

// Hospital payment approval routes
adminRouter.get('/payments/hospital/pending',authAdmin,getAllPendingHospitalPayments)
adminRouter.post('/payment/hospital/approve',authAdmin,approveHospitalPayment)
adminRouter.post('/payment/hospital/reject',authAdmin,rejectHospitalPayment)

// Settings routes
adminRouter.get('/settings',authAdmin,getSettings)
adminRouter.post('/settings',authAdmin,updateSettings)

// Hospital management routes
adminRouter.post('/hospitals/register',authAdmin,registerHospitalByAdmin)
adminRouter.get('/hospitals/pending',authAdmin,getPendingHospitals)
adminRouter.get('/hospitals',authAdmin,getAllHospitals)
adminRouter.post('/hospitals/:hospitalId/approve',authAdmin,approveHospital)
adminRouter.post('/hospitals/:hospitalId/reject',authAdmin,rejectHospital)
adminRouter.post('/hospital-trials/update',authAdmin,updateHospitalTrialPeriod)

// Pharmacy management routes
adminRouter.post('/pharmacies',authAdmin,createPharmacy)
adminRouter.get('/pharmacies',authAdmin,getAllPharmacies)
adminRouter.get('/pharmacies/:id',authAdmin,getPharmacy)
adminRouter.put('/pharmacies/:id',authAdmin,updatePharmacy)
adminRouter.post('/pharmacies/:id/resend-invitation',authAdmin,resendInvitation)
adminRouter.post('/pharmacies/:id/approve',authAdmin,approvePharmacy)
adminRouter.post('/pharmacies/:id/reject',authAdmin,rejectPharmacy)

// Lead management routes
adminRouter.get('/leads/appointments',authAdmin,getAppointmentRequests)
adminRouter.post('/leads/appointments/:requestId/status',authAdmin,updateAppointmentRequestStatus)
adminRouter.get('/leads/contacts',authAdmin,getContactMessages)
adminRouter.post('/leads/contacts/:contactId/status',authAdmin,updateContactMessageStatus)
adminRouter.get('/leads/newsletter',authAdmin,getNewsletterSubscribers)
adminRouter.get('/emails/users',authAdmin,getAllUserEmails)
adminRouter.post('/emails/send-promotional',authAdmin,sendPromotionalEmail)

// Announcement routes
adminRouter.post('/announcements',authAdmin,createAnnouncement)
adminRouter.get('/announcements',authAdmin,getAllAnnouncements)
adminRouter.put('/announcements/:id',authAdmin,updateAnnouncement)
adminRouter.delete('/announcements/:id',authAdmin,deleteAnnouncement)

// Doctor approval routes
adminRouter.get('/doctor-approvals',authAdmin,getDoctorApprovals)
adminRouter.post('/doctor-approvals/:id/approve',authAdmin,approveDoctor)
adminRouter.post('/doctor-approvals/:id/reject',authAdmin,rejectDoctor)
adminRouter.put('/doctor-approvals/:id',authAdmin,upload.single('image'),updateDoctorApproval)
adminRouter.delete('/doctor-approvals/:id',authAdmin,deleteDoctorApproval)

export default adminRouter;