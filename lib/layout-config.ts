/**
 * MultiChat AI レイアウト設定
 * 統一されたレイアウト値の定義
 */

export const LAYOUT = {
  sidebar: {
    width: 280,        // サイドバーの幅
    collapsed: 64,     // 折りたたみ時
  },
  header: {
    height: 64,        // ヘッダーの高さ
  },
  chat: {
    maxWidth: 1200,    // チャットエリアの最大幅
    padding: 24,       // パディング
  },
  panels: {
    right: 320,        // 右パネルの幅
  },
  message: {
    input: {
      height: 120,     // メッセージ入力欄の高さ
    }
  }
} as const;

// CSS変数として適用
export const applyCSSVariables = () => {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    root.style.setProperty('--sidebar-width', `${LAYOUT.sidebar.width}px`);
    root.style.setProperty('--header-height', `${LAYOUT.header.height}px`);
    root.style.setProperty('--chat-max-width', `${LAYOUT.chat.maxWidth}px`);
    root.style.setProperty('--panel-right', `${LAYOUT.panels.right}px`);
  }
};