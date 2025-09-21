const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Import routes
const algorithmRoutes = require('./routes/algorithms');
const visualizationRoutes = require('./routes/visualizations');

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/algolearn';

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('📦 Connected to MongoDB');
    })
    .catch((error) => {
        console.error('❌ MongoDB connection error:', error);
    });

// Middleware
app.use(cors({
    origin: ['http://localhost:5174', 'http://localhost:3000'],
    credentials: true
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// API Routes
app.use('/api/algorithms', algorithmRoutes);
app.use('/api/visualizations', visualizationRoutes);

// Basic route
app.get('/', (req, res) => {
    res.json({
        message: 'AlgoLearn Merge Sort API Server',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            algorithms: '/api/algorithms',
            visualizations: '/api/visualizations',
            health: '/health'
        },
        documentation: 'See README.md for API documentation'
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        availableRoutes: [
            'GET /',
            'GET /health',
            'GET /api/algorithms',
            'POST /api/algorithms/execute',
            'GET /api/visualizations'
        ]
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 AlgoLearn API available at http://localhost:${PORT}`);
    console.log(`🔗 Frontend should connect to: http://localhost:${PORT}`);
});