import mongoose from "mongoose";

const appointmentRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, default: "" },
    speciality: { type: String, default: "" },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "doctor",
      default: null,
    },
    doctorName: { type: String, default: "" },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hospital",
      default: null,
    },
    hospitalName: { type: String, default: "" },
    preferredDate: { type: Date, default: null },
    message: { type: String, default: "" },
    status: {
      type: String,
      enum: ["NEW", "IN_PROGRESS", "COMPLETED"],
      default: "NEW",
    },
    adminNotes: { type: String, default: "" },
    source: { type: String, default: "homepage_form" },
  },
  {
    timestamps: true,
  }
);

const appointmentRequestModel =
  mongoose.models.appointmentrequest ||
  mongoose.model("appointmentrequest", appointmentRequestSchema);

export default appointmentRequestModel;

