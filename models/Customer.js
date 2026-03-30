const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  age: { type: Number },
  address: { type: String },
  pincode: { type: String },
  price: { type: Number },
  images: [{ type: String }],
  remarks: { type: String },
  assignedStaff: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
