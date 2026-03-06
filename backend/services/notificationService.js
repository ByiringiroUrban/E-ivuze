import notificationModel from '../models/notificationModel.js';
import userModel from '../models/userModel.js';
import doctorModel from '../models/doctorModel.js';
import labModel from '../models/labModel.js';
import { sendEmail, getCommonEmailTemplate } from '../utils/emailService.js';

// Dynamic import for pharmacyModel to avoid circular deps if any, or just import it.
// Assuming simple import works.
// Note: We'll use dynamic import inside function to be safe if file isn't guaranteed to exist yet?
// No, let's try standard import if we are sure.
// User said Pharmacy Pages Wired, so it exists.
// Let's use dynamic import inside the function just to be super safe against crashes if file missing.

const EMAIL_DEBUG = (process.env.EMAIL_DEBUG === 'true') || (process.env.MAIL_DEBUG === 'true');

const queueEmailDelivery = (notification, recipientEmail, title, message) => {
  if (!recipientEmail) return;

  // Use the standard design template
  const html = getCommonEmailTemplate(title, message, "View Notifications", process.env.VITE_FRONTEND_URL || "https://E-ivuze.com/notifications");

  const sendTask = async () => {
    try {
      if (EMAIL_DEBUG) {
        console.log(`📧 [EMAIL] (async) Sending to ${recipientEmail}`);
      }
      const emailResult = await sendEmail({ to: recipientEmail, subject: title, html });
      if (emailResult.success) {
        console.log(`✅ [EMAIL] Email sent successfully! Message ID: ${emailResult.messageId}`);
        if (notification) {
          notification.emailSent = true;
          await notification.save();
        }
      } else {
        console.log(`⚠️  [EMAIL] Failed to send email asynchronously: ${emailResult.message}`);
      }
    } catch (emailError) {
      console.error(`❌ [EMAIL] Async send error:`, emailError);
      if (emailError.response) {
        console.error(`   SMTP Response: ${emailError.response}`);
      }
    }
  };

  setImmediate(() => {
    sendTask().catch(err => console.error('❌ [EMAIL] Async handler error:', err));
  });
};

// Send notification and email
const sendNotification = async (userId, type, title, message, appointmentId = null, paymentId = null) => {
  try {
    console.log(`📬 [NOTIFICATION] Creating notification for user ${userId}`);
    console.log(`   Type: ${type}, Title: ${title}`);

    // Create notification
    const notification = new notificationModel({
      userId,
      type,
      title,
      message,
      appointmentId,
      paymentId
    });
    await notification.save();
    console.log(`✅ [NOTIFICATION] Notification created with ID: ${notification._id}`);

    // Get user email
    const user = await userModel.findById(userId).select('email name');
    if (!user || !user.email) {
      console.log(`⚠️  [EMAIL] User ${userId} not found or has no email - skipping email`);
      return { notification, emailSent: false };
    }

    console.log(`📧 [EMAIL] Queueing async email for: ${user.email}`);
    queueEmailDelivery(notification, user.email, title, message);

    return { notification, emailQueued: true };
  } catch (error) {
    console.error('❌ [NOTIFICATION] Error creating notification:', error);
    throw error;
  }
};

// Send notification to doctor
const sendNotificationToDoctor = async (docId, type, title, message, appointmentId = null, paymentId = null) => {
  try {
    console.log(`📬 [NOTIFICATION] Creating notification for doctor ${docId}`);
    console.log(`   Type: ${type}, Title: ${title}`);

    // Create notification
    const notification = new notificationModel({
      userId: docId,
      type,
      title,
      message,
      appointmentId,
      paymentId
    });
    await notification.save();
    console.log(`✅ [NOTIFICATION] Notification created with ID: ${notification._id}`);

    // Get doctor email
    const doctor = await doctorModel.findById(docId).select('email name');
    if (!doctor || !doctor.email) {
      console.log(`⚠️  [EMAIL] Doctor ${docId} not found or has no email - skipping email`);
      return { notification, emailSent: false };
    }

    console.log(`📧 [EMAIL] Queueing async email for: ${doctor.email}`);
    queueEmailDelivery(notification, doctor.email, title, message);

    return { notification, emailQueued: true };
  } catch (error) {
    console.error('❌ [NOTIFICATION] Error creating notification:', error);
    throw error;
  }
};

// Send notification to admin (via email since admin is not a model)
const sendNotificationToAdmin = async (adminEmail, type, title, message) => {
  try {
    console.log(`📬 [NOTIFICATION] Sending notification to admin: ${adminEmail}`);
    console.log(`   Type: ${type}, Title: ${title}`);

    // Send email directly (no notification model entry since admin is not a user model)
    queueEmailDelivery(null, adminEmail, title, message);

    return { emailQueued: true };
  } catch (error) {
    console.error('❌ [NOTIFICATION] Error sending notification to admin:', error);
    throw error;
  }
};

// Send notification to Lab
const sendNotificationToLab = async (labId, type, title, message, appointmentId = null) => {
  try {
    console.log(`📬 [NOTIFICATION] Creating notification for Lab ${labId}`);

    // Create notification
    const notification = new notificationModel({
      userId: labId, // Storing labId in userId field
      type,
      title,
      message,
      appointmentId
    });
    await notification.save();
    console.log(`✅ [NOTIFICATION] Lab Notification created: ${notification._id}`);

    // Get Lab email
    const lab = await labModel.findById(labId).select('email name');
    if (!lab || !lab.email) {
      console.log(`⚠️  [EMAIL] Lab ${labId} has no email - skipping`);
      return { notification, emailSent: false };
    }

    console.log(`📧 [EMAIL] Queueing async email for Lab: ${lab.email}`);
    queueEmailDelivery(notification, lab.email, title, message);

    return { notification, emailQueued: true };
  } catch (error) {
    console.error('❌ [NOTIFICATION] Lab Error:', error);
    throw error;
  }
};

// Send notification to Pharmacy
const sendNotificationToPharmacy = async (pharmacyId, type, title, message, appointmentId = null) => {
  try {
    console.log(`📬 [NOTIFICATION] Creating notification for Pharmacy ${pharmacyId}`);

    const notification = new notificationModel({
      userId: pharmacyId,
      type,
      title,
      message,
      appointmentId
    });
    await notification.save();

    // Import pharmacy model dynamically
    const pharmacyModel = (await import('../models/pharmacyModel.js')).default;
    const pharmacy = await pharmacyModel.findById(pharmacyId).select('email name');

    if (!pharmacy || !pharmacy.email) {
      return { notification, emailSent: false };
    }

    queueEmailDelivery(notification, pharmacy.email, title, message);
    return { notification, emailQueued: true };
  } catch (error) {
    console.error('❌ [NOTIFICATION] Pharmacy Error:', error);
    throw error;
  }
};

export { sendNotification, sendNotificationToDoctor, sendNotificationToAdmin, sendNotificationToLab, sendNotificationToPharmacy };
