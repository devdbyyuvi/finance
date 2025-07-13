const Transaction = require('../models/transactionSchema');
const logger = require('../utils/logger');

module.exports = {
    createTransaction: async (req, res) => {
        try {
            const {
                type,
                amount,
                category,
                note,
                userid
            } = req.body;

            if (!type || !amount || !category || !userid) {
                return res.status(400).json({
                    msg: 'Missing required fields: type, amount, category, and userid are required'
                });
            }

            if (!['income', 'expense'].includes(type)) {
                return res.status(400).json({
                    msg: 'Type must be either "income" or "expense"'
                });
            }

            if (amount <= 0) {
                return res.status(400).json({
                    msg: 'Amount must be a positive number'
                });
            }

            const newTransaction = new Transaction({
                userId: userid,
                type,
                amount,
                category,
                note: note || ''
            });

            const savedTransaction = await newTransaction.save();
            
            logger.info(`Transaction created successfully: ${savedTransaction._id}`);
            
            res.status(201).json({
                msg: 'Transaction created successfully',
                transaction: savedTransaction
            });

        } catch (err) {
            logger.error('Error creating transaction:', err);
            res.status(500).json({
                msg: 'Internal server error'
            });
        }
    },

    deleteTransaction: async (req, res) => {
        try {
            const { id } = req.params;
            const { userid } = req.body; 

            if (!id) {
                return res.status(400).json({
                    msg: 'Transaction ID is required'
                });
            }

            const deletedTransaction = await Transaction.findOneAndDelete({
                _id: id,
                userId: userid
            });

            if (!deletedTransaction) {
                return res.status(404).json({
                    msg: 'Transaction not found or unauthorized'
                });
            }

            logger.info(`Transaction deleted successfully: ${id}`);
            
            res.status(200).json({
                msg: 'Transaction deleted successfully',
                transaction: deletedTransaction
            });

        } catch (err) {
            logger.error('Error deleting transaction:', err);
            res.status(500).json({
                msg: 'Internal server error'
            });
        }
    },

    getTransaction: async (req, res) => {
        try {
            const { id } = req.params;
            const { userid } = req.body; 
            if (!id) {
                return res.status(400).json({
                    msg: 'Transaction ID is required'
                });
            }

            const transaction = await Transaction.findOne({
                _id: id,
                userId: userid
            });

            if (!transaction) {
                return res.status(404).json({
                    msg: 'Transaction not found or unauthorized'
                });
            }

            res.status(200).json({
                msg: 'Transaction retrieved successfully',
                transaction
            });

        } catch (err) {
            logger.error('Error fetching transaction:', err);
            res.status(500).json({
                msg: 'Internal server error'
            });
        }
    },

    updateTransaction: async (req, res) => {
        try {
            const { id } = req.params;
            const {
                type,
                amount,
                category,
                note,
                userid
            } = req.body;

            if (!id) {
                return res.status(400).json({
                    msg: 'Transaction ID is required'
                });
            }
            if (type && !['income', 'expense'].includes(type)) {
                return res.status(400).json({
                    msg: 'Type must be either "income" or "expense"'
                });
            }

            if (amount !== undefined && amount <= 0) {
                return res.status(400).json({
                    msg: 'Amount must be a positive number'
                });
            }

            const updateData = {};
            if (type) updateData.type = type;
            if (amount !== undefined) updateData.amount = amount;
            if (category) updateData.category = category;
            if (note !== undefined) updateData.note = note;

            // Update transaction
            const updatedTransaction = await Transaction.findOneAndUpdate(
                { _id: id, userId: userid },
                updateData,
                { new: true, runValidators: true }
            );

            if (!updatedTransaction) {
                return res.status(404).json({
                    msg: 'Transaction not found or unauthorized'
                });
            }

            logger.info(`Transaction updated successfully: ${id}`);
            
            res.status(200).json({
                msg: 'Transaction updated successfully',
                transaction: updatedTransaction
            });

        } catch (err) {
            logger.error('Error updating transaction:', err);
            res.status(500).json({
                msg: 'Internal server error'
            });
        }
    },

    getAllTransactions: async (req, res) => {
        try {
            const { page = 1, limit = 10, type, category, sortBy = 'date', order = 'desc' } = req.query;

            const filter = {};
            if (type) filter.type = type;
            if (category) filter.category = new RegExp(category, 'i'); 

            const sort = {};
            sort[sortBy] = order === 'desc' ? -1 : 1;

            const skip = (parseInt(page) - 1) * parseInt(limit);

            const transactions = await Transaction.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit));

            const totalCount = await Transaction.countDocuments(filter);

            res.status(200).json({
                msg: 'Transactions retrieved successfully',
                transactions,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount / parseInt(limit)),
                    totalTransactions: totalCount,
                    hasNextPage: skip + transactions.length < totalCount,
                    hasPrevPage: parseInt(page) > 1
                }
            });

        } catch (err) {
            logger.error('Error fetching all transactions:', err);
            res.status(500).json({
                msg: 'Internal server error'
            });
        }
    },

    getUserTransactions: async (req, res) => {
        try {
            const { userid } = req.body; 
            const { page = 1, limit = 10, type, category, sortBy = 'date', order = 'desc' } = req.query;

            if (!userid) {
                return res.status(400).json({
                    msg: 'User ID is required'
                });
            }

            const filter = { userId: userid };
            if (type) filter.type = type;
            if (category) filter.category = new RegExp(category, 'i');

            const sort = {};
            sort[sortBy] = order === 'desc' ? -1 : 1;

            const skip = (parseInt(page) - 1) * parseInt(limit);

            const transactions = await Transaction.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit));

            const totalCount = await Transaction.countDocuments(filter);

            const totalIncome = await Transaction.aggregate([
                { $match: { userId: userid, type: 'income' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);

            const totalExpense = await Transaction.aggregate([
                { $match: { userId: userid, type: 'expense' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);

            const incomeTotal = totalIncome.length > 0 ? totalIncome[0].total : 0;
            const expenseTotal = totalExpense.length > 0 ? totalExpense[0].total : 0;

            res.status(200).json({
                msg: 'User transactions retrieved successfully',
                transactions,
                summary: {
                    totalIncome: incomeTotal,
                    totalExpense: expenseTotal,
                    balance: incomeTotal - expenseTotal
                },
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount / parseInt(limit)),
                    totalTransactions: totalCount,
                    hasNextPage: skip + transactions.length < totalCount,
                    hasPrevPage: parseInt(page) > 1
                }
            });

        } catch (err) {
            logger.error('Error fetching user transactions:', err);
            res.status(500).json({
                msg: 'Internal server error'
            });
        }
    }
};