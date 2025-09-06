const express = require('express');
const mongoose = require('mongoose');
const userRoute = require('./app/routes/userRoute');
const connectDB = require('./app/config/db');

// Load environment variables from .env file
require('dotenv').config();

// Set the port from environment variable or default to 5000
const PORT = process.env.PORT || 5000;

// Initialize Express app
const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// Routes
app.use('/api/v1/users', userRoute)


// Connect to DB first, then start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
});