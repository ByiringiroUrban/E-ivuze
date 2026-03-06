import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'
import razorpay from 'razorpay'
import { sendEmail, getCommonEmailTemplate } from '../utils/emailService.js'

// API to register user
const registerUser = async (req, res) => {

    try {
        const { name, email, password } = req.body

        if (!name || !password || !email) {
            return res.json({ success: false, message: "Missing Details" })
        }

        //validating email format

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Enter a valid email" })
        }

        // validating strong password

        if (password.length < 8) {
            return res.json({ success: false, message: "Enter a strong password" })
        }

        // Hashing User Password

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name,
            email,
            password: hashedPassword
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

        // Send Welcome Email
        const dashboardLink = process.env.VITE_FRONTEND_URL || "https://E-ivuze.com/login";
        const emailHtml = getCommonEmailTemplate(
            "Welcome to E-ivuze",
            `Hi ${name},<br><br>Welcome to E-ivuze! Your account has been successfully created.<br><br>start booking appointments with our top doctors.`,
            "Go to Dashboard",
            dashboardLink
        );
        sendEmail({ // No await to avoid blocking response
            to: email,
            subject: "Welcome to E-ivuze",
            html: emailHtml
        }).catch(err => console.error("Welcome email failed", err));

        res.json({ success: true, token })


    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API for user login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = String(email || '').trim().toLowerCase();

        console.log('\n👤  USER LOGIN ATTEMPT');
        console.log('   Email:', normalizedEmail);

        const user = await userModel.findOne({ email: normalizedEmail });

        if (!user) {
            console.log('   ❌ FAILED: User not found in database');
            return res.json({ success: false, message: 'User does not exist' });
        }

        // BLOCK ADMINS from logging in as standard patients
        if (user.role === 'admin') {
            console.log('   ⚠️  FAILED: Admin user detected on patient login route');
            return res.json({
                success: false,
                message: "This account is registered as an Admin. Please use the Admin login portal."
            });
        }

        console.log('   ✅ Found user profile:', user.name);
        console.log('   📊 Role:', user.role);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('   🔑 Password match:', isMatch);

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
            console.log('   ✅ LOGIN SUCCESS');
            res.json({
                success: true,
                token,
                mustChangePassword: user.mustChangePassword || false,
                onboardingCompleted: user.onboardingCompleted || false
            });
        } else {
            console.log('   ❌ FAILED: Password mismatch');
            res.json({ success: false, message: "Invalid credentials" });
        }

    } catch (error) {
        console.log('   ❌ ERROR in user login:', error);
        res.json({ success: false, message: error.message });
    }
};

// API to get user profile data
const getProfile = async (req, res) => {
    try {

        const { userId } = req.body
        const userData = await userModel.findById(userId).select('-password')

        res.json({ success: true, userData })


    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to update user profile

const updateProfile = async (req, res) => {
    try {

        const { userId, name, phone, address, dob, gender, nid, insurance, bloodGroup, emergencyContact, allergies, maritalStatus, occupation } = req.body
        const imageFile = req.file

        if (!name || !phone, !dob || !gender) {
            return res.json({ success: false, message: "Data Missing" })
        }

        // Parse JSON fields if they come as strings (e.g. from FormData)
        const parseJson = (field) => {
            if (typeof field === 'string') {
                try { return JSON.parse(field) } catch (e) { return field }
            }
            return field
        }

        const updateData = {
            name, phone, dob, gender,
            address: parseJson(address),
            nid,
            insurance: parseJson(insurance),
            bloodGroup,
            emergencyContact: parseJson(emergencyContact),
            allergies: parseJson(allergies),
            maritalStatus,
            occupation
        }

        await userModel.findByIdAndUpdate(userId, updateData)

        if (imageFile) {

            // Upload image to cloudinary

            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' })
            const imageURL = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId, { image: imageURL })
        }

        res.json({ success: true, message: "Profile Updated" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// API to book appointment

const bookAppointment = async (req, res) => {

    try {

        const { userId, docId, slotDate, slotTime } = req.body

        // Validate required fields
        if (!userId || !docId || !slotDate || !slotTime) {
            return res.json({ success: false, message: 'Missing required fields' })
        }

        const docData = await doctorModel.findById(docId).select('-password')

        if (!docData) {
            return res.json({ success: false, message: 'Doctor not found' })
        }

        if (!docData.available) {
            return res.json({ success: false, message: 'Doctor not available' })
        }

        // Check for slot availability (but don't reserve yet - wait for approval)
        let slots_booked = docData.slots_booked || {}

        // Check if slot is already booked
        if (slots_booked[slotDate] && slots_booked[slotDate].includes(slotTime)) {
            return res.json({ success: false, message: 'Slot not available' })
        }

        // Also check for pending appointments on the same slot
        const existingPendingAppointment = await appointmentModel.findOne({
            docId,
            slotDate,
            slotTime,
            approvalStatus: { $in: ['pending', 'approved'] },
            cancelled: false
        });

        if (existingPendingAppointment) {
            return res.json({ success: false, message: 'Slot not available - appointment already pending or approved for this time' })
        }

        const userData = await userModel.findById(userId).select('-password')

        if (!userData) {
            return res.json({ success: false, message: 'User not found' })
        }

        // Convert Mongoose documents to plain objects
        const docDataPlain = docData.toObject()
        delete docDataPlain.slots_booked

        const userDataPlain = userData.toObject()

        // Get consultation fee from settings (not from doctor)
        const settingsModel = (await import('../models/settingsModel.js')).default;
        let settings = await settingsModel.findOne();
        if (!settings) {
            // Create default settings if they don't exist
            settings = new settingsModel({
                consultationFee: 3000,
                platformPercentage: 10
            });
            await settings.save();
        }

        const appointmentData = {
            userId,
            docId,
            userData: userDataPlain,
            docData: docDataPlain,
            amount: settings.consultationFee, // Use admin-set consultation fee
            slotTime,
            slotDate,
            date: Date.now(),
            approvalStatus: 'pending' // Appointment needs doctor approval
        }

        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()

        // Generate unique video call channel name after appointment is created (max 64 bytes, only allowed chars)
        // Use appointment ID hash to create a short, unique channel name
        // Remove any invalid characters and use only alphanumeric
        // Limit to 15 chars (apt + 12 chars) to ensure it's well under 64 bytes
        const appointmentIdHash = newAppointment._id.toString().replace(/[^a-zA-Z0-9]/g, '').slice(-12); // Remove invalid chars, use last 12 chars
        const videoCallChannel = `apt${appointmentIdHash}`; // Format: apt + 12 chars = 15 chars total (very safe)

        // Update appointment with channel name
        await appointmentModel.findByIdAndUpdate(newAppointment._id, { videoCallChannel })

        // Send notification to doctor about pending appointment
        const { sendNotificationToDoctor } = await import('../services/notificationService.js');
        await sendNotificationToDoctor(
            docId,
            'appointment_pending',
            'New Appointment Request',
            `You have a new appointment request from ${userDataPlain.name} on ${slotDate} at ${slotTime}. Please approve or reject this appointment.`,
            newAppointment._id.toString()
        );

        // Send notification to patient
        const { sendNotification } = await import('../services/notificationService.js');
        await sendNotification(
            userId,
            'appointment_pending',
            'Appointment Request Submitted',
            `Your appointment request with Dr. ${docDataPlain.name} on ${slotDate} at ${slotTime} has been submitted and is waiting for doctor approval.`,
            newAppointment._id.toString()
        );

        // Send email to admin about the appointment booking
        try {
            const adminEmail = 'E-ivuzeconnect@gmail.com';
            const emailSubject = `New Appointment Booking - ${userDataPlain.name}`;
            const emailContent = `
                <h3>New Appointment Booking</h3>
                <p><strong>Patient:</strong> ${userDataPlain.name}</p>
                <p><strong>Email:</strong> ${userDataPlain.email}</p>
                <p><strong>Phone:</strong> ${userDataPlain.phone || 'Not provided'}</p>
                <p><strong>Doctor:</strong> Dr. ${docDataPlain.name}</p>
                <p><strong>Speciality:</strong> ${docDataPlain.speciality}</p>
                <p><strong>Date:</strong> ${slotDate.replace(/_/g, '/')}</p>
                <p><strong>Time:</strong> ${slotTime}</p>
                <p><strong>Status:</strong> Pending Doctor Approval</p>
                <p><strong>Amount:</strong> RWF ${settings.consultationFee}</p>
                <br>
                <p>Please log in to the admin panel to approve or reject this appointment.</p>
            `;

            await sendEmail({
                to: adminEmail,
                subject: emailSubject,
                html: emailContent
            });

            // Send confirmation email to patient
            const patientConfirmationSubject = 'Appointment Request Received - E-ivuzeConnect';
            const patientConfirmationContent = `
                <h3>Appointment Request Submitted</h3>
                <p>Dear ${userDataPlain.name},</p>
                <p>Your appointment request has been successfully submitted!</p>
                <br>
                <p><strong>Appointment Details:</strong></p>
                <p><strong>Doctor:</strong> Dr. ${docDataPlain.name}</p>
                <p><strong>Speciality:</strong> ${docDataPlain.speciality}</p>
                <p><strong>Date:</strong> ${slotDate.replace(/_/g, '/')}</p>
                <p><strong>Time:</strong> ${slotTime}</p>
                <p><strong>Amount:</strong> RWF ${settings.consultationFee}</p>
                <br>
                <p>Your appointment is currently <strong>pending doctor approval</strong>. You will receive a notification once the doctor confirms the appointment.</p>
                <p>You can view your appointments in your dashboard under "My Appointments".</p>
                <br>
                <p>Best regards,<br>E-ivuzeConnect Team<br>Email: E-ivuzeconnect@gmail.com</p>
            `;

            await sendEmail({
                to: userDataPlain.email,
                subject: patientConfirmationSubject,
                html: patientConfirmationContent
            });

        } catch (emailError) {
            console.error('Email sending failed for appointment booking:', emailError);
            // Don't fail the appointment booking if email fails
        }

        res.json({ success: true, message: 'Appointment request submitted. Waiting for doctor approval.' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get user appointment for frontend by my appointment page

const listAppointment = async (req, res) => {
    try {
        const { userId } = req.body
        console.log('📋 Fetching appointments for userId:', userId);

        if (!userId) {
            console.error('❌ No userId provided');
            return res.json({ success: false, message: 'User ID not found' });
        }

        // Find all appointments for this user, sorted by date (newest first)
        // Use $or to query both String and ObjectId formats to ensure we get all appointments
        const mongoose = (await import('mongoose')).default;

        // Try to convert to ObjectId if possible, otherwise use string
        let userIdQuery;
        try {
            const objectId = new mongoose.Types.ObjectId(userId);
            // Query with $or to match both string and ObjectId formats
            userIdQuery = {
                $or: [
                    { userId: userId.toString() },
                    { userId: objectId }
                ]
            };
        } catch (err) {
            // If userId is not a valid ObjectId, just use string
            userIdQuery = { userId: userId.toString() };
        }

        const appointments = await appointmentModel.find(userIdQuery).sort({ date: -1, createdAt: -1 });

        console.log(`📋 Found ${appointments.length} appointments for user ${userId}`);
        console.log(`📋 Appointment IDs:`, appointments.map(apt => apt._id.toString()));

        // Deduplicate appointments by _id (in case of any duplicates)
        const appointmentMap = new Map();
        appointments.forEach((apt) => {
            if (apt._id && !appointmentMap.has(apt._id.toString())) {
                appointmentMap.set(apt._id.toString(), apt);
            }
        });

        const uniqueAppointments = Array.from(appointmentMap.values());
        console.log(`📋 Returning ${uniqueAppointments.length} unique appointments`);

        res.json({ success: true, appointments: uniqueAppointments })

    } catch (error) {
        console.error('❌ Error in listAppointment:', error)
        res.json({ success: false, message: error.message })
    }
}

// API to cancel the appointment

const cancelAppointment = async (req, res) => {

    try {

        const { userId, appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)

        // verify appointment user

        if (appointmentData.userId != userId) {
            return res.json({ success: false, message: 'Unauthorized action' })
        }

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



// API to change password (for first-time login)
const changePassword = async (req, res) => {
    try {
        const { userId } = req.body;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.json({ success: false, message: 'Current password and new password are required' });
        }

        if (newPassword.length < 8) {
            return res.json({ success: false, message: 'New password must be at least 8 characters long' });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: 'Current password is incorrect' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password and clear mustChangePassword flag
        user.password = hashedPassword;
        user.mustChangePassword = false;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully. You can now access your account.'
        });

    } catch (error) {
        console.error('Error changing password:', error);
        res.json({ success: false, message: error.message });
    }
};

// Google OAuth Login
const googleLogin = async (req, res) => {
    try {
        console.log('\n🔵 [GOOGLE LOGIN - PATIENT] Request received');
        console.log('   📥 Body:', JSON.stringify(req.body, null, 2));

        const { googleId, email, name, image } = req.body;

        if (!googleId || !email) {
            console.log('   ❌ Missing required fields: googleId or email');
            return res.json({ success: false, message: 'Google ID and email are required' });
        }

        console.log(`   📧 Email: ${email}`);
        console.log(`   🆔 Google ID: ${googleId.substring(0, 20)}...`);

        // Check if user exists with this Google ID
        let user = await userModel.findOne({ googleId });
        console.log(`   🔍 User found by Google ID: ${user ? 'Yes (ID: ' + user._id + ')' : 'No'}`);

        if (!user) {
            // Check if user exists with this email (might have registered with email/password)
            user = await userModel.findOne({ email });
            console.log(`   🔍 User found by email: ${user ? 'Yes (ID: ' + user._id + ')' : 'No'}`);

            if (user) {
                // Link Google account to existing user
                console.log('   🔗 Linking Google account to existing user');
                user.googleId = googleId;
                if (image) user.image = image;
                await user.save();
                console.log('   ✅ Google account linked successfully');
            } else {
                // IMPORTANT: Check if this email belongs to a doctor first
                console.log('   🔍 Checking if email belongs to a doctor...');
                const doctor = await doctorModel.findOne({ email });

                if (doctor) {
                    console.log('   ❌ Email belongs to a doctor account');
                    return res.json({
                        success: false,
                        message: 'This email is registered as a doctor. Please use doctor login instead.',
                        isDoctor: true
                    });
                }

                // User does NOT exist — do NOT auto-create. Require registration.
                console.log('   ❌ User account not found for Google login');
                return res.json({
                    success: false,
                    message: 'No account found for this Google account. Please register first.',
                    requiresRegistration: true
                });
            }
        } else {
            // Update user info if needed
            console.log('   🔄 Updating existing user info');
            if (name && user.name !== name) user.name = name;
            if (image && user.image !== image) user.image = image;
            await user.save();
            console.log('   ✅ User info updated');
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        console.log(`   ✅ Token generated for user: ${user._id}`);
        console.log('   ✅ [GOOGLE LOGIN - PATIENT] Success\n');

        res.json({
            success: true,
            token,
            mustChangePassword: false,
            onboardingCompleted: user.onboardingCompleted || false
        });
    } catch (error) {
        console.error('   ❌ [GOOGLE LOGIN - PATIENT] Error:', error);
        console.error('   ❌ Error message:', error.message);
        console.error('   ❌ Error stack:', error.stack);
        res.json({ success: false, message: error.message });
    }
};

// API to register user with Google
const googleRegisterUser = async (req, res) => {
    try {
        const { googleId, email, name, image, gender } = req.body;

        if (!googleId || !email || !name) {
            return res.json({ success: false, message: 'Google ID, email and name are required' });
        }

        // Check if user already exists
        let user = await userModel.findOne({ $or: [{ googleId }, { email }] });

        if (user) {
            if (user.googleId === googleId) {
                return res.json({ success: false, message: 'User already exists. Please login.' });
            }
            // If user exists by email but not googleId, link them
            user.googleId = googleId;
            if (image) user.image = image;
            await user.save();
        } else {
            // Create new user
            user = new userModel({
                googleId,
                email,
                name,
                image,
                gender: gender || 'male',
                onboardingCompleted: false
            });
            await user.save();
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.json({ success: true, token, onboardingCompleted: user.onboardingCompleted });

    } catch (error) {
        console.error('Google register error:', error);
        res.json({ success: false, message: error.message });
    }
};

// API to submit lab order to a diagnostic center
const submitLabOrder = async (req, res) => {
    try {
        const { userId, orderId, labId } = req.body;

        // Import labOrderModel dynamically if not at top
        const labOrderModel = (await import('../models/labOrderModel.js')).default;
        const labModel = (await import('../models/labModel.js')).default;

        const order = await labOrderModel.findById(orderId);
        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }

        if (order.patientId !== userId) {
            return res.json({ success: false, message: "Unauthorized" });
        }

        const lab = await labModel.findById(labId);
        if (!lab) {
            return res.json({ success: false, message: "Lab not found" });
        }

        order.labId = labId;
        order.status = 'PENDING'; // Or 'SUBMITTED' if we change enum
        await order.save();

        res.json({ success: true, message: "Order submitted to lab successfully" });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// API to mark user onboarding as complete
const completeOnboarding = async (req, res) => {
    try {
        const { userId, ...onboardingData } = req.body;

        if (!userId) {
            return res.json({ success: false, message: 'User ID is missing' });
        }

        // take all data in request body and update user
        const updateFields = {
            ...onboardingData,
            onboardingCompleted: true
        };

        // If names provided, update 'name' field too
        if (onboardingData.firstName && onboardingData.lastName) {
            updateFields.name = `${onboardingData.firstName} ${onboardingData.lastName}`;
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { $set: updateFields },
            { new: true }
        );

        if (!updatedUser) {
            return res.json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, message: "Onboarding Saved Successfully", userData: updatedUser });

    } catch (error) {
        console.error('📋 ONBOARDING SAVE ERROR:', error);
        res.json({ success: false, message: "Failed to save profile: " + error.message });
    }
};

export { registerUser, loginUser, getProfile, updateProfile, completeOnboarding, bookAppointment, listAppointment, cancelAppointment, changePassword, googleLogin, googleRegisterUser, submitLabOrder }