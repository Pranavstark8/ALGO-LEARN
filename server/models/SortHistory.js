const mongoose = require('mongoose');

const sortHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    algorithm: {
        type: String,
        required: true,
        enum: ['mergeSort', 'quickSort', 'bubbleSort', 'insertionSort', 'selectionSort']
    },
    inputArray: {
        type: [Number],
        required: true,
        validate: {
            validator: function(arr) {
                return arr.length > 0 && arr.length <= 20;
            },
            message: 'Array must have between 1 and 20 elements'
        }
    },
    arraySize: {
        type: Number,
        required: true
    },
    executionTime: {
        type: Number, // in milliseconds
        required: true
    },
    totalSteps: {
        type: Number,
        required: true
    },
    metadata: {
        splitSteps: Number,
        mergeSteps: Number,
        partitionSteps: Number,
        recursionSteps: Number,
        comparisons: Number,
        swaps: Number,
        maxDepth: Number,
        complexity: {
            time: {
                bigO: String,
                explanation: String,
                actualCase: String
            },
            space: {
                bigO: String,
                explanation: String
            },
            performance: {
                bestCase: String,
                averageCase: String,
                worstCase: String,
                stable: Boolean,
                inPlace: Boolean,
                adaptive: Boolean
            }
        }
    },
    settings: {
        viewMode: {
            type: String,
            enum: ['tree', 'linear'],
            default: 'linear'
        },
        speed: {
            type: Number,
            default: 1000,
            min: 200,
            max: 3000
        }
    },
    completed: {
        type: Boolean,
        default: false
    },
    timeSpent: {
        type: Number, // in seconds
        default: 0
    },
    notes: {
        type: String,
        maxlength: 500
    },
    isFavorite: {
        type: Boolean,
        default: false
    },
    favoriteAddedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for efficient queries
sortHistorySchema.index({ user: 1, createdAt: -1 });
sortHistorySchema.index({ user: 1, algorithm: 1 });
sortHistorySchema.index({ user: 1, arraySize: 1 });
sortHistorySchema.index({ user: 1, isFavorite: 1, favoriteAddedAt: -1 });

// Virtual for formatted execution time
sortHistorySchema.virtual('formattedExecutionTime').get(function() {
    if (this.executionTime < 1000) {
        return `${this.executionTime}ms`;
    } else {
        return `${(this.executionTime / 1000).toFixed(2)}s`;
    }
});

// Virtual for performance rating
sortHistorySchema.virtual('performanceRating').get(function() {
    const n = this.arraySize;
    const actualSteps = this.totalSteps;
    
    // Rough performance estimation based on algorithm
    let expectedSteps;
    switch (this.algorithm) {
        case 'mergeSort':
            expectedSteps = n * Math.log2(n);
            break;
        case 'quickSort':
            expectedSteps = n * Math.log2(n); // average case
            break;
        default:
            expectedSteps = n * n; // O(n²) algorithms
    }
    
    const ratio = actualSteps / expectedSteps;
    if (ratio <= 1.2) return 'Excellent';
    if (ratio <= 1.5) return 'Good';
    if (ratio <= 2.0) return 'Average';
    return 'Poor';
});

// Static method to get user statistics
sortHistorySchema.statics.getUserStats = async function(userId) {
    const stats = await this.aggregate([
        { $match: { user: mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: null,
                totalSorts: { $sum: 1 },
                totalTimeSpent: { $sum: '$timeSpent' },
                averageArraySize: { $avg: '$arraySize' },
                averageExecutionTime: { $avg: '$executionTime' },
                algorithmCounts: {
                    $push: '$algorithm'
                },
                completedSorts: {
                    $sum: { $cond: ['$completed', 1, 0] }
                }
            }
        },
        {
            $project: {
                totalSorts: 1,
                totalTimeSpent: 1,
                averageArraySize: { $round: ['$averageArraySize', 1] },
                averageExecutionTime: { $round: ['$averageExecutionTime', 2] },
                completedSorts: 1,
                completionRate: {
                    $round: [
                        { $multiply: [{ $divide: ['$completedSorts', '$totalSorts'] }, 100] },
                        1
                    ]
                }
            }
        }
    ]);

    // Count algorithm usage
    const algorithmStats = await this.aggregate([
        { $match: { user: mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: '$algorithm',
                count: { $sum: 1 },
                avgExecutionTime: { $avg: '$executionTime' },
                avgArraySize: { $avg: '$arraySize' }
            }
        },
        { $sort: { count: -1 } }
    ]);

    return {
        overall: stats[0] || {
            totalSorts: 0,
            totalTimeSpent: 0,
            averageArraySize: 0,
            averageExecutionTime: 0,
            completedSorts: 0,
            completionRate: 0
        },
        byAlgorithm: algorithmStats
    };
};

// Static method to get user's favorite sorts
sortHistorySchema.statics.getUserFavorites = async function(userId, limit = 10) {
    return await this.find({
        user: mongoose.Types.ObjectId(userId),
        isFavorite: true
    })
    .sort({ favoriteAddedAt: -1 })
    .limit(limit)
    .lean();
};

module.exports = mongoose.model('SortHistory', sortHistorySchema);
