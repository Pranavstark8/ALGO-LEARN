import React, { useState } from 'react';
import authService from '../services/authService';

function Profile({ user, onClose, onUserUpdate }) {
    const [formData, setFormData] = useState({
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        bio: user.profile?.bio || '',
        theme: user.preferences?.theme || 'retro',
        animationSpeed: user.preferences?.animationSpeed || 1000,
        defaultView: user.preferences?.defaultView || 'tree'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await authService.updateProfile({
                firstName: formData.firstName,
                lastName: formData.lastName,
                bio: formData.bio,
                preferences: {
                    theme: formData.theme,
                    animationSpeed: parseInt(formData.animationSpeed),
                    defaultView: formData.defaultView
                }
            });

            if (result.success) {
                setSuccess('Profile updated successfully!');
                onUserUpdate(result.user);
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                setError(result.message);
            }
        } catch (error) {
            setError('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#fff8f0] border-2 border-[#2d2d2d] rounded-lg shadow-[8px_8px_0_0_#2d2d2d] w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b-2 border-[#2d2d2d]">
                    <h2 
                        className="text-lg font-bold text-[#2d2d2d]"
                        style={{
                            fontFamily: "'Press Start 2P', 'IBM Plex Mono', monospace",
                            letterSpacing: "1px"
                        }}
                    >
                        ⚙️ PROFILE
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-[#2d2d2d] hover:text-[#e4572e] text-xl font-bold"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {error && (
                        <div className="mb-4 p-3 bg-[#ffebee] border-2 border-[#e74c3c] rounded text-[#e74c3c] text-sm font-mono">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 bg-[#e8f5e8] border-2 border-[#27ae60] rounded text-[#27ae60] text-sm font-mono">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Personal Information */}
                        <div>
                            <h3 className="text-sm font-bold text-[#2d2d2d] mb-3 font-mono">
                                👤 Personal Information
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-bold text-[#2d2d2d] mb-1 font-mono">
                                        FIRST NAME
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        className="w-full px-2 py-1 border-2 border-[#2d2d2d] rounded bg-white text-[#2d2d2d] font-mono text-sm focus:outline-none focus:border-[#e4572e]"
                                        placeholder="First name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#2d2d2d] mb-1 font-mono">
                                        LAST NAME
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        className="w-full px-2 py-1 border-2 border-[#2d2d2d] rounded bg-white text-[#2d2d2d] font-mono text-sm focus:outline-none focus:border-[#e4572e]"
                                        placeholder="Last name"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Bio */}
                        <div>
                            <label className="block text-xs font-bold text-[#2d2d2d] mb-1 font-mono">
                                BIO
                            </label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full px-2 py-1 border-2 border-[#2d2d2d] rounded bg-white text-[#2d2d2d] font-mono text-sm focus:outline-none focus:border-[#e4572e] resize-none"
                                placeholder="Tell us about yourself..."
                            />
                        </div>

                        {/* Preferences */}
                        <div>
                            <h3 className="text-sm font-bold text-[#2d2d2d] mb-3 font-mono">
                                🎨 Preferences
                            </h3>
                            
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-[#2d2d2d] mb-1 font-mono">
                                        THEME
                                    </label>
                                    <select
                                        name="theme"
                                        value={formData.theme}
                                        onChange={handleInputChange}
                                        className="w-full px-2 py-1 border-2 border-[#2d2d2d] rounded bg-white text-[#2d2d2d] font-mono text-sm focus:outline-none focus:border-[#e4572e]"
                                    >
                                        <option value="retro">Retro</option>
                                        <option value="light">Light</option>
                                        <option value="dark">Dark</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[#2d2d2d] mb-1 font-mono">
                                        ANIMATION SPEED (ms)
                                    </label>
                                    <input
                                        type="range"
                                        name="animationSpeed"
                                        value={formData.animationSpeed}
                                        onChange={handleInputChange}
                                        min="200"
                                        max="3000"
                                        step="100"
                                        className="w-full"
                                    />
                                    <div className="text-xs font-mono text-[#666] text-center">
                                        {formData.animationSpeed}ms
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[#2d2d2d] mb-1 font-mono">
                                        DEFAULT VIEW
                                    </label>
                                    <select
                                        name="defaultView"
                                        value={formData.defaultView}
                                        onChange={handleInputChange}
                                        className="w-full px-2 py-1 border-2 border-[#2d2d2d] rounded bg-white text-[#2d2d2d] font-mono text-sm focus:outline-none focus:border-[#e4572e]"
                                    >
                                        <option value="tree">Tree View</option>
                                        <option value="linear">Linear View</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Account Info */}
                        <div className="bg-[#f8f9fa] border border-[#2d2d2d]/20 rounded p-3">
                            <h3 className="text-sm font-bold text-[#2d2d2d] mb-2 font-mono">
                                📧 Account Information
                            </h3>
                            <div className="space-y-1 text-xs font-mono text-[#666]">
                                <div><span className="font-bold">Username:</span> {user.username}</div>
                                <div><span className="font-bold">Email:</span> {user.email}</div>
                                <div><span className="font-bold">Member since:</span> {new Date(user.createdAt).toLocaleDateString()}</div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-4 py-2 border-2 border-[#2d2d2d] rounded bg-[#e4572e] text-white font-bold text-sm shadow-[2px_2px_0_0_#2d2d2d] hover:bg-[#d63031] transition disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                fontFamily: "'Press Start 2P', 'IBM Plex Mono', monospace",
                                letterSpacing: "1px"
                            }}
                        >
                            {loading ? 'UPDATING...' : 'UPDATE PROFILE'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Profile;
