const Delivery = require('../models/Delivery');

exports.getDeliveries = async (req, res) => {
  try {
    const { status, staff, from, to, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (staff) query.assignedStaff = staff;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }
    if (req.user.role === 'staff') query.assignedStaff = req.user._id;

    const total = await Delivery.countDocuments(query);
    const deliveries = await Delivery.find(query)
      .populate('customer', 'name phone address pincode')
      .populate('assignedStaff', 'name')
      .populate('booking', 'bookingDate price status')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ deliveries, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });
    delivery.status = status;
    delivery.statusHistory.push({ status, updatedBy: req.user._id, note });
    if (status === 'Delivered') delivery.deliveredAt = new Date();
    await delivery.save();
    res.json(delivery);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.getDeliveryStats = async (req, res) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [todayDelivered, yesterdayDelivered, monthDelivered, rto, total] = await Promise.all([
      Delivery.countDocuments({ status: 'Delivered', deliveredAt: { $gte: today } }),
      Delivery.countDocuments({ status: 'Delivered', deliveredAt: { $gte: yesterday, $lt: today } }),
      Delivery.countDocuments({ status: 'Delivered', deliveredAt: { $gte: monthStart } }),
      Delivery.countDocuments({ status: 'RTO' }),
      Delivery.countDocuments(),
    ]);

    res.json({ todayDelivered, yesterdayDelivered, monthDelivered, rto, rtoPercent: total ? ((rto / total) * 100).toFixed(1) : 0 });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
