import immunizationModel from '../models/immunizationModel.js';
import clinicalVisitModel from '../models/clinicalVisitModel.js';
import userModel from '../models/userModel.js';
import { sendEmail } from '../utils/emailService.js';
import { sendNotification } from './notificationService.js';
import cron from 'node-cron';

// Send reminder email
const sendClinicalReminder = async (user, title, message, details) => {
    if (!user || !user.email) return;

    const emailHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #ea580c;">e-Ivuze - Health Reminder</h2>
        <div style="background-color: #fff7ed; padding: 20px; border-radius: 8px; border-left: 4px solid #ea580c; margin: 20px 0;">
          <h3 style="color: #9a3412; margin-top: 0;">${title}</h3>
          <p style="color: #4b5563;">${message}</p>
          <div style="margin-top: 15px; font-size: 14px; color: #666;">
            <strong>Details:</strong> ${details}
          </div>
        </div>
        <p style="text-align: center; color: #6b7280; font-size: 12px;">This is an automated health reminder. Please consult your doctor if you have questions.</p>
      </div>
    `;

    await sendEmail({
        to: user.email,
        subject: title,
        html: emailHTML
    });

    // Also send in-app notification
    await sendNotification(user._id, 'health_reminder', title, message);
    // Note: Using 'appointment_pending' as generic type or add new type if needed.
    // Ideally we should add 'health_reminder' to notificationModel enum.
};

export const startClinicalReminders = () => {
    // Run daily at 8:00 AM
    cron.schedule('0 8 * * *', async () => {
        try {
            console.log('⏰ Running Clinical Reminders...');
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const nextWeek = new Date(today);
            nextWeek.setDate(nextWeek.getDate() + 7);

            // 1. Immunization Reminders (Due Tomorrow)
            // Find immunizations where nextDueDate is tomorrow
            const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0));
            const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999));

            const dueVaccines = await immunizationModel.find({
                nextDueDate: { $gte: startOfTomorrow, $lte: endOfTomorrow }
            });

            for (const vac of dueVaccines) {
                const user = await userModel.findById(vac.userId);
                if (user) {
                    await sendClinicalReminder(
                        user,
                        'Vaccination Due Tomorrow',
                        `You have a vaccination due tomorrow: ${vac.vaccineName}.`,
                        `Dose: ${vac.doseNumber + 1} (Estimated based on previous records)`
                    );
                    console.log(`✅ Sent vaccine reminder to ${user.email}`);
                }
            }

            // 2. Clinical Follow-up Reminders (Due Tomorrow)
            const dueFollowUps = await clinicalVisitModel.find({
                followUpDate: { $gte: startOfTomorrow, $lte: endOfTomorrow }
            });

            for (const visit of dueFollowUps) {
                const user = await userModel.findById(visit.patientId); // Note: Schema uses patientId
                if (user) {
                    await sendClinicalReminder(
                        user,
                        'Medical Follow-up Tomorrow',
                        `You have a scheduled follow-up visit tomorrow.`,
                        `Reason: Follow-up for visit on ${new Date(visit.visitDate).toLocaleDateString()}`
                    );
                    console.log(`✅ Sent follow-up reminder to ${user.email}`);
                }
            }

        } catch (error) {
            console.error('❌ Clinical Reminder Error:', error);
        }
    });

    console.log('✅ Clinical reminder scheduler started');
};

export default startClinicalReminders;
