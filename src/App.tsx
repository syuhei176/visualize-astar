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
import SolidNetVisualizer from "./visualizers/SolidNetVisualizer";
import SolidVolumeVisualizer from "./visualizers/SolidVolumeVisualizer";
import SymmetryVisualizer from "./visualizers/SymmetryVisualizer";
import ParallelAnglesVisualizer from "./visualizers/ParallelAnglesVisualizer";
import AreaTransformVisualizer from "./visualizers/AreaTransformVisualizer";
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
import StaticElectricityVisualizer from "./visualizers/StaticElectricityVisualizer";
import ElectromagnetVisualizer from "./visualizers/ElectromagnetVisualizer";
import ForceCompositionVisualizer from "./visualizers/ForceCompositionVisualizer";
import LeverVisualizer from "./visualizers/LeverVisualizer";
import PulleyVisualizer from "./visualizers/PulleyVisualizer";
import MotionVisualizer from "./visualizers/MotionVisualizer";
import ForceBalanceVisualizer from "./visualizers/ForceBalanceVisualizer";
import BuoyancyVisualizer from "./visualizers/BuoyancyVisualizer";
import LightReflectionVisualizer from "./visualizers/LightReflectionVisualizer";
import LightRefractionVisualizer from "./visualizers/LightRefractionVisualizer";
import ConvexLensVisualizer from "./visualizers/ConvexLensVisualizer";
import SoundWaveVisualizer from "./visualizers/SoundWaveVisualizer";
import MoonPhaseVisualizer from "./visualizers/MoonPhaseVisualizer";
import EclipseVisualizer from "./visualizers/EclipseVisualizer";
import SolarSystemVisualizer from "./visualizers/SolarSystemVisualizer";
import TimezoneVisualizer from "./visualizers/TimezoneVisualizer";
import StarMotionVisualizer from "./visualizers/StarMotionVisualizer";
import AtomStructureVisualizer from "./visualizers/AtomStructureVisualizer";
import SolutionConcentrationVisualizer from "./visualizers/SolutionConcentrationVisualizer";
import NeutralizationVisualizer from "./visualizers/NeutralizationVisualizer";
import PhotosynthesisVisualizer from "./visualizers/PhotosynthesisVisualizer";
import StratumVisualizer from "./visualizers/StratumVisualizer";
import WeatherFrontVisualizer from "./visualizers/WeatherFrontVisualizer";
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
  { id: "solid-net", name: "立体の展開図" },
  { id: "solid-volume", name: "立体の体積と表面積" },
  { id: "symmetry", name: "対称" },
  { id: "parallel-angles", name: "平行線と角" },
  { id: "area-transform", name: "面積の等積変形" },
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
  { id: "mechanics", name: "力学" },
  { id: "wave-light-sound", name: "波動・光・音" },
  { id: "astronomy", name: "天文" },
  { id: "chemistry", name: "化学" },
  { id: "biology-geology", name: "生物・地学" },
];

const ELECTRICITY_TOPICS = [
  { id: "circuit", name: "オームの法則" },
  { id: "bulb-brightness", name: "豆電球の明るさ" },
  { id: "static-electricity", name: "静電気" },
  { id: "electromagnet", name: "電磁石" },
];

const MECHANICS_TOPICS = [
  { id: "force-composition", name: "力の合成・分解" },
  { id: "lever", name: "てこの原理" },
  { id: "pulley", name: "滑車と仕事" },
  { id: "motion", name: "等速・等加速度運動" },
  { id: "force-balance", name: "力のつり合い" },
  { id: "buoyancy", name: "水圧と浮力" },
];

const WAVE_LIGHT_SOUND_TOPICS = [
  { id: "light-reflection", name: "光の反射" },
  { id: "light-refraction", name: "光の屈折" },
  { id: "convex-lens", name: "凸レンズの結像" },
  { id: "sound-wave", name: "音の波形" },
];

const ASTRONOMY_TOPICS = [
  { id: "moon-phase", name: "月の満ち欠け" },
  { id: "eclipse", name: "日食・月食" },
  { id: "solar-system", name: "太陽系の公転" },
  { id: "timezone", name: "地球の自転と時差" },
  { id: "star-motion", name: "星の日周・年周運動" },
];

const CHEMISTRY_TOPICS = [
  { id: "atom-structure", name: "原子の構造" },
  { id: "solution-concentration", name: "水溶液の濃度" },
  { id: "neutralization", name: "中和反応とpH" },
];

const BIOLOGY_GEOLOGY_TOPICS = [
  { id: "photosynthesis", name: "光合成と呼吸" },
  { id: "stratum", name: "地層のでき方" },
  { id: "weather-front", name: "天気図と前線" },
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
      <Route path="/math/geometry/solid-net" element={<VisualizerPage component={SolidNetVisualizer} backTo="/math/geometry" />} />
      <Route path="/math/geometry/solid-volume" element={<VisualizerPage component={SolidVolumeVisualizer} backTo="/math/geometry" />} />
      <Route path="/math/geometry/symmetry" element={<VisualizerPage component={SymmetryVisualizer} backTo="/math/geometry" />} />
      <Route path="/math/geometry/parallel-angles" element={<VisualizerPage component={ParallelAnglesVisualizer} backTo="/math/geometry" />} />
      <Route path="/math/geometry/area-transform" element={<VisualizerPage component={AreaTransformVisualizer} backTo="/math/geometry" />} />
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
      <Route path="/science/electricity/static-electricity" element={<VisualizerPage component={StaticElectricityVisualizer} backTo="/science/electricity" />} />
      <Route path="/science/electricity/electromagnet" element={<VisualizerPage component={ElectromagnetVisualizer} backTo="/science/electricity" />} />
      <Route path="/science/mechanics" element={<ListPage title="力学" backTo="/science" items={MECHANICS_TOPICS} basePath="/science/mechanics" />} />
      <Route path="/science/mechanics/force-composition" element={<VisualizerPage component={ForceCompositionVisualizer} backTo="/science/mechanics" />} />
      <Route path="/science/mechanics/lever" element={<VisualizerPage component={LeverVisualizer} backTo="/science/mechanics" />} />
      <Route path="/science/mechanics/pulley" element={<VisualizerPage component={PulleyVisualizer} backTo="/science/mechanics" />} />
      <Route path="/science/mechanics/motion" element={<VisualizerPage component={MotionVisualizer} backTo="/science/mechanics" />} />
      <Route path="/science/mechanics/force-balance" element={<VisualizerPage component={ForceBalanceVisualizer} backTo="/science/mechanics" />} />
      <Route path="/science/mechanics/buoyancy" element={<VisualizerPage component={BuoyancyVisualizer} backTo="/science/mechanics" />} />
      <Route path="/science/wave-light-sound" element={<ListPage title="波動・光・音" backTo="/science" items={WAVE_LIGHT_SOUND_TOPICS} basePath="/science/wave-light-sound" />} />
      <Route path="/science/wave-light-sound/light-reflection" element={<VisualizerPage component={LightReflectionVisualizer} backTo="/science/wave-light-sound" />} />
      <Route path="/science/wave-light-sound/light-refraction" element={<VisualizerPage component={LightRefractionVisualizer} backTo="/science/wave-light-sound" />} />
      <Route path="/science/wave-light-sound/convex-lens" element={<VisualizerPage component={ConvexLensVisualizer} backTo="/science/wave-light-sound" />} />
      <Route path="/science/wave-light-sound/sound-wave" element={<VisualizerPage component={SoundWaveVisualizer} backTo="/science/wave-light-sound" />} />
      <Route path="/science/astronomy" element={<ListPage title="天文" backTo="/science" items={ASTRONOMY_TOPICS} basePath="/science/astronomy" />} />
      <Route path="/science/astronomy/moon-phase" element={<VisualizerPage component={MoonPhaseVisualizer} backTo="/science/astronomy" />} />
      <Route path="/science/astronomy/eclipse" element={<VisualizerPage component={EclipseVisualizer} backTo="/science/astronomy" />} />
      <Route path="/science/astronomy/solar-system" element={<VisualizerPage component={SolarSystemVisualizer} backTo="/science/astronomy" />} />
      <Route path="/science/astronomy/timezone" element={<VisualizerPage component={TimezoneVisualizer} backTo="/science/astronomy" />} />
      <Route path="/science/astronomy/star-motion" element={<VisualizerPage component={StarMotionVisualizer} backTo="/science/astronomy" />} />
      <Route path="/science/chemistry" element={<ListPage title="化学" backTo="/science" items={CHEMISTRY_TOPICS} basePath="/science/chemistry" />} />
      <Route path="/science/chemistry/atom-structure" element={<VisualizerPage component={AtomStructureVisualizer} backTo="/science/chemistry" />} />
      <Route path="/science/chemistry/solution-concentration" element={<VisualizerPage component={SolutionConcentrationVisualizer} backTo="/science/chemistry" />} />
      <Route path="/science/chemistry/neutralization" element={<VisualizerPage component={NeutralizationVisualizer} backTo="/science/chemistry" />} />
      <Route path="/science/biology-geology" element={<ListPage title="生物・地学" backTo="/science" items={BIOLOGY_GEOLOGY_TOPICS} basePath="/science/biology-geology" />} />
      <Route path="/science/biology-geology/photosynthesis" element={<VisualizerPage component={PhotosynthesisVisualizer} backTo="/science/biology-geology" />} />
      <Route path="/science/biology-geology/stratum" element={<VisualizerPage component={StratumVisualizer} backTo="/science/biology-geology" />} />
      <Route path="/science/biology-geology/weather-front" element={<VisualizerPage component={WeatherFrontVisualizer} backTo="/science/biology-geology" />} />

      {/* Legacy redirects */}
      <Route path="/pathfinding" element={<Navigate to="/algorithm/pathfinding/astar" replace />} />
      <Route path="/pathfinding/:algorithm" element={<Navigate to="/algorithm/pathfinding/astar" replace />} />
      <Route path="/sorting" element={<Navigate to="/algorithm/sorting/bubble" replace />} />
      <Route path="/sorting/:algorithm" element={<Navigate to="/algorithm/sorting/bubble" replace />} />
    </Routes>
  );
}

export default App;
