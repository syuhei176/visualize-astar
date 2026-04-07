import { Routes, Route, Link, Navigate } from "react-router-dom";
import PathfindingVisualizer from "./visualizers/PathfindingVisualizer";
import SortingVisualizer from "./visualizers/SortingVisualizer";
import PythagoreanVisualizer from "./visualizers/PythagoreanVisualizer";
import AdditionTheoremVisualizer from "./visualizers/AdditionTheoremVisualizer";
import RsaVisualizer from "./visualizers/RsaVisualizer";
import AbcConjectureVisualizer from "./visualizers/AbcConjectureVisualizer";
import CircuitVisualizer from "./visualizers/CircuitVisualizer";
import CircleTheoremVisualizer from "./visualizers/CircleTheoremVisualizer";
import "./App.css";

const CATEGORIES = [
  { id: "algorithm", name: "アルゴリズム" },
  { id: "math", name: "数学" },
  { id: "science", name: "理科" },
];

const ALGORITHM_TOPICS = [
  { id: "pathfinding", name: "経路探索" },
  { id: "sorting", name: "ソート" },
];

const MATH_SUBCATEGORIES = [
  { id: "geometry", name: "図形・幾何学" },
  { id: "trigonometry", name: "三角関数" },
  { id: "number-theory", name: "数論・暗号" },
];

const GEOMETRY_TOPICS = [
  { id: "pythagorean", name: "三平方の定理" },
  { id: "circle-theorems", name: "円の定理" },
];

const TRIGONOMETRY_TOPICS = [
  { id: "addition-theorem", name: "加法定理" },
];

const NUMBER_THEORY_TOPICS = [
  { id: "rsa", name: "RSA暗号" },
  { id: "abc-conjecture", name: "ABC予想" },
];

const SCIENCE_SUBCATEGORIES = [
  { id: "electricity", name: "電気" },
];

const ELECTRICITY_TOPICS = [
  { id: "circuit", name: "オームの法則" },
];

// Generic list page component
function ListPage({
  title,
  backTo,
  items,
  basePath,
}: {
  title: string;
  backTo: string;
  items: { id: string; name: string }[];
  basePath: string;
}) {
  return (
    <div className="app app-home">
      <div className="header">
        <Link className="back-button" to={backTo}>
          ← 戻る
        </Link>
      </div>
      <h1>{title}</h1>
      <div className="category-grid">
        {items.map((item) => (
          <Link key={item.id} className="category-card" to={`${basePath}/${item.id}`}>
            <h2>{item.name}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
}

function VisualizerPage({
  component: Component,
  backTo,
}: {
  component: React.ComponentType;
  backTo: string;
}) {
  return (
    <div className="app app-visualizer">
      <div className="header">
        <Link className="back-button" to={backTo}>
          ← 戻る
        </Link>
      </div>
      <Component />
    </div>
  );
}

function Home() {
  return (
    <div className="app app-home">
      <h1>ビジュアライズ学習</h1>
      <div className="category-grid">
        {CATEGORIES.map((category) => (
          <Link key={category.id} className="category-card" to={`/${category.id}`}>
            <h2>{category.name}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      {/* Algorithm */}
      <Route path="/algorithm" element={<ListPage title="アルゴリズム" backTo="/" items={ALGORITHM_TOPICS} basePath="/algorithm" />} />
      <Route path="/algorithm/pathfinding" element={<Navigate to="/algorithm/pathfinding/astar" replace />} />
      <Route path="/algorithm/pathfinding/:algorithm" element={<VisualizerPage component={PathfindingVisualizer} backTo="/algorithm" />} />
      <Route path="/algorithm/sorting" element={<Navigate to="/algorithm/sorting/bubble" replace />} />
      <Route path="/algorithm/sorting/:algorithm" element={<VisualizerPage component={SortingVisualizer} backTo="/algorithm" />} />

      {/* Math */}
      <Route path="/math" element={<ListPage title="数学" backTo="/" items={MATH_SUBCATEGORIES} basePath="/math" />} />
      <Route path="/math/geometry" element={<ListPage title="図形・幾何学" backTo="/math" items={GEOMETRY_TOPICS} basePath="/math/geometry" />} />
      <Route path="/math/geometry/pythagorean" element={<VisualizerPage component={PythagoreanVisualizer} backTo="/math/geometry" />} />
      <Route path="/math/geometry/circle-theorems" element={<VisualizerPage component={CircleTheoremVisualizer} backTo="/math/geometry" />} />
      <Route path="/math/trigonometry" element={<ListPage title="三角関数" backTo="/math" items={TRIGONOMETRY_TOPICS} basePath="/math/trigonometry" />} />
      <Route path="/math/trigonometry/addition-theorem" element={<VisualizerPage component={AdditionTheoremVisualizer} backTo="/math/trigonometry" />} />
      <Route path="/math/number-theory" element={<ListPage title="数論・暗号" backTo="/math" items={NUMBER_THEORY_TOPICS} basePath="/math/number-theory" />} />
      <Route path="/math/number-theory/rsa" element={<VisualizerPage component={RsaVisualizer} backTo="/math/number-theory" />} />
      <Route path="/math/number-theory/abc-conjecture" element={<VisualizerPage component={AbcConjectureVisualizer} backTo="/math/number-theory" />} />

      {/* Science */}
      <Route path="/science" element={<ListPage title="理科" backTo="/" items={SCIENCE_SUBCATEGORIES} basePath="/science" />} />
      <Route path="/science/electricity" element={<ListPage title="電気" backTo="/science" items={ELECTRICITY_TOPICS} basePath="/science/electricity" />} />
      <Route path="/science/electricity/circuit" element={<VisualizerPage component={CircuitVisualizer} backTo="/science/electricity" />} />

      {/* Legacy redirects */}
      <Route path="/pathfinding" element={<Navigate to="/algorithm/pathfinding/astar" replace />} />
      <Route path="/pathfinding/:algorithm" element={<Navigate to="/algorithm/pathfinding/astar" replace />} />
      <Route path="/sorting" element={<Navigate to="/algorithm/sorting/bubble" replace />} />
      <Route path="/sorting/:algorithm" element={<Navigate to="/algorithm/sorting/bubble" replace />} />
    </Routes>
  );
}

export default App;
