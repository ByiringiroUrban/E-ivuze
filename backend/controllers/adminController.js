import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";
import settingsModel from "../models/settingsModel.js";
import hospitalModel from "../models/hospitalModel.js";
import hospitalUserModel from "../models/hospitalUserModel.js";
import pharmacyUserModel from "../models/pharmacyUserModel.js";
import labModel from "../models/labModel.js";
import appointmentRequestModel from "../models/appointmentRequestModel.js";
import contactMessageModel from "../models/contactMessageModel.js";
import newsletterSubscriberModel from "../models/newsletterSubscriberModel.js";
import announcementModel from "../models/announcementModel.js";
import { sendEmail, getCommonEmailTemplate } from "../utils/emailService.js";

const buildUserFilter = (query) => {
  const q = String(query?.q || '').trim();
  const role = String(query?.role || '').trim();
  const hasGoogleRaw = String(query?.hasGoogle || '').trim().toLowerCase();
  const mustChangePasswordRaw = String(query?.mustChangePassword || '').trim().toLowerCase();

  const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const clauses = [];

  if (q) {
    clauses.push({
      $or: [
        { name: { $regex: escapeRegex(q), $options: 'i' } },
        { email: { $regex: escapeRegex(q), $options: 'i' } }
      ]
    });
  }

  if (['user', 'staff', 'admin'].includes(role)) {
    if (role === 'user') {
      clauses.push({
        $or: [
          { role: 'user' },
          { role: { $exists: false } },
          { role: null }
        ]
      });
    } else {
      clauses.push({ role });
    }
  }

  if (hasGoogleRaw === 'true') {
    clauses.push({ googleId: { $exists: true, $ne: null } });
  } else if (hasGoogleRaw === 'false') {
    clauses.push({
      $or: [
        { googleId: { $exists: false } },
        { googleId: null }
      ]
    });
  }

  if (mustChangePasswordRaw === 'true') {
    clauses.push({ mustChangePassword: true });
  } else if (mustChangePasswordRaw === 'false') {
    clauses.push({ mustChangePassword: { $ne: true } });
  }

  if (!clauses.length) return {};
  if (clauses.length === 1) return clauses[0];
  return { $and: clauses };
};

const parseCsvText = (csvText) => {
  const text = String(csvText || '').replace(/^\uFEFF/, '');
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (!lines.length) return [];

  const parseRow = (line) => {
    const out = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (line[i + 1] === '"') {
            cur += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          cur += ch;
        }
      } else {
        if (ch === ',') {
          out.push(cur);
          cur = '';
        } else if (ch === '"') {
          inQuotes = true;
        } else {
          cur += ch;
        }
      }
    }
    out.push(cur);
    return out.map(v => String(v ?? '').trim());
  };

  const headers = parseRow(lines[0]).map(h => h.replace(/\s+/g, '').toLowerCase());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseRow(lines[i]);
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = cols[idx] !== undefined ? cols[idx] : '';
    });
    rows.push(obj);
  }
  return rows;
};

// API for adding doctor
const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      gender,
      speciality,
      degree,
      licenseNumber,
      experience,
      about,
      address,
    } = req.body;
    const imageFile = req.file;

    //checking for all data to add doctor
    if (
      !req.body.name ||
      !req.body.email ||
      !req.body.password ||
      !req.body.experience ||
      !req.body.about ||
      !req.body.speciality ||
      !req.body.degree ||
      !req.body.licenseNumber ||
      !req.body.address
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing Details. License number is mandatory." });
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

    // validating email format
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    //validating password formart
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password",
      });
    }

    if (gender && !['male', 'female'].includes(String(gender).trim().toLowerCase())) {
      return res.json({ success: false, message: 'Invalid gender value' });
    }

    // hashing doctor password

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // upload image to cloudinary

    //    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
    //     resource_type: "image",
    //   });

    //    const imageUrl = imageUpload.secure_url;

    // Default African placeholder SVG if no image provided
    const defaultAfricanPlaceholder = "data:image/svg+xml,%3Csvg width='400' height='400' viewBox='0 0 400 400' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='200' cy='200' r='200' fill='%23E8F5E9'/%3E%3Cellipse cx='200' cy='180' rx='120' ry='140' fill='%238D6E63'/%3E%3Cellipse cx='170' cy='160' rx='12' ry='18' fill='%231A1A1A'/%3E%3Cellipse cx='230' cy='160' rx='12' ry='18' fill='%231A1A1A'/%3E%3Cellipse cx='200' cy='190' rx='8' ry='20' fill='%236D4C41'/%3E%3Cpath d='M 180 220 Q 200 230 220 220' stroke='%236D4C41' stroke-width='3' fill='none' stroke-linecap='round'/%3E%3Cpath d='M 80 120 Q 100 60 120 100 Q 140 40 160 90 Q 180 30 200 100 Q 220 30 240 90 Q 260 40 280 100 Q 300 60 320 120' stroke='%233E2723' stroke-width='25' fill='none' stroke-linecap='round'/%3E%3Crect x='180' y='280' width='40' height='50' fill='%238D6E63'/%3E%3Cellipse cx='200' cy='360' rx='150' ry='40' fill='%238D6E63'/%3E%3C/svg%3E";
    let imageUrl = defaultAfricanPlaceholder; // Default African placeholder

    if (imageFile) {
      // Check if image file exists
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });

      imageUrl = imageUpload.secure_url;
    }

    const doctorData = {
      name,
      email,
      gender: gender ? String(gender).trim().toLowerCase() : undefined,
      image: imageUrl,
      password: hashedPassword,
      speciality,
      degree,
      licenseNumber: licenseNumber.trim(),
      experience,
      about,
      address: {}, // Set a default empty object
      date: Date.now(),
      registration_source: 'hospital', // Admin-created doctors are treated as hospital-registered
      status: 'approved' // Admin-created doctors are auto-approved
    };

    try {
      doctorData.address = JSON.parse(address);
    } catch (error) {
      console.error("Error parsing address:", error);
      // You can optionally log more details about the error
      // and potentially send an error response to the client (e.g., "Invalid address data")
    }

    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();

    // Send Welcome Email
    const dashboardLink = process.env.VITE_FRONTEND_URL ? `${process.env.VITE_FRONTEND_URL}/login` : "https://E-ivuze.com/login";
    const emailHtml = getCommonEmailTemplate(
      "Welcome to E-ivuze",
      `Hi Dr. ${name},<br><br>Your doctor account has been approved and created.<br><br><strong>Login Credentials:</strong><br>Email: ${email}<br>Password: ${password}<br><br>Please keep these credentials safe.`,
      "Login to Dashboard",
      dashboardLink
    );
    await sendEmail({
      to: email,
      subject: "Welcome to E-ivuze- Account Created",
      html: emailHtml
    });

    res.json({ success: true, message: "Doctor Added" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API for admin Login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 ADMIN LOGIN ATTEMPT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   Email:', normalizedEmail);

    // 1. Check Database for Admin User
    const dbAdmin = await userModel.findOne({ email: normalizedEmail, role: 'admin' });

    if (dbAdmin) {
      console.log('   🔍 Found admin in database:', dbAdmin.name);
      const isMatch = await bcrypt.compare(password, dbAdmin.password);
      console.log('   🔑 Password match:', isMatch);

      if (isMatch) {
        // Use a consistent token structure for DB admins
        const token = jwt.sign({ id: dbAdmin._id, role: 'admin' }, process.env.JWT_SECRET);
        console.log('   ✅ DATABASE ADMIN LOGIN SUCCESS');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        return res.json({ success: true, token });
      } else {
        console.log('   ❌ DATABASE ADMIN LOGIN FAILED: Password mismatch');
      }
    }

    // 2. Fallback to Hardcoded Admin (Legacy/Super Admin)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@rwandahealth.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123456';

    if (normalizedEmail === adminEmail && password === adminPassword) {
      const tokenValue = adminEmail + adminPassword;
      const token = jwt.sign(tokenValue, process.env.JWT_SECRET);
      console.log('   ✅ HARDCODED ADMIN LOGIN SUCCESS');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      return res.json({ success: true, token });
    }

    console.log('   ❌ LOGIN FAILED: No match found');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    res.json({ success: false, message: "Invalid credentials" });

  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all doctors list for admin panel (includes all statuses: approved, pending, rejected, and those without status)
const allDoctors = async (req, res) => {
  try {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 ADMIN: Fetching ALL doctors');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // First, get total count of all doctors (including soft-deleted for comparison)
    const totalCount = await doctorModel.countDocuments({});
    console.log(`📊 Total doctors in database (including deleted): ${totalCount}`);

    // Get ALL doctors first (no filter) to see what we have
    const allDoctorsRaw = await doctorModel.find({}).select("_id name email status deleted_at");
    console.log(`📊 All doctors (no filter): ${allDoctorsRaw.length}`);
    allDoctorsRaw.forEach((doc, idx) => {
      const d = doc.toObject ? doc.toObject() : doc;
      console.log(`   ${idx + 1}. ${d.name} - Status: ${d.status || 'MISSING'} - Deleted: ${d.deleted_at || 'NO'}`);
    });

    // Get all doctors excluding soft-deleted ones
    // Try multiple query approaches to ensure we get all non-deleted doctors
    const query = {
      $or: [
        { deleted_at: null },
        { deleted_at: { $exists: false } }
      ]
    };

    console.log(`\n🔍 Query for non-deleted doctors:`, JSON.stringify(query, null, 2));

    const doctors = await doctorModel.find(query)
      .select("name email speciality _id status available image degree licenseNumber experience about address registration_source approved_by approved_at rejection_reason date deleted_at")
      .sort({ date: -1 }); // Newest first

    console.log(`📋 Found ${doctors.length} doctors (excluding soft-deleted)`);

    // Log each doctor's details
    doctors.forEach((doctor, index) => {
      const doc = doctor.toObject ? doctor.toObject() : doctor;
      console.log(`   ${index + 1}. ${doc.name} (${doc.email}) - Status: ${doc.status || 'MISSING'} - ID: ${doc._id}`);
    });

    // Ensure all doctors have a status field (set default to 'pending' if missing)
    const doctorsWithStatus = [];
    const updatePromises = [];

    for (const doctor of doctors) {
      const doctorObj = doctor.toObject ? doctor.toObject() : doctor;
      const originalStatus = doctorObj.status;

      // If status is missing, null, or undefined, default to 'pending' and update in DB
      if (!doctorObj.status || !['pending', 'approved', 'rejected'].includes(doctorObj.status)) {
        console.log(`   ⚠️  Doctor ${doctorObj.name} (${doctorObj._id}) has invalid/missing status: "${originalStatus}" - Setting to 'pending'`);
        doctorObj.status = 'pending';
        // Update the doctor in database to have status
        updatePromises.push(
          doctorModel.findByIdAndUpdate(doctor._id, { status: 'pending' }, { new: false })
        );
      }
      doctorsWithStatus.push(doctorObj);
    }

    // Update doctors without status in background (don't wait for it)
    if (updatePromises.length > 0) {
      console.log(`   🔄 Updating ${updatePromises.length} doctors to have status='pending'`);
      Promise.all(updatePromises).then(() => {
        console.log(`   ✅ Updated ${updatePromises.length} doctors to have status='pending'`);
      }).catch(err => {
        console.error('   ❌ Error updating doctor statuses:', err);
      });
    }

    // Count by status
    const statusCounts = {
      approved: doctorsWithStatus.filter(d => d.status === 'approved').length,
      pending: doctorsWithStatus.filter(d => d.status === 'pending').length,
      rejected: doctorsWithStatus.filter(d => d.status === 'rejected').length
    };

    console.log(`\n📊 Status Breakdown:`);
    console.log(`   - Approved: ${statusCounts.approved}`);
    console.log(`   - Pending: ${statusCounts.pending}`);
    console.log(`   - Rejected: ${statusCounts.rejected}`);
    console.log(`   - Total: ${doctorsWithStatus.length}`);
    console.log(`\n✅ Returning ${doctorsWithStatus.length} doctors to admin`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    res.json({ success: true, doctors: doctorsWithStatus });
  } catch (error) {
    console.error('\n❌ ERROR in allDoctors:', error);
    console.error('   Stack:', error.stack);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    res.json({ success: false, message: error.message });
  }
};

// API to update doctor
const updateDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { name, email, speciality, degree, licenseNumber, experience, about, address, available, status } = req.body;
    const imageFile = req.file;

    const doctor = await doctorModel.findById(doctorId);
    if (!doctor) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (speciality) updateData.speciality = speciality;
    if (degree) updateData.degree = degree;
    if (licenseNumber) updateData.licenseNumber = licenseNumber;
    if (experience) updateData.experience = experience;
    if (about) updateData.about = about;
    if (address) {
      try {
        updateData.address = typeof address === 'string' ? JSON.parse(address) : address;
      } catch (e) {
        updateData.address = address;
      }
    }
    if (available !== undefined) updateData.available = available;

    // Handle status update (only allow valid statuses)
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      updateData.status = status;
      // If approving, set approval metadata
      if (status === 'approved' && doctor.status !== 'approved') {
        updateData.approved_by = process.env.ADMIN_EMAIL || 'admin@rwandahealth.com';
        updateData.approved_at = new Date();
        updateData.rejection_reason = null; // Clear rejection reason if approving
      }
      // If rejecting, clear approval metadata
      if (status === 'rejected') {
        updateData.approved_by = null;
        updateData.approved_at = null;
      }
    }

    // Handle image upload if provided
    if (imageFile) {
      try {
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
          resource_type: "image",
        });
        updateData.image = imageUpload.secure_url;
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.json({ success: false, message: 'Failed to upload image' });
      }
    }

    await doctorModel.findByIdAndUpdate(doctorId, updateData);
    res.json({ success: true, message: "Doctor updated successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to delete doctor
const deleteDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await doctorModel.findById(doctorId);
    if (!doctor) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    // Check if doctor has appointments
    const appointmentCount = await appointmentModel.countDocuments({ docId: doctorId });
    if (appointmentCount > 0) {
      return res.json({
        success: false,
        message: `Cannot delete doctor. They have ${appointmentCount} appointment(s). Please handle appointments first.`
      });
    }

    await doctorModel.findByIdAndDelete(doctorId);
    res.json({ success: true, message: "Doctor deleted successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all appointments list
const appointmentsAdmin = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({})
      .populate('userId', 'name email image dob phone')
      .populate('docId', 'name email image speciality degree')
      .sort({ createdAt: -1 });
    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all users for admin
const getAllUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.max(1, Math.min(200, parseInt(req.query.limit || '50', 10)));

    const filter = buildUserFilter(req.query);

    const total = await userModel.countDocuments(filter);
    const users = await userModel
      .find(filter)
      .select('name email role phone gender dob nid mustChangePassword googleId')
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({ success: true, users, total, page, limit });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const createUserAdmin = async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '').trim();
    const role = String(req.body.role || 'user').trim() || 'user';
    const phone = req.body.phone !== undefined ? String(req.body.phone || '').trim() : undefined;

    if (!name || !email || !password) {
      return res.json({ success: false, message: 'Missing Details' });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: 'Enter a valid email' });
    }

    if (password.length < 8) {
      return res.json({ success: false, message: 'Enter a strong password' });
    }

    if (!['user', 'staff', 'admin'].includes(role)) {
      return res.json({ success: false, message: 'Invalid role' });
    }

    const existing = await userModel.findOne({ email });
    if (existing) {
      return res.json({ success: false, message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
      role,
      ...(phone !== undefined ? { phone } : {})
    });

    const saved = await userModel
      .findById(newUser._id)
      .select('name email role phone gender dob nid mustChangePassword googleId')
      .lean();

    return res.json({ success: true, message: 'User created', user: saved });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

const updateUserAdmin = async (req, res) => {
  try {
    const userId = req.params.userId;
    const updates = {};

    if (req.body.name !== undefined) updates.name = String(req.body.name || '').trim();
    if (req.body.email !== undefined) updates.email = String(req.body.email || '').trim().toLowerCase();
    if (req.body.phone !== undefined) updates.phone = String(req.body.phone || '').trim();
    if (req.body.role !== undefined) updates.role = String(req.body.role || '').trim();

    if (updates.email && !validator.isEmail(updates.email)) {
      return res.json({ success: false, message: 'Enter a valid email' });
    }

    if (updates.role && !['user', 'staff', 'admin'].includes(updates.role)) {
      return res.json({ success: false, message: 'Invalid role' });
    }

    if (req.body.password !== undefined && String(req.body.password || '').trim()) {
      const password = String(req.body.password || '').trim();
      if (password.length < 8) {
        return res.json({ success: false, message: 'Enter a strong password' });
      }
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
      updates.mustChangePassword = false;
    }

    if (updates.email) {
      const existing = await userModel.findOne({ email: updates.email, _id: { $ne: userId } });
      if (existing) {
        return res.json({ success: false, message: 'Email already in use' });
      }
    }

    const updated = await userModel
      .findByIdAndUpdate(userId, updates, { new: true })
      .select('name email role phone gender dob nid mustChangePassword googleId')
      .lean();

    if (!updated) {
      return res.json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, message: 'User updated', user: updated });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

const deleteUserAdmin = async (req, res) => {
  try {
    const userId = req.params.userId;

    const appointmentCount = await appointmentModel.countDocuments({ userId: String(userId) });
    if (appointmentCount > 0) {
      return res.json({
        success: false,
        message: `Cannot delete user. They have ${appointmentCount} appointment(s). Please handle appointments first.`
      });
    }

    const deleted = await userModel.findByIdAndDelete(userId);
    if (!deleted) {
      return res.json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

const exportUsersCsvAdmin = async (req, res) => {
  try {
    const filter = buildUserFilter(req.query);

    const users = await userModel
      .find(filter)
      .select('name email role phone gender dob nid mustChangePassword googleId')
      .sort({ name: 1 })
      .lean();

    const csvEscape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const header = ['id', 'name', 'email', 'role', 'phone', 'gender', 'dob', 'nid', 'mustChangePassword', 'hasGoogle'];
    const rows = users.map((u) => {
      return [
        u._id,
        u.name,
        u.email,
        u.role || 'user',
        u.phone,
        u.gender,
        u.dob,
        u.nid,
        u.mustChangePassword,
        Boolean(u.googleId)
      ]
        .map(csvEscape)
        .join(',');
    });

    const csv = [header.join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
    res.send(`\uFEFF${csv}`);
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const importUsersCsvAdmin = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.json({ success: false, message: 'CSV file is required (field name: file)' });
    }

    const csvText = Buffer.isBuffer(file.buffer)
      ? file.buffer.toString('utf8')
      : String(file.buffer || '');

    const rows = parseCsvText(csvText);
    if (!rows.length) {
      return res.json({ success: false, message: 'No rows found in CSV' });
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i] || {};
      const rowNumber = i + 2;

      const name = String(r.name || r.fullname || '').trim();
      const email = String(r.email || '').trim().toLowerCase();
      const phone = String(r.phone || r.phonenumber || '').trim();
      const roleRaw = String(r.role || '').trim().toLowerCase();
      const password = String(r.password || '').trim();

      const role = ['user', 'staff', 'admin'].includes(roleRaw) ? roleRaw : 'user';

      if (!email || !validator.isEmail(email)) {
        skipped++;
        errors.push({ row: rowNumber, message: 'Invalid or missing email' });
        continue;
      }

      const existing = await userModel.findOne({ email });

      if (!existing) {
        if (!name || !password || password.length < 8) {
          skipped++;
          errors.push({ row: rowNumber, email, message: 'Missing name or password (min 8 chars) for new user' });
          continue;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await userModel.create({
          name,
          email,
          password: hashedPassword,
          role,
          ...(phone ? { phone } : {}),
          mustChangePassword: true
        });

        created++;
        continue;
      }

      const updates = {};
      if (name) updates.name = name;
      if (phone) updates.phone = phone;
      if (role) updates.role = role;

      if (password) {
        if (password.length < 8) {
          skipped++;
          errors.push({ row: rowNumber, email, message: 'Password too short (min 8 chars)' });
          continue;
        }
        const salt = await bcrypt.genSalt(10);
        updates.password = await bcrypt.hash(password, salt);
        updates.mustChangePassword = true;
      }

      if (Object.keys(updates).length === 0) {
        skipped++;
        continue;
      }

      await userModel.updateOne({ _id: existing._id }, updates);
      updated++;
    }

    return res.json({
      success: true,
      message: 'Import complete',
      created,
      updated,
      skipped,
      errors
    });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// API for appointment cancellation

const appointmentCancel = async (req, res) => {

  try {

    const { appointmentId } = req.body

    const appointmentData = await appointmentModel.findById(appointmentId)

    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

    // releasing doctor slot

    const { docId, slotDate, slotTime } = appointmentData

    const doctorData = await doctorModel.findById(docId)

    let slots_booked = doctorData.slots_booked

    slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

    await doctorModel.findByIdAndUpdate(docId, { slots_booked })

    res.json({ success: true, message: 'Appointment Cancelled' })


  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to get dashboard data for admin panel

const adminDashboard = async (req, res) => {

  try {

    const doctors = await doctorModel.find({});
    const users = await userModel.find({});
    const appointments = await appointmentModel.find({});

    // --- CHART DATA GENERATION ---
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Initialize stats containers
    const monthlyData = months.reduce((acc, month) => {
      acc[month] = { name: month, revenue: 0, appointments: 0, uniquePatients: new Set(), firstTimeBookers: 0, repeatBookers: 0 };
      return acc;
    }, {});

    const seenPatients = new Set();
    const doctorStats = {}; // { docId: { count, completed } }

    const parseDate = (val) => {
      if (!val) return new Date();
      const d = new Date(val);
      return isNaN(d.getTime()) ? new Date(Number(val) || Date.now()) : d;
    };

    const sortedAppointments = appointments.slice().sort((a, b) => parseDate(a.date) - parseDate(b.date));

    sortedAppointments.forEach(app => {
      const appDate = parseDate(app.date);
      const monthName = months[appDate.getMonth()];
      const patientId = app.userId;

      // Track Doctor Performance
      if (app.docId) {
        if (!doctorStats[app.docId]) doctorStats[app.docId] = { count: 0, completed: 0 };
        doctorStats[app.docId].count += 1;
        if (app.isCompleted) doctorStats[app.docId].completed += 1;
      }

      if (monthlyData[monthName]) {
        monthlyData[monthName].appointments += 1;
        if (app.payment === true || app.paymentStatus === 'approved') {
          monthlyData[monthName].revenue += (Number(app.amount) || 0);
        }
        monthlyData[monthName].uniquePatients.add(patientId);
        if (seenPatients.has(patientId)) {
          monthlyData[monthName].repeatBookers += 1;
        } else {
          monthlyData[monthName].firstTimeBookers += 1;
          seenPatients.add(patientId);
        }
      }
    });

    const topDoctorsList = Object.entries(doctorStats)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 5)
      .map(([id, stats]) => {
        const doc = doctors.find(d => d._id.toString() === id.toString());
        return {
          name: doc?.name || 'Unknown',
          speciality: doc?.speciality || 'General',
          count: stats.count,
          completionRate: stats.count > 0 ? Math.round((stats.completed / stats.count) * 100) : 0,
          image: doc?.image
        };
      });

    // 2. Process Users (New Signups via _id timestamp)
    users.forEach(user => {
      const userDate = user._id.getTimestamp();
      const monthName = months[userDate.getMonth()];
      if (monthlyData[monthName]) {
        monthlyData[monthName].newPatients += 1;
      }
    });

    // Convert to arrays for Recharts
    const revenueChart = months.map(m => ({
      name: m,
      online: monthlyData[m].revenue,
      offline: 0
    }));

    const visitorChart = months.map(m => ({
      name: m,
      new: monthlyData[m].firstTimeBookers,
      unique: monthlyData[m].uniquePatients.size,
      loyal: monthlyData[m].repeatBookers
    }));

    const targetChart = months.map(m => ({
      name: m,
      reality: monthlyData[m].appointments,
      target: Math.max(monthlyData[m].appointments * 1.1, 10).toFixed(0)
    }));

    const dashData = {
      doctors: doctors.length,
      appointments: appointments.length,
      patients: users.length,
      requestsCount: doctors.filter(d => d.status === 'pending').length, // Count pending approvals
      latestAppointments: appointments.slice().reverse().slice(0, 5),
      charts: {
        revenue: revenueChart,
        visitors: visitorChart,
        target: targetChart,
        topDoctors: topDoctorsList
      }
    }

    res.json({ success: true, dashData })


  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })

  }

}

// API to get settings
const getSettings = async (req, res) => {
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

    console.log('Fetching settings:', settings);

    // Ensure defaults are returned even if missing in DB doc
    // Ensure defaults are returned even if missing in DB doc
    const settingsObj = settings.toObject ? settings.toObject() : settings;
    // Map holidayTheme to isChristmasThemeActive for frontend compatibility
    settingsObj.isChristmasThemeActive = settingsObj.holidayTheme || false;

    res.json({ success: true, settings: settingsObj });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to update settings
const updateSettings = async (req, res) => {
  try {
    const { consultationFee, platformPercentage, isChristmasThemeActive } = req.body;

    if (consultationFee !== undefined && (isNaN(consultationFee) || consultationFee < 0)) {
      return res.json({ success: false, message: "Invalid consultation fee" });
    }

    if (platformPercentage !== undefined && (isNaN(platformPercentage) || platformPercentage < 0 || platformPercentage > 100)) {
      return res.json({ success: false, message: "Invalid platform percentage (must be between 0 and 100)" });
    }

    const updateData = {
      updatedAt: new Date()
    };

    if (consultationFee !== undefined) updateData.consultationFee = consultationFee;
    if (platformPercentage !== undefined) updateData.platformPercentage = platformPercentage;
    // Map backend holidayTheme to frontend isChristmasThemeActive
    if (isChristmasThemeActive !== undefined) updateData.holidayTheme = isChristmasThemeActive;

    console.log('Updating settings with:', updateData);

    const settings = await settingsModel.findOneAndUpdate(
      {},
      { $set: updateData },
      { new: true, upsert: true, setDefaultsOnInsert: true, strict: false }
    );

    console.log('Updated settings result:', settings);

    res.json({ success: true, message: "Settings updated successfully", settings });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get Pending Hospitals
const getPendingHospitals = async (req, res) => {
  try {
    const hospitals = await hospitalModel.find({ status: 'PENDING' })
      .sort({ createdAt: -1 });
    res.json({ success: true, hospitals });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get All Hospitals
const getAllHospitals = async (req, res) => {
  try {
    const hospitals = await hospitalModel.find()
      .sort({ createdAt: -1 });
    res.json({ success: true, hospitals });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Approve Hospital
const approveHospital = async (req, res) => {
  try {
    const { hospitalId } = req.params;

    const hospital = await hospitalModel.findById(hospitalId);
    if (!hospital) {
      return res.json({ success: false, message: "Hospital not found" });
    }

    if (hospital.status === 'APPROVED') {
      return res.json({ success: false, message: "Hospital already approved" });
    }

    // Set trial period (3 months from approval)
    const now = new Date();
    const trialEndsAt = new Date(now);
    trialEndsAt.setMonth(trialEndsAt.getMonth() + 3);

    hospital.status = 'APPROVED';
    hospital.approvedAt = now;
    hospital.trialEndsAt = trialEndsAt;
    hospital.trialPeriodActive = true;
    await hospital.save();

    res.json({ success: true, hospital, message: "Hospital approved successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Update Hospital Trial Period
const updateHospitalTrialPeriod = async (req, res) => {
  try {
    const { hospitalIds, action, months, days } = req.body;

    if (!hospitalIds || !Array.isArray(hospitalIds) || hospitalIds.length === 0) {
      return res.json({ success: false, message: 'Please select at least one hospital' });
    }

    if (!action || !['increase', 'decrease', 'remove'].includes(action)) {
      return res.json({ success: false, message: 'Invalid action. Must be increase, decrease, or remove' });
    }

    if (action !== 'remove' && months === 0 && days === 0) {
      return res.json({ success: false, message: 'Please specify months or days' });
    }

    const hospitals = await hospitalModel.find({ _id: { $in: hospitalIds } });

    if (hospitals.length === 0) {
      return res.json({ success: false, message: 'No hospitals found' });
    }

    const updatedHospitals = [];
    const now = new Date();

    for (const hospital of hospitals) {
      if (action === 'remove') {
        hospital.trialEndsAt = null;
        hospital.trialPeriodActive = false;
      } else {
        // Get current trial end date or use approvedAt/createdAt
        let currentTrialEnd = hospital.trialEndsAt ? new Date(hospital.trialEndsAt) : null;

        if (!currentTrialEnd) {
          // Calculate from approvedAt or createdAt
          const baseDate = hospital.approvedAt ? new Date(hospital.approvedAt) : new Date(hospital.createdAt);
          currentTrialEnd = new Date(baseDate);
          currentTrialEnd.setMonth(currentTrialEnd.getMonth() + 3);
        }

        // Apply changes
        const newTrialEnd = new Date(currentTrialEnd);

        if (action === 'increase') {
          newTrialEnd.setMonth(newTrialEnd.getMonth() + months);
          newTrialEnd.setDate(newTrialEnd.getDate() + days);
        } else if (action === 'decrease') {
          newTrialEnd.setMonth(newTrialEnd.getMonth() - months);
          newTrialEnd.setDate(newTrialEnd.getDate() - days);
        }

        hospital.trialEndsAt = newTrialEnd;
        hospital.trialPeriodActive = newTrialEnd > now;
      }

      await hospital.save();
      updatedHospitals.push(hospital);
    }

    const actionText = action === 'remove' ? 'removed' : action === 'increase' ? 'increased' : 'decreased';
    res.json({
      success: true,
      message: `Trial period ${actionText} for ${updatedHospitals.length} hospital(s)`,
      hospitals: updatedHospitals
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Reject Hospital
const rejectHospital = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { rejectionReason } = req.body;

    const hospital = await hospitalModel.findById(hospitalId);
    if (!hospital) {
      return res.json({ success: false, message: "Hospital not found" });
    }

    if (hospital.status === 'REJECTED') {
      return res.json({ success: false, message: "Hospital already rejected" });
    }

    hospital.status = 'REJECTED';
    hospital.rejectedAt = new Date();
    hospital.rejectionReason = rejectionReason || null;
    await hospital.save();

    res.json({ success: true, hospital, message: "Hospital rejected" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Appointment lead management
const getAppointmentRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const requests = await appointmentRequestModel
      .find(filter)
      .sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const updateAppointmentRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, adminNotes } = req.body || {};
    if (!requestId) {
      return res.json({ success: false, message: "Request id is required" });
    }
    const update = {};
    if (status) update.status = status;
    if (adminNotes !== undefined) update.adminNotes = adminNotes;
    const request = await appointmentRequestModel.findByIdAndUpdate(
      requestId,
      update,
      { new: true }
    );
    if (!request) {
      return res.json({ success: false, message: "Request not found" });
    }
    res.json({ success: true, message: "Request updated", request });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Contact messages
const getContactMessages = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const contacts = await contactMessageModel
      .find(filter)
      .sort({ createdAt: -1 });
    res.json({ success: true, contacts });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const updateContactMessageStatus = async (req, res) => {
  try {
    const { contactId } = req.params;
    const { status, adminNotes } = req.body || {};
    if (!contactId) {
      return res.json({ success: false, message: "Contact id is required" });
    }
    const update = {};
    if (status) update.status = status;
    if (adminNotes !== undefined) update.adminNotes = adminNotes;
    const contact = await contactMessageModel.findByIdAndUpdate(
      contactId,
      update,
      { new: true }
    );
    if (!contact) {
      return res.json({ success: false, message: "Contact not found" });
    }
    res.json({ success: true, message: "Contact updated", contact });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Newsletter subscribers
const getNewsletterSubscribers = async (req, res) => {
  try {
    const subscribers = await newsletterSubscriberModel
      .find({ unsubscribedAt: null })
      .sort({ createdAt: -1 });
    res.json({ success: true, subscribers });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get all user emails
const getAllUserEmails = async (req, res) => {
  try {
    // Get admin email to exclude from user list
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@rwandahealth.com';

    // Fetch users from all models
    const [patients, doctors, hospitalUsers, pharmacyUsers, labs] = await Promise.all([
      // Patients
      userModel.find({ email: { $ne: adminEmail } })
        .select('email name createdAt')
        .sort({ createdAt: -1 }),

      // Doctors
      doctorModel.find({ email: { $ne: adminEmail } })
        .select('email name gender date')
        .sort({ date: -1 }),

      // Hospital Users
      hospitalUserModel.find({ email: { $ne: adminEmail } })
        .select('email name createdAt')
        .sort({ createdAt: -1 }),

      // Pharmacy Users
      pharmacyUserModel.find({ email: { $ne: adminEmail } })
        .select('email name createdAt')
        .sort({ createdAt: -1 }),

      // Labs
      labModel.find({ email: { $ne: adminEmail } })
        .select('email name date')
        .sort({ date: -1 })
    ]);

    // Combine all users with type indicators
    const allUsers = [
      ...patients.map(user => ({ ...user.toObject(), type: 'patient' })),
      ...doctors.map(user => ({ ...user.toObject(), type: 'doctor', createdAt: user.date })),
      ...hospitalUsers.map(user => ({ ...user.toObject(), type: 'hospital' })),
      ...pharmacyUsers.map(user => ({ ...user.toObject(), type: 'pharmacy' })),
      ...labs.map(user => ({ ...user.toObject(), type: 'lab', createdAt: user.date }))
    ];

    // Sort by createdAt date (newest first)
    allUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, users: allUsers });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Send promotional email to selected recipients
const sendPromotionalEmail = async (req, res) => {
  try {
    const { subject, message, recipients } = req.body;

    if (!subject || !message || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.json({
        success: false,
        message: "Subject, message, and at least one recipient are required"
      });
    }

    const results = {
      sent: [],
      failed: []
    };

    for (const email of recipients) {
      try {
        if (!validator.isEmail(email)) {
          results.failed.push({ email, error: 'Invalid email address' });
          continue;
        }

        await sendEmail({
          to: email,
          subject: subject,
          html: message
        });

        results.sent.push(email);
      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
        results.failed.push({ email, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `Email sent to ${results.sent.length} recipients. ${results.failed.length} failed.`,
      results
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Announcement APIs
const createAnnouncement = async (req, res) => {
  try {
    const { title, message, isActive } = req.body;

    if (!title || !message) {
      return res.json({ success: false, message: "Title and message are required" });
    }

    const announcement = new announcementModel({
      title,
      message,
      isActive: isActive !== undefined ? isActive : true,
    });

    await announcement.save();
    res.json({ success: true, message: "Announcement created successfully", announcement });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await announcementModel.find({}).sort({ createdAt: -1 });
    res.json({ success: true, announcements });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const getActiveAnnouncements = async (req, res) => {
  try {
    const announcements = await announcementModel.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, announcements });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, isActive } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (message) updateData.message = message;
    if (isActive !== undefined) updateData.isActive = isActive;
    updateData.updatedAt = Date.now();

    const announcement = await announcementModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!announcement) {
      return res.json({ success: false, message: "Announcement not found" });
    }

    res.json({ success: true, message: "Announcement updated successfully", announcement });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await announcementModel.findByIdAndDelete(id);

    if (!announcement) {
      return res.json({ success: false, message: "Announcement not found" });
    }

    res.json({ success: true, message: "Announcement deleted successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Doctor Approval Management Functions

// Get doctor approvals list with filters
const getDoctorApprovals = async (req, res) => {
  try {
    const { status } = req.query; // 'pending', 'approved', 'rejected', or undefined for all

    const query = { deleted_at: null }; // Exclude soft-deleted doctors

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query.status = status;
    }

    // Only show private doctors for approval management (hospital doctors are auto-approved)
    query.registration_source = 'private';

    const doctors = await doctorModel.find(query)
      .select('-password')
      .sort({ date: -1 }); // Newest first

    res.json({ success: true, doctors });
  } catch (error) {
    console.error('Error getting doctor approvals:', error);
    res.json({ success: false, message: error.message });
  }
};

// Approve a doctor
const approveDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const doctor = await doctorModel.findById(id);
    if (!doctor) {
      return res.json({ success: false, message: 'Doctor not found' });
    }

    if (doctor.status === 'approved') {
      return res.json({ success: false, message: 'Doctor is already approved' });
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@rwandahealth.com';

    // Update doctor status
    doctor.status = 'approved';
    doctor.approved_by = adminEmail;
    doctor.approved_at = new Date();
    doctor.rejection_reason = null; // Clear any previous rejection reason
    await doctor.save();

    // Create audit log
    try {
      const doctorAuditLogModel = (await import('../models/doctorAuditLogModel.js')).default;
      await doctorAuditLogModel.create({
        admin_id: adminEmail,
        doctor_id: id,
        action: 'approve',
        metadata: { note: note || null }
      });
    } catch (auditError) {
      console.error('Error creating audit log:', auditError);
      // Don't fail the approval if audit log fails
    }

    // Send notification to doctor
    try {
      const { sendNotificationToDoctor } = await import('../services/notificationService.js');
      await sendNotificationToDoctor(
        id,
        'doctor_approved',
        'Your Account Has Been Approved',
        'Your E-ivuzeaccount has been approved. You can now log in and access your dashboard.'
      );
    } catch (notificationError) {
      console.error('Error sending notification to doctor:', notificationError);
      // Don't fail the approval if notification fails
    }

    res.json({ success: true, message: 'Doctor approved successfully', doctor });
  } catch (error) {
    console.error('Error approving doctor:', error);
    res.json({ success: false, message: error.message });
  }
};

// Reject a doctor
const rejectDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.json({ success: false, message: 'Rejection reason is required' });
    }

    const doctor = await doctorModel.findById(id);
    if (!doctor) {
      return res.json({ success: false, message: 'Doctor not found' });
    }

    if (doctor.status === 'rejected') {
      return res.json({ success: false, message: 'Doctor is already rejected' });
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@rwandahealth.com';

    // Update doctor status
    doctor.status = 'rejected';
    doctor.rejection_reason = reason.trim();
    doctor.approved_by = null;
    doctor.approved_at = null;
    await doctor.save();

    // Create audit log
    try {
      const doctorAuditLogModel = (await import('../models/doctorAuditLogModel.js')).default;
      await doctorAuditLogModel.create({
        admin_id: adminEmail,
        doctor_id: id,
        action: 'reject',
        metadata: { reason: reason.trim() }
      });
    } catch (auditError) {
      console.error('Error creating audit log:', auditError);
      // Don't fail the rejection if audit log fails
    }

    // Send notification to doctor
    try {
      const { sendNotificationToDoctor } = await import('../services/notificationService.js');
      await sendNotificationToDoctor(
        id,
        'doctor_rejected',
        'Your Account Registration Has Been Rejected',
        `Your E-ivuzeaccount registration has been rejected.\n\nReason: ${reason.trim()}\n\nIf you have any questions, please contact support.`
      );
    } catch (notificationError) {
      console.error('Error sending notification to doctor:', notificationError);
      // Don't fail the rejection if notification fails
    }

    res.json({ success: true, message: 'Doctor rejected successfully', doctor });
  } catch (error) {
    console.error('Error rejecting doctor:', error);
    res.json({ success: false, message: error.message });
  }
};

// Update a doctor (admin can update any doctor)
const updateDoctorApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, speciality, degree, licenseNumber, experience, about, address, available, fees } = req.body;
    const imageFile = req.file;

    const doctor = await doctorModel.findById(id);
    if (!doctor) {
      return res.json({ success: false, message: 'Doctor not found' });
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@rwandahealth.com';
    const updateData = {};
    const metadata = {};

    if (name !== undefined) {
      updateData.name = name.trim();
      metadata.name = name.trim();
    }
    if (email !== undefined) {
      updateData.email = email.trim().toLowerCase();
      metadata.email = email.trim().toLowerCase();
    }
    if (speciality !== undefined) updateData.speciality = speciality.trim();
    if (degree !== undefined) updateData.degree = degree.trim();
    if (licenseNumber !== undefined) {
      // Check if license number is being changed and if new one exists
      if (licenseNumber.trim() !== doctor.licenseNumber) {
        const existingLicense = await doctorModel.findOne({ licenseNumber: licenseNumber.trim() });
        if (existingLicense) {
          return res.json({ success: false, message: 'License number already exists' });
        }
      }
      updateData.licenseNumber = licenseNumber.trim();
    }
    if (experience !== undefined) updateData.experience = experience.trim();
    if (about !== undefined) updateData.about = about.trim();
    if (address !== undefined) {
      try {
        updateData.address = typeof address === 'string' ? JSON.parse(address) : address;
      } catch (e) {
        return res.json({ success: false, message: 'Invalid address format' });
      }
    }
    if (available !== undefined) updateData.available = available === true || available === 'true';
    if (fees !== undefined) {
      const feesNum = Number(fees);
      if (!isNaN(feesNum) && feesNum >= 0) {
        updateData.fees = feesNum;
      }
    }

    // Handle image upload if provided
    if (imageFile) {
      try {
        const { v2: cloudinary } = await import('cloudinary');
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
          folder: 'doctor_profiles',
          resource_type: 'image'
        });
        updateData.image = imageUpload.secure_url;
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.json({ success: false, message: 'Failed to upload image' });
      }
    }

    await doctorModel.findByIdAndUpdate(id, updateData);

    // Create audit log
    try {
      const doctorAuditLogModel = (await import('../models/doctorAuditLogModel.js')).default;
      await doctorAuditLogModel.create({
        admin_id: adminEmail,
        doctor_id: id,
        action: 'update',
        metadata: metadata
      });
    } catch (auditError) {
      console.error('Error creating audit log:', auditError);
      // Don't fail the update if audit log fails
    }

    const updatedDoctor = await doctorModel.findById(id).select('-password');
    res.json({ success: true, message: 'Doctor updated successfully', doctor: updatedDoctor });
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.json({ success: false, message: error.message });
  }
};

// Delete a doctor (soft delete by default)
const deleteDoctorApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { hard } = req.query; // Query param: ?hard=true for hard delete

    const doctor = await doctorModel.findById(id);
    if (!doctor) {
      return res.json({ success: false, message: 'Doctor not found' });
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@rwandahealth.com';

    if (hard === 'true') {
      // Hard delete
      await doctorModel.findByIdAndDelete(id);
    } else {
      // Soft delete
      doctor.deleted_at = new Date();
      await doctor.save();
    }

    // Create audit log
    try {
      const doctorAuditLogModel = (await import('../models/doctorAuditLogModel.js')).default;
      await doctorAuditLogModel.create({
        admin_id: adminEmail,
        doctor_id: id,
        action: 'delete',
        metadata: { hardDelete: hard === 'true' }
      });
    } catch (auditError) {
      console.error('Error creating audit log:', auditError);
      // Don't fail the delete if audit log fails
    }

    res.json({
      success: true,
      message: hard === 'true' ? 'Doctor permanently deleted' : 'Doctor deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.json({ success: false, message: error.message });
  }
};

export {
  updateHospitalTrialPeriod,
  addDoctor,
  updateDoctor,
  deleteDoctor,
  loginAdmin,
  allDoctors,
  appointmentsAdmin,
  appointmentCancel,
  adminDashboard,
  getSettings,
  updateSettings,
  getPendingHospitals,
  getAllHospitals,
  approveHospital,
  rejectHospital,
  getAppointmentRequests,
  updateAppointmentRequestStatus,
  getContactMessages,
  updateContactMessageStatus,
  getNewsletterSubscribers,
  getAllUserEmails,
  sendPromotionalEmail,
  createAnnouncement,
  getAllAnnouncements,
  getActiveAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
  getAllUsers,
  createUserAdmin,
  updateUserAdmin,
  deleteUserAdmin,
  exportUsersCsvAdmin,
  importUsersCsvAdmin,
  getDoctorApprovals,
  approveDoctor,
  rejectDoctor,
  updateDoctorApproval,
  deleteDoctorApproval
};
