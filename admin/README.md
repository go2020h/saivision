# AIビジョン 番組表管理システム

## 概要
このシステムは、AIビジョンの番組表データを管理するための管理画面です。Supabaseを使用してデータを保存・管理し、メインサイトに番組情報を表示します。

## 機能
- 番組の追加・編集・削除
- 番組タイプ（コンテンツ/時報）によるフィルタリング
- 日付によるフィルタリング
- ログイン認証システム

## セットアップ手順

### 1. Supabaseプロジェクトの作成
1. [Supabase](https://supabase.com/)にアクセスし、アカウントを作成またはログインします。
2. 新しいプロジェクトを作成します。
3. プロジェクトが作成されたら、「Settings」→「API」からプロジェクトのURLとAnon Keyを取得します。

### 2. データベーステーブルの作成
SupabaseのSQLエディタで以下のSQLを実行してテーブルを作成します：

```sql
CREATE TABLE programs (
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
```

### 3. 認証設定
1. Supabaseダッシュボードの「Authentication」→「Settings」で認証設定を行います。
2. メールアドレス認証を有効にします。
3. 「Users」→「Invite user」から管理者ユーザーを招待します。

### 4. 設定ファイルの更新
`config.js`ファイルを開き、SupabaseのURLとAnon Keyを設定します：

```javascript
const SUPABASE_URL = 'あなたのSupabaseプロジェクトURL';
const SUPABASE_ANON_KEY = 'あなたのSupabaseプロジェクトのAnon Key';
```

同様に、メインサイトの`script_db.js`ファイルも更新します。

## 使用方法

### 管理画面へのアクセス
1. `admin/index.html`にアクセスします。
2. 設定したメールアドレスとパスワードでログインします。

### 番組の追加
1. 左メニューの「番組追加」をクリックします。
2. 必要な情報を入力し、「保存」ボタンをクリックします。

### 番組の編集・削除
1. 「番組一覧」ページで、編集または削除したい番組の操作ボタンをクリックします。
2. 編集の場合は情報を更新して「保存」をクリックします。
3. 削除の場合は確認ダイアログで「削除する」をクリックします。

## トラブルシューティング

### データベース接続エラー
- Supabase URLとAnon Keyが正しく設定されているか確認してください。
- ネットワーク接続を確認してください。

### 認証エラー
- ユーザーが正しく作成されているか確認してください。
- パスワードリセットが必要な場合は、Supabaseダッシュボードから行ってください。

## 技術スタック
- フロントエンド: HTML, CSS, JavaScript
- バックエンド: Supabase (PostgreSQL)
- 認証: Supabase Auth

## 開発者情報
Yunox株式会社
〒150-0044 東京都渋谷区円山町5番5号 Navi渋谷Ⅴ3階
