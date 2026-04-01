import { useState } from "react";
import "./MathVisualizer.css";

const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];

function gcd(a: number, b: number): number {
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

function modPow(base: number, exp: number, mod: number): number {
  let result = 1;
  base = base % mod;
  while (exp > 0) {
    if (exp % 2 === 1) {
      result = (result * base) % mod;
    }
    exp = Math.floor(exp / 2);
    base = (base * base) % mod;
  }
  return result;
}

function findE(phi: number): number {
  for (let e = 3; e < phi; e += 2) {
    if (gcd(e, phi) === 1) return e;
  }
  return 3;
}

function findD(e: number, phi: number): number {
  for (let d = 2; d < phi * 10; d++) {
    if ((d * e) % phi === 1) return d;
  }
  return 0;
}

interface RsaState {
  step: number;
  p: number;
  q: number;
  n: number;
  phi: number;
  e: number;
  d: number;
  message: number;
  encrypted: number;
  decrypted: number;
}

function RsaVisualizer() {
  const [state, setState] = useState<RsaState>({
    step: 0,
    p: 11,
    q: 13,
    n: 0,
    phi: 0,
    e: 0,
    d: 0,
    message: 7,
    encrypted: 0,
    decrypted: 0,
  });

  const [isAnimating, setIsAnimating] = useState(false);

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const runDemo = async () => {
    if (isAnimating) return;
    setIsAnimating(true);

    const p = state.p;
    const q = state.q;

    // Step 1: Choose primes
    setState((s) => ({ ...s, step: 1 }));
    await sleep(1200);

    // Step 2: Calculate n
    const n = p * q;
    setState((s) => ({ ...s, step: 2, n }));
    await sleep(1200);

    // Step 3: Calculate phi
    const phi = (p - 1) * (q - 1);
    setState((s) => ({ ...s, step: 3, phi }));
    await sleep(1200);

    // Step 4: Choose e
    const e = findE(phi);
    setState((s) => ({ ...s, step: 4, e }));
    await sleep(1200);

    // Step 5: Calculate d
    const d = findD(e, phi);
    setState((s) => ({ ...s, step: 5, d }));
    await sleep(1200);

    // Step 6: Encrypt
    const m = state.message;
    const encrypted = modPow(m, e, n);
    setState((s) => ({ ...s, step: 6, encrypted }));
    await sleep(1500);

    // Step 7: Decrypt
    const decrypted = modPow(encrypted, d, n);
    setState((s) => ({ ...s, step: 7, decrypted }));

    setIsAnimating(false);
  };

  const reset = () => {
    setState((s) => ({
      ...s,
      step: 0,
      n: 0,
      phi: 0,
      e: 0,
      d: 0,
      encrypted: 0,
      decrypted: 0,
    }));
  };

  const stepClass = (n: number) => {
    if (state.step === n) return "rsa-step active";
    if (state.step > n) return "rsa-step completed";
    return "rsa-step";
  };

  return (
    <div className="math-visualizer">
      <div className="algo-title">
        <h2>RSA暗号</h2>
        <p className="algo-subtitle">RSA Encryption</p>
      </div>

      <div className="step-info">
        <p className="step-description">
          {state.step === 0 && "Startを押してRSA暗号の仕組みを見る"}
          {state.step === 1 && "Step 1: 2つの素数 p, q を選ぶ"}
          {state.step === 2 && "Step 2: n = p × q を計算"}
          {state.step === 3 && "Step 3: φ(n) = (p-1)(q-1) を計算"}
          {state.step === 4 && "Step 4: φ(n)と互いに素な e を選ぶ"}
          {state.step === 5 && "Step 5: d × e ≡ 1 (mod φ) となる d を求める"}
          {state.step === 6 && "Step 6: 暗号化 c = m^e mod n"}
          {state.step === 7 && "Step 7: 復号 m = c^d mod n → 元のメッセージ!"}
        </p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        <div className="rsa-flow">
          <div className={stepClass(1)}>
            <h3>素数の選択</h3>
            <div className="rsa-value">
              p = {state.p}, q = {state.q}
            </div>
          </div>

          <div className={stepClass(2)}>
            <h3>公開鍵の一部: n = p × q</h3>
            <div className="rsa-value">
              {state.step >= 2
                ? `n = ${state.p} × ${state.q} = ${state.n}`
                : "n = ?"}
            </div>
          </div>

          <div className={stepClass(3)}>
            <h3>オイラーのφ関数: φ(n) = (p-1)(q-1)</h3>
            <div className="rsa-value">
              {state.step >= 3
                ? `φ = ${state.p - 1} × ${state.q - 1} = ${state.phi}`
                : "φ = ?"}
            </div>
          </div>

          <div className={stepClass(4)}>
            <h3>公開指数 e (gcd(e, φ) = 1)</h3>
            <div className="rsa-value">
              {state.step >= 4 ? `e = ${state.e}` : "e = ?"}
            </div>
            {state.step >= 4 && (
              <div className="rsa-detail">
                公開鍵: (e={state.e}, n={state.n})
              </div>
            )}
          </div>

          <div className={stepClass(5)}>
            <h3>秘密指数 d (d × e ≡ 1 mod φ)</h3>
            <div className="rsa-value">
              {state.step >= 5
                ? `d = ${state.d}`
                : "d = ?"}
            </div>
            {state.step >= 5 && (
              <div className="rsa-detail">
                秘密鍵: (d={state.d}, n={state.n}) | 検証: {state.d}×{state.e} = {state.d * state.e} ≡ {(state.d * state.e) % state.phi} (mod {state.phi})
              </div>
            )}
          </div>

          <div className={stepClass(6)}>
            <h3>暗号化: c = m^e mod n</h3>
            <div className="rsa-value">
              {state.step >= 6
                ? `${state.message}^${state.e} mod ${state.n} = ${state.encrypted}`
                : `m = ${state.message} → c = ?`}
            </div>
          </div>

          <div className={stepClass(7)}>
            <h3>復号: m = c^d mod n</h3>
            <div className="rsa-value">
              {state.step >= 7
                ? `${state.encrypted}^${state.d} mod ${state.n} = ${state.decrypted}`
                : "m = ?"}
            </div>
            {state.step >= 7 && (
              <div className="rsa-detail" style={{ color: "#69f0ae", fontWeight: 700 }}>
                復号成功! {state.decrypted} = 元のメッセージ {state.message}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="controls-bar">
        <div className="slider-group">
          <label>p</label>
          <select
            value={state.p}
            onChange={(e) =>
              setState((s) => ({ ...s, p: Number(e.target.value) }))
            }
            disabled={isAnimating}
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 6,
              padding: "4px 8px",
            }}
          >
            {PRIMES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className="slider-group">
          <label>q</label>
          <select
            value={state.q}
            onChange={(e) =>
              setState((s) => ({ ...s, q: Number(e.target.value) }))
            }
            disabled={isAnimating}
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 6,
              padding: "4px 8px",
            }}
          >
            {PRIMES.filter((p) => p !== state.p).map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
        </div>
        <div className="slider-group">
          <label>m</label>
          <input
            type="range"
            min="2"
            max={state.p * state.q > 0 ? Math.min(state.p * state.q - 1, 50) : 50}
            value={state.message}
            onChange={(e) =>
              setState((s) => ({ ...s, message: Number(e.target.value) }))
            }
            disabled={isAnimating}
          />
          <span className="value">{state.message}</span>
        </div>
        <button className="btn-step" onClick={runDemo} disabled={isAnimating}>
          Start
        </button>
        <button className="btn-reset" onClick={reset} disabled={isAnimating}>
          Reset
        </button>
      </div>
    </div>
  );
}

export default RsaVisualizer;
