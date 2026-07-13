// backend/models/Fixture.js
import mongoose from 'mongoose';

const fixtureSchema = new mongoose.Schema({
  opponent: { type: String, required: true },
  opponentLogo: { type: String, default: "" }, // Optional image URL
  matchDate: { type: String, required: true }, // e.g., "18/07/2026"
  kickoffTime: { type: String, required: true }, // e.g., "16:00 EAT"
  venue: { type: String, default: "Junda Grounds, Mishomoroni" },
  status: { type: String, enum: ['Upcoming', 'Completed'], default: 'Upcoming' },
  jundaScore: { type: Number, default: 0 },
  opponentScore: { type: Number, default: 0 },
  isHomeMatch: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Fixture', fixtureSchema);