// Supabaseテーブル作成スクリプト
const SUPABASE_URL = 'https://cdpthzwwczpwlypadhbz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkcHRoend3Y3pwd2x5cGFkaGJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3ODc2NzYsImV4cCI6MjA1ODM2MzY3Nn0.woIzlcCR94Niz-WelVqmweSPFqUlTmONrqxTrXl4_z0';

// テーブル作成用のSQL
const createTableSQL = `
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  broadcast_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  program_type VARCHAR(50) NOT NULL CHECK (program_type IN ('コンテンツ', '時報')),
  description TEXT,
  duration INTEGER NOT NULL DEFAULT 30,
  category VARCHAR(50),
  thumbnail_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- セキュリティ設定: Row Level Security (RLS) の設定
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

-- 読み取りポリシー: 全ユーザーが読み取り可能
CREATE POLICY "Anyone can read programs" ON programs
  FOR SELECT USING (true);

-- 書き込みポリシー: 認証済みユーザーのみ書き込み可能
CREATE POLICY "Authenticated users can insert programs" ON programs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 更新ポリシー: 認証済みユーザーのみ更新可能
CREATE POLICY "Authenticated users can update programs" ON programs
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 削除ポリシー: 認証済みユーザーのみ削除可能
CREATE POLICY "Authenticated users can delete programs" ON programs
  FOR DELETE USING (auth.role() = 'authenticated');

-- 更新時に自動でupdated_atを更新するトリガー
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_programs_updated_at
BEFORE UPDATE ON programs
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
`;

// サンプルデータ
const sampleDataSQL = `
INSERT INTO programs (title, broadcast_datetime, program_type, description, duration, category) VALUES
('AIが選ぶ今週のトレンド技術', '2025-03-24T10:00:00+09:00', 'コンテンツ', '最新のトレンド技術を解説する番組', 30, 'tech'),
('最新の画像生成AIモデルを比較', '2025-03-24T11:00:00+09:00', 'コンテンツ', '各種画像生成AIの比較と使い方', 45, 'tech'),
('AI時報', '2025-03-24T12:00:00+09:00', '時報', '正午の時報とニュース', 5, 'hourly'),
('健康とAI', '2025-03-24T13:00:00+09:00', 'コンテンツ', 'AIを活用した健康管理の方法', 30, 'health'),
('AI時報', '2025-03-24T14:00:00+09:00', '時報', '14時の時報とニュース', 5, 'hourly'),
('プログラミング入門', '2025-03-24T15:00:00+09:00', 'コンテンツ', '初心者向けプログラミング講座', 60, 'education'),
('AI時報', '2025-03-24T16:00:00+09:00', '時報', '16時の時報とニュース', 5, 'hourly'),
('デジタルアートの世界', '2025-03-24T17:00:00+09:00', 'コンテンツ', 'AIを使ったデジタルアートの作り方', 30, 'art'),
('AI時報', '2025-03-24T18:00:00+09:00', '時報', '18時の時報とニュース', 5, 'hourly'),
('今日のニュースハイライト', '2025-03-24T19:00:00+09:00', 'コンテンツ', '今日の重要ニュースをAIが解説', 30, 'news'),
('AI時報', '2025-03-24T20:00:00+09:00', '時報', '20時の時報とニュース', 5, 'hourly'),
('AIエンタメショー', '2025-03-24T21:00:00+09:00', 'コンテンツ', 'AIが生成したエンタメ番組', 45, 'entertainment'),
('AI時報', '2025-03-24T22:00:00+09:00', '時報', '22時の時報とニュース', 5, 'hourly');
`;

// テーブル作成関数
async function createTables() {
  try {
    // Supabaseクライアントの初期化
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    console.log('テーブル作成を開始します...');
    
    // テーブル作成SQLの実行
    const { data: createData, error: createError } = await supabaseClient.rpc('exec_sql', { query: createTableSQL });
    
    if (createError) {
      console.error('テーブル作成エラー:', createError);
      console.error('エラー詳細:', JSON.stringify(createError, null, 2));
      console.error('エラーメッセージ:', createError.message || '不明なエラー');
      console.error('ヒント: SupabaseのコンソールでSQLエディターを使用してテーブルを作成してみてください。');
      return;
    }
    
    console.log('テーブルが正常に作成されました。サンプルデータを挿入します...');
    
    // サンプルデータ挿入SQLの実行
    const { data: insertData, error: insertError } = await supabaseClient.rpc('exec_sql', { query: sampleDataSQL });
    
    if (insertError) {
      console.error('サンプルデータ挿入エラー:', insertError);
      console.error('エラー詳細:', JSON.stringify(insertError, null, 2));
      console.error('エラーメッセージ:', insertError.message || '不明なエラー');
      return;
    }
    
    console.log('サンプルデータが正常に挿入されました。');
    console.log('データベースのセットアップが完了しました!');
    
  } catch (error) {
    console.error('予期せぬエラーが発生しました:', error);
    console.error('エラー詳細:', JSON.stringify(error, null, 2));
    console.error('エラーメッセージ:', error.message || '不明なエラー');
  }
}

// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', () => {
  const createButton = document.getElementById('create-tables-button');
  if (createButton) {
    createButton.addEventListener('click', createTables);
  }
});
