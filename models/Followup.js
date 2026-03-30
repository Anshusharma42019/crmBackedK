const mongoose = require('mongoose');

const followupSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  note: { type: String, required: true },
  nextFollowupDate: { type: Date },
  status: { type: String, enum: ['Pending', 'Done', 'Overdue'], default: 'Pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Followup', followupSchema);
