function quickSort(array) {
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

    // Combine all steps in chronological order
    const allSteps = [];
    let recursionIndex = 0;
    let partitionIndex = 0;

    // Interleave steps to maintain chronological order
    while (recursionIndex < recursionSteps.length || partitionIndex < partitionSteps.length) {
        if (recursionIndex < recursionSteps.length) {
            allSteps.push(recursionSteps[recursionIndex++]);
        }
        if (partitionIndex < partitionSteps.length) {
            allSteps.push(partitionSteps[partitionIndex++]);
        }
    }

    steps.push(...allSteps);

    return steps;
}

export default quickSort;
