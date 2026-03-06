import express from 'express'
import authAny from '../middleware/authAny.js'
import internalMessageModel from '../models/internalMessageModel.js'
import internalMessageRecipientModel from '../models/internalMessageRecipientModel.js'
import userModel from '../models/userModel.js'
import doctorModel from '../models/doctorModel.js'
import hospitalUserModel from '../models/hospitalUserModel.js'
import pharmacyUserModel from '../models/pharmacyUserModel.js'
import labModel from '../models/labModel.js'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const router = express.Router()

const mailUploadsDir = path.join(__dirname, '../uploads/mail')
if (!fs.existsSync(mailUploadsDir)) fs.mkdirSync(mailUploadsDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, mailUploadsDir),
  filename: (req, file, cb) => cb(null, `mail-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname) || ''}`)
})
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })

const ROLES = ['patient', 'doctor', 'hospital', 'pharmacy', 'lab', 'admin']

async function resolveRecipients({ role, department, location, userId, q }) {
  const list = []
  if (userId && role) {
    if (role === 'patient') {
      const u = await userModel.findById(userId).select('_id name email').lean()
      if (u) list.push({ id: u._id, role: 'patient', name: u.name, email: u.email })
    } else if (role === 'doctor') {
      const u = await doctorModel.findById(userId).select('_id name email').lean()
      if (u) list.push({ id: u._id, role: 'doctor', name: u.name, email: u.email })
    } else if (role === 'hospital') {
      const u = await hospitalUserModel.findById(userId).select('_id name email').lean()
      if (u) list.push({ id: u._id, role: 'hospital', name: u.name, email: u.email })
    } else if (role === 'pharmacy') {
      const u = await pharmacyUserModel.findById(userId).select('_id name email').lean()
      if (u) list.push({ id: u._id, role: 'pharmacy', name: u.name, email: u.email })
    } else if (role === 'lab') {
      const u = await labModel.findById(userId).select('_id name email').lean()
      if (u) list.push({ id: u._id, role: 'lab', name: u.name, email: u.email })
    } else if (role === 'admin') {
      list.push({ id: 'admin', role: 'admin', name: 'E-ivuzeSupport', email: process.env.ADMIN_EMAIL || 'support@E-ivuze.com' })
    }
    return list
  }
  const filter = {}
  if (department) filter.speciality = new RegExp(department, 'i')
  if (location) filter['address.city'] = new RegExp(location, 'i')
  if (role === 'patient') {
    const users = await userModel.find(q ? { $or: [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }] } : {}).select('_id name email').lean()
    users.forEach(u => list.push({ id: u._id, role: 'patient', name: u.name, email: u.email }))
  } else if (role === 'doctor') {
    const users = await doctorModel.find({ ...filter, status: 'approved', ...(q ? { $or: [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }] } : {}) }).select('_id name email').lean()
    users.forEach(u => list.push({ id: u._id, role: 'doctor', name: u.name, email: u.email }))
  } else if (role === 'hospital') {
    const users = await hospitalUserModel.find(q ? { $or: [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }] } : {}).select('_id name email').lean()
    users.forEach(u => list.push({ id: u._id, role: 'hospital', name: u.name, email: u.email }))
  } else if (role === 'pharmacy') {
    const users = await pharmacyUserModel.find(q ? { $or: [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }] } : {}).select('_id name email').lean()
    users.forEach(u => list.push({ id: u._id, role: 'pharmacy', name: u.name, email: u.email }))
  } else if (role === 'lab') {
    const users = await labModel.find(q ? { $or: [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }] } : {}).select('_id name email').lean()
    users.forEach(u => list.push({ id: u._id, role: 'lab', name: u.name, email: u.email }))
  } else if (role === 'admin') {
    list.push({ id: 'admin', role: 'admin', name: 'E-ivuzeSupport', email: process.env.ADMIN_EMAIL || 'support@E-ivuze.com' })
  }
  return list
}

router.post('/api/mail/recipients/resolve', authAny, async (req, res) => {
  try {
    const { role, department, location, userId, q } = req.body || {}
    const recipients = await resolveRecipients({ role, department, location, userId, q })
    return res.json({ success: true, recipients })
  } catch (e) {
    return res.json({ success: false, message: e.message })
  }
})

router.get('/api/mail/folders/:folder', authAny, async (req, res) => {
  try {
    const { role, id } = req.principal
    const { folder } = req.params
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(50, Math.max(10, parseInt(req.query.limit) || 20))
    const skip = (page - 1) * limit

    if (folder === 'drafts') {
      const list = await internalMessageModel.find({ senderId: id, senderRole: role, isDraft: true }).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean()
      const total = await internalMessageModel.countDocuments({ senderId: id, senderRole: role, isDraft: true })
      return res.json({ success: true, messages: list, total, page, limit })
    }

    const folderMap = { inbox: 'inbox', sent: 'sent', trash: 'trash', starred: 'starred', important: 'important' }
    const f = folderMap[folder] || 'inbox'
    let query = { recipientId: id, recipientRole: role, deletedAt: null }
    if (f === 'starred') query.starred = true
    else if (f === 'important') query.isImportant = true
    else query.folder = f

    const recs = await internalMessageRecipientModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('messageId').lean()
    const messages = recs.filter(r => r.messageId).map(r => ({ ...r.messageId, _recipientMeta: { readAt: r.readAt, starred: r.starred, folder: r.folder } }))
    const total = await internalMessageRecipientModel.countDocuments(query)
    return res.json({ success: true, messages, total, page, limit })
  } catch (e) {
    return res.json({ success: false, message: e.message })
  }
})

router.get('/api/mail/counts', authAny, async (req, res) => {
  try {
    const { role, id } = req.principal
    const [inbox, sent, drafts, trash, starred, important] = await Promise.all([
      internalMessageRecipientModel.countDocuments({ recipientId: id, recipientRole: role, folder: 'inbox', deletedAt: null }),
      internalMessageRecipientModel.countDocuments({ recipientId: id, recipientRole: role, folder: 'sent', deletedAt: null }),
      internalMessageModel.countDocuments({ senderId: id, senderRole: role, isDraft: true }),
      internalMessageRecipientModel.countDocuments({ recipientId: id, recipientRole: role, folder: 'trash', deletedAt: null }),
      internalMessageRecipientModel.countDocuments({ recipientId: id, recipientRole: role, starred: true, deletedAt: null }),
      internalMessageRecipientModel.countDocuments({ recipientId: id, recipientRole: role, isImportant: true, deletedAt: null })
    ])
    const unread = await internalMessageRecipientModel.countDocuments({ recipientId: id, recipientRole: role, readAt: null, folder: 'inbox', deletedAt: null })
    return res.json({ success: true, counts: { inbox, sent, drafts, trash, starred, important, unread } })
  } catch (e) {
    return res.json({ success: false, message: e.message })
  }
})

router.get('/api/mail/thread/:messageId', authAny, async (req, res) => {
  try {
    const { role, id } = req.principal
    const { messageId } = req.params
    const msg = await internalMessageModel.findById(messageId).lean()
    if (!msg) return res.json({ success: false, message: 'Message not found' })
    const threadId = msg.threadId || msg._id
    const isRecipient = String(msg.senderId) === String(id) && msg.senderRole === role
    const rec = await internalMessageRecipientModel.findOne({ messageId: msg._id, recipientId: id, recipientRole: role }).lean()
    if (!isRecipient && !rec) return res.json({ success: false, message: 'Not allowed' })
    const thread = await internalMessageModel.find({ $or: [{ _id: threadId }, { threadId: threadId }] }).sort({ createdAt: 1 }).lean()
    if (!rec) await internalMessageRecipientModel.updateOne({ messageId: msg._id, recipientId: id, recipientRole: role }, { $set: { readAt: new Date() } })
    else if (!rec.readAt) await internalMessageRecipientModel.updateOne({ _id: rec._id }, { $set: { readAt: new Date() } })
    return res.json({ success: true, message: msg, thread })
  } catch (e) {
    return res.json({ success: false, message: e.message })
  }
})

router.get('/api/mail/message/:messageId', authAny, async (req, res) => {
  try {
    const { role, id } = req.principal
    const msg = await internalMessageModel.findById(req.params.messageId).lean()
    if (!msg) return res.json({ success: false, message: 'Not found' })
    const rec = await internalMessageRecipientModel.findOne({ messageId: msg._id, recipientId: id, recipientRole: role }).lean()
    const isSender = String(msg.senderId) === String(id) && msg.senderRole === role
    if (!rec && !isSender) return res.json({ success: false, message: 'Not allowed' })
    if (rec && !rec.readAt) await internalMessageRecipientModel.updateOne({ _id: rec._id }, { $set: { readAt: new Date() } })
    return res.json({ success: true, message: msg, recipientMeta: rec || null })
  } catch (e) {
    return res.json({ success: false, message: e.message })
  }
})

router.post('/api/mail/send', authAny, upload.array('attachments', 10), async (req, res) => {
  try {
    const { role, id, name, email } = req.principal
    const { subject, body, threadId, recipientFilter } = req.body || {}
    const recipients = JSON.parse(recipientFilter || '[]')
    if (!recipients.length) return res.json({ success: false, message: 'Select at least one recipient' })
    const files = (req.files || []).map(f => ({ url: `/uploads/mail/${f.filename}`, filename: f.originalname || f.filename, size: f.size || 0 }))
    const doc = await internalMessageModel.create({
      senderId: id,
      senderRole: role,
      senderName: name || '',
      senderEmail: email || '',
      subject: subject || '(No subject)',
      body: body || '',
      threadId: threadId || null,
      isDraft: false,
      attachments: files
    })
    const recDocs = []
    for (const r of recipients) {
      recDocs.push({ messageId: doc._id, recipientId: r.id, recipientRole: r.role, recipientName: r.name || '', recipientEmail: r.email || '', folder: 'inbox' })
    }
    recDocs.push({ messageId: doc._id, recipientId: id, recipientRole: role, recipientName: name || '', recipientEmail: email || '', folder: 'sent' })
    await internalMessageRecipientModel.insertMany(recDocs)
    return res.json({ success: true, message: doc })
  } catch (e) {
    return res.json({ success: false, message: e.message })
  }
})

router.post('/api/mail/draft', authAny, upload.array('attachments', 10), async (req, res) => {
  try {
    const { role, id, name, email } = req.principal
    const { draftId, subject, body, recipientFilter } = req.body || {}
    const files = (req.files || []).map(f => ({ url: `/uploads/mail/${f.filename}`, filename: f.originalname || f.filename, size: f.size || 0 }))
    let doc
    if (draftId) {
      doc = await internalMessageModel.findOneAndUpdate(
        { _id: draftId, senderId: id, senderRole: role, isDraft: true },
        { $set: { subject: subject || '', body: body || '', attachments: files, updatedAt: new Date() } },
        { new: true }
      )
      if (!doc) return res.json({ success: false, message: 'Draft not found' })
    } else {
      doc = await internalMessageModel.create({
        senderId: id,
        senderRole: role,
        senderName: name || '',
        senderEmail: email || '',
        subject: subject || '',
        body: body || '',
        isDraft: true,
        attachments: files
      })
    }
    return res.json({ success: true, message: doc })
  } catch (e) {
    return res.json({ success: false, message: e.message })
  }
})

router.patch('/api/mail/message/:messageId', authAny, async (req, res) => {
  try {
    const { role, id } = req.principal
    const { folder, starred, isImportant, read } = req.body || {}
    const rec = await internalMessageRecipientModel.findOne({ messageId: req.params.messageId, recipientId: id, recipientRole: role })
    if (!rec) return res.json({ success: false, message: 'Not found' })
    const update = {}
    if (folder !== undefined) update.folder = folder
    if (starred !== undefined) update.starred = starred
    if (isImportant !== undefined) update.isImportant = isImportant
    if (read === true) update.readAt = new Date()
    if (read === false) update.readAt = null
    await internalMessageRecipientModel.updateOne({ _id: rec._id }, { $set: update })
    return res.json({ success: true })
  } catch (e) {
    return res.json({ success: false, message: e.message })
  }
})

router.post('/api/mail/bulk', authAny, async (req, res) => {
  try {
    const { role, id } = req.principal
    const { messageIds, action } = req.body || {}
    if (!Array.isArray(messageIds) || !messageIds.length || !action) return res.json({ success: false, message: 'Invalid request' })
    const update = {}
    if (action === 'read') update.readAt = new Date()
    if (action === 'unread') update.readAt = null
    if (action === 'trash') update.folder = 'trash'
    if (action === 'inbox') update.folder = 'inbox'
    if (action === 'starred') update.starred = true
    if (action === 'unstarred') update.starred = false
    await internalMessageRecipientModel.updateMany(
      { messageId: { $in: messageIds }, recipientId: id, recipientRole: role },
      { $set: update }
    )
    return res.json({ success: true })
  } catch (e) {
    return res.json({ success: false, message: e.message })
  }
})

router.get('/api/mail/search', authAny, async (req, res) => {
  try {
    const { role, id } = req.principal
    const { q, subject, sender, dateFrom, dateTo } = req.query || {}
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(50, Math.max(10, parseInt(req.query.limit) || 20))
    const skip = (page - 1) * limit
    const recQuery = { recipientId: id, recipientRole: role, deletedAt: null }
    const msgIds = (await internalMessageRecipientModel.find(recQuery).select('messageId').lean()).map(r => r.messageId)
    const msgQuery = { _id: { $in: msgIds } }
    if (q) msgQuery.$or = [{ subject: new RegExp(q, 'i') }, { body: new RegExp(q, 'i') }, { senderName: new RegExp(q, 'i') }]
    if (subject) msgQuery.subject = new RegExp(subject, 'i')
    if (sender) msgQuery.senderName = new RegExp(sender, 'i')
    if (dateFrom || dateTo) {
      msgQuery.createdAt = {}
      if (dateFrom) msgQuery.createdAt.$gte = new Date(dateFrom)
      if (dateTo) msgQuery.createdAt.$lte = new Date(dateTo)
    }
    const messages = await internalMessageModel.find(msgQuery).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()
    const total = await internalMessageModel.countDocuments(msgQuery)
    return res.json({ success: true, messages, total, page, limit })
  } catch (e) {
    return res.json({ success: false, message: e.message })
  }
})

router.post('/api/mail/reply', authAny, upload.array('attachments', 10), async (req, res) => {
  try {
    const { role, id, name, email } = req.principal
    const { messageId, body } = req.body || {}
    const original = await internalMessageModel.findById(messageId).lean()
    if (!original) return res.json({ success: false, message: 'Message not found' })
    const threadId = original.threadId || original._id
    const files = (req.files || []).map(f => ({ url: `/uploads/mail/${f.filename}`, filename: f.originalname || f.filename, size: f.size || 0 }))
    const doc = await internalMessageModel.create({
      senderId: id,
      senderRole: role,
      senderName: name || '',
      senderEmail: email || '',
      subject: (original.subject || '').replace(/^Re:\s*/i, '') ? `Re: ${original.subject}` : 'Re: (No subject)',
      body: body || '',
      threadId,
      isDraft: false,
      attachments: files
    })
    const recipients = [{ id: original.senderId, role: original.senderRole, name: original.senderName, email: original.senderEmail }]
    const recDocs = recipients.map(r => ({ messageId: doc._id, recipientId: r.id, recipientRole: r.role, recipientName: r.name || '', recipientEmail: r.email || '', folder: 'inbox' }))
    recDocs.push({ messageId: doc._id, recipientId: id, recipientRole: role, recipientName: name || '', recipientEmail: email || '', folder: 'sent' })
    await internalMessageRecipientModel.insertMany(recDocs)
    return res.json({ success: true, message: doc })
  } catch (e) {
    return res.json({ success: false, message: e.message })
  }
})

router.delete('/api/mail/draft/:draftId', authAny, async (req, res) => {
  try {
    const doc = await internalMessageModel.findOneAndDelete({ _id: req.params.draftId, senderId: req.principal.id, senderRole: req.principal.role, isDraft: true })
    if (!doc) return res.json({ success: false, message: 'Draft not found' })
    return res.json({ success: true })
  } catch (e) {
    return res.json({ success: false, message: e.message })
  }
})

export default router
