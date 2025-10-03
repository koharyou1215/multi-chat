# 📋 次回スプリント計画 - コンポーネント分割とリファクタリング

## 🎯 スプリント目標

大規模コンポーネントの分割による保守性向上とコードの可読性改善

---

## 📊 現状分析

### 大規模コンポーネント

#### 1. `broadcast-input.tsx` (500+ lines)
**問題点**:
- プロンプト管理、添付ファイル、最適化ロジックが混在
- 状態管理が複雑化
- テストが困難

**依存関係**:
- CustomPrompt型
- Attachment型
- PromptOptimizer
- ContentEditableInput
- useAppStore

#### 2. `chat-panel/ChatPanel.tsx`
**問題点**:
- ヘッダー、メッセージリスト、フッターが1ファイルに集約
- 各セクションの責任が不明確
- レンダリング最適化が困難

**依存関係**:
- MessageList
- VirtualScroller
- ModelSelector
- useChatStore

---

## 🔧 リファクタリング計画

### Phase 1: broadcast-input.tsx の分割 (優先度: 高)

#### 分割後の構造
```
components/broadcast-input/
├── BroadcastInput.tsx          # Main container (100 lines)
├── PromptMenu.tsx              # Prompt selection dropdown (150 lines)
├── AttachmentPreview.tsx       # File attachment UI (80 lines)
├── InputToolbar.tsx            # Button group and actions (100 lines)
├── hooks/
│   ├── usePromptOptimizer.ts   # Optimization logic (60 lines)
│   └── useAttachments.ts       # Attachment management (50 lines)
└── types.ts                    # Local type definitions
```

#### 実装ステップ
1. **AttachmentPreview.tsx 抽出** (30分)
   - 添付ファイルプレビューUIを独立コンポーネント化
   - Props: `attachments`, `onRemove`

2. **PromptMenu.tsx 抽出** (45分)
   - プロンプト選択メニューを分離
   - Props: `prompts`, `onSelect`, `activePromptId`
   - State: `showMenu`, `deleteConfirm`

3. **InputToolbar.tsx 抽出** (30分)
   - ボタングループを独立化
   - Props: `onOptimize`, `onAttach`, `onTogglePrompts`

4. **カスタムフック作成** (45分)
   - `usePromptOptimizer`: 最適化ロジック
   - `useAttachments`: ファイル管理ロジック

5. **BroadcastInput.tsx 簡素化** (30分)
   - 統合とコーディネーション役に集中
   - 子コンポーネントの組み立て

#### 期待効果
- ✅ 各ファイル100-150行以下に削減
- ✅ 単一責任原則の遵守
- ✅ テスト容易性の向上
- ✅ 再利用可能なコンポーネント増加

---

### Phase 2: ChatPanel.tsx の分割 (優先度: 中)

#### 分割後の構造
```
components/chat-panel/
├── ChatPanel.tsx              # Main container (80 lines)
├── ChatPanelHeader.tsx        # Header with model selector (70 lines)
├── ChatPanelMessages.tsx      # Message display area (60 lines)
├── ChatPanelFooter.tsx        # Footer actions (50 lines)
└── hooks/
    └── usePanelState.ts       # Panel state management (40 lines)
```

#### 実装ステップ
1. **ChatPanelHeader.tsx 抽出** (30分)
   - タイトル、モデルセレクター、アクションボタン
   - Props: `panelId`, `modelId`, `onModelChange`, `onClear`

2. **ChatPanelMessages.tsx 抽出** (30分)
   - VirtualScroller統合
   - Props: `messages`, `isLoading`, `streamingMessage`

3. **ChatPanelFooter.tsx 抽出** (20分)
   - フッターアクション（必要に応じて）
   - Props: `panelId`, `actions`

4. **usePanelState.ts 作成** (30分)
   - パネル固有の状態管理ロジック抽出
   - 選択状態、ローディング状態などの管理

#### 期待効果
- ✅ コンポーネント間の境界が明確化
- ✅ ヘッダー/メッセージエリアの独立したテスト
- ✅ レンダリング最適化の容易化

---

### Phase 3: Store統合の完全化 (優先度: 低)

#### 目的
`use-app-store.ts` の互換レイヤーを削除し、`chat-store.ts` への直接アクセスに統一

#### 実装ステップ
1. **use-app-store.tsの使用箇所調査** (20分)
   ```bash
   grep -r "useAppStore" components/ hooks/
   ```

2. **段階的置き換え** (60分)
   - import文を `useChatStore` に変更
   - 必要に応じてメソッド名を調整

3. **use-app-store.ts 削除** (10分)
   - 互換レイヤーファイルを削除
   - 型定義を`types/index.ts`に移動（必要に応じて）

#### 期待効果
- ✅ 不要な抽象化レイヤーの削除
- ✅ バンドルサイズの削減
- ✅ 型推論の改善

---

## 📈 実装優先度マトリックス

| タスク | 優先度 | 工数 | 影響範囲 | リスク |
|--------|--------|------|----------|--------|
| broadcast-input 分割 | 🔴 高 | 3h | 大 | 低 |
| ChatPanel 分割 | 🟡 中 | 2h | 中 | 低 |
| Store統合完全化 | 🟢 低 | 1.5h | 小 | 中 |

---

## 🧪 テスト戦略

### 単体テスト
```typescript
// broadcast-input/PromptMenu.test.tsx
describe('PromptMenu', () => {
  it('should display prompts', () => { /* ... */ });
  it('should handle selection', () => { /* ... */ });
  it('should show delete confirmation', () => { /* ... */ });
});

// broadcast-input/AttachmentPreview.test.tsx
describe('AttachmentPreview', () => {
  it('should render attachments', () => { /* ... */ });
  it('should remove attachment on click', () => { /* ... */ });
});
```

### 統合テスト
```typescript
// broadcast-input/BroadcastInput.test.tsx
describe('BroadcastInput Integration', () => {
  it('should compose all sub-components', () => { /* ... */ });
  it('should handle end-to-end message flow', () => { /* ... */ });
});
```

---

## 📝 実装ガイドライン

### コンポーネント分割の原則
1. **単一責任**: 各コンポーネントは1つの責任のみ
2. **疎結合**: コンポーネント間の依存を最小化
3. **高凝集**: 関連する機能を同じコンポーネントに集約
4. **再利用性**: 汎用的な設計を優先

### ファイル命名規則
```
ComponentName.tsx        # Main component file
ComponentName.test.tsx   # Unit tests
ComponentName.stories.tsx # Storybook stories (optional)
useComponentName.ts      # Custom hooks
types.ts                 # Local type definitions
```

### Props定義パターン
```typescript
// Good: 明確な型定義
interface PromptMenuProps {
  prompts: CustomPrompt[];
  activePromptId: string | null;
  onSelect: (prompt: CustomPrompt) => void;
  onDelete: (promptId: string) => void;
}

// Bad: 曖昧な型
interface PromptMenuProps {
  data: any;
  handlers: Record<string, Function>;
}
```

---

## 🎯 成功基準

### 定量的指標
- [ ] すべてのコンポーネントが150行以下
- [ ] テストカバレッジ80%以上
- [ ] TypeScriptビルドエラー0件
- [ ] Lint警告0件

### 定性的指標
- [ ] コードレビューで可読性の向上を確認
- [ ] 新機能追加時の変更箇所が明確
- [ ] コンポーネントの責任が明確に文書化
- [ ] チーム全員が新構造を理解

---

## 📚 参考資料

### 設計原則
- SOLID原則
- React Component Patterns
- Clean Code (Robert C. Martin)

### 技術スタック
- React 18
- TypeScript 5.x
- Zustand (状態管理)
- Vitest (テスト)

---

## 🔄 次回レビューポイント

1. **broadcast-input 分割後のレビュー**
   - コンポーネント間のインターフェース設計
   - Props drilling の有無確認
   - パフォーマンス影響の測定

2. **ChatPanel 分割後のレビュー**
   - VirtualScroller統合の正常動作確認
   - レンダリング最適化の効果測定

3. **Store統合後のレビュー**
   - 型安全性の向上確認
   - バンドルサイズの変化測定

---

**作成日**: 2025-10-01
**対象バージョン**: 2.1.0
**ステータス**: 📋 Planning
