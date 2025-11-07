const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Program name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Program description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'completed'],
    default: 'active',
  },
}, {
  timestamps: true,
});

// Index for better query performance
programSchema.index({ status: 1, startDate: 1 });

module.exports = mongoose.model('Program', programSchema);