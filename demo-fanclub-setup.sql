-- Demo fanclub setup for testing
-- This file creates sample fanclub data for demonstration purposes

-- First, create a demo user (owner of the fanclub)
INSERT INTO users (id, nickname, email, phone, password_hash, avatar_url, created_at, updated_at) 
VALUES (
    'demo-user-1',
    'クリエイター太郎',
    'demo@fanclub.test',
    '090-1234-5678',
    '$2b$10$example.hash.here', -- This should be a proper bcrypt hash
    'https://via.placeholder.com/100x100/3BAEC6/white?text=CT',
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Create a sample fanclub
INSERT INTO fanclubs (id, name, description, monthly_fee, purpose, cover_image_url, owner_id, member_count, created_at, updated_at)
VALUES (
    'demo-fanclub-1',
    'クリエイター太郎のアトリエ',
    'イラスト制作の過程や限定コンテンツを共有するファンクラブです。創作活動を応援してくださる皆様と一緒に、素敵な作品を作っていきたいと思います！',
    1200,
    'イラスト制作活動の支援とファン同士の交流促進',
    'https://via.placeholder.com/1200x400/FF8C9F/white?text=Creative+Studio',
    'demo-user-1',
    5,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Add owner as first member
INSERT INTO memberships (id, user_id, fanclub_id, is_owner, joined_at, next_payment_date)
VALUES (
    'membership-demo-1',
    'demo-user-1', 
    'demo-fanclub-1',
    true,
    NOW(),
    NOW() + INTERVAL '1 month'
) ON CONFLICT (user_id, fanclub_id) DO NOTHING;

-- Create some sample posts
INSERT INTO posts (id, fanclub_id, author_id, title, content, excerpt, featured_image_url, visibility, like_count, published_at, created_at, updated_at)
VALUES 
(
    'demo-post-1',
    'demo-fanclub-1',
    'demo-user-1',
    'ファンクラブ開設のお知らせ',
    '<h2>クリエイター太郎のアトリエへようこそ！</h2><p>この度、ファンクラブを開設いたしました。こちらでは、イラスト制作の過程や限定コンテンツを共有していきます。</p><h3>予定しているコンテンツ</h3><ul><li>制作過程の動画配信</li><li>限定イラスト公開</li><li>ラフスケッチの共有</li><li>ファンとの交流イベント</li></ul><p>皆様の応援が創作活動の大きな支えになります。一緒に素敵な作品を作っていきましょう！</p>',
    'この度、ファンクラブを開設いたしました！制作過程の共有や限定コンテンツをお楽しみください。',
    'https://via.placeholder.com/600x300/01D3D9/white?text=Welcome+Post',
    'public',
    3,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
),
(
    'demo-post-2',
    'demo-fanclub-1',
    'demo-user-1',
    '新作イラスト制作開始！',
    '<h2>新しいプロジェクトがスタート</h2><p>今回は「桜の下で読書する少女」というテーマで制作を進めていきます。</p><p>制作過程を段階的に公開していく予定です。ラフスケッチから完成まで、一緒に作品が生まれる瞬間を楽しんでください！</p><h3>制作予定</h3><ol><li>コンセプト検討とラフスケッチ</li><li>構図決定と下描き</li><li>色彩設計</li><li>細部描き込み</li><li>仕上げ</li></ol><p>ご意見やアドバイスもお待ちしています。皆さんの声が作品をより良いものにしてくれます。</p>',
    '新作「桜の下で読書する少女」の制作を開始します。制作過程を段階的に公開予定！',
    'https://via.placeholder.com/600x300/FF8C9F/white?text=New+Project',
    'members',
    7,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
),
(
    'demo-post-3',
    'demo-fanclub-1',
    'demo-user-1',
    '今月の制作カレンダー',
    '<h2>4月の制作予定</h2><p>今月の制作スケジュールをお知らせします。</p><table style="width: 100%; border-collapse: collapse;"><tr><th style="border: 1px solid #ddd; padding: 8px;">日程</th><th style="border: 1px solid #ddd; padding: 8px;">内容</th></tr><tr><td style="border: 1px solid #ddd; padding: 8px;">4/1-4/7</td><td style="border: 1px solid #ddd; padding: 8px;">新作ラフスケッチ制作</td></tr><tr><td style="border: 1px solid #ddd; padding: 8px;">4/8-4/14</td><td style="border: 1px solid #ddd; padding: 8px;">構図調整と下描き</td></tr><tr><td style="border: 1px solid #ddd; padding: 8px;">4/15-4/21</td><td style="border: 1px solid #ddd; padding: 8px;">色彩設計</td></tr><tr><td style="border: 1px solid #ddd; padding: 8px;">4/22-4/28</td><td style="border: 1px solid #ddd; padding: 8px;">細部描き込み</td></tr><tr><td style="border: 1px solid #ddd; padding: 8px;">4/29-4/30</td><td style="border: 1px solid #ddd; padding: 8px;">最終調整と完成</td></tr></table><p>途中でライブ配信も予定していますので、お楽しみに！</p>',
    '今月の制作スケジュールをお知らせします。ライブ配信も予定中！',
    null,
    'members',
    2,
    NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '3 hours'
);

-- Add some sample chat messages
-- Note: Chat messages will be handled by the API, this is just for reference
-- Real chat messages will be stored in a separate chat_messages table if needed

-- Clean up any test fanclubs (optional)
-- DELETE FROM fanclubs WHERE name LIKE '%Test%' OR name LIKE '%test%' OR name LIKE '%テスト%';
-- DELETE FROM users WHERE email LIKE '%test%' OR nickname LIKE '%Test%' OR nickname LIKE '%テスト%';