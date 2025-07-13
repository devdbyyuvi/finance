const jwt = require('jsonwebtoken');
const User = require('../models/userSchema');
const logger = require('../utils/logger');
const authMiddleware = async (req, res, next) => {
    try{
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        req.user = user;
        next();
    }
    catch (error) {
        logger.error('Authentication error:', error);
        return res.status(401).json({ message: 'Unauthorized' });
    }
}
const adminMiddleware = async(req,res,next)=>{
    try{
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        if (user.role != 'admin'){
            return res.status(401).json({
                message: 'User is not admin'
            })
        }
        req.user = user;
        next();
    }
    catch(err){
        
        logger.error('Authentication error:', error);
        return res.status(401).json({ message: 'Unauthorized' });
    }
}
module.exports = {authMiddleware, adminMiddleware};