# ファンクラブサイト

本格的な画像投稿対応のファンクラブプラットフォーム

## 機能

### 基本機能
- ✅ ユーザー登録・ログイン (JWT認証)
- ✅ ファンクラブ作成・管理
- ✅ ファンクラブ検索・参加・退会
- ✅ 会員数の自動管理
- ✅ マイページ機能

### 投稿・コンテンツ機能
- ✅ リッチテキストエディタ (Quill.js)
- ✅ 画像アップロード機能 (最大10MB)
- ✅ ブログ風記事投稿
- ✅ アイキャッチ画像設定
- ✅ 公開・ファン限定の投稿制御
- ✅ いいね・コメント機能 (基本実装)

### 管理機能
- ✅ ファンクラブオーナー管理画面
- ✅ 記事投稿管理
- ✅ メンバー管理
- ✅ ファンクラブ設定変更
- ✅ リマインダー設定

### デザイン・UI
- ✅ Ameba風モダンデザイン
- ✅ レスポンシブ対応
- ✅ 滑らかなアニメーション
- ✅ トースト通知
- ✅ ローディング表示

### 技術スタック
- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Rich Text Editor**: Quill.js
- **Icons**: Font Awesome

## セットアップ

### 1. 依存関係のインストール
```bash
npm install
```

### 2. サーバー起動
```bash
# 開発モード（自動リロード）
npm run dev

# 本番モード
npm start
```

### 3. アクセス
ブラウザで `http://localhost:3000` にアクセス

## データベース構造

### Users (ユーザー)
- id, nickname, email, phone, password_hash, avatar_url, created_at, updated_at

### Fanclubs (ファンクラブ)
- id, name, description, monthly_fee, purpose, cover_image_url, owner_id, member_count, created_at, updated_at

### Memberships (メンバーシップ)
- id, user_id, fanclub_id, is_owner, joined_at, next_payment_date

### Posts (投稿)
- id, fanclub_id, author_id, title, content, excerpt, featured_image_url, visibility, like_count, comment_count, published_at, created_at, updated_at

### Likes (いいね)
- id, user_id, post_id, created_at

### Comments (コメント)
- id, post_id, author_id, content, created_at

### Reminder_Settings (リマインダー設定)
- id, user_id, email_enabled, days_before, created_at, updated_at

## API エンドポイント

### 認証
- `POST /api/auth/signup` - ユーザー登録
- `POST /api/auth/login` - ログイン

### ファンクラブ
- `GET /api/fanclubs` - ファンクラブ一覧
- `GET /api/fanclubs/search?q=検索ワード` - ファンクラブ検索
- `GET /api/fanclubs/:id` - ファンクラブ詳細
- `POST /api/fanclubs` - ファンクラブ作成
- `POST /api/fanclubs/:id/join` - ファンクラブ参加
- `DELETE /api/fanclubs/:id/leave` - ファンクラブ退会

### 投稿
- `GET /api/fanclubs/:id/posts` - ファンクラブの投稿一覧
- `POST /api/fanclubs/:id/posts` - 投稿作成

### その他
- `POST /api/upload` - 画像アップロード
- `GET /api/user/profile` - ユーザープロフィール取得
- `PUT /api/user/profile` - ユーザープロフィール更新

## セキュリティ機能

- パスワードハッシュ化 (bcrypt)
- JWT認証
- Rate limiting (15分間に100リクエスト)
- Helmet.js セキュリティヘッダー
- ファイルアップロード制限
- CORS設定
- 入力バリデーション

## 追加予定機能

- [ ] リアルタイムコメント (WebSocket)
- [ ] 通知システム
- [ ] 支払い機能連携
- [ ] メール送信機能
- [ ] 高度な検索・フィルター
- [ ] ファンクラブランキング
- [ ] プッシュ通知

## 開発者向け

### ディレクトリ構造
```
├── server.js          # サーバーメイン
├── package.json       # 依存関係
├── fanclub.db        # SQLiteデータベース (自動生成)
├── uploads/          # アップロード画像 (自動生成)
└── public/           # フロントエンド
    ├── index.html    # メインHTML
    ├── styles.css    # CSS
    └── script.js     # JavaScript
```

### 開発時の注意
- 本番環境では `JWT_SECRET` 環境変数を設定してください
- データベースファイルとアップロードディレクトリのバックアップを定期的に行ってください
- 画像アップロードのサイズ制限を調整する場合は、サーバーとフロントエンドの両方を更新してください