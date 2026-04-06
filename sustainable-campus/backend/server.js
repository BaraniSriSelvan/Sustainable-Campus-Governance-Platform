const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/sustainability', require('./routes/sustainability'));
app.use('/api/events', require('./routes/events'));
app.use('/api/feedback', require('./routes/feedback'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Sustainable Campus API is running' });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    await seedAdminAccount();
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

async function seedAdminAccount() {
  const User = require('./models/User');
  const bcrypt = require('bcryptjs');
  const existing = await User.findOne({ role: 'admin' });
  if (!existing) {
    const hashed = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Campus Administrator',
      email: 'admin@campus.edu',
      password: hashed,
      role: 'admin'
    });
    console.log('✅ Admin account seeded: admin@campus.edu / admin123');
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
