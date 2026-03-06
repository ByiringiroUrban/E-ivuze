import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import http from 'http'
import { Server as SocketIOServer } from 'socket.io'
import jwt from 'jsonwebtoken'
import adminRouter from './routes/adminRoute.js'
import doctorRouter from './routes/doctorRoute.js'
import userRouter from './routes/userRoute.js'
import hospitalRouter from './routes/hospitalRoute.js'
import aiRouter from './routes/aiRoute.js'
import aiSuggestionRouter from './routes/aiSuggestionRoute.js'
import pharmacyRouter from './routes/pharmacyRoute.js'
import chatRouter from './routes/chatRoute.js'
import publicRouter from './routes/publicRoute.js'
import clinicalRouter from './routes/clinicalRoute.js'
import searchRouter from './routes/searchRoute.js'
import privacyRouter from './routes/privacyRoute.js'
import chatRoomModel from './models/chatRoomModel.js'
import chatMessageModel from './models/chatMessageModel.js'
import startAppointmentReminders from './services/appointmentReminderService.js'
import startClinicalReminders from './services/clinicalReminderService.js'
import dotenv from 'dotenv'

import { setIo } from './services/socketService.js'
import { installConsoleRedaction } from './utils/redactForLogs.js'

dotenv.config()

if (process.env.LOG_REDACTION_DISABLED !== 'true') {
  installConsoleRedaction()
}

const adminEmail = process.env.ADMIN_EMAIL || 'admin@rwandahealth.com'
const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123456'
const expectedAdminTokenValue = adminEmail + adminPassword

// Check for required Agora environment variables on startup
const checkAgoraConfig = () => {
  const appId = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;

  if (!appId || appId.trim() === '') {
    console.warn('\n⚠️  WARNING: AGORA_APP_ID is not set in .env file');
    console.warn('   Video calling will not work until this is configured.');
    console.warn('   To fix: Add AGORA_APP_ID=your_app_id to backend/.env file');
    console.warn('   Get your App ID from: https://www.agora.io/\n');
  }

  if (!appCertificate || appCertificate.trim() === '') {
    console.warn('\n⚠️  WARNING: AGORA_APP_CERTIFICATE is not set in .env file');
    console.warn('   Video calling will not work until this is configured.');
    console.warn('   To fix: Add AGORA_APP_CERTIFICATE=your_certificate to backend/.env file');
    console.warn('   Get your App Certificate from: https://www.agora.io/\n');
  }

  if (appId && appId.trim() !== '' && appCertificate && appCertificate.trim() !== '') {
    console.log('✅ Agora credentials configured');
  }
};



checkAgoraConfig();


// app config 
const app = express();
const httpServer = http.createServer(app)
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();

// CORS configuration - MUST be before other middlewares
// Build allowed origins from static list + optional env var (comma-separated)
const baseAllowedOrigins = [
  'https://E-ivuze.com',
  'https://www.E-ivuze.com',
  'https://www.E-ivuze.com/',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:8081',
  'http://localhost:19006',
  'exp://localhost:8081',
  'https://onehalethlineconnectdoctor.vercel.app',
  'https://onehalethlineconnectdoctor-1.onrender.com/',
  'http://localhost:4000',
  'http://10.110.9.158:5173',
  'http://10.110.9.158:5174',
  'http://10.150.12.251:4000',
  'http://10.150.12.251:5173',
  'http://10.150.12.251:5174',
  'exp://10.110.9.158:19001',
  'exp://10.150.12.251:19001',
  'exp://localhost:19001'
];
const envAllowed = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
const allowedOrigins = [...new Set([...baseAllowedOrigins, ...envAllowed])];

const isAllowedOrigin = (origin) => {
  // Allow requests without Origin (curl, mobile apps, Postman)
  if (!origin) return true;

  const normalize = (url) => url.replace(/\/+$/, '');
  const normalizedOrigin = normalize(origin);
  const normalizedAllowed = allowedOrigins.map(normalize);

  // Debug logging removed - CORS issue should be resolved

  // Exact match check
  if (normalizedAllowed.includes(normalizedOrigin)) return true;

  // Allow localhost with any port for development
  if (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) return true;

  // Allow Expo Go connections (exp://)
  if (origin.startsWith('exp://')) return true;

  // Allow local network IPs (10.x.x.x, 192.168.x.x, 172.16-31.x.x) for development
  if (/^https?:\/\/(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.)/.test(origin)) return true;

  // Allow any Vercel preview/production app domains
  if (origin.endsWith('.vercel.app')) return true;

  // Allow Render preview domains
  if (origin.includes('.onrender.com')) return true;

  return false;
};

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'token', 'dToken', 'aToken', 'hToken', 'pToken', 'lToken', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));

app.disable('x-powered-by');

const getClientIp = (req) => {
  const xf = req.headers['x-forwarded-for'];
  if (typeof xf === 'string' && xf.trim()) return xf.split(',')[0].trim();
  return req.socket?.remoteAddress || req.ip || 'unknown';
};

const parsePositiveInt = (value, fallback) => {
  const n = parseInt(String(value || ''), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const createInMemoryRateLimiter = ({ windowMs, max, keyPrefix, skip }) => {
  const store = new Map();
  let lastCleanupAt = 0;

  const cleanup = (now) => {
    if (now - lastCleanupAt < Math.max(10_000, windowMs)) return;
    lastCleanupAt = now;
    for (const [key, entry] of store.entries()) {
      if (!entry || entry.resetAt <= now) store.delete(key);
    }
  };

  return (req, res, next) => {
    try {
      if (skip && skip(req)) return next();

      const now = Date.now();
      cleanup(now);

      const ip = getClientIp(req);
      const key = `${keyPrefix}:${ip}`;
      const entry = store.get(key);

      if (!entry || entry.resetAt <= now) {
        store.set(key, { count: 1, resetAt: now + windowMs });
        return next();
      }

      if (entry.count >= max) {
        const retryAfterSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
        res.setHeader('Retry-After', String(retryAfterSeconds));
        return res.status(429).json({
          success: false,
          message: 'Too many requests. Please try again later.'
        });
      }

      entry.count += 1;
      store.set(key, entry);
      return next();
    } catch (e) {
      return next();
    }
  };
};

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  if (req.path && req.path.startsWith('/api')) {
    res.setHeader('Cache-Control', 'no-store');
  }
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  }
  next();
});

const RATE_LIMIT_WINDOW_MS = parsePositiveInt(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000);
const RATE_LIMIT_MAX = parsePositiveInt(process.env.RATE_LIMIT_MAX, 600);
const AI_RATE_LIMIT_MAX = parsePositiveInt(process.env.AI_RATE_LIMIT_MAX, 120);

const generalLimiter = createInMemoryRateLimiter({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
  keyPrefix: 'rl',
  skip: (req) => req.method === 'OPTIONS' || req.path === '/' || req.path.startsWith('/socket.io')
});

const aiLimiter = createInMemoryRateLimiter({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: AI_RATE_LIMIT_MAX,
  keyPrefix: 'ai',
  skip: (req) => req.method === 'OPTIONS'
});

app.use(generalLimiter);
app.use('/api/ai', aiLimiter);
app.use('/api/search', aiLimiter);

// Handle preflight OPTIONS requests explicitly
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  if (origin && isAllowedOrigin(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, token, dToken, aToken, hToken, pToken, lToken, X-Requested-With');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
  }
  res.sendStatus(200);
});

// Add explicit headers for all responses
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && isAllowedOrigin(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, token, dToken, aToken, hToken, pToken, lToken, X-Requested-With');
  }
  next();
});

// JSON parsing middleware (after CORS)
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '2mb' }));

// Request logger middleware for video call endpoints - reduced logging
app.use((req, res, next) => {
  if (req.path.includes('video-call')) {
    // Only log errors or critical issues, not every request
    const hasToken = !!(req.headers.token || req.headers.atoken || req.headers.dtoken);
    if (!hasToken) {
      console.log('⚠️ Video call request without authentication:', req.path);
    }
  }
  next();
});


// api endpoint 

import labRouter from './routes/labRoute.js'
import mailRouter from './routes/mailRoute.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/admin', adminRouter)
app.use('/api/doctor', doctorRouter)
app.use('/api/user', userRouter)
app.use('/api/hospitals', hospitalRouter)
app.use('/api/hospital', hospitalRouter)
app.use('/api/ai', aiRouter)
app.use('/api/ai', aiSuggestionRouter)
app.use('/api/search', searchRouter)
app.use('/api/pharmacy', pharmacyRouter)
app.use('/api/lab', labRouter)
app.use(chatRouter)
app.use('/api/public', publicRouter)
app.use('/api/clinical', clinicalRouter)
app.use('/api/privacy', privacyRouter)
app.use(mailRouter)

// Log AI routes on startup
console.log('\n🤖 AI Assistant endpoints:');
console.log('  - POST /api/ai/conversations');
console.log('  - GET  /api/ai/conversations');
console.log('  - GET  /api/ai/conversations/:id');
console.log('  - PUT  /api/ai/conversations/:id');
console.log('  - DELETE /api/ai/conversations/:id');
console.log('  - POST /api/ai/suggest');
console.log('  - POST /api/ai/conversations/:id/handoff');


app.get('/', (req, res) => {
  res.send('API WORKING')
})

// Socket.io setup
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests without origin (mobile apps)
      if (!origin) return callback(null, true);
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        console.log('Socket.io blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['*'],
  }
})

setIo(io)

const memberKey = (role, userId) => `${role}:${userId}`
const memberSockets = new Map()
const socketMembers = new Map()

const registerSocketMember = (socket, role, id) => {
  const key = memberKey(role, id)
  if (!memberSockets.has(key)) memberSockets.set(key, new Set())
  memberSockets.get(key).add(socket.id)
  socketMembers.set(socket.id, key)
}

const unregisterSocket = (socketId) => {
  const key = socketMembers.get(socketId)
  if (!key) return
  const sockets = memberSockets.get(key)
  if (sockets) {
    sockets.delete(socketId)
    if (sockets.size === 0) memberSockets.delete(key)
  }
  socketMembers.delete(socketId)
}

const emitToRoomMembers = (room, event, payload, excludeSocketId = null) => {
  if (!room?.members?.length) return
  room.members.forEach(member => {
    const key = memberKey(member.role, member.userId)
    const sockets = memberSockets.get(key)
    if (!sockets) return
    sockets.forEach(socketId => {
      if (socketId === excludeSocketId) return
      io.to(socketId).emit(event, payload)
    })
  })
}

io.on('connection', (socket) => {
  const authPayload = socket.handshake?.auth || {}
  let principal = null
  const tryAuth = (token, roleHint) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const role = roleHint || authPayload.role || 'patient'
      let id = decoded.id || decoded

      if (role === 'admin') {
        if (decoded !== expectedAdminTokenValue) {
          throw new Error('Invalid token')
        }
        id = 'admin'
      }

      principal = { id, role }
      socket.data.principal = principal
      unregisterSocket(socket.id)
      registerSocketMember(socket, role, id)
      socket.emit('authenticated', { success: true })
    } catch (e) {
      socket.emit('authenticated', { success: false, message: 'Invalid token' })
    }
  }

  if (authPayload.token) {
    tryAuth(authPayload.token, authPayload.role)
  }

  socket.on('authenticate', (token, roleHint) => {
    tryAuth(token, roleHint)
  })

  socket.on('joinMeeting', (appointmentId) => {
    socket.join(`meeting:${appointmentId}`);
    console.log(`Socket ${socket.id} joined meeting room: meeting:${appointmentId}`);
  });

  socket.on('joinRoom', async (roomId) => {
    try {
      if (!socket.data.principal) return socket.emit('error', { message: 'Not authenticated' })
      const { id, role } = socket.data.principal
      const room = await chatRoomModel.findById(roomId)
      if (!room) return socket.emit('error', { message: 'Room not found' })
      const isMember = room.members.some(m => String(m.userId) === String(id) && m.role === role)
      if (!isMember) return socket.emit('error', { message: 'Not a member of this room' })
      socket.join(String(roomId))
      const key = memberKey(role, id)
      const state = room.memberStates.find(s => s.key === key)
      if (state) state.lastReadAt = new Date(); else room.memberStates.push({ key, lastReadAt: new Date() })
      await room.save()
    } catch (error) {
      socket.emit('error', { message: error.message })
    }
  })

  socket.on('sendMessage', async (payload, callback = () => { }) => {
    try {
      const { roomId, text } = payload || {}
      if (!socket.data.principal) return socket.emit('error', { message: 'Not authenticated' })
      const { id, role } = socket.data.principal
      const room = await chatRoomModel.findById(roomId)
      if (!room) return socket.emit('error', { message: 'Room not found' })
      const isMember = room.members.some(m => String(m.userId) === String(id) && m.role === role)
      if (!isMember) return socket.emit('error', { message: 'Not a member of this room' })
      const msg = await chatMessageModel.create({ roomId, sender: { role, userId: id }, text })
      room.lastMessage = text
      room.updatedAt = new Date()
      await room.save()
      emitToRoomMembers(room, 'receiveMessage', msg, socket.id)
      callback({ success: true, message: msg })
    } catch (error) {
      socket.emit('error', { message: error.message })
      callback({ success: false, message: error.message })
    }
  })

  socket.on('disconnect', () => {
    unregisterSocket(socket.id)
  })
})

// Bind to 0.0.0.0 to accept connections from all network interfaces (including Android emulator)
httpServer.listen(port, '0.0.0.0', () => {
  console.log("=".repeat(80));
  console.log(`🚀 Server started on port ${port}`);
  console.log(`📅 Started at: ${new Date().toISOString()}`);
  console.log("=".repeat(80));

  // Start appointment reminder service
  try {
    startAppointmentReminders();
  } catch (error) {
    console.error('Failed to start appointment reminder service:', error);
  }

  // Start clinical reminder service
  try {
    startClinicalReminders();
  } catch (error) {
    console.error('Failed to start clinical reminder service:', error);
  }

  console.log('\n📝 Video call endpoints:');
  console.log('  - POST /api/user/video-call/token');
  console.log('  - POST /api/user/video-call/end');
  console.log('  - POST /api/doctor/video-call/token');
  console.log('  - POST /api/doctor/video-call/end');
  console.log('\n💬 Chat endpoints:');
  console.log('  - GET  /api/chats');
  console.log('  - POST /api/chats');
  console.log('  - GET  /api/chats/:roomId/messages');
  console.log('\n💳 Payment endpoints:');
  console.log('  - POST /api/user/payment/create');
  console.log('  - POST /api/user/payment/upload-proof');
  console.log('  - GET  /api/user/payments');
  console.log('  - GET  /api/admin/payments/pending');
  console.log('  - GET  /api/admin/users');
  console.log('  - GET  /api/admin/appointments');
  console.log('  - POST /api/admin/payment/approve');
  console.log('  - POST /api/admin/payment/reject');
  console.log('\n💡 Server is ready to accept requests...\n');
})