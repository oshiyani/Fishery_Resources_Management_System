const mongoose = require('mongoose');

const vesselSchema = new mongoose.Schema({
  fisherman:       { type: mongoose.Schema.Types.ObjectId, ref: 'Fisherman' },
  owner:           { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vesselName:      { type: String, required: true },
  vesselId:        { type: String, required: true, unique: true },
  type:            { type: String, enum: ['trawler','canoe','motorboat','sailboat','catamaran','dinghy','barge','other'], required: true },
  capacity:        { type: Number, required: true },
  enginePower:     { type: String },
  manufactureYear: { type: Number },
  status:          { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  rejectionReason: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Vessel', vesselSchema);