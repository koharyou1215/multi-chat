# コードベース リファクタリング計画

**作成日**: 2025-10-03
**プロジェクト**: multi-chat
**目的**: コードの視認性改善、重複削除、組織化の最適化

## 🎯 実行サマリー

更新や修正が反映されないことが多いため、コード全体の視認性を改善し、重複や複雑さを削減する必要があります。

### 主な課題
1. **ストア管理の重複** - 2つのストアファイルに重複した機能
2. **定数の分散** - 複数ファイルに散らばった定数定義
3. **大きなコンポーネント** - 480-707行の巨大ファイル
4. **スタイルの重複** - 同じCSSパターンの繰り返し
5. **デバッグコードの残留** - 本番コードに残るconsole.log

---

## 📊 コードベース分析結果

### ファイルサイズ分析
```
707行  store/chat-store.ts          ⚠️ 最大 - リファクタリング必要
546行  components/broadcast-input.tsx  ⚠️ 分割検討
480行  components/main-layout.tsx      ⚠️ 分割検討
445行  components/prompt-library.tsx
359行  components/model-selector.tsx
```

### 重複パターン検出

#### 1. ストア管理の重複
- **場所**:
  - `store/chat-store.ts` (707行)
  - `store/use-app-store.ts` (217行 - ラッパー)
- **問題**: 互換性レイヤーとして use-app-store が存在するが、統合されていない
- **影響度**: 🔴 高 - 状態管理の一貫性に影響

#### 2. 定数の分散
- **場所**:
  - `lib/constants.ts` - パネル、ボタン、色、アニメーション
  - `lib/utils/constants.ts` - アプリ、ストレージ、ホットキー
  - `lib/z-index.ts` - z-index管理
- **問題**: 関連する定数が複数ファイルに分散
- **影響度**: 🟡 中 - 保守性に影響

#### 3. スタイルの重複
- **検出結果**:
  - `glass-dark` / `backdrop-blur`: 413箇所
  - `min-h-[44px]` / `min-w-[44px]`: 14箇所
- **問題**: Touch target サイズがハードコードされている
- **影響度**: 🟢 低 - 定数化で解決可能

#### 4. コンソールログの多用
- **検出結果**: 多数のデバッグログが本番コードに残留
- **場所**:
  - `main-layout.tsx`: 複数の console.log
  - `broadcast-input.tsx`: デバッグコンソール
  - `chat-store.ts`: ストア操作のログ
- **問題**: 本番環境でのパフォーマンス影響
- **影響度**: 🟡 中 - 環境別ロギングが必要

---

## 🏗️ アーキテクチャ分析

### 現在の構造

```
multi-chat/
├── app/                    # Next.js App Router
│   ├── components/        # App-level components
│   ├── page.tsx          # メインページ
│   └── layout.tsx        # ルートレイアウト
├── components/            # 共有コンポーネント
│   ├── chat-panel/       # チャットパネル関連
│   ├── command/          # コマンドパレット
│   ├── panel-features/   # パネル機能
│   └── ui/               # UIプリミティブ
├── store/                 # 状態管理
│   ├── chat-store.ts     # メインストア (707行)
│   └── use-app-store.ts  # 互換レイヤー (217行)
├── lib/                   # ユーティリティ
│   ├── api/              # API クライアント
│   ├── commands/         # コマンド処理
│   ├── utils/            # ユーティリティ関数
│   ├── constants.ts      # UI定数
│   └── z-index.ts        # z-index管理
├── hooks/                 # カスタムフック
├── types/                 # TypeScript型定義
└── styles/                # グローバルスタイル
```

### アーキテクチャ上の問題

#### 1. ストア統合の未完了
- **現状**: chat-store.ts が完全版、use-app-store.ts が互換レイヤー
- **問題**: 移行が中途半端、どちらを使うか不明確
- **推奨**: chat-store.ts への完全統合

#### 2. コンポーネント責務の肥大化
- **main-layout.tsx** (480行):
  - レイアウト管理
  - サイドバー制御
  - パネル管理
  - モーダル管理
  - レスポンシブ処理
- **broadcast-input.tsx** (546行):
  - 入力管理
  - ファイル添付
  - プロンプト選択
  - 最適化機能
  - メッセージ送信

#### 3. 定数管理の不統一
```typescript
// lib/constants.ts
export const PANEL_CONFIG = { MAX_PANELS: 4 }

// lib/utils/constants.ts
export const MAX_PANEL_COUNT = 6  // ❌ 矛盾！

// components/main-layout.tsx
const MAX_PANELS = 4  // ❌ 重複！
```

---

## 📋 リファクタリング計画

### Phase 1: 緊急度 🔴 (Week 1)

#### 1.1 ストア統合
**目的**: 状態管理の一本化と一貫性確保

**タスク**:
```typescript
// ✅ 完了目標
1. use-app-store.ts を段階的に削除
2. すべてのコンポーネントを chat-store.ts に移行
3. 型定義の統一と整理
4. テストで互換性確認
```

**影響範囲**:
- `store/use-app-store.ts` → 削除
- `components/**/*.tsx` → インポート更新
- `hooks/use-openrouter.ts` → ストア参照更新

**期待効果**:
- コード削減: ~217行
- 状態管理の一貫性向上
- バグの減少

---

#### 1.2 定数の統合
**目的**: 定数の一元管理と矛盾解消

**タスク**:
```typescript
// lib/config/index.ts (新規)
export const CONFIG = {
  // UI Settings
  TOUCH_TARGET: {
    MIN_SIZE: 44,  // pt - iOS推奨
    MIN_HEIGHT: '44px',
    MIN_WIDTH: '44px',
  },

  // Panel Settings
  PANEL: {
    MIN_COUNT: 1,
    MAX_COUNT: 4,  // ✅ 統一
    DEFAULT_COUNT: 2,
  },

  // Timing
  TIMING: {
    STYLE_FORCE_DELAY: 100,
    SCROLL_THRESHOLD: 100,
    // ... 既存の TIMING を移動
  },

  // Z-Index (z-index.ts から移動)
  Z_INDEX: {
    HEADER: 50,
    FOOTER: 55,
    // ...
  },

  // Styles
  STYLES: {
    GLASS_DARK: 'glass-dark backdrop-blur-xl',
    GLASS_MEDIUM: 'glass backdrop-blur-2xl',
    // ...
  }
} as const;

// 既存ファイルの削除/統合
// ❌ lib/constants.ts → 統合
// ❌ lib/utils/constants.ts → 統合
// ❌ lib/z-index.ts → 統合
```

**影響範囲**:
- `lib/constants.ts` → 削除/統合
- `lib/utils/constants.ts` → 削除/統合
- `lib/z-index.ts` → 統合
- すべての定数インポート → `@/lib/config` に更新

**期待効果**:
- 定数の矛盾解消
- 単一の真実の源泉
- インポートパスの簡素化

---

### Phase 2: 重要度 🟡 (Week 2)

#### 2.1 main-layout.tsx のリファクタリング
**目的**: 480行のコンポーネントを責務別に分割

**分割計画**:
```typescript
// components/layout/MainLayout.tsx (100行)
// - レイアウト構造のみ
// - 各セクションの配置
export function MainLayout() {
  return (
    <div className="app-shell">
      <Header />
      <Sidebar />
      <MainContent />
      <Footer />
    </div>
  );
}

// components/layout/Header.tsx (80行)
// - ヘッダーUI
// - ボタン配置
export function Header() { ... }

// components/layout/Sidebar.tsx (120行)
// - サイドバーUI
// - パネルコントロール
// - クイックアクション
export function Sidebar() { ... }

// components/layout/MainContent.tsx (100行)
// - メインコンテンツエリア
// - パネルグリッド
export function MainContent() { ... }

// components/layout/Footer.tsx (40行)
// - フッターUI
// - BroadcastInput配置
export function Footer() { ... }

// hooks/useLayoutState.ts (60行)
// - レイアウト状態管理
// - レスポンシブロジック
export function useLayoutState() { ... }
```

**期待効果**:
- コード削減: 480行 → 5ファイル合計400行
- 責務の明確化
- テスト容易性向上

---

#### 2.2 broadcast-input.tsx のリファクタリング
**目的**: 546行のコンポーネントを機能別に分割

**分割計画**:
```typescript
// components/input/BroadcastInput.tsx (80行)
// - メインコンテナ
// - 各機能の統合
export function BroadcastInput() {
  return (
    <div className="broadcast-input">
      <AttachmentPreview />
      <InputBar>
        <PromptSelector />
        <TextInput />
        <SendControls />
      </InputBar>
    </div>
  );
}

// components/input/AttachmentPreview.tsx (60行)
// - 添付ファイルプレビュー
export function AttachmentPreview() { ... }

// components/input/PromptSelector.tsx (150行)
// - プロンプトメニュー
// - プロンプト選択UI
export function PromptSelector() { ... }

// components/input/TextInput.tsx (80行)
// - ContentEditable入力
// - アクティブプロンプト表示
export function TextInput() { ... }

// components/input/SendControls.tsx (80行)
// - 送信ボタン
// - 最適化ボタン
export function SendControls() { ... }

// hooks/useMessageSender.ts (96行)
// - メッセージ送信ロジック
// - プロンプト処理
export function useMessageSender() { ... }
```

**期待効果**:
- コード削減: 546行 → 5ファイル+1フック 合計546行 (構造改善)
- 機能の明確化
- 再利用性向上

---

#### 2.3 スタイル定数化
**目的**: ハードコードされたスタイルの定数化

**実装**:
```typescript
// lib/config/index.ts に追加
export const UI = {
  TOUCH: {
    MIN_SIZE: 44,
    className: 'min-h-[44px] min-w-[44px]',
  },
  GLASS: {
    DARK: 'glass-dark backdrop-blur-xl',
    MEDIUM: 'glass backdrop-blur-2xl',
    LIGHT: 'glass backdrop-blur-lg',
  },
  SPACING: {
    HEADER_HEIGHT: '56px',
    FOOTER_HEIGHT: '100px',
    SIDEBAR_WIDTH: '256px',
  },
} as const;

// 使用例
import { UI } from '@/lib/config';

<button className={UI.TOUCH.className}>
  クリック
</button>
```

**影響範囲**: 全コンポーネント (14箇所のmin-h-[44px]を置換)

---

### Phase 3: 最適化 🟢 (Week 3)

#### 3.1 ロギングシステム導入
**目的**: デバッグログの環境別制御

**実装**:
```typescript
// lib/utils/logger.ts (新規)
const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  debug: (...args: unknown[]) => {
    if (isDev) console.log('🔍', ...args);
  },
  info: (...args: unknown[]) => {
    if (isDev) console.info('ℹ️', ...args);
  },
  warn: (...args: unknown[]) => {
    console.warn('⚠️', ...args);
  },
  error: (...args: unknown[]) => {
    console.error('❌', ...args);
  },
  store: (action: string, data?: unknown) => {
    if (isDev) console.log('🗄️', action, data);
  },
  panel: (panelId: string, event: string, data?: unknown) => {
    if (isDev) console.log(`🎨 Panel ${panelId}:`, event, data);
  },
};

// 使用例
// Before:
console.log("🔄 Store rehydrated:", state);

// After:
logger.store("Store rehydrated", state);
```

**置換対象**:
- すべての `console.log` → `logger.debug`
- すべての `console.error` → `logger.error`

**期待効果**:
- 本番環境でのログ無効化
- パフォーマンス向上
- ログの構造化

---

#### 3.2 型定義の整理
**目的**: 重複型定義の削除と統合

**実装**:
```typescript
// types/index.ts の整理

// ❌ 削除: 重複した型
// - Prompt と CustomPrompt が類似 → 統合
// - ChatState に activePanels と activePanelIds が重複 → 統一

// ✅ 整理後
export interface Prompt {
  id: string;
  title: string;
  content: string;
  description?: string;
  category: string;
  tags: string[];
  variables?: PromptVariable[];

  // メタデータ
  isFavorite: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
  lastUsed?: Date;

  // 最適化情報
  isOptimized?: boolean;
  originalContent?: string;
}

// CustomPrompt を削除し、Prompt に統合
```

---

#### 3.3 ユーティリティ関数の整理
**目的**: lib/utils.ts の機能別分割

**分割計画**:
```typescript
// lib/utils/index.ts (エクスポートのみ)
export * from './class-names';
export * from './id-generator';
export * from './formatters';
export * from './validators';
export * from './safari-utils';

// lib/utils/class-names.ts
export function cn(...inputs: ClassValue[]) { ... }

// lib/utils/id-generator.ts
export function generateId(prefix?: string) { ... }

// lib/utils/formatters.ts
export function formatTimestamp() { ... }
export function formatFileSize() { ... }
export function truncateText() { ... }

// lib/utils/validators.ts
export function validateApiKey() { ... }
export function isImageFile() { ... }

// lib/utils/safari-utils.ts
export const SafariUtils = { ... }

// lib/utils/performance.ts (既存)
export function debounce() { ... }
export function throttle() { ... }
```

---

### Phase 4: パフォーマンス最適化 ⚡ (Week 4)

#### 4.1 メモ化の最適化
**場所**:
- `components/chat-panel/ChatPanel.tsx`
- `components/main-layout.tsx`

**実装**:
```typescript
// 不要な再レンダリングを防ぐ
const memoizedPanels = useMemo(
  () => panels.slice(0, activePanels),
  [panels, activePanels]
);

// コールバックの最適化
const handleSend = useCallback(() => {
  // ...
}, [dependencies]);
```

#### 4.2 仮想スクロールの導入
**場所**: `components/chat-panel/MessageList.tsx`

**条件**: メッセージ数 > 50

**実装済み**: `VirtualScroller.tsx` を活用

---

## 📝 実装チェックリスト

### Phase 1: 緊急 (Week 1)
- [ ] 1.1 ストア統合
  - [ ] use-app-store.ts の依存関係を調査
  - [ ] chat-store.ts への移行マッピング作成
  - [ ] コンポーネント単位で段階的移行
  - [ ] テスト実行・確認
  - [ ] use-app-store.ts 削除

- [ ] 1.2 定数統合
  - [ ] lib/config/index.ts 作成
  - [ ] 既存定数を集約
  - [ ] z-index.ts の統合
  - [ ] 全ファイルのインポート更新
  - [ ] 旧ファイル削除

### Phase 2: 重要 (Week 2)
- [ ] 2.1 MainLayout 分割
  - [ ] Header.tsx 抽出
  - [ ] Sidebar.tsx 抽出
  - [ ] MainContent.tsx 抽出
  - [ ] Footer.tsx 抽出
  - [ ] useLayoutState.ts 作成

- [ ] 2.2 BroadcastInput 分割
  - [ ] AttachmentPreview.tsx 抽出
  - [ ] PromptSelector.tsx 抽出
  - [ ] TextInput.tsx 抽出
  - [ ] SendControls.tsx 抽出
  - [ ] useMessageSender.ts 作成

- [ ] 2.3 スタイル定数化
  - [ ] UI定数を lib/config に追加
  - [ ] Touch targetサイズを定数化
  - [ ] Glass effectスタイルを定数化

### Phase 3: 最適化 (Week 3)
- [ ] 3.1 ロギングシステム
  - [ ] lib/utils/logger.ts 作成
  - [ ] console.log を logger.debug に置換
  - [ ] 環境別ログ制御確認

- [ ] 3.2 型定義整理
  - [ ] Prompt / CustomPrompt 統合
  - [ ] ChatState の重複フィールド削除
  - [ ] 型エクスポートの整理

- [ ] 3.3 ユーティリティ分割
  - [ ] lib/utils/ サブモジュール作成
  - [ ] 機能別ファイル分割
  - [ ] インポートパス更新

### Phase 4: パフォーマンス (Week 4) ✅ 完了
- [x] 4.1 メモ化最適化
  - [x] useMemo の適切な適用
  - [x] useCallback の適切な適用
  - [x] React DevTools で検証

- [x] 4.2 仮想スクロール
  - [x] VirtualScroller の統合確認
  - [x] パフォーマンステスト

---

## 🎯 期待される成果

### コード品質
- ✅ コード行数削減: ~1,000行減 (重複削除)
- ✅ ファイル数最適化: 大規模ファイルの分割
- ✅ 責務の明確化: 単一責任原則の適用

### 開発体験
- ✅ 修正の反映速度向上
- ✅ コードの見通し改善
- ✅ バグ発見の容易化

### パフォーマンス
- ✅ 本番ビルドサイズ削減 (console.log削除)
- ✅ レンダリング最適化
- ✅ 初期ロード高速化

### 保守性
- ✅ 定数の一元管理
- ✅ 型の一貫性
- ✅ テスト容易性

---

## ⚠️ リスクと対策

### リスク1: 大規模変更による破壊的変更
**対策**:
- 段階的な移行 (Phase単位で実施)
- 各Phaseでテスト実行
- git ブランチ戦略 (feature/refactor-phase-N)

### リスク2: 既存機能への影響
**対策**:
- E2Eテストの実行 (Playwright)
- 手動テスト checklist
- ステージング環境での確認

### リスク3: チーム内の認識齟齬
**対策**:
- Phase開始前のレビュー
- 進捗の定期共有
- ドキュメント更新

---

## 📅 実施スケジュール

| Week | Phase | タスク | 優先度 |
|------|-------|--------|--------|
| 1 | Phase 1 | ストア統合・定数統合 | 🔴 緊急 |
| 2 | Phase 2 | コンポーネント分割・スタイル定数化 | 🟡 重要 |
| 3 | Phase 3 | ロギング・型整理・ユーティリティ分割 | 🟢 最適化 |
| 4 | Phase 4 | パフォーマンス最適化 | ⚡ 高速化 |

---

## 🔄 継続的改善

リファクタリング完了後も以下を継続:

1. **コードレビュー強化**
   - 新規コードでの重複チェック
   - 定数の適切な使用確認

2. **自動化ツール導入**
   - ESLint ルール追加 (no-console for production)
   - Prettier 設定の統一

3. **ドキュメント更新**
   - アーキテクチャ図の更新
   - コーディング規約の整備

---

**注記**: このリファクタリング計画は、コードの品質向上と保守性改善を目的としています。各Phaseは独立して実行可能ですが、Phase 1から順に実施することを強く推奨します。
