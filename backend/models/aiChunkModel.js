import mongoose from 'mongoose';

const aiChunkSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'aidocument', required: true, index: true },
  chunkIndex: { type: Number, required: true },
  text: { type: String, required: true },
  embedding: { type: [Number], default: [] },
  embeddingModel: { type: String, default: '' },
  language: { type: String, enum: ['en', 'rw'], default: 'en', index: true },
  visibility: { type: String, enum: ['public', 'user', 'internal'], default: 'public', index: true },
  ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null, index: true },
  createdAt: { type: Date, default: Date.now }
});

aiChunkSchema.index({ documentId: 1, chunkIndex: 1 }, { unique: true });

const aiChunkModel = mongoose.models.aichunk || mongoose.model('aichunk', aiChunkSchema);
export default aiChunkModel;
