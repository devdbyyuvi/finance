const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const adminController = require('../controllers/admin');
const {authMiddleware, adminMiddleware} = require('../middleware/auth');
const transactionController = require('../controllers/transaction');
const budgetController = require('../controllers/budget');

// Dashboard and statistics
router.get('/dashboard/stats', adminMiddleware, adminController.getDashboardStats);

// User management routes
router.get('/users', adminMiddleware, adminController.getAllUsers);
router.get('/users/:userid', adminMiddleware, adminController.getUserById);
router.put('/users/:userid', adminMiddleware, adminController.updateUser);
router.delete('/users/:userid', adminMiddleware, adminController.deleteUser);
router.get('/users/:userid/activity', adminMiddleware, adminController.getUserActivity);

// Transaction management routes
router.get('/transactions', adminMiddleware, transactionController.getAllTransactions);
router.delete('/transactions/:id', adminMiddleware, transactionController.deleteTransaction);

// Budget management (using existing budget controller)
router.get('/budgets', adminMiddleware, budgetController.getAllBudgets);
router.delete('/budgets/:id', adminMiddleware, budgetController.deleteBudget);

module.exports = router;