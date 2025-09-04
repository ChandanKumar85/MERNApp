const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 3, 
        validate: {
            validator: (v) => /^[A-Za-z\s]+$/.test(v),
        } 
    },
    email: { type: String, required: true, unique: true, lowercase: true,
        validate: {
            validator: (v) => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v),
        } 
    },
    phone: { type: String, required: true, 
        validate: {
            validator: (v) => /^[0-9]{10}$/.test(v),
        }
    },
    password: { type: String, required: true, minlength: 8 },
    confirmPassword: { type: String },
    role: { type: String, default: 'admin', enum: ['user', 'admin', 'super-admin'] },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// 🔐 Hash password before saving
userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

const User = mongoose.model('users', userSchema);
module.exports = User;
