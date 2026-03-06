import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema({
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'appointment', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    docId: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor', required: true },
    facilityId: { type: mongoose.Schema.Types.ObjectId, ref: 'hospital', default: null }, // Hospital where issued

    medications: [{
        name: { type: String, required: true },
        dosage: { type: String, required: true }, // e.g. "500mg"
        form: { type: String, default: 'Tablet' }, // e.g. "Tablet", "Capsule", "Syrup"
        frequency: { type: String, required: true }, // e.g. "1-0-1"
        duration: { type: String, required: true }, // e.g. "5 days"
        quantity: { type: Number, default: 1 }, // Total count of units
        instructions: { type: String, default: '' }, // e.g. "Take after meals"
        route: { type: String, default: 'Oral' } // e.g. "Oral", "IV", "Topical"
    }],
    diagnosis: { type: String, default: '' },
    notes: { type: String, default: '' },
    status: {
        type: String,
        enum: ['Active', 'Filled', 'Partially Filled', 'Cancelled', 'Expired'],
        default: 'Active'
    },
    validUntil: { type: Date, default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000) }, // Default 30 days

    fileUrl: { type: String, default: null },
    fileName: { type: String, default: null },
    fileType: { type: String, default: null },
    submittedToPharmacy: { type: Boolean, default: false },
    pharmacyOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'pharmacyorder',
        default: null
    },

    // Auth and Security
    eSignature: { type: String, default: null }, // Record of digital signature
    isEmergency: { type: Boolean, default: false },

    // Safety Checks
    allergyAlertIgnored: { type: Boolean, default: false }, // Was an allergy warning triggered?
    allergyOverrideReason: { type: String, default: null }, // Clinical justification if warning ignored

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const prescriptionModel = mongoose.models.prescription || mongoose.model('prescription', prescriptionSchema);

export default prescriptionModel;







