import pharmacyModel from '../models/pharmacyModel.js';
import pharmacyUserModel from '../models/pharmacyUserModel.js';
import medicationModel from '../models/medicationModel.js';
import pharmacyOrderModel from '../models/pharmacyOrderModel.js';
import impersonationLogModel from '../models/impersonationLogModel.js';
import userModel from '../models/userModel.js';
import doctorModel from '../models/doctorModel.js';
import hospitalUserModel from '../models/hospitalUserModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendEmail } from '../utils/emailService.js';

// Accept invitation and create pharmacy user
export const acceptInvitation = async (req, res) => {
  try {
    const { token, name, password, acceptTOS, acceptPrivacy } = req.body;

    if (!token || !name || !password || !acceptTOS || !acceptPrivacy) {
      return res.json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Find pharmacy by invitation token
    const pharmacy = await pharmacyModel.findOne({ 
      invitationToken: token,
      invitationAccepted: false
    });

    if (!pharmacy) {
      return res.json({ 
        success: false, 
        message: 'Invalid or expired invitation token' 
      });
    }

    // Check token expiry
    if (new Date() > pharmacy.invitationTokenExpiry) {
      return res.json({ 
        success: false, 
        message: 'Invitation token has expired' 
      });
    }

    // Check if user already exists
    const existingUser = await pharmacyUserModel.findOne({ 
      email: pharmacy.email 
    });

    if (existingUser) {
      return res.json({ 
        success: false, 
        message: 'Pharmacy user already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create pharmacy user
    const pharmacyUser = new pharmacyUserModel({
      name,
      email: pharmacy.email,
      password: hashedPassword,
      pharmacyId: pharmacy._id,
      role: 'pharmacy_admin',
      mustChangePassword: false
    });

    await pharmacyUser.save();

    // Mark invitation as accepted
    pharmacy.invitationAccepted = true;
    pharmacy.invitationToken = null;
    pharmacy.invitationTokenExpiry = null;
    await pharmacy.save();

    // Generate JWT token
    const jwtToken = jwt.sign(
      { id: pharmacyUser._id, email: pharmacyUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: 'Pharmacy account created successfully',
      token: jwtToken,
      user: {
        _id: pharmacyUser._id,
        name: pharmacyUser.name,
        email: pharmacyUser.email,
        pharmacyId: pharmacy._id,
        role: pharmacyUser.role
      }
    });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.json({ success: false, message: error.message });
  }
};

// Pharmacy login
export const loginPharmacy = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({ success: false, message: 'Email and password required' });
    }

    const pharmacyUser = await pharmacyUserModel.findOne({ email })
      .populate('pharmacyId');

    if (!pharmacyUser) {
      return res.json({ success: false, message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, pharmacyUser.password);
    if (!isPasswordValid) {
      return res.json({ success: false, message: 'Invalid credentials' });
    }

    // Check if pharmacy is verified
    if (!pharmacyUser.pharmacyId.verified) {
      return res.json({ 
        success: false, 
        message: 'Pharmacy account is pending verification' 
      });
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { id: pharmacyUser._id, email: pharmacyUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token: jwtToken,
      user: {
        _id: pharmacyUser._id,
        name: pharmacyUser.name,
        email: pharmacyUser.email,
        pharmacyId: pharmacyUser.pharmacyId._id,
        pharmacyName: pharmacyUser.pharmacyId.name,
        role: pharmacyUser.role
      }
    });
  } catch (error) {
    console.error('Pharmacy login error:', error);
    res.json({ success: false, message: error.message });
  }
};

// Get pharmacy dashboard data
export const getDashboard = async (req, res) => {
  try {
    const pharmacyId = req.body.pharmacyId;

    // Get statistics
    const totalOrders = await pharmacyOrderModel.countDocuments({ pharmacyId });
    const pendingOrders = await pharmacyOrderModel.countDocuments({ 
      pharmacyId, 
      orderStatus: 'Pending' 
    });
    const totalMedications = await medicationModel.countDocuments({ pharmacyId });
    const lowStockMedications = await medicationModel.countDocuments({
      pharmacyId,
      stock: { $lt: 10 }
    });

    // Get recent orders
    const recentOrders = await pharmacyOrderModel.find({ pharmacyId })
      .populate('patientId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      dashboard: {
        totalOrders,
        pendingOrders,
        totalMedications,
        lowStockMedications,
        recentOrders
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.json({ success: false, message: error.message });
  }
};

// Get pharmacy profile
export const getProfile = async (req, res) => {
  try {
    const pharmacyId = req.body.pharmacyId;
    const pharmacy = await pharmacyModel.findById(pharmacyId);

    if (!pharmacy) {
      return res.json({ success: false, message: 'Pharmacy not found' });
    }

    res.json({ success: true, pharmacy });
  } catch (error) {
    console.error('Get profile error:', error);
    res.json({ success: false, message: error.message });
  }
};

// Update pharmacy profile
export const updateProfile = async (req, res) => {
  try {
    const pharmacyId = req.body.pharmacyId;
    const { name, phone, address } = req.body;

    const pharmacy = await pharmacyModel.findById(pharmacyId);
    if (!pharmacy) {
      return res.json({ success: false, message: 'Pharmacy not found' });
    }

    if (name) pharmacy.name = name;
    if (phone) pharmacy.phone = phone;
    if (address) pharmacy.address = address;
    pharmacy.updatedAt = new Date();

    await pharmacy.save();

    res.json({ success: true, message: 'Profile updated', pharmacy });
  } catch (error) {
    console.error('Update profile error:', error);
    res.json({ success: false, message: error.message });
  }
};

// Start impersonation
export const startImpersonation = async (req, res) => {
  try {
    const { impersonatedUserId, impersonatedUserType } = req.body;
    const impersonatorId = req.body.pharmacyUserId;
    const pharmacyId = req.body.pharmacyId;
    const ip = req.ip || req.connection.remoteAddress;

    // Check if pharmacy has impersonation permission
    const pharmacy = await pharmacyModel.findById(pharmacyId);
    if (!pharmacy || !pharmacy.settings.can_impersonate) {
      return res.json({ 
        success: false, 
        message: 'Impersonation not allowed for this pharmacy' 
      });
    }

    // Validate user type and get user
    let user = null;
    if (impersonatedUserType === 'user') {
      user = await userModel.findById(impersonatedUserId);
    } else if (impersonatedUserType === 'doctor') {
      user = await doctorModel.findById(impersonatedUserId);
    } else if (impersonatedUserType === 'hospital') {
      user = await hospitalUserModel.findById(impersonatedUserId);
    } else {
      return res.json({ success: false, message: 'Invalid user type' });
    }

    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    // Create impersonation log
    const impersonationLog = new impersonationLogModel({
      impersonatorId,
      impersonatedUserId,
      impersonatedUserType,
      startAt: new Date(),
      ip
    });

    await impersonationLog.save();

    // Generate impersonation token (short-lived, 1 hour)
    const impersonationToken = jwt.sign(
      { 
        id: impersonatedUserId, 
        type: impersonatedUserType,
        impersonatorId,
        impersonationLogId: impersonationLog._id,
        isImpersonation: true
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      message: 'Impersonation started',
      token: impersonationToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        type: impersonatedUserType
      },
      impersonationLogId: impersonationLog._id
    });
  } catch (error) {
    console.error('Start impersonation error:', error);
    res.json({ success: false, message: error.message });
  }
};

// Stop impersonation
export const stopImpersonation = async (req, res) => {
  try {
    const { impersonationLogId } = req.body;

    const impersonationLog = await impersonationLogModel.findById(impersonationLogId);
    if (!impersonationLog || impersonationLog.endAt) {
      return res.json({ success: false, message: 'Invalid impersonation session' });
    }

    impersonationLog.endAt = new Date();
    await impersonationLog.save();

    res.json({ success: true, message: 'Impersonation stopped' });
  } catch (error) {
    console.error('Stop impersonation error:', error);
    res.json({ success: false, message: error.message });
  }
};

// Public: list approved pharmacies for patients
export const listApprovedPharmacies = async (req, res) => {
  try {
    const pharmacies = await pharmacyModel
      .find({ status: 'APPROVED', verified: true })
      .select('name phone address licenseNumber')
      .sort({ name: 1 });

    res.json({ success: true, pharmacies });
  } catch (error) {
    console.error('List approved pharmacies error:', error);
    res.json({ success: false, message: error.message });
  }
};

