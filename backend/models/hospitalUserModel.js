import mongoose from "mongoose";

const hospitalUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'hospital', required: true },
  role: { 
    type: String, 
    enum: ['admin', 'staff'], 
    default: 'admin' 
  },
  createdAt: { type: Date, default: Date.now }
});

const hospitalUserModel = mongoose.models.hospitaluser || mongoose.model('hospitaluser', hospitalUserSchema);

export default hospitalUserModel;

