const Transaction = require('../models/transactionSchema');
const logger = require('../utils/logger');
module.exports = {
    createTransaction : async (req,res)=>{
        try{
            const {
                type,
                amount,
                category,
                note,
                userid
            } = req.body;
        }
        catch(err){
            logger.error('Internal Server error', err);
            res.status(400).json({
                msg : 'Internal server error'
            })
        }
    },
    deleteTransaction : async (req,res)=>{},
    getTransaction : async (req,res)=>{},
    updateTransaction : async (req,res)=>{},
    getAllTransactions : async (req,res)=>{},
    getUserTransactions : async (req,res)=>{},
}