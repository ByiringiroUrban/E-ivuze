import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { redactForLogs } from '../utils/redactForLogs.js';

const authAiOptional = async (req, res, next) => {
  try {
    if (!req.body || typeof req.body !== 'object') req.body = {};
    const headers = req.headers || {};

    const candidateToken =
      headers.token ||
      headers.dtoken ||
      headers.atoken ||
      headers.htoken ||
      headers.ptoken ||
      headers.ltoken ||
      headers.dToken ||
      headers.aToken ||
      headers.hToken ||
      headers.pToken ||
      headers.lToken;

    if (!candidateToken) {
      req.body.userId = null;
      return next();
    }

    try {
      const decoded = jwt.verify(candidateToken, process.env.JWT_SECRET);
      if (decoded && typeof decoded === 'object' && decoded.id) {
        req.body.userId = decoded.id;
      } else if (typeof decoded === 'string' && decoded) {
        const derivedHex = crypto.createHash('sha256').update(decoded).digest('hex').slice(0, 24);
        req.body.userId = derivedHex;
      } else {
        req.body.userId = null;
      }
    } catch (error) {
      req.body.userId = null;
    }

    return next();
  } catch (error) {
    console.error('❌ AUTH AI OPTIONAL ERROR:', redactForLogs(error));
    req.body.userId = null;
    return next();
  }
};

export default authAiOptional;
