# Z-Index コンフリクト修正完了レポート

**実施日**: 2025-10-03
**タスク**: Phase 1 完了後の Z-Index コンフリクト解消
**参照**: PHASE1_COMPLETION_ANALYSIS.md

---

## ✅ 修正完了サマリー

すべての Z-Index コンフリクトを解消しました。inline style による z-index 上書きを削除し、`lib/config/index.ts` の統一された定数を使用するように修正しました。

---

## 📋 実施内容

### 1. lib/config/index.ts の更新

**追加した Z-Index 定数**:

```typescript
export const Z_INDEX = {
  // Base layers (lowest)
  BACKGROUND: 0,
  CONTENT: 1,

  // Layout layers - properly stacked
  MAIN_CONTENT: 10,
  SIDEBAR_OVERLAY: 35,
  SIDEBAR: 45,
  HEADER: 50,
  FOOTER: 55,

  // Interactive layers
  DROPDOWN: 100,
  TOOLTIP: 200,

  // Modal layers (highest)
  MODAL_BACKDROP: 1000,
  MODAL_CONTENT: 1100,
  RIGHT_PANEL: 1150,       // ✅ 新規追加
  PROMPT_LIBRARY: 1200,
  SETTINGS_MODAL: 1300,
  MODEL_SELECTOR: 1400,    // ✅ 新規追加

  // System layers (topmost)
  DEBUG_PANEL: 9000,
  TOAST: 9999,
} as const;
```

**追加理由**:
- `RIGHT_PANEL: 1150` - right-panel.tsx の z:99998, z:99999 を適切な階層に配置
- `MODEL_SELECTOR: 1400` - model-selector.tsx の z:10000, z:9999 を適切な階層に配置

---

## 🔧 ファイル別修正内容

### 1. components/main-layout.tsx

#### 修正箇所 1: Header

**Before**:
```typescript
<header
  className={zIndex('HEADER')}  // z-[50]
  style={{
    position: 'fixed',
    // ...
    zIndex: 100  // ❌ inline が className を上書き
  }}>
```

**After**:
```typescript
<header
  className={zIndex('HEADER')}  // z-[50]
  style={{
    position: 'fixed',
    // ...
    // ✅ zIndex を削除
  }}>
```

#### 修正箇所 2: Footer

**Before**:
```typescript
<footer
  className={zIndex('FOOTER')}  // z-[55]
  style={{
    position: 'fixed',
    // ...
    zIndex: 100  // ❌ inline が className を上書き
  }}>
```

**After**:
```typescript
<footer
  className={zIndex('FOOTER')}  // z-[55]
  style={{
    position: 'fixed',
    // ...
    // ✅ zIndex を削除
  }}>
```

#### 修正箇所 3: Floating Particles

**Before**:
```typescript
<div className="absolute inset-0 overflow-hidden pointer-events-none"
     style={{ zIndex: 1 }}>
```

**After**:
```typescript
<div className={cn(
  "absolute inset-0 overflow-hidden pointer-events-none",
  zIndex('CONTENT')  // z-[1]
)}>
```

---

### 2. components/right-panel.tsx

#### Import 追加:
```typescript
import { zIndex } from "@/lib/config";
```

#### 修正箇所 1: Overlay

**Before**:
```typescript
<div
  className="fixed inset-0 bg-black/50 z-40"
  style={{
    position: "fixed",
    // ...
    zIndex: 99998,  // ❌ config にない値
  }}
/>
```

**After**:
```typescript
<div
  className={cn("fixed inset-0 bg-black/50", zIndex('MODAL_BACKDROP'))}
  style={{
    position: "fixed",
    // ...
    // ✅ zIndex を削除、className で管理
  }}
/>
```

#### 修正箇所 2: Panel Content

**Before**:
```typescript
<div
  className="fixed inset-y-0 right-0 w-80 bg-gradient-to-b ... z-50"
  style={{
    position: "fixed",
    // ...
    zIndex: 99999,  // ❌ config にない値
  }}>
```

**After**:
```typescript
<div
  className={cn(
    "fixed inset-y-0 right-0 w-80 bg-gradient-to-b ...",
    zIndex('RIGHT_PANEL')  // z-[1150]
  )}
  style={{
    position: "fixed",
    // ...
    // ✅ zIndex を削除、className で管理
  }}>
```

---

### 3. components/model-selector.tsx

#### Import 追加:
```typescript
import { zIndex } from "@/lib/config";
```

#### 修正箇所 1: Select.Content (variant: radix)

**Before**:
```typescript
<Select.Content
  position="popper"
  sideOffset={8}
  align="start"
  style={{ zIndex: 10000 }}  // ❌ config にない値
  className={cn(
    "min-w-[200px] max-h-[400px] overflow-auto",
    // ...
  )}>
```

**After**:
```typescript
<Select.Content
  position="popper"
  sideOffset={8}
  align="start"
  className={cn(
    "min-w-[200px] max-h-[400px] overflow-auto",
    // ...
    zIndex('MODEL_SELECTOR')  // ✅ z-[1400]
  )}>
```

#### 修正箇所 2: Select.Content (variant: simple/glass)

**Before**:
```typescript
<Select.Content
  position="popper"
  sideOffset={5}
  align="center"
  style={{ zIndex: 9999 }}  // ❌ TOAST と競合
  className={cn(
    "min-w-[180px] overflow-hidden",
    // ...
  )}>
```

**After**:
```typescript
<Select.Content
  position="popper"
  sideOffset={5}
  align="center"
  className={cn(
    "min-w-[180px] overflow-hidden",
    // ...
    zIndex('MODEL_SELECTOR')  // ✅ z-[1400]
  )}>
```

---

### 4. app/page.tsx

#### Import 追加:
```typescript
import { zIndex } from '@/lib/config'
```

#### 修正箇所: CSS Diagnostic Toast

**Before**:
```typescript
{cssLoaded === false && (
  <div style={{ position: 'fixed', bottom: 12, right: 12, zIndex: 9999 }}>
    <div style={{ /* ... */ }}>
      グローバルCSSが読み込まれていない可能性があります...
    </div>
  </div>
)}
```

**After**:
```typescript
{cssLoaded === false && (
  <div className={zIndex('TOAST')} style={{ position: 'fixed', bottom: 12, right: 12 }}>
    <div style={{ /* ... */ }}>
      グローバルCSSが読み込まれていない可能性があります...
    </div>
  </div>
)}
```

---

### 5. app/prompts/page.tsx

#### Import 追加:
```typescript
import { zIndex } from "@/lib/config";
```

#### 修正箇所: Delete Confirmation Modal

**Before**:
```typescript
{deleteConfirmId && (
  <div className="fixed inset-0 z-[1000] flex items-center justify-center">
    {/* ... */}
  </div>
)}
```

**After**:
```typescript
{deleteConfirmId && (
  <div className={cn("fixed inset-0 flex items-center justify-center", zIndex('MODAL_BACKDROP'))}>
    {/* ... */}
  </div>
)}
```

---

## 📊 修正統計

### ファイル数
- **修正ファイル数**: 6ファイル
  1. lib/config/index.ts
  2. components/main-layout.tsx
  3. components/right-panel.tsx
  4. components/model-selector.tsx
  5. app/page.tsx
  6. app/prompts/page.tsx

### 修正箇所数
- **inline style 削除**: 8箇所
- **className への移行**: 8箇所
- **新規 z-index 定数追加**: 2個

### 修正内容別
| 修正タイプ | 箇所数 |
|-----------|--------|
| inline zIndex 削除 | 8 |
| ハードコード z-[N] を定数化 | 1 |
| 新規定数追加 | 2 |
| import 追加 | 5 |
| **合計** | **16** |

---

## 🎯 修正後の Z-Index 階層

修正後の z-index スタック（低→高）:

```
Z_INDEX.BACKGROUND:      0
Z_INDEX.CONTENT:         1      ← Floating particles
Z_INDEX.MAIN_CONTENT:    10
Z_INDEX.SIDEBAR_OVERLAY: 35
Z_INDEX.SIDEBAR:         45
Z_INDEX.HEADER:          50     ← Header (修正済み)
Z_INDEX.FOOTER:          55     ← Footer (修正済み)
Z_INDEX.DROPDOWN:        100
Z_INDEX.TOOLTIP:         200
Z_INDEX.MODAL_BACKDROP:  1000   ← Right panel overlay (修正済み)
Z_INDEX.MODAL_CONTENT:   1100
Z_INDEX.RIGHT_PANEL:     1150   ← Right panel content (修正済み)
Z_INDEX.PROMPT_LIBRARY:  1200
Z_INDEX.SETTINGS_MODAL:  1300
Z_INDEX.MODEL_SELECTOR:  1400   ← Model selector dropdown (修正済み)
Z_INDEX.DEBUG_PANEL:     9000
Z_INDEX.TOAST:           9999   ← CSS diagnostic (修正済み)
```

**修正前の問題**:
- Header/Footer: z:100 (DROPDOWN と競合)
- Right panel: z:99998, z:99999 (TOAST を超えていた)
- Model selector: z:10000, z:9999 (TOAST を超えていた)

**修正後**:
- すべての要素が適切な階層に配置
- 競合なし、論理的な重なり順

---

## ✅ 検証結果

### inline style の z-index 残存チェック

```bash
# 検証コマンド
grep -r "style.*zIndex" --include="*.tsx" components app

# 結果
✅ 0件 - すべて削除完了
```

### ハードコード z-index チェック

```bash
# 検証コマンド
grep -r "z-\[" --include="*.tsx" components app | grep -v "zIndex("

# 結果
✅ 0件 - すべて定数化完了
```

### zIndex() ヘルパー使用状況

```bash
# 使用ファイル
✅ components/main-layout.tsx (4箇所: CONTENT, HEADER, FOOTER, MAIN_CONTENT)
✅ components/right-panel.tsx (2箇所: MODAL_BACKDROP, RIGHT_PANEL)
✅ components/model-selector.tsx (2箇所: MODEL_SELECTOR)
✅ app/page.tsx (1箇所: TOAST)
✅ app/prompts/page.tsx (1箇所: MODAL_BACKDROP)
```

---

## 🎓 改善点と学び

### 改善されたこと

1. **一貫性**: すべての z-index が `lib/config/index.ts` で管理
2. **可読性**: `zIndex('HEADER')` で意図が明確
3. **保守性**: z-index の変更が一箇所で完結
4. **型安全性**: TypeScript で存在しない層を検出可能

### 防止できる問題

1. **z-index の競合**: 階層が明確で競合が発生しない
2. **意図しない重なり**: 論理的な階層構造で予測可能
3. **保守性の低下**: ハードコードを排除
4. **マジックナンバー**: 99999 などの意味不明な値を排除

---

## 📝 Phase 2 への推奨事項

### ✅ Phase 2 開始準備完了

Z-Index コンフリクトが解消されたため、Phase 2 のリファクタリングを安全に開始できます。

### Phase 2 実施時の注意点

1. **main-layout.tsx 分割時**:
   - 各分割ファイルで `zIndex()` ヘルパーを継続使用
   - inline style での z-index 指定を避ける

2. **broadcast-input.tsx 分割時**:
   - モーダル/ドロップダウンには適切な z-index 定数を使用
   - 新規レイヤーが必要な場合は `lib/config/index.ts` に追加

3. **新規コンポーネント作成時**:
   - z-index が必要な場合は必ず `zIndex()` ヘルパーを使用
   - 新しい階層が必要な場合は既存階層との整合性を確認

### コーディング規約

```typescript
// ✅ Good: zIndex ヘルパーを使用
<div className={cn("fixed", zIndex('MODAL_BACKDROP'))}>

// ❌ Bad: inline style で指定
<div style={{ zIndex: 1000 }}>

// ❌ Bad: ハードコード
<div className="fixed z-[1000]">

// ✅ Good: 新規レイヤーが必要な場合
// 1. lib/config/index.ts に追加
export const Z_INDEX = {
  // ...
  NEW_LAYER: 1500,
} as const;

// 2. zIndex() ヘルパーで使用
<div className={zIndex('NEW_LAYER')}>
```

---

## 🚀 次のステップ

### 即座に実施可能

1. ✅ Phase 2.1: main-layout.tsx のリファクタリング開始
2. ✅ Phase 2.2: broadcast-input.tsx のリファクタリング開始
3. ✅ Phase 2.3: スタイル定数化の実施

### 推奨事項

1. **レイアウト干渉テスト**:
   - すべてのモーダルを開いて重なり順を確認
   - right-panel と model-selector の表示確認
   - Header/Footer とドロップダウンの重なり確認

2. **E2E テスト**:
   - 各レイヤーの表示/非表示が正しく動作するか確認
   - z-index の変更が意図通りに反映されているか確認

---

## 📞 トラブルシューティング

### もし z-index の問題が発生したら

1. **確認手順**:
   ```bash
   # inline style の z-index が残っていないか確認
   grep -r "style.*zIndex" --include="*.tsx" .

   # ハードコードされた z-[N] が残っていないか確認
   grep -r "z-\[" --include="*.tsx" . | grep -v "zIndex("
   ```

2. **修正方法**:
   - inline style の z-index を削除
   - `className={zIndex('LAYER_NAME')}` に変更
   - 必要に応じて `lib/config/index.ts` に新規レイヤーを追加

3. **検証方法**:
   - ブラウザの開発者ツールで computed z-index を確認
   - `Z_INDEX` の値と一致しているか確認

---

**修正完了日**: 2025-10-03
**検証者**: Claude Code
**次回レビュー**: Phase 2 完了時
