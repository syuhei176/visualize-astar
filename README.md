# アルゴリズム可視化ツール

様々なアルゴリズムを視覚的に理解できるインタラクティブな可視化ツールです。

## 🎯 実装済みのアルゴリズム

### 経路探索アルゴリズム
- **A\* (A-Star)** - ヒューリスティック関数を使った最適経路探索
- **Dijkstra法** - 最短経路を見つける古典的アルゴリズム
- **幅優先探索 (BFS)** - 最短経路を保証する探索アルゴリズム
- **深さ優先探索 (DFS)** - スタックベースの探索アルゴリズム
- **貪欲法 (Greedy Best-First)** - ヒューリスティック関数のみを使った高速探索

### ソートアルゴリズム
- **バブルソート** - O(n²) の基本的な比較ソート
- **クイックソート** - O(n log n) の高速な分割統治法
- **マージソート** - O(n log n) の安定したソート
- **挿入ソート** - O(n²) だが小規模データに効率的
- **選択ソート** - O(n²) のシンプルな選択ベースソート
- **ヒープソート** - O(n log n) のヒープ構造を使ったソート

## 🚀 特徴

- **プラグイン可能なアーキテクチャ**: 新しいアルゴリズムカテゴリを簡単に追加可能
- **リアルタイム可視化**: アルゴリズムの実行過程をステップごとに確認
- **インタラクティブ**: ユーザーが開始点、終了点、障害物を自由に設定
- **パフォーマンス統計**: 訪問ノード数、比較回数、スワップ回数などを表示
- **速度調整**: 可視化速度を自由に調整可能

## 🛠️ 技術スタック

- **React** - UIコンポーネント
- **Vite** - 高速ビルドツール
- **JavaScript (ES6+)** - アルゴリズム実装
- **CSS3** - スタイリングとアニメーション

## 📦 インストール

```bash
# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev

# 本番ビルド
npm run build

# ビルド結果をプレビュー
npm run preview
```

## 🌐 デプロイ

このプロジェクトはGitHub Actionsを使って自動的にGitHub Pagesにデプロイされます。

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

プッシュ後、`https://<username>.github.io/visualize-astar/` でアクセス可能になります。

## 📂 プロジェクト構成

```
visualize-astar/
├── src/
│   ├── algorithms/           # アルゴリズムのロジック
│   │   ├── pathfinding.js   # 経路探索アルゴリズム
│   │   └── sorting.js       # ソートアルゴリズム
│   ├── visualizers/         # カテゴリごとのビジュアライザー
│   │   ├── PathfindingVisualizer.jsx
│   │   ├── PathfindingVisualizer.css
│   │   ├── SortingVisualizer.jsx
│   │   └── SortingVisualizer.css
│   ├── App.jsx              # メインアプリケーション
│   ├── App.css
│   ├── main.jsx             # エントリーポイント
│   └── index.css
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Actions デプロイ設定
├── index.html
├── vite.config.js
└── package.json
```

## 🔧 新しいアルゴリズムの追加方法

### 1. アルゴリズムロジックを作成

`src/algorithms/your-algorithm.js` を作成：

```javascript
export async function yourAlgorithm(data, onStep) {
  // アルゴリズムの実装
}

export const YOUR_ALGORITHMS = {
  algorithm1: { name: 'アルゴリズム1', fn: yourAlgorithm },
};
```

### 2. ビジュアライザーコンポーネントを作成

`src/visualizers/YourVisualizer.jsx` を作成：

```javascript
import { useState } from 'react'
import { YOUR_ALGORITHMS } from '../algorithms/your-algorithm'

function YourVisualizer() {
  // ビジュアライザーの実装
  return <div>Your Visualizer</div>
}

export default YourVisualizer
```

### 3. カテゴリに追加

`src/App.jsx` の `CATEGORIES` 配列に追加：

```javascript
const CATEGORIES = [
  { id: 'pathfinding', name: '経路探索アルゴリズム', component: PathfindingVisualizer },
  { id: 'sorting', name: 'ソートアルゴリズム', component: SortingVisualizer },
  { id: 'your-category', name: 'あなたのカテゴリ', component: YourVisualizer },
]
```

## 📝 使い方

### 経路探索
1. グリッド上をクリックして開始点を設定
2. もう一度クリックして終了点を設定
3. クリックして壁を追加/削除
4. アルゴリズムを選択
5. 「探索開始」ボタンをクリック

### ソート
1. アルゴリズムを選択
2. 速度を調整（オプション）
3. 「ソート開始」ボタンをクリック
4. 「配列を再生成」で新しいランダム配列を生成

## 📄 ライセンス

ISC

## 🤝 コントリビューション

プルリクエストを歓迎します！大きな変更の場合は、まずissueを開いて変更内容を議論してください。
