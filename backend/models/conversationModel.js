import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    default: null, // Allow anonymous conversations
    index: true
  },
  title: {
    type: String,
    required: true,
    default: 'New Conversation'
  },
  language: {
    type: String,
    enum: ['en', 'rw'],
    default: 'en'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const ttlDays = Number.parseInt(process.env.AI_DATA_TTL_DAYS || '0', 10);
if (Number.isFinite(ttlDays) && ttlDays > 0) {
  conversationSchema.index({ updatedAt: 1 }, { expireAfterSeconds: ttlDays * 24 * 60 * 60 });
}

const conversationModel = mongoose.models.conversation || mongoose.model('conversation', conversationSchema);
export default conversationModel;

