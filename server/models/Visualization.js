const mongoose = require('mongoose');

const visualizationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Allow anonymous visualizations
    },
    algorithm: {
        type: String,
        required: true,
        enum: ['mergeSort', 'quickSort', 'bubbleSort', 'insertionSort']
    },
    inputArray: {
        type: [Number],
        required: true,
        validate: {
            validator: function(arr) {
                return arr.length > 0 && arr.length <= 20;
            },
            message: 'Array must have 1-20 elements'
        }
    },
    steps: [{
        phase: {
            type: String,
            enum: ['initial', 'split', 'merge', 'transition', 'compare', 'swap']
        },
        action: String,
        arrayState: [Number],
        highlights: [Number],
        leftRange: [Number],
        rightRange: [Number],
        comparing: [Number],
        level: Number,
        range: [Number],
        description: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    metadata: {
        totalSteps: Number,
        splitSteps: Number,
        mergeSteps: Number,
        maxDepth: Number,
        executionTime: Number, // in milliseconds
        complexity: {
            time: String,
            space: String
        }
    },
    settings: {
        viewMode: {
            type: String,
            enum: ['tree', 'linear'],
            default: 'tree'
        },
        speed: {
            type: Number,
            default: 1000
        },
        showComparisons: {
            type: Boolean,
            default: true
        }
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    tags: [String],
    likes: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for better query performance
visualizationSchema.index({ algorithm: 1, createdAt: -1 });
visualizationSchema.index({ userId: 1, createdAt: -1 });
visualizationSchema.index({ isPublic: 1, likes: -1 });

module.exports = mongoose.model('Visualization', visualizationSchema);
