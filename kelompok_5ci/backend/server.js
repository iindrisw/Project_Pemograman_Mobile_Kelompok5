const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// 1. Koneksi ke Cloud MongoDB Atlas
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://sabbicareledwardpiris15_db_user:cIw8Kvrt9zt43adY@pemmobkue.2nwqj4d.mongodb.net/mybakery?retryWrites=true&w=majority';

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ Terhubung ke Cloud MongoDB Atlas!'))
  .catch((err) => console.error('❌ Gagal koneksi MongoDB:', err));

// 2. Schema & Model User (Sederhana)
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', UserSchema);

// 3. Endpoint API Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email, password });
    if (user) {
      return res.status(200).json({ 
        success: true, 
        message: 'Login berhasil', 
        user: { id: user._id, email: user.email } 
      });
    }
    return res.status(400).json({ success: false, message: 'Email atau password salah' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// 4. Endpoint API Home Data (Categories & Best Sellers)
app.get('/api/home-data', async (req, res) => {
  try {
    // Catatan: Nanti data ini dapat ditarik langsung dari Koleksi MongoDB yang dikelola via Dashboard Admin
    const responseData = {
      success: true,
      categories: [
        { id: '1', name: 'Bread', icon: 'barley' },
        { id: '2', name: 'Pastries', icon: 'croissant' },
        { id: '3', name: 'Cakes', icon: 'cake-variant' },
      ],
      bestSellers: [
        {
          id: '101',
          name: 'Classic Sourdough',
          price: '$6.50',
          image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=500',
        },
        {
          id: '102',
          name: 'Classic Butter Croissant',
          price: '$3.50',
          image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500',
        },
      ],
    };

    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Menjalankan Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server backend berjalan di http://localhost:${PORT}`);
});