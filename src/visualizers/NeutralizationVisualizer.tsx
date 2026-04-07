import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

function NeutralizationVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ratio, setRatio] = useState(50); // 0 = pure acid, 100 = pure base, 50 = neutral
  const animRef = useRef(0);
  const timeRef = useRef(0);

  // pH from ratio: 0 -> pH 1, 50 -> pH 7, 100 -> pH 13
  const pH = 1 + (ratio / 100) * 12;

  const getPHColor = (pH: number): string => {
    if (pH < 3) return "#ef5350";
    if (pH < 5) return "#ff9800";
    if (pH < 6) return "#ffca28";
    if (pH < 6.5) return "#c0ca33";
    if (pH < 7.5) return "#69f0ae";
    if (pH < 8.5) return "#42a5f5";
    if (pH < 10) return "#5c6bc0";
    if (pH < 12) return "#7e57c2";
    return "#ab47bc";
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
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

    const t = timeRef.current;
    const mainColor = getPHColor(pH);

    // Beaker / mixing container
    const beakerCx = w / 2;
    const beakerY = h * 0.15;
    const beakerW = w * 0.5;
    const beakerH = h * 0.35;
    const beakerLeft = beakerCx - beakerW / 2;
    const beakerBottom = beakerY + beakerH;

    // Solution
    ctx.fillStyle = mainColor + "40";
    ctx.fillRect(beakerLeft + 2, beakerY + beakerH * 0.2, beakerW - 4, beakerH * 0.79);

    // Ions
    const acidRatio = 1 - ratio / 100;
    const baseRatio = ratio / 100;
    const hCount = Math.floor(acidRatio * 20) + 1;
    const ohCount = Math.floor(baseRatio * 20) + 1;
    const waterCount = Math.min(hCount, ohCount);

    let seed = 77;
    const rand = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };

    // H+ ions (red)
    const ionAreaTop = beakerY + beakerH * 0.25;
    const ionAreaH = beakerH * 0.7;
    for (let i = 0; i < hCount; i++) {
      const ix = beakerLeft + 12 + rand() * (beakerW - 24);
      const iy = ionAreaTop + rand() * ionAreaH;
      const bobble = Math.sin(t * 2 + i) * 3;

      ctx.font = "bold 12px sans-serif";
      ctx.fillStyle = "#ef5350";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("H\u207A", ix + bobble, iy);
    }

    // OH- ions (blue)
    seed = 123;
    for (let i = 0; i < ohCount; i++) {
      const ix = beakerLeft + 12 + rand() * (beakerW - 24);
      const iy = ionAreaTop + rand() * ionAreaH;
      const bobble = Math.sin(t * 2 + i + 1) * 3;

      ctx.font = "bold 11px sans-serif";
      ctx.fillStyle = "#42a5f5";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("OH\u207B", ix + bobble, iy);
    }

    // H2O molecules (when neutralized)
    seed = 200;
    for (let i = 0; i < waterCount; i++) {
      const ix = beakerLeft + 12 + rand() * (beakerW - 24);
      const iy = ionAreaTop + rand() * ionAreaH;

      ctx.font = "10px sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("H\u2082O", ix, iy);
    }

    // Beaker outline
    ctx.beginPath();
    ctx.moveTo(beakerLeft, beakerY);
    ctx.lineTo(beakerLeft, beakerBottom);
    ctx.lineTo(beakerLeft + beakerW, beakerBottom);
    ctx.lineTo(beakerLeft + beakerW, beakerY);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Pouring indicators
    // Acid (left)
    if (acidRatio > 0.05) {
      ctx.beginPath();
      ctx.moveTo(beakerLeft + 20, beakerY - 20);
      ctx.lineTo(beakerLeft + 20, beakerY + 5);
      ctx.strokeStyle = `rgba(239, 83, 80, ${acidRatio})`;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.font = "bold 12px sans-serif";
      ctx.fillStyle = "#ef5350";
      ctx.textAlign = "center";
      ctx.fillText("酸 (HCl)", beakerLeft + 20, beakerY - 30);
    }

    // Base (right)
    if (baseRatio > 0.05) {
      ctx.beginPath();
      ctx.moveTo(beakerLeft + beakerW - 20, beakerY - 20);
      ctx.lineTo(beakerLeft + beakerW - 20, beakerY + 5);
      ctx.strokeStyle = `rgba(66, 165, 245, ${baseRatio})`;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.font = "bold 12px sans-serif";
      ctx.fillStyle = "#42a5f5";
      ctx.textAlign = "center";
      ctx.fillText("アルカリ (NaOH)", beakerLeft + beakerW - 20, beakerY - 30);
    }

    // pH Scale
    const scaleX = w * 0.08;
    const scaleW = w * 0.84;
    const scaleY = h * 0.6;
    const scaleH = 28;

    // pH gradient bar
    for (let i = 0; i <= scaleW; i++) {
      const p = 0 + (i / scaleW) * 14;
      ctx.fillStyle = getPHColor(p);
      ctx.globalAlpha = 0.6;
      ctx.fillRect(scaleX + i, scaleY, 1, scaleH);
    }
    ctx.globalAlpha = 1;

    // Scale border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;
    ctx.strokeRect(scaleX, scaleY, scaleW, scaleH);

    // pH numbers
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    for (let p = 0; p <= 14; p++) {
      const px = scaleX + (p / 14) * scaleW;
      ctx.fillText(`${p}`, px, scaleY + scaleH + 14);
      // Tick mark
      ctx.beginPath();
      ctx.moveTo(px, scaleY + scaleH);
      ctx.lineTo(px, scaleY + scaleH + 4);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Labels on scale
    ctx.font = "bold 11px sans-serif";
    ctx.fillStyle = "#ef5350";
    ctx.textAlign = "left";
    ctx.fillText("酸性", scaleX, scaleY - 6);
    ctx.fillStyle = "#69f0ae";
    ctx.textAlign = "center";
    ctx.fillText("中性", scaleX + scaleW / 2, scaleY - 6);
    ctx.fillStyle = "#ab47bc";
    ctx.textAlign = "right";
    ctx.fillText("アルカリ性", scaleX + scaleW, scaleY - 6);

    // Current pH indicator
    const phX = scaleX + (pH / 14) * scaleW;
    ctx.beginPath();
    ctx.moveTo(phX, scaleY);
    ctx.lineTo(phX - 6, scaleY - 10);
    ctx.lineTo(phX + 6, scaleY - 10);
    ctx.closePath();
    ctx.fillStyle = "#fff";
    ctx.fill();

    // pH value display
    ctx.font = "bold 28px 'Courier New', monospace";
    ctx.fillStyle = mainColor;
    ctx.textAlign = "center";
    ctx.fillText(`pH ${pH.toFixed(1)}`, w / 2, h * 0.78);

    // Reaction equation
    ctx.font = "bold 14px 'Courier New', monospace";
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.textAlign = "center";
    ctx.fillText("H\u207A + OH\u207B \u2192 H\u2082O", w / 2, h * 0.85);

    // Status
    let status = "";
    if (pH < 6.5) status = "酸性: H\u207Aイオンが多い";
    else if (pH > 7.5) status = "アルカリ性: OH\u207Bイオンが多い";
    else status = "中性: H\u207AとOH\u207Bが等量 \u2192 水ができる";

    ctx.font = "13px sans-serif";
    ctx.fillStyle = mainColor;
    ctx.fillText(status, w / 2, h * 0.91);
  }, [ratio, pH]);

  useEffect(() => {
    let running = true;
    const animate = () => {
      if (!running) return;
      timeRef.current += 0.016;
      draw();
      animRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
    };
  }, [draw]);

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>中和反応</h2>
        <p className="algo-subtitle">Neutralization & pH</p>
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="controls-bar">
        <div className="slider-group">
          <label>酸 \u2190\u2192 アルカリ</label>
          <input
            type="range"
            min="0"
            max="100"
            value={ratio}
            onChange={(e) => setRatio(Number(e.target.value))}
          />
          <span className="value">pH {pH.toFixed(1)}</span>
        </div>
      </div>

      <div className="step-info">
        <p className="step-description">
          スライダーで酸とアルカリの割合を変えて、中和反応とpHの変化を観察しよう
        </p>
      </div>
    </div>
  );
}

export default NeutralizationVisualizer;
