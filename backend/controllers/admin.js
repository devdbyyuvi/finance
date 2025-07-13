const User = require('../models/userSchema');
const Transaction = require('../models/transactionSchema');
const Budget = require('../models/budgetSchema');
const logger = require('../utils/logger');

module.exports = {
    getAllUsers: async (req, res) => {
        try {
            const { page = 1, limit = 10, role, search, sortBy = 'createdAt', order = 'desc' } = req.query;
            const filter = {};
            if (role) filter.role = role;
            if (search) {
                filter.$or = [
                    { firstName: new RegExp(search, 'i') },
                    { lastName: new RegExp(search, 'i') },
                    { email: new RegExp(search, 'i') }
                ];
            }

            const sort = {};
            sort[sortBy] = order === 'desc' ? -1 : 1;

            const skip = (parseInt(page) - 1) * parseInt(limit);

            const users = await User.find(filter)
                .select('-password') 
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit));

            const totalCount = await User.countDocuments(filter);

            logger.info(`Admin fetched ${users.length} users`);

            res.status(200).json({
                message: 'Users retrieved successfully',
                users,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount / parseInt(limit)),
                    totalUsers: totalCount,
                    hasNextPage: skip + users.length < totalCount,
                    hasPrevPage: parseInt(page) > 1
                }
            });

        } catch (error) {
            logger.error('Error fetching all users:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    getUserById: async (req, res) => {
        try {
            const { userid } = req.params;

            if (!userid) {
                return res.status(400).json({ error: 'User ID is required' });
            }

            const user = await User.findById(userid).select('-password');
            
            if (!user) {
                logger.error('User not found:', userid);
                return res.status(404).json({ error: 'User not found' });
            }

            const transactionSummary = await Transaction.aggregate([
                { $match: { userId: user._id } },
                {
                    $group: {
                        _id: null,
                        totalTransactions: { $sum: 1 },
                        totalIncome: {
                            $sum: {
                                $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0]
                            }
                        },
                        totalExpense: {
                            $sum: {
                                $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
                            }
                        }
                    }
                }
            ]);

            const budgetSummary = await Budget.aggregate([
                { $match: { userId: user._id } },
                {
                    $group: {
                        _id: null,
                        totalBudgets: { $sum: 1 },
                        totalBudgetAmount: { $sum: '$limitAmount' }
                    }
                }
            ]);

            const summary = {
                transactions: transactionSummary[0] || { totalTransactions: 0, totalIncome: 0, totalExpense: 0 },
                budgets: budgetSummary[0] || { totalBudgets: 0, totalBudgetAmount: 0 }
            };

            logger.info(`Admin fetched user details for: ${userid}`);

            res.status(200).json({
                message: 'User details retrieved successfully',
                user,
                summary
            });

        } catch (error) {
            logger.error('Error fetching user by ID:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Update user (admin can update any user)
    updateUser: async (req, res) => {
        try {
            const { userid } = req.params;
            const { firstName, lastName, email, role } = req.body;

            if (!userid) {
                return res.status(400).json({ error: 'User ID is required' });
            }

            // Check if user exists
            const user = await User.findById(userid);
            if (!user) {
                logger.error('User not found:', userid);
                return res.status(404).json({ error: 'User not found' });
            }

            // Check if email is being updated and if it already exists
            if (email && email !== user.email) {
                const existingUser = await User.findOne({ email, _id: { $ne: userid } });
                if (existingUser) {
                    return res.status(400).json({ error: 'Email already exists' });
                }
            }

            // Update user fields
            if (firstName) user.firstName = firstName;
            if (lastName) user.lastName = lastName;
            if (email) user.email = email;
            if (role) user.role = role;

            await user.save();

            logger.info(`Admin updated user: ${userid}`);

            res.status(200).json({
                message: 'User updated successfully',
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role
                }
            });

        } catch (error) {
            logger.error('Error updating user:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Delete user (admin only)
    deleteUser: async (req, res) => {
        try {
            const { userid } = req.params;

            if (!userid) {
                return res.status(400).json({ error: 'User ID is required' });
            }

            // Check if user exists
            const user = await User.findById(userid);
            if (!user) {
                logger.error('User not found:', userid);
                return res.status(404).json({ error: 'User not found' });
            }

            // Delete user's transactions and budgets
            await Transaction.deleteMany({ userId: userid });
            await Budget.deleteMany({ userId: userid });

            // Delete user
            await User.findByIdAndDelete(userid);

            logger.info(`Admin deleted user and associated data: ${userid}`);

            res.status(200).json({
                message: 'User and associated data deleted successfully'
            });

        } catch (error) {
            logger.error('Error deleting user:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Get dashboard statistics
    getDashboardStats: async (req, res) => {
        try {
            // Get total users
            const totalUsers = await User.countDocuments();
            
            // Get users by role
            const usersByRole = await User.aggregate([
                { $group: { _id: '$role', count: { $sum: 1 } } }
            ]);

            // Get total transactions
            const totalTransactions = await Transaction.countDocuments();

            // Get transaction summary
            const transactionSummary = await Transaction.aggregate([
                {
                    $group: {
                        _id: null,
                        totalIncome: {
                            $sum: {
                                $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0]
                            }
                        },
                        totalExpense: {
                            $sum: {
                                $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
                            }
                        }
                    }
                }
            ]);

            // Get total budgets
            const totalBudgets = await Budget.countDocuments();

            // Get budget summary
            const budgetSummary = await Budget.aggregate([
                {
                    $group: {
                        _id: null,
                        totalBudgetAmount: { $sum: '$limitAmount' }
                    }
                }
            ]);

            // Get recent users (last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const recentUsers = await User.countDocuments({
                createdAt: { $gte: thirtyDaysAgo }
            });

            // Get monthly transaction trends (last 6 months)
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            
            const monthlyTransactions = await Transaction.aggregate([
                { $match: { createdAt: { $gte: sixMonthsAgo } } },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' }
                        },
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$amount' }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]);

            const stats = {
                users: {
                    total: totalUsers,
                    byRole: usersByRole.reduce((acc, role) => {
                        acc[role._id] = role.count;
                        return acc;
                    }, {}),
                    recent: recentUsers
                },
                transactions: {
                    total: totalTransactions,
                    summary: transactionSummary[0] || { totalIncome: 0, totalExpense: 0 },
                    monthlyTrends: monthlyTransactions
                },
                budgets: {
                    total: totalBudgets,
                    totalAmount: budgetSummary[0]?.totalBudgetAmount || 0
                }
            };

            logger.info('Admin fetched dashboard statistics');

            res.status(200).json({
                message: 'Dashboard statistics retrieved successfully',
                stats
            });

        } catch (error) {
            logger.error('Error fetching dashboard stats:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Get user activity logs (recent transactions and budgets)
    getUserActivity: async (req, res) => {
        try {
            const { userid } = req.params;
            const { limit = 10 } = req.query;

            if (!userid) {
                return res.status(400).json({ error: 'User ID is required' });
            }

            // Check if user exists
            const user = await User.findById(userid).select('-password');
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Get recent transactions
            const recentTransactions = await Transaction.find({ userId: userid })
                .sort({ createdAt: -1 })
                .limit(parseInt(limit));

            // Get recent budgets
            const recentBudgets = await Budget.find({ userId: userid })
                .sort({ createdAt: -1 })
                .limit(parseInt(limit));

            logger.info(`Admin fetched activity for user: ${userid}`);

            res.status(200).json({
                message: 'User activity retrieved successfully',
                user,
                activity: {
                    recentTransactions,
                    recentBudgets
                }
            });

        } catch (error) {
            logger.error('Error fetching user activity:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
};