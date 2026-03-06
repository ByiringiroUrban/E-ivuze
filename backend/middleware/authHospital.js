import jwt from 'jsonwebtoken';
import hospitalUserModel from '../models/hospitalUserModel.js';
import hospitalModel from '../models/hospitalModel.js';

const authHospital = async (req, res, next) => {
  try {
    const hToken = req.headers.htoken || req.headers['htoken'] || req.headers['hToken'];

    if (!hToken) {
      return res.json({ success: false, message: 'Not Authorized - No hospital token provided' });
    }

    const token_decode = jwt.verify(hToken, process.env.JWT_SECRET);

    const hospitalUser = await hospitalUserModel.findById(token_decode.id);
    if (!hospitalUser) {
      return res.json({ success: false, message: 'Not Authorized - Hospital user not found' });
    }

    const hospital = await hospitalModel.findById(hospitalUser.hospitalId);
    if (!hospital) {
      return res.json({ success: false, message: 'Not Authorized - Hospital not found' });
    }

    if (hospital.status !== 'APPROVED') {
      return res.json({ success: false, message: 'Hospital not approved', hospitalStatus: hospital.status });
    }

    // Check trial period and subscription
    const now = new Date();
    const trialExpired = hospital.trialEndsAt && new Date(hospital.trialEndsAt) < now;
    const subscriptionExpired = hospital.subscriptionExpiresAt && new Date(hospital.subscriptionExpiresAt) < now;
    const hasActiveSubscription = hospital.subscriptionPlan && hospital.subscriptionExpiresAt && new Date(hospital.subscriptionExpiresAt) > now;

    // If trial expired and no active subscription, block access
    if (trialExpired && !hasActiveSubscription) {
      return res.json({ 
        success: false, 
        message: 'Trial period expired. Please subscribe to continue using our services.',
        trialExpired: true,
        requiresPayment: true
      });
    }

    req.hospitalUser = hospitalUser;
    req.hospitalId = hospitalUser.hospitalId;
    req.hospital = hospital;
    req.trialExpired = trialExpired;
    req.hasActiveSubscription = hasActiveSubscription;
    next();

  } catch (error) {
    console.error('Hospital auth error:', error);
    res.json({ success: false, message: 'Invalid token. Please login again.' });
  }
};

export default authHospital;
