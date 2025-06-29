-- FCMトークン管理テーブルの作成
CREATE TABLE IF NOT EXISTS fcm_tokens (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_user_id ON fcm_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_is_admin ON fcm_tokens(is_admin);

-- RLS（Row Level Security）の設定
ALTER TABLE fcm_tokens ENABLE ROW LEVEL SECURITY;

-- 管理者は全トークンを読み取り可能
CREATE POLICY "Admin can read all tokens" ON fcm_tokens
  FOR SELECT USING (auth.role() = 'authenticated');

-- ユーザーは自分のトークンのみ挿入・更新可能
CREATE POLICY "Users can insert their own tokens" ON fcm_tokens
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own tokens" ON fcm_tokens
  FOR UPDATE USING (auth.uid()::text = user_id);

-- 管理者トークンの挿入用ポリシー（認証なしでも可能）
CREATE POLICY "Allow admin token insertion" ON fcm_tokens
  FOR INSERT WITH CHECK (user_id = 'admin');

CREATE POLICY "Allow admin token updates" ON fcm_tokens
  FOR UPDATE USING (user_id = 'admin'); 