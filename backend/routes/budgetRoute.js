const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const budgetController = require('../controllers/budget');
const authMiddleware = require('../middleware/auth');
const Budget = require('../models/budgetSchema');

router.post('/', authMiddleware, budgetController.createBudget);
router.delete('/:id', authMiddleware, budgetController.deleteBudget);
router.get('/:id', authMiddleware, budgetController.getBudget);
router.put('/:id', authMiddleware, budgetController.updateBudget);
router.get('/', authMiddleware, budgetController.getAllBudgets);
router.post('/user', authMiddleware, budgetController.getUserBudgets);

module.exports = router