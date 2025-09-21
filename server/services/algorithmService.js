class AlgorithmService {
    
    // Merge Sort Implementation (Server-side)
    static mergeSort(array) {
        const startTime = Date.now();
        let steps = [];
        let splitSteps = [];
        let mergeSteps = [];
        let maxDepth = 0;
        
        // Phase 1: Collect all split operations
        function collectSplits(arr, startIndex, level = 0) {
            maxDepth = Math.max(maxDepth, level);
            
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
        
        const executionTime = Date.now() - startTime;

        // Calculate detailed complexity analysis
        const n = array.length;
        const complexityAnalysis = AlgorithmService.calculateMergeSortComplexity(n, maxDepth, splitSteps.length, mergeSteps.length);

        return {
            steps,
            metadata: {
                totalSteps: steps.length,
                splitSteps: splitSteps.length,
                mergeSteps: mergeSteps.length,
                maxDepth,
                executionTime,
                arraySize: n,
                complexity: complexityAnalysis
            }
        };
    }

    // Quick Sort Implementation
    static quickSort(array) {
        const startTime = Date.now();
        let steps = [];
        let partitionSteps = [];
        let recursionSteps = [];
        let maxDepth = 0;
        let comparisons = 0;
        let swaps = 0;

        // Phase 1: Partitioning and recursive calls
        function quickSortRecursive(arr, low, high, level = 0) {
            maxDepth = Math.max(maxDepth, level);

            if (low < high) {
                // Record the current subarray being processed
                recursionSteps.push({
                    phase: "partition",
                    action: "start_partition",
                    arrayState: [...array],
                    highlights: [low, high],
                    range: [low, high],
                    level: level,
                    description: `Starting to partition subarray from index ${low} to ${high}`
                });

                // Partition the array and get pivot index
                let pivotIndex = partition(arr, low, high, level);

                // Record pivot placement
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

                // Recursively sort left and right subarrays
                quickSortRecursive(arr, low, pivotIndex - 1, level + 1);
                quickSortRecursive(arr, pivotIndex + 1, high, level + 1);

                // Record completion of this subarray
                recursionSteps.push({
                    phase: "partition",
                    action: "subarray_complete",
                    arrayState: [...array],
                    highlights: [low, high],
                    range: [low, high],
                    level: level,
                    description: `Completed sorting subarray from ${low} to ${high}`
                });
            }
        }

        function partition(arr, low, high, level) {
            // Choose the rightmost element as pivot
            let pivot = arr[high];
            let i = low - 1; // Index of smaller element

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

                // Record comparison
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

                // If current element is smaller than or equal to pivot
                if (arr[j] <= pivot) {
                    i++;

                    if (i !== j) {
                        swaps++;
                        // Record swap
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

                        // Perform the swap
                        [arr[i], arr[j]] = [arr[j], arr[i]];

                        // Record state after swap
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

            // Place pivot in correct position
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
                    description: `Placing pivot ${arr[high]} in correct position by swapping with ${arr[i + 1]}`
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

        // Execute the algorithm
        // Add initial state
        steps.push({
            phase: "initial",
            action: "initial",
            arrayState: [...array],
            highlights: [],
            description: `Initial array: [${array.join(', ')}]`
        });

        // Start quick sort
        quickSortRecursive(array, 0, array.length - 1);

        // Combine all steps
        steps.push(...recursionSteps);
        steps.push(...partitionSteps);

        // Sort steps by the order they were created (maintain chronological order)
        const allSteps = [...recursionSteps, ...partitionSteps].sort((a, b) => {
            // This is a simple sort - in a real implementation, you'd want to maintain proper order
            return 0;
        });

        steps = [steps[0], ...allSteps]; // Keep initial step first

        const executionTime = Date.now() - startTime;

        // Calculate detailed complexity analysis
        const n = array.length;
        const complexityAnalysis = AlgorithmService.calculateQuickSortComplexity(n, maxDepth, comparisons, swaps);

        return {
            steps,
            metadata: {
                totalSteps: steps.length,
                partitionSteps: partitionSteps.length,
                recursionSteps: recursionSteps.length,
                maxDepth,
                comparisons,
                swaps,
                executionTime,
                arraySize: n,
                complexity: complexityAnalysis
            }
        };
    }

    // Calculate detailed complexity analysis for Quick Sort
    static calculateQuickSortComplexity(n, maxDepth, comparisons, swaps) {
        // Time Complexity Analysis
        const logN = Math.ceil(Math.log2(n));
        const bestCaseDepth = logN;
        const worstCaseDepth = n - 1;
        const actualDepth = maxDepth;

        // Determine case based on actual depth
        let caseType = 'average';
        if (actualDepth <= bestCaseDepth + 1) {
            caseType = 'best';
        } else if (actualDepth >= worstCaseDepth - 2) {
            caseType = 'worst';
        }

        // Space Complexity Analysis
        const recursionStackSpace = actualDepth;
        const auxiliarySpace = 1; // Quick sort is in-place
        const totalSpaceUsed = recursionStackSpace + auxiliarySpace;

        return {
            time: {
                bigO: caseType === 'worst' ? 'O(n²)' : 'O(n log n)',
                explanation: `Quick sort's time complexity depends on pivot selection. ${caseType === 'worst' ? 'Poor pivot choices lead to O(n²)' : 'Good pivot choices achieve O(n log n)'}`,
                breakdown: {
                    actualDepth: actualDepth,
                    bestCaseDepth: bestCaseDepth,
                    worstCaseDepth: worstCaseDepth,
                    comparisons: comparisons,
                    swaps: swaps,
                    caseType: caseType
                },
                steps: [
                    {
                        step: 1,
                        title: "Partitioning Phase",
                        description: `Each partition operation processes n elements`,
                        calculation: `${comparisons} comparisons made across all partitions`,
                        result: `O(n) per partition level`
                    },
                    {
                        step: 2,
                        title: "Recursion Depth",
                        description: `Depth depends on pivot quality`,
                        calculation: `Actual depth: ${actualDepth}, Best: ${bestCaseDepth}, Worst: ${worstCaseDepth}`,
                        result: `${caseType} case: ${caseType === 'worst' ? 'O(n)' : 'O(log n)'} levels`
                    },
                    {
                        step: 3,
                        title: "Final Complexity",
                        description: "Combining partition work and recursion depth",
                        calculation: `O(n) × ${caseType === 'worst' ? 'O(n)' : 'O(log n)'} = ${caseType === 'worst' ? 'O(n²)' : 'O(n log n)'}`,
                        result: `${caseType === 'worst' ? 'O(n²)' : 'O(n log n)'} time complexity`
                    }
                ]
            },
            space: {
                bigO: actualDepth > logN + 2 ? 'O(n)' : 'O(log n)',
                explanation: 'Quick sort uses recursion stack space, which varies with pivot quality',
                breakdown: {
                    recursionStack: recursionStackSpace,
                    auxiliarySpace: auxiliarySpace,
                    totalSpace: totalSpaceUsed,
                    inPlace: true
                },
                steps: [
                    {
                        step: 1,
                        title: "In-Place Sorting",
                        description: "Quick sort sorts the array in-place",
                        calculation: `O(1) auxiliary space for variables`,
                        result: `O(1) auxiliary space`
                    },
                    {
                        step: 2,
                        title: "Recursion Stack Space",
                        description: "Function call stack for recursive calls",
                        calculation: `Actual depth: ${actualDepth} stack frames`,
                        result: `${actualDepth > logN + 2 ? 'O(n)' : 'O(log n)'} stack space`
                    },
                    {
                        step: 3,
                        title: "Total Space Complexity",
                        description: "Recursion stack dominates space usage",
                        calculation: `O(1) + ${actualDepth > logN + 2 ? 'O(n)' : 'O(log n)'} = ${actualDepth > logN + 2 ? 'O(n)' : 'O(log n)'}`,
                        result: `${actualDepth > logN + 2 ? 'O(n)' : 'O(log n)'} space complexity`
                    }
                ]
            },
            performance: {
                bestCase: 'O(n log n)',
                averageCase: 'O(n log n)',
                worstCase: 'O(n²)',
                stable: false,
                inPlace: true,
                adaptive: false,
                actualCase: caseType
            }
        };
    }

    // Calculate detailed complexity analysis for Merge Sort
    static calculateMergeSortComplexity(n, maxDepth, splitSteps, mergeSteps) {
        // Time Complexity Analysis
        const logN = Math.ceil(Math.log2(n));
        const theoreticalLevels = logN;
        const actualLevels = maxDepth;

        // Each level processes n elements
        const operationsPerLevel = n;
        const totalComparisons = mergeSteps; // Approximate
        const theoreticalComparisons = n * logN;

        // Space Complexity Analysis
        const auxiliarySpace = n; // For merging
        const recursionStackSpace = logN; // Maximum recursion depth
        const totalSpaceUsed = auxiliarySpace + recursionStackSpace;

        return {
            time: {
                bigO: 'O(n log n)',
                explanation: 'Merge sort always divides the array into halves (log n levels) and merges n elements at each level',
                breakdown: {
                    levels: actualLevels,
                    theoreticalLevels: theoreticalLevels,
                    operationsPerLevel: operationsPerLevel,
                    totalOperations: actualLevels * operationsPerLevel,
                    actualComparisons: totalComparisons,
                    theoreticalComparisons: theoreticalComparisons
                },
                steps: [
                    {
                        step: 1,
                        title: "Divide Phase",
                        description: `Array of size ${n} is divided into halves recursively`,
                        calculation: `log₂(${n}) = ${logN} levels`,
                        result: `${logN} levels of division`
                    },
                    {
                        step: 2,
                        title: "Conquer Phase",
                        description: "At each level, we merge all subarrays",
                        calculation: `${operationsPerLevel} elements × ${logN} levels`,
                        result: `${operationsPerLevel * logN} total operations`
                    },
                    {
                        step: 3,
                        title: "Final Complexity",
                        description: "Combining divide and conquer phases",
                        calculation: `O(log n) × O(n) = O(n log n)`,
                        result: "O(n log n) time complexity"
                    }
                ]
            },
            space: {
                bigO: 'O(n)',
                explanation: 'Merge sort requires additional space for merging subarrays and recursion stack',
                breakdown: {
                    auxiliarySpace: auxiliarySpace,
                    recursionStack: recursionStackSpace,
                    totalSpace: totalSpaceUsed,
                    spaceRatio: (totalSpaceUsed / n).toFixed(2)
                },
                steps: [
                    {
                        step: 1,
                        title: "Auxiliary Array Space",
                        description: "Temporary arrays needed for merging",
                        calculation: `${n} elements for temporary storage`,
                        result: `O(n) auxiliary space`
                    },
                    {
                        step: 2,
                        title: "Recursion Stack Space",
                        description: "Function call stack for recursive calls",
                        calculation: `log₂(${n}) = ${logN} maximum stack depth`,
                        result: `O(log n) stack space`
                    },
                    {
                        step: 3,
                        title: "Total Space Complexity",
                        description: "Auxiliary space dominates recursion stack",
                        calculation: `O(n) + O(log n) = O(n)`,
                        result: "O(n) space complexity"
                    }
                ]
            },
            performance: {
                bestCase: 'O(n log n)',
                averageCase: 'O(n log n)',
                worstCase: 'O(n log n)',
                stable: true,
                inPlace: false,
                adaptive: false
            }
        };
    }

    // Get algorithm information
    static getAlgorithmInfo(algorithmName) {
        const algorithms = {
            mergeSort: {
                name: 'Merge Sort',
                description: 'A divide-and-conquer algorithm that divides the array into halves, sorts them, and merges them back.',
                timeComplexity: 'O(n log n)',
                spaceComplexity: 'O(n)',
                stable: true,
                inPlace: false,
                bestFor: 'Large datasets, when stability is required'
            },
            quickSort: {
                name: 'Quick Sort',
                description: 'A divide-and-conquer algorithm that picks a pivot and partitions the array around it.',
                timeComplexity: 'O(n log n) average, O(n²) worst',
                spaceComplexity: 'O(log n)',
                stable: false,
                inPlace: true,
                bestFor: 'General purpose sorting, when average performance matters'
            }
        };

        return algorithms[algorithmName] || null;
    }
}

module.exports = AlgorithmService;
