import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
    action: { type: String, required: true }, // e.g., 'UPDATE_PROFILE', 'VIEW_RECORD'
    actorId: { type: String, required: true }, // User ID who performed the action
    actorType: { type: String, enum: ['USER', 'DOCTOR', 'ADMIN'], required: true },
    targetId: { type: String, required: true }, // ID of the entity being acted upon (User ID, Appointment ID)
    targetType: { type: String, required: true }, // 'USER', 'APPOINTMENT'
    changes: { type: Object, default: {} }, // Snapshot of changes if applicable
    timestamp: { type: Date, default: Date.now },
    ipAddress: { type: String },
    userAgent: { type: String }
});

const auditLogModel = mongoose.models.auditLog || mongoose.model("auditLog", auditLogSchema);

export default auditLogModel;
