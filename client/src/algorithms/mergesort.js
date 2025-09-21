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

export default mergeSort;
