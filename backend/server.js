require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const logger= require('./utils/logger');
const server = express();
const authRouter = require('./routes/authRoute');
const transactionRouter = require('./routes/transactionRoute');
const budgetRouter = require('./routes/budgetRoute');

server.use(cors());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use('/api/auth', authRouter);
server.use('/api/transactions', transactionRouter);
server.use('/api/budgets', budgetRouter);
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    logger.info('Connected to MongoDB');
    server.listen(process.env.PORT || 5000, ()=>{
        logger.info(`Server is running on port ${process.env.PORT || 5000}`);
    })
})
.catch((err) => {
    logger.error('Error connecting to MongoDB:', err);
});