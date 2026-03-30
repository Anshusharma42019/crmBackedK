const Customer = require('../models/Customer');
const Booking = require('../models/Booking');
const Delivery = require('../models/Delivery');
const Followup = require('../models/Followup');

exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const staffFilter = req.user.role === 'staff' ? { assignedStaff: req.user._id } : {};

    const [totalCustomers, totalBookings, todayBookings, pendingDeliveries, delivered, rto, totalDeliveries] = await Promise.all([
      Customer.countDocuments(staffFilter),
      Booking.countDocuments(staffFilter),
      Booking.countDocuments({ ...staffFilter, bookingDate: { $gte: today } }),
      Delivery.countDocuments({ ...staffFilter, status: { $in: ['Order Created', 'In Transit', 'Out For Delivery', 'Attempt 1', 'Attempt 2', 'Attempt 3'] } }),
      Delivery.countDocuments({ ...staffFilter, status: 'Delivered' }),
      Delivery.countDocuments({ ...staffFilter, status: 'RTO' }),
      Delivery.countDocuments(staffFilter),
    ]);

    // Monthly delivery chart data (last 6 months)
    const monthlyData = await Delivery.aggregate([
      { $match: { status: 'Delivered', deliveredAt: { $gte: new Date(today.getFullYear(), today.getMonth() - 5, 1) } } },
      { $group: { _id: { year: { $year: '$deliveredAt' }, month: { $month: '$deliveredAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({
      totalCustomers, totalBookings, todayBookings, pendingDeliveries, delivered,
      rtoPercent: totalDeliveries ? ((rto / totalDeliveries) * 100).toFixed(1) : 0,
      monthlyData,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getReports = async (req, res) => {
  try {
    const { type, staff, pincode, from, to } = req.query;
    const dateFilter = {};
    if (from) dateFilter.$gte = new Date(from);
    if (to) dateFilter.$lte = new Date(to);

    if (type === 'customers') {
      const q = {};
      if (staff) q.assignedStaff = staff;
      if (pincode) q.pincode = pincode;
      if (from || to) q.createdAt = dateFilter;
      const data = await Customer.find(q).populate('assignedStaff', 'name').lean();
      return res.json(data);
    }
    if (type === 'bookings') {
      const q = {};
      if (staff) q.assignedStaff = staff;
      if (from || to) q.bookingDate = dateFilter;
      const data = await Booking.find(q).populate('customer', 'name phone').populate('assignedStaff', 'name').lean();
      return res.json(data);
    }
    if (type === 'deliveries') {
      const q = {};
      if (staff) q.assignedStaff = staff;
      if (from || to) q.createdAt = dateFilter;
      const data = await Delivery.find(q).populate('customer', 'name phone pincode').populate('assignedStaff', 'name').lean();
      return res.json(data);
    }
    if (type === 'staff-performance') {
      const data = await Delivery.aggregate([
        { $group: { _id: '$assignedStaff', delivered: { $sum: { $cond: [{ $eq: ['$status', 'Delivered'] }, 1, 0] } }, rto: { $sum: { $cond: [{ $eq: ['$status', 'RTO'] }, 1, 0] } }, total: { $sum: 1 } } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'staff' } },
        { $unwind: { path: '$staff', preserveNullAndEmpty: true } },
      ]);
      return res.json(data);
    }
    res.status(400).json({ message: 'Invalid report type' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
