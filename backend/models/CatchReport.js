const mongoose = require('mongoose');

const catchReportSchema = new mongoose.Schema({
  fisherman:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  license:     { type: mongoose.Schema.Types.ObjectId, ref: 'License', required: true },
  vessel:      { type: mongoose.Schema.Types.ObjectId, ref: 'Vessel' },
  species:     { type: String, required: true },
  quantity:    { type: Number, required: true },
  unit:        { type: String, enum: ['kg','tons','count'], default: 'kg' },
  catchDate:   { type: Date, required: true },
  location:    { type: String, required: true },
  zone:        { type: String, required: true },
  method:      { type: String, enum: ['net','hook','trap','trawl','other'], required: true },
  notes:       { type: String },
  status:      { type: String, enum: ['pending','verified','rejected'], default: 'pending' },
  rejectionReason: { type: String },
  verifiedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  warningFlag: { type: Boolean, default: false },
  warningNote: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('CatchReport', catchReportSchema);