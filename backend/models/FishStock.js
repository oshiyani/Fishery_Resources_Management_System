const mongoose = require('mongoose');

const fishStockSchema = new mongoose.Schema({
  species:       { type: String, required: true },
  zone:          { type: String, required: true },
  currentStock:  { type: Number, required: true },
  unit:          { type: String, enum: ['kg','tons'], default: 'kg' },
  alertThreshold:{ type: Number, required: true },
  status:        { type: String, enum: ['healthy','low','critical'], default: 'healthy' },
  lastSurveyDate:{ type: Date, default: Date.now },
  surveyedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes:         { type: String },
}, { timestamps: true });

// Auto update status based on stock vs threshold
fishStockSchema.pre('save', function() {
  const ratio = this.currentStock / this.alertThreshold;
  if (ratio <= 0.3)      this.status = 'critical';
  else if (ratio <= 0.7) this.status = 'low';
  else                   this.status = 'healthy';
});

module.exports = mongoose.model('FishStock', fishStockSchema);