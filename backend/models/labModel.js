import mongoose from "mongoose";

const labSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    googleId: { type: String, default: '' },
    image: { type: String, default: "" },
    address: {
        line1: { type: String, default: '' },
        line2: { type: String, default: '' },
        city: { type: String, default: 'Kigali' }
    },
    phone: { type: String, default: '' },
    speciality: { type: Array, default: [] }, // e.g. ['Pathology', 'Radiology']
    available: { type: Boolean, default: true },
    fees: { type: Number, default: 0 },
    date: { type: Number, default: Date.now },
}, { minimize: false })

const labModel = mongoose.models.lab || mongoose.model("lab", labSchema);

export default labModel;
