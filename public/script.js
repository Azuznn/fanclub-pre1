class FanClubApp {
    constructor() {
        this.currentUser = null;
        this.currentFanclub = null;
        this.token = localStorage.getItem('auth_token');
        // Vercel環境対応: 本番環境では絶対URLを使用
        this.apiBase = window.location.hostname === 'localhost' ? '/api' : `${window.location.origin}/api`;
        
        // Rich text editors
        this.initialPostEditor = null;
        this.postContentEditor = null;
        
        this.init();
    }

    async init() {
        console.log('App init started');
        
        // モーダルを確実に非表示にする
        const authModal = document.getElementById('authModal');
        if (authModal) {
            authModal.classList.remove('show');
            console.log('Modal hidden on init');
        }
        
        this.setupEventListeners();
        this.initializeRichEditors();
        
        // 初期状態でログイン状態をチェック
        if (this.token) {
            await this.checkAuthStatus();
        } else {
            this.updateAuthUI(false);
        }
        
        // ファンクラブ一覧を読み込み（エラーハンドリング強化）
        await this.loadFeaturedFanclubs();
        
        // トップページを確実に表示
        this.showPage('topPage');
        
        console.log('App init completed');
    }

    setupEventListeners() {
        // Navigation
        document.querySelector('.logo').addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage('topPage');
        });
        
        // Search
        document.getElementById('searchToggle').addEventListener('click', () => this.toggleSearch());
        document.getElementById('searchBtn').addEventListener('click', () => this.performSearch());
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });
        
        // Auth buttons
        document.getElementById('loginBtn').addEventListener('click', () => this.showAuthModal('login'));
        document.getElementById('signupBtn').addEventListener('click', () => this.showAuthModal('signup'));
        document.getElementById('myPageBtn').addEventListener('click', () => this.showPage('myPage'));
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        
        // Auth forms
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('signupForm').addEventListener('submit', (e) => this.handleSignup(e));
        
        // モーダルの閉じるボタン
        const modalCloseBtn = document.getElementById('modalCloseBtn');
        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', () => this.closeAuthModal());
        }
        
        // タブ切り替えボタン
        const loginTabBtn = document.getElementById('loginTabBtn');
        const signupTabBtn = document.getElementById('signupTabBtn');
        
        if (loginTabBtn) {
            loginTabBtn.addEventListener('click', () => {
                console.log('Login tab clicked');
                this.switchAuthTab('login');
            });
        }
        
        if (signupTabBtn) {
            signupTabBtn.addEventListener('click', () => {
                console.log('Signup tab clicked');
                this.switchAuthTab('signup');
            });
        }
        
        // Main actions
        document.getElementById('createClubBtn').addEventListener('click', () => this.showCreateFanclub());
        document.getElementById('exploreClubBtn').addEventListener('click', () => this.showPage('searchPage'));
        
        // Forms
        document.getElementById('createClubForm').addEventListener('submit', (e) => this.handleCreateFanclub(e));
        document.getElementById('newPostForm').addEventListener('submit', (e) => this.handleNewPost(e));
        
        // Search page
        document.getElementById('searchPageBtn').addEventListener('click', () => this.performPageSearch());
        document.getElementById('searchPageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performPageSearch();
        });
        
        // File uploads
        document.getElementById('uploadCoverBtn').addEventListener('click', () => {
            document.getElementById('clubCoverImage').click();
        });
        document.getElementById('uploadFeaturedBtn').addEventListener('click', () => {
            document.getElementById('postFeaturedImage').click();
        });
        
        document.getElementById('clubCoverImage').addEventListener('change', (e) => this.handleImageUpload(e, 'coverPreview'));
        document.getElementById('postFeaturedImage').addEventListener('change', (e) => this.handleImageUpload(e, 'featuredPreview'));
        
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn));
        });
        
        // Fanclub actions
        document.getElementById('joinFanclubBtn').addEventListener('click', () => this.joinFanclub());
        document.getElementById('leaveFanclubBtn').addEventListener('click', () => this.leaveFanclub());
        document.getElementById('adminPanelBtn').addEventListener('click', () => this.showPage('adminPage'));
    }

    initializeRichEditors() {
        // Initialize Quill editors
        if (document.getElementById('initialPostEditor')) {
            this.initialPostEditor = new Quill('#initialPostEditor', {
                theme: 'snow',
                placeholder: 'ファンの皆さんに向けた最初のメッセージを書いてください...',
                modules: {
                    toolbar: [
                        ['bold', 'italic', 'underline'],
                        ['link', 'image'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['clean']
                    ]
                }
            });
        }
        
        if (document.getElementById('postContentEditor')) {
            this.postContentEditor = new Quill('#postContentEditor', {
                theme: 'snow',
                placeholder: '投稿内容を入力してください...',
                modules: {
                    toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        ['blockquote', 'code-block'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['link', 'image'],
                        ['clean']
                    ]
                }
            });
        }
    }

    async checkAuthStatus() {
        if (!this.token) {
            this.updateAuthUI(false);
            return;
        }
        
        try {
            const response = await this.apiCall('/user/profile');
            if (response.ok) {
                this.currentUser = await response.json();
                this.updateAuthUI(true);
                // ログイン済みなら常にトップページを表示
                if (window.location.hash === '#login' || window.location.hash === '#signup') {
                    this.showPage('topPage');
                }
            } else {
                this.token = null;
                localStorage.removeItem('auth_token');
                this.updateAuthUI(false);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            this.token = null;
            localStorage.removeItem('auth_token');
            this.updateAuthUI(false);
        }
    }

    updateAuthUI(isLoggedIn) {
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        const userMenu = document.getElementById('userMenu');
        
        if (loginBtn) loginBtn.style.display = isLoggedIn ? 'none' : 'inline-flex';
        if (signupBtn) signupBtn.style.display = isLoggedIn ? 'none' : 'inline-flex';
        if (userMenu) userMenu.style.display = isLoggedIn ? 'flex' : 'none';
        
        console.log('Auth UI updated:', { isLoggedIn, currentUser: this.currentUser });
    }

    showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.getElementById(pageId).classList.add('active');
        
        // Load data when showing specific pages
        if (pageId === 'searchPage') {
            this.loadAllFanclubs();
        } else if (pageId === 'myPage' && this.currentUser) {
            this.loadUserProfile();
        }
    }

    showCreateFanclub() {
        if (!this.currentUser) {
            this.showToast('ファンクラブを作成するにはログインが必要です', 'warning');
            this.showPage('loginPage');
            return;
        }
        this.showPage('createClubPage');
    }

    toggleSearch() {
        const searchBar = document.getElementById('searchBar');
        const isVisible = searchBar.style.display !== 'none';
        searchBar.style.display = isVisible ? 'none' : 'block';
        if (!isVisible) {
            document.getElementById('searchInput').focus();
        }
    }

    async performSearch() {
        const query = document.getElementById('searchInput').value.trim();
        if (!query) return;
        
        try {
            const response = await fetch(`${this.apiBase}/fanclubs/search?q=${encodeURIComponent(query)}`);
            const fanclubs = await response.json();
            
            this.showPage('searchPage');
            this.renderFanclubs(fanclubs, 'searchResults');
            document.getElementById('searchPageInput').value = query;
        } catch (error) {
            console.error('Search failed:', error);
            this.showToast('検索に失敗しました', 'error');
        }
    }

    async performPageSearch() {
        const query = document.getElementById('searchPageInput').value.trim();
        if (!query) {
            this.loadAllFanclubs();
            return;
        }
        
        try {
            const response = await fetch(`${this.apiBase}/fanclubs/search?q=${encodeURIComponent(query)}`);
            const fanclubs = await response.json();
            this.renderFanclubs(fanclubs, 'searchResults');
        } catch (error) {
            console.error('Search failed:', error);
            this.showToast('検索に失敗しました', 'error');
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        this.showLoading(true);
        
        try {
            const response = await fetch(`${this.apiBase}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.token = data.token;
                this.currentUser = data.user;
                localStorage.setItem('auth_token', this.token);
                this.updateAuthUI(true);
                this.closeAuthModal();
                this.showToast('ログインしました', 'success');
                document.getElementById('loginForm').reset();
            } else {
                this.showToast(data.error, 'error');
            }
        } catch (error) {
            console.error('Login failed:', error);
            this.showToast('ログインに失敗しました', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        const nickname = document.getElementById('signupNickname').value;
        const email = document.getElementById('signupEmail').value;
        const phone = document.getElementById('signupPhone').value;
        const password = document.getElementById('signupPassword').value;
        
        this.showLoading(true);
        
        try {
            const response = await fetch(`${this.apiBase}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nickname, email, phone, password }),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.token = data.token;
                this.currentUser = data.user;
                localStorage.setItem('auth_token', this.token);
                this.updateAuthUI(true);
                this.closeAuthModal();
                this.showToast('アカウントが作成されました', 'success');
                document.getElementById('signupForm').reset();
            } else {
                this.showToast(data.error, 'error');
            }
        } catch (error) {
            console.error('Signup failed:', error);
            this.showToast('アカウント作成に失敗しました', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async handleCreateFanclub(e) {
        e.preventDefault();
        
        const name = document.getElementById('clubName').value;
        const description = document.getElementById('clubDescription').value;
        const monthly_fee = parseInt(document.getElementById('monthlyFee').value) || 0;
        const purpose = document.getElementById('clubPurpose').value;
        const cover_image_url = document.getElementById('coverPreview').querySelector('img')?.src || '';
        
        this.showLoading(true);
        
        try {
            const response = await this.apiCall('/fanclubs', {
                method: 'POST',
                body: JSON.stringify({
                    name,
                    description,
                    monthly_fee,
                    purpose,
                    cover_image_url
                }),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Create initial post if editor has content
                if (this.initialPostEditor && this.initialPostEditor.root.innerHTML.trim() !== '<p><br></p>') {
                    await this.apiCall(`/fanclubs/${data.id}/posts`, {
                        method: 'POST',
                        body: JSON.stringify({
                            title: 'ファンクラブ開設のお知らせ',
                            content: this.initialPostEditor.root.innerHTML,
                            excerpt: 'ファンクラブを開設しました！',
                            visibility: 'public'
                        }),
                    });
                }
                
                this.showToast('ファンクラブが作成されました！', 'success');
                document.getElementById('createClubForm').reset();
                if (this.initialPostEditor) this.initialPostEditor.setContents([]);
                this.showPage('topPage');
                this.loadFeaturedFanclubs();
            } else {
                this.showToast(data.error, 'error');
            }
        } catch (error) {
            console.error('Fanclub creation failed:', error);
            this.showToast('ファンクラブ作成に失敗しました', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async handleNewPost(e) {
        e.preventDefault();
        
        if (!this.currentFanclub) return;
        
        const title = document.getElementById('postTitle').value;
        const excerpt = document.getElementById('postExcerpt').value;
        const content = this.postContentEditor.root.innerHTML;
        const featured_image_url = document.getElementById('featuredPreview').querySelector('img')?.src || '';
        const visibility = document.querySelector('input[name="postVisibility"]:checked').value;
        
        this.showLoading(true);
        
        try {
            const response = await this.apiCall(`/fanclubs/${this.currentFanclub.id}/posts`, {
                method: 'POST',
                body: JSON.stringify({
                    title,
                    excerpt,
                    content,
                    featured_image_url,
                    visibility
                }),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showToast('投稿が作成されました', 'success');
                document.getElementById('newPostForm').reset();
                if (this.postContentEditor) this.postContentEditor.setContents([]);
                this.loadFanclubPosts();
            } else {
                this.showToast(data.error, 'error');
            }
        } catch (error) {
            console.error('Post creation failed:', error);
            this.showToast('投稿作成に失敗しました', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async handleImageUpload(e, previewId) {
        const file = e.target.files[0];
        if (!file) return;
        
        this.showLoading(true);
        
        const formData = new FormData();
        formData.append('image', file);
        
        try {
            const response = await fetch(`${this.apiBase}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                },
                body: formData,
            });
            
            const data = await response.json();
            
            if (response.ok) {
                const preview = document.getElementById(previewId);
                preview.innerHTML = `<img src="${data.url}" alt="Uploaded image" style="max-width: 300px; height: auto;">`;
                this.showToast('画像がアップロードされました', 'success');
            } else {
                this.showToast(data.error, 'error');
            }
        } catch (error) {
            console.error('Image upload failed:', error);
            this.showToast('画像アップロードに失敗しました', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async loadFeaturedFanclubs() {
        try {
            const response = await fetch(`${this.apiBase}/fanclubs`);
            
            if (!response.ok) {
                console.error('API response not ok:', response.status, response.statusText);
                // デバッグ用: エラーメッセージを表示
                if (response.status === 404) {
                    console.error('API endpoint not found. Check server configuration.');
                }
                this.renderEmptyFanclubs('featuredClubs');
                return;
            }
            
            const fanclubs = await response.json();
            
            if (Array.isArray(fanclubs) && fanclubs.length > 0) {
                this.renderFanclubs(fanclubs.slice(0, 6), 'featuredClubs');
            } else {
                this.renderEmptyFanclubs('featuredClubs');
            }
        } catch (error) {
            console.error('Failed to load fanclubs:', error);
            console.error('API Base:', this.apiBase);
            // エラー時はダミーデータを表示（デバッグ用）
            this.renderEmptyFanclubs('featuredClubs');
        }
    }

    async loadAllFanclubs() {
        try {
            const response = await fetch(`${this.apiBase}/fanclubs`);
            const fanclubs = await response.json();
            this.renderFanclubs(fanclubs, 'searchResults');
        } catch (error) {
            console.error('Failed to load fanclubs:', error);
        }
    }

    renderEmptyFanclubs(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '<p class="text-center" style="padding: 2rem; color: #666;">ファンクラブを読み込み中... または接続エラーが発生しています。</p>';
        }
    }
    
    renderFanclubs(fanclubs, containerId) {
        const container = document.getElementById(containerId);
        
        if (!container) {
            console.error('Container not found:', containerId);
            return;
        }
        
        if (fanclubs.length === 0) {
            container.innerHTML = '<p class="text-center">ファンクラブが見つかりませんでした。</p>';
            return;
        }
        
        container.innerHTML = fanclubs.map(fanclub => `
            <div class="fanclub-card" onclick="app.viewFanclub('${fanclub.id}')">
                ${fanclub.cover_image_url ? `<img src="${fanclub.cover_image_url}" alt="${fanclub.name}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 16px;">` : ''}
                <div class="fanclub-card-header">
                    <h3>${fanclub.name}</h3>
                    <div class="fanclub-card-meta">
                        <span class="stat">
                            <i class="fas fa-user"></i>
                            ${fanclub.owner_name}
                        </span>
                    </div>
                </div>
                <p>${fanclub.description || fanclub.purpose}</p>
                <div class="fanclub-stats">
                    <span class="stat">
                        <i class="fas fa-users"></i>
                        ${fanclub.member_count} 人
                    </span>
                    <span class="stat">
                        <i class="fas fa-yen-sign"></i>
                        ${fanclub.monthly_fee} 円/月
                    </span>
                </div>
            </div>
        `).join('');
    }

    async viewFanclub(fanclubId) {
        this.showLoading(true);
        
        try {
            const response = await fetch(`${this.apiBase}/fanclubs/${fanclubId}`);
            const fanclub = await response.json();
            
            if (response.ok) {
                this.currentFanclub = fanclub;
                this.renderFanclubDetail(fanclub);
                await this.loadFanclubPosts();
                this.showPage('fanclubPage');
            } else {
                this.showToast('ファンクラブが見つかりません', 'error');
            }
        } catch (error) {
            console.error('Failed to load fanclub:', error);
            this.showToast('ファンクラブの読み込みに失敗しました', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    renderFanclubDetail(fanclub) {
        document.getElementById('fanclubName').textContent = fanclub.name;
        document.getElementById('fanclubDescription').textContent = fanclub.description || fanclub.purpose;
        document.getElementById('memberCount').textContent = fanclub.member_count;
        document.getElementById('monthlyFee').textContent = fanclub.monthly_fee;
        
        const coverImg = document.getElementById('fanclubCoverImage');
        if (fanclub.cover_image_url) {
            coverImg.src = fanclub.cover_image_url;
            coverImg.style.display = 'block';
        } else {
            coverImg.style.display = 'none';
        }
        
        this.updateFanclubButtons();
    }

    updateFanclubButtons() {
        if (!this.currentUser) {
            document.getElementById('joinFanclubBtn').style.display = 'none';
            document.getElementById('leaveFanclubBtn').style.display = 'none';
            document.getElementById('adminPanelBtn').style.display = 'none';
            return;
        }
        
        const isOwner = this.currentFanclub.owner_id === this.currentUser.id;
        
        if (isOwner) {
            document.getElementById('joinFanclubBtn').style.display = 'none';
            document.getElementById('leaveFanclubBtn').style.display = 'none';
            document.getElementById('adminPanelBtn').style.display = 'inline-flex';
        } else {
            // Check membership status (simplified - in real app, check via API)
            document.getElementById('joinFanclubBtn').style.display = 'inline-flex';
            document.getElementById('leaveFanclubBtn').style.display = 'none';
            document.getElementById('adminPanelBtn').style.display = 'none';
        }
    }

    async loadFanclubPosts() {
        if (!this.currentFanclub) return;
        
        try {
            const url = this.currentUser 
                ? `${this.apiBase}/fanclubs/${this.currentFanclub.id}/posts?user_id=${this.currentUser.id}`
                : `${this.apiBase}/fanclubs/${this.currentFanclub.id}/posts`;
                
            const response = await fetch(url);
            const posts = await response.json();
            
            this.renderPosts(posts);
        } catch (error) {
            console.error('Failed to load posts:', error);
        }
    }

    renderPosts(posts) {
        const container = document.getElementById('fanclubPosts');
        
        if (posts.length === 0) {
            container.innerHTML = '<p class="text-center">まだ投稿がありません。</p>';
            return;
        }
        
        container.innerHTML = posts.map(post => `
            <article class="post-item">
                ${post.featured_image_url ? `<img src="${post.featured_image_url}" alt="${post.title}" class="post-featured-image">` : ''}
                <div class="post-content">
                    <div class="post-header">
                        <h3 class="post-title">${post.title}</h3>
                        <div class="post-meta">
                            <span class="post-visibility-badge ${post.visibility}">
                                ${post.visibility === 'members' ? 'ファン限定' : '公開'}
                            </span>
                            <span>${post.author_name}</span>
                            <span>${new Date(post.published_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                    ${post.excerpt ? `<div class="post-excerpt">${post.excerpt}</div>` : ''}
                    <div class="post-body">${post.content}</div>
                    <div class="post-actions">
                        <div class="post-interactions">
                            <button class="interaction-btn" onclick="app.toggleLike(${post.id})">
                                <i class="fas fa-heart"></i>
                                <span>${post.like_count}</span>
                            </button>
                            <button class="interaction-btn" onclick="app.toggleComments(${post.id})">
                                <i class="fas fa-comment"></i>
                                <span>${post.comment_count}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </article>
        `).join('');
    }

    async joinFanclub() {
        if (!this.currentUser) {
            this.showToast('ファンクラブに参加するにはログインが必要です', 'warning');
            this.showPage('loginPage');
            return;
        }
        
        this.showLoading(true);
        
        try {
            const response = await this.apiCall(`/fanclubs/${this.currentFanclub.id}/join`, {
                method: 'POST',
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showToast(data.message, 'success');
                this.currentFanclub.member_count++;
                this.renderFanclubDetail(this.currentFanclub);
                this.updateFanclubButtons();
            } else {
                this.showToast(data.error, 'error');
            }
        } catch (error) {
            console.error('Join failed:', error);
            this.showToast('参加に失敗しました', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async leaveFanclub() {
        if (!confirm('本当にこのファンクラブから退会しますか？')) {
            return;
        }
        
        this.showLoading(true);
        
        try {
            const response = await this.apiCall(`/fanclubs/${this.currentFanclub.id}/leave`, {
                method: 'DELETE',
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showToast(data.message, 'success');
                this.currentFanclub.member_count--;
                this.renderFanclubDetail(this.currentFanclub);
                this.updateFanclubButtons();
            } else {
                this.showToast(data.error, 'error');
            }
        } catch (error) {
            console.error('Leave failed:', error);
            this.showToast('退会に失敗しました', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    switchTab(activeButton) {
        const tabName = activeButton.getAttribute('data-tab');
        const container = activeButton.closest('.page-container') || activeButton.closest('.page');
        
        // Update tab buttons
        container.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        activeButton.classList.add('active');
        
        // Update tab contents
        container.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        const targetTab = document.getElementById(tabName + 'Tab');
        if (targetTab) {
            targetTab.classList.add('active');
        }
        
        // Load data for specific tabs
        if (tabName === 'members' && this.currentFanclub) {
            this.loadFanclubMembers();
        } else if (tabName === 'settings' && this.currentFanclub) {
            this.loadFanclubSettings();
        } else if (tabName === 'fanclubs' && this.currentUser) {
            this.loadJoinedFanclubs();
        } else if (tabName === 'profile' && this.currentUser) {
            this.loadUserProfile();
        }
    }

    async loadFanclubMembers() {
        // Implementation for loading fanclub members
        document.getElementById('membersList').innerHTML = '<p>メンバー管理機能は開発中です。</p>';
    }

    loadFanclubSettings() {
        if (!this.currentFanclub) return;
        
        document.getElementById('editFanclubName').value = this.currentFanclub.name;
        document.getElementById('editFanclubDescription').value = this.currentFanclub.description || '';
        document.getElementById('editMonthlyFee').value = this.currentFanclub.monthly_fee;
        document.getElementById('editFanclubPurpose').value = this.currentFanclub.purpose;
    }

    async loadJoinedFanclubs() {
        // Implementation for loading user's joined fanclubs
        document.getElementById('joinedFanclubsList').innerHTML = '<p>参加中のファンクラブ一覧は開発中です。</p>';
    }

    loadUserProfile() {
        if (!this.currentUser) return;
        
        document.getElementById('profileNickname').value = this.currentUser.nickname;
        document.getElementById('profileEmail').value = this.currentUser.email;
        document.getElementById('profilePhone').value = this.currentUser.phone || '';
    }

    async toggleLike(postId) {
        // Implementation for toggling likes
        console.log('Toggle like for post:', postId);
    }

    toggleComments(postId) {
        // Implementation for toggling comments
        console.log('Toggle comments for post:', postId);
    }

    logout() {
        this.currentUser = null;
        this.token = null;
        localStorage.removeItem('auth_token');
        this.updateAuthUI(false);
        this.showPage('topPage');
        this.showToast('ログアウトしました', 'success');
    }

    // Utility methods
    async apiCall(endpoint, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        
        if (this.token) {
            defaultOptions.headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        // デバッグ用ログ（Vercel環境の問題特定用）
        const url = this.apiBase + endpoint;
        console.log('API Call:', url);
        
        try {
            const response = await fetch(url, {
                ...defaultOptions,
                ...options,
                headers: {
                    ...defaultOptions.headers,
                    ...options.headers,
                },
            });
            
            // エラーレスポンスの詳細をログ
            if (!response.ok) {
                console.error('API Error:', {
                    status: response.status,
                    statusText: response.statusText,
                    url: url
                });
            }
            
            return response;
        } catch (error) {
            console.error('API Call Failed:', {
                error: error.message,
                url: url
            });
            throw error;
        }
    }

    // Fanclub tab functionality
    showFanclubTab(tabName) {
        document.querySelectorAll('.fanclub-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.fanclub-tab-content').forEach(content => content.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`fanclub${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Tab`).classList.add('active');
        
        if (tabName === 'chat' && this.currentFanclub) {
            this.loadChatMessages();
        }
    }

    // Chat functionality
    async loadChatMessages() {
        if (!this.currentFanclub) return;
        
        const chatMessages = document.getElementById('chatMessages');
        const chatInputSection = document.getElementById('chatInputSection');
        const chatLoginPrompt = document.getElementById('chatLoginPrompt');
        
        // Check if user is a member
        const isMember = await this.checkMembership(this.currentFanclub.id);
        
        if (isMember) {
            chatInputSection.style.display = 'block';
            chatLoginPrompt.style.display = 'none';
            this.setupChatEventListeners();
        } else {
            chatInputSection.style.display = 'none';
            chatLoginPrompt.style.display = 'block';
        }
        
        // Load chat messages (mock data for now)
        this.renderChatMessages([
            {
                id: 1,
                author: 'クリエイター',
                message: 'ファンクラブへようこそ！気軽に交流しましょう！',
                timestamp: new Date(Date.now() - 3600000),
                isOwn: false
            },
            {
                id: 2,
                author: 'ファン1',
                message: '応援しています！新作楽しみです！',
                timestamp: new Date(Date.now() - 1800000),
                isOwn: false
            }
        ]);
    }

    setupChatEventListeners() {
        const chatInput = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendChatBtn');
        
        if (sendBtn.hasAttribute('data-listener-added')) return;
        
        sendBtn.setAttribute('data-listener-added', 'true');
        sendBtn.addEventListener('click', () => this.sendChatMessage());
        
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });
    }

    sendChatMessage() {
        const chatInput = document.getElementById('chatInput');
        const message = chatInput.value.trim();
        
        if (!message || !this.currentUser) return;
        
        const newMessage = {
            id: Date.now(),
            author: this.currentUser.nickname,
            message: message,
            timestamp: new Date(),
            isOwn: true
        };
        
        // Add to chat messages
        const chatMessages = document.getElementById('chatMessages');
        const existingMessages = Array.from(chatMessages.children).map(child => ({
            id: parseInt(child.dataset.messageId),
            author: child.querySelector('.chat-message-author').textContent,
            message: child.querySelector('.chat-message-text').textContent,
            timestamp: new Date(child.querySelector('.chat-message-time').textContent),
            isOwn: child.classList.contains('own')
        }));
        
        existingMessages.push(newMessage);
        this.renderChatMessages(existingMessages);
        
        chatInput.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    renderChatMessages(messages) {
        const chatMessages = document.getElementById('chatMessages');
        
        chatMessages.innerHTML = messages.map(msg => `
            <div class="chat-message ${msg.isOwn ? 'own' : ''}" data-message-id="${msg.id}">
                <div class="chat-message-content">
                    <div class="chat-message-author">${msg.author}</div>
                    <div class="chat-message-text">${msg.message}</div>
                    <div class="chat-message-time">${this.formatChatTime(msg.timestamp)}</div>
                </div>
            </div>
        `).join('');
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    formatChatTime(date) {
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'たった今';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}分前`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}時間前`;
        
        return date.toLocaleDateString('ja-JP');
    }

    async checkMembership(fanclubId) {
        if (!this.currentUser) return false;
        
        try {
            const response = await this.apiCall(`/fanclubs/${fanclubId}/posts?user_id=${this.currentUser.id}`);
            return response.ok; // If user can see posts, they're likely a member
        } catch (error) {
            return false;
        }
    }

    // Auth modal functions
    showAuthModal(tab = 'login') {
        const modal = document.getElementById('authModal');
        modal.classList.add('show');
        this.switchAuthTab(tab);
    }

    closeAuthModal() {
        console.log('Closing auth modal');
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    switchAuthTab(tab) {
        console.log('Switching to tab:', tab);
        
        // ログインタブボタン
        const loginTabBtn = document.getElementById('loginTabBtn');
        const signupTabBtn = document.getElementById('signupTabBtn');
        
        // タブコンテンツ
        const loginTab = document.getElementById('loginTab');
        const signupTab = document.getElementById('signupTab');
        
        if (tab === 'login') {
            if (loginTabBtn) {
                loginTabBtn.classList.add('active');
                signupTabBtn.classList.remove('active');
            }
            if (loginTab) {
                loginTab.classList.add('active');
                signupTab.classList.remove('active');
            }
        } else if (tab === 'signup') {
            if (signupTabBtn) {
                signupTabBtn.classList.add('active');
                loginTabBtn.classList.remove('active');
            }
            if (signupTab) {
                signupTab.classList.add('active');
                loginTab.classList.remove('active');
            }
        }
        
        console.log('Tab switch complete');
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        overlay.classList.toggle('show', show);
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    const app = new FanClubApp();
    window.app = app; // グローバルに公開
    console.log('App initialized');
});
