const express = require('express');
const dotenv  = require('dotenv');
dotenv.config();

const clientsRoutes    = require('./src/routes/clients');
const addressesRoutes = require('./src/routes/addresses');
const productsRoutes  = require('./src/routes/products');
const ordersRoutes    = require('./src/routes/orders');

const app = express();
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Jewelry Shop API is running!' });
});

// Routes
app.use('/api/clients',    clientsRoutes);
app.use('/api/addresses', addressesRoutes);
app.use('/api/products',  productsRoutes);
app.use('/api/orders',    ordersRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});