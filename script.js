// グローバルメニュータブのスライドアニメーション機能
function setupGlobalMenuTabs() {
    console.log('グローバルメニュータブの初期化');
    const menuItems = document.querySelectorAll('.menuGlobal li');
    const menuContainer = document.querySelector('.menuGlobal__container');
    
    if (menuItems.length === 0) {
        console.error('メニューアイテムが見つかりませんでした');
        return;
    }
    
    // 各タブにクリックイベントを追加
    menuItems.forEach((item, index) => {
        item.addEventListener('click', function() {
            // 現在のアクティブタブを取得
            const currentActive = document.querySelector('.menuGlobal li.active');
            const currentIndex = Array.from(menuItems).indexOf(currentActive);
            
            // すでにアクティブなタブをクリックした場合は何もしない
            if (this === currentActive) return;
            
            // アクティブクラスを切り替え
            currentActive.classList.remove('active');
            this.classList.add('active');
            
            // スクロール位置によってメニューの位置を調整
            const headerBottom = document.querySelector('.header').getBoundingClientRect().bottom;
            const bannerHeight = 50; // バナーの高さは50pxと仮定
            
            // スクロール量によってメニューの位置を調整
            if (headerBottom <= bannerHeight) {
                // メニューを固定
                menuContainer.style.position = 'fixed';
                menuContainer.style.top = '0';
                menuContainer.style.left = '0';
                menuContainer.style.width = '100%';
                menuContainer.style.backgroundColor = '#fff';
                menuContainer.style.borderBottom = '1px solid #ddd';
                menuContainer.style.zIndex = '900';
            }
            
            // ページコンテンツを切り替え
            const contentId = this.getAttribute('data-content');
            if (contentId) {
                // スライド方向を決定
                const slideDirection = index > currentIndex ? 'left' : 'right';
                switchPageContent(contentId, slideDirection);
            }
        });
    });
    
    // スクロールイベントを追加してメニューの位置を調整
    window.addEventListener('scroll', function() {
        const headerBottom = document.querySelector('.header').getBoundingClientRect().bottom;
        const bannerHeight = 50; // バナーの高さは50pxと仮定
        
        if (headerBottom <= bannerHeight) {
            // メニューを固定
            menuContainer.style.position = 'fixed';
            menuContainer.style.top = '0';
            menuContainer.style.left = '0';
            menuContainer.style.width = '100%';
            menuContainer.style.backgroundColor = '#fff';
            menuContainer.style.borderBottom = '1px solid #ddd';
            menuContainer.style.zIndex = '900';
        } else {
            // メニューの固定を解除
            menuContainer.style.position = 'static';
            menuContainer.style.borderBottom = 'none';
        }
    });
    
    console.log('グローバルメニュータブの初期化完了');
}

// ページコンテンツを切り替える関数を定義
function switchPageContent(contentId, direction) {
    console.log(`コンテンツを切り替えます: ${contentId} (${direction})`);
    
    // 現在のアクティブコンテンツを取得
    const currentContent = document.querySelector('.page-content.active');
    if (!currentContent) return;
    
    // 新しいコンテンツを取得
    const newContent = document.getElementById(contentId);
    if (!newContent) {
        console.error(`コンテンツID ${contentId} が見つかりませんでした`);
        return;
    }
    
    // 同じコンテンツをクリックした場合は何もしない
    if (currentContent === newContent) return;
    
    // アニメーションクラスを設定
    if (direction === 'left') {
        currentContent.classList.add('slide-out-left');
        newContent.classList.add('slide-in-right');
    } else if (direction === 'right') {
        currentContent.classList.add('slide-out-right');
        newContent.classList.add('slide-in-left');
    } else {
        // アニメーションなし
        currentContent.classList.remove('active');
        newContent.classList.add('active');
        return;
    }
    
    // アニメーション完了後にクラスを切り替え
    setTimeout(() => {
        currentContent.classList.remove('active', 'slide-out-left', 'slide-out-right');
        newContent.classList.add('active');
        newContent.classList.remove('slide-in-left', 'slide-in-right');
    }, 500); // アニメーション時間を500msに設定
}

// 番組表のタブ機能
function setupProgramTabs() {
    const tabButtons = document.querySelectorAll('.program-tabs .tab-button');
    const tabContents = document.querySelectorAll('.program-grid.tab-content');
    
    if (tabButtons.length === 0 || tabContents.length === 0) {
        console.error('番組表のタブまたはコンテンツが見つかりませんでした');
        return;
    }
    
    console.log(`番組表のタブ数: ${tabButtons.length}, コンテンツ数: ${tabContents.length}`);
    
    // 各タブボタンにクリックイベントを追加
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // すでにアクティブな場合は何もしない
            if (this.classList.contains('active')) return;
            
            // アクティブクラスを切り替え
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // 対応するコンテンツを表示
            const tabId = this.getAttribute('data-tab');
            const targetContent = document.getElementById(`${tabId}-content`);
            
            if (targetContent) {
                // すべてのコンテンツを非表示にして、ターゲットのみ表示
                tabContents.forEach(content => content.classList.remove('active'));
                targetContent.classList.add('active');
                console.log(`番組表タブ切り替え: ${tabId}`);
            } else {
                console.error(`タブコンテンツ ${tabId}-content が見つかりません`);
            }
        });
    });
    
    console.log('番組表のタブ機能の初期化完了');
}

// ナビゲーションのホームボタンとロゴのクリックイベント設定
function setupNavigationLinks() {
    // ホームボタンのクリックイベント
    const homeButton = document.querySelector('.iconMenu__home');
    if (homeButton) {
        homeButton.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // ロゴのクリックイベント
    const logo = document.querySelector('.logo a');
    if (logo) {
        logo.addEventListener('click', function(e) {
            e.preventDefault(); // デフォルトの挙動をキャンセル
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// ページの読み込みが完了したら初期化を実行
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoadedイベントが発生しました');
    setupGlobalMenuTabs(); // グローバルメニュータブの初期化を実行
    setupProgramTabs(); // 番組表のタブ機能の初期化を実行
    setupNavigationLinks(); // ナビゲーションリンクの設定
});
