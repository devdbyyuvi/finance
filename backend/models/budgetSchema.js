// models/Budget.js
const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  limitAmount: {
    type: Number,
    required: true,
    min: [0, 'Limit amount must be a positive number'],
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
  },
  year: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

const Budget = mongoose.model('Budget', budgetSchema);
module.exports = Budget;