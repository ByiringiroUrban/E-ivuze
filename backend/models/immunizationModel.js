import mongoose from "mongoose";

const immunizationSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true }, // Patient ID
    vaccineName: { type: String, required: true }, // e.g., "BCG", "Polio", "Measles"
    doseNumber: { type: Number, default: 1 }, // Dose 1, 2, 3...
    batchNumber: { type: String, default: null }, // Required for tracking batches
    dateAdministered: { type: Date, default: Date.now },
    facilityId: { type: String, required: false }, // ID of the hospital/clinic
    administeredBy: { type: String, required: false }, // Doctor or Nurse Name/ID
    nextDueDate: { type: Date, default: null }, // For multi-dose schedules
    reaction: { type: String, default: null }, // Any adverse reaction noted
    notes: { type: String, default: '' }
});

const immunizationModel = mongoose.models.immunization || mongoose.model('immunization', immunizationSchema);

export default immunizationModel;
