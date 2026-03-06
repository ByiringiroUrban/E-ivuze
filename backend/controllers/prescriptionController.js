import prescriptionModel from '../models/prescriptionModel.js';
import appointmentModel from '../models/appointmentModel.js';
import userModel from '../models/userModel.js';
import { sendEmail, getCommonEmailTemplate } from '../utils/emailService.js';
import { v2 as cloudinary } from 'cloudinary';
import connectCloudinary from '../config/cloudinary.js';

// Ensure Cloudinary is configured
connectCloudinary();

// Create prescription
const createPrescription = async (req, res) => {
    try {
        console.log('═══════════════════════════════════════════════════════════');
        console.log('📋 CREATE PRESCRIPTION: Request received');
        console.log('  Timestamp:', new Date().toISOString());
        console.log('  Method:', req.method);
        console.log('  URL:', req.url);
        console.log('  Body keys:', Object.keys(req.body));
        console.log('  Body values:', JSON.stringify(req.body, null, 2));
        console.log('  Has file:', !!req.file);
        if (req.file) {
            console.log('  File name:', req.file.originalname);
            console.log('  File size:', req.file.size);
            console.log('  File type:', req.file.mimetype);
            console.log('  File path:', req.file.path);
        }
        console.log('  Headers:', JSON.stringify(req.headers, null, 2));

        // Validate appointmentId FIRST before any processing
        const { appointmentId } = req.body;
        console.log('  Extracted appointmentId:', appointmentId);
        console.log('  appointmentId type:', typeof appointmentId);
        console.log('  appointmentId truthy:', !!appointmentId);

        if (!appointmentId) {
            console.error('❌ CREATE PRESCRIPTION: Appointment ID is missing');
            console.error('  Full request body:', JSON.stringify(req.body, null, 2));
            console.error('  Request query:', JSON.stringify(req.query, null, 2));
            console.error('  Request params:', JSON.stringify(req.params, null, 2));
            return res.json({ success: false, message: 'Appointment ID is required' });
        }

        console.log('✅ CREATE PRESCRIPTION: Appointment ID validated:', appointmentId);

        // Parse medications if it's a JSON string (from FormData)
        let medications = req.body.medications;
        console.log('  Medications (raw):', medications);
        console.log('  Medications type:', typeof medications);

        if (typeof medications === 'string') {
            try {
                medications = JSON.parse(medications);
                console.log('  Medications (parsed):', JSON.stringify(medications, null, 2));
            } catch (e) {
                console.warn('  ⚠️ Failed to parse medications JSON:', e.message);
                medications = [];
            }
        }

        const { diagnosis, notes, followUpDate } = req.body;
        // Get docId from multiple possible locations (multer might overwrite req.body)
        const docId = req.docId || req.doctorId || req.body.docId;

        console.log('  Extracted data:');
        console.log('    docId from req.docId:', req.docId);
        console.log('    docId from req.doctorId:', req.doctorId);
        console.log('    docId from req.body.docId:', req.body.docId);
        console.log('    Final docId:', docId);

        if (!docId) {
            console.error('❌ CREATE PRESCRIPTION: docId is missing after extraction');
            console.error('  req object keys:', Object.keys(req));
            console.error('  req.body:', JSON.stringify(req.body, null, 2));
            return res.json({ success: false, message: 'Doctor ID not found. Please login again.' });
        }
        console.log('    diagnosis:', diagnosis);
        console.log('    notes:', notes);
        console.log('    followUpDate:', followUpDate);
        console.log('    medications count:', medications?.length || 0);

        // Handle prescription file upload if provided
        let fileUrl = null;
        let fileName = null;
        let fileType = null;

        if (req.file) {
            try {
                console.log('📤 Uploading prescription file to Cloudinary:', req.file.path);
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'prescriptions',
                    resource_type: 'auto' // Supports both images and PDFs      
                });
                fileUrl = result.secure_url;
                fileName = req.file.originalname;
                fileType = req.file.mimetype;
                console.log('✅ Prescription file uploaded to Cloudinary:', fileUrl);
            } catch (uploadError) {
                console.error('❌ Prescription file upload error:', uploadError);
                return res.json({
                    success: false,
                    message: 'Failed to upload prescription file: ' + uploadError.message
                });
            }
        }

        // Get appointment
        console.log('  🔍 Looking up appointment:', appointmentId);
        const appointment = await appointmentModel.findById(appointmentId);

        if (!appointment) {
            console.error('❌ CREATE PRESCRIPTION: Appointment not found');
            console.error('  Searched for appointmentId:', appointmentId);
            return res.json({ success: false, message: 'Appointment not found' });
        }

        console.log('✅ CREATE PRESCRIPTION: Appointment found');
        console.log('    Appointment docId:', appointment.docId);
        console.log('    Request docId:', docId);
        console.log('    Appointment userId:', appointment.userId);

        // Check if doctor owns this appointment
        if (appointment.docId !== docId) {
            console.error('❌ CREATE PRESCRIPTION: Unauthorized access');
            console.error('    Appointment docId:', appointment.docId);
            console.error('    Request docId:', docId);
            console.error('    Match:', appointment.docId === docId);
            return res.json({ success: false, message: 'Unauthorized access' });
        }

        console.log('✅ CREATE PRESCRIPTION: Authorization verified');

        // Check if prescription already exists
        console.log('  🔍 Checking for existing prescription...');
        const existingPrescription = await prescriptionModel.findOne({ appointmentId });

        if (existingPrescription) {
            console.log('  ℹ️ Existing prescription found, updating...');
            console.log('    Existing prescription ID:', existingPrescription._id);
            // Update existing prescription
            existingPrescription.medications = medications || existingPrescription.medications;
            existingPrescription.diagnosis = diagnosis || existingPrescription.diagnosis;
            existingPrescription.notes = notes || existingPrescription.notes;
            existingPrescription.followUpDate = followUpDate || existingPrescription.followUpDate;
            // Update file if new one is uploaded
            if (fileUrl) {
                existingPrescription.fileUrl = fileUrl;
                existingPrescription.fileName = fileName;
                existingPrescription.fileType = fileType;
            }
            existingPrescription.updatedAt = new Date();
            console.log('  💾 Saving updated prescription...');
            await existingPrescription.save();
            console.log('✅ CREATE PRESCRIPTION: Prescription updated successfully');
            console.log('    Prescription ID:', existingPrescription._id);
            console.log('    Has file:', !!existingPrescription.fileUrl);

            // Auto-create/update record when prescription is updated
            try {
                const recordModel = (await import('../models/recordModel.js')).default;
                let prescriptionRecord = await recordModel.findOne({
                    appointmentId,
                    recordType: 'prescription'
                });

                if (!prescriptionRecord) {
                    const recordData = {
                        appointmentId,
                        userId: appointment.userId,
                        docId,
                        recordType: 'prescription',
                        title: `Prescription - ${diagnosis || 'Medication Prescribed'}`,
                        description: `Prescription created with ${medications?.length || 0} medication(s). ${notes || ''}`
                    };

                    prescriptionRecord = new recordModel(recordData);
                    await prescriptionRecord.save();
                    console.log('Auto-created prescription record for appointment:', appointmentId);
                } else {
                    // Update existing record
                    prescriptionRecord.title = `Prescription - ${diagnosis || 'Medication Prescribed'}`;
                    prescriptionRecord.description = `Prescription updated with ${medications?.length || 0} medication(s). ${notes || ''}`;
                    prescriptionRecord.updatedAt = new Date();
                    await prescriptionRecord.save();
                }
            } catch (recordError) {
                console.error('Error auto-creating/updating prescription record:', recordError);
                // Don't fail the prescription update if record creation fails
            }

            // Send notification and email to patient
            try {
                const { sendNotification } = await import('../services/notificationService.js');
                await sendNotification(
                    appointment.userId,
                    'prescription_created',
                    'Prescription Updated',
                    `Your prescription has been updated by your doctor. ${diagnosis ? `Diagnosis: ${diagnosis}` : ''} ${medications?.length ? `(${medications.length} medication(s))` : ''}`,
                    appointmentId
                );
            } catch (notifError) {
                console.error('Error sending prescription notification:', notifError);
            }

            // Send email to patient
            const user = await userModel.findById(appointment.userId);
            if (user && user.email) {
                await sendPrescriptionEmail(user.email, existingPrescription);
            }

            return res.json({
                success: true,
                message: 'Prescription updated successfully',
                prescription: existingPrescription
            });
        }

        // Create new prescription
        console.log('  ➕ Creating new prescription...');
        const prescriptionData = {
            appointmentId,
            userId: appointment.userId,
            docId,
            medications: medications || [],
            diagnosis: diagnosis || '',
            notes: notes || '',
            followUpDate: followUpDate || null,
            fileUrl: fileUrl || null,
            fileName: fileName || null,
            fileType: fileType || null
        };

        console.log('  Prescription data:', JSON.stringify(prescriptionData, null, 2));

        const newPrescription = new prescriptionModel(prescriptionData);
        console.log('  💾 Saving new prescription...');
        const savedPrescription = await newPrescription.save();
        console.log('✅ CREATE PRESCRIPTION: New prescription created successfully');
        console.log('    Prescription ID:', savedPrescription._id);
        console.log('    Has file:', !!savedPrescription.fileUrl);

        // Auto-create record when prescription is created
        try {
            const recordModel = (await import('../models/recordModel.js')).default;
            const existingRecord = await recordModel.findOne({
                appointmentId,
                recordType: 'prescription'
            });

            if (!existingRecord) {
                const recordData = {
                    appointmentId,
                    userId: appointment.userId,
                    docId,
                    recordType: 'prescription',
                    title: `Prescription - ${diagnosis || 'Medication Prescribed'}`,
                    description: `Prescription created with ${medications?.length || 0} medication(s). ${notes || ''}`
                };

                const newRecord = new recordModel(recordData);
                await newRecord.save();
                console.log('Auto-created prescription record for appointment:', appointmentId);
            }
        } catch (recordError) {
            console.error('Error auto-creating prescription record:', recordError);
            // Don't fail the prescription creation if record creation fails
        }

        // Send notification and email to patient
        try {
            const { sendNotification } = await import('../services/notificationService.js');
            await sendNotification(
                appointment.userId,
                'prescription_created',
                'New Prescription Created',
                `A new prescription has been created for you. ${diagnosis ? `Diagnosis: ${diagnosis}` : ''} ${medications?.length ? `(${medications.length} medication(s))` : ''}`,
                appointmentId
            );
        } catch (notifError) {
            console.error('Error sending prescription notification:', notifError);
        }

        // Send email to patient
        const user = await userModel.findById(appointment.userId);
        if (user && user.email) {
            await sendPrescriptionEmail(user.email, savedPrescription);
        }

        console.log('═══════════════════════════════════════════════════════════');
        console.log('✅ CREATE PRESCRIPTION: SUCCESS');
        console.log('  Prescription ID:', savedPrescription?._id || existingPrescription?._id);
        console.log('  Response sent to client');
        console.log('═══════════════════════════════════════════════════════════');

        res.json({
            success: true,
            message: 'Prescription created successfully',
            prescription: savedPrescription || existingPrescription
        });

    } catch (error) {
        console.error('═══════════════════════════════════════════════════════════');
        console.error('❌ CREATE PRESCRIPTION: ERROR');
        console.error('  Error type:', error.constructor.name);
        console.error('  Error message:', error.message);
        console.error('  Error stack:', error.stack);
        console.error('  Request body:', JSON.stringify(req.body, null, 2));
        console.error('  Has file:', !!req.file);
        if (req.file) {
            console.error('  File info:', {
                name: req.file.originalname,
                size: req.file.size,
                type: req.file.mimetype,
                path: req.file.path
            });
        }
        console.error('═══════════════════════════════════════════════════════════');
        res.json({ success: false, message: error.message });
    }
};

// Get prescription by appointment
const getPrescriptionByAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const userId = req.body.userId || req.body.docId;

        if (!appointmentId) {
            return res.json({ success: false, message: 'Appointment ID is required' });
        }

        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment) {
            return res.json({ success: false, message: 'Appointment not found' });
        }

        // Check authorization
        if (appointment.userId !== userId && appointment.docId !== userId) {
            return res.json({ success: false, message: 'Unauthorized access' });
        }

        const prescription = await prescriptionModel.findOne({ appointmentId });

        res.json({ success: true, prescription });

    } catch (error) {
        console.error('Error getting prescription:', error);
        res.json({ success: false, message: error.message });
    }
};

// Get all prescriptions for user
const getUserPrescriptions = async (req, res) => {
    try {
        const userId = req.body.userId;

        // Convert to string if needed (models use String type)
        const userIdStr = userId ? userId.toString() : userId;

        const prescriptions = await prescriptionModel.find({ userId: userIdStr })
            .populate('pharmacyOrderId', 'orderStatus pharmacyId total')
            .sort({ createdAt: -1 });

        res.json({ success: true, prescriptions });

    } catch (error) {
        console.error('Error getting user prescriptions:', error);
        res.json({ success: false, message: error.message });
    }
};

// Get all prescriptions for doctor
const getDoctorPrescriptions = async (req, res) => {
    try {
        const docId = req.body.docId;

        // Convert to string if needed (models use String type)
        const docIdStr = docId ? docId.toString() : docId;

        const prescriptions = await prescriptionModel.find({ docId: docIdStr })
            .sort({ createdAt: -1 });

        res.json({ success: true, prescriptions });

    } catch (error) {
        console.error('Error getting doctor prescriptions:', error);
        res.json({ success: false, message: error.message });
    }
};

// Send prescription email
const sendPrescriptionEmail = async (userEmail, prescription) => {
    try {
        console.log(`📧 [PRESCRIPTION EMAIL] Preparing to send prescription email to: ${userEmail}`);

        const medicationsHtml = prescription.medications.map(med => `
            <div style="margin-bottom: 15px; padding: 10px; background: #f3f4f6; border-radius: 5px;">
                <strong>${med.name}</strong><br>
                Dosage: ${med.dosage}<br>
                Frequency: ${med.frequency}<br>
                Duration: ${med.duration}<br>
                ${med.instructions ? 'Instructions: ' + med.instructions : ''}
            </div>
        `).join('');

        console.log(`📧 [PRESCRIPTION EMAIL] Sending email via ${process.env.EMAIL_HOST || 'smtp.gmail.com'}:${process.env.EMAIL_PORT || 587}`);
        console.log(`   From: ${process.env.EMAIL_USER}`);
        console.log(`   To: ${userEmail}`);
        console.log(`   Subject: Your Prescription - E-ivuzeCONNECT`);

        const subject = 'Your Prescription - E-ivuzeCONNECT';
        const content = `
            <h3>Your Prescription</h3>
            ${prescription.diagnosis ? `<p><strong>Diagnosis:</strong> ${prescription.diagnosis}</p>` : ''}
            <h4>Medications:</h4>
            ${medicationsHtml}
            ${prescription.notes ? `<p><strong>Notes:</strong> ${prescription.notes}</p>` : ''}
            ${prescription.followUpDate ? `<p><strong>Follow-up Date:</strong> ${prescription.followUpDate}</p>` : ''}
        `;

        const emailHtml = getCommonEmailTemplate(subject, content);
        const mailResult = await sendEmail({
            to: userEmail,
            subject,
            html: emailHtml
        });

        console.log(`✅ [PRESCRIPTION EMAIL] Email sent successfully!`);
        console.log(`   Message ID: ${mailResult.messageId}`);

    } catch (error) {
        console.error(`❌ [PRESCRIPTION EMAIL] Error sending prescription email:`, error);
        console.error(`   Error code: ${error.code}`);
        console.error(`   Error message: ${error.message}`);
        if (error.response) {
            console.error(`   SMTP Response: ${error.response}`);
        }
    }
};

// Submit prescription file to pharmacy
const submitPrescriptionToPharmacy = async (req, res) => {
    try {
        const { prescriptionId, pharmacyId, deliveryAddress, paymentType } = req.body;
        const userId = req.body.userId;

        if (!prescriptionId || !pharmacyId) {
            return res.json({ success: false, message: 'Prescription ID and Pharmacy ID are required' });
        }

        // Get prescription
        const prescription = await prescriptionModel.findById(prescriptionId);
        if (!prescription) {
            return res.json({ success: false, message: 'Prescription not found' });
        }

        // Check if user owns this prescription
        if (prescription.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized access' });
        }

        // Check if prescription has a file
        if (!prescription.fileUrl) {
            return res.json({ success: false, message: 'Prescription file not found' });
        }

        // Import pharmacy order controller to create order
        const { createOrderFromPatient } = await import('./pharmacyOrdersController.js');

        // Create pharmacy order with prescription file
        const orderData = {
            userId,
            pharmacyId,
            items: prescription.medications.map(med => ({
                name: med.name,
                qty: 1, // Default quantity
                dosage: med.dosage,
                frequency: med.frequency,
                duration: med.duration
            })),
            deliveryAddress: deliveryAddress || '',
            paymentType: paymentType || 'self',
            prescriptionImage: prescription.fileUrl // Use the prescription file URL
        };

        // Create order using pharmacy order controller logic
        const pharmacyModel = (await import('../models/pharmacyModel.js')).default;
        const pharmacyOrderModel = (await import('../models/pharmacyOrderModel.js')).default;

        const pharmacy = await pharmacyModel.findById(pharmacyId);
        if (!pharmacy || pharmacy.status !== 'APPROVED' || !pharmacy.verified) {
            return res.json({ success: false, message: 'Selected pharmacy is not available' });
        }

        const orderItems = orderData.items.map(item => ({
            name: item.name,
            qty: item.qty,
            price: 0, // Will be set by pharmacy
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration
        }));

        const newOrder = new pharmacyOrderModel({
            patientId: userId,
            pharmacyId,
            items: orderItems,
            deliveryAddress: typeof deliveryAddress === 'string'
                ? { line1: deliveryAddress, city: 'N/A', country: 'Rwanda' }
                : (deliveryAddress || { line1: 'N/A', city: 'N/A', country: 'Rwanda' }),
            paymentStatus: 'pending', // Fixed field name from paymentType to paymentStatus (schema uses paymentStatus)
            // Schema has no 'paymentType' field, usually tracked in audit/notes or separate field?
            // Actually, schema has 'paymentStatus'. Let's check schema again.
            // Schema has 'paymentStatus'. It DOES NOT have 'paymentType'.
            // I will add info to messages or audit. 
            prescriptionImageUrl: prescription.fileUrl,
            prescriptionId: prescription._id, // Set the ID
            orderStatus: 'Pending',
            total: 0,
            messages: [{
                sender: 'patient',
                text: `Prescription submitted. Payment Type: ${paymentType || 'Self'}. Please review.`,
                createdAt: new Date()
            }],
            audit: [{
                action: 'Order created from prescription',
                byUserId: userId,
                byUserModel: 'user',
                timestamp: new Date(),
                note: `Prescription ID: ${prescription._id}`
            }]
        });

        const savedOrder = await newOrder.save();

        // Update prescription to mark as submitted
        prescription.submittedToPharmacy = true;
        prescription.pharmacyOrderId = savedOrder._id.toString();
        await prescription.save();

        res.json({
            success: true,
            message: 'Prescription submitted to pharmacy successfully',
            order: savedOrder
        });

    } catch (error) {
        console.error('Error submitting prescription to pharmacy:', error);
        res.json({ success: false, message: error.message });
    }
};

export {
    createPrescription,
    getPrescriptionByAppointment,
    getUserPrescriptions,
    getDoctorPrescriptions,
    submitPrescriptionToPharmacy
};




