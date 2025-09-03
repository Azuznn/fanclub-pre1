// Mock Supabase Client for testing and development
// This provides working functionality while the real Supabase connection is being configured

class MockSupabaseClient {
    constructor() {
        this.token = localStorage.getItem('auth_token');
        this.mockFanclubs = JSON.parse(localStorage.getItem('mock_fanclubs_db') || '[]');
        this.mockUsers = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
        this.mockPosts = JSON.parse(localStorage.getItem('mock_posts_db') || '{}');
        this.mockChats = JSON.parse(localStorage.getItem('mock_chats_db') || '{}');
        this.mockMemberships = JSON.parse(localStorage.getItem('mock_memberships_db') || '{}');
        
        // Initialize with demo data if empty
        this.initializeDefaultData();
    }

    initializeDefaultData() {
        // Create default demo fanclub if none exist
        if (this.mockFanclubs.length === 0) {
            const demoFanclub = {
                id: 'demo-fanclub-1',
                name: 'クリエイター太郎のアトリエ',
                description: 'イラスト制作の過程や限定コンテンツを共有するファンクラブです。創作活動を応援してくださる皆様と一緒に、素敵な作品を作っていきたいと思います！',
                monthly_fee: 1200,
                purpose: 'イラスト制作活動の支援とファン同士の交流促進',
                cover_image_url: 'https://via.placeholder.com/1200x400/FF8C9F/white?text=Creative+Studio',
                owner_id: 'demo-user-1',
                owner_name: 'クリエイター太郎',
                member_count: 5,
                created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                updated_at: new Date().toISOString()
            };
            
            this.mockFanclubs.push(demoFanclub);
            localStorage.setItem('mock_fanclubs_db', JSON.stringify(this.mockFanclubs));
            
            // Create demo posts
            const demoPosts = [
                {
                    id: 'demo-post-1',
                    fanclub_id: 'demo-fanclub-1',
                    author_id: 'demo-user-1',
                    author_name: 'クリエイター太郎',
                    title: 'ファンクラブ開設のお知らせ',
                    content: 'この度、ファンクラブを開設いたしました！制作過程の共有や限定コンテンツをお楽しみください。',
                    excerpt: 'ファンクラブ開設のお知らせです',
                    featured_image_url: 'https://via.placeholder.com/600x300/01D3D9/white?text=Welcome',
                    visibility: 'public',
                    like_count: 3,
                    is_liked: false,
                    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 'demo-post-2',
                    fanclub_id: 'demo-fanclub-1',
                    author_id: 'demo-user-1',
                    author_name: 'クリエイター太郎',
                    title: '新作イラスト制作開始！',
                    content: '新しいプロジェクト「桜の下で読書する少女」の制作を開始します。制作過程を段階的に公開予定！',
                    excerpt: '新作制作開始のお知らせ',
                    featured_image_url: 'https://via.placeholder.com/600x300/FF8C9F/white?text=New+Project',
                    visibility: 'members',
                    like_count: 7,
                    is_liked: false,
                    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
                }
            ];
            
            this.mockPosts['demo-fanclub-1'] = demoPosts;
            localStorage.setItem('mock_posts_db', JSON.stringify(this.mockPosts));
            
            // Create demo chat messages
            const demoChatMessages = [
                {
                    id: 'chat-1',
                    user_id: 'system',
                    user_name: 'システム',
                    message: 'ファンクラブチャットへようこそ！',
                    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString()
                },
                {
                    id: 'chat-2',
                    user_id: 'demo-user-1',
                    user_name: 'クリエイター太郎',
                    message: 'みなさん、よろしくお願いします！',
                    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
                }
            ];
            
            this.mockChats['demo-fanclub-1'] = demoChatMessages;
            localStorage.setItem('mock_chats_db', JSON.stringify(this.mockChats));
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
        console.log('Mock login attempt:', email);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Load users from localStorage first
        const savedUsers = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
        this.mockUsers = { ...this.mockUsers, ...savedUsers };
        
        // Check mock users and default test users
        const defaultUsers = {
            'test@example.com': { password: 'password', name: 'テストユーザー', id: 'test-1', nickname: 'テストユーザー' },
            'admin@fanclub.com': { password: 'admin123', name: '管理者', id: 'admin-1', nickname: '管理者' },
            'user@demo.jp': { password: 'demo', name: 'デモユーザー', id: 'demo-1', nickname: 'デモユーザー' }
        };
        
        const allUsers = { ...defaultUsers, ...this.mockUsers };
        const user = allUsers[email];
        
        console.log('Available users:', Object.keys(allUsers));
        console.log('Looking for user:', email);
        
        if (user && user.password === password) {
            const token = 'mock_token_' + Date.now();
            this.setToken(token);
            
            const userData = {
                id: user.id,
                email: email,
                nickname: user.nickname || user.name,
                name: user.name,
                phone: user.phone || ''
            };
            
            return {
                response: { ok: true },
                data: {
                    token: token,
                    user: userData
                }
            };
        } else {
            return {
                response: { ok: false },
                data: { error: 'メールアドレスまたはパスワードが間違っています' }
            };
        }
    }

    async signup(userData) {
        console.log('Mock signup attempt:', userData);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { nickname, email, phone, password } = userData;
        
        // Load existing users from localStorage
        const savedUsers = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
        this.mockUsers = { ...this.mockUsers, ...savedUsers };
        
        // Check default users too
        const defaultUsers = {
            'test@example.com': { password: 'password', name: 'テストユーザー', id: 'test-1', nickname: 'テストユーザー' },
            'admin@fanclub.com': { password: 'admin123', name: '管理者', id: 'admin-1', nickname: '管理者' },
            'user@demo.jp': { password: 'demo', name: 'デモユーザー', id: 'demo-1', nickname: 'デモユーザー' }
        };
        
        // Check if user already exists
        if (this.mockUsers[email] || defaultUsers[email]) {
            return {
                response: { ok: false },
                data: { error: 'このメールアドレスは既に登録されています' }
            };
        }
        
        // Create new user
        const newUser = {
            id: 'user_' + Date.now(),
            nickname,
            name: nickname,
            email,
            phone,
            password,
            created_at: new Date().toISOString()
        };
        
        this.mockUsers[email] = newUser;
        localStorage.setItem('mock_users_db', JSON.stringify(this.mockUsers));
        
        // Auto login
        const token = 'mock_token_' + Date.now();
        this.setToken(token);
        
        return {
            response: { ok: true },
            data: {
                token: token,
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    nickname: newUser.nickname,
                    name: newUser.name,
                    phone: newUser.phone
                }
            }
        };
    }

    async getCurrentUser() {
        if (!this.token) {
            return null;
        }
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Return user data from localStorage
        const savedUser = localStorage.getItem('current_user');
        if (savedUser) {
            return JSON.parse(savedUser);
        }
        
        return null;
    }

    async getFanclubs() {
        console.log('Mock getFanclubs called');
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Refresh from localStorage
        this.mockFanclubs = JSON.parse(localStorage.getItem('mock_fanclubs_db') || '[]');
        
        return {
            ok: true,
            json: async () => this.mockFanclubs
        };
    }

    async getFanclub(id) {
        console.log('Mock getFanclub called with ID:', id);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const fanclub = this.mockFanclubs.find(f => f.id == id);
        
        if (fanclub) {
            return {
                ok: true,
                json: async () => fanclub
            };
        } else {
            return {
                ok: false,
                status: 404,
                json: async () => ({ error: 'ファンクラブが見つかりません' })
            };
        }
    }

    async createFanclub(fanclubData) {
        console.log('Mock createFanclub called with:', fanclubData);
        
        if (!this.token) {
            return {
                ok: false,
                json: async () => ({ error: 'Authentication required' })
            };
        }
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
        
        const newFanclub = {
            id: 'fanclub_' + Date.now(),
            name: fanclubData.name,
            description: fanclubData.description,
            monthly_fee: fanclubData.monthly_fee || 0,
            purpose: fanclubData.purpose,
            cover_image_url: fanclubData.cover_image_url || 'https://via.placeholder.com/1200x400/01D3D9/white?text=' + encodeURIComponent(fanclubData.name),
            owner_id: currentUser.id,
            owner_name: currentUser.nickname || currentUser.name,
            member_count: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        this.mockFanclubs.push(newFanclub);
        localStorage.setItem('mock_fanclubs_db', JSON.stringify(this.mockFanclubs));
        
        // Initialize empty posts and chat for new fanclub
        this.mockPosts[newFanclub.id] = [];
        this.mockChats[newFanclub.id] = [];
        localStorage.setItem('mock_posts_db', JSON.stringify(this.mockPosts));
        localStorage.setItem('mock_chats_db', JSON.stringify(this.mockChats));
        
        // Add creator as member
        if (!this.mockMemberships[newFanclub.id]) {
            this.mockMemberships[newFanclub.id] = [];
        }
        this.mockMemberships[newFanclub.id].push({
            user_id: currentUser.id,
            user_name: currentUser.nickname || currentUser.name,
            joined_at: new Date().toISOString(),
            role: 'owner'
        });
        localStorage.setItem('mock_memberships_db', JSON.stringify(this.mockMemberships));
        
        return {
            ok: true,
            json: async () => newFanclub
        };
    }

    async getPosts(fanclubId) {
        console.log('Mock getPosts called for fanclub:', fanclubId);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const posts = this.mockPosts[fanclubId] || [];
        
        return {
            ok: true,
            json: async () => posts
        };
    }

    async createPost(fanclubId, postData) {
        console.log('Mock createPost called:', fanclubId, postData);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
        
        const newPost = {
            id: 'post_' + Date.now(),
            fanclub_id: fanclubId,
            author_id: currentUser.id,
            author_name: currentUser.nickname || currentUser.name,
            title: postData.title,
            content: postData.content,
            excerpt: postData.excerpt,
            featured_image_url: postData.featured_image_url,
            visibility: postData.visibility || 'public',
            like_count: 0,
            is_liked: false,
            created_at: new Date().toISOString()
        };
        
        if (!this.mockPosts[fanclubId]) {
            this.mockPosts[fanclubId] = [];
        }
        
        this.mockPosts[fanclubId].push(newPost);
        localStorage.setItem('mock_posts_db', JSON.stringify(this.mockPosts));
        
        return {
            ok: true,
            json: async () => newPost
        };
    }

    async getChatMessages(fanclubId) {
        console.log('Mock getChatMessages called for fanclub:', fanclubId);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const messages = this.mockChats[fanclubId] || [];
        
        return {
            ok: true,
            json: async () => messages
        };
    }

    async sendChatMessage(fanclubId, message) {
        console.log('Mock sendChatMessage called:', fanclubId, message);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
        
        const newMessage = {
            id: 'msg_' + Date.now(),
            user_id: currentUser.id,
            user_name: currentUser.nickname || currentUser.name,
            message: message,
            created_at: new Date().toISOString()
        };
        
        if (!this.mockChats[fanclubId]) {
            this.mockChats[fanclubId] = [];
        }
        
        this.mockChats[fanclubId].push(newMessage);
        localStorage.setItem('mock_chats_db', JSON.stringify(this.mockChats));
        
        return {
            ok: true,
            json: async () => ({ success: true })
        };
    }

    async joinFanclub(fanclubId) {
        console.log('Mock joinFanclub called:', fanclubId);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 400));
        
        const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
        
        // Add to memberships
        if (!this.mockMemberships[fanclubId]) {
            this.mockMemberships[fanclubId] = [];
        }
        
        // Check if already a member
        const isAlreadyMember = this.mockMemberships[fanclubId].some(m => m.user_id === currentUser.id);
        if (isAlreadyMember) {
            return {
                ok: false,
                json: async () => ({ error: '既にメンバーです' })
            };
        }
        
        this.mockMemberships[fanclubId].push({
            user_id: currentUser.id,
            user_name: currentUser.nickname || currentUser.name,
            joined_at: new Date().toISOString(),
            role: 'member'
        });
        localStorage.setItem('mock_memberships_db', JSON.stringify(this.mockMemberships));
        
        // Update member count
        const fanclub = this.mockFanclubs.find(f => f.id == fanclubId);
        if (fanclub) {
            fanclub.member_count++;
            localStorage.setItem('mock_fanclubs_db', JSON.stringify(this.mockFanclubs));
        }
        
        return {
            ok: true,
            json: async () => ({ message: 'ファンクラブに参加しました！' })
        };
    }

    async leaveFanclub(fanclubId) {
        console.log('Mock leaveFanclub called:', fanclubId);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 400));
        
        const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
        
        if (this.mockMemberships[fanclubId]) {
            this.mockMemberships[fanclubId] = this.mockMemberships[fanclubId].filter(m => m.user_id !== currentUser.id);
            localStorage.setItem('mock_memberships_db', JSON.stringify(this.mockMemberships));
        }
        
        // Update member count
        const fanclub = this.mockFanclubs.find(f => f.id == fanclubId);
        if (fanclub) {
            fanclub.member_count = Math.max(0, fanclub.member_count - 1);
            localStorage.setItem('mock_fanclubs_db', JSON.stringify(this.mockFanclubs));
        }
        
        return {
            ok: true,
            json: async () => ({ message: 'ファンクラブから退会しました' })
        };
    }

    async getJoinedFanclubs() {
        console.log('Mock getJoinedFanclubs called');
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
        const joinedFanclubs = [];
        
        // Find fanclubs where user is a member
        for (const [fanclubId, members] of Object.entries(this.mockMemberships)) {
            if (members.some(m => m.user_id === currentUser.id)) {
                const fanclub = this.mockFanclubs.find(f => f.id == fanclubId);
                if (fanclub) {
                    joinedFanclubs.push(fanclub);
                }
            }
        }
        
        return {
            ok: true,
            json: async () => joinedFanclubs
        };
    }

    async checkMembershipStatus(fanclubId) {
        const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
        
        if (!this.mockMemberships[fanclubId]) {
            return false;
        }
        
        return this.mockMemberships[fanclubId].some(m => m.user_id === currentUser.id);
    }

    async updatePassword(currentPassword, newPassword) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 600));
        
        return {
            ok: true,
            json: async () => ({ message: 'パスワードが変更されました' })
        };
    }

    async uploadImage(file) {
        // Simulate image upload
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const fakeUrl = `https://via.placeholder.com/600x400/01D3D9/white?text=${encodeURIComponent(file.name)}`;
        
        return {
            ok: true,
            json: async () => ({ url: fakeUrl })
        };
    }
}

// Export for use in script.js
window.MockSupabaseClient = MockSupabaseClient;