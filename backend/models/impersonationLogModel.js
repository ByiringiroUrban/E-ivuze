import mongoose from "mongoose";

const impersonationLogSchema = new mongoose.Schema({
  impersonatorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'pharmacyuser', 
    required: true,
    index: true
  },
  impersonatedUserId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    index: true
  },
  impersonatedUserType: {
    type: String,
    enum: ['user', 'doctor', 'hospital'],
    required: true
  },
  startAt: { type: Date, required: true, default: Date.now },
  endAt: { type: Date, default: null },
  ip: { type: String, default: null },
  actions: [{
    route: { type: String, required: true },
    method: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  actionsSummary: { type: String, default: '' }
}, { minimize: false });

const impersonationLogModel = mongoose.models.impersonationlog || mongoose.model('impersonationlog', impersonationLogSchema);

export default impersonationLogModel;

