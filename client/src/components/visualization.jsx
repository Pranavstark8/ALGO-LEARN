import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ComplexityAnalysis from './ComplexityAnalysis';
import authService from '../services/authService';

function Visualization({ steps, originalArray, metadata, algorithm, visualizationId, onBack }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1000); // milliseconds
    const [viewMode, setViewMode] = useState(algorithm === "Merge Sort" ? 'tree' : 'linear'); // 'tree' or 'linear'
    const [showComplexityAnalysis, setShowComplexityAnalysis] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);

    // Save current step to localStorage whenever it changes
    const saveCurrentStep = (step) => {
        const stepState = {
            currentStep: step,
            algorithm: algorithm,
            timestamp: Date.now()
        };
        localStorage.setItem('algolearn_current_step', JSON.stringify(stepState));
    };

    // Restore current step from localStorage on component mount
    useEffect(() => {
        const savedStepState = localStorage.getItem('algolearn_current_step');
        if (savedStepState) {
            try {
                const parsedState = JSON.parse(savedStepState);
                // Check if the saved step is for the same algorithm and recent
                const stateAge = Date.now() - parsedState.timestamp;
                const maxAge = 30 * 60 * 1000; // 30 minutes

                if (stateAge < maxAge &&
                    parsedState.algorithm === algorithm &&
                    parsedState.currentStep < steps.length) {
                    setCurrentStep(parsedState.currentStep);
                    console.log(`🔄 Restored step ${parsedState.currentStep} for ${algorithm}`);
                } else {
                    localStorage.removeItem('algolearn_current_step');
                }
            } catch (error) {
                console.error('Failed to restore step state:', error);
                localStorage.removeItem('algolearn_current_step');
            }
        }
    }, [algorithm, steps.length]);

    // Reset view mode when algorithm changes
    useEffect(() => {
        setViewMode(algorithm === "Merge Sort" ? 'tree' : 'linear');
    }, [algorithm]);

    useEffect(() => {
        let interval;
        if (isPlaying && currentStep < steps.length - 1) {
            interval = setInterval(() => {
                setCurrentStep(prev => {
                    const newStep = prev + 1;
                    saveCurrentStep(newStep);
                    return newStep;
                });
            }, speed);
        } else if (currentStep >= steps.length - 1) {
            setIsPlaying(false);
            // Auto-show complexity analysis when algorithm completes
            if (metadata && metadata.complexity) {
                setTimeout(() => {
                    setShowComplexityAnalysis(true);
                }, 1000); // Show after 1 second delay
            }
        }
        return () => clearInterval(interval);
    }, [isPlaying, currentStep, steps.length, speed, metadata]);

    const handlePlay = () => {
        if (currentStep >= steps.length - 1) {
            setCurrentStep(0);
            saveCurrentStep(0);
        }
        setIsPlaying(!isPlaying);
    };

    const handleReset = () => {
        setCurrentStep(0);
        setIsPlaying(false);
        saveCurrentStep(0);
    };

    const handleToggleFavorite = async () => {
        if (!visualizationId) {
            alert('Cannot favorite this visualization - no ID available');
            return;
        }

        setFavoriteLoading(true);
        try {
            const response = await authService.toggleFavorite(visualizationId, !isFavorite);
            if (response.success) {
                setIsFavorite(!isFavorite);
            } else {
                alert('Failed to update favorite status');
            }
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
            alert('Failed to update favorite status');
        } finally {
            setFavoriteLoading(false);
        }
    };

    const handleStepForward = () => {
        if (currentStep < steps.length - 1) {
            const newStep = currentStep + 1;
            setCurrentStep(newStep);
            saveCurrentStep(newStep);
        }
    };

    const handleStepBackward = () => {
        if (currentStep > 0) {
            const newStep = currentStep - 1;
            setCurrentStep(newStep);
            saveCurrentStep(newStep);
        }
    };

    if (!steps || steps.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-[#2d2d2d] font-mono">
                No visualization data available
            </div>
        );
    }

    const currentStepData = steps[currentStep];
    const { arrayState, highlights, action, phase, description, leftRange, rightRange, comparing, level } = currentStepData;

    const getPhaseColor = (phase, action) => {
        if (phase === 'split') return '#e4572e';
        if (phase === 'merge') {
            switch (action) {
                case 'compare': return '#ffc914';
                case 'place': return '#17bebb';
                case 'merge_start': return '#9b59b6';
                case 'merge_complete': return '#27ae60';
                default: return '#17bebb';
            }
        }
        if (phase === 'partition') {
            switch (action) {
                case 'choose_pivot': return '#9b59b6';
                case 'compare': return '#ffc914';
                case 'swap': return '#e74c3c';
                case 'place_pivot': return '#27ae60';
                case 'pivot_placed': return '#27ae60';
                case 'start_partition': return '#3498db';
                default: return '#e4572e';
            }
        }
        if (phase === 'initial') return '#2d2d2d';
        if (phase === 'transition') return '#f39c12';
        return '#2d2d2d';
    };

    const getPhaseDescription = (phase, action) => {
        if (description) return description;

        if (phase === 'split') return 'Splitting array into smaller subarrays';
        if (phase === 'merge') {
            switch (action) {
                case 'compare': return 'Comparing elements to determine order';
                case 'place': return 'Placing element in sorted position';
                case 'merge_start': return 'Starting to merge subarrays';
                case 'merge_complete': return 'Completed merging subarrays';
                default: return 'Merging sorted subarrays';
            }
        }
        if (phase === 'partition') {
            switch (action) {
                case 'choose_pivot': return 'Selecting pivot element for partitioning';
                case 'compare': return 'Comparing element with pivot';
                case 'swap': return 'Swapping elements to partition around pivot';
                case 'place_pivot': return 'Placing pivot in correct position';
                case 'pivot_placed': return 'Pivot is now in final sorted position';
                case 'start_partition': return 'Starting to partition subarray';
                case 'subarray_complete': return 'Completed sorting this subarray';
                default: return 'Partitioning array around pivot';
            }
        }
        if (phase === 'initial') return 'Initial array state';
        if (phase === 'transition') return 'Transitioning from split to merge phase';
        return 'Processing...';
    };

    // Build tree structure from steps
    const buildTreeStructure = () => {
        const tree = { children: [], level: 0, array: originalArray, isRoot: true };
        const splitSteps = steps.filter(step => step.phase === 'split');
        const mergeSteps = steps.filter(step => step.phase === 'merge');

        // Create a map to track nodes by their range
        const nodeMap = new Map();
        nodeMap.set(`0-${originalArray.length - 1}`, tree);

        // Process split steps to build the tree structure
        splitSteps.forEach(step => {
            if (step.leftRange && step.rightRange) {
                const parentKey = `${step.leftRange[0]}-${step.rightRange[1]}`;
                const leftKey = `${step.leftRange[0]}-${step.leftRange[1]}`;
                const rightKey = `${step.rightRange[0]}-${step.rightRange[1]}`;

                const parentNode = nodeMap.get(parentKey);
                if (parentNode) {
                    const leftArray = originalArray.slice(step.leftRange[0], step.leftRange[1] + 1);
                    const rightArray = originalArray.slice(step.rightRange[0], step.rightRange[1] + 1);

                    const leftNode = {
                        array: leftArray,
                        level: step.level,
                        range: step.leftRange,
                        children: [],
                        stepIndex: steps.indexOf(step)
                    };

                    const rightNode = {
                        array: rightArray,
                        level: step.level,
                        range: step.rightRange,
                        children: [],
                        stepIndex: steps.indexOf(step)
                    };

                    parentNode.children = [leftNode, rightNode];
                    nodeMap.set(leftKey, leftNode);
                    nodeMap.set(rightKey, rightNode);
                }
            }
        });

        // Add merge information to nodes
        mergeSteps.forEach(step => {
            if (step.action === 'merge_complete' && step.range) {
                const [start, end] = step.range;
                const key = `${start}-${end}`;
                const node = nodeMap.get(key);
                if (node && step.arrayState) {
                    node.mergedArray = step.arrayState.slice(start, end + 1);
                    node.mergeStepIndex = steps.indexOf(step);
                }
            }
        });

        return tree;
    };

    const treeStructure = buildTreeStructure();

    // TreeNode component for rendering individual nodes
    const TreeNode = ({ node, currentStep }) => {
        const isActive = node.stepIndex !== undefined && currentStep >= node.stepIndex;
        const isMerged = node.mergeStepIndex !== undefined && currentStep >= node.mergeStepIndex;
        const displayArray = isMerged ? node.mergedArray : node.array;

        return (
            <div className="flex flex-col items-center">
                {/* Node */}
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                        scale: isActive ? 1 : 0.8,
                        opacity: isActive ? 1 : 0.3
                    }}
                    transition={{ duration: 0.5, delay: node.level * 0.2 }}
                    className={`flex gap-1 p-3 rounded-lg border-2 mb-4 ${
                        isMerged ? 'bg-[#e8f5e8] border-[#27ae60]' :
                        isActive ? 'bg-[#ffebee] border-[#e4572e]' :
                        'bg-gray-100 border-gray-300'
                    }`}
                    style={{
                        boxShadow: isActive ? "2px 2px 0 0 #2d2d2d" : "1px 1px 0 0 #ccc"
                    }}
                >
                    {displayArray.map((value, index) => (
                        <div
                            key={`${node.level}-${index}-${value}`}
                            className={`w-10 h-10 flex items-center justify-center border rounded font-bold text-sm ${
                                isMerged ? 'bg-[#27ae60] text-white border-[#27ae60]' :
                                isActive ? 'bg-[#e4572e] text-white border-[#e4572e]' :
                                'bg-white text-gray-400 border-gray-300'
                            }`}
                        >
                            {value}
                        </div>
                    ))}
                </motion.div>

                {/* Children */}
                {node.children && node.children.length > 0 && (
                    <div className="flex gap-12 relative">
                        {/* Connection lines */}
                        {isActive && (
                            <motion.div
                                className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: node.level * 0.2 + 0.3 }}
                            >
                                {/* Vertical line from parent */}
                                <div className="w-0.5 h-6 bg-[#2d2d2d] mx-auto"></div>
                                {/* Horizontal line */}
                                <div className="w-20 h-0.5 bg-[#2d2d2d] absolute top-6 left-1/2 transform -translate-x-1/2"></div>
                                {/* Vertical lines to children */}
                                <div className="w-0.5 h-6 bg-[#2d2d2d] absolute top-6 left-2"></div>
                                <div className="w-0.5 h-6 bg-[#2d2d2d] absolute top-6 right-2"></div>

                                {/* Split indicator */}
                                <div className="absolute top-3 left-1/2 transform -translate-x-1/2 bg-[#e4572e] text-white text-xs px-2 py-1 rounded font-bold">
                                    SPLIT
                                </div>
                            </motion.div>
                        )}

                        {node.children.map((child, index) => (
                            <TreeNode key={index} node={child} currentStep={currentStep} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div
            className="min-h-screen p-8"
            style={{
                background: "#fbeee0",
                fontFamily: "'IBM Plex Mono', 'Fira Mono', monospace"
            }}
        >
            {/* Header */}
            <div className="text-center mb-8">
                <h1
                    className="text-3xl font-bold text-[#2d2d2d] mb-4"
                    style={{
                        fontFamily: "'Press Start 2P', 'IBM Plex Mono', monospace",
                        letterSpacing: "2px"
                    }}
                >
                    MERGE SORT TREE VISUALIZATION
                </h1>
                <div className="text-lg text-[#2d2d2d] mb-4">
                    Original Array: [{originalArray.join(', ')}]
                </div>

                {/* View Mode Toggle - Only show for Merge Sort */}
                {algorithm === "Merge Sort" && (
                    <div className="flex justify-center gap-2 mb-4">
                        <button
                            onClick={() => setViewMode('tree')}
                            className={`px-4 py-2 border-2 border-[#2d2d2d] rounded font-bold text-sm transition ${
                                viewMode === 'tree'
                                    ? 'bg-[#e4572e] text-white'
                                    : 'bg-white text-[#2d2d2d] hover:bg-[#f0f0f0]'
                            }`}
                            style={{
                                fontFamily: "'Press Start 2P', 'IBM Plex Mono', monospace",
                                letterSpacing: "1px",
                                boxShadow: "2px 2px 0 0 #2d2d2d"
                            }}
                        >
                            TREE VIEW
                        </button>
                        <button
                            onClick={() => setViewMode('linear')}
                            className={`px-4 py-2 border-2 border-[#2d2d2d] rounded font-bold text-sm transition ${
                                viewMode === 'linear'
                                    ? 'bg-[#e4572e] text-white'
                                    : 'bg-white text-[#2d2d2d] hover:bg-[#f0f0f0]'
                            }`}
                            style={{
                                fontFamily: "'Press Start 2P', 'IBM Plex Mono', monospace",
                                letterSpacing: "1px",
                                boxShadow: "2px 2px 0 0 #2d2d2d"
                            }}
                        >
                            LINEAR VIEW
                        </button>
                    </div>
                )}

                {/* Quick Sort info */}
                {algorithm === "Quick Sort" && (
                    <div className="mb-4">
                        <div className="text-sm text-[#666] mb-4 font-mono text-center">
                            Quick Sort uses in-place partitioning - watch elements move around pivots
                        </div>

                        {/* Legend for Quick Sort */}
                        <div className="flex flex-wrap justify-center gap-3 mb-4 text-xs font-mono">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-[#9b59b6] rounded"></div>
                                <span>Pivot</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-[#ffc914] rounded"></div>
                                <span>Comparing</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-[#e74c3c] rounded"></div>
                                <span>Swapping</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-[#3498db] rounded"></div>
                                <span>Partition Range</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-[#27ae60] rounded"></div>
                                <span>Pivot Placed</span>
                            </div>
                        </div>
                    </div>
                )}

                <div
                    className="text-md font-bold px-4 py-2 rounded mb-2"
                    style={{
                        backgroundColor: getPhaseColor(currentStepData.phase, action),
                        color: action === 'compare' ? '#2d2d2d' : 'white'
                    }}
                >
                    Step {currentStep + 1} of {steps.length}: {getPhaseDescription(currentStepData.phase, action)}
                </div>

                {/* Phase indicator */}
                <div className="text-sm text-[#2d2d2d] mb-2 font-mono">
                    <span className="font-bold">Phase:</span> {currentStepData.phase?.toUpperCase() || 'PROCESSING'}
                    {level !== undefined && <span className="ml-4"><span className="font-bold">Level:</span> {level}</span>}
                </div>

                {/* Performance Metrics */}
                {metadata && (
                    <div className="text-sm text-[#2d2d2d] mb-2 font-mono">
                        <span className="font-bold">Array Size:</span> {metadata.arraySize} |
                        <span className="font-bold ml-2">Execution Time:</span> {metadata.executionTime}ms |
                        <span className="font-bold ml-2">Max Depth:</span> {metadata.maxDepth}
                    </div>
                )}

                {/* Comparison info */}
                {comparing && (
                    <div className="text-sm text-[#2d2d2d] mb-2 font-mono">
                        <span className="font-bold">Comparing:</span> {comparing[0]} vs {comparing[1]}
                    </div>
                )}

                {/* Quick Sort specific info */}
                {currentStepData.pivot !== undefined && (
                    <div className="text-sm text-[#2d2d2d] mb-2 font-mono">
                        <span className="font-bold">Pivot:</span> {currentStepData.pivot}
                        {currentStepData.pivotIndex !== undefined && (
                            <span className="ml-2"><span className="font-bold">Position:</span> {currentStepData.pivotIndex}</span>
                        )}
                    </div>
                )}

                {/* Swapping info */}
                {currentStepData.swapping && (
                    <div className="text-sm text-[#2d2d2d] mb-2 font-mono">
                        <span className="font-bold">Swapping:</span> {currentStepData.swapping[0]} ↔ {currentStepData.swapping[1]}
                    </div>
                )}

                {/* Range info */}
                {currentStepData.range && (
                    <div className="text-sm text-[#2d2d2d] mb-2 font-mono">
                        <span className="font-bold">Working on range:</span> [{currentStepData.range[0]}, {currentStepData.range[1]}]
                    </div>
                )}

                {/* Completion Status */}
                {currentStep >= steps.length - 1 && metadata && (
                    <div className="text-sm text-[#27ae60] mb-2 font-mono font-bold">
                        ✅ Sorting Complete! Time: O(n log n) | Space: O(n)
                    </div>
                )}
            </div>

            {/* Visualization Content */}
            <div className="flex justify-center mb-8">
                {algorithm === "Merge Sort" && viewMode === 'tree' ? (
                    /* Tree Visualization */
                    <div className="w-full max-w-6xl overflow-x-auto">
                        <div className="min-w-max p-8">
                            <TreeNode node={treeStructure} currentStep={currentStep} />
                        </div>

                        {/* Tree Legend and Instructions */}
                        <div className="mt-6 text-center">
                            <div className="flex justify-center gap-6 text-sm font-mono mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-[#ffebee] border-2 border-[#e4572e] rounded"></div>
                                    <span>Split Phase</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-[#e8f5e8] border-2 border-[#27ae60] rounded"></div>
                                    <span>Merged</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded"></div>
                                    <span>Not Yet Active</span>
                                </div>
                            </div>

                            <div className="text-sm text-[#2d2d2d] font-mono max-w-2xl mx-auto">
                                <p className="mb-2">
                                    <span className="font-bold">Tree View:</span> Shows the complete divide-and-conquer structure
                                </p>
                                <p>
                                    Watch as the array splits down (red) and then merges back up (green) through the tree levels
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Linear Array Visualization */
                    <div className="flex flex-col items-center">
                        {/* Range indicators for split phase */}
                        {currentStepData.phase === 'split' && leftRange && rightRange && (
                            <div className="flex gap-2 mb-4 text-sm font-mono">
                                <div className="px-3 py-1 bg-[#e4572e] text-white rounded">
                                    Left: [{leftRange[0]}-{leftRange[1]}]
                                </div>
                                <div className="px-3 py-1 bg-[#e4572e] text-white rounded">
                                    Right: [{rightRange[0]}-{rightRange[1]}]
                                </div>
                            </div>
                        )}

                        {/* Range indicators for partition phase */}
                        {currentStepData.phase === 'partition' && currentStepData.range && (
                            <div className="flex gap-2 mb-4 text-sm font-mono">
                                <div className="px-3 py-1 bg-[#3498db] text-white rounded">
                                    Partitioning: [{currentStepData.range[0]}-{currentStepData.range[1]}]
                                </div>
                                {currentStepData.pivot !== undefined && (
                                    <div className="px-3 py-1 bg-[#9b59b6] text-white rounded">
                                        Pivot: {currentStepData.pivot}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex gap-2 p-6 bg-white rounded-lg border-2 border-[#2d2d2d] shadow-[4px_4px_0_0_#2d2d2d]">
                            <AnimatePresence mode="wait">
                                {arrayState.map((value, index) => {
                                    const isHighlighted = highlights && highlights.includes(index);
                                    const isInLeftRange = leftRange && index >= leftRange[0] && index <= leftRange[1];
                                    const isInRightRange = rightRange && index >= rightRange[0] && index <= rightRange[1];
                                    const isInPartitionRange = currentStepData.range && index >= currentStepData.range[0] && index <= currentStepData.range[1];
                                    const isPivot = currentStepData.pivotIndex === index || (currentStepData.pivot !== undefined && arrayState[index] === currentStepData.pivot && currentStepData.action === 'choose_pivot');

                                    let backgroundColor = '#f8f9fa';
                                    let borderColor = '#2d2d2d';
                                    let textColor = '#2d2d2d';

                                    if (isHighlighted) {
                                        backgroundColor = getPhaseColor(currentStepData.phase, action);
                                        textColor = action === 'compare' || action === 'choose_pivot' ? '#2d2d2d' : 'white';
                                    } else if (isPivot && currentStepData.phase === 'partition') {
                                        backgroundColor = '#9b59b6';
                                        textColor = 'white';
                                        borderColor = '#8e44ad';
                                    } else if (currentStepData.phase === 'split') {
                                        if (isInLeftRange) {
                                            backgroundColor = '#ffebee';
                                            borderColor = '#e4572e';
                                        } else if (isInRightRange) {
                                            backgroundColor = '#e8f5e8';
                                            borderColor = '#27ae60';
                                        }
                                    } else if (currentStepData.phase === 'partition' && isInPartitionRange) {
                                        backgroundColor = '#e8f4fd';
                                        borderColor = '#3498db';
                                    }

                                    return (
                                        <motion.div
                                            key={`${index}-${value}-${currentStep}`}
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{
                                                scale: isHighlighted ? 1.1 : 1,
                                                opacity: 1,
                                                backgroundColor: backgroundColor,
                                                color: textColor,
                                                borderColor: borderColor
                                            }}
                                            transition={{ duration: 0.3 }}
                                            className="w-16 h-16 flex items-center justify-center border-2 rounded font-bold text-lg"
                                            style={{
                                                boxShadow: isHighlighted ? "0 0 0 3px rgba(228, 87, 46, 0.3)" : "2px 2px 0 0 #2d2d2d"
                                            }}
                                        >
                                            {value}
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>

                        {/* Level indicator */}
                        {level !== undefined && (
                            <div className="mt-2 text-sm font-mono text-[#2d2d2d]">
                                Tree Level: {level}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="flex justify-center items-center gap-4 mb-8">
                <button
                    onClick={handleReset}
                    className="px-4 py-2 border-2 border-[#2d2d2d] rounded bg-[#76c893] text-[#2d2d2d] font-bold text-sm shadow-[2px_2px_0_0_#2d2d2d] hover:bg-[#52b788] transition"
                    style={{
                        fontFamily: "'Press Start 2P', 'IBM Plex Mono', monospace",
                        letterSpacing: "1px"
                    }}
                >
                    RESET
                </button>

                <button
                    onClick={handleStepBackward}
                    disabled={currentStep === 0}
                    className="px-4 py-2 border-2 border-[#2d2d2d] rounded bg-[#ffc914] text-[#2d2d2d] font-bold text-sm shadow-[2px_2px_0_0_#2d2d2d] hover:bg-[#ffb700] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                        fontFamily: "'Press Start 2P', 'IBM Plex Mono', monospace",
                        letterSpacing: "1px"
                    }}
                >
                    ◀ STEP
                </button>

                <button
                    onClick={handlePlay}
                    className="px-6 py-2 border-2 border-[#2d2d2d] rounded bg-[#e4572e] text-white font-bold text-sm shadow-[2px_2px_0_0_#2d2d2d] hover:bg-[#d63031] transition"
                    style={{
                        fontFamily: "'Press Start 2P', 'IBM Plex Mono', monospace",
                        letterSpacing: "1px"
                    }}
                >
                    {isPlaying ? 'PAUSE' : 'PLAY'}
                </button>

                <button
                    onClick={handleStepForward}
                    disabled={currentStep >= steps.length - 1}
                    className="px-4 py-2 border-2 border-[#2d2d2d] rounded bg-[#ffc914] text-[#2d2d2d] font-bold text-sm shadow-[2px_2px_0_0_#2d2d2d] hover:bg-[#ffb700] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                        fontFamily: "'Press Start 2P', 'IBM Plex Mono', monospace",
                        letterSpacing: "1px"
                    }}
                >
                    STEP ▶
                </button>

                {/* Complexity Analysis Button */}
                {metadata && metadata.complexity && (
                    <button
                        onClick={() => setShowComplexityAnalysis(true)}
                        className="px-4 py-2 border-2 border-[#2d2d2d] rounded bg-[#9b59b6] text-white font-bold text-sm shadow-[2px_2px_0_0_#2d2d2d] hover:bg-[#8e44ad] transition"
                        style={{
                            fontFamily: "'Press Start 2P', 'IBM Plex Mono', monospace",
                            letterSpacing: "1px"
                        }}
                    >
                        COMPLEXITY
                    </button>
                )}

                {/* Favorite Button */}
                {visualizationId && (
                    <button
                        onClick={handleToggleFavorite}
                        disabled={favoriteLoading}
                        className={`px-4 py-2 border-2 border-[#2d2d2d] rounded font-bold text-sm shadow-[2px_2px_0_0_#2d2d2d] transition disabled:opacity-50 disabled:cursor-not-allowed ${
                            isFavorite
                                ? 'bg-[#f1c40f] text-[#2d2d2d] hover:bg-[#f39c12]'
                                : 'bg-white text-[#2d2d2d] hover:bg-[#f0f0f0]'
                        }`}
                        style={{
                            fontFamily: "'Press Start 2P', 'IBM Plex Mono', monospace",
                            letterSpacing: "1px"
                        }}
                    >
                        {favoriteLoading ? '...' : (isFavorite ? '⭐ UNFAV' : '☆ FAVORITE')}
                    </button>
                )}
            </div>

            {/* Speed Control */}
            <div className="flex justify-center items-center gap-4 mb-8">
                <label className="text-[#2d2d2d] font-bold">Speed:</label>
                <input
                    type="range"
                    min="200"
                    max="2000"
                    step="200"
                    value={speed}
                    onChange={(e) => setSpeed(parseInt(e.target.value))}
                    className="w-32"
                />
                <span className="text-[#2d2d2d] font-mono text-sm">
                    {speed}ms
                </span>
            </div>

            {/* Progress Bar */}
            <div className="max-w-2xl mx-auto">
                <div className="w-full bg-white border-2 border-[#2d2d2d] rounded-full h-4 shadow-[2px_2px_0_0_#2d2d2d]">
                    <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: getPhaseColor(currentStepData.phase, action) }}
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
                <div className="text-center mt-2 text-[#2d2d2d] font-mono text-sm">
                    Progress: {currentStep + 1} / {steps.length}
                </div>

                {/* Phase breakdown */}
                <div className="flex justify-center mt-4 gap-4 text-xs font-mono">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-[#e4572e] rounded"></div>
                        <span>Split Phase</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-[#f39c12] rounded"></div>
                        <span>Transition</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-[#17bebb] rounded"></div>
                        <span>Merge Phase</span>
                    </div>
                </div>
            </div>

            {/* Complexity Analysis Modal */}
            <ComplexityAnalysis
                complexity={metadata?.complexity}
                metadata={metadata}
                isVisible={showComplexityAnalysis}
                onClose={() => setShowComplexityAnalysis(false)}
            />
        </div>
    );
}

export default Visualization;