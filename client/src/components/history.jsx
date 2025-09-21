import React, { useState, useEffect } from 'react';
import authService from '../services/authService';

function History({ onClose, onVisualize }) {
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        loadHistory();
        loadStats();
    }, [currentPage]);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const response = await authService.getSortHistory({
                page: currentPage,
                limit: 10,
                sortBy: 'createdAt',
                order: 'desc'
            });

            if (response.success) {
                setHistory(response.data.history);
                setTotalPages(response.data.pagination.totalPages);
            } else {
                setError(response.message);
            }
        } catch (error) {
            setError('Failed to load history');
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const response = await authService.getSortingStats();
            if (response.success) {
                setStats(response.data.statistics);
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    const handleToggleFavorite = async (historyId, currentFavoriteStatus) => {
        try {
            const response = await authService.toggleFavorite(historyId, !currentFavoriteStatus);
            if (response.success) {
                // Update the local state
                setHistory(history.map(entry =>
                    entry._id === historyId
                        ? { ...entry, isFavorite: !currentFavoriteStatus, favoriteAddedAt: !currentFavoriteStatus ? new Date() : null }
                        : entry
                ));
            } else {
                setError('Failed to update favorite status');
            }
        } catch (error) {
            setError('Failed to update favorite status');
        }
    };

    const handleDelete = async (historyId) => {
        if (!confirm('Are you sure you want to delete this sort history?')) {
            return;
        }

        try {
            const response = await authService.deleteSortHistory(historyId);
            if (response.success) {
                setHistory(history.filter(entry => entry._id !== historyId));
                // Reload stats to update counts
                loadStats();
            } else {
                setError('Failed to delete history entry');
            }
        } catch (error) {
            setError('Failed to delete history entry');
        }
    };

    const handleVisualize = (entry) => {
        // Convert history entry to visualization format
        const visualizationData = {
            steps: [], // Will be regenerated
            originalArray: entry.inputArray,
            algorithm: entry.algorithm === 'mergeSort' ? 'Merge Sort' :
                      entry.algorithm === 'quickSort' ? 'Quick Sort' : entry.algorithm,
            metadata: entry.metadata || {},
            fromHistory: true,
            historyId: entry._id
        };

        onVisualize(visualizationData);
        onClose();
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getAlgorithmColor = (algorithm) => {
        switch (algorithm) {
            case 'mergeSort': return '#e4572e';
            case 'quickSort': return '#9b59b6';
            default: return '#2d2d2d';
        }
    };

    const getAlgorithmName = (algorithm) => {
        switch (algorithm) {
            case 'mergeSort': return 'Merge Sort';
            case 'quickSort': return 'Quick Sort';
            default: return algorithm;
        }
    };

    if (loading && history.length === 0) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-[#fff8f0] border-2 border-[#2d2d2d] rounded-lg p-8 shadow-[8px_8px_0_0_#2d2d2d] w-full max-w-4xl max-h-[80vh] overflow-hidden">
                    <div className="text-center font-mono text-[#2d2d2d]">
                        Loading your sorting history...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#fff8f0] border-2 border-[#2d2d2d] rounded-lg shadow-[8px_8px_0_0_#2d2d2d] w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b-2 border-[#2d2d2d]">
                    <h2 
                        className="text-xl font-bold text-[#2d2d2d]"
                        style={{
                            fontFamily: "'Press Start 2P', 'IBM Plex Mono', monospace",
                            letterSpacing: "1px"
                        }}
                    >
                        📊 SORTING HISTORY
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-[#2d2d2d] hover:text-[#e4572e] text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>

                {error && (
                    <div className="mx-6 mt-4 p-3 bg-[#ffebee] border-2 border-[#e74c3c] rounded text-[#e74c3c] text-sm font-mono">
                        {error}
                    </div>
                )}

                {/* Statistics */}
                {stats && (
                    <div className="p-6 border-b-2 border-[#2d2d2d] bg-[#f8f9fa]">
                        <h3 className="text-lg font-bold text-[#2d2d2d] mb-4 font-mono">
                            📈 YOUR STATISTICS
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-mono">
                            <div className="text-center p-3 bg-white border border-[#2d2d2d] rounded">
                                <div className="text-2xl font-bold text-[#e4572e]">
                                    {stats.overall.totalSorts}
                                </div>
                                <div className="text-[#666]">Total Sorts</div>
                            </div>
                            <div className="text-center p-3 bg-white border border-[#2d2d2d] rounded">
                                <div className="text-2xl font-bold text-[#27ae60]">
                                    {stats.overall.completionRate}%
                                </div>
                                <div className="text-[#666]">Completion Rate</div>
                            </div>
                            <div className="text-center p-3 bg-white border border-[#2d2d2d] rounded">
                                <div className="text-2xl font-bold text-[#3498db]">
                                    {Math.round(stats.overall.totalTimeSpent / 60)}m
                                </div>
                                <div className="text-[#666]">Time Spent</div>
                            </div>
                            <div className="text-center p-3 bg-white border border-[#2d2d2d] rounded">
                                <div className="text-2xl font-bold text-[#9b59b6]">
                                    {stats.overall.averageArraySize}
                                </div>
                                <div className="text-[#666]">Avg Array Size</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* History List */}
                <div className="flex-1 overflow-y-auto p-6">
                    {history.length === 0 ? (
                        <div className="text-center py-12 font-mono text-[#666]">
                            <div className="text-4xl mb-4">📋</div>
                            <div className="text-lg mb-2">No sorting history yet</div>
                            <div className="text-sm">Start sorting to see your progress here!</div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {history.map((entry) => (
                                <div
                                    key={entry._id}
                                    className="bg-white border-2 border-[#2d2d2d] rounded-lg p-4 shadow-[2px_2px_0_0_#2d2d2d] hover:shadow-[4px_4px_0_0_#2d2d2d] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all cursor-pointer"
                                    onClick={() => handleVisualize(entry)}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="px-3 py-1 rounded text-white text-sm font-bold font-mono"
                                                style={{ backgroundColor: getAlgorithmColor(entry.algorithm) }}
                                            >
                                                {getAlgorithmName(entry.algorithm)}
                                            </div>
                                            <div className="text-sm font-mono text-[#666]">
                                                {formatDate(entry.createdAt)}
                                            </div>
                                            {entry.isFavorite && (
                                                <div className="text-yellow-500 text-lg">⭐</div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleVisualize(entry);
                                                }}
                                                className="px-2 py-1 text-xs border border-[#2d2d2d] rounded bg-[#3498db] text-white hover:bg-[#2980b9] font-mono"
                                            >
                                                ▶️ Play
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggleFavorite(entry._id, entry.isFavorite);
                                                }}
                                                className={`px-2 py-1 text-xs border border-[#2d2d2d] rounded font-mono ${
                                                    entry.isFavorite
                                                        ? 'bg-[#f1c40f] text-[#2d2d2d] hover:bg-[#f39c12]'
                                                        : 'bg-white text-[#2d2d2d] hover:bg-[#f0f0f0]'
                                                }`}
                                            >
                                                {entry.isFavorite ? '⭐ Unfav' : '☆ Fav'}
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(entry._id);
                                                }}
                                                className="px-2 py-1 text-xs border border-[#2d2d2d] rounded bg-[#e74c3c] text-white hover:bg-[#c0392b] font-mono"
                                            >
                                                🗑️ Delete
                                            </button>
                                            <div className="text-right text-sm font-mono ml-2">
                                                <div className="text-[#2d2d2d] font-bold">
                                                    {entry.totalSteps} steps
                                                </div>
                                                <div className="text-[#666]">
                                                    {entry.executionTime}ms
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-mono">
                                        <div>
                                            <span className="text-[#666]">Array:</span>
                                            <div className="font-bold text-[#2d2d2d]">
                                                [{entry.inputArray.join(', ')}]
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-[#666]">Size:</span>
                                            <div className="font-bold text-[#2d2d2d]">
                                                {entry.arraySize} elements
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-[#666]">Comparisons:</span>
                                            <div className="font-bold text-[#2d2d2d]">
                                                {entry.metadata?.comparisons || 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-[#666]">Swaps:</span>
                                            <div className="font-bold text-[#2d2d2d]">
                                                {entry.metadata?.swaps || 'N/A'}
                                            </div>
                                        </div>
                                    </div>

                                    {entry.notes && (
                                        <div className="mt-3 p-2 bg-[#f8f9fa] border border-[#ddd] rounded text-sm font-mono">
                                            <span className="text-[#666]">Notes:</span> {entry.notes}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-6 border-t-2 border-[#2d2d2d] bg-[#f8f9fa]">
                        <div className="flex justify-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border border-[#2d2d2d] rounded bg-white text-[#2d2d2d] hover:bg-[#f0f0f0] disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
                            >
                                ← Prev
                            </button>
                            <span className="px-3 py-1 font-mono text-sm text-[#2d2d2d]">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 border border-[#2d2d2d] rounded bg-white text-[#2d2d2d] hover:bg-[#f0f0f0] disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default History;
