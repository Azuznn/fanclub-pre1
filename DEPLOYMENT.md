# 🚀 ファンクラブサイト デプロイガイド

無料サービスを使って本格的なファンクラブサイトを公開する手順

## 📋 必要なサービス

### 1. **Vercel** (ホスティング) - 無料
- サーバーレス関数でNode.js実行
- 自動デプロイメント
- カスタムドメイン対応

### 2. **Supabase** (データベース) - 無料枠
- PostgreSQL データベース
- リアルタイム機能
- 認証機能（今回は自前実装）
- 無料枠: 500MB ストレージ、2GB転送量/月

### 3. **Cloudinary** (画像ストレージ) - 無料枠
- 画像アップロード・変換
- CDN配信
- 無料枠: 25GB ストレージ、25GB転送量/月

---

## 🔧 セットアップ手順

### Step 1: Supabase設定

1. [Supabase](https://supabase.com) でアカウント作成
2. 新しいプロジェクト作成
3. SQL Editor で `supabase-schema.sql` を実行
4. Settings > API でURL・KEYを取得

### Step 2: Cloudinary設定

1. [Cloudinary](https://cloudinary.com) でアカウント作成
2. Dashboard で Cloud name、API Key、API Secret を取得

### Step 3: Vercelデプロイ

1. GitHubにリポジトリ作成・プッシュ
2. [Vercel](https://vercel.com) でアカウント作成
3. GitHubリポジトリをインポート
4. 環境変数を設定：

```bash
# Environment Variables (Vercel Settings)
JWT_SECRET=sinnnnkaiowdjnaoiw24
SUPABASE_URL=https://ejtxolxxgyndhwmljhed.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqdHhvbHh4Z3luZGh3bWxqaGVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3ODg5MTksImV4cCI6MjA3MjM2NDkxOX0.Pj9R-0tJSKX4hY2pFNH6Owo43zHc-DUuPn-e1bLvUeQ
CLOUDINARY_CLOUD_NAME=dnxhpsqhj
CLOUDINARY_API_KEY=499327321818676
CLOUDINARY_API_SECRET=V0znBuk0tCyw4pXmP0LsY7kpfEs
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqdHhvbHh4Z3luZGh3bWxqaGVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3ODg5MTksImV4cCI6MjA3MjM2NDkxOX0.Pj9R-0tJSKX4hY2pFNH6Owo43zHc-DUuPn-e1bLvUeQ
https://ejtxolxxgyndhwmljhed.supabase.co
https://ejtxolxxgyndhwmljhed.supabase.co
5. デプロイ実行

---

## 📝 詳細手順

### Supabase データベース作成

1. **新しいプロジェクト作成**
   ```
   Project name: fanclub-site
   Database Password: (強固なパスワードを設定)
   Region: Northeast Asia (Singapore) - 日本から近い
   ```

2. **SQLスキーマ実行**
   - SQL Editor を開く
   - `supabase-schema.sql` の内容をコピペ
   - 「RUN」をクリック

3. **API設定取得**
   - Settings → API
   - Project URL と anon public key をコピー

### Cloudinary 画像ストレージ設定

1. **アカウント作成後、Dashboard確認**
   - Cloud name: 英数字のID
   - API Key: 数字のキー
   - API Secret: 英数字の秘密キー

### Vercel デプロイ

1. **GitHubリポジトリ作成**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/fanclub-site.git
   git push -u origin main
   ```

2. **Vercel設定**
   - "New Project" → GitHubからインポート
   - Framework Preset: Other (自動検出でOK)
   - Root Directory: `./`
   - Build Command: `npm install`
   - Environment Variables で上記の6つの変数を設定

3. **デプロイ**
   - 「Deploy」ボタンをクリック
   - 数分でデプロイ完了
   - 提供されるURLでアクセス可能

---

## 🔍 動作確認

デプロイ後、以下を確認：

1. **サイトアクセス** - トップページが表示される
2. **ユーザー登録** - 新しいアカウント作成
3. **ログイン** - 作成したアカウントでログイン
4. **ファンクラブ作成** - 画像アップロード含む
5. **投稿作成** - リッチテキストエディタ動作
6. **ファンクラブ参加/退会** - メンバー管理機能

---

## ⚡ 無料枠制限

### Vercel制限
- **関数実行時間**: 30秒
- **帯域幅**: 100GB/月
- **ビルド時間**: 6000分/月

### Supabase制限
- **ストレージ**: 500MB
- **データ転送**: 2GB/月
- **データベース接続**: 60同時接続
- **API リクエスト**: 50,000/月

### Cloudinary制限
- **ストレージ**: 25GB
- **転送量**: 25GB/月
- **変換**: 25,000回/月

---

## 📈 スケールアップ

無料枠を超えた場合の有料プランへの移行：

- **Vercel Pro**: $20/月 - 無制限帯域幅
- **Supabase Pro**: $25/月 - 8GB ストレージ、250GB転送
- **Cloudinary**: $99/月 - 1TB ストレージ、100GB転送

---

## 🐛 トラブルシューティング

### よくあるエラー

1. **"Database connection failed"**
   - Supabase URL/KEY の確認
   - Row Level Security 設定の確認

2. **"Image upload failed"**
   - Cloudinary認証情報の確認
   - ファイルサイズ制限（10MB）の確認

3. **"Function timeout"**
   - 大きな画像処理時に発生
   - 画像サイズを小さくして再試行

### ログ確認方法
- Vercel: Functions タブでログ確認
- Supabase: Logs & insights でクエリログ確認
- Cloudinary: Media Library で画像確認

---

## 🔒 セキュリティ

- JWT_SECRET は十分に複雑な文字列を使用
- Supabase RLS (Row Level Security) が有効
- 画像アップロードは認証必須
- Rate limiting 設定済み（15分間100リクエスト）

完全無料で本格的なファンクラブサイトの運営が可能です！