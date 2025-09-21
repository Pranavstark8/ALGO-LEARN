import { useState, useEffect } from 'react';
import Visualization from './visualization';
import Auth from './auth';
import Profile from './profile';
import History from './history';
import Favorites from './favorites';
import authService from '../services/authService';

function Input() {
    const [arrayInput, setArrayInput] = useState("");
    const [algorithm, setAlgorithm] = useState("");
    const [visualizationData, setVisualizationData] = useState(null);
    const [showVisualization, setShowVisualization] = useState(false);
    const [user, setUser] = useState(null);
    const [showAuth, setShowAuth] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showFavorites, setShowFavorites] = useState(false);
    const [currentHistoryId, setCurrentHistoryId] = useState(null);
    const [showWelcome, setShowWelcome] = useState(false);
    const [showRestoreNotification, setShowRestoreNotification] = useState(false);

    const algorithms = [
        "Merge Sort",
        "Quick Sort"
    ];

    // Check for existing authentication and restore visualization state on component mount
    useEffect(() => {
        const currentUser = authService.getUser();
        if (currentUser) {
            setUser(currentUser);
        }

        // Restore visualization state from localStorage
        const savedVisualizationState = localStorage.getItem('algolearn_visualization_state');
        if (savedVisualizationState) {
            try {
                const parsedState = JSON.parse(savedVisualizationState);
                // Check if the saved state is recent (within last 30 minutes)
                const stateAge = Date.now() - parsedState.timestamp;
                const maxAge = 30 * 60 * 1000; // 30 minutes in milliseconds

                if (stateAge < maxAge && parsedState.visualizationData) {
                    setVisualizationData(parsedState.visualizationData);
                    setShowVisualization(true);
                    setCurrentHistoryId(parsedState.currentHistoryId);
                    setShowRestoreNotification(true);
                    console.log('🔄 Restored visualization state from localStorage');

                    // Hide notification after 3 seconds
                    setTimeout(() => setShowRestoreNotification(false), 3000);
                } else {
                    // Clear old state
                    localStorage.removeItem('algolearn_visualization_state');
                }
            } catch (error) {
                console.error('Failed to restore visualization state:', error);
                localStorage.removeItem('algolearn_visualization_state');
            }
        }
    }, []);

    const handleArrayChange = (e) => {
        setArrayInput(e.target.value);
    }
    const handleAlgorithmChange = (e) => {
        setAlgorithm(e.target.value);
    }

    const handleSubmit = () => {
        const array = arrayInput
            .split(",")
            .map((num) => parseInt(num.trim()))
            .filter((n) => !isNaN(n));

        if (array.length === 0) {
            alert("Please enter a valid array");
            return;
        }

        if (!algorithm) {
            alert("Please select an algorithm");
            return;
        }

        if (algorithm === "Merge Sort") {
            // Try backend API first, fallback to local implementation
            fetch('http://localhost:5001/api/algorithms/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                },
                body: JSON.stringify({
                    algorithm: 'mergeSort',
                    array: array,
                    settings: {
                        viewMode: 'tree',
                        speed: 1000
                    }
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const vizData = {
                        steps: data.data.steps,
                        originalArray: [...array],
                        algorithm: "Merge Sort",
                        visualizationId: data.data.visualizationId,
                        metadata: data.data.metadata
                    };
                    setVisualizationData(vizData);
                    setCurrentHistoryId(data.data.historyId);
                    setShowVisualization(true);

                    // Save state to localStorage for persistence
                    saveVisualizationState(vizData, data.data.historyId);
                } else {
                    alert(`Error: ${data.message}`);
                }
            })
            .catch((error) => {
                console.error("Backend not available, using local algorithm:", error);
                // Fallback to local implementation with mock metadata
                import('../algorithms/mergesort.js').then((module) => {
                    const mergeSort = module.default || module.mergeSort;
                    const steps = mergeSort([...array]);

                    // Create mock metadata for complexity analysis
                    const mockMetadata = {
                        arraySize: array.length,
                        totalSteps: steps.length,
                        splitSteps: steps.filter(s => s.phase === 'split').length,
                        mergeSteps: steps.filter(s => s.phase === 'merge').length,
                        maxDepth: Math.ceil(Math.log2(array.length)),
                        executionTime: 15, // Mock execution time
                        complexity: {
                            time: {
                                bigO: 'O(n log n)',
                                explanation: 'Merge sort always divides the array into halves (log n levels) and merges n elements at each level',
                                breakdown: {
                                    levels: Math.ceil(Math.log2(array.length)),
                                    operationsPerLevel: array.length,
                                    totalOperations: array.length * Math.ceil(Math.log2(array.length))
                                },
                                steps: [
                                    {
                                        step: 1,
                                        title: "Divide Phase",
                                        description: `Array of size ${array.length} is divided into halves recursively`,
                                        calculation: `log₂(${array.length}) = ${Math.ceil(Math.log2(array.length))} levels`,
                                        result: `${Math.ceil(Math.log2(array.length))} levels of division`
                                    },
                                    {
                                        step: 2,
                                        title: "Conquer Phase",
                                        description: "At each level, we merge all subarrays",
                                        calculation: `${array.length} elements × ${Math.ceil(Math.log2(array.length))} levels`,
                                        result: `${array.length * Math.ceil(Math.log2(array.length))} total operations`
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
                                    auxiliarySpace: array.length,
                                    recursionStack: Math.ceil(Math.log2(array.length)),
                                    totalSpace: array.length + Math.ceil(Math.log2(array.length))
                                },
                                steps: [
                                    {
                                        step: 1,
                                        title: "Auxiliary Array Space",
                                        description: "Temporary arrays needed for merging",
                                        calculation: `${array.length} elements for temporary storage`,
                                        result: `O(n) auxiliary space`
                                    },
                                    {
                                        step: 2,
                                        title: "Recursion Stack Space",
                                        description: "Function call stack for recursive calls",
                                        calculation: `log₂(${array.length}) = ${Math.ceil(Math.log2(array.length))} maximum stack depth`,
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
                        }
                    };

                    const vizData = {
                        steps: steps,
                        originalArray: [...array],
                        algorithm: "Merge Sort",
                        metadata: mockMetadata
                    };
                    setVisualizationData(vizData);
                    setShowVisualization(true);

                    // Save state to localStorage for persistence
                    saveVisualizationState(vizData);
                }).catch((error) => {
                    console.error("Error loading merge sort:", error);
                    alert("Error loading merge sort algorithm");
                });
            });
        } else if (algorithm === "Quick Sort") {
            // Try backend API first, fallback to local implementation
            fetch('http://localhost:5001/api/algorithms/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeaders()
                },
                body: JSON.stringify({
                    algorithm: 'quickSort',
                    array: array,
                    settings: {
                        viewMode: 'linear',
                        speed: 1000
                    }
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const vizData = {
                        steps: data.data.steps,
                        originalArray: [...array],
                        algorithm: "Quick Sort",
                        visualizationId: data.data.visualizationId,
                        metadata: data.data.metadata
                    };
                    setVisualizationData(vizData);
                    setCurrentHistoryId(data.data.historyId);
                    setShowVisualization(true);

                    // Save state to localStorage for persistence
                    saveVisualizationState(vizData, data.data.historyId);
                } else {
                    alert(`Error: ${data.message}`);
                }
            })
            .catch((error) => {
                console.error("Backend not available, using local algorithm:", error);
                // Fallback to local implementation with mock metadata
                import('../algorithms/quicksort.js').then((module) => {
                    const quickSort = module.default || module.quickSort;
                    const steps = quickSort([...array]);

                    // Create mock metadata for complexity analysis
                    const logN = Math.ceil(Math.log2(array.length));
                    const mockMetadata = {
                        arraySize: array.length,
                        totalSteps: steps.length,
                        partitionSteps: steps.filter(s => s.phase === 'partition').length,
                        recursionSteps: steps.filter(s => s.action === 'start_partition').length,
                        maxDepth: logN,
                        comparisons: steps.filter(s => s.action === 'compare').length,
                        swaps: steps.filter(s => s.action === 'swap').length,
                        executionTime: 12, // Mock execution time
                        complexity: {
                            time: {
                                bigO: 'O(n log n)',
                                explanation: 'Quick sort\'s time complexity depends on pivot selection. Good pivot choices achieve O(n log n)',
                                breakdown: {
                                    actualDepth: logN,
                                    bestCaseDepth: logN,
                                    worstCaseDepth: array.length - 1,
                                    comparisons: steps.filter(s => s.action === 'compare').length,
                                    swaps: steps.filter(s => s.action === 'swap').length,
                                    caseType: 'average'
                                },
                                steps: [
                                    {
                                        step: 1,
                                        title: "Partitioning Phase",
                                        description: "Each partition operation processes n elements",
                                        calculation: `${steps.filter(s => s.action === 'compare').length} comparisons made across all partitions`,
                                        result: "O(n) per partition level"
                                    },
                                    {
                                        step: 2,
                                        title: "Recursion Depth",
                                        description: "Depth depends on pivot quality",
                                        calculation: `Average case: log₂(${array.length}) = ${logN} levels`,
                                        result: "O(log n) levels on average"
                                    },
                                    {
                                        step: 3,
                                        title: "Final Complexity",
                                        description: "Combining partition work and recursion depth",
                                        calculation: "O(n) × O(log n) = O(n log n)",
                                        result: "O(n log n) average time complexity"
                                    }
                                ]
                            },
                            space: {
                                bigO: 'O(log n)',
                                explanation: 'Quick sort uses recursion stack space, which varies with pivot quality',
                                breakdown: {
                                    recursionStack: logN,
                                    auxiliarySpace: 1,
                                    totalSpace: logN + 1,
                                    inPlace: true
                                },
                                steps: [
                                    {
                                        step: 1,
                                        title: "In-Place Sorting",
                                        description: "Quick sort sorts the array in-place",
                                        calculation: "O(1) auxiliary space for variables",
                                        result: "O(1) auxiliary space"
                                    },
                                    {
                                        step: 2,
                                        title: "Recursion Stack Space",
                                        description: "Function call stack for recursive calls",
                                        calculation: `Average depth: ${logN} stack frames`,
                                        result: "O(log n) stack space"
                                    },
                                    {
                                        step: 3,
                                        title: "Total Space Complexity",
                                        description: "Recursion stack dominates space usage",
                                        calculation: "O(1) + O(log n) = O(log n)",
                                        result: "O(log n) space complexity"
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
                                actualCase: 'average'
                            }
                        }
                    };

                    const vizData = {
                        steps: steps,
                        originalArray: [...array],
                        algorithm: "Quick Sort",
                        metadata: mockMetadata
                    };
                    setVisualizationData(vizData);
                    setShowVisualization(true);

                    // Save state to localStorage for persistence
                    saveVisualizationState(vizData);
                }).catch((error) => {
                    console.error("Error loading quick sort:", error);
                    alert("Error loading quick sort algorithm");
                });
            });
        } else {
            alert("Algorithm not implemented yet");
        }
    };

    const handleBackToInput = () => {
        setShowVisualization(false);
        setVisualizationData(null);
        setCurrentHistoryId(null);
        clearVisualizationState();
    };

    const handleAuthSuccess = (userData) => {
        setUser(userData);
        setShowAuth(false);
        setShowWelcome(true);
        // Hide welcome message after 3 seconds
        setTimeout(() => setShowWelcome(false), 3000);
    };

    const handleLogout = async () => {
        await authService.logout();
        setUser(null);
    };

    const handleUserUpdate = (updatedUser) => {
        setUser(updatedUser);
    };

    // Handle visualization from history or favorites
    const handleVisualizationFromData = async (visualizationData) => {
        try {
            // Re-run the algorithm to get fresh steps
            const algorithm = visualizationData.algorithm;
            const array = visualizationData.originalArray;

            if (algorithm === "Merge Sort") {
                await executeMergeSort(array);
            } else if (algorithm === "Quick Sort") {
                await executeQuickSort(array);
            }
        } catch (error) {
            console.error('Failed to re-visualize:', error);
            alert('Failed to load visualization');
        }
    };

    // Save visualization state to localStorage
    const saveVisualizationState = (vizData, historyId = null) => {
        const stateToSave = {
            visualizationData: vizData,
            currentHistoryId: historyId,
            timestamp: Date.now()
        };
        localStorage.setItem('algolearn_visualization_state', JSON.stringify(stateToSave));
        console.log('💾 Saved visualization state to localStorage');
    };

    // Clear visualization state from localStorage
    const clearVisualizationState = () => {
        localStorage.removeItem('algolearn_visualization_state');
        localStorage.removeItem('algolearn_current_step');
        console.log('🗑️ Cleared visualization state from localStorage');
    };

    if (showVisualization && visualizationData) {
        return (
            <div>
                <div className="fixed top-4 left-4 z-10">
                    <button
                        onClick={handleBackToInput}
                        className="px-4 py-2 border-2 border-[#2d2d2d] rounded bg-[#76c893] text-[#2d2d2d] font-bold text-sm shadow-[2px_2px_0_0_#2d2d2d] hover:bg-[#52b788] transition"
                        style={{
                            fontFamily: "'Press Start 2P', 'IBM Plex Mono', monospace",
                            letterSpacing: "1px"
                        }}
                    >
                        ← BACK
                    </button>
                </div>
                <Visualization
                    steps={visualizationData.steps}
                    originalArray={visualizationData.originalArray}
                    metadata={visualizationData.metadata}
                    algorithm={visualizationData.algorithm}
                    visualizationId={visualizationData.visualizationId || currentHistoryId}
                    onBack={handleBackToInput}
                />
            </div>
        );
    }

    return (
        <div
            className="min-h-screen relative"
            style={{
                background: "#fbeee0",
                fontFamily: "'IBM Plex Mono', 'Fira Mono', monospace"
            }}
        >
            {/* Welcome Toast Notification */}
            {showWelcome && user && (
                <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
                    <div className="bg-gradient-to-r from-[#27ae60] to-[#2ecc71] border-2 border-[#2d2d2d] rounded-lg px-6 py-3 shadow-[4px_4px_0_0_#2d2d2d] text-white font-bold">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">🎉</span>
                            <span
                                className="font-mono"
                                style={{
                                    fontFamily: "'Press Start 2P', 'IBM Plex Mono', monospace",
                                    letterSpacing: "1px"
                                }}
                            >
                                Welcome back, {user.username}!
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Restore Notification */}
            {showRestoreNotification && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
                    <div className="bg-gradient-to-r from-[#3498db] to-[#2980b9] border-2 border-[#2d2d2d] rounded-lg px-6 py-3 shadow-[4px_4px_0_0_#2d2d2d] text-white font-bold">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">🔄</span>
                            <span
                                className="font-mono text-sm"
                                style={{
                                    fontFamily: "'Press Start 2P', 'IBM Plex Mono', monospace",
                                    letterSpacing: "1px"
                                }}
                            >
                                Visualization restored!
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating User Card */}
            {user ? (
                <div className="fixed top-4 right-4 z-40 animate-fade-in">
                    <div
                        className="bg-gradient-to-br from-[#fff8f0] to-[#f0f8ff] border-2 border-[#2d2d2d] rounded-lg p-3 shadow-[4px_4px_0_0_#2d2d2d] w-[240px] hover:shadow-[3px_3px_0_0_#2d2d2d] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200"
                        style={{
                            background: "linear-gradient(135deg, #fff8f0 0%, #f8f9fa 50%, #e8f4fd 100%)"
                        }}
                    >
                        {/* User Header */}
                        <div className="flex items-center gap-2 mb-3">
                            <div className="relative">
                                <div className="w-10 h-10 bg-gradient-to-br from-[#e4572e] to-[#d63031] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-[2px_2px_0_0_#2d2d2d]">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#f1c40f] rounded-full flex items-center justify-center text-xs animate-pulse">
                                    ✨
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div
                                    className="text-sm font-bold text-[#2d2d2d] truncate"
                                    style={{
                                        fontFamily: "'Press Start 2P', 'IBM Plex Mono', monospace",
                                        letterSpacing: "0.5px"
                                    }}
                                >
                                    {user.username}
                                </div>
                                <div className="text-xs font-mono text-[#666]">
                                    Welcome back! 👋
                                </div>
                            </div>
                        </div>

                        {/* Stats Section */}
                        <div className="bg-white/60 rounded-lg p-2 mb-3 border border-[#2d2d2d]/10">
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="bg-[#e4572e]/10 rounded p-2">
                                    <div className="text-lg font-bold text-[#e4572e]">
                                        {user.statistics?.totalVisualizations || 0}
                                    </div>
                                    <div className="text-xs font-mono text-[#666]">Sorts</div>
                                </div>
                                <div className="bg-[#27ae60]/10 rounded p-2">
                                    <div className="text-lg font-bold text-[#27ae60]">
                                        {Math.round((user.statistics?.timeSpent || 0) / 60)}m
                                    </div>
                                    <div className="text-xs font-mono text-[#666]">Time</div>
                                </div>
                                <div
                                    className="bg-[#f1c40f]/10 rounded p-2 cursor-pointer hover:bg-[#f1c40f]/20 transition-colors"
                                    onClick={() => setShowFavorites(true)}
                                >
                                    <div className="text-lg font-bold text-[#f1c40f]">
                                        ⭐
                                    </div>
                                    <div className="text-xs font-mono text-[#666]">Favs</div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-1 mb-2">
                            <button
                                onClick={() => setShowHistory(true)}
                                className="px-2 py-1 border border-[#2d2d2d] rounded bg-[#3498db] text-white font-bold text-xs shadow-[1px_1px_0_0_#2d2d2d] hover:shadow-[0px_0px_0_0_#2d2d2d] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono"
                            >
                                📊 History
                            </button>
                            <button
                                onClick={() => setShowProfile(true)}
                                className="px-2 py-1 border border-[#2d2d2d] rounded bg-[#9b59b6] text-white font-bold text-xs shadow-[1px_1px_0_0_#2d2d2d] hover:shadow-[0px_0px_0_0_#2d2d2d] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono"
                            >
                                ⚙️ Profile
                            </button>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full px-2 py-1 border border-[#2d2d2d] rounded bg-[#e74c3c] text-white font-bold text-xs shadow-[1px_1px_0_0_#2d2d2d] hover:shadow-[0px_0px_0_0_#2d2d2d] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono"
                        >
                            🚪 Logout
                        </button>
                    </div>
                </div>
            ) : (
                /* Guest Login Card */
                <div className="fixed top-4 right-4 z-40 animate-fade-in">
                    <div className="bg-gradient-to-br from-[#fff8f0] to-[#f0f8ff] border-2 border-[#2d2d2d] rounded-lg p-3 shadow-[4px_4px_0_0_#2d2d2d] hover:shadow-[3px_3px_0_0_#2d2d2d] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 w-[200px]">
                        <div className="text-center">
                            {/* Icon */}
                            <div className="w-10 h-10 bg-gradient-to-br from-[#e4572e] to-[#d63031] rounded-full flex items-center justify-center text-white text-lg mx-auto mb-3 shadow-[2px_2px_0_0_#2d2d2d]">
                                🔒
                            </div>

                            {/* Message */}
                            <div className="mb-3">
                                <div className="text-xs font-bold text-[#2d2d2d] mb-2 font-mono">
                                    Join AlgoLearn!
                                </div>
                                <div className="text-xs font-mono text-[#666] leading-relaxed">
                                    📊 Track progress<br/>
                                    📈 View analytics
                                </div>
                            </div>

                            {/* Login Button */}
                            <button
                                onClick={() => setShowAuth(true)}
                                className="w-full px-3 py-2 border-2 border-[#2d2d2d] rounded bg-gradient-to-r from-[#e4572e] to-[#d63031] text-white font-bold text-xs shadow-[2px_2px_0_0_#2d2d2d] hover:shadow-[1px_1px_0_0_#2d2d2d] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200"
                                style={{
                                    fontFamily: "'Press Start 2P', 'IBM Plex Mono', monospace",
                                    letterSpacing: "0.5px"
                                }}
                            >
                                LOGIN
                            </button>

                            {/* Guest option */}
                            <div className="mt-2 text-xs font-mono text-[#888]">
                                or continue as guest
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="min-h-screen flex flex-col items-center justify-center px-4">
            <div
                className="w-full max-w-xl border-2 border-[#2d2d2d] rounded-lg p-8 shadow-[8px_8px_0_0_#2d2d2d] bg-[#fff8f0] flex flex-col gap-6"
                style={{
                    boxSizing: "border-box"
                }}
            >
                <h1
                    className="text-2xl font-bold mb-6 text-[#2d2d2d] tracking-tight text-center"
                    style={{
                        fontFamily: "'Press Start 2P', 'IBM Plex Mono', monospace",
                        letterSpacing: "1px"
                    }}
                >
                    SORTING VISUALIZER
                </h1>
                <label className="text-md font-bold text-[#2d2d2d] mb-0.5" htmlFor="array-input">
                    ARRAY (comma separated)
                </label>
                <input
                    id="array-input"
                    type="text"
                    value={arrayInput}
                    onChange={handleArrayChange}
                    placeholder="5, 3, 8, 1, 2"
                    className="w-full px-3 py-2 border-2 border-[#2d2d2d] rounded bg-[#fbeee0] text-[#2d2d2d] font-mono text-sm focus:outline-none focus:border-[#e4572e] transition"
                    style={{
                        boxShadow: "2px 2px 0 0 #2d2d2d"
                    }}
                />

                <label className="text-md font-bold text-[#2d2d2d] mb-0.5" htmlFor="algo-select">
                    ALGORITHM
                </label>
                <select
                    id="algo-select"
                    value={algorithm}
                    onChange={handleAlgorithmChange}
                    className="w-full px-3 py-2 border-2 border-[#2d2d2d] rounded bg-[#fbeee0] text-[#2d2d2d] font-mono text-xs focus:outline-none focus:border-[#e4572e] transition"
                    style={{
                        boxShadow: "2px 2px 0 0 #2d2d2d",
                        fontFamily: "'Press Start 2P', 'IBM Plex Mono', monospace",
                        letterSpacing: "1px",
                        appearance: "none", // removes default arrow for more retro look
                        WebkitAppearance: "none",
                        MozAppearance: "none",
                        backgroundImage:
                            "linear-gradient(45deg, #2d2d2d 25%, transparent 25%)," +
                            "linear-gradient(135deg, transparent 75%, #2d2d2d 75%)",
                        backgroundPosition: "calc(100% - 18px) calc(1em + 2px), calc(100% - 13px) calc(1em + 2px)",
                        backgroundSize: "5px 5px, 5px 5px",
                        backgroundRepeat: "no-repeat"
                    }}
                >
                    <option value="">-- SELECT --</option>
                    {algorithms.map((algo, index) => (
                        <option key={index} value={algo}>
                            {algo}
                        </option>
                    ))}
                </select>

                <button
                    onClick={handleSubmit}
                    className="mt-4 w-full py-2 border-2 border-[#2d2d2d] rounded bg-[#e4572e] text-white font-bold text-sm shadow-[2px_2px_0_0_#2d2d2d] hover:bg-[#fbeee0] hover:text-[#2d2d2d] transition"
                    style={{
                        fontFamily: "'Press Start 2P', 'IBM Plex Mono', monospace",
                        letterSpacing: "1px"
                    }}
                >
                    START
                </button>
            </div>
            <footer className="mt-10 text-xs text-[#2d2d2d] opacity-70 font-mono text-center">
                <div className="mb-2">
                    <span style={{ fontFamily: "'Press Start 2P', monospace" }}>© AlgoLearn 2025</span>
                </div>
                {user ? (
                    <div className="text-[#666]">
                        🎓 Happy learning, {user.username}! Your progress is automatically saved.
                    </div>
                ) : (
                    <div className="text-[#666]">
                        🚀 Create an account to save your sorting history and track progress!
                    </div>
                )}
            </footer>

            {/* Authentication Modal */}
            {showAuth && (
                <Auth
                    onAuthSuccess={handleAuthSuccess}
                    onClose={() => setShowAuth(false)}
                />
            )}

            {/* Profile Modal */}
            {showProfile && user && (
                <Profile
                    user={user}
                    onClose={() => setShowProfile(false)}
                    onUserUpdate={handleUserUpdate}
                />
            )}

            {/* History Modal */}
            {showHistory && (
                <History
                    onClose={() => setShowHistory(false)}
                    onVisualize={handleVisualizationFromData}
                />
            )}

            {/* Favorites Modal */}
            {showFavorites && (
                <Favorites
                    onClose={() => setShowFavorites(false)}
                    onVisualize={handleVisualizationFromData}
                />
            )}

            {/* Custom Animations */}
            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fade-in {
                    animation: fade-in 0.5s ease-out;
                }

                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-5px);
                    }
                }

                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
            `}</style>

            {/* Retro font imports */}
            <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&family=Press+Start+2P&display=swap" rel="stylesheet" />
            </div>
        </div>
    );
}

export default Input;