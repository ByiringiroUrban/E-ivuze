import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";
import { v2 as cloudinary } from 'cloudinary';
import connectCloudinary from '../config/cloudinary.js';
import validator from 'validator';
import { sendEmail, getCommonEmailTemplate } from '../utils/emailService.js';

// Ensure Cloudinary is configured
connectCloudinary();

const changeAvailbility = async (req, res) => {
  try {
    const { docId } = req.body;
    const docData = await doctorModel.findById(docId);
    await doctorModel.findByIdAndUpdate(docId, {
      available: !docData.available,
    });
    res.json({ success: true, message: "Availability Changed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const doctorList = async (req, res) => {
  try {
    // Only return doctors that are available, approved, and not deleted
    const doctors = await doctorModel.find({
      available: true,
      status: 'approved',
      deleted_at: null
    }).select(["-password", "-email"]);
    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API for Doctor Registration
const registerDoctor = async (req, res) => {
  try {
    const { name, email, password, gender, speciality, degree, licenseNumber, experience, about, address } = req.body;
    const imageFile = req.file;

    // Validate required fields
    if (!name || !email || !password || !gender || !speciality || !degree || !licenseNumber || !experience || !about || !address) {
      return res.json({ success: false, message: "Missing required fields. License number is mandatory." });
    }

    if (gender && !['male', 'female'].includes(String(gender).trim().toLowerCase())) {
      return res.json({ success: false, message: 'Invalid gender value' });
    }

    // Validate license number format (alphanumeric, at least 5 characters)
    if (licenseNumber.trim().length < 5) {
      return res.json({ success: false, message: "License number must be at least 5 characters long" });
    }

    // Check if license number already exists
    const existingLicense = await doctorModel.findOne({ licenseNumber: licenseNumber.trim() });
    if (existingLicense) {
      return res.json({ success: false, message: "License number already registered" });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please enter a valid email" });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.json({ success: false, message: "Please enter a strong password (minimum 8 characters)" });
    }

    // Check if doctor already exists
    const existingDoctor = await doctorModel.findOne({ email });
    if (existingDoctor) {
      return res.json({ success: false, message: "Doctor with this email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Handle image upload - use African placeholder SVG if no image provided
    const defaultAfricanPlaceholder = "data:image/svg+xml,%3Csvg width='400' height='400' viewBox='0 0 400 400' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='200' cy='200' r='200' fill='%23E8F5E9'/%3E%3Cellipse cx='200' cy='180' rx='120' ry='140' fill='%238D6E63'/%3E%3Cellipse cx='170' cy='160' rx='12' ry='18' fill='%231A1A1A'/%3E%3Cellipse cx='230' cy='160' rx='12' ry='18' fill='%231A1A1A'/%3E%3Cellipse cx='200' cy='190' rx='8' ry='20' fill='%236D4C41'/%3E%3Cpath d='M 180 220 Q 200 230 220 220' stroke='%236D4C41' stroke-width='3' fill='none' stroke-linecap='round'/%3E%3Cpath d='M 80 120 Q 100 60 120 100 Q 140 40 160 90 Q 180 30 200 100 Q 220 30 240 90 Q 260 40 280 100 Q 300 60 320 120' stroke='%233E2723' stroke-width='25' fill='none' stroke-linecap='round'/%3E%3Crect x='180' y='280' width='40' height='50' fill='%238D6E63'/%3E%3Cellipse cx='200' cy='360' rx='150' ry='40' fill='%238D6E63'/%3E%3C/svg%3E";
    let imageUrl = defaultAfricanPlaceholder; // Default African placeholder
    if (imageFile) {
      try {
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
          resource_type: "image",
          folder: "doctor_profiles"
        });
        imageUrl = imageUpload.secure_url;
      } catch (error) {
        console.error("Error uploading image:", error);
        // Continue with default placeholder if upload fails
      }
    }

    // Parse address if it's a string
    let addressObj = {};
    try {
      addressObj = typeof address === 'string' ? JSON.parse(address) : address;
    } catch (error) {
      // If parsing fails, use default structure
      addressObj = { line1: address || '', line2: '' };
    }

    // Create doctor data (fees removed - will be set by admin)
    // Private registration: set registration_source='private' and status='pending'
    const doctorData = {
      name,
      email,
      password: hashedPassword,
      gender: gender ? String(gender).trim().toLowerCase() : undefined,
      image: imageUrl,
      speciality,
      degree,
      licenseNumber: licenseNumber.trim(),
      experience,
      about,
      address: addressObj,
      date: Date.now(),
      available: true,
      slots_booked: {},
      registration_source: 'private',
      status: 'pending'
    };

    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();

    // Send notification to admin about new pending registration
    try {
      const { sendNotificationToAdmin } = await import('../services/notificationService.js');
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@rwandahealth.com';
      await sendNotificationToAdmin(
        adminEmail,
        'doctor_registration_pending',
        'New Doctor Registration Pending Approval',
        `A new doctor registration requires your approval:\n\nName: ${name}\nEmail: ${email}\nSpeciality: ${speciality}\nLicense Number: ${licenseNumber.trim()}\n\nPlease review and approve the registration.`
      );
    } catch (notificationError) {
      console.error('Error sending notification to admin:', notificationError);
      // Don't fail registration if notification fails
    }

    // Do NOT generate token for private registrations - they need approval first
    // Return success but no token - frontend will redirect to homepage
    res.json({
      success: true,
      message: "Doctor registration submitted. Your account is pending approval.",
      requiresApproval: true
    });
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      return res.json({ success: false, message: "Email already exists" });
    }
    res.json({ success: false, message: error.message });
  }
};

// API for Doctor Login
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    console.log('\n👨‍⚕️  DOCTOR LOGIN ATTEMPT');
    console.log('   Email:', normalizedEmail);

    const doctor = await doctorModel.findOne({ email: normalizedEmail });

    if (!doctor) {
      console.log('   ❌ FAILED: Doctor not found in database');
      return res.json({ success: false, message: "Invalid credentials" });
    }

    console.log('   ✅ Found doctor profile:', doctor.name);
    console.log('   📊 Account Status:', doctor.status);

    // Check if doctor account is approved
    if (doctor.status === 'pending') {
      console.log('   ⚠️  FAILED: Account status is pending');
      return res.json({
        success: false,
        message: "Your account is pending approval. Please wait for admin approval."
      });
    }

    if (doctor.status === 'rejected') {
      console.log('   ❌ FAILED: Account status is rejected');
      return res.json({
        success: false,
        message: doctor.rejection_reason || "Your account has been rejected. Please contact support."
      });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    console.log('   🔑 Password match:', isMatch);

    if (isMatch) {
      const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET);
      console.log('   ✅ LOGIN SUCCESS');
      res.json({ success: true, token });
    } else {
      console.log('   ❌ FAILED: Password mismatch');
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log('   ❌ ERROR in doctor login:', error);
    res.json({ success: false, message: error.message });
  }
};

// API to get Doctor appointments for the Doctor Panel
const appointmentsDoctor = async (req, res) => {
  try {
    const docId = req.body.docId; // Get from middleware
    console.log('📋 Fetching appointments for docId:', docId);

    if (!docId) {
      console.error('❌ No docId provided');
      return res.json({ success: false, message: 'Doctor ID not found' });
    }

    // Find all appointments for this doctor, sorted by date (newest first)
    // Try both String and ObjectId formats to ensure we get all appointments
    const mongoose = (await import('mongoose')).default;
    let appointments;

    try {
      // First try with String docId
      appointments = await appointmentModel.find({ docId: docId.toString() }).sort({ date: -1 });
    } catch (err) {
      console.log('⚠️ String query failed, trying ObjectId...');
      // If that fails, try with ObjectId
      try {
        appointments = await appointmentModel.find({ docId: new mongoose.Types.ObjectId(docId) }).sort({ date: -1 });
      } catch (err2) {
        // If both fail, try without type conversion
        appointments = await appointmentModel.find({ docId }).sort({ date: -1 });
      }
    }

    console.log(`📋 Found ${appointments.length} appointments for doctor ${docId}`);

    // Deduplicate appointments by _id (in case of any duplicates)
    const appointmentMap = new Map();
    appointments.forEach((apt) => {
      if (apt._id && !appointmentMap.has(apt._id.toString())) {
        appointmentMap.set(apt._id.toString(), apt);
      }
    });

    const uniqueAppointments = Array.from(appointmentMap.values());
    console.log(`📋 Returning ${uniqueAppointments.length} unique appointments`);

    res.json({ success: true, appointments: uniqueAppointments });
  } catch (error) {
    console.error('❌ Error in appointmentsDoctor:', error);
    res.json({ success: false, message: error.message });
  }
};

// API to mark appointment completed for Doctor Panel
const appointmentComplete = async (req, res) => {
  try {
    const docId = req.body.docId; // Get from middleware
    const { appointmentId } = req.body;

    if (!docId || !appointmentId) {
      return res.json({ success: false, message: 'Missing required fields' });
    }

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        isCompleted: true,
      });

      // Auto-create record when appointment is completed
      try {
        const recordModel = (await import('../models/recordModel.js')).default;
        const existingRecord = await recordModel.findOne({
          appointmentId,
          recordType: 'consultation'
        });

        if (!existingRecord) {
          const recordData = {
            appointmentId,
            userId: appointmentData.userId,
            docId,
            recordType: 'consultation',
            title: `Consultation - ${appointmentData.slotDate} ${appointmentData.slotTime}`,
            description: `Appointment completed with ${appointmentData.userData.name} on ${appointmentData.slotDate} at ${appointmentData.slotTime}`
          };

          const newRecord = new recordModel(recordData);
          await newRecord.save();
          console.log('Auto-created consultation record for appointment:', appointmentId);
        }
      } catch (recordError) {
        console.error('Error auto-creating record:', recordError);
        // Don't fail the appointment completion if record creation fails
      }

      return res.json({ success: true, message: "Appointment Completed" });
    } else {
      return res.json({ success: false, message: "Mark Failed" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to mark appointment cancel for Doctor Panel
const appointmentCancel = async (req, res) => {
  try {
    const docId = req.body.docId; // Get from middleware
    const { appointmentId } = req.body;

    if (!docId || !appointmentId) {
      return res.json({ success: false, message: 'Missing required fields' });
    }

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        cancelled: true,
      });
      return res.json({ success: true, message: "Appointment Cancelled" });
    } else {
      return res.json({ success: false, message: "Cancellation Failed" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to approve appointment (Doctor)
const approveAppointment = async (req, res) => {
  try {
    const docId = req.body.docId; // Get from middleware
    const { appointmentId } = req.body;

    if (!docId || !appointmentId) {
      return res.json({ success: false, message: 'Missing required fields' });
    }

    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      return res.json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.docId !== docId) {
      return res.json({ success: false, message: 'Unauthorized - This appointment does not belong to you' });
    }

    if (appointment.approvalStatus === 'approved') {
      return res.json({ success: false, message: 'Appointment already approved' });
    }

    if (appointment.approvalStatus === 'rejected') {
      return res.json({ success: false, message: 'Cannot approve a rejected appointment' });
    }

    // Reserve the slot
    const doctorData = await doctorModel.findById(docId);
    let slots_booked = doctorData.slots_booked || {};

    if (slots_booked[appointment.slotDate]) {
      if (slots_booked[appointment.slotDate].includes(appointment.slotTime)) {
        return res.json({ success: false, message: 'Slot already booked by another appointment' });
      }
      slots_booked[appointment.slotDate].push(appointment.slotTime);
    } else {
      slots_booked[appointment.slotDate] = [appointment.slotTime];
    }

    // Update appointment
    await appointmentModel.findByIdAndUpdate(appointmentId, {
      approvalStatus: 'approved',
      approvedAt: new Date()
    });

    // Update doctor slots
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    // Send notification to patient
    const { sendNotification } = await import('../services/notificationService.js');
    await sendNotification(
      appointment.userId,
      'appointment_approved',
      'Appointment Approved',
      `Your appointment with Dr. ${appointment.docData.name} on ${appointment.slotDate} at ${appointment.slotTime} has been approved. You can now proceed with payment.`,
      appointmentId
    );

    res.json({ success: true, message: 'Appointment approved successfully' });

  } catch (error) {
    console.error('Error approving appointment:', error);
    res.json({ success: false, message: error.message });
  }
};

// API to reject appointment (Doctor)
const rejectAppointment = async (req, res) => {
  try {
    const docId = req.body.docId; // Get from middleware
    const { appointmentId, rejectionMessage } = req.body;

    if (!docId || !appointmentId) {
      return res.json({ success: false, message: 'Missing required fields' });
    }

    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      return res.json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.docId !== docId) {
      return res.json({ success: false, message: 'Unauthorized - This appointment does not belong to you' });
    }

    if (appointment.approvalStatus === 'rejected') {
      return res.json({ success: false, message: 'Appointment already rejected' });
    }

    if (appointment.approvalStatus === 'approved') {
      // If already approved, we need to release the slot
      const doctorData = await doctorModel.findById(docId);
      let slots_booked = doctorData.slots_booked || {};

      if (slots_booked[appointment.slotDate]) {
        slots_booked[appointment.slotDate] = slots_booked[appointment.slotDate].filter(
          time => time !== appointment.slotTime
        );
        await doctorModel.findByIdAndUpdate(docId, { slots_booked });
      }
    }

    // Update appointment
    await appointmentModel.findByIdAndUpdate(appointmentId, {
      approvalStatus: 'rejected',
      rejectionMessage: rejectionMessage || null,
      rejectedAt: new Date()
    });

    // Send notification to patient
    const { sendNotification } = await import('../services/notificationService.js');
    const message = rejectionMessage
      ? `Your appointment with Dr. ${appointment.docData.name} on ${appointment.slotDate} at ${appointment.slotTime} has been rejected. Reason: ${rejectionMessage}`
      : `Your appointment with Dr. ${appointment.docData.name} on ${appointment.slotDate} at ${appointment.slotTime} has been rejected.`;

    await sendNotification(
      appointment.userId,
      'appointment_rejected',
      'Appointment Rejected',
      message,
      appointmentId
    );

    res.json({ success: true, message: 'Appointment rejected successfully' });

  } catch (error) {
    console.error('Error rejecting appointment:', error);
    res.json({ success: false, message: error.message });
  }
};

// API to get dashboard data for doctor panel
const doctorDashboard = async (req, res) => {
  try {
    const { docId } = req.body;
    const appointments = await appointmentModel.find({ docId });

    let earnings = 0; // Corrected initialization of earnings
    let patients = new Set();

    appointments.forEach((item) => {
      if (item.isCompleted || item.payment) {
        earnings += item.amount;
      }
      patients.add(item.userId);
    });

    const dashData = {
      earnings,
      appointments: appointments.length,
      patients: patients.size,
      latestAppointments: appointments.slice(-5).reverse(), // Reverse and slice to get the latest 5 appointments
    };

    res.json({ success: true, dashData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get doctor profile for Doctor Panel
const doctorProfile = async (req, res) => {
  try {
    const { docId } = req.body;
    const profileData = await doctorModel.findById(docId).select("-password");

    res.json({ success: true, profileData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to update doctor profile data from Doctor Panel

const updateDoctorProfile = async (req, res) => {
  try {
    const { docId, name, speciality, degree, experience, about, fees, available } = req.body;
    const imageFile = req.file;

    // Parse address if it's a string (from FormData)
    let address = req.body.address;
    if (typeof address === 'string') {
      try {
        address = JSON.parse(address);
      } catch (e) {
        // If parsing fails, try to get from body directly
        address = req.body.address;
      }
    }

    // Validate docId
    if (!docId) {
      return res.json({ success: false, message: 'Doctor ID is required' });
    }

    // Build update data object with only provided fields
    const updateData = {};
    if (name !== undefined && name !== null) {
      const trimmedName = name.trim();
      if (trimmedName.length < 2) {
        return res.json({ success: false, message: 'Name must be at least 2 characters long' });
      }
      updateData.name = trimmedName;
    }
    if (speciality !== undefined && speciality !== null) {
      const trimmedSpeciality = speciality.trim();
      if (trimmedSpeciality.length < 2) {
        return res.json({ success: false, message: 'Speciality must be at least 2 characters long' });
      }
      updateData.speciality = trimmedSpeciality;
    }
    if (degree !== undefined && degree !== null) {
      const trimmedDegree = degree.trim();
      if (trimmedDegree.length < 2) {
        return res.json({ success: false, message: 'Degree must be at least 2 characters long' });
      }
      updateData.degree = trimmedDegree;
    }
    if (experience !== undefined && experience !== null) {
      const trimmedExperience = experience.trim();
      if (trimmedExperience.length < 1) {
        return res.json({ success: false, message: 'Experience is required' });
      }
      updateData.experience = trimmedExperience;
    }
    if (about !== undefined && about !== null) {
      const trimmedAbout = about.trim();
      if (trimmedAbout.length < 10) {
        return res.json({ success: false, message: 'About section must be at least 10 characters long' });
      }
      updateData.about = trimmedAbout;
    }
    if (fees !== undefined && fees !== null && fees !== '') {
      return res.json({
        success: false,
        message: 'Consultation fee is managed by admin and cannot be changed from doctor profile.'
      });
    }
    if (address) updateData.address = address;
    if (available !== undefined && available !== null) {
      updateData.available = available === true || available === 'true';
    }

    if (req.body.gender !== undefined && req.body.gender !== null && req.body.gender !== '') {
      const normalizedGender = String(req.body.gender).trim().toLowerCase();
      if (!['male', 'female'].includes(normalizedGender)) {
        return res.json({ success: false, message: 'Invalid gender value' });
      }
      updateData.gender = normalizedGender;
    }

    // National e-Health Fields
    const { nid, department, subSpeciality, cpdCredits, languages, employmentType } = req.body;
    if (nid) updateData.nid = nid;
    if (department) updateData.department = department;
    if (subSpeciality) updateData.subSpeciality = subSpeciality;
    if (cpdCredits) updateData.cpdCredits = Number(cpdCredits);
    if (employmentType) updateData.employmentType = employmentType;
    if (languages) {
      // Parse languages if string
      updateData.languages = typeof languages === 'string' ? JSON.parse(languages) : languages;
    }

    // Update basic profile data
    await doctorModel.findByIdAndUpdate(docId, updateData);

    // Handle image upload if provided
    if (imageFile) {
      try {
        // Check if Cloudinary is configured
        const cloudName = process.env.CLOUDINARY_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_SECRET_KEY;

        if (!cloudName || !apiKey || !apiSecret) {
          console.error('❌ Cloudinary not configured');
          return res.json({
            success: false,
            message: 'Image upload service not configured. Please contact administrator.'
          });
        }

        // Upload image to Cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
          folder: 'doctor_profiles',
          resource_type: 'image'
        });
        const imageURL = imageUpload.secure_url;

        // Update doctor image
        await doctorModel.findByIdAndUpdate(docId, { image: imageURL });
        console.log('✅ Doctor profile image updated:', imageURL);
      } catch (uploadError) {
        console.error('❌ Cloudinary upload error:', uploadError);
        return res.json({
          success: false,
          message: 'Failed to upload image: ' + uploadError.message
        });
      }
    }

    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get doctor's patients (from appointments)
const getDoctorPatients = async (req, res) => {
  try {
    const { docId } = req.body;

    if (!docId) {
      return res.json({ success: false, message: 'Doctor ID not found' });
    }

    // Get all appointments for this doctor
    // Note: userId is stored as String, not a reference, so populate won't work
    const appointments = await appointmentModel.find({ docId });

    // Import record, prescription, lab, transfer, and immunization models
    const recordModel = (await import('../models/recordModel.js')).default;
    const prescriptionModel = (await import('../models/prescriptionModel.js')).default;
    const labOrderModel = (await import('../models/labOrderModel.js')).default;
    const transferModel = (await import('../models/transferModel.js')).default;
    const immunizationModel = (await import('../models/immunizationModel.js')).default;

    // Get unique patient IDs
    const patientIdSet = new Set();
    appointments.forEach((appointment) => {
      if (appointment.userId) {
        patientIdSet.add(appointment.userId.toString());
      }
    });

    // Fetch all unique patients
    const patientIds = Array.from(patientIdSet);
    const patientsData = await Promise.all(
      patientIds.map(async (userId) => {
        try {
          const user = await userModel.findById(userId).select('-password');
          return user ? user.toObject() : null;
        } catch (error) {
          console.error(`Error fetching user ${userId}:`, error);
          return null;
        }
      })
    );

    // Build patient map with appointment data
    const patientMap = new Map();
    patientsData.forEach((userData) => {
      if (userData && userData._id) {
        const userIdStr = userData._id.toString();
        patientMap.set(userIdStr, {
          ...userData,
          appointmentCount: 0,
          lastAppointment: null,
          records: [],
          prescriptions: [],
          labs: [],
          referrals: [],
          immunizations: []
        });
      }
    });

    // Count appointments and find last appointment for each patient
    appointments.forEach((appointment) => {
      if (appointment.userId) {
        const userIdStr = appointment.userId.toString();
        const patient = patientMap.get(userIdStr);

        if (patient) {
          patient.appointmentCount++;
          if (!patient.lastAppointment || new Date(appointment.slotDate) > new Date(patient.lastAppointment.slotDate)) {
            patient.lastAppointment = {
              date: appointment.slotDate,
              time: appointment.slotTime,
              status: appointment.cancelled ? 'cancelled' : appointment.isCompleted ? 'completed' : 'pending'
            };
          }
        }
      }
    });

    // Fetch records and prescriptions for each patient
    const patients = Array.from(patientMap.values());
    const docIdStr = docId.toString();

    for (const patient of patients) {
      if (!patient._id) {
        console.error('Patient missing _id:', patient);
        continue;
      }

      const patientIdStr = patient._id.toString();

      try {
        // Get all records for this patient with this doctor
        const records = await recordModel.find({ userId: patientIdStr, docId: docIdStr })
          .sort({ createdAt: -1 });

        // Get all prescriptions for this patient with this doctor
        const prescriptions = await prescriptionModel.find({ userId: patientIdStr, docId: docIdStr })
          .sort({ createdAt: -1 });

        // Get all lab orders for this patient
        const labs = await labOrderModel.find({ patientId: patientIdStr })
          .sort({ orderedAt: -1 });

        // Get all referrals/transfers for this patient
        const referrals = await transferModel.find({ patientId: patientIdStr })
          .populate('toHospital', 'name')
          .sort({ createdAt: -1 });

        // Get all immunizations for this patient
        const immunizations = await immunizationModel.find({ userId: patientIdStr })
          .sort({ dateAdministered: -1 });

        patient.records = records || [];
        patient.prescriptions = prescriptions || [];
        patient.labs = labs || [];
        patient.referrals = referrals || [];
        patient.immunizations = immunizations || [];
      } catch (error) {
        console.error('Error fetching patient clinical data:', patientIdStr, error);
        patient.records = [];
        patient.prescriptions = [];
        patient.labs = [];
        patient.referrals = [];
        patient.immunizations = [];
      }
    }

    res.json({ success: true, patients });
  } catch (error) {
    console.error('Error getting doctor patients:', error);
    res.json({ success: false, message: error.message });
  }
};

// API to add a new patient (create user account)
const addPatient = async (req, res) => {
  try {
    const { name, email, password, phone, gender, dob, address } = req.body;

    // Validation
    if (!name || !email || !password || !phone) {
      return res.json({ success: false, message: 'Name, email, password, and phone are required' });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: 'Please enter a valid email address' });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Parse address if it's a string
    let addressObj = {};
    if (address) {
      try {
        addressObj = typeof address === 'string' ? JSON.parse(address) : address;
      } catch (error) {
        // If parsing fails, use default structure
        addressObj = typeof address === 'object' ? address : { line1: address || '', line2: '' };
      }
    }

    // Create user with mustChangePassword flag set to true
    const newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
      phone,
      gender: gender || 'Not Selected',
      dob: dob || 'Not Selected',
      address: addressObj || { line1: '', line2: '' },
      mustChangePassword: true // Require password change on first login
    });

    // Send email with credentials
    try {
      await sendPatientCredentialsEmail(email, name, password);
    } catch (emailError) {
      console.error('Error sending credentials email:', emailError);
      // Don't fail the registration if email fails
    }

    res.json({
      success: true,
      message: 'Patient registered successfully. Credentials have been sent to their email.',
      patient: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        gender: newUser.gender,
        dob: newUser.dob,
        address: newUser.address
      }
    });
  } catch (error) {
    console.error('Error adding patient:', error);
    if (error.code === 11000) {
      return res.json({ success: false, message: 'Email already exists' });
    }
    res.json({ success: false, message: error.message || 'Failed to register patient' });
  }
};

// Send patient credentials email
const sendPatientCredentialsEmail = async (userEmail, userName, tempPassword) => {
  try {
    const subject = 'Your Account Credentials - E-ivuzeCONNECT';
    const html = getCommonEmailTemplate(
      subject,
      `Welcome, <strong>${userName}</strong>!<br><br>Your account has been created by your doctor. Please use the following credentials to log in:<br><br><strong>Email:</strong> ${userEmail}<br><strong>Temporary Password:</strong> ${tempPassword}<br><br><strong>IMPORTANT:</strong> For security reasons, you must change your password on your first login.`
    );

    await sendEmail({
      to: userEmail,
      subject,
      html
    });

    console.log('Patient credentials email sent to:', userEmail);
  } catch (error) {
    console.error('Error sending patient credentials email:', error);
    throw error;
  }
};

// API to change password for doctors
const changePassword = async (req, res) => {
  try {
    const { docId } = req.body; // Get from middleware
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.json({ success: false, message: 'Current password and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.json({ success: false, message: 'New password must be at least 8 characters long' });
    }

    const doctor = await doctorModel.findById(docId);
    if (!doctor) {
      return res.json({ success: false, message: 'Doctor not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, doctor.password);
    if (!isMatch) {
      return res.json({ success: false, message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    doctor.password = hashedPassword;
    await doctor.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Error changing password:', error);
    res.json({ success: false, message: error.message });
  }
};

// Google OAuth Login for Doctors
const googleLoginDoctor = async (req, res) => {
  try {
    console.log('\n🟢 [GOOGLE LOGIN - DOCTOR] Request received');
    console.log('   📥 Body:', JSON.stringify(req.body, null, 2));

    const { googleId, email, name, image } = req.body;

    if (!googleId || !email) {
      console.log('   ❌ Missing required fields: googleId or email');
      return res.json({ success: false, message: 'Google ID and email are required' });
    }

    console.log(`   📧 Email: ${email}`);
    console.log(`   🆔 Google ID: ${googleId.substring(0, 20)}...`);

    // Check if doctor exists with this Google ID
    let doctor = await doctorModel.findOne({ googleId });
    console.log(`   🔍 Doctor found by Google ID: ${doctor ? 'Yes (ID: ' + doctor._id + ')' : 'No'}`);

    if (!doctor) {
      // Check if doctor exists with this email
      doctor = await doctorModel.findOne({ email });
      console.log(`   🔍 Doctor found by email: ${doctor ? 'Yes (ID: ' + doctor._id + ')' : 'No'}`);

      if (doctor) {
        // Link Google account to existing doctor
        console.log('   🔗 Linking Google account to existing doctor');
        doctor.googleId = googleId;
        if (image) doctor.image = image;
        await doctor.save();
        console.log('   ✅ Google account linked successfully');
      } else {
        console.log('   ❌ Doctor account not found');
        return res.json({
          success: false,
          message: 'Doctor account not found. Please complete registration first.',
          requiresRegistration: true
        });
      }
    } else {
      // Update doctor info if needed
      console.log('   🔄 Updating existing doctor info');
      if (name && doctor.name !== name) doctor.name = name;
      if (image && doctor.image !== image) doctor.image = image;
      await doctor.save();
      console.log('   ✅ Doctor info updated');
    }

    // Check if doctor account is approved
    if (doctor.status === 'pending') {
      console.log('   ⏳ Doctor account is pending approval');
      return res.json({
        success: false,
        message: 'Your account is pending approval. Please wait for admin approval.'
      });
    }

    if (doctor.status === 'rejected') {
      console.log('   ❌ Doctor account is rejected');
      return res.json({
        success: false,
        message: doctor.rejection_reason || 'Your account has been rejected. Please contact support.'
      });
    }

    const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET);
    console.log(`   ✅ Token generated for doctor: ${doctor._id}`);
    console.log('   ✅ [GOOGLE LOGIN - DOCTOR] Success\n');

    res.json({
      success: true,
      token
    });
  } catch (error) {
    console.error('   ❌ [GOOGLE LOGIN - DOCTOR] Error:', error);
    console.error('   ❌ Error message:', error.message);
    console.error('   ❌ Error stack:', error.stack);
    res.json({ success: false, message: error.message });
  }
};

// Google OAuth Registration for Doctors (with additional fields)
const googleRegisterDoctor = async (req, res) => {
  try {
    console.log('\n🟢 [GOOGLE REGISTER - DOCTOR] Request received');
    console.log('   📥 Body:', JSON.stringify(req.body, null, 2));
    console.log('   📎 File:', req.file ? `Yes (${req.file.filename})` : 'No');

    const { googleId, email, name, image, gender, speciality, degree, licenseNumber, experience, about, address } = req.body;
    const imageFile = req.file;

    if (!googleId || !email || !name) {
      console.log('   ❌ Missing required fields: googleId, email, or name');
      return res.json({ success: false, message: 'Google ID, email, and name are required' });
    }

    console.log(`   📧 Email: ${email}`);
    console.log(`   🆔 Google ID: ${googleId.substring(0, 20)}...`);
    console.log(`   👤 Name: ${name}`);

    // Validate required doctor fields
    if (!gender || !speciality || !degree || !licenseNumber || !experience || !about || !address) {
      console.log('   ❌ Missing required doctor fields');
      console.log(`      Gender: ${gender ? '✓' : '✗'}`);
      console.log(`      Speciality: ${speciality ? '✓' : '✗'}`);
      console.log(`      Degree: ${degree ? '✓' : '✗'}`);
      console.log(`      License: ${licenseNumber ? '✓' : '✗'}`);
      console.log(`      Experience: ${experience ? '✓' : '✗'}`);
      console.log(`      About: ${about ? '✓' : '✗'}`);
      console.log(`      Address: ${address ? '✓' : '✗'}`);
      return res.json({ success: false, message: 'Missing required fields. Gender, license number, speciality, degree, experience, about, and address are mandatory.' });
    }

    if (gender && !['male', 'female'].includes(String(gender).trim().toLowerCase())) {
      return res.json({ success: false, message: 'Invalid gender value' });
    }

    // Validate license number
    if (licenseNumber.trim().length < 5) {
      console.log(`   ❌ License number too short: ${licenseNumber.trim().length} characters`);
      return res.json({ success: false, message: 'License number must be at least 5 characters long' });
    }

    console.log(`   📋 Speciality: ${speciality}`);
    console.log(`   🎓 Degree: ${degree}`);
    console.log(`   📜 License: ${licenseNumber.trim()}`);

    // Check if license number already exists
    const existingLicense = await doctorModel.findOne({ licenseNumber: licenseNumber.trim() });
    if (existingLicense) {
      console.log(`   ❌ License number already exists (Doctor ID: ${existingLicense._id})`);
      return res.json({ success: false, message: 'License number already registered' });
    }

    // Check if doctor already exists with this Google ID or email
    const existingDoctor = await doctorModel.findOne({
      $or: [{ googleId }, { email }]
    });
    if (existingDoctor) {
      console.log(`   ❌ Doctor already exists (ID: ${existingDoctor._id})`);
      return res.json({ success: false, message: 'Doctor with this Google account or email already exists' });
    }

    // Handle image - use provided image or uploaded file
    console.log('   🖼️  Processing image...');
    const defaultAfricanPlaceholder = "data:image/svg+xml,%3Csvg width='400' height='400' viewBox='0 0 400 400' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='200' cy='200' r='200' fill='%23E8F5E9'/%3E%3Cellipse cx='200' cy='180' rx='120' ry='140' fill='%238D6E63'/%3E%3Cellipse cx='170' cy='160' rx='12' ry='18' fill='%231A1A1A'/%3E%3Cellipse cx='230' cy='160' rx='12' ry='18' fill='%231A1A1A'/%3E%3Cellipse cx='200' cy='190' rx='8' ry='20' fill='%236D4C41'/%3E%3Cpath d='M 180 220 Q 200 230 220 220' stroke='%236D4C41' stroke-width='3' fill='none' stroke-linecap='round'/%3E%3Cpath d='M 80 120 Q 100 60 120 100 Q 140 40 160 90 Q 180 30 200 100 Q 220 30 240 90 Q 260 40 280 100 Q 300 60 320 120' stroke='%233E2723' stroke-width='25' fill='none' stroke-linecap='round'/%3E%3Crect x='180' y='280' width='40' height='50' fill='%238D6E63'/%3E%3Cellipse cx='200' cy='360' rx='150' ry='40' fill='%238D6E63'/%3E%3C/svg%3E";
    let imageUrl = image || defaultAfricanPlaceholder;
    if (imageFile) {
      try {
        console.log('   📤 Uploading image to Cloudinary...');
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
          resource_type: 'image',
          folder: 'doctor_profiles'
        });
        imageUrl = imageUpload.secure_url;
        console.log(`   ✅ Image uploaded: ${imageUrl.substring(0, 50)}...`);
      } catch (error) {
        console.error('   ❌ Error uploading image:', error);
      }
    } else {
      console.log('   ℹ️  Using default placeholder or Google image');
    }

    // Parse address
    console.log('   📍 Parsing address...');
    let addressObj = {};
    try {
      addressObj = typeof address === 'string' ? JSON.parse(address) : address;
      console.log(`   ✅ Address parsed: ${JSON.stringify(addressObj)}`);
    } catch (error) {
      addressObj = { line1: address || '', line2: '' };
      console.log(`   ⚠️  Address parse failed, using default: ${JSON.stringify(addressObj)}`);
    }

    // Create doctor data
    console.log('   ➕ Creating doctor record...');
    const doctorData = {
      name,
      email,
      googleId,
      password: '', // No password for Google OAuth users
      gender: gender ? String(gender).trim().toLowerCase() : undefined,
      image: imageUrl,
      speciality,
      degree,
      licenseNumber: licenseNumber.trim(),
      experience,
      about,
      address: addressObj,
      date: Date.now(),
      available: true,
      slots_booked: {},
      registration_source: 'private',
      status: 'pending'
    };

    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();
    console.log(`   ✅ Doctor created with ID: ${newDoctor._id}`);
    console.log(`   📊 Status: ${newDoctor.status}`);

    // Send notification to admin
    try {
      console.log('   📧 Sending notification to admin...');
      const { sendNotificationToAdmin } = await import('../services/notificationService.js');
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@rwandahealth.com';
      await sendNotificationToAdmin(
        adminEmail,
        'doctor_registration_pending',
        'New Doctor Registration Pending Approval',
        `A new doctor registration via Google OAuth requires your approval:\n\nName: ${name}\nEmail: ${email}\nSpeciality: ${speciality}\nLicense Number: ${licenseNumber.trim()}\n\nPlease review and approve the registration.`
      );
      console.log('   ✅ Notification sent to admin');
    } catch (notificationError) {
      console.error('   ❌ Error sending notification to admin:', notificationError);
    }

    console.log('   ✅ [GOOGLE REGISTER - DOCTOR] Success\n');
    res.json({
      success: true,
      message: 'Doctor registration submitted. Your account is pending approval.',
      requiresApproval: true
    });
  } catch (error) {
    console.error('   ❌ [GOOGLE REGISTER - DOCTOR] Error:', error);
    console.error('   ❌ Error message:', error.message);
    console.error('   ❌ Error code:', error.code);
    console.error('   ❌ Error stack:', error.stack);
    if (error.code === 11000) {
      return res.json({ success: false, message: 'Email or Google ID already exists' });
    }
    res.json({ success: false, message: error.message });
  }
};

export {
  changeAvailbility,
  doctorList,
  registerDoctor,
  loginDoctor,
  appointmentsDoctor,
  appointmentCancel,
  appointmentComplete,
  approveAppointment,
  rejectAppointment,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile,
  getDoctorPatients,
  addPatient,
  changePassword,
  googleLoginDoctor,
  googleRegisterDoctor,
};