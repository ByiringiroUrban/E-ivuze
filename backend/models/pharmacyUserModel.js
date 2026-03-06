import mongoose from "mongoose";

const pharmacyUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  pharmacyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'pharmacy', 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['pharmacy_admin', 'pharmacy_staff'], 
    default: 'pharmacy_admin' 
  },
  mustChangePassword: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const pharmacyUserModel = mongoose.models.pharmacyuser || mongoose.model('pharmacyuser', pharmacyUserSchema);

export default pharmacyUserModel;

