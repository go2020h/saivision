// ページネーションのレンダリング
function renderPagination() {
    pagination.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // 前のページボタン
    const prevButton = document.createElement('button');
    prevButton.classList.add('pagination-button');
    prevButton.innerHTML = '&laquo;';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadPrograms();
        }
    });
    pagination.appendChild(prevButton);
    
    // ページ番号ボタン
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.classList.add('pagination-button');
        if (i === currentPage) {
            pageButton.classList.add('active');
        }
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            currentPage = i;
            loadPrograms();
        });
        pagination.appendChild(pageButton);
    }
    
    // 次のページボタン
    const nextButton = document.createElement('button');
    nextButton.classList.add('pagination-button');
    nextButton.innerHTML = '&raquo;';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadPrograms();
        }
    });
    pagination.appendChild(nextButton);
}

// 番組フォームの送信処理
async function handleProgramFormSubmit(e) {
    e.preventDefault();
    
    // フォームデータの取得
    const title = document.getElementById('title').value;
    const broadcastDate = document.getElementById('broadcast-date').value;
    const broadcastTime = document.getElementById('broadcast-time').value;
    const programType = document.getElementById('program-type').value;
    const duration = document.getElementById('duration').value;
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;
    const thumbnailUrl = document.getElementById('thumbnail-url').value;
    
    // 入力チェック
    if (!title || !broadcastDate || !broadcastTime || !programType || !duration) {
        alert('必須項目を入力してください');
        return;
    }
    
    // 日時の変換
    const broadcastDateTime = new Date(`${broadcastDate}T${broadcastTime}:00`);
    
    try {
        let result;
        
        // データの整形
        const programData = {
            title,
            broadcast_datetime: broadcastDateTime.toISOString(),
            program_type: programType,
            duration: parseInt(duration),
            category: category || null,
            description: description || null,
            thumbnail_url: thumbnailUrl || null
        };
        
        if (currentProgramId) {
            // 編集モード
            result = await supabase
                .from('programs')
                .update(programData)
                .eq('id', currentProgramId);
        } else {
            // 新規追加モード
            result = await supabase
                .from('programs')
                .insert(programData);
        }
        
        if (result.error) throw result.error;
        
        // 成功時の処理
        resetForm();
        switchSection('programs');
        loadPrograms();
        alert(currentProgramId ? '番組を更新しました' : '番組を追加しました');
    } catch (error) {
        console.error('番組保存エラー:', error);
        alert('番組の保存に失敗しました');
    }
}

// 番組の編集
async function editProgram(programId) {
    try {
        // 番組データの取得
        const { data, error } = await supabase
            .from('programs')
            .select('*')
            .eq('id', programId)
            .single();
        
        if (error) throw error;
        
        if (!data) {
            alert('番組が見つかりません');
            return;
        }
        
        // フォームにデータを設定
        currentProgramId = data.id;
        document.getElementById('program-id').value = data.id;
        document.getElementById('title').value = data.title;
        
        // 日付と時間の設定
        const broadcastDate = new Date(data.broadcast_datetime);
        const year = broadcastDate.getFullYear();
        const month = (broadcastDate.getMonth() + 1).toString().padStart(2, '0');
        const day = broadcastDate.getDate().toString().padStart(2, '0');
        const hours = broadcastDate.getHours().toString().padStart(2, '0');
        const minutes = broadcastDate.getMinutes().toString().padStart(2, '0');
        
        document.getElementById('broadcast-date').value = `${year}-${month}-${day}`;
        document.getElementById('broadcast-time').value = `${hours}:${minutes}`;
        
        document.getElementById('program-type').value = data.program_type;
        document.getElementById('duration').value = data.duration;
        document.getElementById('category').value = data.category || '';
        document.getElementById('description').value = data.description || '';
        document.getElementById('thumbnail-url').value = data.thumbnail_url || '';
        
        // フォームタイトルの変更
        formTitle.textContent = '番組編集';
        
        // セクションの切り替え
        switchSection('add-program');
    } catch (error) {
        console.error('番組編集エラー:', error);
        alert('番組データの取得に失敗しました');
    }
}

// 削除確認モーダルの表示
function showDeleteConfirmation(programId) {
    currentProgramId = programId;
    deleteModal.classList.remove('hidden');
}

// 番組の削除処理
async function handleDeleteProgram() {
    try {
        const { error } = await supabase
            .from('programs')
            .delete()
            .eq('id', currentProgramId);
        
        if (error) throw error;
        
        // 成功時の処理
        deleteModal.classList.add('hidden');
        loadPrograms();
        alert('番組を削除しました');
    } catch (error) {
        console.error('番組削除エラー:', error);
        alert('番組の削除に失敗しました');
    } finally {
        currentProgramId = null;
    }
}

// フォームのリセット
function resetForm() {
    currentProgramId = null;
    document.getElementById('program-id').value = '';
    document.getElementById('title').value = '';
    document.getElementById('broadcast-date').value = '';
    document.getElementById('broadcast-time').value = '';
    document.getElementById('program-type').value = 'コンテンツ';
    document.getElementById('duration').value = '30';
    document.getElementById('category').value = '';
    document.getElementById('description').value = '';
    document.getElementById('thumbnail-url').value = '';
}
