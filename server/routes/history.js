const express = require('express');
const router = express.Router();
const SortHistory = require('../models/SortHistory');
const User = require('../models/User');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// POST /api/history - Save sort execution to history
router.post('/', authenticateToken, async (req, res) => {
    try {
        const {
            algorithm,
            inputArray,
            executionTime,
            totalSteps,
            metadata,
            settings,
            completed,
            timeSpent,
            notes
        } = req.body;

        // Validation
        if (!algorithm || !inputArray || !Array.isArray(inputArray)) {
            return res.status(400).json({
                success: false,
                message: 'Algorithm and input array are required'
            });
        }

        if (inputArray.length === 0 || inputArray.length > 20) {
            return res.status(400).json({
                success: false,
                message: 'Array must have between 1 and 20 elements'
            });
        }

        // Create history entry
        const historyEntry = new SortHistory({
            user: req.user._id,
            algorithm,
            inputArray,
            arraySize: inputArray.length,
            executionTime: executionTime || 0,
            totalSteps: totalSteps || 0,
            metadata: metadata || {},
            settings: settings || {},
            completed: completed || false,
            timeSpent: timeSpent || 0,
            notes: notes || ''
        });

        await historyEntry.save();

        // Update user statistics
        await User.findByIdAndUpdate(req.user._id, {
            $inc: {
                'statistics.totalVisualizations': 1,
                'statistics.timeSpent': Math.round((timeSpent || 0) / 60) // convert to minutes
            },
            $set: {
                'statistics.favoriteAlgorithm': algorithm // Simple approach - last used
            }
        });

        res.status(201).json({
            success: true,
            message: 'Sort history saved successfully',
            data: {
                historyId: historyEntry._id,
                entry: historyEntry
            }
        });

    } catch (error) {
        console.error('Save history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save sort history',
            error: error.message
        });
    }
});

// GET /api/history - Get user's sort history
router.get('/', authenticateToken, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            algorithm,
            sortBy = 'createdAt',
            order = 'desc',
            favorites = false
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build query
        const query = { user: req.user._id };
        if (algorithm) {
            query.algorithm = algorithm;
        }
        if (favorites === 'true') {
            query.isFavorite = true;
        }

        // Build sort object
        const sortObj = {};
        sortObj[sortBy] = order === 'desc' ? -1 : 1;

        // Get history with pagination
        const history = await SortHistory.find(query)
            .sort(sortObj)
            .skip(skip)
            .limit(limitNum)
            .lean();

        // Get total count for pagination
        const totalCount = await SortHistory.countDocuments(query);
        const totalPages = Math.ceil(totalCount / limitNum);

        res.json({
            success: true,
            data: {
                history,
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalCount,
                    hasNext: pageNum < totalPages,
                    hasPrev: pageNum > 1
                }
            }
        });

    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get sort history'
        });
    }
});

// GET /api/history/favorites - Get user's favorite sorts
router.get('/favorites', authenticateToken, async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const favorites = await SortHistory.getUserFavorites(req.user._id, parseInt(limit));

        res.json({
            success: true,
            data: {
                favorites,
                count: favorites.length
            }
        });

    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get favorite sorts'
        });
    }
});

// GET /api/history/stats - Get user's sorting statistics
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const stats = await SortHistory.getUserStats(req.user._id);

        res.json({
            success: true,
            data: {
                statistics: stats
            }
        });

    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get sorting statistics'
        });
    }
});

// GET /api/history/:id - Get specific sort history entry
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const historyEntry = await SortHistory.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!historyEntry) {
            return res.status(404).json({
                success: false,
                message: 'History entry not found'
            });
        }

        res.json({
            success: true,
            data: {
                entry: historyEntry
            }
        });

    } catch (error) {
        console.error('Get history entry error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get history entry'
        });
    }
});

// PUT /api/history/:id - Update sort history entry (notes, completion status, favorites)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { completed, timeSpent, notes, isFavorite } = req.body;

        const updateData = {};
        if (completed !== undefined) updateData.completed = completed;
        if (timeSpent !== undefined) updateData.timeSpent = timeSpent;
        if (notes !== undefined) updateData.notes = notes;
        if (isFavorite !== undefined) {
            updateData.isFavorite = isFavorite;
            if (isFavorite) {
                updateData.favoriteAddedAt = new Date();
            } else {
                updateData.favoriteAddedAt = null;
            }
        }

        const historyEntry = await SortHistory.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            updateData,
            { new: true, runValidators: true }
        );

        if (!historyEntry) {
            return res.status(404).json({
                success: false,
                message: 'History entry not found'
            });
        }

        res.json({
            success: true,
            message: 'History entry updated successfully',
            data: {
                entry: historyEntry
            }
        });

    } catch (error) {
        console.error('Update history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update history entry'
        });
    }
});

// DELETE /api/history/:id - Delete sort history entry
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const historyEntry = await SortHistory.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!historyEntry) {
            return res.status(404).json({
                success: false,
                message: 'History entry not found'
            });
        }

        res.json({
            success: true,
            message: 'History entry deleted successfully'
        });

    } catch (error) {
        console.error('Delete history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete history entry'
        });
    }
});

// DELETE /api/history - Clear all user's sort history
router.delete('/', authenticateToken, async (req, res) => {
    try {
        const result = await SortHistory.deleteMany({ user: req.user._id });

        res.json({
            success: true,
            message: `Deleted ${result.deletedCount} history entries`,
            data: {
                deletedCount: result.deletedCount
            }
        });

    } catch (error) {
        console.error('Clear history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear history'
        });
    }
});

module.exports = router;
