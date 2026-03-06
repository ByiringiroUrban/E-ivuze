import mongoose from 'mongoose'

const attachmentSchema = new mongoose.Schema({
  url: { type: String, required: true },
  filename: { type: String, required: true },
  size: { type: Number, default: 0 }
}, { _id: false })

const internalMessageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.Mixed, required: true },
  senderRole: { type: String, enum: ['patient', 'doctor', 'hospital', 'pharmacy', 'lab', 'admin'], required: true },
  senderName: { type: String, default: '' },
  senderEmail: { type: String, default: '' },
  subject: { type: String, default: '' },
  body: { type: String, default: '' },
  threadId: { type: mongoose.Schema.Types.ObjectId, ref: 'internalmessage', default: null },
  isDraft: { type: Boolean, default: false },
  attachments: [attachmentSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

internalMessageSchema.index({ senderId: 1, senderRole: 1 })
internalMessageSchema.index({ threadId: 1 })
internalMessageSchema.index({ createdAt: -1 })
internalMessageSchema.index({ isDraft: 1 })

const internalMessageModel = mongoose.models.internalmessage || mongoose.model('internalmessage', internalMessageSchema)
export default internalMessageModel
