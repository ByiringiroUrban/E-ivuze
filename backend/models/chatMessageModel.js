import mongoose from 'mongoose'

const chatMessageSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'chatroom', required: true, index: true },
  sender: {
    role: { type: String, enum: ['patient','doctor','hospital','pharmacy','lab','admin'], required: true },
    userId: { type: mongoose.Schema.Types.Mixed, required: true }
  },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
})

chatMessageSchema.index({ roomId: 1, createdAt: 1 })

const chatMessageModel = mongoose.models.chatmessage || mongoose.model('chatmessage', chatMessageSchema)
export default chatMessageModel