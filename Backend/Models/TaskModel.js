import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
    Name: String,
    TransactionID: Number,
    Amount: Number,
    Date: String,
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
});

export default mongoose.model('Task', TaskSchema);
