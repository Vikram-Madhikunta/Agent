// controllers/authController.js
import { validationResult } from 'express-validator';
import User from '../Models/userModel.js';

export const getLogin = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isValid = await user.isValidPassword(password);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = user.generateJWT();
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 24 * 60 * 60 * 1000,
          });
          
        const userResponse = { ...user._doc };
        delete userResponse.password;

        res.status(200).json({ message: 'Login successful', user: userResponse, token });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const registerUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { email, password, type } = req.body;

    try {
        const existUser = await User.findOne({ email }).select('+password');

        if (existUser) {
            return res.status(409).json({ message: 'Email already exists' });
        }

        const hashedPassword = await User.hashPassword(password);

        const user = new User({
            email,
            password: hashedPassword,  
            type,
        });

        await user.save();

        const token = user.generateJWT();
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 24 * 60 * 60 * 1000,
          });
        const userResponse = { ...user._doc };
        delete userResponse.password;

        res.status(201).json({ message: 'User registered successfully', user: userResponse, token });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const logoutUser = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
        });
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
