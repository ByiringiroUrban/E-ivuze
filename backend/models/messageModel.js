import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'conversation',
    required: true,
    index: true
  },
  sender: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  text: {
    type: String,
    required: true
  },
  language: {
    type: String,
    enum: ['en', 'rw'],
    default: 'en'
  },
  metadata: {
    type: Object, // For future use, e.g., tool calls, sentiment
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ttlDays = Number.parseInt(process.env.AI_DATA_TTL_DAYS || '0', 10);
if (Number.isFinite(ttlDays) && ttlDays > 0) {
  messageSchema.index({ createdAt: 1 }, { expireAfterSeconds: ttlDays * 24 * 60 * 60 });
}

const messageModel = mongoose.models.message || mongoose.model('message', messageSchema);
export default messageModel;

