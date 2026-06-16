const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  hospital:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bloodGroup:   { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'], required: true },
  unitsNeeded:  { type: Number, required: true, min: 1, max: 20 },
  urgency:      { type: String, enum: ['critical', 'high', 'normal'], default: 'normal' },
  patientName:  { type: String },
  notes:        { type: String, maxlength: 300 },
  radiusKm:     { type: Number, default: 50 },
  status:    { type: String, enum: ['open', 'fulfilled', 'cancelled', 'expired'], default: 'open' },
  donorsNotified: { type: Number, default: 0 },
  donorsAccepted: { type: Number, default: 0 },
  expiresAt: { type: Date },
  

  // Donors who responded
  responses: [{
    donor:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status:   { type: String, enum: ['accepted', 'declined', 'donated'], default: 'accepted' },
    donatedAt: { type: Date },
    respondedAt: { type: Date, default: Date.now }
  }]

}, { timestamps: true });

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
