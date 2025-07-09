const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
router.post('/register',(req,res)=>{
    logger.info('Request body:', req.body);
    return res.status(200).json(req.body)
})
module.exports = router;