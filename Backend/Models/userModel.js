import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const User = {
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minLength: [6, 'Email is too short'],
        maxLength: [50, 'Email is too long'],
    },
    password: {
        type: String,
        required: true,
        select: false,
        minLength: [6, 'Password is too short'],
        maxLength: [150, 'Password is too long'],
    },
    type: {
        type: String,
        default: 'admin',
        enum: ['admin', 'agent'],
    },
    name: {
        type: String,
        required: function() { return this.type === 'agent'; }, 
        trim: true,
    },
    mobile: {
        type: String,
        required: function() { return this.type === 'agent'; },
        trim: true,
    },
   
};

const userSchema = new mongoose.Schema(User);

userSchema.statics.hashPassword = async function(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

userSchema.methods.isValidPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateJWT = function() {
    return jwt.sign(
        { id: this._id, email: this.email, type: this.type },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

const UserModel = mongoose.model('User', userSchema);

export default UserModel;