import React, { useState } from 'react';
import authService from '../services/authService';

function Auth({ onAuthSuccess, onClose }) {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '',
        firstName: '',
        lastName: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError(''); // Clear error when user types
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let result;
            if (isLogin) {
                result = await authService.login(formData.email, formData.password);
            } else {
                result = await authService.register(formData);
            }

            if (result.success) {
                onAuthSuccess(result.user);
            } else {
                setError(result.message);
            }
        } catch (error) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setFormData({
            email: '',
            password: '',
            username: '',
            firstName: '',
            lastName: ''
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#fff8f0] border-2 border-[#2d2d2d] rounded-lg p-8 shadow-[8px_8px_0_0_#2d2d2d] w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 
                        className="text-xl font-bold text-[#2d2d2d]"
                        style={{
                            fontFamily: "'Press Start 2P', 'IBM Plex Mono', monospace",
                            letterSpacing: "1px"
                        }}
                    >
                        {isLogin ? 'LOGIN' : 'REGISTER'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-[#2d2d2d] hover:text-[#e4572e] text-xl font-bold"
                    >
                        ×
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-[#ffebee] border-2 border-[#e74c3c] rounded text-[#e74c3c] text-sm font-mono">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-[#2d2d2d] mb-1 font-mono">
                                    USERNAME
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    required={!isLogin}
                                    className="w-full px-3 py-2 border-2 border-[#2d2d2d] rounded bg-white text-[#2d2d2d] font-mono focus:outline-none focus:border-[#e4572e]"
                                    placeholder="Enter username"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-bold text-[#2d2d2d] mb-1 font-mono">
                                        FIRST NAME
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border-2 border-[#2d2d2d] rounded bg-white text-[#2d2d2d] font-mono focus:outline-none focus:border-[#e4572e]"
                                        placeholder="First name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-[#2d2d2d] mb-1 font-mono">
                                        LAST NAME
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border-2 border-[#2d2d2d] rounded bg-white text-[#2d2d2d] font-mono focus:outline-none focus:border-[#e4572e]"
                                        placeholder="Last name"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-[#2d2d2d] mb-1 font-mono">
                            EMAIL
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border-2 border-[#2d2d2d] rounded bg-white text-[#2d2d2d] font-mono focus:outline-none focus:border-[#e4572e]"
                            placeholder="Enter email"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[#2d2d2d] mb-1 font-mono">
                            PASSWORD
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            minLength="6"
                            className="w-full px-3 py-2 border-2 border-[#2d2d2d] rounded bg-white text-[#2d2d2d] font-mono focus:outline-none focus:border-[#e4572e]"
                            placeholder="Enter password"
                        />
                        {!isLogin && (
                            <p className="text-xs text-[#666] mt-1 font-mono">
                                Minimum 6 characters
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-4 py-3 border-2 border-[#2d2d2d] rounded bg-[#e4572e] text-white font-bold text-sm shadow-[2px_2px_0_0_#2d2d2d] hover:bg-[#d63031] transition disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            fontFamily: "'Press Start 2P', 'IBM Plex Mono', monospace",
                            letterSpacing: "1px"
                        }}
                    >
                        {loading ? 'PROCESSING...' : (isLogin ? 'LOGIN' : 'REGISTER')}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-[#666] font-mono mb-2">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                    </p>
                    <button
                        onClick={toggleMode}
                        className="text-[#e4572e] hover:text-[#d63031] font-bold text-sm font-mono underline"
                    >
                        {isLogin ? 'CREATE ACCOUNT' : 'LOGIN HERE'}
                    </button>
                </div>

                <div className="mt-4 text-xs text-[#666] font-mono text-center">
                    <p>🔒 Your data is secure and private</p>
                    <p>📊 Track your sorting progress</p>
                </div>
            </div>
        </div>
    );
}

export default Auth;
