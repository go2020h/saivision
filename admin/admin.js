// グローバル変数
let currentPage = 1;
let totalPages = 1;
let pageSize = 10;
let currentProgramId = null;
let programs = [];

// DOM要素の参照を取得
const loginContainer = document.getElementById('login-container');
const adminContainer = document.getElementById('admin-container');
const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');
const loginError = document.getElementById('login-error');
const userEmail = document.getElementById('user-email');
const programsSection = document.getElementById('programs-section');
const addProgramSection = document.getElementById('add-program-section');
const programForm = document.getElementById('program-form');
const formTitle = document.getElementById('form-title');
const programsTableBody = document.getElementById('programs-table-body');
const pagination = document.getElementById('pagination');
const deleteModal = document.getElementById('delete-modal');
const confirmDeleteButton = document.getElementById('confirm-delete');
const cancelDeleteButton = document.getElementById('cancel-delete');

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
});

// アプリケーションの初期化
async function initializeApp() {
    // セッションの確認
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
        // ログイン済みの場合は管理画面を表示
        showAdminInterface(session.user);
        loadPrograms();
    } else {
        // 未ログインの場合はログイン画面を表示
        showLoginInterface();
    }
}

// イベントリスナーの設定
function setupEventListeners() {
    // ログインボタン
    loginButton.addEventListener('click', handleLogin);
    
    // ログアウトボタン
    logoutButton.addEventListener('click', handleLogout);
    
    // ナビゲーションリンク
    document.querySelectorAll('.admin-nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.target.getAttribute('data-section');
            switchSection(section);
        });
    });
    
    // 番組フォーム
    programForm.addEventListener('submit', handleProgramFormSubmit);
    
    // キャンセルボタン
    document.getElementById('cancel-button').addEventListener('click', () => {
        resetForm();
        switchSection('programs');
    });
    
    // フィルターボタン
    document.getElementById('filter-button').addEventListener('click', () => {
        currentPage = 1;
        loadPrograms();
    });
    
    // フィルターリセットボタン
    document.getElementById('reset-filter-button').addEventListener('click', () => {
        document.getElementById('type-filter').value = 'all';
        document.getElementById('date-filter').value = '';
        currentPage = 1;
        loadPrograms();
    });
    
    // 削除モーダルのキャンセルボタン
    cancelDeleteButton.addEventListener('click', () => {
        deleteModal.classList.add('hidden');
    });
    
    // 削除確認ボタン
    confirmDeleteButton.addEventListener('click', handleDeleteProgram);
}

// ログイン処理
async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        loginError.textContent = 'メールアドレスとパスワードを入力してください';
        return;
    }
    
    try {
        // Supabaseログイン
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        
        showAdminInterface(data.user);
        loadPrograms();
    } catch (error) {
        console.error('ログインエラー:', error);
        loginError.textContent = 'ログインに失敗しました。認証情報を確認してください。';
    }
}

// ログアウト処理
async function handleLogout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        showLoginInterface();
    } catch (error) {
        console.error('ログアウトエラー:', error);
        alert('ログアウトに失敗しました。');
    }
}

// ログイン画面の表示
function showLoginInterface() {
    loginContainer.classList.remove('hidden');
    adminContainer.classList.add('hidden');
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    loginError.textContent = '';
}

// 管理画面の表示
function showAdminInterface(user) {
    loginContainer.classList.add('hidden');
    adminContainer.classList.remove('hidden');
    userEmail.textContent = user.email;
}

// セクションの切り替え
function switchSection(sectionName) {
    // ナビゲーションリンクのアクティブ状態を更新
    document.querySelectorAll('.admin-nav a').forEach(link => {
        if (link.getAttribute('data-section') === sectionName) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // セクションの表示/非表示を切り替え
    if (sectionName === 'programs') {
        programsSection.classList.remove('hidden');
        addProgramSection.classList.add('hidden');
    } else if (sectionName === 'add-program') {
        programsSection.classList.add('hidden');
        addProgramSection.classList.remove('hidden');
        resetForm();
        formTitle.textContent = '番組追加';
    }
}

// 番組データの読み込み
async function loadPrograms() {
    try {
        // フィルター条件の取得
        const typeFilter = document.getElementById('type-filter').value;
        const dateFilter = document.getElementById('date-filter').value;
        
        console.log('番組データの読み込み - フィルター:', { typeFilter, dateFilter });
        
        // クエリの構築
        let query = supabase.from('programs').select('*', { count: 'exact' });
        
        // タイプフィルターの適用
        if (typeFilter !== 'all') {
            query = query.eq('program_type', typeFilter);
        }
        
        // 日付フィルターの適用
        if (dateFilter) {
            const startDate = new Date(dateFilter);
            startDate.setHours(0, 0, 0, 0);
            
            const endDate = new Date(dateFilter);
            endDate.setHours(23, 59, 59, 999);
            
            query = query.gte('broadcast_datetime', startDate.toISOString())
                         .lte('broadcast_datetime', endDate.toISOString());
        }
        
        // ページネーションの適用
        const from = (currentPage - 1) * pageSize;
        const to = from + pageSize - 1;
        
        console.log('Supabaseクエリ:', { from, to });
        
        // データの取得
        const { data, error, count } = await query
            .order('broadcast_datetime', { ascending: true })
            .range(from, to);
        
        if (error) {
            console.error('Supabaseクエリエラー:', error);
            console.error('エラー詳細:', JSON.stringify(error, null, 2));
            
            // エラー処理
            if (error.code === '42P01' || error.message.includes('relation "programs" does not exist')) {
                console.log('テーブルが存在しないので、テーブルを作成してください。');
                // テーブルを作成する
                programs = [];
                totalPages = 0;
                renderProgramsTable();
                renderPagination();
                return;
            }
            
            throw error;
        }
        
        console.log('取得データ:', data);
        console.log('データ数:', count);
        
        // 結果の処理
        programs = data || [];
        totalPages = Math.ceil((count || 0) / pageSize);
        
        // テーブルとページネーションの更新
        renderProgramsTable();
        renderPagination();
    } catch (error) {
        console.error('番組データの読み込みエラー:', error);
        console.error('エラー詳細:', JSON.stringify(error, null, 2));
        console.log('エラーが発生したので、テーブルを作成してください。');
        
        // エラー処理
        programs = [];
        totalPages = 0;
        renderProgramsTable();
        renderPagination();
    }
}

// 番組テーブルのレンダリング
function renderProgramsTable() {
    programsTableBody.innerHTML = '';
    
    if (programs.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="6" style="text-align: center;">番組が見つかりません</td>`;
        programsTableBody.appendChild(row);
        return;
    }
    
    programs.forEach(program => {
        const row = document.createElement('tr');
        
        // 日時のフォーマット
        const broadcastDate = new Date(program.broadcast_datetime);
        const formattedDate = `${broadcastDate.getFullYear()}/${(broadcastDate.getMonth() + 1).toString().padStart(2, '0')}/${broadcastDate.getDate().toString().padStart(2, '0')} ${broadcastDate.getHours().toString().padStart(2, '0')}:${broadcastDate.getMinutes().toString().padStart(2, '0')}`;
        
        row.innerHTML = `
            <td>${program.title}</td>
            <td>${formattedDate}</td>
            <td>${program.program_type}</td>
            <td>${program.category || '-'}</td>
            <td>${program.duration}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-button edit-button" data-id="${program.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                        </svg>
                    </button>
                    <button class="action-button delete-button" data-id="${program.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                            <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                        </svg>
                    </button>
                </div>
            </td>
        `;
        
        programsTableBody.appendChild(row);
    });
    
    // 編集ボタンのイベントリスナー
    document.querySelectorAll('.edit-button').forEach(button => {
        button.addEventListener('click', () => {
            const programId = button.getAttribute('data-id');
            editProgram(programId);
        });
    });
    
    // 削除ボタンのイベントリスナー
    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', () => {
            const programId = button.getAttribute('data-id');
            showDeleteConfirmation(programId);
        });
    });
}
