// Supabase Client Configuration
class SupabaseClient {
    constructor() {
        // Vercelの本番環境APIエンドポイント
        this.apiBase = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000/api'
            : '/api';
        
        this.token = localStorage.getItem('auth_token');
    }

    async apiCall(endpoint, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        
        // 最新のトークンを取得
        this.token = localStorage.getItem('auth_token');
        
        if (this.token) {
            defaultOptions.headers['Authorization'] = `Bearer ${this.token}`;
            console.log('Using token:', this.token.substring(0, 20) + '...');
        } else {
            console.log('No token available');
        }
        
        const url = this.apiBase + endpoint;
        console.log('API Call:', url, 'Method:', options.method || 'GET');
        
        try {
            const response = await fetch(url, {
                ...defaultOptions,
                ...options,
                headers: {
                    ...defaultOptions.headers,
                    ...options.headers,
                },
            });
            
            console.log('API Response:', response.status, response.statusText);
            
            if (!response.ok && response.status === 401) {
                console.error('Token expired or invalid');
                // トークンが無効な場合、ログアウト処理
                localStorage.removeItem('auth_token');
                localStorage.removeItem('current_user');
                this.token = null;
                // ログインページへリダイレクトを検討
                if (window.app && typeof window.app.showAuthModal === 'function') {
                    window.app.showAuthModal('login');
                }
            }
            
            return response;
        } catch (error) {
            console.error('API Call Failed:', {
                endpoint,
                error: error.message,
                url
            });
            throw error;
        }
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('auth_token', token);
        } else {
            localStorage.removeItem('auth_token');
        }
    }

    async login(email, password) {
        const response = await this.apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        
        const data = await response.json();
        if (response.ok && data.token) {
            this.setToken(data.token);
        }
        
        return { response, data };
    }

    async signup(userData) {
        const response = await this.apiCall('/auth/signup', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
        
        const data = await response.json();
        if (response.ok && data.token) {
            this.setToken(data.token);
        }
        
        return { response, data };
    }

    async getCurrentUser() {
        if (!this.token) {
            console.log('getCurrentUser: No token available');
            return null;
        }
        
        try {
            const response = await this.apiCall('/auth/user');
            if (response.ok) {
                const userData = await response.json();
                console.log('getCurrentUser success:', userData);
                return userData;
            } else {
                console.error('getCurrentUser failed:', response.status);
                const errorText = await response.text();
                console.error('Error response:', errorText);
                return null;
            }
        } catch (error) {
            console.error('getCurrentUser error:', error);
            return null;
        }
    }

    async createFanclub(fanclubData) {
        console.log('Creating fanclub with data:', fanclubData);
        console.log('Current token:', this.token ? 'Present' : 'Missing');
        
        if (!this.token) {
            console.error('No authentication token for fanclub creation');
            throw new Error('Authentication required');
        }
        
        try {
            const response = await this.apiCall('/fanclubs', {
                method: 'POST',
                body: JSON.stringify(fanclubData),
            });
            
            if (!response.ok) {
                const errorData = await response.text();
                console.error('Fanclub creation failed:', response.status, errorData);
            }
            
            return response;
        } catch (error) {
            console.error('Fanclub creation error:', error);
            throw error;
        }
    }

    async getFanclubs() {
        return await this.apiCall('/fanclubs');
    }

    async getFanclub(id) {
        return await this.apiCall(`/fanclubs/${id}`);
    }

    async joinFanclub(fanclubId) {
        return await this.apiCall(`/fanclubs/${fanclubId}/join`, {
            method: 'POST',
        });
    }

    async leaveFanclub(fanclubId) {
        return await this.apiCall(`/fanclubs/${fanclubId}/leave`, {
            method: 'DELETE',
        });
    }

    async getJoinedFanclubs() {
        return await this.apiCall('/fanclubs/joined');
    }

    async createPost(fanclubId, postData) {
        return await this.apiCall(`/fanclubs/${fanclubId}/posts`, {
            method: 'POST',
            body: JSON.stringify(postData),
        });
    }

    async getPosts(fanclubId) {
        return await this.apiCall(`/fanclubs/${fanclubId}/posts`);
    }

    async likePost(postId) {
        return await this.apiCall(`/posts/${postId}/like`, {
            method: 'POST',
        });
    }

    async unlikePost(postId) {
        return await this.apiCall(`/posts/${postId}/unlike`, {
            method: 'DELETE',
        });
    }

    async sendChatMessage(fanclubId, message) {
        return await this.apiCall(`/fanclubs/${fanclubId}/chat`, {
            method: 'POST',
            body: JSON.stringify({ message }),
        });
    }

    async getChatMessages(fanclubId, lastMessageId = null) {
        const query = lastMessageId ? `?last_id=${lastMessageId}` : '';
        return await this.apiCall(`/fanclubs/${fanclubId}/chat${query}`);
    }

    async uploadImage(file) {
        const formData = new FormData();
        formData.append('image', file);
        
        return await fetch(`${this.apiBase}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`,
            },
            body: formData,
        });
    }

    async updatePassword(currentPassword, newPassword) {
        return await this.apiCall('/auth/update-password', {
            method: 'POST',
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword,
            }),
        });
    }

    async checkMembershipStatus(fanclubId) {
        const response = await this.apiCall(`/fanclubs/${fanclubId}/membership`);
        if (response.ok) {
            const data = await response.json();
            return data.is_member;
        }
        return false;
    }
}

// Export for use in script.js
window.SupabaseClient = SupabaseClient;