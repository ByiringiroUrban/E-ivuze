import mongoose from "mongoose";

const transferSchema = new mongoose.Schema({
  fromHospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'hospital',
    required: false,
    default: null
  },
  fromDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'doctor',
    required: true
  },
  toHospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'hospital',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
    default: 'PENDING'
  },
  reason: { type: String, required: true },

  // Clinical Context
  clinicalSummary: { type: String, default: '' }, // Detailed reason and patient condition
  priority: {
    type: String,
    enum: ['Routine', 'Urgent', 'Emergency'],
    default: 'Routine'
  },

  // Feedback Loop (Closing the referral loop)
  referralFeedback: { type: String, default: null }, // Findings from the receiving hospital
  outcome: {
    type: String,
    enum: ['Pending', 'Admitted', 'Treated & Returned', 'Counter-Referred', 'Deceased'],
    default: 'Pending'
  },

  acceptedAt: { type: Date, default: null },
  rejectedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const transferModel = mongoose.models.transfer || mongoose.model('transfer', transferSchema);

export default transferModel;

