import pharmacyModel from '../models/pharmacyModel.js';
import pharmacyUserModel from '../models/pharmacyUserModel.js';
import { sendEmail, getPharmacyInvitationEmailEN, getPharmacyInvitationEmailRW, getCommonEmailTemplate } from '../utils/emailService.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

// Create pharmacy and send invitation
export const createPharmacy = async (req, res) => {
  try {
    const { name, email, phone, address, licenseNumber, deliveryZones, managerName, managerPassword } = req.body;
    // Admin is authenticated via authAdmin middleware
    const adminId = req.body.adminId || req.adminId;

    // Validate required fields
    if (!name || !email || !phone || !address || !licenseNumber || !managerName || !managerPassword) {
      return res.json({ success: false, message: 'Missing required fields. Pharmacy name, email, phone, address, license, manager name, and manager password are all required.' });
    }

    // Validate password strength
    if (managerPassword.length < 6) {
      return res.json({ success: false, message: 'Manager password must be at least 6 characters long' });
    }

    // Parse address if it's a string
    let addressObj = {};
    if (typeof address === 'string') {
      try {
        addressObj = JSON.parse(address);
      } catch (e) {
        addressObj = { line1: address, line2: '', city: 'Kigali', country: 'Rwanda' };
      }
    } else {
      addressObj = address;
    }

    // Ensure required address fields
    if (!addressObj.line1) addressObj.line1 = '';
    if (!addressObj.city) addressObj.city = 'Kigali';
    if (!addressObj.country) addressObj.country = 'Rwanda';

    // Parse and validate deliveryZones
    let deliveryZonesArray = [];
    if (deliveryZones) {
      if (typeof deliveryZones === 'string') {
        try {
          deliveryZonesArray = JSON.parse(deliveryZones);
        } catch (e) {
          deliveryZonesArray = [];
        }
      } else if (Array.isArray(deliveryZones)) {
        deliveryZonesArray = deliveryZones;
      }
    }

    // Validate each delivery zone has required fields
    deliveryZonesArray = deliveryZonesArray.map(zone => ({
      zoneName: zone.zoneName || 'Default Zone',
      fee: Number(zone.fee) || 0,
      eta: Number(zone.eta) || 2
    }));

    // Check if pharmacy already exists
    const existingPharmacy = await pharmacyModel.findOne({
      $or: [{ email }, { licenseNumber }]
    });

    if (existingPharmacy) {
      return res.json({
        success: false,
        message: 'Pharmacy with this email or license number already exists'
      });
    }

    // Generate secure invitation token
    const invitationToken = crypto.randomBytes(32).toString('hex');
    const invitationTokenExpiry = new Date();
    invitationTokenExpiry.setHours(invitationTokenExpiry.getHours() + 72); // 72 hours expiry

    // Generate temporary password
    const tempPassword = crypto.randomBytes(8).toString('hex');

    // Create pharmacy
    const newPharmacy = new pharmacyModel({
      name,
      email,
      phone,
      address: addressObj,
      licenseNumber,
      deliveryZones: deliveryZonesArray,
      createdByAdminId: adminId,
      invitationToken,
      invitationTokenExpiry,
      invitationAccepted: false
    });

    await newPharmacy.save();

    // Hash manager password
    const hashedPassword = await bcrypt.hash(managerPassword, 10);

    // Create pharmacy manager user
    const pharmacyUser = new pharmacyUserModel({
      name: managerName,
      email: email, // Use pharmacy email or separate manager email if provided
      password: hashedPassword,
      pharmacyId: newPharmacy._id,
      role: 'pharmacy_admin',
      mustChangePassword: false
    });

    await pharmacyUser.save();

    // Create invitation link
    const baseUrl = process.env.FRONTEND_URL || 'https://E-ivuze.com';
    const invitationLink = `${baseUrl}/pharmacy-invite?token=${invitationToken}`;

    // Send invitation email (try both languages)
    const emailLang = req.body.language || 'en';
    const emailHtml = emailLang === 'rw'
      ? getPharmacyInvitationEmailRW(name, invitationLink, tempPassword)
      : getPharmacyInvitationEmailEN(name, invitationLink, tempPassword);

    const emailResult = await sendEmail({
      to: email,
      subject: emailLang === 'rw'
        ? 'Gutanga Icyifuzo cy\'Umutekano - One Healthline Connect'
        : 'Pharmacy Invitation - One Healthline Connect',
      html: emailHtml
    });

    if (!emailResult.success) {
      console.warn('⚠️ Failed to send invitation email:', emailResult.message);
      // Continue anyway - admin can resend invitation
    }

    res.json({
      success: true,
      message: 'Pharmacy and manager created successfully',
      pharmacy: newPharmacy,
      manager: {
        name: managerName,
        email: email,
        password: managerPassword // Send back so admin can see credentials
      },
      invitationLink
    });
  } catch (error) {
    console.error('Create pharmacy error:', error);
    res.json({ success: false, message: error.message });
  }
};

// Get all pharmacies
export const getAllPharmacies = async (req, res) => {
  try {
    const pharmacies = await pharmacyModel.find()
      .populate('createdByAdminId', 'email')
      .sort({ createdAt: -1 });

    res.json({ success: true, pharmacies });
  } catch (error) {
    console.error('Get pharmacies error:', error);
    res.json({ success: false, message: error.message });
  }
};

// Get single pharmacy
export const getPharmacy = async (req, res) => {
  try {
    const { id } = req.params;
    const pharmacy = await pharmacyModel.findById(id)
      .populate('createdByAdminId', 'email');

    if (!pharmacy) {
      return res.json({ success: false, message: 'Pharmacy not found' });
    }

    res.json({ success: true, pharmacy });
  } catch (error) {
    console.error('Get pharmacy error:', error);
    res.json({ success: false, message: error.message });
  }
};

// Update pharmacy
export const updatePharmacy = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, address, deliveryZones, settings } = req.body;

    const pharmacy = await pharmacyModel.findById(id);
    if (!pharmacy) {
      return res.json({ success: false, message: 'Pharmacy not found' });
    }

    if (name) pharmacy.name = name;
    if (phone) pharmacy.phone = phone;
    if (address) pharmacy.address = address;
    if (deliveryZones) pharmacy.deliveryZones = deliveryZones;
    if (settings) {
      pharmacy.settings = { ...pharmacy.settings, ...settings };
    }
    pharmacy.updatedAt = new Date();

    await pharmacy.save();

    res.json({ success: true, message: 'Pharmacy updated', pharmacy });
  } catch (error) {
    console.error('Update pharmacy error:', error);
    res.json({ success: false, message: error.message });
  }
};

// Resend invitation
export const resendInvitation = async (req, res) => {
  try {
    const { id } = req.params;
    const pharmacy = await pharmacyModel.findById(id);

    if (!pharmacy) {
      return res.json({ success: false, message: 'Pharmacy not found' });
    }

    if (pharmacy.invitationAccepted) {
      return res.json({ success: false, message: 'Pharmacy has already accepted invitation' });
    }

    // Generate new token
    const invitationToken = crypto.randomBytes(32).toString('hex');
    const invitationTokenExpiry = new Date();
    invitationTokenExpiry.setHours(invitationTokenExpiry.getHours() + 72);

    pharmacy.invitationToken = invitationToken;
    pharmacy.invitationTokenExpiry = invitationTokenExpiry;
    await pharmacy.save();

    const baseUrl = process.env.FRONTEND_URL || 'https://E-ivuze.com';
    const invitationLink = `${baseUrl}/pharmacy-invite?token=${invitationToken}`;

    const emailLang = req.body.language || 'en';
    const emailHtml = emailLang === 'rw'
      ? getPharmacyInvitationEmailRW(pharmacy.name, invitationLink)
      : getPharmacyInvitationEmailEN(pharmacy.name, invitationLink);

    const emailResult = await sendEmail({
      to: pharmacy.email,
      subject: emailLang === 'rw'
        ? 'Gutanga Icyifuzo cy\'Umutekano - One Healthline Connect'
        : 'Pharmacy Invitation - One Healthline Connect',
      html: emailHtml
    });

    res.json({
      success: emailResult.success,
      message: emailResult.success ? 'Invitation resent' : 'Failed to send email',
      invitationLink
    });
  } catch (error) {
    console.error('Resend invitation error:', error);
    res.json({ success: false, message: error.message });
  }
};

// Approve pharmacy
export const approvePharmacy = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const pharmacy = await pharmacyModel.findByIdAndUpdate(
      id,
      {
        verified: true,
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedByAdminId: req.adminId,
        adminNotes: adminNotes || ''
      },
      { new: true }
    );

    if (!pharmacy) {
      return res.json({ success: false, message: 'Pharmacy not found' });
    }

    // Send approval email to pharmacy
    const dashboardLink = process.env.VITE_FRONTEND_URL ? `${process.env.VITE_FRONTEND_URL}/pharmacy-login` : "https://E-ivuze.com/pharmacy-login";
    const approvalEmailHTML = getCommonEmailTemplate(
      "Pharmacy Approved!",
      `Dear <strong>${pharmacy.name}</strong>,<br><br>Your pharmacy has been verified and approved by the One Healthline Connect admin team.<br><br>You can now manage your inventory, process orders, and view reports.`,
      "Login to Dashboard",
      dashboardLink
    );

    await sendEmail({
      to: pharmacy.email,
      subject: 'Pharmacy Approved - One Healthline Connect',
      html: approvalEmailHTML
    });

    res.json({ success: true, message: 'Pharmacy approved successfully', pharmacy });
  } catch (error) {
    console.error('Approve pharmacy error:', error);
    res.json({ success: false, message: error.message });
  }
};

// Reject pharmacy
export const rejectPharmacy = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.json({ success: false, message: 'Rejection reason is required' });
    }

    const pharmacy = await pharmacyModel.findByIdAndUpdate(
      id,
      {
        verified: false,
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectedByAdminId: req.adminId,
        rejectionReason: reason
      },
      { new: true }
    );

    if (!pharmacy) {
      return res.json({ success: false, message: 'Pharmacy not found' });
    }

    // Send rejection email to pharmacy
    const rejectionEmailHTML = getCommonEmailTemplate(
      "Pharmacy Application Update",
      `Dear <strong>${pharmacy.name}</strong>,<br><br>Thank you for submitting your pharmacy for verification. Unfortunately, your application has been reviewed and was not approved at this time.<br><br><strong>Reason for Rejection:</strong><br>${reason}<br><br>Please review the feedback and feel free to reapply.`,
      null,
      null
    );

    await sendEmail({
      to: pharmacy.email,
      subject: 'Pharmacy Application Status - One Healthline Connect',
      html: rejectionEmailHTML
    });

    res.json({ success: true, message: 'Pharmacy rejected and notification sent', pharmacy });
  } catch (error) {
    console.error('Reject pharmacy error:', error);
    res.json({ success: false, message: error.message });
  }
};

