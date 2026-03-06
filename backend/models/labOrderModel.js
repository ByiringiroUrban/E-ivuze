import mongoose from "mongoose";

const labOrderSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    docId: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor', required: true },

    // Link to a specific Lab Entity (Diagnostic Center)
    labId: { type: mongoose.Schema.Types.ObjectId, ref: 'lab', default: null },

    appointmentId: { type: String, default: null },
    testName: { type: String, required: true },
    testCategory: { type: String, enum: ['Hematology', 'Biochemistry', 'Microbiology', 'Radiology', 'Pathology', 'Other'], default: 'Other' },
    sampleType: { type: String, default: 'Blood' },
    priority: { type: String, enum: ['ROUTINE', 'URGENT', 'EMERGENCY'], default: 'ROUTINE' },

    status: { type: String, enum: ['PENDING', 'ACCEPTED', 'SAMPLED', 'COMPLETED', 'CANCELLED', 'REJECTED'], default: 'PENDING' },

    // Results
    result: { type: String, default: null }, // Text summary
    resultFileUrl: { type: String, default: null }, // URL to uploaded PDF/Image report
    resultDate: { type: Date, default: null },

    // Financials
    price: { type: Number, default: 0 },
    isPaid: { type: Boolean, default: false },

    notifiedPatient: { type: Boolean, default: false },
    notes: { type: String, default: '' },
    orderedAt: { type: Date, default: Date.now }
});

const labOrderModel = mongoose.models.labOrder || mongoose.model("labOrder", labOrderSchema);

export default labOrderModel;
