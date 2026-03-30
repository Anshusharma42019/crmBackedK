const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  assignedStaff: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: ['Order Created', 'In Transit', 'Out For Delivery', 'Delivered', 'Undelivered', 'Attempt 1', 'Attempt 2', 'Attempt 3', 'RTO'],
    default: 'Order Created',
  },
  statusHistory: [{
    status: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedAt: { type: Date, default: Date.now },
    note: String,
  }],
  deliveredAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Delivery', deliverySchema);
