const mongoose = require('mongoose');

const IndustryStandardSchema = new mongoose.Schema({
  domain: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  required: {
    type: [String],
    default: []
  },
  emerging: {
    type: [String],
    default: []
  },
  nice: {
    type: [String],
    default: []
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('IndustryStandard', IndustryStandardSchema);
