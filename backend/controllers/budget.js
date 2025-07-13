const Budget = require('../models/budgetSchema');
const logger = require('../utils/logger');

module.exports = {
    createBudget: async (req, res) => {
        try {
            const {
                category,
                limitAmount,
                month,
                year,
                userId
            } = req.body;

            if (!category || !limitAmount || !month || !year || !userId) {
                return res.status(400).json({
                    msg: 'Missing required fields: category, limitAmount, month, year, and userId are required'
                });
            }

            // Validate month
            if (month < 1 || month > 12) {
                return res.status(400).json({
                    msg: 'Month must be between 1 and 12'
                });
            }

            // Validate year
            const currentYear = new Date().getFullYear();
            if (year < currentYear - 10 || year > currentYear + 10) {
                return res.status(400).json({
                    msg: 'Year must be within a reasonable range'
                });
            }

            // Validate limit amount
            if (limitAmount <= 0) {
                return res.status(400).json({
                    msg: 'Limit amount must be a positive number'
                });
            }

            const existingBudget = await Budget.findOne({
                userId,
                category: category.trim(),
                month,
                year
            });

            if (existingBudget) {
                return res.status(409).json({
                    msg: 'Budget already exists for this category, month, and year'
                });
            }

            const newBudget = new Budget({
                userId,
                category: category.trim(),
                limitAmount,
                month,
                year
            });

            const savedBudget = await newBudget.save();
            
            logger.info(`Budget created successfully: ${savedBudget._id}`);
            
            res.status(201).json({
                msg: 'Budget created successfully',
                budget: savedBudget
            });

        } catch (err) {
            logger.error('Error creating budget:', err);
            return res.status(500).json({
                msg: 'Internal Server Error'
            });
        }
    },

    deleteBudget: async (req, res) => {
        try {
            const { id } = req.params;
            const { userId } = req.body; 
            if (!id) {
                return res.status(400).json({
                    msg: 'Budget ID is required'
                });
            }

            const deletedBudget = await Budget.findOneAndDelete({
                _id: id,
                userId: userId
            });

            if (!deletedBudget) {
                return res.status(404).json({
                    msg: 'Budget not found or unauthorized'
                });
            }

            logger.info(`Budget deleted successfully: ${id}`);
            
            res.status(200).json({
                msg: 'Budget deleted successfully',
                budget: deletedBudget
            });

        } catch (err) {
            logger.error('Error deleting budget:', err);
            return res.status(500).json({
                msg: 'Internal Server Error'
            });
        }
    },

    getBudget: async (req, res) => {
        try {
            const { id } = req.params;
            const { userId } = req.body; 
            if (!id) {
                return res.status(400).json({
                    msg: 'Budget ID is required'
                });
            }

            const budget = await Budget.findOne({
                _id: id,
                userId: userId
            });

            if (!budget) {
                return res.status(404).json({
                    msg: 'Budget not found or unauthorized'
                });
            }

            res.status(200).json({
                msg: 'Budget retrieved successfully',
                budget
            });

        } catch (err) {
            logger.error('Error fetching budget:', err);
            return res.status(500).json({
                msg: 'Internal Server Error'
            });
        }
    },

    updateBudget: async (req, res) => {
        try {
            const { id } = req.params;
            const {
                category,
                limitAmount,
                month,
                year,
                userId
            } = req.body;

            if (!id) {
                return res.status(400).json({
                    msg: 'Budget ID is required'
                });
            }

            if (month !== undefined && (month < 1 || month > 12)) {
                return res.status(400).json({
                    msg: 'Month must be between 1 and 12'
                });
            }

            if (year !== undefined) {
                const currentYear = new Date().getFullYear();
                if (year < currentYear - 10 || year > currentYear + 10) {
                    return res.status(400).json({
                        msg: 'Year must be within a reasonable range'
                    });
                }
            }

            if (limitAmount !== undefined && limitAmount <= 0) {
                return res.status(400).json({
                    msg: 'Limit amount must be a positive number'
                });
            }

            const updateData = {};
            if (category) updateData.category = category.trim();
            if (limitAmount !== undefined) updateData.limitAmount = limitAmount;
            if (month !== undefined) updateData.month = month;
            if (year !== undefined) updateData.year = year;

            if (category || month !== undefined || year !== undefined) {
                const existingBudget = await Budget.findOne({
                    _id: { $ne: id },
                    userId: userId,
                    category: category || undefined,
                    month: month || undefined,
                    year: year || undefined
                });

                if (existingBudget) {
                    return res.status(409).json({
                        msg: 'Budget already exists for this category, month, and year'
                    });
                }
            }

            const updatedBudget = await Budget.findOneAndUpdate(
                { _id: id, userId: userId },
                updateData,
                { new: true, runValidators: true }
            );

            if (!updatedBudget) {
                return res.status(404).json({
                    msg: 'Budget not found or unauthorized'
                });
            }

            logger.info(`Budget updated successfully: ${id}`);
            
            res.status(200).json({
                msg: 'Budget updated successfully',
                budget: updatedBudget
            });

        } catch (err) {
            logger.error('Error updating budget:', err);
            return res.status(500).json({
                msg: 'Internal Server Error'
            });
        }
    },

    getAllBudgets: async (req, res) => {
        try {
            const { page = 1, limit = 10, category, month, year, sortBy = 'createdAt', order = 'desc' } = req.query;

            const filter = {};
            if (category) filter.category = new RegExp(category, 'i'); 
            if (month) filter.month = parseInt(month);
            if (year) filter.year = parseInt(year);

            const sort = {};
            sort[sortBy] = order === 'desc' ? -1 : 1;

            const skip = (parseInt(page) - 1) * parseInt(limit);

            const budgets = await Budget.find(filter)
                .populate('userId', 'name email') 
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit));

            const totalCount = await Budget.countDocuments(filter);

            res.status(200).json({
                msg: 'Budgets retrieved successfully',
                budgets,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount / parseInt(limit)),
                    totalBudgets: totalCount,
                    hasNextPage: skip + budgets.length < totalCount,
                    hasPrevPage: parseInt(page) > 1
                }
            });

        } catch (err) {
            logger.error('Error fetching all budgets:', err);
            return res.status(500).json({
                msg: 'Internal Server Error'
            });
        }
    },

    getUserBudgets: async (req, res) => {
        try {
            const { userId } = req.body; 
            const { page = 1, limit = 10, category, month, year, sortBy = 'createdAt', order = 'desc' } = req.query;

            if (!userId) {
                return res.status(400).json({
                    msg: 'User ID is required'
                });
            }
            const filter = { userId: userId };
            if (category) filter.category = new RegExp(category, 'i'); 
            if (month) filter.month = parseInt(month);
            if (year) filter.year = parseInt(year);
            const sort = {};
            sort[sortBy] = order === 'desc' ? -1 : 1;

            const skip = (parseInt(page) - 1) * parseInt(limit);

            const budgets = await Budget.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit));

            const totalCount = await Budget.countDocuments(filter);

            const totalBudgetAmount = await Budget.aggregate([
                { $match: { userId: userId } },
                { $group: { _id: null, total: { $sum: '$limitAmount' } } }
            ]);

            const currentMonth = new Date().getMonth() + 1;
            const currentYear = new Date().getFullYear();

            const currentMonthBudgets = await Budget.find({
                userId: userId,
                month: currentMonth,
                year: currentYear
            });

            const currentMonthTotal = currentMonthBudgets.reduce((sum, budget) => sum + budget.limitAmount, 0);

            res.status(200).json({
                msg: 'User budgets retrieved successfully',
                budgets,
                summary: {
                    totalBudgetAmount: totalBudgetAmount.length > 0 ? totalBudgetAmount[0].total : 0,
                    currentMonthBudgets: currentMonthBudgets.length,
                    currentMonthTotal: currentMonthTotal,
                    activeBudgets: budgets.filter(b => b.month >= currentMonth && b.year >= currentYear).length
                },
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount / parseInt(limit)),
                    totalBudgets: totalCount,
                    hasNextPage: skip + budgets.length < totalCount,
                    hasPrevPage: parseInt(page) > 1
                }
            });

        } catch (err) {
            logger.error('Error fetching user budgets:', err);
            return res.status(500).json({
                msg: 'Internal Server Error'
            });
        }
    }
};