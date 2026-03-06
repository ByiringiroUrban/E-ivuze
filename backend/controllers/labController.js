import labModel from '../models/labModel.js';
import labOrderModel from '../models/labOrderModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import validator from 'validator';
import { v2 as cloudinary } from 'cloudinary';
import { sendNotificationToDoctor } from '../services/notificationService.js';
import { sendEmail, getCommonEmailTemplate } from '../utils/emailService.js';

// API for Admin to add a Lab
const addLab = async (req, res) => {
    try {
        const { name, email, password, address, phone } = req.body;
        // Validate
        if (!name || !email || !password) {
            return res.json({ success: false, message: "Missing details" });
        }
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Invalid email" });
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Password must be at least 8 characters" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newLab = new labModel({
            name, email, password: hashedPassword, address, phone
        });

        await newLab.save();

        // Send Welcome Email
        const dashboardLink = process.env.VITE_FRONTEND_URL ? `${process.env.VITE_FRONTEND_URL}/lab-login` : "https://E-ivuze.com/lab-login";
        const emailHtml = getCommonEmailTemplate(
            "Welcome to E-ivuze",
            `Hi ${name},<br><br>Your Lab account has been created.<br><br><strong>Login Credentials:</strong><br>Email: ${email}<br>Password: ${password}<br><br>Please keep these credentials safe.`,
            "Login to Lab Dashboard",
            dashboardLink
        );
        await sendEmail({
            to: email,
            subject: "Welcome to E-ivuze- Lab Account Created",
            html: emailHtml
        });

        res.json({ success: true, message: "Lab Added Successfully" });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Lab Login
const loginLab = async (req, res) => {
    try {
        const { email, password } = req.body;
        const lab = await labModel.findOne({ email });

        if (!lab) {
            return res.json({ success: false, message: "Lab not found" });
        }

        const isMatch = await bcrypt.compare(password, lab.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: lab._id, role: 'lab' }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ success: true, token, labName: lab.name });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Google Login for Lab
const googleLoginLab = async (req, res) => {
    try {
        const { googleId, email, name, image } = req.body;

        // Check if lab exists with this Google ID
        let lab = await labModel.findOne({ googleId });

        if (!lab) {
            // Check if lab exists with this email
            lab = await labModel.findOne({ email });

            if (!lab) {
                return res.json({
                    success: false,
                    message: "Lab not found. Please contact admin to register your diagnostic center."
                });
            }

            // Link Google ID to existing lab
            lab.googleId = googleId;
            if (image && !lab.image) {
                lab.image = image;
            }
            await lab.save();
        }

        const token = jwt.sign({ id: lab._id, role: 'lab' }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ success: true, token, labName: lab.name });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};


// Get all Labs (Public/Protected)
const getAllLabs = async (req, res) => {
    try {
        const labs = await labModel.find({ available: true }).select('-password');
        res.json({ success: true, labs });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// --- Order Management ---

// Get Orders for a specific Lab
const getLabOrders = async (req, res) => {
    try {
        const labId = req.labId; // From middleware
        const orders = await labOrderModel.find({ labId })
            .populate('patientId', 'name image')
            .sort({ orderedAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Update Order Status
const updateLabOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        const labId = req.labId;

        const order = await labOrderModel.findOne({ _id: orderId, labId });
        if (!order) {
            return res.json({ success: false, message: "Order not found or not assigned to this lab" });
        }

        order.status = status;
        await order.save();

        res.json({ success: true, message: "Order status updated", order });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Upload Result (Link file)
const uploadLabResult = async (req, res) => {
    try {
        const { orderId, resultSummary } = req.body;
        const labId = req.labId;
        const imageFile = req.file;

        const order = await labOrderModel.findOne({ _id: orderId, labId });
        if (!order) {
            return res.json({ success: false, message: "Order not found or not assigned to this lab" });
        }

        const updateData = {
            status: 'COMPLETED',
            result: resultSummary,
            resultDate: Date.now()
        };

        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "auto" });
            updateData.resultFileUrl = imageUpload.secure_url;
        }

        Object.assign(order, updateData);
        await order.save();

        // Notify Doctor
        if (order.docId) {
            const lab = await labModel.findById(labId);
            await sendNotificationToDoctor(
                order.docId,
                'LAB_RESULT',
                'Lab Result Ready',
                `Test result for ${order.testName} is now available from ${lab?.name || 'the lab'}.`,
                order.appointmentId
            );
        }

        res.json({ success: true, message: "Result uploaded and doctor notified", order });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get Lab Profile
const getProfile = async (req, res) => {
    try {
        const labId = req.labId;
        const lab = await labModel.findById(labId).select('-password');
        if (!lab) return res.json({ success: false, message: "Lab not found" });
        res.json({ success: true, lab });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Update Lab Profile
const updateProfile = async (req, res) => {
    try {
        const labId = req.labId;
        const { name, phone, address, available } = req.body;

        const lab = await labModel.findById(labId);
        if (!lab) return res.json({ success: false, message: "Lab not found" });

        if (name) lab.name = name;
        if (phone) lab.phone = phone;
        if (address) lab.address = typeof address === 'string' ? JSON.parse(address) : address;
        if (available !== undefined) lab.available = available;

        if (req.file) {
            const imageUpload = await cloudinary.uploader.upload(req.file.path, { resource_type: "auto" });
            lab.image = imageUpload.secure_url;
        }

        await lab.save();
        res.json({ success: true, message: "Profile updated", lab });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

export { addLab, loginLab, googleLoginLab, getAllLabs, getLabOrders, updateLabOrderStatus, uploadLabResult, getProfile, updateProfile };
