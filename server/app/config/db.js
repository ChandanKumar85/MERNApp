const mongoose = require('mongoose');

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set in environment variables.");
  process.exit(1);
}

if (!process.env.DATABASE_PASSWORD) {
  console.error("DATABASE_PASSWORD is not set in environment variables.");
  process.exit(1);
}

const DB_CRID = process.env.DATABASE_URL.replace(
  '<PASSWORD>',
  encodeURIComponent(process.env.DATABASE_PASSWORD)
);

const connectDB = async () => {
  try {
    await mongoose.connect(DB_CRID);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

module.exports = connectDB;