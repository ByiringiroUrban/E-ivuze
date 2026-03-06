import validator from "validator";
import appointmentRequestModel from "../models/appointmentRequestModel.js";
import contactMessageModel from "../models/contactMessageModel.js";
import newsletterSubscriberModel from "../models/newsletterSubscriberModel.js";
import doctorModel from "../models/doctorModel.js";
import hospitalModel from "../models/hospitalModel.js";
import settingsModel from "../models/settingsModel.js";
import { sendEmail, getCommonEmailTemplate } from "../utils/emailService.js";
import { getTrendingRwandaHealthNews } from "../services/trendingNewsService.js";
import { getRwandaHealthTips } from "../services/rwandaHealthTipsService.js";

const normalizeDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return null;
  }
  return date;
};

const submitAppointmentRequest = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      speciality,
      doctorId,
      doctorName,
      hospitalId,
      hospitalName,
      preferredDate,
      message,
      source,
    } = req.body || {};

    if (!name || !email) {
      return res
        .status(400)
        .json({ success: false, message: "Name and email are required." });
    }

    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide a valid email." });
    }

    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || "",
      speciality: speciality?.trim() || "",
      doctorId: doctorId || null,
      doctorName: doctorName?.trim() || "",
      hospitalId: hospitalId || null,
      hospitalName: hospitalName?.trim() || "",
      preferredDate: normalizeDate(preferredDate),
      message: message?.trim() || "",
      source: source || "homepage_form",
    };

    if (payload.doctorId && !payload.doctorName) {
      const doctor = await doctorModel
        .findById(payload.doctorId)
        .select("name");
      if (doctor) payload.doctorName = doctor.name;
    }

    if (payload.hospitalId && !payload.hospitalName) {
      const hospital = await hospitalModel
        .findById(payload.hospitalId)
        .select("name");
      if (hospital) payload.hospitalName = hospital.name;
    }

    const request = await appointmentRequestModel.create(payload);

    // Send email to admin
    try {
      const adminEmail = 'E-ivuzeconnect@gmail.com';
      const emailSubject = `New Appointment Request from ${name}`;
      const emailContent = `
        <h3>New Appointment Request</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Department/Speciality:</strong> ${speciality || 'General practitioner'}</p>
        <p><strong>Preferred Date:</strong> ${preferredDate || 'Not specified'}</p>
        <p><strong>Message:</strong> ${message || 'No additional message'}</p>
        <p><strong>Source:</strong> ${source || 'homepage_form'}</p>
      `;

      await sendEmail({
        to: adminEmail,
        subject: emailSubject,
        html: emailContent
      });

      // Send confirmation email to user
      const userConfirmationSubject = 'Appointment Request Sent to Support - E-ivuzeConnect';
      const userConfirmationContent = `
        <h3>Your appointment request has been sent to our support team!</h3>
        <p>Dear ${name},</p>
        <p>We have successfully received your appointment request for <strong>${speciality || 'General practitioner'}</strong>. Your request has been forwarded to our support and admin team for review.</p>
        <p>One of our staff members will review the details and get back to you within 24 hours to confirm your final appointment time and provider.</p>
        <p>If you have any urgent medical needs, please contact our emergency line or reply directly to this email.</p>
        <p><strong>Summary of your request:</strong></p>
        <p><strong>Department:</strong> ${speciality || 'General practitioner'}</p>
        <p><strong>Preferred Date:</strong> ${preferredDate || 'Not specified'}</p>
        <br>
        <p>Best regards,<br>E-ivuzeConnect Support Team<br>Email: E-ivuzeconnect@gmail.com</p>
      `;

      await sendEmail({
        to: email,
        subject: userConfirmationSubject,
        html: userConfirmationContent
      });

    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the request if email fails - data is still saved
    }

    res.json({
      success: true,
      message: "Appointment request received. You will receive a confirmation email shortly.",
      request,
    });
  } catch (error) {
    console.error("Appointment request error:", error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Failed to submit request." });
  }
};

const getHealthTips = async (req, res) => {
  try {
    const lang = String(req.query.lang || req.query.language || 'rw').split('-')[0];
    const limitRaw = req.query.limit || '3';
    const limit = Math.max(1, Math.min(6, parseInt(limitRaw, 10) || 3));

    const tips = await getRwandaHealthTips({ lang, limit });
    res.json({ success: true, tips });
  } catch (error) {
    console.error('Health tips error:', error);
    res.json({ success: false, message: error.message || 'Failed to fetch health tips', tips: [] });
  }
};

const getTrendingHealthNews = async (req, res) => {
  try {
    const lang = String(req.query.lang || req.query.language || 'rw').split('-')[0];
    const limitRaw = req.query.limit || '3';
    const limit = Math.max(1, Math.min(10, parseInt(limitRaw, 10) || 3));
    const q = String(req.query.q || '').trim();

    const items = await getTrendingRwandaHealthNews({ lang, limit, query: q || undefined });
    res.json({ success: true, items });
  } catch (error) {
    console.error('Trending health news error:', error);
    res.json({ success: false, message: error.message || 'Failed to fetch trending news', items: [] });
  }
};

const submitContactMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body || {};

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ success: false, message: "Name, email and message are required." });
    }

    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide a valid email." });
    }

    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || "",
      subject: subject?.trim() || "",
      message: message.trim(),
    };

    const contact = await contactMessageModel.create(payload);

    // Send email to admin
    try {
      const adminEmail = 'E-ivuzeconnect@gmail.com';
      const emailSubject = `New Contact Form Message: ${subject || 'General Inquiry'}`;
      const emailContent = `
        <h3>New Contact Form Message</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `;

      await sendEmail({
        to: adminEmail,
        subject: emailSubject,
        html: emailContent
      });

      // Send confirmation email to user
      const userConfirmationSubject = 'Message Received - E-ivuzeConnect';
      const userConfirmationContent = `
        <h3>Thank you for contacting E-ivuzeConnect!</h3>
        <p>Dear ${name},</p>
        <p>We have received your message and our team will respond within 24 hours.</p>
        <p><strong>Your message:</strong></p>
        <p>${message}</p>
        <br>
        <p>Best regards,<br>E-ivuzeConnect Team<br>Email: E-ivuzeconnect@gmail.com</p>
      `;

      await sendEmail({
        to: email,
        subject: userConfirmationSubject,
        html: userConfirmationContent
      });

    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the request if email fails - data is still saved
    }

    res.json({
      success: true,
      message: "Thank you! Your message has been sent. You will receive a confirmation email shortly.",
      contact,
    });
  } catch (error) {
    console.error("Contact form error:", error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Failed to submit contact form." });
  }
};

const subscribeNewsletter = async (req, res) => {
  try {
    const { email, source, tags = [] } = req.body || {};

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required to subscribe." });
    }

    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide a valid email." });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const subscriber = await newsletterSubscriberModel.findOneAndUpdate(
      { email: normalizedEmail },
      {
        email: normalizedEmail,
        source: source || "footer_form",
        tags,
        unsubscribedAt: null,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Send confirmation email to subscriber
    try {
      const confirmationSubject = 'Welcome to E-ivuzeConnect Newsletter!';
      const confirmationContent = `
        <h3>Thank you for subscribing!</h3>
        <p>Dear Subscriber,</p>
        <p>You have successfully subscribed to the E-ivuzeConnect newsletter. You will now receive updates about:</p>
        <ul>
          <li>Latest healthcare news and insights</li>
          <li>New doctor additions and specialities</li>
          <li>Platform updates and features</li>
          <li>Health tips and wellness advice</li>
          <li>Special promotions and offers</li>
        </ul>
        <p>We're excited to keep you informed about healthcare innovations in Rwanda!</p>
        <br>
        <p>Best regards,<br>E-ivuzeConnect Team<br>Email: E-ivuzeconnect@gmail.com</p>
      `;

      await sendEmail({
        to: normalizedEmail,
        subject: confirmationSubject,
        html: confirmationContent
      });

      // Send notification to admin
      const adminEmail = 'E-ivuzeconnect@gmail.com';
      const adminSubject = `New Newsletter Subscription - ${normalizedEmail}`;
      const adminContent = `
        <h3>New Newsletter Subscription</h3>
        <p><strong>Email:</strong> ${normalizedEmail}</p>
        <p><strong>Source:</strong> ${source || 'footer_form'}</p>
        <p><strong>Tags:</strong> ${tags.length > 0 ? tags.join(', ') : 'None'}</p>
        <p><strong>Subscribed At:</strong> ${new Date().toLocaleString()}</p>
      `;

      await sendEmail({
        to: adminEmail,
        subject: adminSubject,
        html: adminContent
      });

    } catch (emailError) {
      console.error('Email sending failed for newsletter subscription:', emailError);
      // Don't fail the subscription if email fails
    }

    res.json({
      success: true,
      message: "Thanks for subscribing! You will receive a confirmation email shortly.",
      subscriber,
    });
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Failed to subscribe." });
  }
};

const getPublicSettings = async (req, res) => {
  try {
    let settings = await settingsModel.findOne();

    // If no settings exist, create default settings
    if (!settings) {
      settings = new settingsModel({
        consultationFee: 3000,
        platformPercentage: 10
      });
      await settings.save();
    }

    // Only return consultationFee and theme status (public info)
    const settingsObj = settings.toObject ? settings.toObject() : settings;

    // Explicitly check for property existence in _doc if needed, but toObject() is safest
    const isChristmas = settingsObj.holidayTheme === true ||
      (settings._doc && settings._doc.holidayTheme === true);

    const response = {
      success: true,
      consultationFee: settingsObj.consultationFee,
      isChristmasThemeActive: isChristmas
    };

    console.log('Public settings response:', response);
    res.json(response);
  } catch (error) {
    console.error("Get public settings error:", error);
    res.json({
      success: false,
      message: error.message,
      consultationFee: 3000, // Default fallback
      isChristmasThemeActive: false
    });
  }
};

export { submitAppointmentRequest, submitContactMessage, subscribeNewsletter, getPublicSettings, getTrendingHealthNews, getHealthTips };

