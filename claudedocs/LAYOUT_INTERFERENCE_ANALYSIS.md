# レイアウト干渉コード分析レポート

**分析日**: 2025-10-03
**目的**: レイアウト変更を妨げるDOM操作コードの特定
**ステータス**: 🔴 **重大な問題を発見**

---

## 🚨 重大な問題

### 1. ViewportStabilizer.tsx - body固定化によるレイアウトロック

**ファイル**: `app/components/ViewportStabilizer.tsx`
**深刻度**: 🔴 **クリティカル**

#### 問題コード (Line 118-121)
```typescript
const preventBounce = () => {
  document.body.style.position = 'fixed';  // ⚠️ bodyを固定
  document.body.style.width = '100%';
  document.body.style.height = '100%';
  document.body.style.overflow = 'hidden';
}
```

**影響**:
- `position: fixed` により body 要素が完全にロックされる
- CSS や Tailwind でレイアウトを変更しても **反映されない**
- 通常のスクロール・レイアウトフローが無効化される

**発生タイミング**: コンポーネントマウント時（常時）

---

### 2. 直接的な footer transform 操作

**ファイル**: `app/components/ViewportStabilizer.tsx`
**深刻度**: 🟡 **警告**

#### 問題コード (Line 38-39, 45-46)
```typescript
// キーボード表示時
footer.style.transform = `translateY(-${keyboardHeight}px)`;
footer.style.transition = 'transform 0.3s ease-out';

// キーボード非表示時
footer.style.transform = 'translateY(0)';
footer.style.transition = 'transform 0.3s ease-out';
```

**影響**:
- React/CSS の管理外で直接 DOM を操作
- CSS クラスでの transform 指定が **上書きされる**
- Tailwind の `transform` ユーティリティが無効化される

---

### 3. CSS カスタムプロパティの強制上書き

**ファイル**: `app/components/MobileLayoutFix.tsx`
**深刻度**: 🟡 **警告**

#### 問題コード (Line 10, 63)
```typescript
// viewport height の上書き
document.documentElement.style.setProperty('--vh', `${vh}px`);

// keyboard height の設定
document.documentElement.style.setProperty('--keyboard-height', `${keyboardHeight}px`);
```

**影響**:
- CSS 変数 `--vh` と `--keyboard-height` が JavaScript で強制設定される
- CSS ファイルでの定義が無視される
- 動的な値のため、デバッグが困難

---

### 4. body classList の競合

**ファイル**:
- `app/components/ViewportStabilizer.tsx` (Line 42, 49)
- `app/components/MobileLayoutFix.tsx` (Line 48)

#### 問題コード
```typescript
// ViewportStabilizer.tsx
document.body.classList.add('keyboard-visible');
document.body.classList.remove('keyboard-visible');

// MobileLayoutFix.tsx
document.body.classList.toggle('keyboard-visible', hasKeyboard);
```

**影響**:
- **2つのコンポーネントが同じクラスを競合管理**
- レースコンディションの可能性
- 予期しないクラスの付け外しが発生

---

### 5. setTimeout による遅延実行

**ファイル**:
- `app/components/ViewportStabilizer.tsx` (Line 95, 100)
- `components/broadcast-input.tsx` (Line 389)

#### 問題コード
```typescript
// ViewportStabilizer.tsx
setTimeout(updateLayout, 100);  // Line 95, 100

// broadcast-input.tsx
setTimeout(() => setShowPromptMenu(true), 100);  // Line 389
```

**影響**:
- React の render サイクルと **非同期で実行**
- レイアウト更新とタイミングがずれる可能性
- 100ms の遅延により UX が劣化

---

## 📊 影響範囲サマリー

| カテゴリ | 問題数 | 深刻度 | ファイル |
|---------|--------|--------|----------|
| body スタイル固定 | 1 | 🔴 クリティカル | ViewportStabilizer.tsx |
| 直接 DOM 操作 | 4 | 🟡 警告 | ViewportStabilizer.tsx, MobileLayoutFix.tsx |
| CSS 変数上書き | 2 | 🟡 警告 | MobileLayoutFix.tsx |
| classList 競合 | 3 | 🟡 警告 | 両ファイル |
| setTimeout 遅延 | 3 | 🟢 軽微 | ViewportStabilizer.tsx, broadcast-input.tsx |

---

## 🔧 修正提案

### 優先度1: body 固定化の削除

**現在のコード**:
```typescript
// ❌ 削除すべき
document.body.style.position = 'fixed';
document.body.style.width = '100%';
document.body.style.height = '100%';
document.body.style.overflow = 'hidden';
```

**推奨修正**:
```typescript
// ✅ CSS クラスで管理
// globals.css に以下を追加
.prevent-bounce {
  position: fixed;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

// ViewportStabilizer.tsx
document.body.classList.add('prevent-bounce');
```

**効果**: CSS で管理することで、他のレイアウトコードとの競合を回避

---

### 優先度2: footer transform を CSS 管理に移行

**現在のコード**:
```typescript
// ❌ JavaScript で直接操作
footer.style.transform = `translateY(-${keyboardHeight}px)`;
footer.style.transition = 'transform 0.3s ease-out';
```

**推奨修正**:
```typescript
// ✅ CSS カスタムプロパティ + クラス管理
document.documentElement.style.setProperty('--keyboard-offset', `${keyboardHeight}px`);
footer.classList.toggle('keyboard-active', isKeyboardOpen);

// globals.css
.broadcast-input-container.keyboard-active {
  transform: translateY(calc(-1 * var(--keyboard-offset, 0px)));
  transition: transform 0.3s ease-out;
}
```

**効果**: CSS transitions がスムーズに動作し、Tailwind との競合を回避

---

### 優先度3: keyboard-visible クラスの統一管理

**現在の問題**:
- `ViewportStabilizer.tsx` と `MobileLayoutFix.tsx` が同じクラスを操作

**推奨修正**:
1. **どちらか一方のコンポーネントに統一** (ViewportStabilizer 推奨)
2. MobileLayoutFix.tsx の該当コードを削除

```typescript
// MobileLayoutFix.tsx から削除
// ❌ document.body.classList.toggle('keyboard-visible', hasKeyboard);
```

**効果**: レースコンディションを防止、単一責任の原則に準拠

---

### 優先度4: setTimeout の削減

**現在のコード**:
```typescript
// ❌ 不要な遅延
setTimeout(updateLayout, 100);
```

**推奨修正**:
```typescript
// ✅ requestAnimationFrame を使用
requestAnimationFrame(() => updateLayout());
```

**効果**: ブラウザの描画サイクルに同期、より正確なタイミング

---

## 🎯 具体的な修正ステップ

### Step 1: ViewportStabilizer.tsx のリファクタリング

1. `preventBounce()` 内の body スタイル直接操作を削除
2. CSS クラス `.prevent-bounce` を globals.css に追加
3. footer transform を CSS 変数 + クラス管理に変更
4. setTimeout を requestAnimationFrame に置換

### Step 2: MobileLayoutFix.tsx の簡素化

1. `keyboard-visible` クラス操作を削除 (ViewportStabilizer に任せる)
2. footer transform 操作を削除 (重複のため)
3. `--vh` CSS 変数のみを管理 (これは固有の役割)

### Step 3: broadcast-input.tsx の修正

1. `setTimeout(() => setShowPromptMenu(true), 100)` を削除
2. 即座に `setShowPromptMenu(true)` を実行
3. または useEffect で副作用として管理

---

## 📋 検証チェックリスト

修正後、以下を確認してください：

- [ ] `document.body.style` への直接代入が存在しないこと
- [ ] footer の transform が CSS クラスで管理されていること
- [ ] `keyboard-visible` クラスが単一のコンポーネントからのみ操作されること
- [ ] setTimeout の使用が最小限（または requestAnimationFrame に置換）
- [ ] レイアウト変更が即座に反映されること
- [ ] iOS Safari でキーボード表示時の挙動が正常なこと

---

## 🚀 期待される効果

### Before (現在)
- body が `position: fixed` でロックされている
- CSS/Tailwind でのレイアウト変更が反映されない
- 複数コンポーネントが同じ DOM を競合操作
- 遅延実行により UX が劣化

### After (修正後)
- body は通常のレイアウトフローに従う
- CSS クラスでレイアウトを一元管理
- コンポーネント間の責任が明確
- スムーズな UI 更新

---

## 📌 次のアクション

### 即座に対応すべき
1. **ViewportStabilizer.tsx の body 固定化を削除**
   - これが最も深刻なレイアウトブロック

### フェーズ2前に対応推奨
2. footer transform の CSS 管理への移行
3. keyboard-visible クラスの統一管理

### フェーズ2と並行可能
4. setTimeout の最適化
5. その他の細かい改善

---

**レポート作成**: Claude Code
**次のステップ**: ユーザー承認後、修正実施
