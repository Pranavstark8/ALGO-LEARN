import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function ComplexityAnalysis({ complexity, metadata, isVisible, onClose }) {
    const [activeTab, setActiveTab] = useState('time');

    if (!isVisible || !complexity) return null;

    const timeComplexity = complexity.time || {};
    const spaceComplexity = complexity.space || {};

    // Ensure breakdown exists with default values
    const timeBreakdown = timeComplexity.breakdown || {};
    const spaceBreakdown = spaceComplexity.breakdown || {};

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
            <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="bg-[#fbeee0] border-4 border-[#2d2d2d] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                style={{
                    boxShadow: "8px 8px 0 0 #2d2d2d",
                    fontFamily: "'IBM Plex Mono', 'Fira Mono', monospace"
                }}
            >
                {/* Header */}
                <div className="bg-[#e4572e] text-white p-4 border-b-4 border-[#2d2d2d]">
                    <h2 
                        className="text-2xl font-bold text-center"
                        style={{
                            fontFamily: "'Press Start 2P', 'IBM Plex Mono', monospace",
                            letterSpacing: "2px"
                        }}
                    >
                        COMPLEXITY ANALYSIS
                    </h2>
                    <p className="text-center mt-2 font-mono">
                        Merge Sort Performance for Array Size: {metadata.arraySize}
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b-2 border-[#2d2d2d]">
                    <button
                        onClick={() => setActiveTab('time')}
                        className={`flex-1 py-3 px-4 font-bold text-sm border-r-2 border-[#2d2d2d] transition ${
                            activeTab === 'time' 
                                ? 'bg-[#ffc914] text-[#2d2d2d]' 
                                : 'bg-white text-[#2d2d2d] hover:bg-[#f0f0f0]'
                        }`}
                        style={{
                            fontFamily: "'Press Start 2P', 'IBM Plex Mono', monospace",
                            letterSpacing: "1px"
                        }}
                    >
                        TIME COMPLEXITY
                    </button>
                    <button
                        onClick={() => setActiveTab('space')}
                        className={`flex-1 py-3 px-4 font-bold text-sm transition ${
                            activeTab === 'space' 
                                ? 'bg-[#ffc914] text-[#2d2d2d]' 
                                : 'bg-white text-[#2d2d2d] hover:bg-[#f0f0f0]'
                        }`}
                        style={{
                            fontFamily: "'Press Start 2P', 'IBM Plex Mono', monospace",
                            letterSpacing: "1px"
                        }}
                    >
                        SPACE COMPLEXITY
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <AnimatePresence>
                        {activeTab === 'time' && (
                            <motion.div
                                key="time"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Time Complexity Overview */}
                                <div className="bg-white border-2 border-[#2d2d2d] rounded p-4 mb-6 shadow-[4px_4px_0_0_#2d2d2d]">
                                    <h3 className="text-xl font-bold text-[#e4572e] mb-2">
                                        Time Complexity: {timeComplexity.bigO}
                                    </h3>
                                    <p className="text-[#2d2d2d] font-mono text-sm mb-4">
                                        {timeComplexity.explanation}
                                    </p>
                                    
                                    {/* Breakdown */}
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-bold">Levels:</span> {timeBreakdown.levels || 'N/A'}
                                        </div>
                                        <div>
                                            <span className="font-bold">Operations/Level:</span> {timeBreakdown.operationsPerLevel || 'N/A'}
                                        </div>
                                        <div>
                                            <span className="font-bold">Total Operations:</span> {timeBreakdown.totalOperations || 'N/A'}
                                        </div>
                                        <div>
                                            <span className="font-bold">Comparisons:</span> {timeBreakdown.actualComparisons || 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                {/* Calculation Steps */}
                                <div className="space-y-4">
                                    <h4 className="text-lg font-bold text-[#2d2d2d] mb-4">
                                        Step-by-Step Calculation:
                                    </h4>
                                    {(timeComplexity.steps || []).map((step, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.2 }}
                                            className="bg-[#fff8f0] border-2 border-[#e4572e] rounded p-4"
                                        >
                                            <div className="flex items-center mb-2">
                                                <div className="w-8 h-8 bg-[#e4572e] text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">
                                                    {step.step}
                                                </div>
                                                <h5 className="font-bold text-[#2d2d2d]">{step.title}</h5>
                                            </div>
                                            <p className="text-sm text-[#2d2d2d] mb-2">{step.description}</p>
                                            <div className="bg-[#2d2d2d] text-[#ffc914] p-2 rounded font-mono text-sm">
                                                {step.calculation}
                                            </div>
                                            <p className="text-sm font-bold text-[#e4572e] mt-2">
                                                → {step.result}
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'space' && (
                            <motion.div
                                key="space"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Space Complexity Overview */}
                                <div className="bg-white border-2 border-[#2d2d2d] rounded p-4 mb-6 shadow-[4px_4px_0_0_#2d2d2d]">
                                    <h3 className="text-xl font-bold text-[#17bebb] mb-2">
                                        Space Complexity: {spaceComplexity.bigO}
                                    </h3>
                                    <p className="text-[#2d2d2d] font-mono text-sm mb-4">
                                        {spaceComplexity.explanation}
                                    </p>
                                    
                                    {/* Breakdown */}
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-bold">Auxiliary Space:</span> {spaceBreakdown.auxiliarySpace || 'N/A'}
                                        </div>
                                        <div>
                                            <span className="font-bold">Stack Space:</span> {spaceBreakdown.recursionStack || 'N/A'}
                                        </div>
                                        <div>
                                            <span className="font-bold">Total Space:</span> {spaceBreakdown.totalSpace || 'N/A'}
                                        </div>
                                        <div>
                                            <span className="font-bold">Space Ratio:</span> {spaceBreakdown.spaceRatio || 'N/A'}x
                                        </div>
                                    </div>
                                </div>

                                {/* Calculation Steps */}
                                <div className="space-y-4">
                                    <h4 className="text-lg font-bold text-[#2d2d2d] mb-4">
                                        Step-by-Step Calculation:
                                    </h4>
                                    {(spaceComplexity.steps || []).map((step, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.2 }}
                                            className="bg-[#f0fffe] border-2 border-[#17bebb] rounded p-4"
                                        >
                                            <div className="flex items-center mb-2">
                                                <div className="w-8 h-8 bg-[#17bebb] text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">
                                                    {step.step}
                                                </div>
                                                <h5 className="font-bold text-[#2d2d2d]">{step.title}</h5>
                                            </div>
                                            <p className="text-sm text-[#2d2d2d] mb-2">{step.description}</p>
                                            <div className="bg-[#2d2d2d] text-[#17bebb] p-2 rounded font-mono text-sm">
                                                {step.calculation}
                                            </div>
                                            <p className="text-sm font-bold text-[#17bebb] mt-2">
                                                → {step.result}
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Performance Summary */}
                <div className="bg-[#2d2d2d] text-white p-4 border-t-4 border-[#2d2d2d]">
                    <h4 className="font-bold mb-2">Performance Summary:</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm font-mono">
                        <div>Best: {complexity.performance?.bestCase || 'O(n log n)'}</div>
                        <div>Average: {complexity.performance?.averageCase || 'O(n log n)'}</div>
                        <div>Worst: {complexity.performance?.worstCase || 'O(n log n)'}</div>
                    </div>
                    <div className="mt-2 text-xs">
                        Stable: {complexity.performance?.stable ? 'Yes' : 'No'} |
                        In-place: {complexity.performance?.inPlace ? 'Yes' : 'No'} |
                        Adaptive: {complexity.performance?.adaptive ? 'Yes' : 'No'}
                    </div>
                </div>

                {/* Close Button */}
                <div className="p-4 text-center border-t-2 border-[#2d2d2d]">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-[#e4572e] text-white font-bold border-2 border-[#2d2d2d] rounded hover:bg-[#d63031] transition"
                        style={{
                            fontFamily: "'Press Start 2P', 'IBM Plex Mono', monospace",
                            letterSpacing: "1px",
                            boxShadow: "4px 4px 0 0 #2d2d2d"
                        }}
                    >
                        CLOSE
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default ComplexityAnalysis;
