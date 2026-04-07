import { useState, useRef, useEffect, useCallback } from "react";
import "./MathVisualizer.css";

function SoundWaveVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frequency, setFrequency] = useState(440);
  const [amplitude, setAmplitude] = useState(0.7);
  const animRef = useRef(0);
  const timeRef = useRef(0);

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

    const centerY = h / 2;
    const maxAmp = h * 0.4;
    const a = amplitude * maxAmp;

    // Grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    for (let gy = 0; gy < h; gy += 40) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
      ctx.stroke();
    }

    // Center axis
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(w, centerY);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Amplitude markers
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, centerY - a);
    ctx.lineTo(w, centerY - a);
    ctx.moveTo(0, centerY + a);
    ctx.lineTo(w, centerY + a);
    ctx.strokeStyle = "rgba(255, 152, 0, 0.3)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);

    // Amplitude labels
    ctx.font = "11px sans-serif";
    ctx.fillStyle = "rgba(255, 152, 0, 0.6)";
    ctx.textAlign = "left";
    ctx.fillText("振幅 (A)", 4, centerY - a - 4);

    // Wave
    const freqScale = frequency / 440;
    const phase = timeRef.current * 2;

    ctx.beginPath();
    for (let x = 0; x <= w; x++) {
      const t = (x / w) * Math.PI * 2 * 4 * freqScale + phase;
      const y = centerY - a * Math.sin(t);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "#42a5f5";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Glow effect
    ctx.beginPath();
    for (let x = 0; x <= w; x++) {
      const t = (x / w) * Math.PI * 2 * 4 * freqScale + phase;
      const y = centerY - a * Math.sin(t);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "rgba(66, 165, 245, 0.2)";
    ctx.lineWidth = 8;
    ctx.stroke();

    // Wavelength marker
    const wavelengthPx = w / (4 * freqScale);
    if (wavelengthPx > 30) {
      const startX = w * 0.1;
      const markerY = centerY + a + 30;
      ctx.beginPath();
      ctx.moveTo(startX, markerY);
      ctx.lineTo(startX + wavelengthPx, markerY);
      ctx.strokeStyle = "#69f0ae";
      ctx.lineWidth = 2;
      ctx.stroke();
      // End caps
      ctx.beginPath();
      ctx.moveTo(startX, markerY - 5);
      ctx.lineTo(startX, markerY + 5);
      ctx.moveTo(startX + wavelengthPx, markerY - 5);
      ctx.lineTo(startX + wavelengthPx, markerY + 5);
      ctx.stroke();
      ctx.font = "bold 12px sans-serif";
      ctx.fillStyle = "#69f0ae";
      ctx.textAlign = "center";
      ctx.fillText("\u03BB (1 wavelength)", startX + wavelengthPx / 2, markerY + 18);
    }

    // Info display
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";

    let pitchLabel = "中音";
    if (frequency < 300) pitchLabel = "低い音";
    else if (frequency > 600) pitchLabel = "高い音";

    let volLabel = "中くらい";
    if (amplitude < 0.35) volLabel = "小さい音";
    else if (amplitude > 0.7) volLabel = "大きい音";

    ctx.fillStyle = "#42a5f5";
    ctx.fillText(`${frequency} Hz (${pitchLabel})`, w / 2, 28);
    ctx.fillStyle = "#ff9800";
    ctx.fillText(`振幅: ${(amplitude * 100).toFixed(0)}% (${volLabel})`, w / 2, 52);
  }, [frequency, amplitude]);

  useEffect(() => {
    let running = true;
    const animate = () => {
      if (!running) return;
      timeRef.current += 0.02;
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
        <h2>音の波形</h2>
        <p className="algo-subtitle">Sound Waves - Pitch & Volume</p>
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="controls-bar">
        <div className="slider-group">
          <label>周波数</label>
          <input
            type="range"
            min="100"
            max="1000"
            step="10"
            value={frequency}
            onChange={(e) => setFrequency(Number(e.target.value))}
          />
          <span className="value">{frequency}Hz</span>
        </div>
        <div className="slider-group">
          <label>振幅</label>
          <input
            type="range"
            min="5"
            max="100"
            value={Math.round(amplitude * 100)}
            onChange={(e) => setAmplitude(Number(e.target.value) / 100)}
          />
          <span className="value">{(amplitude * 100).toFixed(0)}%</span>
        </div>
      </div>

      <div className="step-info">
        <p className="step-description">
          周波数を上げると音が高く（波が細かく）、振幅を上げると音が大きく（波が高く）なる
        </p>
      </div>
    </div>
  );
}

export default SoundWaveVisualizer;
