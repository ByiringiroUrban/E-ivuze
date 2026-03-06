import mongoose from "mongoose";

const newsletterSubscriberSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true },
    source: { type: String, default: "footer_form" },
    tags: { type: [String], default: [] },
    subscribedAt: { type: Date, default: Date.now },
    unsubscribedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

const newsletterSubscriberModel =
  mongoose.models.newslettersubscriber ||
  mongoose.model("newslettersubscriber", newsletterSubscriberSchema);

export default newsletterSubscriberModel;

