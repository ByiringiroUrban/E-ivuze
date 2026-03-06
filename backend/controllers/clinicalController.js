import clinicalVisitModel from '../models/clinicalVisitModel.js';
import vitalSignModel from '../models/vitalSignModel.js';
import immunizationModel from '../models/immunizationModel.js';
import transferModel from '../models/transferModel.js';
import userModel from '../models/userModel.js';
import doctorModel from '../models/doctorModel.js';
import labOrderModel from '../models/labOrderModel.js';
import prescriptionModel from '../models/prescriptionModel.js';
import { v2 as cloudinary } from 'cloudinary';
import { emitToMeeting } from '../services/socketService.js';
import { sendNotification, sendNotificationToLab } from '../services/notificationService.js';

// --- CLINICAL VISITS (SOAP) ---

// Create a new clinical visit (SOAP Note)
const createClinicalVisit = async (req, res) => {
    try {
        const {
            patientId, facilityId, appointmentId,
            visitType, chiefComplaint, historyOfPresentIllness,
            physicalExamNotes, diagnosis, treatmentPlan,
            proceduresPerformed, outcome, followUpDate
        } = req.body;

        const docId = req.docId || req.body.docId;

        const hId = facilityId || "GENERAL"; // Default facility if not provided

        // Validation
        if (!patientId || !docId || !visitType || !chiefComplaint || !diagnosis || !treatmentPlan) {
            console.log("Missing fields check:", { patientId, docId, visitType, chiefComplaint, diagnosis, treatmentPlan });
            return res.json({ success: false, message: "Missing required SOAP fields" });
        }

        // Check if diagnosis is a string (from simple form) and convert to array format
        let finalDiagnosis = diagnosis;
        if (typeof diagnosis === 'string') {
            finalDiagnosis = [{ description: diagnosis, type: 'Primary' }];
        }

        const newVisit = new clinicalVisitModel({
            patientId,
            docId,
            facilityId: hId,
            appointmentId,
            visitType,
            chiefComplaint,
            historyOfPresentIllness,
            physicalExamNotes,
            diagnosis: finalDiagnosis,
            treatmentPlan,
            proceduresPerformed,
            outcome,
            followUpDate
        });

        await newVisit.save();

        // Emit real-time update for meetings
        if (appointmentId) {
            emitToMeeting(appointmentId, 'clinical_update', { type: 'NOTE', data: newVisit });
        }

        res.json({ success: true, message: "Clinical visit recorded", visitId: newVisit._id });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get all visits for a patient
const getPatientVisits = async (req, res) => {
    try {
        const { patientId } = req.body; // or req.query
        const visits = await clinicalVisitModel.find({ patientId }).sort({ visitDate: -1 });
        res.json({ success: true, visits });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get details of a single visit
const getVisitDetails = async (req, res) => {
    try {
        const { visitId } = req.body;
        const visit = await clinicalVisitModel.findById(visitId);
        if (!visit) return res.json({ success: false, message: "Visit not found" });
        res.json({ success: true, visit });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// --- VITAL SIGNS ---

// Add a vital sign
const addVitalSign = async (req, res) => {
    try {
        const { userId, appointmentId, type, value, unit, isAbnormal, notes } = req.body;
        const docId = req.docId || "SELF"; // If called by doctor, use ID. If patient self-report, treat differently or use "SELF".

        const newVital = new vitalSignModel({
            userId, docId, appointmentId, type, value, unit, isAbnormal, notes
        });

        await newVital.save();

        // Emit real-time update for meetings
        if (appointmentId) {
            emitToMeeting(appointmentId, 'clinical_update', { type: 'VITAL', data: newVital });
        }

        res.json({ success: true, message: "Vital sign recorded", vitalId: newVital._id });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get vital signs for a patient (can filter by type)
const getPatientVitals = async (req, res) => {
    try {
        const { userId, type } = req.body; // type is optional
        const query = { userId };
        if (type) query.type = type;

        const vitals = await vitalSignModel.find(query).sort({ recordedAt: -1 });
        res.json({ success: true, vitals });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// --- IMMUNIZATIONS ---

// Add immunization
const addImmunization = async (req, res) => {
    try {
        const { userId, vaccineName, doseNumber, batchNumber, facilityId, administeredBy, nextDueDate, reaction, notes } = req.body;

        const newImmunization = new immunizationModel({
            userId, vaccineName, doseNumber, batchNumber,
            facilityId, administeredBy, nextDueDate, reaction, notes
        });

        await newImmunization.save();

        // Note: Immunization doesn't always have an appointmentId direct in req.body currently
        // But if it's there (we can add it to the request from frontend), we emit it.
        if (req.body.appointmentId) {
            emitToMeeting(req.body.appointmentId, 'clinical_update', { type: 'VACCINE', data: newImmunization });
        }

        res.json({ success: true, message: "Immunization recorded" });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get patient immunizations
const getPatientImmunizations = async (req, res) => {
    try {
        const { userId } = req.body;
        const immunizations = await immunizationModel.find({ userId }).sort({ dateAdministered: -1 });
        res.json({ success: true, immunizations });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// --- REFERRALS (TRANSFERS) ---

// Create a referral
const createReferral = async (req, res) => {
    try {
        const { toHospital, patientId, reason, clinicalSummary, priority } = req.body;
        const docId = req.docId;

        if (!docId) {
            return res.json({ success: false, message: "Doctor authentication required" });
        }

        const doctor = await doctorModel.findById(docId);
        if (!doctor) {
            return res.json({ success: false, message: "Doctor record not found" });
        }

        const newReferral = new transferModel({
            fromHospital: doctor.hospitalId || null,
            fromDoctor: docId,
            toHospital,
            patientId,
            reason,
            clinicalSummary,
            priority: priority || 'Routine',
            status: 'PENDING'
        });

        await newReferral.save();

        if (req.body.appointmentId) {
            emitToMeeting(req.body.appointmentId, 'clinical_update', { type: 'REFERRAL', data: newReferral });
        }

        res.json({ success: true, message: "Referral request created", referralId: newReferral._id });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Update referral status (Accept/Reject) and add feedback
const updateReferralStatus = async (req, res) => {
    try {
        const { referralId, status, rejectionReason, referralFeedback, outcome } = req.body;

        const updateData = { status };
        if (status === 'ACCEPTED') updateData.acceptedAt = Date.now();
        if (status === 'REJECTED') {
            updateData.rejectedAt = Date.now();
            updateData.referralFeedback = rejectionReason ? `REJECTION REASON: ${rejectionReason}. ` + (referralFeedback || '') : referralFeedback;
        }

        if (referralFeedback && status !== 'REJECTED') updateData.referralFeedback = referralFeedback;
        if (outcome) updateData.outcome = outcome;

        const updatedReferral = await transferModel.findByIdAndUpdate(referralId, updateData, { new: true });

        if (!updatedReferral) return res.json({ success: false, message: "Referral not found" });

        res.json({ success: true, message: "Referral updated", referral: updatedReferral });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get referrals for a specific hospital (Incoming)
const getHospitalReferrals = async (req, res) => {
    try {
        const { hospitalName } = req.body;
        // Note: intended to find by 'toHospital' matching 'hospitalName'
        // In real app, we'd use hospitalId from auth token. 
        // For MVP with text inputs, we might need a loose match or require exact string.

        const referrals = await transferModel.find({ toHospital: hospitalName }).sort({ createdAt: -1 });
        res.json({ success: true, referrals });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get patient referrals
const getPatientReferrals = async (req, res) => {
    try {
        const { userId } = req.body;
        const referrals = await transferModel.find({ patientId: userId })
            .populate('fromDoctor', 'name')
            .sort({ createdAt: -1 });
        res.json({ success: true, referrals });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};



// --- LAB ORDERS ---

// Create Lab Order
const createLabOrder = async (req, res) => {
    try {
        const { patientId, appointmentId, testName, testCategory, sampleType, priority, notes, labId } = req.body;
        const docId = req.docId;

        const newOrder = new labOrderModel({
            patientId, docId, appointmentId, testName, testCategory, sampleType, priority, notes, labId
        });

        await newOrder.save();

        if (appointmentId) {
            emitToMeeting(appointmentId, 'clinical_update', { type: 'LAB', data: newOrder });
        }

        // Notify Patient
        await sendNotification(
            patientId,
            'lab_order_created',
            'New Lab Test Ordered',
            `Your doctor has ordered a new lab test: ${testName}.`,
            appointmentId
        );

        // Notify Lab
        if (labId) {
            await sendNotificationToLab(
                labId,
                'lab_order_created',
                'New Lab Order Received',
                `You have a new lab order for test: ${testName}. Priority: ${priority || 'Normal'}.`,
                appointmentId
            );
        }

        res.json({ success: true, message: "Lab test ordered", orderId: newOrder._id });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get Patient Lab Orders
const getPatientLabOrders = async (req, res) => {
    try {
        const { patientId, userId } = req.body; // Logic to handle both doctor requesting (patientId) and patient requesting (userId)
        const targetId = patientId || userId;

        const orders = await labOrderModel.find({ patientId: targetId })
            .populate('docId', 'name')
            .populate('labId', 'name address phone')
            .sort({ orderedAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Notify patient of lab result (Doctor action)
const notifyPatientOfLabResult = async (req, res) => {
    try {
        const { orderId } = req.body;
        const docId = req.docId; // from authDoctor

        const order = await labOrderModel.findById(orderId);
        if (!order) return res.json({ success: false, message: "Order not found" });

        if (order.docId !== String(docId)) {
            // In some cases docId might be an objectId or string, handle carefully
        }

        order.notifiedPatient = true;
        await order.save();

        // Send Notification
        await sendNotification(
            order.patientId,
            'LAB_RESULT',
            'Lab Results Available',
            `Your doctor has shared the results for ${order.testName}. You can now view them in your history.`,
            order.appointmentId
        );

        res.json({ success: true, message: "Patient notified successfully" });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// --- PRESCRIPTIONS ---

// Create Prescription
const createPrescription = async (req, res) => {
    try {
        const { patientId, appointmentId, medications, diagnosis, notes, isEmergency } = req.body;
        const docId = req.docId;

        if (!docId) {
            return res.json({ success: false, message: "Doctor authentication required" });
        }

        let parsedMedications = medications;
        if (typeof medications === 'string') {
            try {
                parsedMedications = JSON.parse(medications);
            } catch (e) {
                console.error("Failed to parse medications JSON", e);
            }
        }

        if (!parsedMedications || parsedMedications.length === 0) {
            // If it's just a file upload, we might not have electronic medications. 
            // In some cases, we might require either medications OR a file.
            if (!req.file) {
                return res.json({ success: false, message: "Please provide either medications or a scanned prescription file." });
            }
        }

        const doctor = await doctorModel.findById(docId);
        const facilityId = doctor?.hospitalId || null;

        const rxData = {
            userId: patientId,
            docId,
            facilityId,
            appointmentId,
            medications: parsedMedications || [],
            diagnosis,
            notes,
            isEmergency: isEmergency === 'true' || isEmergency === true,
            status: 'Active'
        };

        // Handle File Upload
        if (req.file) {
            const imageUpload = await cloudinary.uploader.upload(req.file.path, { resource_type: "auto" });
            rxData.fileUrl = imageUpload.secure_url;
            rxData.fileName = req.file.originalname;
            rxData.fileType = req.file.mimetype;
        }

        const newRx = new prescriptionModel(rxData);

        await newRx.save();

        if (appointmentId) {
            emitToMeeting(appointmentId, 'clinical_update', { type: 'PRESCRIPTION', data: newRx });
        }

        // Notify Patient
        await sendNotification(
            patientId,
            'prescription_created',
            'New Prescription Created',
            `Your doctor has created a new prescription. You can now forward it to a pharmacy.`,
            appointmentId
        );

        res.json({ success: true, message: "Prescription created", rxId: newRx._id });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get Patient Prescriptions
const getPatientPrescriptions = async (req, res) => {
    try {
        const { patientId, userId } = req.body;
        const targetId = patientId || userId;

        const prescriptions = await prescriptionModel.find({ userId: targetId }).sort({ createdAt: -1 });
        res.json({ success: true, prescriptions });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

export {
    createClinicalVisit, getPatientVisits, getVisitDetails,
    addVitalSign, getPatientVitals,
    addImmunization, getPatientImmunizations,
    createReferral, updateReferralStatus, getHospitalReferrals, getPatientReferrals,
    createLabOrder, getPatientLabOrders, notifyPatientOfLabResult,
    createPrescription, getPatientPrescriptions
};
