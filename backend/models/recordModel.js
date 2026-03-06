import mongoose from "mongoose";

const recordSchema = new mongoose.Schema({
    appointmentId: { type: String, required: true },
    userId: { type: String, required: true },
    docId: { type: String, required: true },
    recordType: { 
        type: String, 
        enum: ['consultation', 'prescription', 'lab_result', 'diagnosis', 'other'],
        default: 'consultation'
    },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    attachments: [{ type: String, default: [] }], // URLs to files
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const recordModel = mongoose.models.record || mongoose.model('record', recordSchema);

export default recordModel;







