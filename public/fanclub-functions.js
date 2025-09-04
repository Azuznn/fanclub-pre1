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
        console.log('=== showFanclubDetail START ===');
        console.log('Fanclub ID:', fanclubId);
        console.log('supabaseClient exists:', !!this.supabaseClient);
        console.log('showPage function exists:', typeof this.showPage);
        
        try {
            this.showLoading(true);
            
            // Supabaseからファンクラブ情報を取得
            console.log('Fetching fanclub from API...');
            const response = await this.supabaseClient.getFanclub(fanclubId);
            console.log('API Response status:', response.status);
            
            if (response.ok) {
                const fanclub = await response.json();
                console.log('Fanclub data received:', fanclub);
                this.currentFanclub = fanclub;
                
                console.log('Rendering fanclub detail...');
                this.renderFanclubDetail(fanclub);
                
                console.log('Loading posts...');
                await this.loadFanclubPosts(fanclubId);
                
                console.log('Loading chat messages...');
                await this.loadChatMessages(fanclubId);
                
                console.log('Updating buttons...');
                this.updateFanclubButtons();
                
                console.log('Showing fanclub page...');
                const fanclubPageElement = document.getElementById('fanclubPage');
                console.log('fanclubPage element exists:', !!fanclubPageElement);
                
                this.showPage('fanclubPage');
                console.log('=== showFanclubDetail COMPLETE ===');
            } else {
                const errorText = await response.text();
                console.error('Fanclub not found. Response:', errorText);
                this.showToast('ファンクラブが見つかりません', 'error');
            }
        } catch (error) {
            console.error('=== showFanclubDetail ERROR ===');
            console.error('Error details:', error);
            console.error('Stack trace:', error.stack);
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
        console.log('switchFanclubTab called with:', tabName);
        
        // Hide all tab contents
        document.querySelectorAll('.fanclub-tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Remove active class from all buttons
        document.querySelectorAll('.fanclub-nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected tab and activate button
        // Try multiple ID patterns to handle inconsistent naming
        const possibleIds = [
            tabName + 'Tab',                    // e.g., chatTab
            'fanclub' + tabName.charAt(0).toUpperCase() + tabName.slice(1) + 'Tab'  // e.g., fanclubChatTab
        ];
        
        let targetTab = null;
        for (const id of possibleIds) {
            targetTab = document.getElementById(id);
            if (targetTab) {
                console.log('Found tab with ID:', id);
                break;
            }
        }
        
        const targetBtn = document.querySelector(`[data-tab="${tabName}"]`);
        
        if (targetTab) {
            targetTab.classList.add('active');
        } else {
            console.error('Tab not found for:', tabName);
        }
        
        if (targetBtn) targetBtn.classList.add('active');
        
        // Update chat input visibility and load messages
        if (tabName === 'chat') {
            console.log('Chat tab selected, loading messages...');
            if (this.currentFanclub) {
                this.loadChatMessages(this.currentFanclub.id);
            }
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
        const visibility = document.getElementById('postVisibility')?.value || 'public';
        
        if (!title) {
            this.showToast('タイトルを入力してください', 'error');
            return;
        }
        
        if (!this.currentFanclub) {
            this.showToast('ファンクラブが選択されていません', 'error');
            return;
        }
        
        if (!this.postContentEditor) {
            this.showToast('エディターが初期化されていません', 'error');
            return;
        }
        
        const content = this.postContentEditor.root.innerHTML;
        
        this.showLoading(true);
        
        try {
            const response = await this.supabaseClient.createPost(this.currentFanclub.id, {
                title,
                excerpt: excerpt || title,
                content,
                visibility
            });
            
            if (response.ok) {
                this.showToast('記事を投稿しました', 'success');
                this.closePostModal();
                // Reload posts to show the new one
                await this.loadFanclubPosts(this.currentFanclub.id);
            } else {
                const error = await response.text();
                this.showToast('記事の投稿に失敗しました', 'error');
                console.error('Post creation failed:', error);
            }
        } catch (error) {
            console.error('Post submission error:', error);
            this.showToast('記事の投稿に失敗しました', 'error');
        } finally {
            this.showLoading(false);
        }
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
        
        if (!this.currentFanclub) {
            this.showToast('ファンクラブが選択されていません', 'error');
            return;
        }
        
        try {
            const response = await this.supabaseClient.sendChatMessage(this.currentFanclub.id, message);
            
            if (response.ok) {
                // Clear input
                if (input) input.value = '';
                
                // Reload messages
                await this.loadChatMessages(this.currentFanclub.id);
                
                this.showToast('メッセージを送信しました', 'success');
            } else {
                const error = await response.text();
                this.showToast('メッセージの送信に失敗しました', 'error');
                console.error('Chat send error:', error);
            }
        } catch (error) {
            console.error('Chat submit error:', error);
            this.showToast('メッセージの送信に失敗しました', 'error');
        }
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
        console.log('=== loadChatMessages START ===');
        console.log('Fanclub ID:', fanclubId);
        
        const container = document.getElementById('chatMessages');
        if (!container) {
            console.error('Chat container not found!');
            // Try alternate container ID
            const altContainer = document.querySelector('.chat-messages');
            if (altContainer) {
                console.log('Found alternate container');
                container = altContainer;
            } else {
                return;
            }
        }
        
        try {
            console.log('Fetching chat messages from API...');
            const response = await this.supabaseClient.getChatMessages(fanclubId);
            console.log('Chat API response:', response.status);
            let messages = [];
            
            if (response.ok) {
                messages = await response.json();
            }
            
            // Add some initial welcome messages if empty (for demo purposes)
            if (messages.length === 0) {
                const welcomeMessages = [
                    {
                        id: 'welcome-1',
                        user_id: 'system',
                        user_name: 'システム',
                        message: 'ファンクラブチャットへようこそ！',
                        created_at: new Date().toLocaleTimeString('ja-JP'),
                        timestamp: new Date().toISOString()
                    },
                    {
                        id: 'welcome-2',
                        user_id: this.currentFanclub?.owner_id || 'admin',
                        user_name: this.currentFanclub?.owner_name || '管理者',
                        message: 'みなさんで楽しくお話しましょう！',
                        created_at: new Date().toLocaleTimeString('ja-JP'),
                        timestamp: new Date().toISOString()
                    }
                ];
                messages = welcomeMessages;
            }
        
        // Render messages
        container.innerHTML = messages.map(msg => {
            const isOwn = this.currentUser && msg.user_id === this.currentUser.id;
            const isSystem = msg.user_id === 'system';
            const isOwner = this.currentFanclub && this.currentUser && this.currentFanclub.owner_id === this.currentUser.id;
            const canDelete = isOwn || (isOwner && !isSystem);
            
            return `
                <div class="chat-message ${isOwn ? 'own' : ''} ${isSystem ? 'system' : ''}" data-message-id="${msg.id}">
                    <div class="chat-message-content">
                        <div class="chat-message-author">${msg.user_name}</div>
                        <div class="chat-message-text">${msg.message}</div>
                        <div class="chat-message-time">${msg.created_at}</div>
                        ${canDelete ? `<button class="chat-delete-btn" onclick="app.deleteChatMessage('${fanclubId}', '${msg.id}')" style="background: #ff4757; color: white; border: none; border-radius: 4px; padding: 4px 8px; font-size: 12px; cursor: pointer; margin-left: 8px; opacity: 0.7; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'"><i class="fas fa-trash"></i></button>` : ''}
                    </div>
                </div>
            `;
        }).join('');
        
        // Auto-scroll to bottom
        container.scrollTop = container.scrollHeight;
        
        // Update chat visibility
        this.updateChatInputVisibility();
    },
    
    async deleteChatMessage(fanclubId, messageId) {
        if (!confirm('このメッセージを削除しますか？')) {
            return;
        }
        
        try {
            const response = await fetch(`${this.supabaseClient.apiBase}/fanclubs/${fanclubId}/chat/${messageId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.supabaseClient.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                // Reload the chat to show updated messages
                await this.loadChatMessages(fanclubId);
                this.showToast('メッセージを削除しました', 'success');
            } else {
                const error = await response.text();
                this.showToast('メッセージの削除に失敗しました', 'error');
                console.error('Chat delete error:', error);
            }
        } catch (error) {
            console.error('Chat delete error:', error);
            this.showToast('メッセージの削除に失敗しました', 'error');
        }
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