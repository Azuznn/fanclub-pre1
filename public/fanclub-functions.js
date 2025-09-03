// Additional functions for fanclub functionality

// Extend the existing FanClubApp class with new methods
Object.assign(FanClubApp.prototype, {
    
    setupFanclubPageListeners() {
        // Fanclub actions (fanclub detail page)
        const joinBtn2 = document.getElementById('joinFanclubBtn2');
        const leaveBtn2 = document.getElementById('leaveFanclubBtn2');
        const adminBtn2 = document.getElementById('adminPanelBtn2');
        
        if (joinBtn2) joinBtn2.addEventListener('click', () => this.joinFanclub());
        if (leaveBtn2) leaveBtn2.addEventListener('click', () => this.leaveFanclub());
        if (adminBtn2) adminBtn2.addEventListener('click', () => this.showPage('adminPage'));
        
        // Fanclub navigation tabs
        document.querySelectorAll('.fanclub-nav-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchFanclubTab(btn.dataset.tab));
        });
        
        // Admin navigation tabs
        document.querySelectorAll('.admin-nav-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchAdminTab(btn.dataset.adminTab));
        });
        
        // Modal and form event listeners
        const backToFanclub = document.getElementById('backToFanclubBtn');
        const createPost = document.getElementById('createPostBtn');
        const postModalClose = document.getElementById('postModalClose');
        const cancelPost = document.getElementById('cancelPostBtn');
        const postForm = document.getElementById('postForm');
        const uploadImage = document.getElementById('uploadPostImageBtn');
        const imageInput = document.getElementById('postFeaturedImage');
        const chatForm = document.getElementById('chatForm');
        const settingsForm = document.getElementById('fanclubSettingsForm');
        
        if (backToFanclub) backToFanclub.addEventListener('click', () => this.showPage('fanclubPage'));
        if (createPost) createPost.addEventListener('click', () => this.showPostModal());
        if (postModalClose) postModalClose.addEventListener('click', () => this.closePostModal());
        if (cancelPost) cancelPost.addEventListener('click', () => this.closePostModal());
        if (postForm) postForm.addEventListener('submit', (e) => this.handlePostSubmit(e));
        if (uploadImage) uploadImage.addEventListener('click', () => imageInput?.click());
        if (imageInput) imageInput.addEventListener('change', (e) => this.handlePostImageUpload(e));
        if (chatForm) chatForm.addEventListener('submit', (e) => this.handleChatSubmit(e));
        if (settingsForm) settingsForm.addEventListener('submit', (e) => this.handleSettingsSubmit(e));
    },
    
    // Show fanclub detail page
    async showFanclubDetail(fanclubId) {
        console.log('showFanclubDetail called with ID:', fanclubId);
        try {
            this.showLoading(true);
            
            // ダミーファンクラブデータを使用（API未実装のため）
            const dummyFanclubs = {
                '1': {
                    id: 1,
                    name: "アーティストAファンクラブ",
                    description: "音楽とアートの世界を一緒に楽しみましょう！",
                    member_count: 150,
                    monthly_fee: 1500,
                    cover_image_url: "https://via.placeholder.com/1200x400/3BAEC6/white?text=Artist+A",
                    purpose: "音楽活動の応援とファン同士の交流",
                    created_at: new Date().toISOString()
                },
                '2': {
                    id: 2,
                    name: "クリエイターBサポーターズ",
                    description: "創作活動を応援する仲間たちのコミュニティです。",
                    member_count: 89,
                    monthly_fee: 800,
                    cover_image_url: "https://via.placeholder.com/1200x400/FF6B6B/white?text=Creator+B",
                    purpose: "創作活動のサポートとファン交流",
                    created_at: new Date().toISOString()
                },
                '3': {
                    id: 3,
                    name: "配信者Cのファンルーム",
                    description: "楽しい配信と限定コンテンツをお楽しみください。",
                    member_count: 234,
                    monthly_fee: 1200,
                    cover_image_url: "https://via.placeholder.com/1200x400/10B981/white?text=Streamer+C",
                    purpose: "配信活動の応援とコミュニティ運営",
                    created_at: new Date().toISOString()
                }
            };
            
            const fanclub = dummyFanclubs[fanclubId];
            
            if (fanclub) {
                this.currentFanclub = fanclub;
                this.renderFanclubDetail(fanclub);
                await this.loadFanclubPosts(fanclubId);
                await this.loadChatMessages(fanclubId);
                this.updateFanclubButtons();
                this.showPage('fanclubPage');
                console.log('Fanclub page should now be visible');
            } else {
                this.showToast('ファンクラブが見つかりません', 'error');
            }
        } catch (error) {
            console.error('Failed to load fanclub:', error);
            this.showToast('ファンクラブの読み込みに失敗しました', 'error');
        } finally {
            this.showLoading(false);
        }
    },
    
    renderFanclubDetail(fanclub) {
        // Update header info
        const coverImg = document.getElementById('fanclubCoverImage');
        const name = document.getElementById('fanclubName');
        const description = document.getElementById('fanclubDescription');
        const memberCount = document.getElementById('fanclubMemberCount');
        const monthlyFee = document.getElementById('fanclubMonthlyFee');
        
        if (coverImg) coverImg.src = fanclub.cover_image_url || `https://via.placeholder.com/1200x400/3BAEC6/white?text=${encodeURIComponent(fanclub.name)}`;
        if (name) name.textContent = fanclub.name;
        if (description) description.textContent = fanclub.description;
        if (memberCount) memberCount.textContent = fanclub.member_count || 0;
        if (monthlyFee) monthlyFee.textContent = fanclub.monthly_fee || 0;
        
        // Update about tab
        const aboutFee = document.getElementById('aboutMonthlyFee');
        const aboutCount = document.getElementById('aboutMemberCount');
        const aboutCreated = document.getElementById('aboutCreatedAt');
        const aboutPurpose = document.getElementById('aboutPurpose');
        
        if (aboutFee) aboutFee.textContent = (fanclub.monthly_fee || 0) + '円/月';
        if (aboutCount) aboutCount.textContent = (fanclub.member_count || 0) + '人';
        if (aboutCreated) aboutCreated.textContent = new Date(fanclub.created_at).toLocaleDateString('ja-JP');
        if (aboutPurpose) aboutPurpose.textContent = fanclub.purpose || '特に記載なし';
    },
    
    switchFanclubTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.fanclub-tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Remove active class from all buttons
        document.querySelectorAll('.fanclub-nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected tab and activate button
        const targetTab = document.getElementById(tabName + 'Tab');
        const targetBtn = document.querySelector(`[data-tab="${tabName}"]`);
        
        if (targetTab) targetTab.classList.add('active');
        if (targetBtn) targetBtn.classList.add('active');
        
        // Update chat input visibility
        if (tabName === 'chat') {
            this.updateChatInputVisibility();
        }
    },
    
    switchAdminTab(tabName) {
        // Hide all admin tab contents
        document.querySelectorAll('.admin-tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Remove active class from all buttons
        document.querySelectorAll('.admin-nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected tab and activate button
        const targetTab = document.getElementById('admin' + tabName.charAt(0).toUpperCase() + tabName.slice(1) + 'Tab');
        const targetBtn = document.querySelector(`[data-admin-tab="${tabName}"]`);
        
        if (targetTab) targetTab.classList.add('active');
        if (targetBtn) targetBtn.classList.add('active');
        
        // Load data for specific tabs
        if (tabName === 'posts') {
            this.loadAdminPosts();
        }
    },
    
    showPostModal(postId = null) {
        this.editingPostId = postId;
        const modal = document.getElementById('postModal');
        const title = document.getElementById('postModalTitle');
        
        if (postId) {
            if (title) title.textContent = '記事を編集';
            this.loadPostForEdit(postId);
        } else {
            if (title) title.textContent = '新規記事作成';
            const form = document.getElementById('postForm');
            if (form) form.reset();
            this.hidePostImagePreview();
        }
        
        if (modal) modal.classList.add('show');
        
        // Initialize Quill editor if not already done
        this.initializePostContentEditor();
    },
    
    closePostModal() {
        const modal = document.getElementById('postModal');
        if (modal) modal.classList.remove('show');
        this.editingPostId = null;
    },
    
    initializePostContentEditor() {
        setTimeout(() => {
            const editorElement = document.getElementById('postContentEditor');
            if (editorElement && window.Quill && !this.postContentEditor) {
                this.postContentEditor = new Quill('#postContentEditor', {
                    theme: 'snow',
                    placeholder: '記事の内容を入力してください...',
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
        }, 100);
    },
    
    handlePostImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('postImagePreview');
                const img = document.getElementById('postImagePreviewImg');
                if (img) img.src = e.target.result;
                if (preview) preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    },
    
    hidePostImagePreview() {
        const preview = document.getElementById('postImagePreview');
        if (preview) preview.style.display = 'none';
    },
    
    updateChatInputVisibility() {
        const chatInputArea = document.getElementById('chatInputArea');
        const chatLoginPrompt = document.getElementById('chatLoginPrompt');
        
        if (this.currentUser && this.isFanclubMember()) {
            if (chatInputArea) chatInputArea.style.display = 'flex';
            if (chatLoginPrompt) chatLoginPrompt.style.display = 'none';
        } else {
            if (chatInputArea) chatInputArea.style.display = 'none';
            if (chatLoginPrompt) chatLoginPrompt.style.display = 'block';
        }
    },
    
    isFanclubMember() {
        // For now, return true if user is logged in
        return !!this.currentUser;
    },
    
    async handlePostSubmit(e) {
        e.preventDefault();
        
        const title = document.getElementById('postTitle')?.value;
        const excerpt = document.getElementById('postExcerpt')?.value;
        const visibility = document.getElementById('postVisibility')?.value;
        
        if (!title) {
            this.showToast('タイトルを入力してください', 'error');
            return;
        }
        
        if (!this.postContentEditor) {
            this.showToast('エディターが初期化されていません', 'error');
            return;
        }
        
        const content = this.postContentEditor.root.innerHTML;
        
        // For now, just show a placeholder message
        this.showToast('記事投稿機能は開発中です', 'info');
        console.log('Post data:', { title, excerpt, content, visibility });
    },
    
    async handleChatSubmit(e) {
        e.preventDefault();
        const input = document.getElementById('chatMessageInput');
        const message = input?.value.trim();
        
        if (!message) return;
        
        if (!this.currentUser) {
            this.showToast('チャットにはログインが必要です', 'warning');
            return;
        }
        
        // Add message to localStorage-based chat storage
        const fanclubId = this.currentFanclub?.id;
        if (!fanclubId) return;
        
        const chatKey = `fanclub_chat_${fanclubId}`;
        const existingMessages = JSON.parse(localStorage.getItem(chatKey) || '[]');
        
        const newMessage = {
            id: Date.now(),
            user_id: this.currentUser.id,
            user_name: this.currentUser.name,
            message: message,
            timestamp: new Date().toISOString(),
            created_at: new Date().toLocaleTimeString('ja-JP')
        };
        
        existingMessages.push(newMessage);
        localStorage.setItem(chatKey, JSON.stringify(existingMessages));
        
        // Clear input and reload messages
        if (input) input.value = '';
        await this.loadChatMessages(fanclubId);
        
        this.showToast('メッセージを送信しました', 'success');
    },
    
    async handleSettingsSubmit(e) {
        e.preventDefault();
        
        const name = document.getElementById('settingsName')?.value;
        const description = document.getElementById('settingsDescription')?.value;
        const monthlyFee = document.getElementById('settingsMonthlyFee')?.value;
        const purpose = document.getElementById('settingsPurpose')?.value;
        
        // For now, show placeholder functionality
        this.showToast('設定保存機能は開発中です', 'info');
        console.log('Settings data:', { name, description, monthlyFee, purpose });
    },
    
    async loadFanclubPosts(fanclubId) {
        // Placeholder implementation - display sample posts
        const container = document.getElementById('fanclubPosts');
        if (container) {
            container.innerHTML = `
                <div class="post-item">
                    <div class="post-header">
                        <div class="post-author-avatar">管</div>
                        <div class="post-meta">
                            <div class="post-author">管理者</div>
                            <div class="post-date">${new Date().toLocaleDateString('ja-JP')}</div>
                        </div>
                    </div>
                    <h3 class="post-title">ファンクラブ開設のお知らせ</h3>
                    <p class="post-excerpt">この度、ファンクラブを開設いたしました！皆様と一緒に素敵な時間を過ごせることを楽しみにしています。</p>
                    <div class="post-actions">
                        <button class="post-like-btn">
                            <i class="fas fa-heart"></i>
                            <span>5</span>
                        </button>
                    </div>
                </div>
            `;
        }
    },
    
    async loadChatMessages(fanclubId) {
        const container = document.getElementById('chatMessages');
        if (!container) return;
        
        // Load messages from localStorage
        const chatKey = `fanclub_chat_${fanclubId}`;
        const messages = JSON.parse(localStorage.getItem(chatKey) || '[]');
        
        // Add some initial welcome messages if empty
        if (messages.length === 0) {
            const welcomeMessages = [
                {
                    id: 1,
                    user_id: 'system',
                    user_name: 'システム',
                    message: 'ファンクラブチャットへようこそ！',
                    created_at: new Date().toLocaleTimeString('ja-JP'),
                    timestamp: new Date().toISOString()
                },
                {
                    id: 2,
                    user_id: 'admin',
                    user_name: '管理者',
                    message: 'みなさんで楽しくお話しましょう！',
                    created_at: new Date().toLocaleTimeString('ja-JP'),
                    timestamp: new Date().toISOString()
                }
            ];
            localStorage.setItem(chatKey, JSON.stringify(welcomeMessages));
            messages.push(...welcomeMessages);
        }
        
        // Render messages
        container.innerHTML = messages.map(msg => {
            const isOwn = this.currentUser && msg.user_id === this.currentUser.id;
            const isSystem = msg.user_id === 'system';
            
            return `
                <div class="chat-message ${isOwn ? 'own' : ''} ${isSystem ? 'system' : ''}">
                    <div class="chat-message-content">
                        <div class="chat-message-author">${msg.user_name}</div>
                        <div class="chat-message-text">${msg.message}</div>
                        <div class="chat-message-time">${msg.created_at}</div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Auto-scroll to bottom
        container.scrollTop = container.scrollHeight;
        
        // Update chat visibility
        this.updateChatInputVisibility();
    },
    
    async loadAdminPosts() {
        // Placeholder implementation
        const container = document.getElementById('adminPostsList');
        if (container) {
            container.innerHTML = `
                <div class="admin-post-item">
                    <div class="admin-post-header">
                        <div>
                            <h4 class="admin-post-title">ファンクラブ開設のお知らせ</h4>
                            <div class="admin-post-meta">
                                ${new Date().toLocaleString('ja-JP')} | 公開
                            </div>
                        </div>
                        <div class="admin-post-actions">
                            <button class="btn btn-sm btn-outline" onclick="app.showPostModal(1)">
                                <i class="fas fa-edit"></i> 編集
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="app.deletePost(1)">
                                <i class="fas fa-trash"></i> 削除
                            </button>
                        </div>
                    </div>
                    <p>この度、ファンクラブを開設いたしました！</p>
                </div>
            `;
        }
    },
    
    async deletePost(postId) {
        if (!confirm('この記事を削除しますか？')) return;
        this.showToast('記事削除機能は開発中です', 'info');
        console.log('Delete post:', postId);
    },
    
    async loadPostForEdit(postId) {
        // Placeholder for loading post data for editing
        console.log('Load post for edit:', postId);
        this.showToast('記事編集機能は開発中です', 'info');
    }
});