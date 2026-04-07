import { useState, useRef, useCallback } from "react";
import "./MathVisualizer.css";

const MAX_N = 100;

function SieveVisualizer() {
  const [cells, setCells] = useState<("none" | "prime" | "composite" | "current")[]>(
    () => Array(MAX_N + 1).fill("none"),
  );
  const [isRunning, setIsRunning] = useState(false);
  const [currentPrime, setCurrentPrime] = useState(0);
  const [primeCount, setPrimeCount] = useState(0);
  const cancelRef = useRef(false);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const runSieve = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    cancelRef.current = false;

    const state: ("none" | "prime" | "composite" | "current")[] = Array(MAX_N + 1).fill("none");
    state[0] = "composite";
    state[1] = "composite";
    setCells([...state]);
    let count = 0;

    for (let i = 2; i <= MAX_N; i++) {
      if (cancelRef.current) break;
      if (state[i] === "composite") continue;

      state[i] = "current";
      setCurrentPrime(i);
      setCells([...state]);
      await sleep(200);

      if (cancelRef.current) break;

      state[i] = "prime";
      count++;
      setPrimeCount(count);

      // 倍数を消す
      for (let j = i * 2; j <= MAX_N; j += i) {
        if (cancelRef.current) break;
        if (state[j] !== "composite") {
          state[j] = "current";
          setCells([...state]);
          await sleep(30);
          state[j] = "composite";
          setCells([...state]);
        }
      }
    }

    // 残りをprimeに
    for (let i = 2; i <= MAX_N; i++) {
      if (state[i] === "none") {
        state[i] = "prime";
        count++;
      }
    }
    setPrimeCount(count);
    setCurrentPrime(0);
    setCells([...state]);
    setIsRunning(false);
  }, [isRunning]);

  const reset = useCallback(() => {
    cancelRef.current = true;
    setIsRunning(false);
    setCells(Array(MAX_N + 1).fill("none"));
    setCurrentPrime(0);
    setPrimeCount(0);
  }, []);

  const getCellStyle = (state: string): React.CSSProperties => {
    switch (state) {
      case "prime":
        return { backgroundColor: "#43a047", color: "#fff", fontWeight: 700 };
      case "composite":
        return { backgroundColor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.2)" };
      case "current":
        return { backgroundColor: "#ff9800", color: "#000", fontWeight: 700 };
      default:
        return { backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" };
    }
  };

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>エラトステネスの篩</h2>
        <p className="algo-subtitle">Sieve of Eratosthenes</p>
      </div>

      <div className="formula">1〜{MAX_N} の素数を見つける</div>

      <div className="canvas-wrapper" style={{ alignItems: "flex-start", paddingTop: 8 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(10, 1fr)",
            gap: 3,
            width: "100%",
            maxWidth: 400,
            padding: "0 8px",
          }}
        >
          {cells.slice(1).map((state, i) => (
            <div
              key={i + 1}
              style={{
                ...getCellStyle(state),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                aspectRatio: "1",
                borderRadius: 4,
                fontSize: 12,
                transition: "background-color 0.2s",
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      <div className="info-panel">
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#43a047" }}>{primeCount}</span>
            <span className="stat-label">素数の数</span>
          </div>
          {currentPrime > 0 && (
            <div className="stat-item">
              <span className="stat-value" style={{ color: "#ff9800" }}>{currentPrime}</span>
              <span className="stat-label">処理中</span>
            </div>
          )}
        </div>
      </div>

      <div className="controls-bar">
        <button className="btn-step" onClick={runSieve} disabled={isRunning}>
          Start
        </button>
        <button className="btn-reset" onClick={reset}>
          Reset
        </button>
      </div>

      <div className="step-info">
        <p className="step-description">
          素数の倍数を順番に消していくアルゴリズムを観察しよう
        </p>
      </div>
    </div>
  );
}

export default SieveVisualizer;
