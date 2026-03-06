import appointmentModel from '../models/appointmentModel.js';
import userModel from '../models/userModel.js';
import { sendEmail } from '../utils/emailService.js';
import cron from 'node-cron';

// Send appointment reminder email
const sendAppointmentReminder = async (appointment, reminderType) => {
  try {
    const user = await userModel.findById(appointment.userId);
    if (!user || !user.email) return false;

    const appointmentDate = new Date(appointment.appointmentDate);
    const timeString = appointmentDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    const dateString = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let reminderTitle = '';
    let reminderMessage = '';

    if (reminderType === 'day-before') {
      reminderTitle = '📅 Appointment Reminder - Tomorrow';
      reminderMessage = `Your appointment is scheduled for tomorrow, ${dateString} at ${timeString}. Please arrive 10 minutes early.`;
    } else if (reminderType === '4-hours-before') {
      reminderTitle = '⏰ Appointment Reminder - In 4 Hours';
      reminderMessage = `Your appointment is in 4 hours, at ${timeString} today. Please prepare and be ready.`;
    } else if (reminderType === 'at-appointment-time') {
      reminderTitle = '🔔 Appointment Time';
      reminderMessage = `Your appointment is now! Please join the video call or visit the clinic.`;
    }

    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10B981; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
          .content { padding: 20px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-top: none; }
          .appointment-details { background-color: #ecfdf5; padding: 15px; border-left: 4px solid #10B981; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .btn { display: inline-block; padding: 10px 20px; background-color: #10B981; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>${reminderTitle}</h2>
          </div>
          <div class="content">
            <p>Dear ${user.name},</p>
            <p>${reminderMessage}</p>
            <div class="appointment-details">
              <h4>📋 Appointment Details:</h4>
              <p><strong>Doctor:</strong> ${appointment.docName}</p>
              <p><strong>Date:</strong> ${dateString}</p>
              <p><strong>Time:</strong> ${timeString}</p>
              ${appointment.isVideo ? '<p><strong>Type:</strong> Video Call</p>' : '<p><strong>Type:</strong> In-Clinic</p>'}
            </div>
            <p>If you need to reschedule or cancel, please do so as soon as possible.</p>
            <a href="${process.env.FRONTEND_URL}/my-appointments" class="btn">View Appointment</a>
            <p>Best regards,<br>e-Ivuze Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 e-Ivuze. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      to: user.email,
      subject: reminderTitle,
      html: emailHTML
    });

    console.log(`✅ ${reminderType} reminder sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('Error sending appointment reminder:', error);
    return false;
  }
};

// Check and send reminders every minute
export const startAppointmentReminders = () => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();

      // Get all upcoming appointments
      const appointments = await appointmentModel.find({
        appointmentDate: { $gt: now },
        cancelled: false,
        remindersSent: { $exists: false }
      });

      for (const appointment of appointments) {
        const appointmentTime = new Date(appointment.appointmentDate);
        const timeDiff = appointmentTime - now;
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        const minutesDiff = timeDiff / (1000 * 60);

        // Initialize remindersSent array if it doesn't exist
        if (!appointment.remindersSent) {
          appointment.remindersSent = [];
        }

        // Send 1 day before (24 hours)
        if (hoursDiff <= 24 && hoursDiff > 23 && !appointment.remindersSent.includes('day-before')) {
          await sendAppointmentReminder(appointment, 'day-before');
          appointment.remindersSent.push('day-before');
          await appointment.save();
        }

        // Send 4 hours before
        if (hoursDiff <= 4 && hoursDiff > 3.5 && !appointment.remindersSent.includes('4-hours-before')) {
          await sendAppointmentReminder(appointment, '4-hours-before');
          appointment.remindersSent.push('4-hours-before');
          await appointment.save();
        }

        // Send at appointment time
        if (minutesDiff <= 1 && minutesDiff >= -1 && !appointment.remindersSent.includes('at-appointment-time')) {
          await sendAppointmentReminder(appointment, 'at-appointment-time');
          appointment.remindersSent.push('at-appointment-time');
          await appointment.save();
        }
      }
    } catch (error) {
      console.error('Error in appointment reminder scheduler:', error);
    }
  });

  console.log('✅ Appointment reminder scheduler started');
};

export default startAppointmentReminders;
