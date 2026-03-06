import mongoose from "mongoose";

const doctorAuditLogSchema = new mongoose.Schema({
  admin_id: { 
    type: String, // Admin email (since admin is not a model)
    required: true 
  },
  doctor_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'doctor', 
    required: true 
  },
  action: { 
    type: String, 
    enum: ['approve', 'reject', 'update', 'delete'],
    required: true 
  },
  metadata: { 
    type: Object, 
    default: {} // Store additional info like rejection_reason, update fields, etc.
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

const doctorAuditLogModel = mongoose.models.doctorauditlog || mongoose.model('doctorauditlog', doctorAuditLogSchema);

export default doctorAuditLogModel;
