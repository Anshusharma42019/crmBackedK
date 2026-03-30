const Booking = require('../models/Booking');
const Delivery = require('../models/Delivery');

exports.getBookings = async (req, res) => {
  try {
    const { status, staff, from, to, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (staff) query.assignedStaff = staff;
    if (from || to) {
      query.bookingDate = {};
      if (from) query.bookingDate.$gte = new Date(from);
      if (to) query.bookingDate.$lte = new Date(to);
    }
    if (req.user.role === 'staff') query.assignedStaff = req.user._id;

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('customer', 'name phone')
      .populate('assignedStaff', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ bookings, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createBooking = async (req, res) => {
  try {
    const booking = await Booking.create({ ...req.body, createdBy: req.user._id });
    await Delivery.create({ booking: booking._id, customer: booking.customer, assignedStaff: booking.assignedStaff });
    res.status(201).json(booking);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.deleteBooking = async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
