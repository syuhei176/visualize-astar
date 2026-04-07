import { useState, useRef, useCallback } from "react";
import "./MathVisualizer.css";

function DiceSimulationVisualizer() {
  const [diceCount, setDiceCount] = useState(1);
  const [rolls, setRolls] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const cancelRef = useRef(false);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const getFrequencies = useCallback((data: number[]) => {
    const min = diceCount;
    const max = diceCount * 6;
    const freq: Record<number, number> = {};
    for (let i = min; i <= max; i++) freq[i] = 0;
    for (const v of data) freq[v] = (freq[v] || 0) + 1;
    return freq;
  }, [diceCount]);

  const rollDice = useCallback(() => {
    let sum = 0;
    for (let i = 0; i < diceCount; i++) {
      sum += Math.floor(Math.random() * 6) + 1;
    }
    return sum;
  }, [diceCount]);

  const simulate = useCallback(async (count: number) => {
    if (isRunning) return;
    setIsRunning(true);
    cancelRef.current = false;

    const newRolls: number[] = [];
    const batchSize = Math.max(1, Math.floor(count / 100));

    for (let i = 0; i < count; i += batchSize) {
      if (cancelRef.current) break;
      const batch = Math.min(batchSize, count - i);
      for (let j = 0; j < batch; j++) {
        newRolls.push(rollDice());
      }
      setRolls([...newRolls]);
      if (count > 100) await sleep(10);
    }

    setIsRunning(false);
  }, [isRunning, rollDice]);

  const reset = useCallback(() => {
    cancelRef.current = true;
    setIsRunning(false);
    setRolls([]);
  }, []);

  const freq = getFrequencies(rolls);
  const min = diceCount;
  const max = diceCount * 6;
  const maxFreq = Math.max(1, ...Object.values(freq));
  const total = rolls.length;

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>サイコロの確率</h2>
        <p className="algo-subtitle">Dice Probability Simulation</p>
      </div>

      <div className="formula">
        {diceCount}個のサイコロ — {total}回試行
      </div>

      <div className="canvas-wrapper" style={{ alignItems: "flex-end", padding: "12px 20px" }}>
        <div style={{ width: "100%", maxWidth: 500, display: "flex", flexDirection: "column", gap: 4 }}>
          {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((val) => {
            const count = freq[val] || 0;
            const pct = total > 0 ? (count / total) * 100 : 0;
            const barW = total > 0 ? (count / maxFreq) * 100 : 0;
            return (
              <div key={val} style={{ display: "flex", alignItems: "center", gap: 8, height: 20 }}>
                <span style={{ minWidth: 24, textAlign: "right", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{val}</span>
                <div style={{ flex: 1, height: 14, background: "rgba(255,255,255,0.05)", borderRadius: 3 }}>
                  <div
                    style={{
                      width: `${barW}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #42a5f5, #69f0ae)",
                      borderRadius: 3,
                      transition: "width 0.2s",
                    }}
                  />
                </div>
                <span style={{ minWidth: 50, fontSize: 11, color: "rgba(255,255,255,0.4)", textAlign: "right" }}>
                  {count} ({pct.toFixed(1)}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="info-panel">
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-value">{total}</span>
            <span className="stat-label">試行回数</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#42a5f5" }}>
              {total > 0 ? (rolls.reduce((s, v) => s + v, 0) / total).toFixed(2) : "—"}
            </span>
            <span className="stat-label">平均</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: "#69f0ae" }}>
              {(diceCount * 3.5).toFixed(1)}
            </span>
            <span className="stat-label">期待値</span>
          </div>
        </div>
      </div>

      <div className="controls-bar">
        <div className="slider-group">
          <label>個数</label>
          <input type="range" min="1" max="3" step="1" value={diceCount} onChange={(e) => { setDiceCount(Number(e.target.value)); setRolls([]); }} disabled={isRunning} />
          <span className="value">{diceCount}</span>
        </div>
        <button className="btn-step" onClick={() => simulate(10)} disabled={isRunning} style={{ fontSize: 13, padding: "6px 12px" }}>
          +10回
        </button>
        <button className="btn-step" onClick={() => simulate(100)} disabled={isRunning} style={{ fontSize: 13, padding: "6px 12px" }}>
          +100回
        </button>
        <button className="btn-step" onClick={() => simulate(1000)} disabled={isRunning} style={{ fontSize: 13, padding: "6px 12px" }}>
          +1000回
        </button>
        <button className="btn-reset" onClick={reset} style={{ fontSize: 13, padding: "6px 12px" }}>
          Reset
        </button>
      </div>

      <div className="step-info">
        <p className="step-description">
          試行回数を増やすと、確率分布が理論値に近づくことを確認しよう
        </p>
      </div>
    </div>
  );
}

export default DiceSimulationVisualizer;
