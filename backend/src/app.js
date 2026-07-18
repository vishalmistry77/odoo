const express = require('express'); // Server restart trigger v2
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const adminSettingsRoutes = require('./routes/adminSettingsRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/fulfillment', require('./routes/fulfillmentRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/invoice', require('./routes/invoiceRoutes'));
app.use('/api/settings', adminSettingsRoutes);
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/reports', require('./routes/reportsRoutes'));
app.use('/uploads', express.static('uploads'));

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
