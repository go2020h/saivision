// グローバルメニュータブのスライドアニメーション機能
function setupGlobalMenuTabs() {
    console.log('グローバルメニュータブの初期化');
    const menuItems = document.querySelectorAll('.menuGlobal li');
    const menuContainer = document.querySelector('.menuGlobal__container');
    const appBanner = document.querySelector('.app');
    
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
                menuContainer.style.top = appBanner.classList.contains('hidden') ? '0' : bannerHeight + 'px';
                menuContainer.style.left = '0';
                menuContainer.style.width = '100%';
                menuContainer.style.backgroundColor = '#fff'; // 背景色を白に設定
                menuContainer.style.borderBottom = '1px solid #ddd'; // 下線を追加
                menuContainer.style.zIndex = '900'; // z-indexを設定
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
    
    console.log('グローバルメニュータブの初期化完了');
}
