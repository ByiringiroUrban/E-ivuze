import express from 'express';
import {
  acceptInvitation,
  loginPharmacy,
  getDashboard,
  getProfile,
  updateProfile,
  startImpersonation,
  stopImpersonation,
  listApprovedPharmacies
} from '../controllers/pharmacyController.js';
import {
  createMedication,
  getMedications,
  getMedication,
  updateMedication,
  deleteMedication,
  bulkUploadMedications,
  getMedicationsPublic,
  searchMedicationsPublic
} from '../controllers/pharmacyInventoryController.js';
import {
  getOrders,
  getOrder,
  updateOrderStatus,
  addOrderMessage,
  getReports
} from '../controllers/pharmacyOrdersController.js';
import authPharmacy from '../middleware/authPharmacy.js';

const pharmacyRouter = express.Router();

// Public routes
pharmacyRouter.post('/invite/accept', acceptInvitation);
pharmacyRouter.post('/login', loginPharmacy);
pharmacyRouter.get('/public/approved', listApprovedPharmacies);
pharmacyRouter.get('/public/:pharmacyId/medications', getMedicationsPublic);
pharmacyRouter.get('/public/medications', searchMedicationsPublic);

// Protected routes (require pharmacy authentication)
pharmacyRouter.get('/dashboard', authPharmacy, getDashboard);
pharmacyRouter.get('/profile', authPharmacy, getProfile);
pharmacyRouter.put('/profile', authPharmacy, updateProfile);

// Inventory routes
pharmacyRouter.post('/medications', authPharmacy, createMedication);
pharmacyRouter.get('/medications', authPharmacy, getMedications);
pharmacyRouter.get('/medications/:id', authPharmacy, getMedication);
pharmacyRouter.put('/medications/:id', authPharmacy, updateMedication);
pharmacyRouter.delete('/medications/:id', authPharmacy, deleteMedication);
pharmacyRouter.post('/medications/bulk-upload', authPharmacy, bulkUploadMedications);

// Orders routes
pharmacyRouter.get('/orders', authPharmacy, getOrders);
pharmacyRouter.get('/orders/:id', authPharmacy, getOrder);
pharmacyRouter.put('/orders/:id/status', authPharmacy, updateOrderStatus);
pharmacyRouter.post('/orders/:id/messages', authPharmacy, addOrderMessage);

// Reports routes
pharmacyRouter.get('/reports', authPharmacy, getReports);

// Impersonation routes
pharmacyRouter.post('/impersonate', authPharmacy, startImpersonation);
pharmacyRouter.post('/impersonate/stop', authPharmacy, stopImpersonation);

export default pharmacyRouter;

