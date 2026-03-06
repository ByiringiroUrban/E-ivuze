import mongoose from "mongoose";

const clinicalVisitSchema = new mongoose.Schema({
    patientId: { type: String, required: true, index: true },
    docId: { type: String, required: true },
    facilityId: { type: String, required: true }, // Hospital/Clinic ID
    appointmentId: { type: String, default: null }, // Link to booking if applicable

    visitDate: { type: Date, default: Date.now },
    visitType: {
        type: String,
        enum: ['Outpatient', 'Inpatient', 'Emergency', 'Telemedicine', 'Home Visit'],
        required: true
    },

    // SOAP Format (Subjective, Objective, Assessment, Plan)
    chiefComplaint: { type: String, required: true }, // "Patient Story"
    historyOfPresentIllness: { type: String, default: '' },

    // Physical Exam & Vitals (Summary or Links)
    vitalSignsId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'vitalsign' }], // Link to vital signs recorded
    physicalExamNotes: { type: String, default: '' },

    // Assessment / Diagnosis
    diagnosis: [{
        code: { type: String, default: null }, // ICD-10 Code if available
        description: { type: String, required: true },
        type: { type: String, enum: ['Primary', 'Secondary', 'Differential'], default: 'Primary' }
    }],

    // Plan
    treatmentPlan: { type: String, required: true },
    proceduresPerformed: [{ type: String }], // e.g., "Wound dressing", "Suturing"

    // Links to orders
    prescriptionId: { type: String, default: null },
    labOrderId: { type: String, default: null },
    radiologyOrderId: { type: String, default: null },

    // Outcome
    outcome: {
        type: String,
        enum: ['Treated & Discharged', 'Admitted', 'Referred', 'Left Against Advice', 'Deceased'],
        default: 'Treated & Discharged'
    },
    followUpDate: { type: Date, default: null },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const clinicalVisitModel = mongoose.models.clinicalvisit || mongoose.model('clinicalvisit', clinicalVisitSchema);

export default clinicalVisitModel;
