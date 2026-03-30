const User = require('../models/User');

exports.getStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: { $in: ['staff', 'admin'] } }).select('-password');
    res.json(staff);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createStaff = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.updateStaff = async (req, res) => {
  try {
    const { password, ...data } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    Object.assign(user, data);
    if (password) user.password = password;
    await user.save();
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, status: user.status });
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.deleteStaff = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Staff deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
