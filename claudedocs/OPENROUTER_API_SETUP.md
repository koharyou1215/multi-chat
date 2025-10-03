# OpenRouter API設定ガイド

## エラー: OpenRouter API error (401): User not found

このエラーは、OpenRouter APIキーが設定されていないか、無効なキーが使用されている場合に発生します。

## 解決方法

### 1. OpenRouter APIキーの取得

1. [OpenRouter](https://openrouter.ai/) にアクセス
2. アカウントを作成またはログイン
3. [API Keys ページ](https://openrouter.ai/keys) に移動
4. 「Create Key」をクリックして新しいAPIキーを作成
5. 生成されたキー（`sk-or-v1-...` 形式）をコピー

### 2. アプリケーションでのAPIキー設定

#### 方法1: アプリ内から設定（推奨）

1. アプリケーションを開く
2. サイドバーの「設定」アイコンをクリック
3. 「OpenRouter APIキー」欄にコピーしたキーをペースト
4. 「APIキーを更新」をクリック

#### 方法2: 環境変数での設定

1. プロジェクトルートに `.env.local` ファイルを作成
2. 以下の内容を追加：

```
NEXT_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-あなたのAPIキー
```

3. 開発サーバーを再起動

### 3. APIキーの検証

設定後、設定画面で以下を確認：
- 「現在の状態」が「設定済み」（緑色）になっていること
- エラーメッセージが表示されていないこと

## よくある問題

### 「User not found」エラーが続く場合

1. **APIキーの形式を確認**
   - 正しい形式: `sk-or-v1-xxxxxxxxxxxxxxxxxx`
   - 誤った形式: `sk-xxxxxxxxxx`（OpenAIのキー形式）

2. **APIキーの有効性を確認**
   - OpenRouterダッシュボードでキーがアクティブか確認
   - 必要に応じて新しいキーを生成

3. **ブラウザのキャッシュをクリア**
   - Ctrl+F5 でハードリフレッシュ
   - ローカルストレージのクリア（開発者ツール > Application > Local Storage）

4. **クレジットの確認**
   - OpenRouterアカウントにクレジットがあることを確認
   - [アカウント設定](https://openrouter.ai/account) でクレジットを追加

## トラブルシューティング

### その他のエラーメッセージ

- **「Quota exceeded」**: API利用制限に達しています。しばらく待つか、プランをアップグレードしてください
- **「Invalid model ID」**: 選択されたモデルが無効です。モデル設定を確認してください
- **「Invalid JSON」**: APIレスポンスエラー。一時的な問題の可能性があります

## サポート

問題が解決しない場合は、以下の情報を確認してください：

1. ブラウザのコンソールログ（F12 > Console）
2. ネットワークタブでのAPIリクエスト/レスポンス
3. OpenRouterダッシュボードでのAPIキーステータス

詳細は [OpenRouter公式ドキュメント](https://openrouter.ai/docs) を参照してください。