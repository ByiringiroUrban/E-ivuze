import express from 'express'
import authAny from '../middleware/authAny.js'
import chatRoomModel from '../models/chatRoomModel.js'
import chatMessageModel from '../models/chatMessageModel.js'
import userModel from '../models/userModel.js'
import doctorModel from '../models/doctorModel.js'
import hospitalUserModel from '../models/hospitalUserModel.js'
import pharmacyUserModel from '../models/pharmacyUserModel.js'
import labModel from '../models/labModel.js'

const router = express.Router()

const memberKey = (role, userId) => `${role}:${userId}`

const findTarget = async (role, id) => {
  if (role === 'patient') return await userModel.findById(id)
  if (role === 'doctor') return await doctorModel.findById(id)
  if (role === 'hospital') return await hospitalUserModel.findById(id)
  if (role === 'pharmacy') return await pharmacyUserModel.findById(id)
  if (role === 'lab') return await labModel.findById(id)
  if (role === 'admin') return { name: 'E-ivuzeSupport', email: process.env.ADMIN_EMAIL || 'team@E-ivuze.com', _id: 'admin', support: true, verified: true }
  return null
}

// GET /api/chats?folder=inbox|archived|trash - list rooms; each room includes lastMessageFromMe
router.get('/api/chats', authAny, async (req, res) => {
  try {
    const { role, id } = req.principal
    const folder = (req.query.folder || 'inbox').toLowerCase()
    const validFolders = ['inbox', 'archived', 'trash']
    const filterFolder = validFolders.includes(folder) ? folder : 'inbox'
    const folderQuery = filterFolder === 'inbox'
      ? { $or: [{ folder: 'inbox' }, { folder: { $exists: false } }] }
      : { folder: filterFolder }

    const rooms = await chatRoomModel
      .find({ 'members.userId': id, 'members.role': role, ...folderQuery })
      .sort({ updatedAt: -1 })

    const result = []
    for (const room of rooms) {
      const key = memberKey(role, id)
      const state = room.memberStates.find(s => s.key === key)
      const lastReadAt = state?.lastReadAt || null
      let unreadCount = 0
      if (lastReadAt) {
        unreadCount = await chatMessageModel.countDocuments({ roomId: room._id, createdAt: { $gt: lastReadAt }, 'sender.userId': { $ne: id }, 'sender.role': { $ne: role } })
      } else {
        unreadCount = await chatMessageModel.countDocuments({ roomId: room._id, 'sender.userId': { $ne: id }, 'sender.role': { $ne: role } })
      }
      const lastMsg = await chatMessageModel.findOne({ roomId: room._id }).sort({ createdAt: -1 }).limit(1).lean()
      const lastMessageFromMe = !!(lastMsg && String(lastMsg.sender.userId) === String(id) && lastMsg.sender.role === role)

      result.push({
        _id: room._id,
        members: room.members,
        lastMessage: room.lastMessage,
        updatedAt: room.updatedAt,
        folder: room.folder || 'inbox',
        unreadCount,
        lastMessageFromMe
      })
    }

    res.json({ success: true, rooms: result })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
})

router.post('/api/chats', authAny, async (req, res) => {
  try {
    const { role, id } = req.principal
    const targetRole = req.body.targetRole || 'patient'
    const targetId = req.body.userId || req.body.targetId

    if (!targetId) return res.json({ success: false, message: 'target user id required' })

    const target = await findTarget(targetRole, targetId)
    if (!target) return res.json({ success: false, message: 'Target not found' })

    const existing = await chatRoomModel.findOne({
      members: {
        $all: [
          { $elemMatch: { role, userId: id } },
          { $elemMatch: { role: targetRole, userId: targetId } }
        ]
      }
    })

    if (existing) {
      return res.json({ success: true, room: existing })
    }

    const room = await chatRoomModel.create({
      members: [
        {
          role,
          userId: id,
          name: req.principal.name || '',
          email: req.principal.email || '',
          support: !!req.principal.support,
          verified: !!req.principal.verified
        },
        {
          role: targetRole,
          userId: targetId,
          name: target.name || '',
          email: target.email || '',
          support: !!target.support,
          verified: !!target.verified
        }
      ],
      lastMessage: '',
      updatedAt: new Date(),
      folder: 'inbox',
      memberStates: [
        { key: memberKey(role, id), lastReadAt: null },
        { key: memberKey(targetRole, targetId), lastReadAt: null }
      ]
    })

    res.json({ success: true, room })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
})

router.get('/api/chats/:roomId/messages', authAny, async (req, res) => {
  try {
    const { role, id } = req.principal
    const { roomId } = req.params
    const room = await chatRoomModel.findById(roomId)
    if (!room) return res.json({ success: false, message: 'Room not found' })
    const isMember = room.members.some(m => String(m.userId) === String(id) && m.role === role)
    if (!isMember) return res.json({ success: false, message: 'Not a member of this room' })

    const messages = await chatMessageModel.find({ roomId }).sort({ createdAt: 1 }).limit(200)

    const key = memberKey(role, id)
    const state = room.memberStates.find(s => s.key === key)
    if (state) {
      state.lastReadAt = new Date()
    } else {
      room.memberStates.push({ key, lastReadAt: new Date() })
    }
    await room.save()

    res.json({ success: true, messages })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
})

// PATCH /api/chats/:roomId - update room folder (archive, trash, inbox)
router.patch('/api/chats/:roomId', authAny, async (req, res) => {
  try {
    const { role, id } = req.principal
    const { roomId } = req.params
    const { folder } = req.body || {}
    const validFolders = ['inbox', 'archived', 'trash']
    if (!validFolders.includes(folder)) {
      return res.json({ success: false, message: 'Invalid folder' })
    }
    const room = await chatRoomModel.findById(roomId)
    if (!room) return res.json({ success: false, message: 'Room not found' })
    const isMember = room.members.some(m => String(m.userId) === String(id) && m.role === role)
    if (!isMember) return res.json({ success: false, message: 'Not a member of this room' })
    room.folder = folder
    await room.save()
    res.json({ success: true, room: { _id: room._id, folder: room.folder } })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
})

// Search users by role and query - for "New message" recipient picker
router.get('/api/chats/search', authAny, async (req, res) => {
  try {
    const role = (req.query.role || '').toLowerCase() || 'patient'
    const q = (req.query.q || '').trim()
    const regex = q ? new RegExp(q, 'i') : null

    let results = []
    if (role === 'patient') {
      results = await userModel.find(regex ? { $or: [{ name: regex }, { email: regex }] } : {}).select('_id name email').sort({ name: 1 })
    } else if (role === 'doctor') {
      results = await doctorModel.find(regex ? { $or: [{ name: regex }, { email: regex }] } : {}).select('_id name email').sort({ name: 1 })
    } else if (role === 'hospital') {
      results = await hospitalUserModel.find(regex ? { $or: [{ name: regex }, { email: regex }] } : {}).select('_id name email').sort({ name: 1 })
    } else if (role === 'pharmacy') {
      results = await pharmacyUserModel.find(regex ? { $or: [{ name: regex }, { email: regex }] } : {}).select('_id name email').sort({ name: 1 })
    } else if (role === 'lab') {
      results = await labModel.find(regex ? { $or: [{ name: regex }, { email: regex }] } : {}).select('_id name email').sort({ name: 1 })
    } else if (role === 'admin') {
      const adminEmail = process.env.ADMIN_EMAIL || 'team@E-ivuze.com'
      const adminObj = { _id: 'admin', name: 'E-ivuzeSupport', email: adminEmail, role: 'admin', support: true, verified: true }
      if (!q || regex.test(adminObj.name) || regex.test(adminObj.email)) results = [adminObj]
      else results = []
    } else {
      results = []
    }

    res.json({ success: true, results: results.map(r => ({ _id: r._id, name: r.name, email: r.email, role: r.role || role, support: !!r.support, verified: !!r.verified })) })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
})

export default router