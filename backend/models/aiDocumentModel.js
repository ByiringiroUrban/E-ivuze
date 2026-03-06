import mongoose from 'mongoose';

const createdBySchema = new mongoose.Schema(
  {
    role: { type: String, default: 'admin' },
    userId: { type: mongoose.Schema.Types.Mixed, default: null }
  },
  { _id: false }
);

const aiDocumentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  source: { type: String, default: '' },
  url: { type: String, default: '' },
  language: { type: String, enum: ['en', 'rw'], default: 'en', index: true },
  tags: { type: [String], default: [] },
  visibility: { type: String, enum: ['public', 'user', 'internal'], default: 'public', index: true },
  ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null, index: true },
  createdBy: { type: createdBySchema, default: () => ({}) },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

aiDocumentSchema.index({ updatedAt: -1 });

const aiDocumentModel = mongoose.models.aidocument || mongoose.model('aidocument', aiDocumentSchema);
export default aiDocumentModel;
