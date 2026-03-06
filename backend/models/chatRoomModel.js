import mongoose from 'mongoose'

const memberSchema = new mongoose.Schema({
  role: { type: String, enum: ['patient','doctor','hospital','pharmacy','lab','admin'], required: true },
  userId: { type: mongoose.Schema.Types.Mixed, required: true },
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  support: { type: Boolean, default: false },
  verified: { type: Boolean, default: false }
}, { _id: false })

const memberStateSchema = new mongoose.Schema({
  key: { type: String, required: true },
  lastReadAt: { type: Date, default: null }
}, { _id: false })

const chatRoomSchema = new mongoose.Schema({
  members: { type: [memberSchema], index: true },
  lastMessage: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now },
  memberStates: { type: [memberStateSchema], default: [] },
  folder: { type: String, enum: ['inbox', 'archived', 'trash'], default: 'inbox' }
})

chatRoomSchema.index({ 'members.userId': 1 })
chatRoomSchema.index({ updatedAt: -1 })
chatRoomSchema.index({ folder: 1 })

const chatRoomModel = mongoose.models.chatroom || mongoose.model('chatroom', chatRoomSchema)
export default chatRoomModel