import express from 'express';
import mongoose from 'mongoose';
import connect from './connect/db.js';
import userRoutes from './routes/userRoutes.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import AdminRoutes from './routes/adminRoutes.js';
import AgentRoutes from './routes/agentRoutes.js';
import dotenv from 'dotenv';
dotenv.config();

connect();
const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/user", userRoutes);
app.use("/admin", AdminRoutes);
app.use("/agent", AgentRoutes);

export default app;