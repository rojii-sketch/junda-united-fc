import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
  jerseyNumber: { type: String },
  role: { type: String, default: 'player' },
  image: { type: String },
  
  // Extended profile details & Youth System routing
  age: { type: Number },
  squadCategory: { type: String, default: 'First Team' }, 
  appearances: { type: Number, default: 0 },
  goals: { type: Number, default: 0 },
  bio: { type: String, default: '' },
  
  // 🎯 NEW: Contact info for staff/coaches
  contact: { type: String, default: '' }
}, { timestamps: true }); 

export default mongoose.model('Player', playerSchema);