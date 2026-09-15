// backend/models/StandingsTable.js
import mongoose from 'mongoose';

const isNonNegativeInteger = (value) => Number.isInteger(value) && value >= 0;
const isPositiveInteger = (value) => Number.isInteger(value) && value >= 1;

const teamSchema = new mongoose.Schema({
  rank: {
    type: Number,
    required: true,
    min: 1,
    validate: { validator: isPositiveInteger, message: 'rank must be an integer of at least 1.' }
  },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  p: {
    type: Number,
    default: 0,
    min: 0,
    validate: { validator: isNonNegativeInteger, message: 'p must be a non-negative integer.' }
  },
  w: {
    type: Number,
    default: 0,
    min: 0,
    validate: { validator: isNonNegativeInteger, message: 'w must be a non-negative integer.' }
  },
  d: {
    type: Number,
    default: 0,
    min: 0,
    validate: { validator: isNonNegativeInteger, message: 'd must be a non-negative integer.' }
  },
  l: {
    type: Number,
    default: 0,
    min: 0,
    validate: { validator: isNonNegativeInteger, message: 'l must be a non-negative integer.' }
  },
  gf: {
    type: Number,
    default: 0,
    min: 0,
    validate: { validator: isNonNegativeInteger, message: 'gf must be a non-negative integer.' }
  },
  ga: {
    type: Number,
    default: 0,
    min: 0,
    validate: { validator: isNonNegativeInteger, message: 'ga must be a non-negative integer.' }
  },
  pts: {
    type: Number,
    default: 0,
    min: 0,
    validate: { validator: isNonNegativeInteger, message: 'pts must be a non-negative integer.' }
  },
  form: { type: [String], default: [], enum: ['W', 'D', 'L'] }
}, { _id: true });

const standingsTableSchema = new mongoose.Schema({
  category: { type: String, required: true, trim: true, maxlength: 80 },
  league: { type: String, required: true, trim: true, maxlength: 120 },
  slug: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    maxlength: 80,
    validate: {
      validator: (value) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
      message: (props) => `"${props.value}" is not a valid slug. Use only lowercase letters, numbers, and hyphens.`
    }
  },
  displayOrder: {
    type: Number,
    default: 0,
    min: 0,
    validate: { validator: isNonNegativeInteger, message: 'displayOrder must be a non-negative integer.' }
  },
  teams: { type: [teamSchema], default: [] }
}, { timestamps: true });

export default mongoose.model('StandingsTable', standingsTableSchema);