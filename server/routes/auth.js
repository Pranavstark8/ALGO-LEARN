const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/User');
const { generateToken, authenticateToken } = require('../middleware/auth');

// POST /api/auth/register - Register new user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, firstName, lastName } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username, email, and password are required'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or username already exists'
            });
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user
        const user = new User({
            username,
            email,
            password: hashedPassword,
            profile: {
                firstName: firstName || '',
                lastName: lastName || ''
            }
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id);

        // Return user data (without password)
        const userResponse = {
            id: user._id,
            username: user.username,
            email: user.email,
            profile: user.profile,
            preferences: user.preferences,
            statistics: user.statistics,
            createdAt: user.createdAt
        };

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: userResponse,
                token
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
});

// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        // Return user data (without password)
        const userResponse = {
            id: user._id,
            username: user.username,
            email: user.email,
            profile: user.profile,
            preferences: user.preferences,
            statistics: user.statistics,
            createdAt: user.createdAt
        };

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: userResponse,
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
});

// GET /api/auth/me - Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const userResponse = {
            id: req.user._id,
            username: req.user.username,
            email: req.user.email,
            profile: req.user.profile,
            preferences: req.user.preferences,
            statistics: req.user.statistics,
            createdAt: req.user.createdAt
        };

        res.json({
            success: true,
            data: {
                user: userResponse
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user profile'
        });
    }
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { firstName, lastName, bio, preferences } = req.body;
        
        const updateData = {};
        
        if (firstName !== undefined) updateData['profile.firstName'] = firstName;
        if (lastName !== undefined) updateData['profile.lastName'] = lastName;
        if (bio !== undefined) updateData['profile.bio'] = bio;
        
        if (preferences) {
            if (preferences.theme) updateData['preferences.theme'] = preferences.theme;
            if (preferences.animationSpeed) updateData['preferences.animationSpeed'] = preferences.animationSpeed;
            if (preferences.defaultView) updateData['preferences.defaultView'] = preferences.defaultView;
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        const userResponse = {
            id: user._id,
            username: user.username,
            email: user.email,
            profile: user.profile,
            preferences: user.preferences,
            statistics: user.statistics,
            createdAt: user.createdAt
        };

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: userResponse
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
});

// POST /api/auth/logout - Logout user (client-side token removal)
router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Logout successful. Please remove the token from client storage.'
    });
});

module.exports = router;
