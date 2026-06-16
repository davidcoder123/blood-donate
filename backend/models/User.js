const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:     { type: String, required: true, minlength: 6, select: false }, // select:false = never returned in queries by default
  role:         { type: String, enum: ['donor', 'hospital', 'admin'], required: true },
  phone:        { type: String, trim: true },
  city:         { type: String, trim: true },
  state:        { type: String, trim: true },
  address:      { type: String, trim: true },

  // Location for geo-matching
  location: {
    type:        { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
  },

  // Donor specific
  bloodGroup:   { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'] },
  available:    { type: Boolean, default: true },
  lastDonated:      { type: Date },
  donationCount:    { type: Number, default: 0 },
  eligibilityBlock: { type: Date }, // blocked until this date

  // Hospital specific
  hospitalName:    { type: String },
  licenseNumber:   { type: String },

  // Account status
  status:          { type: String, enum: ['pending', 'active', 'rejected'], default: 'active' },
  emailVerified:   { type: Boolean, default: false },

  // OTP fields (for email verification)
  otp:             { type: String, select: false },
  otpExpiry:       { type: Date, select: false },

  // Password reset
  resetToken:      { type: String, select: false },
  resetTokenExpiry:{ type: Date, select: false },

}, { timestamps: true });

// Geo index for location-based queries
userSchema.index({ location: '2dsphere' });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (inputPassword) {
  return bcrypt.compare(inputPassword, this.password);
};

// Never expose password even if accidentally selected
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.otpExpiry;
  delete obj.resetToken;
  delete obj.resetTokenExpiry;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
