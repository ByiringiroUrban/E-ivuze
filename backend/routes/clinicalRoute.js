import express from 'express'
import {
    createClinicalVisit, getPatientVisits, getVisitDetails,
    addVitalSign, getPatientVitals,
    addImmunization, getPatientImmunizations,
    createReferral, updateReferralStatus, getHospitalReferrals, getPatientReferrals,
    createLabOrder, getPatientLabOrders, notifyPatientOfLabResult,
    createPrescription, getPatientPrescriptions
} from '../controllers/clinicalController.js'
import authDoctor from '../middleware/authDoctor.js'
import authUser from '../middleware/authUser.js'
import upload from '../middleware/multer.js'

const clinicalRouter = express.Router()

// --- DOCTOR ROUTES (Write Access) ---

// Clinical Visits (SOAP)
clinicalRouter.post('/visit/create', authDoctor, createClinicalVisit)

// Vitals & Immunizations
clinicalRouter.post('/vitals/add', authDoctor, addVitalSign)
clinicalRouter.post('/immunization/add', authDoctor, addImmunization)

// Referrals
clinicalRouter.post('/referral/create', authDoctor, createReferral)
clinicalRouter.post('/referral/update', authDoctor, updateReferralStatus) // Accept/Reject
clinicalRouter.post('/referral/hospital', authDoctor, getHospitalReferrals) // Incoming referrals

// --- SHARED/PATIENT ROUTES (Read Access) ---

// Patient can see their own history
// Patient can see their own history
clinicalRouter.post('/patient-visits', authUser, getPatientVisits)
clinicalRouter.post('/patient-vitals', authUser, getPatientVitals)
clinicalRouter.post('/patient-immunizations', authUser, getPatientImmunizations)
clinicalRouter.post('/patient-referrals', authUser, getPatientReferrals)
clinicalRouter.post('/visit/details', authUser, getVisitDetails)

// Doctor can see patient history (assuming they have access - for now using authDoctor for read too)
// In a real system, you'd check if doctor has relationship with patient. Here we trust authDoctor.
clinicalRouter.post('/doctor/patient-visits', authDoctor, getPatientVisits) // Post because we send patientId in body
clinicalRouter.post('/doctor/patient-vitals', authDoctor, getPatientVitals)
clinicalRouter.post('/doctor/patient-immunizations', authDoctor, getPatientImmunizations)

clinicalRouter.post('/doctor/visit/details', authDoctor, getVisitDetails)
clinicalRouter.post('/doctor/patient-referrals', authDoctor, getPatientReferrals)

// Lab Orders
clinicalRouter.post('/lab/create', authDoctor, createLabOrder)
clinicalRouter.post('/patient-labs', authUser, getPatientLabOrders) // Patient viewing own
clinicalRouter.post('/doctor/patient-labs', authDoctor, getPatientLabOrders) // Doctor viewing patient's
clinicalRouter.post('/doctor/notify-patient-lab', authDoctor, notifyPatientOfLabResult)

// Prescriptions
clinicalRouter.post('/prescription/create', authDoctor, upload.single('prescriptionFile'), createPrescription)
clinicalRouter.post('/patient-prescriptions', authUser, getPatientPrescriptions)
clinicalRouter.post('/doctor/patient-prescriptions', authDoctor, getPatientPrescriptions)

export default clinicalRouter
