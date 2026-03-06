import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  consultationFee: { type: Number, required: true, default: 3000 },
  platformPercentage: { type: Number, required: true, default: 10 },
  holidayTheme: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now }
}, { strict: false });

const settingsModel = mongoose.models.settings || mongoose.model('settings', settingsSchema);

export default settingsModel;

