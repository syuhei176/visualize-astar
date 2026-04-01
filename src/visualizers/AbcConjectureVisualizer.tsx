import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

function gcd(a: number, b: number): number {
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

function primeFactors(n: number): number[] {
  const factors = new Set<number>();
  let d = 2;
  while (d * d <= n) {
    while (n % d === 0) {
      factors.add(d);
      n /= d;
    }
    d++;
  }
  if (n > 1) factors.add(n);
  return [...factors].sort((a, b) => a - b);
}

function rad(n: number): number {
  return primeFactors(n).reduce((acc, p) => acc * p, 1);
}

interface AbcTriple {
  a: number;
  b: number;
  c: number;
  radAbc: number;
  quality: number;
}

function findAbcTriples(maxC: number): AbcTriple[] {
  const triples: AbcTriple[] = [];
  for (let a = 1; a < maxC; a++) {
    for (let b = a; b < maxC - a; b++) {
      const c = a + b;
      if (c > maxC) break;
      if (gcd(a, b) !== 1) continue;
      const radAbc = rad(a * b * c);
      const quality = Math.log(c) / Math.log(radAbc);
      triples.push({ a, b, c, radAbc, quality });
    }
  }
  return triples;
}

function AbcConjectureVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [maxC, setMaxC] = useState(200);
  const [triples, setTriples] = useState<AbcTriple[]>([]);
  const [hits, setHits] = useState<AbcTriple[]>([]);
  const [selectedHit, setSelectedHit] = useState<AbcTriple | null>(null);

  useEffect(() => {
    const all = findAbcTriples(maxC);
    setTriples(all);
    const abcHits = all.filter((t) => t.quality > 1).sort((a, b) => b.quality - a.quality);
    setHits(abcHits);
    setSelectedHit(abcHits[0] || null);
  }, [maxC]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || triples.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    ctx.clearRect(0, 0, w, h);

    const pad = 40;
    const plotW = w - pad * 2;
    const plotH = h - pad * 2;

    // Axes
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, pad);
    ctx.lineTo(pad, h - pad);
    ctx.lineTo(w - pad, h - pad);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("log(c)", w / 2, h - 8);
    ctx.save();
    ctx.translate(12, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("log(rad(abc))", 0, 0);
    ctx.restore();

    // Find ranges
    const maxLogC = Math.log(maxC);
    const maxLogRad = maxLogC * 1.2;

    // Draw quality = 1 line (log(c) = log(rad))
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    const lineEnd = Math.min(maxLogC, maxLogRad);
    ctx.moveTo(pad, h - pad);
    ctx.lineTo(
      pad + (lineEnd / maxLogC) * plotW,
      h - pad - (lineEnd / maxLogRad) * plotH,
    );
    ctx.stroke();
    ctx.setLineDash([]);

    // Label for q=1 line
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "left";
    const labelX = pad + (lineEnd * 0.7 / maxLogC) * plotW;
    const labelY = h - pad - (lineEnd * 0.7 / maxLogRad) * plotH;
    ctx.fillText("q = 1", labelX + 8, labelY - 4);

    // Plot points
    for (const t of triples) {
      const logC = Math.log(t.c);
      const logRad = Math.log(t.radAbc);
      const x = pad + (logC / maxLogC) * plotW;
      const y = h - pad - (logRad / maxLogRad) * plotH;

      if (t.quality > 1) {
        // ABC hit - bright point
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#ff5252";
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 82, 82, 0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Normal point
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(66, 165, 245, 0.3)";
        ctx.fill();
      }
    }

    // Highlight selected
    if (selectedHit) {
      const logC = Math.log(selectedHit.c);
      const logRad = Math.log(selectedHit.radAbc);
      const x = pad + (logC / maxLogC) * plotW;
      const y = h - pad - (logRad / maxLogRad) * plotH;
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.strokeStyle = "#ffc107";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Explanation text in plot
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("線より下 = q > 1 (ABC hit)", w - pad - 4, pad + 16);
  }, [triples, maxC, selectedHit]);

  useEffect(() => {
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [draw]);

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>ABC予想</h2>
        <p className="algo-subtitle">ABC Conjecture</p>
      </div>

      <div className="formula">
        a + b = c, gcd(a,b) = 1 → rad(abc) と c の関係
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {selectedHit && (
        <div className="info-panel">
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-value">{selectedHit.a} + {selectedHit.b} = {selectedHit.c}</span>
              <span className="stat-label">a + b = c</span>
            </div>
          </div>
          <div className="stats-row" style={{ marginTop: 8 }}>
            <div className="stat-item">
              <span className="stat-value">{selectedHit.radAbc}</span>
              <span className="stat-label">rad(abc)</span>
            </div>
            <div className="stat-item">
              <span className="stat-value" style={{ color: "#ff5252" }}>
                {selectedHit.quality.toFixed(3)}
              </span>
              <span className="stat-label">quality (q)</span>
            </div>
          </div>
          <div className="stats-row" style={{ marginTop: 4 }}>
            <div className="stat-item">
              <span className="stat-value" style={{ fontSize: 13 }}>
                {primeFactors(selectedHit.a).join("·") || "1"} | {primeFactors(selectedHit.b).join("·")} | {primeFactors(selectedHit.c).join("·")}
              </span>
              <span className="stat-label">素因数 (a | b | c)</span>
            </div>
          </div>
        </div>
      )}

      {hits.length > 0 && (
        <div style={{ padding: "0 16px 8px", maxHeight: 100, overflowY: "auto" }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
            {hits.slice(0, 20).map((hit, i) => (
              <button
                key={i}
                onClick={() => setSelectedHit(hit)}
                style={{
                  background: selectedHit === hit ? "rgba(255, 193, 7, 0.2)" : "rgba(255,255,255,0.08)",
                  border: selectedHit === hit ? "1px solid #ffc107" : "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 6,
                  padding: "4px 8px",
                  color: "#fff",
                  fontSize: 11,
                  cursor: "pointer",
                }}
              >
                {hit.a}+{hit.b}={hit.c} (q={hit.quality.toFixed(2)})
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="controls-bar">
        <div className="slider-group">
          <label>範囲</label>
          <input
            type="range"
            min="50"
            max="500"
            step="50"
            value={maxC}
            onChange={(e) => setMaxC(Number(e.target.value))}
          />
          <span className="value">c≤{maxC}</span>
        </div>
        <div className="slider-group">
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
            {triples.length}組 / {hits.length} hits
          </span>
        </div>
      </div>
    </div>
  );
}

export default AbcConjectureVisualizer;
