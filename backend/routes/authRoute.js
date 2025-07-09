const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
router.post('/register',(req,res)=>{
    logger.info('Request body:', req.body);
    return res.status(200).json(req.body)
})
router.post('/login',(req,res)=>{
    logger.info('Request body:', req.body);
    return res.status(200).json(req.body)
})
router.post('/logout',(req,res)=>{
    logger.info('Request body:', req.body);
    return res.status(200).json(req.body)
})
router.get('/user/:userid',(req,res)=>{
    const userId = req.params.userid;
    logger.info(`Fetching user with ID: ${userId}`);
    return res.status(200).json({ message: `User details for ID: ${userId}` });
})
router.put('/user/:userid',(req,res)=>{
    const userId = req.params.userid;
    logger.info(`Updating user with ID: ${userId}`);
    return res.status(200).json({ message: `User with ID: ${userId} updated successfully` });
})
module.exports = router;