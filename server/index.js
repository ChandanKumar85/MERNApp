const express = require('express');
const userRoute = require('./app/routes/userRoute');
const connectDB = require('./app/config/db');
var cors = require('cors')

require('dotenv').config(); // Load environment variables from .env file
const PORT = process.env.PORT || 5000; // Set the port from environment variable or default to 5000
const app = express(); // Initialize Express app

app.use(express.json()); // Middleware to parse JSON requests
app.use(cors()) // Enable CORS for all routes
app.use('/api/v1/auth', userRoute) // Auth Routes

// Connect to DB first, then start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
});