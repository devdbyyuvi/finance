const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const transactionController = require('../controllers/transaction');
const authMiddleware = require('../middleware/auth');
const Transaction = require('../models/transactionSchema');

router.post('/', authMiddleware, transactionController.createTransaction);
router.delete('/:id', authMiddleware, transactionController.deleteTransaction);
router.get('/:id', authMiddleware, transactionController.getTransaction);
router.put('/:id', authMiddleware, transactionController.updateTransaction);
router.get('/', authMiddleware, transactionController.getAllTransactions);
router.post('/user', authMiddleware, transactionController.getUserTransactions);
module.exports = router