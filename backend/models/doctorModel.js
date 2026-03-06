import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // Optional for Google OAuth users
    googleId: { type: String, unique: true, sparse: true }, // For Google OAuth
    gender: {
      type: String,
      enum: ['male', 'female'],
      default: 'male'
    },
    image: { type: String, required: true },
    speciality: { type: String, required: true },
    degree: { type: String, required: true },
    licenseNumber: { type: String, required: true, unique: true },
    experience: { type: String, required: true },
    about: { type: String, required: true },
    available: { type: Boolean, default: true },
    fees: { type: Number, required: false }, // Fees are now set by admin, not by doctors
    address: { type: Object, required: true },
    date: { type: Number, required: true },
    slots_booked: { type: Object, default: {} },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'hospital',
      required: false,
      default: null
    }, // Optional: if null, doctor is private/standalone
    registration_source: {
      type: String,
      enum: ['hospital', 'private'],
      default: 'private',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      required: true
    },
    approved_by: {
      type: String, // Admin email (since admin is not a model, we store email)
      default: null
    },
    approved_at: {
      type: Date,
      default: null
    },
    rejection_reason: {
      type: String,
      default: null
    },
    deleted_at: {
      type: Date,
      default: null
    },

    // National e-Health Requirements
    nid: { type: String, unique: true, sparse: true }, // National ID
    department: { type: String, default: null }, // e.g., "Surgery", "Pediatrics"
    subSpeciality: { type: String, default: null }, // e.g., "Cardiology"
    cpdCredits: { type: Number, default: 0 }, // Continuous Professional Development
    languages: [{ type: String }], // e.g., ["Kinyarwanda", "English", "French"]
    employmentType: {
      type: String,
      enum: ['Full-Time', 'Part-Time', 'Visiting', 'Volunteer'],
      default: 'Full-Time'
    }
  }, { minimize: false });

const doctorModel = mongoose.models.doctor || mongoose.model('doctor', doctorSchema);

export default doctorModel;
