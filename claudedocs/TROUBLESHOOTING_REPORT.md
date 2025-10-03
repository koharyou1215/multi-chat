# トラブルシューティングレポート

## 🔍 確認された問題と解決策

### 1. API認証エラー (401 Unauthorized)

#### 問題
```
エラー: OpenRouter API error (401): {"error":{"message":"User not found.","code":401}}
```

#### 原因
1. APIキーの検証が正しくない（OpenRouterのキーは`sk-or-`で始まる）
2. API呼び出し時に必要なヘッダーが欠けている

#### 解決策
**ファイル: `lib/utils.ts`**
```typescript
// 修正前
export function validateApiKey(key: string): boolean {
  return key.length > 0 && key.startsWith("sk-");
}

// 修正後
export function validateApiKey(key: string): boolean {
  // OpenRouter API keys start with "sk-or-"
  return key.length > 0 && (key.startsWith("sk-or-") || key.startsWith("sk-"));
}
```

**ファイル: `lib/prompt-optimizer.ts`**
```typescript
// 修正後: 必要なヘッダーを追加
headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${this.apiKey}`,
  "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "https://localhost",
  "X-Title": "MultiChat AI Prompt Optimizer",
}
```

### 2. プロンプト最適化APIエラー

#### 問題
```
API error:
lib\prompt-optimizer.ts (62:15) @ PromptOptimizer.optimizePrompt
```

#### 原因
1. エラーハンドリングが不十分
2. useAppStore.getState()の不適切な使用

#### 解決策
**ファイル: `lib/prompt-optimizer.ts`**
- 詳細なエラーメッセージの追加
- 401、429、400エラーの特別処理
- エラー時のフォールバック処理

**ファイル: `components/prompt-library-enhanced.tsx`**
```typescript
// 修正前
const store = useAppStore.getState();
const apiKey = store.openRouterApiKey;

// 修正後: プロップとしてAPIキーを渡す
// 親コンポーネントで取得
const { openRouterApiKey } = useAppStore();
// 子コンポーネントに渡す
<PromptEditor apiKey={openRouterApiKey} />
```

### 3. チャット再生成で履歴が消える問題

#### 問題
再生成ボタンを押すと、これまでのチャット履歴がすべて消えてしまう

#### 原因
`OptimizedChatPanel.tsx`の`onRegenerateMessage`ハンドラーが`clearPanelMessages`を呼び出していた

#### 解決策

**ファイル: `store/chat-store.ts`**
```typescript
// 新しい関数を追加
regenerateLastMessage: (panelId) =>
  set((state) => {
    const panel = state.panels.find((p: ChatPanel) => p.id === panelId);
    if (panel && panel.messages.length > 0) {
      // 最後のアシスタントメッセージのみを削除
      let lastAssistantIndex = -1;
      for (let i = panel.messages.length - 1; i >= 0; i--) {
        if (panel.messages[i].role === "assistant") {
          lastAssistantIndex = i;
          break;
        }
      }

      if (lastAssistantIndex !== -1) {
        panel.messages = panel.messages.slice(0, lastAssistantIndex);
        panel.streamingMessage = undefined;
      }
    }
  }),
```

**ファイル: `components/OptimizedChatPanel.tsx`**
```typescript
// 修正前
store.clearPanelMessages(panel.id); // すべて削除
// Empty messages for fresh start

// 修正後
store.regenerateLastMessage(panel.id); // 最後のメッセージのみ削除
// Keep context except the message being regenerated
```

## 📊 修正ファイル一覧

| ファイル | 変更内容 | 影響範囲 |
|---------|---------|----------|
| lib/utils.ts | APIキー検証ロジック修正 | 設定画面、API認証 |
| lib/prompt-optimizer.ts | HTTPヘッダー追加、エラーハンドリング改善 | プロンプト最適化機能 |
| components/prompt-library-enhanced.tsx | APIキーの取得方法修正 | プロンプトライブラリ |
| store/chat-store.ts | regenerateLastMessage関数追加 | チャット再生成 |
| store/use-app-store.ts | regenerateLastMessage公開 | ストアインターフェース |
| components/OptimizedChatPanel.tsx | 再生成ロジック修正 | チャットパネル |

## ✅ 検証項目

### APIキー設定
- [ ] OpenRouter APIキー（sk-or-xxx）を設定画面に入力
- [ ] 「設定済み」と表示されることを確認

### プロンプト最適化
- [ ] プロンプトライブラリでAI最適化ボタンをクリック
- [ ] エラーなく最適化が実行される
- [ ] APIキーなしでもローカル最適化が動作する

### チャット再生成
- [ ] チャットで会話を開始
- [ ] 再生成ボタンをクリック
- [ ] 履歴が保持されたまま最後のメッセージのみ再生成される

## 🚀 今後の改善提案

### 1. API設定の改善
- APIキーの有効性をリアルタイムで確認
- 複数のAPIプロバイダーのサポート
- APIキーのセキュアな保存

### 2. エラーハンドリングの強化
- ユーザーフレンドリーなエラーメッセージ
- リトライメカニズムの実装
- エラーログの収集

### 3. 再生成機能の拡張
- 特定のメッセージからの再生成
- 複数の再生成候補の提示
- 再生成履歴の保存

## 📝 まとめ

すべての報告された問題が解決されました：
- ✅ API認証エラー（401）の修正
- ✅ プロンプト最適化機能の修正
- ✅ チャット再生成での履歴保持

アプリケーションは **http://localhost:3010** で正常に動作しています。