import express from 'express';
import {
  registerHospital,
  loginHospital,
  getHospitalDetails,
  getHospitalDoctors,
  createHospitalDoctor,
  updateHospitalDoctor,
  deleteHospitalDoctor,
  getHospitalPatients,
  createTransfer,
  getHospitalTransfers,
  acceptTransfer,
  rejectTransfer,
  getApprovedHospitals,
  hospitalDashboardStats
} from '../controllers/hospitalController.js';
import {
  createHospitalPaymentRequest,
  uploadHospitalPaymentProof,
  getHospitalPayments
} from '../controllers/hospitalPaymentController.js';
import authHospital from '../middleware/authHospital.js';
import upload from '../middleware/multer.js';

const hospitalRouter = express.Router();

// Public routes
hospitalRouter.post('/register', registerHospital);
hospitalRouter.post('/login', loginHospital);
hospitalRouter.get('/approved', getApprovedHospitals); // Public endpoint for transfer target selection

// Protected routes (require hospital authentication)
hospitalRouter.get('/details', authHospital, getHospitalDetails);
hospitalRouter.get('/dashboard', authHospital, hospitalDashboardStats);
hospitalRouter.get('/doctors', authHospital, getHospitalDoctors);
hospitalRouter.post('/doctors', authHospital, upload.single('image'), createHospitalDoctor);
hospitalRouter.put('/doctors/:doctorId', authHospital, upload.single('image'), updateHospitalDoctor);
hospitalRouter.delete('/doctors/:doctorId', authHospital, deleteHospitalDoctor);
hospitalRouter.get('/patients', authHospital, getHospitalPatients);
hospitalRouter.post('/transfers', authHospital, createTransfer);
hospitalRouter.get('/transfers', authHospital, getHospitalTransfers);
hospitalRouter.post('/transfers/:transferId/accept', authHospital, acceptTransfer);
hospitalRouter.post('/transfers/:transferId/reject', authHospital, rejectTransfer);

// Hospital payment routes
hospitalRouter.post('/payment/create', authHospital, createHospitalPaymentRequest);
hospitalRouter.post('/payment/upload-proof', authHospital, upload.single('paymentProof'), uploadHospitalPaymentProof);
hospitalRouter.get('/payments', authHospital, getHospitalPayments);

export default hospitalRouter;
