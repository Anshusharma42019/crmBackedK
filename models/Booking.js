const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  bookingDate: { type: Date, default: Date.now },
  price: { type: Number },
  assignedStaff: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['New', 'Verified', 'Cancelled', 'Deleted'], default: 'New' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
