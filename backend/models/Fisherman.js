const mongoose = require('mongoose');

const fishermanSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name:        { type: String, required: true },
  email:       { type: String, required: true },
  phone:       { type: String, required: true },
  address:     { type: String, required: true },
  idProof:     { type: String, required: true },
  idNumber:    { type: String, required: true, unique: true },
  experience:  { type: String, enum: ['beginner','intermediate','expert'], default: 'beginner' },
  status:      { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  rejectionReason: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Fisherman', fishermanSchema);