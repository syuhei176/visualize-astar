import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SORTING_ALGORITHMS } from "../algorithms/sorting";
import { HighlightRole, StepInfo } from "../types";
import "./SortingVisualizer.css";

const ARRAY_SIZE = 30;
const MAX_VALUE = 100;

const LEGEND_ITEMS: { label: string; className: string }[] = [
  { label: "比較", className: "comparing" },
  { label: "交換", className: "swapping" },
  { label: "ピボット", className: "highlight-pivot" },
  { label: "範囲", className: "highlight-range" },
  { label: "最小", className: "highlight-minimum" },
  { label: "キー", className: "highlight-key" },
  { label: "ヒープ", className: "highlight-heap-root" },
  { label: "マージ", className: "highlight-merged" },
];

function SortingVisualizer() {
  const { algorithm: algorithmParam } = useParams<{ algorithm: string }>();
  const navigate = useNavigate();
  const algorithm =
    algorithmParam && algorithmParam in SORTING_ALGORITHMS
      ? algorithmParam
      : "bubble";
  const algorithmName = SORTING_ALGORITHMS[algorithm].name;

  const [array, setArray] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(50);
  const [comparisons, setComparisons] = useState<number>(0);
  const [swaps, setSwaps] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<string>("");
  const comparingIndicesRef = useRef<number[]>([]);
  const swappingIndicesRef = useRef<number[]>([]);
  const highlightsRef = useRef<Map<number, HighlightRole>>(new Map());

  useEffect(() => {
    generateArray();
  }, []);

  const generateArray = () => {
    const newArray = Array.from(
      { length: ARRAY_SIZE },
      () => Math.floor(Math.random() * MAX_VALUE) + 1,
    );
    setArray(newArray);
    setComparisons(0);
    setSwaps(0);
    setCurrentStep("");
    comparingIndicesRef.current = [];
    swappingIndicesRef.current = [];
    highlightsRef.current = new Map();
  };

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const handleCompare = async (i: number, j: number) => {
    comparingIndicesRef.current = [i, j];
    setComparisons((prev) => prev + 1);
    setArray((prev) => [...prev]);
    await sleep(101 - speed);
    comparingIndicesRef.current = [];
  };

  const handleSwap = async (newArray: number[], i: number, j: number) => {
    swappingIndicesRef.current = [i, j];
    setSwaps((prev) => prev + 1);
    setArray([...newArray]);
    await sleep(101 - speed);
    swappingIndicesRef.current = [];
  };

  const handleStep = async (step: StepInfo) => {
    setCurrentStep(step.description);
    highlightsRef.current = step.highlights;
    setArray((prev) => [...prev]);
    await sleep(101 - speed);
  };

  const runSort = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setComparisons(0);
    setSwaps(0);
    setCurrentStep("");
    highlightsRef.current = new Map();

    const algorithmFn = SORTING_ALGORITHMS[algorithm].fn;
    await algorithmFn(array, handleSwap, handleCompare, undefined, handleStep);

    setCurrentStep("ソート完了!");
    highlightsRef.current = new Map();
    for (let i = 0; i < array.length; i++) {
      swappingIndicesRef.current = [i];
      setArray((prev) => [...prev]);
      await sleep(20);
    }
    swappingIndicesRef.current = [];
    setArray((prev) => [...prev]);

    setIsRunning(false);
  };

  const getBarClass = (index: number): string => {
    const classes = ["bar"];
    const highlight = highlightsRef.current.get(index);
    if (highlight) {
      classes.push(`highlight-${highlight}`);
    }
    if (comparingIndicesRef.current.includes(index)) {
      classes.push("comparing");
    }
    if (swappingIndicesRef.current.includes(index)) {
      classes.push("swapping");
    }
    return classes.join(" ");
  };

  return (
    <div className="sorting-visualizer">
      <div className="algo-title">
        <h2>{algorithmName}</h2>
        <p className="algo-subtitle">Sorting Algorithm</p>
      </div>

      <div className="step-info">
        <p className="step-description">
          {currentStep || "\u00A0"}
        </p>
      </div>

      <div className="array-container">
        {array.map((value, index) => (
          <div
            key={index}
            className={getBarClass(index)}
            style={{
              height: `${(value / MAX_VALUE) * 100}%`,
              width: `${100 / ARRAY_SIZE}%`,
            }}
          >
            <span className="bar-value">{value}</span>
          </div>
        ))}
      </div>

      <div className="bottom-info">
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-value">{comparisons}</span>
            <span className="stat-label">比較</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{swaps}</span>
            <span className="stat-label">交換</span>
          </div>
        </div>
        <div className="legend">
          {LEGEND_ITEMS.map((item) => (
            <div key={item.className} className="legend-item">
              <div className={`legend-swatch bar ${item.className}`} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="controls-bar">
        <select
          value={algorithm}
          onChange={(e) => navigate(`/sorting/${e.target.value}`)}
          disabled={isRunning}
        >
          {Object.entries(SORTING_ALGORITHMS).map(([key, { name }]) => (
            <option key={key} value={key}>
              {name}
            </option>
          ))}
        </select>
        <div className="speed-control">
          <input
            type="range"
            min="1"
            max="100"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            disabled={isRunning}
          />
        </div>
        <button className="btn-start" onClick={runSort} disabled={isRunning}>
          Start
        </button>
        <button
          className="btn-reset"
          onClick={generateArray}
          disabled={isRunning}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export default SortingVisualizer;
