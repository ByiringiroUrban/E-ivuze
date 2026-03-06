import express from 'express';
import { addLab, loginLab, googleLoginLab, getAllLabs, getLabOrders, updateLabOrderStatus, uploadLabResult, getProfile, updateProfile } from '../controllers/labController.js';
import authAdmin from '../middleware/authAdmin.js';
import authLab from '../middleware/authLab.js';
import upload from '../middleware/multer.js';

const router = express.Router();

// Admin
router.post('/add', authAdmin, addLab);
router.get('/all', getAllLabs); // Public or Protected? Let's keep public for selection

// Lab Auth
router.post('/login', loginLab);
router.post('/google-login', googleLoginLab);

// Lab Dashboard
router.get('/orders', authLab, getLabOrders);
router.post('/update-status', authLab, updateLabOrderStatus);
router.post('/upload-result', authLab, upload.single('image'), uploadLabResult);
router.get('/profile', authLab, getProfile);
router.post('/update-profile', authLab, upload.single('image'), updateProfile);

export default router;
