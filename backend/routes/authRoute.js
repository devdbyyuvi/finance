const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const authController = require('../controllers/auth');
const authMiddleware = require('../middleware/auth');
router.post('/register', authController.createUser);
router.post('/login', authController.loginUser);
router.post('/logout', authController.logOut);
router.get('/user/:userid', authMiddleware, authController.getUser)
router.put('/user/:userid', authMiddleware,authController.updateUser)
module.exports = router;