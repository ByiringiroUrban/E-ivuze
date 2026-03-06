import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    appointmentId: { type: String, required: true },
    userId: { type: String, required: true },
    docId: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentCode: { type: String, required: true }, // *182*1*1*XXXXXXXXX#
    paymentProof: { type: String, default: null }, // Screenshot URL
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'pending' 
    },
    adminNotes: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    approvedAt: { type: Date, default: null },
    rejectedAt: { type: Date, default: null }
});

const paymentModel = mongoose.models.payment || mongoose.model('payment', paymentSchema);

export default paymentModel;







