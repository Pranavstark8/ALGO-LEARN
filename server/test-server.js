const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { optionalAuth } = require('./middleware/auth');
const SortHistory = require('./models/SortHistory');

const app = express();
const PORT = process.env.PORT || 5001;

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/algolearn';
mongoose.connect(MONGODB_URI)
    .then(() => console.log('📊 Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Routes
const authRoutes = require('./routes/auth');
const historyRoutes = require('./routes/history');

app.use('/api/auth', authRoutes);
app.use('/api/history', historyRoutes);

// Basic route
app.get('/', (req, res) => {
    res.json({
        message: 'AlgoLearn Test Server',
        status: 'running'
    });
});

// Test algorithm execution with optional authentication and history saving
app.post('/api/algorithms/execute', optionalAuth, async (req, res) => {
    try {
        const { algorithm, array } = req.body;

        if (!algorithm || !array || !Array.isArray(array)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid input. Algorithm and array are required.'
            });
        }

        // Use actual merge sort algorithm
        function mergeSort(array) {
            let steps = [];
            let splitSteps = [];
            let mergeSteps = [];

            // Phase 1: Collect all split operations
            function collectSplits(arr, startIndex, level = 0) {
                if (arr.length <= 1) {
                    return {
                        array: arr,
                        startIndex: startIndex,
                        level: level,
                        isLeaf: true
                    };
                }

                let mid = Math.floor(arr.length / 2);
                let leftArray = arr.slice(0, mid);
                let rightArray = arr.slice(mid);

                // Record this split
                splitSteps.push({
                    phase: "split",
                    action: "split",
                    arrayState: [...array],
                    highlights: [startIndex, startIndex + arr.length - 1],
                    leftRange: [startIndex, startIndex + mid - 1],
                    rightRange: [startIndex + mid, startIndex + arr.length - 1],
                    level: level,
                    description: `Splitting array at position ${startIndex} into subarrays of size ${leftArray.length} and ${rightArray.length}`
                });

                let leftNode = collectSplits(leftArray, startIndex, level + 1);
                let rightNode = collectSplits(rightArray, startIndex + mid, level + 1);

                return {
                    array: arr,
                    startIndex: startIndex,
                    level: level,
                    left: leftNode,
                    right: rightNode,
                    isLeaf: false
                };
            }

            // Phase 2: Perform merges and collect merge operations
            function performMerge(leftArr, rightArr, startIndex, level) {
                let result = [];
                let i = 0, j = 0;
                let tempArray = [...array];

                // Record the start of merge operation
                mergeSteps.push({
                    phase: "merge",
                    action: "merge_start",
                    arrayState: [...tempArray],
                    highlights: [startIndex, startIndex + leftArr.length + rightArr.length - 1],
                    leftRange: [startIndex, startIndex + leftArr.length - 1],
                    rightRange: [startIndex + leftArr.length, startIndex + leftArr.length + rightArr.length - 1],
                    level: level,
                    range: [startIndex, startIndex + leftArr.length + rightArr.length - 1],
                    description: `Starting to merge subarrays: [${leftArr.join(', ')}] and [${rightArr.join(', ')}]`
                });

                while (i < leftArr.length && j < rightArr.length) {
                    // Record comparison
                    mergeSteps.push({
                        phase: "merge",
                        action: "compare",
                        arrayState: [...tempArray],
                        highlights: [startIndex + result.length],
                        comparing: [leftArr[i], rightArr[j]],
                        level: level,
                        range: [startIndex, startIndex + leftArr.length + rightArr.length - 1],
                        description: `Comparing ${leftArr[i]} and ${rightArr[j]}`
                    });

                    if (leftArr[i] <= rightArr[j]) {
                        result.push(leftArr[i]);
                        tempArray[startIndex + result.length - 1] = leftArr[i];
                        i++;
                    } else {
                        result.push(rightArr[j]);
                        tempArray[startIndex + result.length - 1] = rightArr[j];
                        j++;
                    }

                    // Record placement
                    mergeSteps.push({
                        phase: "merge",
                        action: "place",
                        arrayState: [...tempArray],
                        highlights: [startIndex + result.length - 1],
                        level: level,
                        range: [startIndex, startIndex + leftArr.length + rightArr.length - 1],
                        description: `Placed ${result[result.length - 1]} at position ${startIndex + result.length - 1}`
                    });
                }

                // Add remaining elements
                while (i < leftArr.length) {
                    result.push(leftArr[i]);
                    tempArray[startIndex + result.length - 1] = leftArr[i];
                    mergeSteps.push({
                        phase: "merge",
                        action: "place",
                        arrayState: [...tempArray],
                        highlights: [startIndex + result.length - 1],
                        level: level,
                        range: [startIndex, startIndex + leftArr.length + rightArr.length - 1],
                        description: `Added remaining element ${leftArr[i]}`
                    });
                    i++;
                }

                while (j < rightArr.length) {
                    result.push(rightArr[j]);
                    tempArray[startIndex + result.length - 1] = rightArr[j];
                    mergeSteps.push({
                        phase: "merge",
                        action: "place",
                        arrayState: [...tempArray],
                        highlights: [startIndex + result.length - 1],
                        level: level,
                        range: [startIndex, startIndex + leftArr.length + rightArr.length - 1],
                        description: `Added remaining element ${rightArr[j]}`
                    });
                    j++;
                }

                // Update the main array
                for (let k = 0; k < result.length; k++) {
                    array[startIndex + k] = result[k];
                }

                // Record completion of merge
                mergeSteps.push({
                    phase: "merge",
                    action: "merge_complete",
                    arrayState: [...array],
                    highlights: [startIndex, startIndex + result.length - 1],
                    level: level,
                    range: [startIndex, startIndex + result.length - 1],
                    description: `Completed merging into: [${result.join(', ')}]`
                });

                return result;
            }

            function executeMergeSort(node) {
                if (node.isLeaf) {
                    return node.array;
                }

                let leftResult = executeMergeSort(node.left);
                let rightResult = executeMergeSort(node.right);

                return performMerge(leftResult, rightResult, node.startIndex, node.level);
            }

            // Execute the algorithm
            let tree = collectSplits(array, 0);

            // Add initial state
            steps.push({
                phase: "initial",
                action: "initial",
                arrayState: [...array],
                highlights: [],
                description: `Initial array: [${array.join(', ')}]`
            });

            // Add all split steps
            steps.push(...splitSteps);

            // Add transition step
            steps.push({
                phase: "transition",
                action: "transition",
                arrayState: [...array],
                highlights: [],
                description: "Now merging the sorted subarrays back together..."
            });

            // Execute merges and add merge steps
            executeMergeSort(tree);
            steps.push(...mergeSteps);

            return steps;
        }

        // Quick Sort Implementation
        function quickSort(array) {
            let steps = [];
            let partitionSteps = [];
            let recursionSteps = [];
            let maxDepth = 0;
            let comparisons = 0;
            let swaps = 0;

            function quickSortRecursive(arr, low, high, level = 0) {
                maxDepth = Math.max(maxDepth, level);

                if (low < high) {
                    recursionSteps.push({
                        phase: "partition",
                        action: "start_partition",
                        arrayState: [...array],
                        highlights: [low, high],
                        range: [low, high],
                        level: level,
                        description: `Starting to partition subarray from index ${low} to ${high}`
                    });

                    let pivotIndex = partition(arr, low, high, level);

                    recursionSteps.push({
                        phase: "partition",
                        action: "pivot_placed",
                        arrayState: [...array],
                        highlights: [pivotIndex],
                        range: [low, high],
                        pivotIndex: pivotIndex,
                        level: level,
                        description: `Pivot ${array[pivotIndex]} placed at correct position ${pivotIndex}`
                    });

                    quickSortRecursive(arr, low, pivotIndex - 1, level + 1);
                    quickSortRecursive(arr, pivotIndex + 1, high, level + 1);
                }
            }

            function partition(arr, low, high, level) {
                let pivot = arr[high];
                let i = low - 1;

                partitionSteps.push({
                    phase: "partition",
                    action: "choose_pivot",
                    arrayState: [...array],
                    highlights: [high],
                    range: [low, high],
                    pivot: pivot,
                    pivotIndex: high,
                    level: level,
                    description: `Choosing pivot: ${pivot} at index ${high}`
                });

                for (let j = low; j < high; j++) {
                    comparisons++;

                    partitionSteps.push({
                        phase: "partition",
                        action: "compare",
                        arrayState: [...array],
                        highlights: [j, high],
                        comparing: [arr[j], pivot],
                        range: [low, high],
                        level: level,
                        description: `Comparing ${arr[j]} with pivot ${pivot}`
                    });

                    if (arr[j] <= pivot) {
                        i++;

                        if (i !== j) {
                            swaps++;
                            partitionSteps.push({
                                phase: "partition",
                                action: "swap",
                                arrayState: [...array],
                                highlights: [i, j],
                                swapping: [arr[i], arr[j]],
                                range: [low, high],
                                level: level,
                                description: `Swapping ${arr[i]} at index ${i} with ${arr[j]} at index ${j}`
                            });

                            [arr[i], arr[j]] = [arr[j], arr[i]];

                            partitionSteps.push({
                                phase: "partition",
                                action: "after_swap",
                                arrayState: [...array],
                                highlights: [i, j],
                                range: [low, high],
                                level: level,
                                description: `Array after swap: [${array.join(', ')}]`
                            });
                        }
                    }
                }

                if (i + 1 !== high) {
                    swaps++;
                    partitionSteps.push({
                        phase: "partition",
                        action: "place_pivot",
                        arrayState: [...array],
                        highlights: [i + 1, high],
                        swapping: [arr[i + 1], arr[high]],
                        range: [low, high],
                        level: level,
                        description: `Placing pivot ${arr[high]} in correct position`
                    });

                    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];

                    partitionSteps.push({
                        phase: "partition",
                        action: "pivot_final",
                        arrayState: [...array],
                        highlights: [i + 1],
                        range: [low, high],
                        pivotIndex: i + 1,
                        level: level,
                        description: `Pivot ${arr[i + 1]} now in final position at index ${i + 1}`
                    });
                }

                return i + 1;
            }

            steps.push({
                phase: "initial",
                action: "initial",
                arrayState: [...array],
                highlights: [],
                description: `Initial array: [${array.join(', ')}]`
            });

            quickSortRecursive(array, 0, array.length - 1);

            // Combine steps in chronological order
            const allSteps = [...recursionSteps, ...partitionSteps];
            steps.push(...allSteps);

            return steps;
        }

        // Execute the appropriate algorithm
        let algorithmSteps;
        if (algorithm === 'mergeSort') {
            algorithmSteps = mergeSort([...array]);
        } else if (algorithm === 'quickSort') {
            algorithmSteps = quickSort([...array]);
        } else {
            return res.status(400).json({
                success: false,
                message: 'Unsupported algorithm'
            });
        }

        const metadata = {
            arraySize: array.length,
            totalSteps: algorithmSteps.length,
            splitSteps: algorithmSteps.filter(s => s.phase === 'split').length,
            mergeSteps: algorithmSteps.filter(s => s.phase === 'merge').length,
            partitionSteps: algorithmSteps.filter(s => s.phase === 'partition').length,
            recursionSteps: algorithmSteps.filter(s => s.action === 'start_partition').length,
            maxDepth: Math.ceil(Math.log2(array.length)),
            comparisons: algorithmSteps.filter(s => s.action === 'compare').length,
            swaps: algorithmSteps.filter(s => s.action === 'swap').length,
            executionTime: 15,
            complexity: {
                time: {
                    bigO: 'O(n log n)',
                    explanation: 'Merge sort always divides the array into halves (log n levels) and merges n elements at each level'
                },
                space: {
                    bigO: 'O(n)',
                    explanation: 'Merge sort requires additional space for merging subarrays and recursion stack'
                }
            }
        };

        // Save to history if user is authenticated
        let historyId = null;
        if (req.user) {
            try {
                const historyEntry = new SortHistory({
                    user: req.user._id,
                    algorithm: algorithm,
                    inputArray: array,
                    arraySize: array.length,
                    executionTime: metadata.executionTime || 0,
                    totalSteps: algorithmSteps.length,
                    metadata: {
                        splitSteps: metadata.splitSteps || 0,
                        mergeSteps: metadata.mergeSteps || 0,
                        partitionSteps: metadata.partitionSteps || 0,
                        recursionSteps: metadata.recursionSteps || 0,
                        comparisons: metadata.comparisons || 0,
                        swaps: metadata.swaps || 0,
                        maxDepth: metadata.maxDepth || 0,
                        complexity: metadata.complexity || {}
                    },
                    settings: req.body.settings || {},
                    completed: false, // Will be updated when user completes the visualization
                    timeSpent: 0 // Will be updated by frontend
                });

                await historyEntry.save();
                historyId = historyEntry._id;

                // Update user statistics
                await req.user.updateOne({
                    $inc: { 'statistics.totalVisualizations': 1 }
                });

                console.log(`📊 Saved sort history for user ${req.user.username}: ${algorithm} with array [${array.join(', ')}]`);
            } catch (historyError) {
                console.error('Failed to save history:', historyError);
                // Don't fail the request if history saving fails
            }
        }

        res.json({
            success: true,
            data: {
                steps: algorithmSteps,
                metadata: metadata,
                inputArray: array,
                algorithm,
                historyId: historyId,
                user: req.user ? {
                    id: req.user._id,
                    username: req.user.username
                } : null
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

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Test Server running on port ${PORT}`);
    console.log(`📊 Test API available at http://localhost:${PORT}`);
});
