import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
    FirstName: String,
    Phone: Number,
    Notes: String,
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

export default mongoose.model('Task', TaskSchema);
