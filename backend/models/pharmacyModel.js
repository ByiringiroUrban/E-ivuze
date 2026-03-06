import mongoose from "mongoose";

const pharmacySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: {
    line1: { type: String, required: true },
    line2: { type: String, default: '' },
    city: { type: String, required: true },
    country: { type: String, default: 'Rwanda' }
  },
  licenseNumber: { type: String, required: true, unique: true },
  verified: { type: Boolean, default: false },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  approvedAt: { type: Date, default: null },
  approvedByAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'admin', default: null },
  rejectedAt: { type: Date, default: null },
  rejectedByAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'admin', default: null },
  rejectionReason: { type: String, default: '' },
  adminNotes: { type: String, default: '' },
  deliveryZones: [{
    zoneName: { type: String, required: true },
    fee: { type: Number, required: true },
    eta: { type: Number, required: true } // Expected delivery time in hours
  }],
  settings: {
    can_impersonate: { type: Boolean, default: false },
    auto_verify_orders: { type: Boolean, default: false }
  },
  createdByAdminId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'admin',
    required: false 
  },
  invitationToken: { type: String, default: null },
  invitationTokenExpiry: { type: Date, default: null },
  invitationAccepted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const pharmacyModel = mongoose.models.pharmacy || mongoose.model('pharmacy', pharmacySchema);

export default pharmacyModel;

