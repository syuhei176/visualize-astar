import { useState } from "react";
import PathfindingVisualizer from "./visualizers/PathfindingVisualizer";
import SortingVisualizer from "./visualizers/SortingVisualizer";
import { Category } from "./types";
import "./App.css";

const CATEGORIES: Category[] = [
  {
    id: "pathfinding",
    name: "経路探索アルゴリズム",
    component: PathfindingVisualizer,
  },
  { id: "sorting", name: "ソートアルゴリズム", component: SortingVisualizer },
];

function App() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  if (!selectedCategory) {
    return (
      <div className="app">
        <h1>アルゴリズム可視化ツール</h1>
        <div className="category-grid">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              className="category-card"
              onClick={() => setSelectedCategory(category)}
            >
              <h2>{category.name}</h2>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const VisualizerComponent = selectedCategory.component;

  return (
    <div className="app">
      <div className="header">
        <button
          className="back-button"
          onClick={() => setSelectedCategory(null)}
        >
          ← 戻る
        </button>
        <h1>{selectedCategory.name}</h1>
      </div>
      <VisualizerComponent />
    </div>
  );
}

export default App;
