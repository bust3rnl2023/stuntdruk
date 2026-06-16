const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();

// Set up security headers
app.use(helmet());

// Enable CORS
app.use(cors({
  origin: '*', // Allow all origins for testing. In production, configure to specific origins if needed.
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging
const isProduction = process.env.NODE_ENV === 'production';
app.use(morgan(isProduction ? 'combined' : 'dev'));

// Parse JSON request bodies
app.use(express.json());

// API Status / Health Check
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'Stuntdruk Backend API is up and running.',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err.message || err);
  
  const status = err.status || 500;
  const message = isProduction ? 'Internal Server Error' : err.message;
  
  res.status(status).json({
    error: message,
    ...(isProduction ? {} : { stack: err.stack })
  });
});

module.exports = app;
