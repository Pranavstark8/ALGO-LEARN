// Authentication service for managing user authentication
class AuthService {
    constructor() {
        this.baseURL = 'http://localhost:5001/api';
        this.tokenKey = 'algolearn_token';
        this.userKey = 'algolearn_user';
    }

    // Get stored token
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    // Get stored user
    getUser() {
        const userStr = localStorage.getItem(this.userKey);
        return userStr ? JSON.parse(userStr) : null;
    }

    // Check if user is authenticated
    isAuthenticated() {
        const token = this.getToken();
        const user = this.getUser();
        return !!(token && user);
    }

    // Set authentication data
    setAuth(token, user) {
        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem(this.userKey, JSON.stringify(user));
    }

    // Clear authentication data
    clearAuth() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
    }

    // Get authorization headers
    getAuthHeaders() {
        const token = this.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    // Register new user
    async register(userData) {
        try {
            const response = await fetch(`${this.baseURL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (data.success) {
                this.setAuth(data.data.token, data.data.user);
                return { success: true, user: data.data.user };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: 'Registration failed. Please try again.' };
        }
    }

    // Login user
    async login(email, password) {
        try {
            const response = await fetch(`${this.baseURL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                this.setAuth(data.data.token, data.data.user);
                return { success: true, user: data.data.user };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Login failed. Please try again.' };
        }
    }

    // Logout user
    async logout() {
        try {
            const response = await fetch(`${this.baseURL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                }
            });

            this.clearAuth();
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            this.clearAuth(); // Clear local storage anyway
            return { success: true };
        }
    }

    // Get current user profile
    async getProfile() {
        try {
            const response = await fetch(`${this.baseURL}/auth/me`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                }
            });

            const data = await response.json();

            if (data.success) {
                // Update stored user data
                this.setAuth(this.getToken(), data.data.user);
                return { success: true, user: data.data.user };
            } else {
                if (response.status === 401) {
                    this.clearAuth(); // Token is invalid
                }
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Get profile error:', error);
            return { success: false, message: 'Failed to get profile' };
        }
    }

    // Update user profile
    async updateProfile(profileData) {
        try {
            const response = await fetch(`${this.baseURL}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                },
                body: JSON.stringify(profileData)
            });

            const data = await response.json();

            if (data.success) {
                this.setAuth(this.getToken(), data.data.user);
                return { success: true, user: data.data.user };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Update profile error:', error);
            return { success: false, message: 'Failed to update profile' };
        }
    }

    // Save sort history
    async saveSortHistory(historyData) {
        try {
            const response = await fetch(`${this.baseURL}/history`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                },
                body: JSON.stringify(historyData)
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Save history error:', error);
            return { success: false, message: 'Failed to save history' };
        }
    }

    // Get sort history
    async getSortHistory(params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const url = `${this.baseURL}/history${queryString ? `?${queryString}` : ''}`;

            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                }
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Get history error:', error);
            return { success: false, message: 'Failed to get history' };
        }
    }

    // Get favorite sorts
    async getFavoriteSorts(limit = 10) {
        try {
            const response = await fetch(`${this.baseURL}/history/favorites?limit=${limit}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                }
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Get favorites error:', error);
            return { success: false, message: 'Failed to get favorites' };
        }
    }

    // Get sorting statistics
    async getSortingStats() {
        try {
            const response = await fetch(`${this.baseURL}/history/stats`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                }
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Get stats error:', error);
            return { success: false, message: 'Failed to get statistics' };
        }
    }

    // Update sort history entry
    async updateSortHistory(historyId, updateData) {
        try {
            const response = await fetch(`${this.baseURL}/history/${historyId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                },
                body: JSON.stringify(updateData)
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Update history error:', error);
            return { success: false, message: 'Failed to update history' };
        }
    }

    // Toggle favorite status of a sort
    async toggleFavorite(historyId, isFavorite) {
        return await this.updateSortHistory(historyId, { isFavorite });
    }

    // Delete sort history entry
    async deleteSortHistory(historyId) {
        try {
            const response = await fetch(`${this.baseURL}/history/${historyId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                }
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Delete history error:', error);
            return { success: false, message: 'Failed to delete history entry' };
        }
    }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;
