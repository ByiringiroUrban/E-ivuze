import jwt from 'jsonwebtoken';
import pharmacyUserModel from '../models/pharmacyUserModel.js';

const authPharmacy = async (req, res, next) => {
  try {
    const token = req.headers.token || req.headers['token'];
    
    if (!token) {
      return res.json({ success: false, message: 'Not Authorized. Please login again.' });
    }

    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    const pharmacyUser = await pharmacyUserModel.findById(token_decode.id).populate('pharmacyId');
    
    if (!pharmacyUser) {
      return res.json({ success: false, message: 'Pharmacy user not found' });
    }

    req.body.pharmacyUserId = pharmacyUser._id;
    req.body.pharmacyId = pharmacyUser.pharmacyId._id;
    req.body.pharmacyUser = pharmacyUser;
    
    next();
  } catch (error) {
    console.error('Pharmacy auth error:', error);
    res.json({ success: false, message: error.message || 'Authentication failed' });
  }
};

export default authPharmacy;

