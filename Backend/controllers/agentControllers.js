import Task from '../Models/TaskModel.js'; 

export const agenttasks = async (req, res) => {
    try {
        if (req.user.type !== 'agent') {
            return res.status(403).json({ message: 'Access denied. Agents only.' });
        }

        const tasks = await Task.find({ assignedTo: req.user.id });

        res.status(200).json({ tasks });
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving tasks', error: err.message });
    }
}