const express = require('express');
const router = express.Router();
const AlgorithmService = require('../services/algorithmService');
const Visualization = require('../models/Visualization');

// GET /api/algorithms - Get list of available algorithms
router.get('/', (req, res) => {
    try {
        const algorithms = [
            {
                id: 'mergeSort',
                name: 'Merge Sort',
                description: 'Divide and conquer sorting algorithm',
                implemented: true,
                complexity: {
                    time: 'O(n log n)',
                    space: 'O(n)'
                }
            },
            {
                id: 'quickSort',
                name: 'Quick Sort',
                description: 'Partition-based sorting algorithm',
                implemented: true,
                complexity: {
                    time: 'O(n log n) avg, O(n²) worst',
                    space: 'O(log n)'
                }
            }
        ];

        res.json({
            success: true,
            data: algorithms,
            count: algorithms.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching algorithms',
            error: error.message
        });
    }
});

// GET /api/algorithms/:algorithmId - Get specific algorithm info
router.get('/:algorithmId', (req, res) => {
    try {
        const { algorithmId } = req.params;
        const algorithmInfo = AlgorithmService.getAlgorithmInfo(algorithmId);

        if (!algorithmInfo) {
            return res.status(404).json({
                success: false,
                message: 'Algorithm not found'
            });
        }

        res.json({
            success: true,
            data: algorithmInfo
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching algorithm info',
            error: error.message
        });
    }
});

// POST /api/algorithms/execute - Execute algorithm and return steps
router.post('/execute', async (req, res) => {
    try {
        const { algorithm, array, userId, settings } = req.body;

        // Validate input
        if (!algorithm || !array || !Array.isArray(array)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid input. Algorithm and array are required.'
            });
        }

        if (array.length === 0 || array.length > 20) {
            return res.status(400).json({
                success: false,
                message: 'Array must have 1-20 elements'
            });
        }

        // Validate array elements are numbers
        if (!array.every(item => typeof item === 'number' && !isNaN(item))) {
            return res.status(400).json({
                success: false,
                message: 'Array must contain only valid numbers'
            });
        }

        let result;
        
        // Execute the algorithm
        switch (algorithm) {
            case 'mergeSort':
                result = AlgorithmService.mergeSort([...array]);
                break;
            case 'quickSort':
                result = AlgorithmService.quickSort([...array]);
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Unsupported algorithm'
                });
        }

        // Save visualization to database
        const visualization = new Visualization({
            userId: userId || null,
            algorithm,
            inputArray: array,
            steps: result.steps,
            metadata: result.metadata,
            settings: settings || {},
            isPublic: false
        });

        const savedVisualization = await visualization.save();

        res.json({
            success: true,
            data: {
                visualizationId: savedVisualization._id,
                steps: result.steps,
                metadata: result.metadata,
                inputArray: array,
                algorithm
            }
        });

    } catch (error) {
        console.error('Algorithm execution error:', error);
        res.status(500).json({
            success: false,
            message: 'Error executing algorithm',
            error: error.message
        });
    }
});

// POST /api/algorithms/validate - Validate array input
router.post('/validate', (req, res) => {
    try {
        const { array } = req.body;

        if (!Array.isArray(array)) {
            return res.status(400).json({
                success: false,
                message: 'Input must be an array'
            });
        }

        const errors = [];
        
        if (array.length === 0) {
            errors.push('Array cannot be empty');
        }
        
        if (array.length > 20) {
            errors.push('Array cannot have more than 20 elements');
        }

        const invalidElements = array.filter(item => typeof item !== 'number' || isNaN(item));
        if (invalidElements.length > 0) {
            errors.push('Array must contain only valid numbers');
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        res.json({
            success: true,
            message: 'Array is valid',
            data: {
                length: array.length,
                min: Math.min(...array),
                max: Math.max(...array),
                sorted: array.slice().sort((a, b) => a - b)
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error validating array',
            error: error.message
        });
    }
});

module.exports = router;
