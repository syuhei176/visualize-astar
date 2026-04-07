import { Routes, Route, Link, Navigate } from "react-router-dom";
import PathfindingVisualizer from "./visualizers/PathfindingVisualizer";
import SortingVisualizer from "./visualizers/SortingVisualizer";
import PythagoreanVisualizer from "./visualizers/PythagoreanVisualizer";
import AdditionTheoremVisualizer from "./visualizers/AdditionTheoremVisualizer";
import RsaVisualizer from "./visualizers/RsaVisualizer";
import AbcConjectureVisualizer from "./visualizers/AbcConjectureVisualizer";
import CircuitVisualizer from "./visualizers/CircuitVisualizer";
import CircleTheoremVisualizer from "./visualizers/CircleTheoremVisualizer";
import MazeVisualizer from "./visualizers/MazeVisualizer";
import TriangleAngleSumVisualizer from "./visualizers/TriangleAngleSumVisualizer";
import PolygonAngleSumVisualizer from "./visualizers/PolygonAngleSumVisualizer";
import TriangleCongruenceVisualizer from "./visualizers/TriangleCongruenceVisualizer";
import TriangleSimilarityVisualizer from "./visualizers/TriangleSimilarityVisualizer";
import CircleTangentVisualizer from "./visualizers/CircleTangentVisualizer";
import SectorVisualizer from "./visualizers/SectorVisualizer";
import PrimeFactorizationVisualizer from "./visualizers/PrimeFactorizationVisualizer";
import SieveVisualizer from "./visualizers/SieveVisualizer";
import GcdLcmVisualizer from "./visualizers/GcdLcmVisualizer";
import SqrtNumberLineVisualizer from "./visualizers/SqrtNumberLineVisualizer";
import ProportionVisualizer from "./visualizers/ProportionVisualizer";
import LinearFunctionVisualizer from "./visualizers/LinearFunctionVisualizer";
import QuadraticFunctionVisualizer from "./visualizers/QuadraticFunctionVisualizer";
import DiceSimulationVisualizer from "./visualizers/DiceSimulationVisualizer";
import HistogramVisualizer from "./visualizers/HistogramVisualizer";
import BulbBrightnessVisualizer from "./visualizers/BulbBrightnessVisualizer";
import "./App.css";

const CATEGORIES = [
  { id: "algorithm", name: "アルゴリズム" },
  { id: "math", name: "数学" },
  { id: "science", name: "理科" },
];

const ALGORITHM_TOPICS = [
  { id: "pathfinding", name: "経路探索" },
  { id: "sorting", name: "ソート" },
  { id: "maze", name: "迷路生成と探索" },
];

const MATH_SUBCATEGORIES = [
  { id: "geometry", name: "図形・幾何学" },
  { id: "trigonometry", name: "三角関数" },
  { id: "number-theory", name: "数論・暗号" },
  { id: "functions", name: "関数・グラフ" },
  { id: "probability", name: "確率・統計" },
];

const GEOMETRY_TOPICS = [
  { id: "pythagorean", name: "三平方の定理" },
  { id: "circle-theorems", name: "円の定理" },
  { id: "triangle-angle-sum", name: "三角形の内角の和" },
  { id: "polygon-angle-sum", name: "多角形の内角の和" },
  { id: "triangle-congruence", name: "三角形の合同条件" },
  { id: "triangle-similarity", name: "三角形の相似条件" },
  { id: "circle-tangent", name: "円と接線の性質" },
  { id: "sector", name: "おうぎ形" },
];

const TRIGONOMETRY_TOPICS = [
  { id: "addition-theorem", name: "加法定理" },
];

const NUMBER_THEORY_TOPICS = [
  { id: "rsa", name: "RSA暗号" },
  { id: "abc-conjecture", name: "ABC予想" },
  { id: "prime-factorization", name: "素因数分解" },
  { id: "sieve", name: "エラトステネスの篩" },
  { id: "gcd-lcm", name: "最大公約数・最小公倍数" },
  { id: "sqrt-number-line", name: "平方根の大きさ" },
];

const FUNCTION_TOPICS = [
  { id: "proportion", name: "比例・反比例" },
  { id: "linear", name: "一次関数" },
  { id: "quadratic", name: "二次関数" },
];

const PROBABILITY_TOPICS = [
  { id: "dice", name: "サイコロの確率シミュレーション" },
  { id: "histogram", name: "度数分布とヒストグラム" },
];

const SCIENCE_SUBCATEGORIES = [
  { id: "electricity", name: "電気" },
];

const ELECTRICITY_TOPICS = [
  { id: "circuit", name: "オームの法則" },
  { id: "bulb-brightness", name: "豆電球の明るさ" },
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
      <Route path="/algorithm/maze" element={<VisualizerPage component={MazeVisualizer} backTo="/algorithm" />} />

      {/* Math */}
      <Route path="/math" element={<ListPage title="数学" backTo="/" items={MATH_SUBCATEGORIES} basePath="/math" />} />
      <Route path="/math/geometry" element={<ListPage title="図形・幾何学" backTo="/math" items={GEOMETRY_TOPICS} basePath="/math/geometry" />} />
      <Route path="/math/geometry/pythagorean" element={<VisualizerPage component={PythagoreanVisualizer} backTo="/math/geometry" />} />
      <Route path="/math/geometry/circle-theorems" element={<VisualizerPage component={CircleTheoremVisualizer} backTo="/math/geometry" />} />
      <Route path="/math/geometry/triangle-angle-sum" element={<VisualizerPage component={TriangleAngleSumVisualizer} backTo="/math/geometry" />} />
      <Route path="/math/geometry/polygon-angle-sum" element={<VisualizerPage component={PolygonAngleSumVisualizer} backTo="/math/geometry" />} />
      <Route path="/math/geometry/triangle-congruence" element={<VisualizerPage component={TriangleCongruenceVisualizer} backTo="/math/geometry" />} />
      <Route path="/math/geometry/triangle-similarity" element={<VisualizerPage component={TriangleSimilarityVisualizer} backTo="/math/geometry" />} />
      <Route path="/math/geometry/circle-tangent" element={<VisualizerPage component={CircleTangentVisualizer} backTo="/math/geometry" />} />
      <Route path="/math/geometry/sector" element={<VisualizerPage component={SectorVisualizer} backTo="/math/geometry" />} />
      <Route path="/math/trigonometry" element={<ListPage title="三角関数" backTo="/math" items={TRIGONOMETRY_TOPICS} basePath="/math/trigonometry" />} />
      <Route path="/math/trigonometry/addition-theorem" element={<VisualizerPage component={AdditionTheoremVisualizer} backTo="/math/trigonometry" />} />
      <Route path="/math/number-theory" element={<ListPage title="数論・暗号" backTo="/math" items={NUMBER_THEORY_TOPICS} basePath="/math/number-theory" />} />
      <Route path="/math/number-theory/rsa" element={<VisualizerPage component={RsaVisualizer} backTo="/math/number-theory" />} />
      <Route path="/math/number-theory/abc-conjecture" element={<VisualizerPage component={AbcConjectureVisualizer} backTo="/math/number-theory" />} />
      <Route path="/math/number-theory/prime-factorization" element={<VisualizerPage component={PrimeFactorizationVisualizer} backTo="/math/number-theory" />} />
      <Route path="/math/number-theory/sieve" element={<VisualizerPage component={SieveVisualizer} backTo="/math/number-theory" />} />
      <Route path="/math/number-theory/gcd-lcm" element={<VisualizerPage component={GcdLcmVisualizer} backTo="/math/number-theory" />} />
      <Route path="/math/number-theory/sqrt-number-line" element={<VisualizerPage component={SqrtNumberLineVisualizer} backTo="/math/number-theory" />} />
      <Route path="/math/functions" element={<ListPage title="関数・グラフ" backTo="/math" items={FUNCTION_TOPICS} basePath="/math/functions" />} />
      <Route path="/math/functions/proportion" element={<VisualizerPage component={ProportionVisualizer} backTo="/math/functions" />} />
      <Route path="/math/functions/linear" element={<VisualizerPage component={LinearFunctionVisualizer} backTo="/math/functions" />} />
      <Route path="/math/functions/quadratic" element={<VisualizerPage component={QuadraticFunctionVisualizer} backTo="/math/functions" />} />
      <Route path="/math/probability" element={<ListPage title="確率・統計" backTo="/math" items={PROBABILITY_TOPICS} basePath="/math/probability" />} />
      <Route path="/math/probability/dice" element={<VisualizerPage component={DiceSimulationVisualizer} backTo="/math/probability" />} />
      <Route path="/math/probability/histogram" element={<VisualizerPage component={HistogramVisualizer} backTo="/math/probability" />} />

      {/* Science */}
      <Route path="/science" element={<ListPage title="理科" backTo="/" items={SCIENCE_SUBCATEGORIES} basePath="/science" />} />
      <Route path="/science/electricity" element={<ListPage title="電気" backTo="/science" items={ELECTRICITY_TOPICS} basePath="/science/electricity" />} />
      <Route path="/science/electricity/circuit" element={<VisualizerPage component={CircuitVisualizer} backTo="/science/electricity" />} />
      <Route path="/science/electricity/bulb-brightness" element={<VisualizerPage component={BulbBrightnessVisualizer} backTo="/science/electricity" />} />

      {/* Legacy redirects */}
      <Route path="/pathfinding" element={<Navigate to="/algorithm/pathfinding/astar" replace />} />
      <Route path="/pathfinding/:algorithm" element={<Navigate to="/algorithm/pathfinding/astar" replace />} />
      <Route path="/sorting" element={<Navigate to="/algorithm/sorting/bubble" replace />} />
      <Route path="/sorting/:algorithm" element={<Navigate to="/algorithm/sorting/bubble" replace />} />
    </Routes>
  );
}

export default App;
