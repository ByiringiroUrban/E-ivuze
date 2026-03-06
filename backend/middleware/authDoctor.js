import jwt from 'jsonwebtoken'
import doctorModel from '../models/doctorModel.js'

// doctor authentication middleware

const authDoctor = async (req, res, next) => {
    try {

        // Check for both dtoken and dToken (case-insensitive)
        const dtoken = req.headers.dtoken || req.headers.dToken;
        if (!dtoken) {
            console.log('❌ AUTH DOCTOR: No token provided');
            return res.json({ success: false, message: 'Not Authorized Login Again' })
        }

        const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET)
        const docId = token_decode.id

        // Check if doctor exists and is approved
        const doctor = await doctorModel.findById(docId);
        if (!doctor) {
            console.log('❌ AUTH DOCTOR: Doctor not found');
            return res.json({ success: false, message: 'Doctor not found' })
        }

        // Check if doctor is soft-deleted
        if (doctor.deleted_at) {
            console.log('❌ AUTH DOCTOR: Doctor account has been deleted');
            return res.json({ success: false, message: 'Your account has been deleted' })
        }

        // Check if doctor status is approved (required for dashboard access)
        if (doctor.status !== 'approved') {
            console.log(`❌ AUTH DOCTOR: Doctor status is ${doctor.status}, not approved`);
            return res.json({
                success: false,
                message: doctor.status === 'pending'
                    ? 'Your account is pending approval. Please wait for admin approval.'
                    : doctor.status === 'rejected'
                        ? `Your account has been rejected.${doctor.rejection_reason ? ' Reason: ' + doctor.rejection_reason : ''}`
                        : 'Your account is not approved. Please contact support.'
            })
        }

        req.body.docId = docId
        req.docId = docId // Store in req object as well (safer for multer)
        req.doctorId = docId // Alternative location
        console.log('✓ AUTH DOCTOR: Token verified, docId:', docId);

        next()


    } catch (error) {
        console.error('❌ AUTH DOCTOR ERROR:', error.message);
        res.json({ success: false, message: error.message })

    }
}

export default authDoctor