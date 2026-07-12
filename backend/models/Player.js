import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
  jerseyNumber: String,
  role: { type: String, default: 'player' },
  image: String
});

export default mongoose.model('Player', playerSchema);