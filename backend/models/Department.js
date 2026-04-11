const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g. "Cardiology", "General OPD"
  description: { type: String },
  isActive: { type: Boolean, default: true },
  currentServing: { type: Number, default: 0 }, // token number doctor is currently calling
  totalTokensToday: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);