import { Routes, Route, Link, Navigate } from "react-router-dom";
import PathfindingVisualizer from "./visualizers/PathfindingVisualizer";
import SortingVisualizer from "./visualizers/SortingVisualizer";
import "./App.css";

const CATEGORIES = [
  {
    id: "pathfinding",
    name: "経路探索アルゴリズム",
  },
  { id: "sorting", name: "ソートアルゴリズム" },
];

function Home() {
  return (
    <div className="app">
      <h1>アルゴリズム可視化ツール</h1>
      <div className="category-grid">
        {CATEGORIES.map((category) => (
          <Link
            key={category.id}
            className="category-card"
            to={`/${category.id}`}
          >
            <h2>{category.name}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
}

function PathfindingPage() {
  return (
    <div className="app">
      <div className="header">
        <Link className="back-button" to="/">
          ← 戻る
        </Link>
        <h1>経路探索アルゴリズム</h1>
      </div>
      <PathfindingVisualizer />
    </div>
  );
}

function SortingPage() {
  return (
    <div className="app">
      <div className="header">
        <Link className="back-button" to="/">
          ← 戻る
        </Link>
        <h1>ソートアルゴリズム</h1>
      </div>
      <SortingVisualizer />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/pathfinding" element={<Navigate to="/pathfinding/astar" replace />} />
      <Route path="/pathfinding/:algorithm" element={<PathfindingPage />} />
      <Route path="/sorting" element={<Navigate to="/sorting/bubble" replace />} />
      <Route path="/sorting/:algorithm" element={<SortingPage />} />
    </Routes>
  );
}

export default App;
