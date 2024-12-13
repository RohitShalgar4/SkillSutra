import express from 'express';
import dotenv from 'dotenv';
import connectDB from './database/db.js';

dotenv.config({});
connectDB();

const app = express();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server listen at port ${PORT}`);
});