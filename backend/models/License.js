const mongoose = require('mongoose');

const licenseSchema = new mongoose.Schema({
  fisherman:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  licenseNo:   { type: String, unique: true },
  licenseType: { type: String, required: true },
  zone:        { type: String, required: true },
  validFrom:   { type: Date,   required: true },
  validTo:     { type: Date,   required: true },
  status:      { type: String, enum: ['pending','approved','rejected','expired'], default: 'pending' },
  isDefault:   { type: Boolean, default: false },
  rejectionReason: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('License', licenseSchema);