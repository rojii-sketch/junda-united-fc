// backend/models/Standing.js
import mongoose from 'mongoose';

const standingSchema = new mongoose.Schema({
  rank: { type: Number, required: true },
  name: { type: String, required: true },
  p: { type: Number, default: 0 },
  w: { type: Number, default: 0 },
  d: { type: Number, default: 0 },
  l: { type: Number, default: 0 },
  gf: { type: Number, default: 0 },
  ga: { type: Number, default: 0 },
  pts: { type: Number, default: 0 },
  form: { type: [String], default: [] } // e.g., ['W', 'W', 'D', 'L', 'W']
}, { timestamps: true });

export default mongoose.model('Standing', standingSchema);