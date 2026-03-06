import mongoose from "mongoose";

const hospitalPaymentSchema = new mongoose.Schema({
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'hospital', required: true },
    planType: { 
        type: String, 
        enum: ['basic', 'premium', 'enterprise'], 
        required: true 
    },
    billingPeriod: {
        type: String,
        enum: ['monthly', 'yearly'],
        required: true
    },
    amount: { type: Number, required: true },
    paymentCode: { type: String, required: true },
    paymentProof: { type: String, default: null },
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'pending' 
    },
    adminNotes: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    approvedAt: { type: Date, default: null },
    rejectedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null } // Subscription expiry date
});

const hospitalPaymentModel = mongoose.models.hospitalpayment || mongoose.model('hospitalpayment', hospitalPaymentSchema);

export default hospitalPaymentModel;

