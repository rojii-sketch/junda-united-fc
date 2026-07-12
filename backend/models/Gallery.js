import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
  type: { type: String, default: 'image' },
  url: { type: String, required: true },
  caption: String
});

export default mongoose.model('Gallery', gallerySchema);