const Customer = require('../models/Customer');

exports.getCustomers = async (req, res) => {
  try {
    const { search, staff, pincode, from, to, page = 1, limit = 10 } = req.query;
    const query = {};
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { phone: new RegExp(search, 'i') }];
    if (staff) query.assignedStaff = staff;
    if (pincode) query.pincode = pincode;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }
    if (req.user.role === 'staff') query.assignedStaff = req.user._id;

    const total = await Customer.countDocuments(query);
    const customers = await Customer.find(query)
      .populate('assignedStaff', 'name email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ customers, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createCustomer = async (req, res) => {
  try {
    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
    const customer = await Customer.create({ ...req.body, images, createdBy: req.user._id });
    res.status(201).json(customer);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.deleteCustomer = async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Customer deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate('assignedStaff', 'name email');
    if (!customer) return res.status(404).json({ message: 'Not found' });
    res.json(customer);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
