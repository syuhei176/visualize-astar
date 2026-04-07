import { Routes, Route, Link, Navigate } from "react-router-dom";
import PathfindingVisualizer from "./visualizers/PathfindingVisualizer";
import SortingVisualizer from "./visualizers/SortingVisualizer";
import PythagoreanVisualizer from "./visualizers/PythagoreanVisualizer";
import AdditionTheoremVisualizer from "./visualizers/AdditionTheoremVisualizer";
import RsaVisualizer from "./visualizers/RsaVisualizer";
import AbcConjectureVisualizer from "./visualizers/AbcConjectureVisualizer";
import CircuitVisualizer from "./visualizers/CircuitVisualizer";
import "./App.css";

const CATEGORIES = [
  { id: "pathfinding", name: "経路探索アルゴリズム" },
  { id: "sorting", name: "ソートアルゴリズム" },
  { id: "math", name: "数学の可視化" },
  { id: "science", name: "理科の可視化" },
];

const SCIENCE_TOPICS = [
  { id: "circuit", name: "電圧・電流・抵抗" },
];

const MATH_TOPICS = [
  { id: "pythagorean", name: "三平方の定理" },
  { id: "addition-theorem", name: "加法定理" },
  { id: "rsa", name: "RSA暗号" },
  { id: "abc-conjecture", name: "ABC予想" },
];

function Home() {
  return (
    <div className="app app-home">
      <h1>アルゴリズム可視化</h1>
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

function MathHome() {
  return (
    <div className="app app-home">
      <div className="header">
        <Link className="back-button" to="/">
          ← 戻る
        </Link>
      </div>
      <h1>数学の可視化</h1>
      <div className="category-grid">
        {MATH_TOPICS.map((topic) => (
          <Link
            key={topic.id}
            className="category-card"
            to={`/math/${topic.id}`}
          >
            <h2>{topic.name}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
}

function PathfindingPage() {
  return (
    <div className="app app-visualizer">
      <div className="header">
        <Link className="back-button" to="/">
          ← 戻る
        </Link>
      </div>
      <PathfindingVisualizer />
    </div>
  );
}

function SortingPage() {
  return (
    <div className="app app-visualizer">
      <div className="header">
        <Link className="back-button" to="/">
          ← 戻る
        </Link>
      </div>
      <SortingVisualizer />
    </div>
  );
}

function ScienceHome() {
  return (
    <div className="app app-home">
      <div className="header">
        <Link className="back-button" to="/">
          ← 戻る
        </Link>
      </div>
      <h1>理科の可視化</h1>
      <div className="category-grid">
        {SCIENCE_TOPICS.map((topic) => (
          <Link
            key={topic.id}
            className="category-card"
            to={`/science/${topic.id}`}
          >
            <h2>{topic.name}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
}

function SciencePage({ component: Component }: { component: React.ComponentType }) {
  return (
    <div className="app app-visualizer">
      <div className="header">
        <Link className="back-button" to="/science">
          ← 戻る
        </Link>
      </div>
      <Component />
    </div>
  );
}

function MathPage({ component: Component }: { component: React.ComponentType }) {
  return (
    <div className="app app-visualizer">
      <div className="header">
        <Link className="back-button" to="/math">
          ← 戻る
        </Link>
      </div>
      <Component />
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
      <Route path="/math" element={<MathHome />} />
      <Route path="/math/pythagorean" element={<MathPage component={PythagoreanVisualizer} />} />
      <Route path="/math/addition-theorem" element={<MathPage component={AdditionTheoremVisualizer} />} />
      <Route path="/math/rsa" element={<MathPage component={RsaVisualizer} />} />
      <Route path="/math/abc-conjecture" element={<MathPage component={AbcConjectureVisualizer} />} />
      <Route path="/science" element={<ScienceHome />} />
      <Route path="/science/circuit" element={<SciencePage component={CircuitVisualizer} />} />
    </Routes>
  );
}

export default App;
