const Budget = require('../models/budgetSchema');
const logger = require('../utils/logger');

module.exports = {
    createBudget : async (req,res)=>{
        try{
            const {
                category,
                limitAmount,
                month,
                year,
                userId
            } = req.body;
            
        }
        catch(err){
            logger.error('Internal server error', err);
            return res.status(400).json({
                msg: 'Internal Server Error'
            })
        }
    },
    deleteBudget : async (req,res)=>{},
    getBudget : async (req,res)=>{},
    updateBudget : async (req,res)=>{},
    getAllBudgets : async (req,res)=>{},
    getUserBudgets : async (req,res)=>{},
}