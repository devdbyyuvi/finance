const User = require('../models/userSchema');
const bcrypt = require('bcrypt');
require('dotenv').config();
const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');

module.exports = {
    createUser: async (req, res) => {
        try {
            const {
                firstName,
                lastName,
                email,
                password,
                password1
            } = req.body;
            logger.info('Creating user with data:', req.body);
            if (!firstName || !lastName || !email || !password || !password1) {
                return res.status(400).json({ error: 'All fields are required' });
            }
            if (password !== password1) {
                return res.status(400).json({ error: 'Passwords do not match' });
            }
            if (password.length < 6) {
                return res.status(400).json({ error: 'Password must be at least 6 characters long' });
            }
            User.findOne({ email }, async (err, existingUser) => {
                if (err) {
                    logger.error('Error checking for existing user:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                }
                if (existingUser) {
                    logger.error('User already exists:', email);
                    return res.status(400).json({ error: 'User already exists' });
                }
                else {
                    const salt = await bcrypt.genSalt(10);
                    const hashPwd = await bcrypt.hash(password, salt);
                    const newUser = new User({
                        firstName,
                        lastName,
                        email,
                        password: hashPwd
                    });
                    await newUser.save();
                    if (!process.env.JWT_SECRET) {
                        logger.error('JWT_SECRET is not defined in environment variables');
                        return res.status(500).json({ error: 'Internal server error' });
                    }
                    const token = jwt.sign({
                        id: newUser._id,
                    }, process.env.JWT_SECRET);
                    res.cookie('token', token, {
                        httpOnly: true,
                        sameSite: 'strict',
                    })
                    logger.info('User created successfully:', newUser);
                    return res.status(201).json({
                        message: 'User created successfully',
                        user: {
                            id: newUser._id,
                            firstName: newUser.firstName,
                            lastName: newUser.lastName,
                            email: newUser.email,
                            role: newUser.role,
                            token
                        }
                    });

                }
            })
        }
        catch (error) {
            logger.error('Error creating user:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
    loginUser: async (req, res) => {
        try {
            const {
                email,
                password
            } = req.body;
            logger.info('Logging in user with email:', email);
            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }
            User.findOne({ email }, async (err, user) => {
                if (err) {
                    logger.error('Error finding user:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                }
                if (!process.env.JWT_SECRET) {
                    logger.error('JWT_SECRET is not defined in environment variables');
                    return res.status(500).json({ error: 'Internal server error' });
                }
                if (!user) {
                    logger.error('User not found:', email);
                    return res.status(404).json({ error: 'User not found' });
                }
                else{
                    const isMatch = await bcrypt.compare(password, user.password);
                    if (!isMatch) {
                        logger.error('Invalid password for user:', email);
                        return res.status(400).json({ error: 'Invalid password' });
                    }
                    const token = jwt.sign({
                        id: user._id,
                    }, process.env.JWT_SECRET);
                    res.cookie('token', token, {
                        httpOnly: true,
                        sameSite: 'strict',
                    });
                    logger.info('User logged in successfully:', user);
                    return res.status(200).json({
                        message: 'User logged in successfully',
                        user: {
                            id: user._id,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            email: user.email,
                            role: user.role,
                            token
                        }
                    });
                }
            })
        }
        catch (error) {
            logger.error('Error logging in user:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
    logOut: async(req,res)=>{
        try{
            logger.info('Logging out user');
            res.clearCookie('token', {
                httpOnly: true,
                sameSite: 'strict',
            });
            logger.info('User logged out successfully');
            return res.status(200).json({ message: 'User logged out successfully' });
        }
        catch (error){
            logger.error('Error logging out user:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
    getUser : (req,res)=>{
        try{
            const userId = req.params.userid;
            logger.info(`Fetching user with ID: ${userId}`);
            User.findById(userId, (err,user)=>{
                if(err){
                    logger.error('Error fetching user:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                }
                if(!user){
                    logger.error('User not found:', userId);
                    return res.status(404).json({ error: 'User not found' });
                }
                else{
                    logger.info('User fetched successfully:', user);
                    return res.status(200).json({
                        id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        role: user.role
                    });
                }
            })
        }
        catch (error) {
            logger.error('Error fetching user:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
    updateUser: async (req,res)=>{
        try{
            const userId = req.params.userid;
            await User.findOne({ _id: userId }, async (err, user) => {
                if(err){
                   logger.error("Error fetching user : ", err);
                   return res.status(400).json({
                    error: "Error finding user/internal server error"
                   }) 
                }
                if (user){
                    logger.info(`Updating user with ID: ${userId}`);
                    const { firstName, lastName, email, role } = req.body;
                    if (firstName) user.firstName = firstName;
                    if (lastName) user.lastName = lastName;
                    if (email) user.email = email;
                    if (role) user.role = role;

                    await user.save();
                    logger.info('User updated successfully:', user);
                    return res.status(200).json({
                        message: 'User updated successfully',
                        user: {
                            id: user._id,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            email: user.email,
                            role: user.role
                        }
                    });
                }
            });
        }
        catch(err){
            logger.error('Error updating user:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}