require('dotenv').config();
const express = require('express');
const userRoute = require('./app/routes/userRoute');
const connectDB = require('./app/config/db');
const cors = require('cors');

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(cors());
app.use('/api/v1/auth', userRoute);

// Connect to DB first, then start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
});