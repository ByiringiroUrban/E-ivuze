import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, default: "" },
    subject: { type: String, default: "" },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["NEW", "IN_REVIEW", "RESPONDED", "ARCHIVED"],
      default: "NEW",
    },
    adminNotes: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

const contactMessageModel =
  mongoose.models.contactmessage ||
  mongoose.model("contactmessage", contactMessageSchema);

export default contactMessageModel;

