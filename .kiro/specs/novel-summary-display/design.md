# Design Document

## Overview

小説詳細ページにsummary表示機能を追加します。現在の実装では、`Novel`型に`summary`フィールドが定義されているものの、`NovelDetail`コンポーネントでは`description`フィールドのみが表示されています。この設計では、既存の`summary`フィールドを活用して、タイトルの下、エピソード一覧の上に適切にsummaryを表示します。

## Architecture

### Current State Analysis
- `Novel`型には`summary: string`フィールドが既に定義済み
- モックデータでは`summary`フィールドに適切なあらすじが設定済み
- `getNovelDetail`関数では`summary`を`description`として返している（互換性のため）
- `NovelDetail`コンポーネントでは`description`のみ表示し、`summary`は未使用

### Proposed Changes
既存のアーキテクチャを活用し、最小限の変更でsummary表示機能を実装します。

## Components and Interfaces

### Modified Components

#### NovelDetail Component
- **Location**: `frontend/src/components/NovelDetail.tsx`
- **Changes**: 
  - `novel.summary`フィールドを使用してsummary表示セクションを追加
  - タイトルセクションの後、エピソード一覧セクションの前に配置
  - 適切なスタイリングでsummaryを区別して表示

### Data Flow
1. `getNovelDetail`関数が`Novel`データを取得（`summary`フィールド含む）
2. `NovelWithEpisodes`型にsummaryフィールドが含まれることを確認
3. `NovelDetail`コンポーネントが`novel.summary`を表示

## Data Models

### Type Modifications
現在の`NovelWithEpisodes`型は`Novel`型を継承しているため、`summary`フィールドは既に利用可能です。追加の型定義は不要です。

```typescript
// 既存の型定義（変更不要）
export interface Novel {
  id: number
  title: string
  summary: string  // 既に定義済み
  description?: string
  // ... other fields
}

export interface NovelWithEpisodes extends Omit<Novel, 'episodes'> {
  // summary フィールドは継承される
  episodes: Array<{
    id: string
    title: string
    episode_number: number
    published_at: string
  }>
}
```

### Data Handling
- モックデータでは`summary`フィールドに適切な値が設定済み
- Supabase実装時も`summary`フィールドが取得されることを確認
- `getNovelDetail`関数の修正は不要（既に`summary`を含むデータを返している）

## Error Handling

### Summary Display Logic
- `novel.summary`が存在する場合: summaryセクションを表示
- `novel.summary`が空文字列またはnullの場合: summaryセクションを非表示
- フォールバック処理は不要（要件で「プレースホルダー表示または非表示」と定義済み）

### Validation
- 既存のデータ取得エラーハンドリングを継承
- summary固有のエラーハンドリングは不要（文字列フィールドのため）

## Testing Strategy

### Unit Testing
- `NovelDetail`コンポーネントのsummary表示ロジックをテスト
- summary有り/無しの両パターンをテスト
- 適切なスタイリングが適用されることを確認

### Integration Testing
- 小説詳細ページでsummaryが正しい位置に表示されることを確認
- レスポンシブデザインでの表示確認

### Test Cases
1. **Summary表示テスト**
   - summaryが存在する小説でsummaryセクションが表示される
   - summaryが空の小説でsummaryセクションが非表示になる

2. **レイアウトテスト**
   - summaryがタイトルの下、エピソード一覧の上に配置される
   - 適切なスペーシングとスタイリングが適用される

3. **レスポンシブテスト**
   - モバイルデバイスでsummaryが適切に表示される
   - デスクトップデバイスでsummaryが適切に表示される

## Implementation Notes

### Styling Approach
- Tailwind CSSを使用して既存のデザインシステムと一貫性を保つ
- `prose`クラスを活用してテキストの可読性を向上
- 適切なマージンとパディングでセクション間の区別を明確化

### Performance Considerations
- 既存のデータ取得フローを変更しないため、パフォーマンスへの影響は最小限
- 追加のAPI呼び出しは不要

### Accessibility
- セマンティックなHTML構造を使用
- 適切な見出しレベルでsummaryセクションを構造化