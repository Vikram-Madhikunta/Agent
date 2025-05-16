import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { parse } from 'csv-parse/sync';
import xlsx from 'xlsx';

import User from '../Models/userModel.js';
import Task from '../Models/TaskModel.js';

// CREATE USER
export const createUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { email, password, type = "agent", name, mobile } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already exists' });
        }

        const hashedPassword = await User.hashPassword(password);

        const newUser = new User({
            email,
            password: hashedPassword,
            type,
            name,
            mobile,
        });

        await newUser.save();

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: newUser._id,
                email: newUser.email,
                type: newUser.type,
                name: newUser.name,
                mobile: newUser.mobile,
            }
        });
    } catch (error) {
        console.error('User creation error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET ALL USERS
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// DELETE USER
export const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// UPDATE USER
export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { email, password, type = "agent", name, mobile } = req.body;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check for duplicate email if changed
        if (email && email !== user.email) {
            const existing = await User.findOne({ email });
            if (existing && existing._id.toString() !== id) {
                return res.status(409).json({ message: 'Email already in use by another user' });
            }
            user.email = email;
        }

        if (password && password.trim()) {
            user.password = await User.hashPassword(password);
        }

        if (type) user.type = type;
        if (name) user.name = name;
        if (mobile) user.mobile = mobile;

        await user.save();

        res.status(200).json({
            message: 'User updated successfully',
            user: {
                id: user._id,
                email: user.email,
                type: user.type,
                name: user.name,
                mobile: user.mobile,
            }
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const parseListFile = async (req, res) => {
    try {
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ message: 'No file uploaded or file is empty' });
        }

        const ext = req.file.originalname.split('.').pop().toLowerCase();
        let data = [];

        // Parse CSV or XLSX
        if (ext === 'csv') {
            const content = req.file.buffer.toString();
            const records = parse(content, {
                columns: true,
                skip_empty_lines: true,
            });
            data = records;
        } else if (ext === 'xlsx' || ext === 'xls') {
            const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            data = xlsx.utils.sheet_to_json(sheet);
        } else {
            return res.status(400).json({ message: 'Invalid file type' });
        }

        // Normalize Phone to Number
        data = data.map(row => ({
            FirstName: row.FirstName?.toString().trim(),
            Phone: Number(row.Phone),
            Notes: row.Notes?.toString().trim(),
        }));

        // Validate structure and types
        const isValid = data.every(row =>
            typeof row.FirstName === 'string' && row.FirstName !== '' &&
            typeof row.Phone === 'number' && !isNaN(row.Phone) &&
            typeof row.Notes === 'string' && row.Notes !== ''
        );

        if (!isValid) {
            return res.status(422).json({ message: 'Invalid file structure or data' });
        }

        // Get all agents
        const agents = await User.find({ type: 'agent' });

        if (agents.length === 0) {
            return res.status(400).json({ message: 'No agents available to assign tasks' });
        }

        // Distribute tasks round-robin
        const distributed = {};
        agents.forEach(agent => { distributed[agent._id] = []; });

        let agentIndex = 0;
        for (let i = 0; i < data.length; i++) {
            const agent = agents[agentIndex];
            distributed[agent._id].push({
                FirstName: data[i].FirstName,
                Phone: data[i].Phone,
                Notes: data[i].Notes,
                assignedTo: agent._id,
            });
            agentIndex = (agentIndex + 1) % agents.length;
        }

        // Insert all tasks
        await Task.insertMany(Object.values(distributed).flat());

        res.status(200).json({
            message: 'Data distributed successfully',
            distributedTo: agents.length,
            totalTasks: data.length,
            preview: Object.entries(distributed).map(([agentId, tasks]) => ({
                agentId,
                tasks: tasks.slice(0, 3),
            })),
        });

    } catch (err) {
        console.error('File processing error:', err);
        res.status(500).json({ message: 'Failed to process file', error: err.message });
    }
};

// GET TASKS FOR AN AGENT
export const getTasksByAgent = async (req, res) => {
    const { agentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(agentId)) {
        return res.status(400).json({ message: 'Invalid agent ID' });
    }

    try {
        const tasks = await Task.find({ assignedTo: agentId }).populate('assignedTo', 'name email');
        if (!tasks || tasks.length === 0) {
            return res.status(404).json({ message: 'No tasks found for this agent' });
        }
        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
