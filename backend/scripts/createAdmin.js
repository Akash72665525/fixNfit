const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

mongoose.connect('mongodb://127.0.0.1:27017/fixnfit');

async function createAdmin() {

  const email = 'admin@fixnfit.com';
  const password = 'Admin@123';

  const existing = await User.findOne({ email });

  if (existing) {
    console.log('❌ Admin already exists');
    process.exit();
  }

  const hash = await bcrypt.hash(password, 10);

  const admin = new User({
    name: 'Super Admin',
    email,
    password: hash,
    role: 'admin'
  });

  await admin.save();

  console.log('✅ Admin created');
  console.log('Email:', email);
  console.log('Password:', password);

  process.exit();
}

createAdmin();
