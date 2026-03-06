import hospitalPaymentModel from '../models/hospitalPaymentModel.js';
import hospitalModel from '../models/hospitalModel.js';
import hospitalUserModel from '../models/hospitalUserModel.js';
import { v2 as cloudinary } from 'cloudinary';
import connectCloudinary from '../config/cloudinary.js';
import { sendEmail } from '../utils/emailService.js';

// Ensure Cloudinary is configured
connectCloudinary();

// Plan pricing (in RWF)
const PLAN_PRICES = {
  basic: { monthly: 50000, yearly: 500000 },
  premium: { monthly: 100000, yearly: 1000000 },
  enterprise: { monthly: 200000, yearly: 2000000 }
};

// Generate payment code for hospital subscription
const generateHospitalPaymentCode = (hospitalId) => {
  const code = hospitalId.toString().slice(-9);
  return `*182*1*1*${code}#`;
};

// Create hospital payment request
export const createHospitalPaymentRequest = async (req, res) => {
  try {
    const { planType, billingPeriod } = req.body;
    const hospitalId = req.hospitalId;

    if (!planType || !billingPeriod) {
      return res.json({ success: false, message: 'Plan type and billing period are required' });
    }

    if (!['basic', 'premium', 'enterprise'].includes(planType)) {
      return res.json({ success: false, message: 'Invalid plan type' });
    }

    if (!['monthly', 'yearly'].includes(billingPeriod)) {
      return res.json({ success: false, message: 'Invalid billing period' });
    }

    // Get hospital details
    const hospital = await hospitalModel.findById(hospitalId);
    if (!hospital) {
      return res.json({ success: false, message: 'Hospital not found' });
    }

    // Check if hospital is approved
    if (hospital.status !== 'APPROVED') {
      return res.json({ success: false, message: 'Hospital must be approved to subscribe to a plan' });
    }

    // Calculate amount
    const amount = PLAN_PRICES[planType][billingPeriod];

    // Check if there's a pending payment
    const existingPending = await hospitalPaymentModel.findOne({
      hospitalId,
      status: 'pending'
    });

    if (existingPending) {
      return res.json({
        success: true,
        message: 'Payment request already exists',
        payment: existingPending
      });
    }

    // Generate payment code
    const paymentCode = generateHospitalPaymentCode(hospitalId);

    // Create payment request
    const paymentData = {
      hospitalId,
      planType,
      billingPeriod,
      amount,
      paymentCode,
      status: 'pending'
    };

    const newPayment = new hospitalPaymentModel(paymentData);
    const savedPayment = await newPayment.save();

    // Don't send email here - email will be sent when payment proof is uploaded

    res.json({
      success: true,
      message: 'Payment request created successfully',
      payment: savedPayment
    });

  } catch (error) {
    console.error('Error creating hospital payment request:', error);
    res.json({ success: false, message: error.message });
  }
};

// Upload hospital payment proof
export const uploadHospitalPaymentProof = async (req, res) => {
  try {
    const { paymentId } = req.body;
    const hospitalId = req.hospitalId;

    if (!paymentId) {
      return res.json({ success: false, message: 'Payment ID is required' });
    }

    if (!req.file) {
      return res.json({ success: false, message: 'Payment proof image is required' });
    }

    // Find payment
    const payment = await hospitalPaymentModel.findById(paymentId);
    if (!payment) {
      return res.json({ success: false, message: 'Payment not found' });
    }

    // Verify hospital owns this payment
    if (payment.hospitalId.toString() !== hospitalId) {
      return res.json({ success: false, message: 'Unauthorized access' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'hospital-payments',
      resource_type: 'image'
    });

    // Update payment with proof
    payment.paymentProof = result.secure_url;
    payment.updatedAt = new Date();
    await payment.save();

    // Send email notification to admin
    const hospital = await hospitalModel.findById(hospitalId);
    const hospitalUser = await hospitalUserModel.findOne({ hospitalId, role: 'admin' });

    if (hospital && hospitalUser) {
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0ea5f7; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .info { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #0ea5f7; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Hospital Payment Proof Submitted</h1>
            </div>
            <div class="content">
              <p>Hello Admin,</p>
              <p><strong>${hospital.name}</strong> has submitted payment proof for their subscription.</p>
              
              <div class="info">
                <h3 style="margin-top: 0; color: #0ea5f7;">Payment Details:</h3>
                <p><strong>Hospital:</strong> ${hospital.name}</p>
                <p><strong>Plan:</strong> ${payment.planType.charAt(0).toUpperCase() + payment.planType.slice(1)} (${payment.billingPeriod})</p>
                <p><strong>Amount:</strong> RWF ${payment.amount.toLocaleString()}</p>
                <p><strong>Payment Code:</strong> ${payment.paymentCode}</p>
                <p><strong>Submitted By:</strong> ${hospitalUser.name} (${hospitalUser.email})</p>
              </div>
              
              <p>Please review and approve the payment in the admin dashboard.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} E-ivuzeConnect. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Send to admin (you may want to get admin email from settings)
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@E-ivuze.com';
      sendEmail({
        to: adminEmail,
        subject: `Hospital Payment Proof Submitted - ${hospital.name}`,
        html: emailHtml
      }).catch(err => {
        console.error('Error sending admin notification email:', err);
      });
    }

    res.json({
      success: true,
      message: 'Payment proof uploaded successfully. Waiting for admin approval.',
      payment
    });

  } catch (error) {
    console.error('Error uploading hospital payment proof:', error);
    res.json({ success: false, message: error.message });
  }
};

// Get hospital payments
export const getHospitalPayments = async (req, res) => {
  try {
    const hospitalId = req.hospitalId;

    const payments = await hospitalPaymentModel.find({ hospitalId })
      .sort({ createdAt: -1 });

    res.json({ success: true, payments });

  } catch (error) {
    console.error('Error getting hospital payments:', error);
    res.json({ success: false, message: error.message });
  }
};

// Get all pending hospital payments (Admin)
export const getAllPendingHospitalPayments = async (req, res) => {
  try {
    const payments = await hospitalPaymentModel.find({ status: 'pending' })
      .sort({ createdAt: -1 });

    // Manually populate hospital data to ensure it's always available
    const hospitalModel = (await import('../models/hospitalModel.js')).default;
    const populatedPayments = await Promise.all(
      payments.map(async (payment) => {
        const hospital = await hospitalModel.findById(payment.hospitalId)
          .select('name address phone adminUser')
          .populate('adminUser', 'name email')
          .catch(() => null);

        return {
          ...payment.toObject(),
          hospitalId: hospital ? {
            _id: hospital._id,
            name: hospital.name || 'Hospital',
            address: hospital.address,
            phone: hospital.phone,
            adminUser: hospital.adminUser ? {
              name: hospital.adminUser.name,
              email: hospital.adminUser.email
            } : null
          } : {
            _id: payment.hospitalId,
            name: 'Hospital Account',
            address: null,
            phone: null,
            adminUser: null
          }
        };
      })
    );

    res.json({ success: true, payments: populatedPayments });

  } catch (error) {
    console.error('Error getting pending hospital payments:', error);
    res.json({ success: false, message: error.message });
  }
};

// Approve hospital payment (Admin)
export const approveHospitalPayment = async (req, res) => {
  try {
    const { paymentId, adminNotes } = req.body;

    if (!paymentId) {
      return res.json({ success: false, message: 'Payment ID is required' });
    }

    const payment = await hospitalPaymentModel.findById(paymentId)
      .populate('hospitalId');

    if (!payment) {
      return res.json({ success: false, message: 'Payment not found' });
    }

    // Update payment status
    payment.status = 'approved';
    payment.adminNotes = adminNotes || '';
    payment.approvedAt = new Date();
    payment.updatedAt = new Date();

    // Calculate expiry date
    const now = new Date();
    if (payment.billingPeriod === 'monthly') {
      payment.expiresAt = new Date(now.setMonth(now.getMonth() + 1));
    } else {
      payment.expiresAt = new Date(now.setFullYear(now.getFullYear() + 1));
    }

    await payment.save();

    // Update hospital with subscription info
    const hospital = await hospitalModel.findById(payment.hospitalId._id);
    if (hospital) {
      hospital.subscriptionPlan = payment.planType;
      hospital.subscriptionExpiresAt = payment.expiresAt;
      await hospital.save();
    }

    // Send email notification to hospital
    const hospitalUser = await hospitalUserModel.findOne({
      hospitalId: payment.hospitalId._id,
      role: 'admin'
    });

    if (hospitalUser && hospital) {
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .success { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #10b981; }
            .button { display: inline-block; background: #0ea5f7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Payment Approved</h1>
            </div>
            <div class="content">
              <p>Hello ${hospitalUser.name},</p>
              <p>Great news! Your subscription payment for <strong>${hospital.name}</strong> has been approved.</p>
              
              <div class="success">
                <h3 style="margin-top: 0; color: #10b981;">Subscription Activated:</h3>
                <p><strong>Plan:</strong> ${payment.planType.charAt(0).toUpperCase() + payment.planType.slice(1)} (${payment.billingPeriod})</p>
                <p><strong>Amount Paid:</strong> RWF ${payment.amount.toLocaleString()}</p>
                <p><strong>Expires On:</strong> ${new Date(payment.expiresAt).toLocaleDateString()}</p>
              </div>
              
              <p>Your subscription is now active. You can continue using all features of your plan.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} E-ivuzeConnect. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      sendEmail({
        to: hospitalUser.email,
        subject: `Payment Approved - ${hospital.name}`,
        html: emailHtml
      }).catch(err => {
        console.error('Error sending approval email:', err);
      });
    }

    res.json({
      success: true,
      message: 'Payment approved successfully',
      payment
    });

  } catch (error) {
    console.error('Error approving hospital payment:', error);
    res.json({ success: false, message: error.message });
  }
};

// Reject hospital payment (Admin)
export const rejectHospitalPayment = async (req, res) => {
  try {
    const { paymentId, adminNotes } = req.body;

    if (!paymentId) {
      return res.json({ success: false, message: 'Payment ID is required' });
    }

    if (!adminNotes || !adminNotes.trim()) {
      return res.json({ success: false, message: 'Admin notes are required for rejection' });
    }

    const payment = await hospitalPaymentModel.findById(paymentId)
      .populate('hospitalId');

    if (!payment) {
      return res.json({ success: false, message: 'Payment not found' });
    }

    // Update payment status
    payment.status = 'rejected';
    payment.adminNotes = adminNotes;
    payment.rejectedAt = new Date();
    payment.updatedAt = new Date();
    await payment.save();

    // Send email notification to hospital
    const hospitalUser = await hospitalUserModel.findOne({
      hospitalId: payment.hospitalId._id,
      role: 'admin'
    });

    if (hospitalUser && payment.hospitalId) {
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .rejection { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ef4444; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Rejected</h1>
            </div>
            <div class="content">
              <p>Hello ${hospitalUser.name},</p>
              <p>Unfortunately, your subscription payment for <strong>${payment.hospitalId.name}</strong> has been rejected.</p>
              
              <div class="rejection">
                <h3 style="margin-top: 0; color: #ef4444;">Rejection Reason:</h3>
                <p>${adminNotes}</p>
              </div>
              
              <p>Please review the reason above and resubmit your payment with the correct information.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} E-ivuzeConnect. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      sendEmail({
        to: hospitalUser.email,
        subject: `Payment Rejected - ${payment.hospitalId.name}`,
        html: emailHtml
      }).catch(err => {
        console.error('Error sending rejection email:', err);
      });
    }

    res.json({
      success: true,
      message: 'Payment rejected',
      payment
    });

  } catch (error) {
    console.error('Error rejecting hospital payment:', error);
    res.json({ success: false, message: error.message });
  }
};

