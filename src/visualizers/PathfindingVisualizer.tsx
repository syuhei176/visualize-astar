import { useState, useRef, useEffect } from "react";
import { Node, ALGORITHMS } from "../algorithms/pathfinding";
import { Grid } from "../types";
import "./PathfindingVisualizer.css";

const ROWS = 20;
const COLS = 20;

function PathfindingVisualizer() {
  const [grid, setGrid] = useState<Grid>([]);
  const [startNode, setStartNode] = useState<Node | null>(null);
  const [endNode, setEndNode] = useState<Node | null>(null);
  const [algorithm, setAlgorithm] = useState<string>("astar");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [visitedCount, setVisitedCount] = useState<number>(0);
  const [pathLength, setPathLength] = useState<number>(0);
  const visitedNodesRef = useRef<Set<string>>(new Set());
  const pathNodesRef = useRef<Set<string>>(new Set());

  // グリッド初期化
  useEffect(() => {
    initializeGrid();
  }, []);

  const initializeGrid = () => {
    const newGrid: Grid = [];
    for (let y = 0; y < ROWS; y++) {
      newGrid[y] = [];
      for (let x = 0; x < COLS; x++) {
        const node = new Node(x, y);
        // ランダムに壁を設置（約25%の確率）
        if (Math.random() < 0.25) {
          node.isWall = true;
        }
        newGrid[y][x] = node;
      }
    }
    setGrid(newGrid);
    setStartNode(null);
    setEndNode(null);
    visitedNodesRef.current.clear();
    pathNodesRef.current.clear();
    setVisitedCount(0);
    setPathLength(0);
  };

  const handleCellClick = (x: number, y: number) => {
    if (isRunning) return;

    const node = grid[y][x];

    if (!startNode) {
      setStartNode(node);
    } else if (!endNode && node !== startNode) {
      setEndNode(node);
    } else if (node !== startNode && node !== endNode) {
      const newGrid = grid.map((row) => [...row]);
      newGrid[y][x].isWall = !newGrid[y][x].isWall;
      setGrid(newGrid);
    }
  };

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const handleVisit = async (node: Node) => {
    if (node !== startNode && node !== endNode) {
      visitedNodesRef.current.add(`${node.x},${node.y}`);
      setVisitedCount((prev) => prev + 1);
      setGrid((prev) => [...prev]); // 再レンダリング用
      await sleep(25);
    }
  };

  const handlePath = async (path: Node[]) => {
    for (const node of path.reverse()) {
      if (node !== startNode && node !== endNode) {
        pathNodesRef.current.add(`${node.x},${node.y}`);
        setGrid((prev) => [...prev]); // 再レンダリング用
        await sleep(30);
      }
    }
    setPathLength(path.length);
  };

  const runAlgorithm = async () => {
    if (!startNode || !endNode) {
      alert("開始点と終了点を設定してください");
      return;
    }

    if (isRunning) return;
    setIsRunning(true);

    // リセット
    visitedNodesRef.current.clear();
    pathNodesRef.current.clear();
    setVisitedCount(0);
    setPathLength(0);

    grid.forEach((row) => row.forEach((node) => node.reset()));

    const algorithmFn = ALGORITHMS[algorithm].fn;
    const found = await algorithmFn(
      grid,
      startNode,
      endNode,
      COLS,
      ROWS,
      handleVisit,
      handlePath,
    );

    if (!found) {
      alert("道が見つかりませんでした");
    }

    setIsRunning(false);
  };

  const clearPath = () => {
    if (isRunning) return;
    visitedNodesRef.current.clear();
    pathNodesRef.current.clear();
    setVisitedCount(0);
    setPathLength(0);
    grid.forEach((row) => row.forEach((node) => node.reset()));
    setGrid([...grid]);
  };

  const getCellClass = (node: Node): string => {
    const classes = ["cell"];
    if (node.isWall) classes.push("wall");
    if (node === startNode) classes.push("start");
    if (node === endNode) classes.push("end");
    if (visitedNodesRef.current.has(`${node.x},${node.y}`))
      classes.push("visited");
    if (pathNodesRef.current.has(`${node.x},${node.y}`)) classes.push("path");
    return classes.join(" ");
  };

  return (
    <div className="pathfinding-visualizer">
      <div className="controls">
        <label>
          アルゴリズム:
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
          >
            {Object.entries(ALGORITHMS).map(([key, { name }]) => (
              <option key={key} value={key}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <button onClick={runAlgorithm} disabled={isRunning}>
          探索開始
        </button>
        <button onClick={initializeGrid} disabled={isRunning}>
          リセット
        </button>
        <button onClick={clearPath} disabled={isRunning}>
          パスのみクリア
        </button>
      </div>

      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
        }}
      >
        {grid.map((row, y) =>
          row.map((node, x) => (
            <div
              key={`${x}-${y}`}
              className={getCellClass(node)}
              onClick={() => handleCellClick(x, y)}
            />
          )),
        )}
      </div>

      <div className="info">
        <p>クリックして開始点、終了点、壁を設定してください</p>
        <p className="stats">
          訪問ノード数: {visitedCount} | パスの長さ: {pathLength}
        </p>
      </div>
    </div>
  );
}

export default PathfindingVisualizer;
