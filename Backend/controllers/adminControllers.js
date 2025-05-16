import { validationResult } from 'express-validator';
import User from '../Models/userModel.js';
import Task from '../Models/TaskModel.js'; 
import xlsx from 'xlsx';
import csv from 'csv-parse/sync';

export const createUser = async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { email, password, type = "agent", name, mobile } = req.body;

    try {
        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already exists' });
        }

        // Hash the password
        const hashedPassword = await User.hashPassword(password);

        // Create the user
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

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

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
}

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { email, password, type = "agent", name, mobile } = req.body;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (email) user.email = email;
        if (password) user.password = await User.hashPassword(password);
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
}


export const parseListFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const ext = req.file.originalname.split('.').pop().toLowerCase();
        let data = [];

        // Parse file
        if (ext === 'csv') {
            const content = req.file.buffer.toString();
            const records = csv.parse(content, {
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

        // Validate structure
        const isValid = data.every(row =>
            row.FirstName && row.Phone && row.Notes
        );

        if (!isValid) {
            return res.status(422).json({ message: 'Invalid file structure or data' });
        }

        // Fetch all agents
        const agents = await User.find({ type: 'agent' });

        if (agents.length === 0) {
            return res.status(400).json({ message: 'No agents available to assign tasks' });
        }

        // Distribute tasks
        const distributed = {};
        agents.forEach(agent => {
            distributed[agent._id] = [];
        });

        let agentIndex = 0;
        for (let i = 0; i < data.length; i++) {
            const agent = agents[agentIndex];
            distributed[agent._id].push({
                ...data[i],
                assignedTo: agent._id,
            });
            agentIndex = (agentIndex + 1) % agents.length;
        }

        // Optional: save to DB
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


export const getTasksByAgent = async (req, res) => {
    const { agentId } = req.params;

    try {
        const tasks = await Task.find({ assignedTo: agentId }).populate('assignedTo', 'name email');
        if (!tasks) {
            return res.status(404).json({ message: 'No tasks found for this agent' });
        }
        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}