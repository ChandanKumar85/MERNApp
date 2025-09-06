const mongoose = require('mongoose');
require('dotenv').config();

const DB_CRID = process.env.DATABASE_URL.replace(
    '<PASSWORD>', process.env.DATABASE_PASSWORD
    // encodeURIComponent()
);

const connectDB = async () => {
    try {
        // await mongoose.connect(DB_CRID);
        await mongoose.connect(DB_CRID, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
    }
    catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
}

module.exports = connectDB;