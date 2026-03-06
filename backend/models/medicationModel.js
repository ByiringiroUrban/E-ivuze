import mongoose from "mongoose";

const medicationSchema = new mongoose.Schema({
  pharmacyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'pharmacy', 
    required: true,
    index: true
  },
  sku: { type: String, required: true },
  name: { type: String, required: true },
  brand: { type: String, default: '' },
  category: { type: String, required: true },
  description: { type: String, default: '' },
  dosage: { type: String, default: '' },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  batch: [{
    batchNumber: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    qty: { type: Number, required: true }
  }],
  prescriptionRequired: { type: Boolean, default: false },
  temperatureSensitive: { type: Boolean, default: false },
  storageInstructions: { type: String, default: '' },
  images: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { minimize: false });

// Compound index for pharmacy + sku uniqueness
medicationSchema.index({ pharmacyId: 1, sku: 1 }, { unique: true });

const medicationModel = mongoose.models.medication || mongoose.model('medication', medicationSchema);

export default medicationModel;

