import jwt from 'jsonwebtoken';
import { redactForLogs } from '../utils/redactForLogs.js';

// Optional user authentication middleware
// If token is present and valid, sets req.body.userId
// If token is missing or invalid, sets req.body.userId to null (allows anonymous access)

const authUserOptional = async (req, res, next) => {
  try {
    if (!req.body || typeof req.body !== 'object') req.body = {};
    const { token } = req.headers;
    
    if (!token) {
      req.body.userId = null;
      return next();
    }

    try {
      const token_decode = jwt.verify(token, process.env.JWT_SECRET);
      req.body.userId = token_decode.id;
      console.log('✓ AUTH USER OPTIONAL: Token verified, userId:', token_decode.id);
    } catch (error) {
      req.body.userId = null;
      console.log('⚠ AUTH USER OPTIONAL: Invalid token, allowing anonymous access');
    }

    next();
  } catch (error) {
    console.error('❌ AUTH USER OPTIONAL ERROR:', redactForLogs(error));
    req.body.userId = null;
    next();
  }
};

export default authUserOptional;

