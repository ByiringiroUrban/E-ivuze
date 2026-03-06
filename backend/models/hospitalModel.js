import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  address: { 
    line1: { type: String, required: true },
    line2: { type: String, default: '' },
    city: { type: String, required: true },
    country: { type: String, default: 'Rwanda' }
  },
  phone: { type: String, required: true },
  website: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'REJECTED'], 
    default: 'PENDING' 
  },
  adminUser: { type: mongoose.Schema.Types.ObjectId, ref: 'hospitaluser', required: false },
  rejectionReason: { type: String, default: null },
  approvedAt: { type: Date, default: null },
  rejectedAt: { type: Date, default: null },
  subscriptionPlan: { 
    type: String, 
    enum: ['basic', 'premium', 'enterprise'], 
    default: null 
  },
  subscriptionExpiresAt: { type: Date, default: null },
  trialEndsAt: { type: Date, default: null }, // 3 months from approval
  trialPeriodActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const hospitalModel = mongoose.models.hospital || mongoose.model('hospital', hospitalSchema);

export default hospitalModel;

