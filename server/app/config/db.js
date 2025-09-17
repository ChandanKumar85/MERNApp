const mongoose = require('mongoose');
require('dotenv').config();

const DB_CRID = process.env.DATABASE_URL.replace(
    '<PASSWORD>', process.env.DATABASE_PASSWORD
    // encodeURIComponent()
);

const connectDB = async () => {
    mongoose.connect(DB_CRID)
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => console.error("MongoDB connection error:", err));
}

module.exports = connectDB;