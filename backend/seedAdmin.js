require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  console.log("Connected DB:", mongoose.connection.db.databaseName);

  const exists = await User.findOne({ email: 'admin@frms.com' });

  console.log("User Found:", exists);

  if (exists) {
    console.log('✅ Admin already exists!');
  } else {
    await User.create({
      name: 'Super Admin',
      email: 'admin@frms.com',
      password: 'admin@frms',
      role: 'admin',
    });
    console.log('✅ Admin created!');
  }

  mongoose.disconnect();
};

seed();