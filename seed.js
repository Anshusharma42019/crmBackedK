require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Customer = require('./models/Customer');
const Booking = require('./models/Booking');
const Delivery = require('./models/Delivery');
const Followup = require('./models/Followup');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User.deleteMany(), Customer.deleteMany(), Booking.deleteMany(), Delivery.deleteMany(), Followup.deleteMany()]);

  const admin = await User.create({ name: 'Admin User', email: 'admin@crm.com', password: 'admin123', role: 'admin', phone: '9999900000' });
  const staff1 = await User.create({ name: 'Rahul Sharma', email: 'rahul@crm.com', password: 'staff123', role: 'staff', phone: '9876543210' });
  const staff2 = await User.create({ name: 'Priya Singh', email: 'priya@crm.com', password: 'staff123', role: 'staff', phone: '9876543211' });

  const customers = await Customer.insertMany([
    { name: 'Amit Kumar', phone: '9111111111', age: 32, address: 'Civil Lines, Kanpur', pincode: '208001', price: 1500, assignedStaff: staff1._id, createdBy: admin._id, remarks: 'Interested in premium plan' },
    { name: 'Sunita Devi', phone: '9222222222', age: 45, address: 'Kidwai Nagar, Kanpur', pincode: '208011', price: 2000, assignedStaff: staff1._id, createdBy: admin._id },
    { name: 'Ravi Verma', phone: '9333333333', age: 28, address: 'Govind Nagar, Kanpur', pincode: '208006', price: 1200, assignedStaff: staff2._id, createdBy: admin._id },
    { name: 'Meena Gupta', phone: '9444444444', age: 38, address: 'Arya Nagar, Kanpur', pincode: '208002', price: 1800, assignedStaff: staff2._id, createdBy: admin._id },
    { name: 'Suresh Yadav', phone: '9555555555', age: 50, address: 'Swaroop Nagar, Kanpur', pincode: '208002', price: 2500, assignedStaff: staff1._id, createdBy: admin._id },
  ]);

  const statuses = ['Delivered', 'Delivered', 'In Transit', 'RTO', 'Out For Delivery'];
  for (let i = 0; i < customers.length; i++) {
    const booking = await Booking.create({
      customer: customers[i]._id, price: customers[i].price,
      assignedStaff: customers[i].assignedStaff, status: 'Verified', createdBy: admin._id,
      bookingDate: new Date(Date.now() - i * 86400000),
    });
    await Delivery.create({
      booking: booking._id, customer: customers[i]._id,
      assignedStaff: customers[i].assignedStaff, status: statuses[i],
      deliveredAt: statuses[i] === 'Delivered' ? new Date() : undefined,
    });
  }

  await Followup.insertMany([
    { customer: customers[0]._id, staff: staff1._id, note: 'Call back regarding delivery', nextFollowupDate: new Date(Date.now() + 86400000), status: 'Pending', createdBy: admin._id },
    { customer: customers[2]._id, staff: staff2._id, note: 'Confirm address', nextFollowupDate: new Date(Date.now() - 86400000), status: 'Overdue', createdBy: admin._id },
  ]);

  console.log('✅ Seed complete!\nAdmin: admin@crm.com / admin123\nStaff: rahul@crm.com / staff123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
