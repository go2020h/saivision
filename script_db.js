// Supabaseクライアントの初期化
// 実際のプロジェクトURLとAnon Keyに置き換えてください
const SUPABASE_URL = 'https://cdpthzwwczpwlypadhbz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkcHRoend3Y3pwd2x5cGFkaGJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3ODc2NzYsImV4cCI6MjA1ODM2MzY3Nn0.woIzlcCR94Niz-WelVqmweSPFqUlTmONrqxTrXl4_z0';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// グローバル変数
let programsData = [];

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadProgramData();
        setupTabEvents();
    } catch (error) {
        console.error('データ読み込みエラー:', error);
        // エラーが発生してもデータを表示する
        programsData = [];
        renderProgramGrid('all');
    }
});

// Supabaseからデータを読み込む
async function loadProgramData() {
    try {
        // 現在の日付を取得
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        console.log('データ読み込み開始');
        
        // Supabaseからデータを読み込む
        const { data, error } = await supabase
            .from('programs')
            .select('*')
            .gte('broadcast_datetime', today.toISOString())
            .lt('broadcast_datetime', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString())
            .order('broadcast_datetime', { ascending: true });
        
        if (error) {
            console.error('Supabaseエラー:', error);
            console.error('エラー詳細:', JSON.stringify(error, null, 2));
            
            // テーブルが存在しない場合はエラーを無視する
            if (error.code === '42P01' || error.message && error.message.includes('relation "programs" does not exist')) {
                console.log('テーブルが存在しないのでデータを表示します');
                programsData = [];
                return;
            }
            
            throw error;
        }
        
        console.log('データ読み込み成功:', data);
        
        programsData = data || [];
        
        // プログラムグリッドを描画
        renderProgramGrid('all');
    } catch (error) {
        console.error('データ読み込みエラー:', error);
        console.error('エラー詳細:', JSON.stringify(error, null, 2));
        programsData = [];
        throw error;
    }
}

// タブイベントの設定
function setupTabEvents() {
    const tabButtons = document.querySelectorAll('.program-tabs .tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // アクティブなタブを変更
            if (this.classList.contains('active')) return;
            
            // アクティブなタブを解除
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // 選択したタブのプログラムグリッドを描画
            const tabId = this.getAttribute('data-tab');
            renderProgramGrid(tabId);
        });
    });
}

// プログラムグリッドを描画
function renderProgramGrid(tabId) {
    // 全てのタブコンテンツを非表示
    document.querySelectorAll('.program-grid.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // 選択したタブのコンテンツを表示
    const targetContent = document.getElementById(`${tabId}-content`);
    if (targetContent) {
        targetContent.classList.add('active');
        
        // プログラムデータをフィルタリング
        let filteredPrograms = programsData;
        if (tabId === 'regular') {
            filteredPrograms = programsData.filter(program => program.program_type === 'コンテンツ');
        } else if (tabId === 'hourly') {
            filteredPrograms = programsData.filter(program => program.program_type === '時間');
        }
        
        // プログラムグリッドを描画
        generateProgramContent(targetContent, filteredPrograms);
    }
}

// プログラムグリッドを描画
function generateProgramContent(container, programs) {
    // 時間列を描画
    const timeColumn = container.querySelector('.time-column');
    if (!timeColumn) return;
    
    timeColumn.innerHTML = '';
    
    // チャンネル列を描画
    const channelColumn = container.querySelector('.channel-column');
    if (!channelColumn) return;
    
    channelColumn.innerHTML = '';
    
    // 時間列を描画 (10:00〜22:00)
    const hours = [];
    for (let i = 10; i <= 22; i++) {
        hours.push(i);
    }
    
    hours.forEach(hour => {
        // 時間ブロックを描画
        const timeBlock = document.createElement('div');
        timeBlock.className = 'time-block';
        timeBlock.textContent = `${hour}:00`;
        timeColumn.appendChild(timeBlock);
        
        // 選択した時間のプログラムをフィルタリング
        const hourPrograms = programs.filter(program => {
            const programTime = new Date(program.broadcast_datetime);
            return programTime.getHours() === hour;
        });
        
        // プログラムブロックを描画
        const programBlock = document.createElement('div');
        programBlock.className = 'program-block';
        
        if (hourPrograms.length > 0) {
            // プログラム情報を描画
            const program = hourPrograms[0]; // 選択した時間のプログラム情報
            
            const programTitle = document.createElement('div');
            programTitle.className = 'program-title';
            programTitle.textContent = program.title;
            programBlock.appendChild(programTitle);
            
            if (program.category) {
                const programCategory = document.createElement('div');
                programCategory.className = `program-category ${program.category}`;
                programCategory.textContent = getCategoryName(program.category);
                programBlock.appendChild(programCategory);
            }
        } else {
            // プログラム情報がなければダッシュを描画
            programBlock.textContent = '-';
        }
        
        channelColumn.appendChild(programBlock);
    });
}

// カテゴリ名を取得
function getCategoryName(categoryCode) {
    const categories = {
        'tech': 'テクノロジー',
        'education': '教育',
        'entertainment': 'エンターテイメント',
        'health': 'ヘルス',
        'news': 'ニュース',
        'art': 'アート',
        'hourly': '時間'
    };
    
    return categories[categoryCode] || categoryCode;
}
