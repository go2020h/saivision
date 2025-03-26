// 管理者ユーザー作成スクリプト
const SUPABASE_URL = 'https://cdpthzwwczpwlypadhbz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkcHRoend3Y3pwd2x5cGFkaGJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3ODc2NzYsImV4cCI6MjA1ODM2MzY3Nn0.woIzlcCR94Niz-WelVqmweSPFqUlTmONrqxTrXl4_z0';

// 管理者ユーザー作成関数
async function createAdminUser() {
  try {
    // Supabaseクライアントの初期化
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    console.log('管理者ユーザーの作成を開始します...');
    
    // 管理者ユーザーの作成
    const { data, error } = await supabaseClient.auth.admin.createUser({
      email: 'admin_saivision@example.com',
      password: 'sMYC#za)7n2T',
      email_confirm: true
    });
    
    if (error) {
      console.error('管理者ユーザー作成エラー:', error);
      console.error('エラー詳細:', JSON.stringify(error, null, 2));
      console.error('エラーメッセージ:', error.message || '不明なエラー');
      
      // 別の方法でユーザー作成を試みる
      console.log('通常のサインアップ方法を試みます...');
      const { data: signUpData, error: signUpError } = await supabaseClient.auth.signUp({
        email: 'admin_saivision@example.com',
        password: 'sMYC#za)7n2T',
      });
      
      if (signUpError) {
        console.error('サインアップエラー:', signUpError);
        console.error('エラー詳細:', JSON.stringify(signUpError, null, 2));
        return;
      }
      
      console.log('サインアップ成功:', signUpData);
      return;
    }
    
    console.log('管理者ユーザーが正常に作成されました。');
    console.log('作成されたユーザー:', data);
    
  } catch (error) {
    console.error('予期せぬエラーが発生しました:', error);
    console.error('エラー詳細:', JSON.stringify(error, null, 2));
  }
}

// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', () => {
  const createUserButton = document.getElementById('create-user-button');
  if (createUserButton) {
    createUserButton.addEventListener('click', createAdminUser);
  }
});
