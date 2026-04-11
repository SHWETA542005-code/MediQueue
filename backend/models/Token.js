const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  tokenNumber: { type: Number, required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  status: {
    type: String,
    enum: ['waiting', 'called', 'in-consultation', 'completed', 'cancelled'],
    default: 'waiting'
  },
  estimatedWait: { type: Number, default: 0 }, // in minutes
  date: { type: Date, default: Date.now },
  calledAt: { type: Date },
  completedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Token', tokenSchema);