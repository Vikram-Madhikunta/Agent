import express from 'express';
import mongoose from 'mongoose';
import connect from './connect/db.js';
import userRoutes from './routes/userRoutes.js';

connect();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/user", userRoutes);

export default app;