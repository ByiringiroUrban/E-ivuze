import mongoose from 'mongoose'

const internalMessageRecipientSchema = new mongoose.Schema({
  messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'internalmessage', required: true },
  recipientId: { type: mongoose.Schema.Types.Mixed, required: true },
  recipientRole: { type: String, enum: ['patient', 'doctor', 'hospital', 'pharmacy', 'lab', 'admin'], required: true },
  recipientName: { type: String, default: '' },
  recipientEmail: { type: String, default: '' },
  folder: { type: String, enum: ['inbox', 'sent', 'trash', 'starred', 'important'], default: 'inbox' },
  readAt: { type: Date, default: null },
  starred: { type: Boolean, default: false },
  isImportant: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
})

internalMessageRecipientSchema.index({ messageId: 1 })
internalMessageRecipientSchema.index({ recipientId: 1, recipientRole: 1, folder: 1 })
internalMessageRecipientSchema.index({ recipientId: 1, recipientRole: 1, deletedAt: 1 })

const internalMessageRecipientModel = mongoose.models.internalmessagerecipient || mongoose.model('internalmessagerecipient', internalMessageRecipientSchema)
export default internalMessageRecipientModel
