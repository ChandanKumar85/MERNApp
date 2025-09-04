const express = require('express');
const mongoose = require('mongoose');
const userRoute = require('./app/routes/userRoute');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const DB_CRID = process.env.DATABASE_URL.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// Middleware to parse JSON requests
app.use(express.json());

// Routes
app.use('/api/v1', userRoute)

// Connect to MongoDB
mongoose.connect(DB_CRID).then(() => {
    console.log('Connected to MongoDB');
    // Start the server after successful DB connection
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});




















// Basic route
// app.post('/api/v1/users', (req, res)=>{
//     res.send("User route");
// });
