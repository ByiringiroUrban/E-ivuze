import mongoose from "mongoose";

const vitalSignSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true }, // Patient ID
    docId: { type: String, required: false }, // Doctor who recorded it (optional, could be self-reported)
    appointmentId: { type: String, required: false }, // Link to specific visit
    type: {
        type: String,
        required: true,
        enum: ['Blood Pressure', 'Heart Rate', 'Temperature', 'Respiratory Rate', 'Oxygen Saturation', 'Height', 'Weight', 'BMI', 'Blood Glucose']
    },
    value: { type: String, required: true }, // e.g., "120/80", "98", "37.5"
    unit: { type: String, required: true }, // e.g., "mmHg", "bpm", "°C"
    recordedAt: { type: Date, default: Date.now },
    notes: { type: String, default: '' },
    isAbnormal: { type: Boolean, default: false } // Flag for high/low values
});

const vitalSignModel = mongoose.models.vitalsign || mongoose.model('vitalsign', vitalSignSchema);

export default vitalSignModel;
