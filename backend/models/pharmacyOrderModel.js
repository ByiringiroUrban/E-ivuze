import mongoose from "mongoose";

const pharmacyOrderSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
    index: true
  },
  pharmacyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'pharmacy',
    required: true,
    index: true
  },
  items: [{
    medicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'medication',
      required: false
    },
    name: { type: String, required: true }, // Added name for text-based orders
    qty: { type: Number, required: true },
    price: { type: Number, required: true },
    dosage: { type: String, default: '' },
    frequency: { type: String, default: '' },
    duration: { type: String, default: '' },
    batchNumber: { type: String, default: null }
  }],
  total: { type: Number, required: true },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  prescriptionImageUrl: { type: String, default: null },
  prescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'prescription',
    default: null
  },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending',
    index: true
  },
  courier: {
    name: { type: String, default: null },
    phone: { type: String, default: null },
    trackingId: { type: String, default: null }
  },
  deliveryAddress: {
    line1: { type: String, required: true },
    line2: { type: String, default: '' },
    city: { type: String, required: true },
    country: { type: String, default: 'Rwanda' }
  },
  messages: [{
    sender: {
      type: String,
      enum: ['patient', 'pharmacy'],
      required: true
    },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  audit: [{
    action: { type: String, required: true },
    byUserId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'audit.byUserModel',
      required: true
    },
    byUserModel: {
      type: String,
      enum: ['pharmacyuser', 'user', 'admin'],
      required: true
    },
    timestamp: { type: Date, default: Date.now },
    note: { type: String, default: '' }
  }],
  verifiedAt: { type: Date, default: null },
  shippedAt: { type: Date, default: null },
  deliveredAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { minimize: false });

const pharmacyOrderModel = mongoose.models.pharmacyorder || mongoose.model('pharmacyorder', pharmacyOrderSchema);

export default pharmacyOrderModel;

