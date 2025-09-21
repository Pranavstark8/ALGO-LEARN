const express = require('express');
const router = express.Router();
const Visualization = require('../models/Visualization');

// GET /api/visualizations/stats/summary - Get visualization statistics (MUST BE BEFORE /:id route)
router.get('/stats/summary', async (req, res) => {
    try {
        const stats = await Visualization.aggregate([
            {
                $group: {
                    _id: '$algorithm',
                    count: { $sum: 1 },
                    avgSteps: { $avg: '$metadata.totalSteps' },
                    avgExecutionTime: { $avg: '$metadata.executionTime' },
                    totalViews: { $sum: '$views' },
                    totalLikes: { $sum: '$likes' }
                }
            }
        ]);

        const totalVisualizations = await Visualization.countDocuments();
        const publicVisualizations = await Visualization.countDocuments({ isPublic: true });

        res.json({
            success: true,
            data: {
                totalVisualizations,
                publicVisualizations,
                algorithmStats: stats
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics',
            error: error.message
        });
    }
});

// GET /api/visualizations/user/:userId - Get user's visualizations (MUST BE BEFORE /:id route)
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const visualizations = await Visualization.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-steps');

        const total = await Visualization.countDocuments({ userId });

        res.json({
            success: true,
            data: visualizations,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching user visualizations',
            error: error.message
        });
    }
});

// GET /api/visualizations - Get all visualizations (with pagination)
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const algorithm = req.query.algorithm;
        const isPublic = req.query.public === 'true';

        // Build query
        let query = {};
        if (algorithm) query.algorithm = algorithm;
        if (isPublic) query.isPublic = true;

        const visualizations = await Visualization.find(query)
            .populate('userId', 'username profile.firstName profile.lastName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-steps'); // Exclude steps for performance

        const total = await Visualization.countDocuments(query);

        res.json({
            success: true,
            data: visualizations,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching visualizations',
            error: error.message
        });
    }
});

// GET /api/visualizations/:id - Get specific visualization
router.get('/:id', async (req, res) => {
    try {
        const visualization = await Visualization.findById(req.params.id)
            .populate('userId', 'username profile.firstName profile.lastName');

        if (!visualization) {
            return res.status(404).json({
                success: false,
                message: 'Visualization not found'
            });
        }

        // Increment view count
        visualization.views += 1;
        await visualization.save();

        res.json({
            success: true,
            data: visualization
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching visualization',
            error: error.message
        });
    }
});

// PUT /api/visualizations/:id - Update visualization
router.put('/:id', async (req, res) => {
    try {
        const { isPublic, tags, settings } = req.body;
        
        const visualization = await Visualization.findById(req.params.id);
        
        if (!visualization) {
            return res.status(404).json({
                success: false,
                message: 'Visualization not found'
            });
        }

        // Update fields
        if (typeof isPublic === 'boolean') visualization.isPublic = isPublic;
        if (tags && Array.isArray(tags)) visualization.tags = tags;
        if (settings) visualization.settings = { ...visualization.settings, ...settings };

        await visualization.save();

        res.json({
            success: true,
            data: visualization,
            message: 'Visualization updated successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating visualization',
            error: error.message
        });
    }
});

// DELETE /api/visualizations/:id - Delete visualization
router.delete('/:id', async (req, res) => {
    try {
        const visualization = await Visualization.findById(req.params.id);
        
        if (!visualization) {
            return res.status(404).json({
                success: false,
                message: 'Visualization not found'
            });
        }

        await Visualization.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Visualization deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting visualization',
            error: error.message
        });
    }
});

// POST /api/visualizations/:id/like - Like/unlike visualization
router.post('/:id/like', async (req, res) => {
    try {
        const visualization = await Visualization.findById(req.params.id);
        
        if (!visualization) {
            return res.status(404).json({
                success: false,
                message: 'Visualization not found'
            });
        }

        visualization.likes += 1;
        await visualization.save();

        res.json({
            success: true,
            data: {
                likes: visualization.likes
            },
            message: 'Visualization liked successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error liking visualization',
            error: error.message
        });
    }
});

module.exports = router;
