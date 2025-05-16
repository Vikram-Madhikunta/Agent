import express from 'express';
import Task from '../Models/TaskModel.js';
import { authUser } from '../middleware/auth.js';
import { agenttasks } from '../controllers/agentControllers.js';

const router = express.Router();

router.get('/my-tasks', authUser, agenttasks);

export default router;