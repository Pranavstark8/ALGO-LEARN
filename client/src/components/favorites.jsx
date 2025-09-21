import React, { useState, useEffect } from 'react';
import authService from '../services/authService';

function Favorites({ onClose, onVisualize }) {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        setLoading(true);
        try {
            const response = await authService.getFavoriteSorts(20);
            if (response.success) {
                setFavorites(response.data.favorites);
            } else {
                setError(response.message);
            }
        } catch (error) {
            setError('Failed to load favorites');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFavorite = async (historyId) => {
        try {
            const response = await authService.toggleFavorite(historyId, false);
            if (response.success) {
                setFavorites(favorites.filter(fav => fav._id !== historyId));
            } else {
                setError('Failed to remove from favorites');
            }
        } catch (error) {
            setError('Failed to remove from favorites');
        }
    };

    const handleVisualize = (favorite) => {
        // Convert favorite data to visualization format
        const visualizationData = {
            steps: [], // Will be regenerated
            originalArray: favorite.inputArray,
            algorithm: favorite.algorithm === 'mergeSort' ? 'Merge Sort' : 
                      favorite.algorithm === 'quickSort' ? 'Quick Sort' : favorite.algorithm,
            metadata: favorite.metadata || {},
            fromFavorite: true,
            favoriteId: favorite._id
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

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-[#fff8f0] border-2 border-[#2d2d2d] rounded-lg p-8 shadow-[8px_8px_0_0_#2d2d2d] w-full max-w-2xl">
                    <div className="text-center font-mono text-[#2d2d2d]">
                        Loading your favorite sorts...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#fff8f0] border-2 border-[#2d2d2d] rounded-lg shadow-[8px_8px_0_0_#2d2d2d] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b-2 border-[#2d2d2d]">
                    <h2 
                        className="text-xl font-bold text-[#2d2d2d]"
                        style={{
                            fontFamily: "'Press Start 2P', 'IBM Plex Mono', monospace",
                            letterSpacing: "1px"
                        }}
                    >
                        ⭐ FAVORITE SORTS
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

                {/* Favorites List */}
                <div className="flex-1 overflow-y-auto p-6">
                    {favorites.length === 0 ? (
                        <div className="text-center py-12 font-mono text-[#666]">
                            <div className="text-4xl mb-4">⭐</div>
                            <div className="text-lg mb-2">No favorite sorts yet</div>
                            <div className="text-sm">Mark sorts as favorites to see them here!</div>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {favorites.map((favorite) => (
                                <div 
                                    key={favorite._id}
                                    className="bg-white border-2 border-[#2d2d2d] rounded-lg p-4 shadow-[2px_2px_0_0_#2d2d2d] hover:shadow-[4px_4px_0_0_#2d2d2d] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all cursor-pointer"
                                    onClick={() => handleVisualize(favorite)}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div 
                                                className="px-3 py-1 rounded text-white text-sm font-bold font-mono"
                                                style={{ backgroundColor: getAlgorithmColor(favorite.algorithm) }}
                                            >
                                                {getAlgorithmName(favorite.algorithm)}
                                            </div>
                                            <div className="text-sm font-mono text-[#666]">
                                                {formatDate(favorite.favoriteAddedAt || favorite.createdAt)}
                                            </div>
                                            <div className="text-yellow-500 text-lg">⭐</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleVisualize(favorite);
                                                }}
                                                className="px-2 py-1 text-xs border border-[#2d2d2d] rounded bg-[#3498db] text-white hover:bg-[#2980b9] font-mono"
                                            >
                                                ▶️ Play
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveFavorite(favorite._id);
                                                }}
                                                className="px-2 py-1 text-xs border border-[#2d2d2d] rounded bg-[#e74c3c] text-white hover:bg-[#c0392b] font-mono"
                                            >
                                                🗑️ Remove
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-mono">
                                        <div>
                                            <span className="text-[#666]">Array:</span>
                                            <div className="font-bold text-[#2d2d2d]">
                                                [{favorite.inputArray.join(', ')}]
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-[#666]">Size:</span>
                                            <div className="font-bold text-[#2d2d2d]">
                                                {favorite.arraySize} elements
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-[#666]">Steps:</span>
                                            <div className="font-bold text-[#2d2d2d]">
                                                {favorite.totalSteps}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-[#666]">Time:</span>
                                            <div className="font-bold text-[#2d2d2d]">
                                                {favorite.executionTime}ms
                                            </div>
                                        </div>
                                    </div>

                                    {favorite.notes && (
                                        <div className="mt-3 p-2 bg-[#f8f9fa] border border-[#ddd] rounded text-sm font-mono">
                                            <span className="text-[#666]">Notes:</span> {favorite.notes}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Favorites;
