import paymentModel from '../models/paymentModel.js';
import appointmentModel from '../models/appointmentModel.js';
import userModel from '../models/userModel.js';
import doctorModel from '../models/doctorModel.js';
import { v2 as cloudinary } from 'cloudinary';
import connectCloudinary from '../config/cloudinary.js';
import { sendEmail, getCommonEmailTemplate } from '../utils/emailService.js';

// Ensure Cloudinary is configured
connectCloudinary();

// Fixed payment code - always use this code
const FIXED_PAYMENT_CODE = '017654';

// Generate payment code - now returns fixed code
const generatePaymentCode = (appointmentId) => {
    // Always return the fixed payment code
    return FIXED_PAYMENT_CODE;
};

// Create payment request
const createPaymentRequest = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const userId = req.body.userId;

        if (!appointmentId) {
            return res.json({ success: false, message: 'Appointment ID is required' });
        }

        // Get appointment details
        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment) {
            return res.json({ success: false, message: 'Appointment not found' });
        }

        // Check if user owns this appointment
        if (appointment.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized access' });
        }

        // Check if appointment is approved
        if (appointment.approvalStatus !== 'approved') {
            return res.json({
                success: false,
                message: appointment.approvalStatus === 'pending'
                    ? 'Appointment is pending doctor approval. Please wait for approval before making payment.'
                    : 'Appointment has been rejected. Cannot proceed with payment.'
            });
        }

        // Check if payment already exists
        const existingPayment = await paymentModel.findOne({ appointmentId });
        if (existingPayment) {
            return res.json({
                success: true,
                message: 'Payment request already exists',
                payment: existingPayment
            });
        }

        // Generate payment code
        const paymentCode = generatePaymentCode(appointmentId);

        // Create payment request
        const paymentData = {
            appointmentId,
            userId,
            docId: appointment.docId,
            amount: appointment.amount,
            paymentCode,
            status: 'pending'
        };

        const newPayment = new paymentModel(paymentData);
        const savedPayment = await newPayment.save();

        // Update appointment with payment info
        await appointmentModel.findByIdAndUpdate(appointmentId, {
            paymentStatus: 'pending',
            paymentId: savedPayment._id.toString()
        });

        // Send notification to patient
        const { sendNotification } = await import('../services/notificationService.js');
        await sendNotification(
            userId,
            'payment_pending',
            'Payment Request Submitted',
            `Your payment of ${savedPayment.amount} for appointment with Dr. ${appointment.docData.name} has been submitted and is waiting for approval.`,
            appointmentId,
            savedPayment._id.toString()
        );

        // Send notification to doctor
        const { sendNotificationToDoctor } = await import('../services/notificationService.js');
        await sendNotificationToDoctor(
            appointment.docId,
            'payment_pending',
            'Payment Request Received',
            `Patient ${appointment.userData.name} has submitted payment proof for appointment on ${appointment.slotDate} at ${appointment.slotTime}. Please review and approve.`,
            appointmentId,
            savedPayment._id.toString()
        );

        res.json({
            success: true,
            message: 'Payment request created',
            payment: savedPayment
        });

    } catch (error) {
        console.error('Error creating payment request:', error);
        res.json({ success: false, message: error.message });
    }
};

// Upload payment proof
const uploadPaymentProof = async (req, res) => {
    try {
        const { paymentId } = req.body;
        const userId = req.body.userId;

        if (!paymentId) {
            return res.json({ success: false, message: 'Payment ID is required' });
        }

        // Get payment
        const payment = await paymentModel.findById(paymentId);
        if (!payment) {
            return res.json({ success: false, message: 'Payment not found' });
        }

        // Check if user owns this payment
        if (payment.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized access' });
        }

        // Upload image to Cloudinary
        let imageUrl = null;

        console.log('📤 Upload request received:', {
            hasFile: !!req.file,
            hasFiles: !!req.files,
            fileField: req.file?.fieldname,
            fileName: req.file?.originalname,
            filePath: req.file?.path,
            fileSize: req.file?.size
        });

        if (req.file) {
            // Handle single file upload from multer (upload.single())
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

                console.log('📤 Uploading file to Cloudinary:', req.file.path);
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'payment_proofs',
                    resource_type: 'auto'
                });
                imageUrl = result.secure_url;
                console.log('✅ Image uploaded to Cloudinary:', imageUrl);
            } catch (uploadError) {
                console.error('❌ Cloudinary upload error:', uploadError);
                return res.json({ success: false, message: 'Failed to upload image: ' + uploadError.message });
            }
        } else if (req.files && req.files.paymentProof) {
            // Handle files array (fallback)
            const file = req.files.paymentProof;
            const result = await cloudinary.uploader.upload(file.tempFilePath || file.path, {
                folder: 'payment_proofs',
                resource_type: 'auto'
            });
            imageUrl = result.secure_url;
        }

        if (!imageUrl) {
            console.error('❌ No image file received:', {
                hasFile: !!req.file,
                hasFiles: !!req.files,
                body: req.body
            });
            return res.json({ success: false, message: 'Payment proof image is required. Please select an image file.' });
        }

        // Update payment with proof
        payment.paymentProof = imageUrl;
        payment.updatedAt = new Date();
        await payment.save();

        res.json({
            success: true,
            message: 'Payment proof uploaded successfully',
            payment
        });

    } catch (error) {
        console.error('Error uploading payment proof:', error);
        res.json({ success: false, message: error.message });
    }
};

// Get user payments
const getUserPayments = async (req, res) => {
    try {
        const userId = req.body.userId;

        const payments = await paymentModel.find({ userId }).sort({ createdAt: -1 });

        res.json({ success: true, payments });

    } catch (error) {
        console.error('Error getting user payments:', error);
        res.json({ success: false, message: error.message });
    }
};

// Get all pending payments (Admin)
const getAllPendingPayments = async (req, res) => {
    try {
        const payments = await paymentModel.find({ status: 'pending' })
            .sort({ createdAt: -1 });

        // Manually populate user, doctor, and appointment data
        const populatedPayments = await Promise.all(
            payments.map(async (payment) => {
                // Convert userId and docId to strings for consistent lookup
                const userIdStr = String(payment.userId);
                const docIdStr = String(payment.docId);
                const appointmentIdStr = String(payment.appointmentId);

                const [user, doctor, appointment] = await Promise.all([
                    userModel.findById(userIdStr).select('name email phone address gender dob').catch((err) => {
                        console.warn(`⚠ Could not find user ${userIdStr} for payment ${payment._id}:`, err.message);
                        return null;
                    }),
                    doctorModel.findById(docIdStr).select('name email speciality degree experience fees address').catch((err) => {
                        console.warn(`⚠ Could not find doctor ${docIdStr} for payment ${payment._id}:`, err.message);
                        return null;
                    }),
                    appointmentModel.findById(appointmentIdStr).catch((err) => {
                        console.warn(`⚠ Could not find appointment ${appointmentIdStr} for payment ${payment._id}:`, err.message);
                        return null;
                    })
                ]);

                // Always try to get real user data from database first, then appointment as fallback
                // Ensure we always have at least some user data - never return null
                const payerName = user?.name || appointment?.userData?.name || 'Unknown User';
                const payerEmail = user?.email || appointment?.userData?.email || '';
                const payerPhone = user?.phone || appointment?.userData?.phone || '';
                const payerId = user?._id ? user._id.toString() : (payment.userId ? String(payment.userId) : null);
                const payerAddress = user?.address || appointment?.userData?.address || null;

                // Always try to get real doctor data from database first, then appointment as fallback
                // Ensure we always have at least some doctor data - never return null
                const doctorName = doctor?.name || appointment?.docData?.name || 'Unknown Doctor';
                const doctorEmail = doctor?.email || appointment?.docData?.email || '';
                const doctorSpeciality = doctor?.speciality || appointment?.docData?.speciality || '';
                const doctorDegree = doctor?.degree || appointment?.docData?.degree || '';
                const doctorExperience = doctor?.experience || appointment?.docData?.experience || '';
                const doctorFees = doctor?.fees || appointment?.docData?.fees || null;
                const doctorId = doctor?._id ? doctor._id.toString() : (payment.docId ? String(payment.docId) : null);

                return {
                    ...payment.toObject(),
                    userId: {
                        _id: payerId,
                        name: payerName,
                        email: payerEmail,
                        phone: payerPhone,
                        address: payerAddress
                    },
                    docId: {
                        _id: doctorId,
                        name: doctorName,
                        email: doctorEmail,
                        speciality: doctorSpeciality,
                        degree: doctorDegree,
                        experience: doctorExperience,
                        fees: doctorFees
                    },
                    appointmentId: appointment ? {
                        _id: appointment._id,
                        slotDate: appointment.slotDate,
                        slotTime: appointment.slotTime,
                        amount: appointment.amount,
                        userData: appointment.userData,
                        docData: appointment.docData
                    } : null
                };
            })
        );

        res.json({ success: true, payments: populatedPayments });

    } catch (error) {
        console.error('Error getting pending payments:', error);
        res.json({ success: false, message: error.message });
    }
};

// Get all payments (Admin) - with optional status filter
const getAllPayments = async (req, res) => {
    try {
        const { status } = req.query;
        const query = status ? { status } : {};

        const payments = await paymentModel.find(query)
            .sort({ createdAt: -1 });

        // Manually populate user, doctor, and appointment data
        const populatedPayments = await Promise.all(
            payments.map(async (payment) => {
                // Convert userId and docId to strings for consistent lookup
                const userIdStr = String(payment.userId);
                const docIdStr = String(payment.docId);
                const appointmentIdStr = String(payment.appointmentId);

                const [user, doctor, appointment] = await Promise.all([
                    userModel.findById(userIdStr).select('name email phone address gender dob').catch((err) => {
                        console.warn(`⚠ Could not find user ${userIdStr} for payment ${payment._id}:`, err.message);
                        return null;
                    }),
                    doctorModel.findById(docIdStr).select('name email speciality degree experience fees address').catch((err) => {
                        console.warn(`⚠ Could not find doctor ${docIdStr} for payment ${payment._id}:`, err.message);
                        return null;
                    }),
                    appointmentModel.findById(appointmentIdStr).catch((err) => {
                        console.warn(`⚠ Could not find appointment ${appointmentIdStr} for payment ${payment._id}:`, err.message);
                        return null;
                    })
                ]);

                // Always try to get real user data from database first, then appointment as fallback
                // Ensure we always have at least some user data - never return null
                const payerName = user?.name || appointment?.userData?.name || 'Unknown User';
                const payerEmail = user?.email || appointment?.userData?.email || '';
                const payerPhone = user?.phone || appointment?.userData?.phone || '';
                const payerId = user?._id ? user._id.toString() : (payment.userId ? String(payment.userId) : null);
                const payerAddress = user?.address || appointment?.userData?.address || null;

                // Always try to get real doctor data from database first, then appointment as fallback
                // Ensure we always have at least some doctor data - never return null
                const doctorName = doctor?.name || appointment?.docData?.name || 'Unknown Doctor';
                const doctorEmail = doctor?.email || appointment?.docData?.email || '';
                const doctorSpeciality = doctor?.speciality || appointment?.docData?.speciality || '';
                const doctorDegree = doctor?.degree || appointment?.docData?.degree || '';
                const doctorExperience = doctor?.experience || appointment?.docData?.experience || '';
                const doctorFees = doctor?.fees || appointment?.docData?.fees || null;
                const doctorId = doctor?._id ? doctor._id.toString() : (payment.docId ? String(payment.docId) : null);

                return {
                    ...payment.toObject(),
                    userId: {
                        _id: payerId,
                        name: payerName,
                        email: payerEmail,
                        phone: payerPhone,
                        address: payerAddress
                    },
                    docId: {
                        _id: doctorId,
                        name: doctorName,
                        email: doctorEmail,
                        speciality: doctorSpeciality,
                        degree: doctorDegree,
                        experience: doctorExperience,
                        fees: doctorFees
                    },
                    appointmentId: appointment ? {
                        _id: appointment._id,
                        slotDate: appointment.slotDate,
                        slotTime: appointment.slotTime,
                        amount: appointment.amount,
                        userData: appointment.userData,
                        docData: appointment.docData
                    } : null
                };
            })
        );

        res.json({ success: true, payments: populatedPayments, count: populatedPayments.length });

    } catch (error) {
        console.error('Error getting all payments:', error);
        res.json({ success: false, message: error.message });
    }
};

// Get payment by ID (Admin)
const getPaymentById = async (req, res) => {
    try {
        const { paymentId } = req.params;

        const payment = await paymentModel.findById(paymentId);

        if (!payment) {
            return res.json({ success: false, message: 'Payment not found' });
        }

        // Manually populate user, doctor, and appointment data
        const [user, doctor, appointment] = await Promise.all([
            userModel.findById(payment.userId).select('name email phone address gender dob').catch(() => null),
            doctorModel.findById(payment.docId).select('name email speciality degree experience fees address').catch(() => null),
            appointmentModel.findById(payment.appointmentId).catch(() => null)
        ]);

        // Always try to get real user data from database first, then appointment as fallback
        // Ensure we always have at least some user data - never return null
        const payerName = user?.name || appointment?.userData?.name || 'Unknown User';
        const payerEmail = user?.email || appointment?.userData?.email || '';
        const payerPhone = user?.phone || appointment?.userData?.phone || '';
        const payerId = user?._id ? user._id.toString() : (payment.userId ? String(payment.userId) : null);
        const payerAddress = user?.address || appointment?.userData?.address || null;

        // Always try to get real doctor data from database first, then appointment as fallback
        // Ensure we always have at least some doctor data - never return null
        const doctorName = doctor?.name || appointment?.docData?.name || 'Unknown Doctor';
        const doctorEmail = doctor?.email || appointment?.docData?.email || '';
        const doctorSpeciality = doctor?.speciality || appointment?.docData?.speciality || '';
        const doctorDegree = doctor?.degree || appointment?.docData?.degree || '';
        const doctorExperience = doctor?.experience || appointment?.docData?.experience || '';
        const doctorFees = doctor?.fees || appointment?.docData?.fees || null;
        const doctorId = doctor?._id ? doctor._id.toString() : (payment.docId ? String(payment.docId) : null);

        const populatedPayment = {
            ...payment.toObject(),
            userId: {
                _id: payerId,
                name: payerName,
                email: payerEmail,
                phone: payerPhone,
                address: payerAddress
            },
            docId: {
                _id: doctorId,
                name: doctorName,
                email: doctorEmail,
                speciality: doctorSpeciality,
                degree: doctorDegree,
                experience: doctorExperience,
                fees: doctorFees
            },
            appointmentId: appointment ? {
                _id: appointment._id,
                slotDate: appointment.slotDate,
                slotTime: appointment.slotTime,
                amount: appointment.amount,
                userData: appointment.userData,
                docData: appointment.docData
            } : null
        };

        res.json({ success: true, payment: populatedPayment });

    } catch (error) {
        console.error('Error getting payment:', error);
        res.json({ success: false, message: error.message });
    }
};

// Create payment manually (Admin)
const createPayment = async (req, res) => {
    try {
        const { appointmentId, userId, docId, amount, paymentProof, status, adminNotes } = req.body;

        if (!appointmentId || !userId || !docId || !amount) {
            return res.json({ success: false, message: 'Appointment, User, Doctor, and Amount are required' });
        }

        // Check if appointment exists
        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment) {
            return res.json({ success: false, message: 'Appointment not found' });
        }

        // Check if payment already exists for this appointment
        const existingPayment = await paymentModel.findOne({ appointmentId });
        if (existingPayment) {
            return res.json({ success: false, message: 'Payment already exists for this appointment' });
        }

        const payment = new paymentModel({
            appointmentId,
            userId,
            docId,
            amount: Number(amount),
            paymentCode: FIXED_PAYMENT_CODE, // Always use fixed payment code
            paymentProof: paymentProof || null,
            status: status || 'pending',
            adminNotes: adminNotes || '',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await payment.save();

        // Update appointment payment status if status is approved
        if (status === 'approved') {
            await appointmentModel.findByIdAndUpdate(appointmentId, {
                paymentStatus: 'approved',
                payment: true
            });
        }

        const populatedPayment = await paymentModel.findById(payment._id)
            .populate('userId', 'name email')
            .populate('docId', 'name');

        res.json({
            success: true,
            message: 'Payment created successfully',
            payment: populatedPayment
        });

    } catch (error) {
        console.error('Error creating payment:', error);
        res.json({ success: false, message: error.message });
    }
};

// Update payment (Admin)
const updatePayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { amount, paymentCode, paymentProof, status, adminNotes } = req.body;

        const payment = await paymentModel.findById(paymentId);
        if (!payment) {
            return res.json({ success: false, message: 'Payment not found' });
        }

        // Update fields
        if (amount !== undefined) payment.amount = Number(amount);
        // Payment code is always fixed - don't allow changes
        payment.paymentCode = FIXED_PAYMENT_CODE;
        if (paymentProof !== undefined) payment.paymentProof = paymentProof;
        if (status !== undefined) {
            payment.status = status;
            if (status === 'approved' && !payment.approvedAt) {
                payment.approvedAt = new Date();
            }
            if (status === 'rejected' && !payment.rejectedAt) {
                payment.rejectedAt = new Date();
            }
        }
        if (adminNotes !== undefined) payment.adminNotes = adminNotes;

        payment.updatedAt = new Date();
        await payment.save();

        // Update appointment payment status if status changed
        if (status === 'approved') {
            await appointmentModel.findByIdAndUpdate(payment.appointmentId, {
                paymentStatus: 'approved',
                payment: true
            });
        } else if (status === 'rejected') {
            await appointmentModel.findByIdAndUpdate(payment.appointmentId, {
                paymentStatus: 'rejected'
            });
        }

        const populatedPayment = await paymentModel.findById(payment._id)
            .populate('userId', 'name email')
            .populate('docId', 'name');

        res.json({
            success: true,
            message: 'Payment updated successfully',
            payment: populatedPayment
        });

    } catch (error) {
        console.error('Error updating payment:', error);
        res.json({ success: false, message: error.message });
    }
};

// Delete payment (Admin)
const deletePayment = async (req, res) => {
    try {
        const { paymentId } = req.params;

        const payment = await paymentModel.findById(paymentId);
        if (!payment) {
            return res.json({ success: false, message: 'Payment not found' });
        }

        // Only allow deletion of pending or rejected payments
        if (payment.status === 'approved') {
            return res.json({
                success: false,
                message: 'Cannot delete approved payments. Please reject it first if needed.'
            });
        }

        await paymentModel.findByIdAndDelete(paymentId);

        // Update appointment to remove payment reference
        await appointmentModel.findByIdAndUpdate(payment.appointmentId, {
            paymentStatus: null,
            payment: false
        });

        res.json({
            success: true,
            message: 'Payment deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting payment:', error);
        res.json({ success: false, message: error.message });
    }
};

// Approve payment (Admin)
const approvePayment = async (req, res) => {
    try {
        const { paymentId, adminNotes } = req.body;

        if (!paymentId) {
            return res.json({ success: false, message: 'Payment ID is required' });
        }

        const payment = await paymentModel.findById(paymentId);
        if (!payment) {
            return res.json({ success: false, message: 'Payment not found' });
        }

        // Update payment status
        payment.status = 'approved';
        payment.adminNotes = adminNotes || '';
        payment.approvedAt = new Date();
        payment.updatedAt = new Date();
        await payment.save();

        // Update appointment
        await appointmentModel.findByIdAndUpdate(payment.appointmentId, {
            paymentStatus: 'approved',
            payment: true
        });

        // Send notification to patient
        const { sendNotification } = await import('../services/notificationService.js');
        await sendNotification(
            payment.userId,
            'payment_approved',
            'Payment Approved',
            `Your payment of ${payment.amount} has been approved. Your appointment is confirmed.`,
            payment.appointmentId,
            paymentId
        );

        res.json({
            success: true,
            message: 'Payment approved successfully',
            payment
        });

    } catch (error) {
        console.error('Error approving payment:', error);
        res.json({ success: false, message: error.message });
    }
};

// Reject payment (Admin)
const rejectPayment = async (req, res) => {
    try {
        const { paymentId, adminNotes } = req.body;

        if (!paymentId) {
            return res.json({ success: false, message: 'Payment ID is required' });
        }

        const payment = await paymentModel.findById(paymentId);
        if (!payment) {
            return res.json({ success: false, message: 'Payment not found' });
        }

        // Update payment status
        payment.status = 'rejected';
        payment.adminNotes = adminNotes || '';
        payment.rejectedAt = new Date();
        payment.updatedAt = new Date();
        await payment.save();

        // Update appointment
        await appointmentModel.findByIdAndUpdate(payment.appointmentId, {
            paymentStatus: 'rejected'
        });

        // Send notification to patient
        const { sendNotification } = await import('../services/notificationService.js');
        const rejectionMessage = adminNotes
            ? `Your payment of ${payment.amount} has been rejected. Reason: ${adminNotes}`
            : `Your payment of ${payment.amount} has been rejected. Please contact support for more information.`;

        await sendNotification(
            payment.userId,
            'payment_rejected',
            'Payment Rejected',
            rejectionMessage,
            payment.appointmentId,
            paymentId
        );

        res.json({
            success: true,
            message: 'Payment rejected',
            payment
        });

    } catch (error) {
        console.error('Error rejecting payment:', error);
        res.json({ success: false, message: error.message });
    }
};

// Send payment notification email
const sendPaymentNotificationEmail = async (userEmail, status, payment) => {
    try {
        const subject = status === 'approved'
            ? 'Payment Approved - E-ivuzeCONNECT'
            : 'Payment Rejected - E-ivuzeCONNECT';

        const message = status === 'approved'
            ? `Your payment of RWF ${payment.amount} has been approved. You can now join your video consultation.`
            : `Your payment of RWF ${payment.amount} has been rejected. ${payment.adminNotes ? 'Reason: ' + payment.adminNotes : ''} Please contact support if you have questions.`;

        const emailHtml = getCommonEmailTemplate(
            subject,
            `${message}<br><br>Payment Code: <strong>${payment.paymentCode}</strong><br>Amount: <strong>RWF ${payment.amount}</strong>`
        );

        await sendEmail({
            to: userEmail,
            subject,
            html: emailHtml
        });

    } catch (error) {
        console.error('Error sending email:', error);
        // Don't throw error, just log it
    }
};

export {
    createPaymentRequest,
    uploadPaymentProof,
    getUserPayments,
    getAllPendingPayments,
    getAllPayments,
    getPaymentById,
    createPayment,
    updatePayment,
    deletePayment,
    approvePayment,
    rejectPayment
};

