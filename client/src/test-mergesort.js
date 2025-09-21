import mergeSort from './algorithms/mergesort.js';

// Test the merge sort algorithm with a simple array
const testArray = [4, 2, 7, 1];
console.log('Testing merge sort with array:', testArray);

const steps = mergeSort([...testArray]);
console.log('Number of steps generated:', steps.length);

// Group steps by phase
const splitSteps = steps.filter(step => step.phase === 'split');
const mergeSteps = steps.filter(step => step.phase === 'merge');
const otherSteps = steps.filter(step => !['split', 'merge'].includes(step.phase));

console.log('\n=== PHASE BREAKDOWN ===');
console.log('Split steps:', splitSteps.length);
console.log('Merge steps:', mergeSteps.length);
console.log('Other steps:', otherSteps.length);

console.log('\n=== TREE STRUCTURE (SPLITS) ===');
splitSteps.forEach((step, index) => {
    console.log(`Level ${step.level} Split:`, {
        leftRange: step.leftRange,
        rightRange: step.rightRange,
        leftArray: testArray.slice(step.leftRange[0], step.leftRange[1] + 1),
        rightArray: testArray.slice(step.rightRange[0], step.rightRange[1] + 1)
    });
});

console.log('\n=== MERGE COMPLETIONS ===');
const mergeCompletions = mergeSteps.filter(step => step.action === 'merge_complete');
mergeCompletions.forEach((step, index) => {
    console.log(`Level ${step.level} Merge Complete:`, {
        range: step.range,
        result: step.arrayState.slice(step.range[0], step.range[1] + 1)
    });
});

console.log('\nFinal sorted array:', steps[steps.length - 1]?.arrayState);
