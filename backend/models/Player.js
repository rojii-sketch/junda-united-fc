import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
  jerseyNumber: { type: String },
  role: { type: String, default: 'player' },
  image: { type: String },
  
  // 🎯 NEW: Extended profile details & Youth System routing
  age: { type: Number },
  squadCategory: { type: String, default: 'First Team' }, 
  appearances: { type: Number, default: 0 },
  goals: { type: Number, default: 0 },
  bio: { type: String, default: '' }
}, { timestamps: true }); // Added timestamps to track when players are registered

export default mongoose.model('Player', playerSchema);