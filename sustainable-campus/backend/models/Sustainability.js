const mongoose = require('mongoose');

const sustainabilitySchema = new mongoose.Schema({
  energyCurrent: { type: Number, required: true },
  energyMax: { type: Number, required: true },
  waterCurrent: { type: Number, required: true },
  waterMax: { type: Number, required: true },
  wasteRecycled: { type: Number, required: true },
  wasteTotal: { type: Number, required: true },

  energyScore: { type: Number },
  waterScore: { type: Number },
  wasteScore: { type: Number },
  sustainabilityScore: { type: Number },

  date: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Auto-calculate scores before saving
sustainabilitySchema.pre('save', function(next) {
  this.energyScore = parseFloat(((1 - (this.energyCurrent / this.energyMax)) * 100).toFixed(2));
  this.waterScore = parseFloat(((1 - (this.waterCurrent / this.waterMax)) * 100).toFixed(2));
  this.wasteScore = parseFloat(((this.wasteRecycled / this.wasteTotal) * 100).toFixed(2));
  this.sustainabilityScore = parseFloat(((this.energyScore + this.waterScore + this.wasteScore) / 3).toFixed(2));
  next();
});

module.exports = mongoose.model('Sustainability', sustainabilitySchema);
