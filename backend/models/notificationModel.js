import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // User ID (patient or doctor)
    type: {
        type: String,
        enum: ['appointment_pending', 'appointment_approved', 'appointment_rejected', 'payment_pending', 'payment_approved', 'payment_rejected', 'prescription_created', 'doctor_registration_pending', 'doctor_approved', 'doctor_rejected', 'health_reminder', 'lab_order_created', 'lab_result_available', 'pharmacy_order_created'],
        required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    appointmentId: { type: String, default: null },
    paymentId: { type: String, default: null },
    read: { type: Boolean, default: false },
    emailSent: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const notificationModel = mongoose.models.notification || mongoose.model('notification', notificationSchema);

export default notificationModel;

