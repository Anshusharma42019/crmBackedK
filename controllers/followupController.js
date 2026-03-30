const Followup = require('../models/Followup');

exports.getFollowups = async (req, res) => {
  try {
    const { status, customer, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (customer) query.customer = customer;
    if (req.user.role === 'staff') query.staff = req.user._id;

    // Auto-mark overdue
    await Followup.updateMany(
      { status: 'Pending', nextFollowupDate: { $lt: new Date() } },
      { status: 'Overdue' }
    );

    const total = await Followup.countDocuments(query);
    const followups = await Followup.find(query)
      .populate('customer', 'name phone')
      .populate('staff', 'name')
      .sort({ nextFollowupDate: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ followups, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createFollowup = async (req, res) => {
  try {
    const followup = await Followup.create({ ...req.body, createdBy: req.user._id, staff: req.body.staff || req.user._id });
    res.status(201).json(followup);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.updateFollowup = async (req, res) => {
  try {
    const followup = await Followup.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!followup) return res.status(404).json({ message: 'Not found' });
    res.json(followup);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.deleteFollowup = async (req, res) => {
  try {
    await Followup.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
