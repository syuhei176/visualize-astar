import { useState, useRef, useCallback } from "react";
import {
  type MazeGrid,
  createWallGrid,
  MAZE_GENERATORS,
  MAZE_SOLVERS,
} from "../algorithms/maze";
import "./MazeVisualizer.css";

// 奇数にすることで壁と通路が交互に並ぶ
const SIZE = 21;
const START_X = 1;
const START_Y = 1;
const END_X = SIZE - 2;
const END_Y = SIZE - 2;

function MazeVisualizer() {
  const [grid, setGrid] = useState<MazeGrid>(() => createWallGrid(SIZE, SIZE));
  const [isRunning, setIsRunning] = useState(false);
  const [generatorKey, setGeneratorKey] = useState("recursive");
  const [solverKey, setSolverKey] = useState("bfs");
  const [visitedCount, setVisitedCount] = useState(0);
  const [pathLength, setPathLength] = useState(0);
  const [mazeGenerated, setMazeGenerated] = useState(false);
  const visitedRef = useRef<Set<string>>(new Set());
  const pathRef = useRef<Set<string>>(new Set());

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const generateMaze = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    setMazeGenerated(false);
    visitedRef.current.clear();
    pathRef.current.clear();
    setVisitedCount(0);
    setPathLength(0);

    const newGrid = createWallGrid(SIZE, SIZE);
    setGrid([...newGrid.map((row) => [...row])]);

    const generator = MAZE_GENERATORS[generatorKey].fn;
    await generator(newGrid, SIZE, SIZE, async (x, y, cell) => {
      newGrid[y][x] = cell;
      setGrid([...newGrid.map((row) => [...row])]);
      await sleep(15);
    });

    newGrid[START_Y][START_X] = "start";
    newGrid[END_Y][END_X] = "end";
    setGrid([...newGrid.map((row) => [...row])]);
    setMazeGenerated(true);
    setIsRunning(false);
  }, [isRunning, generatorKey]);

  const solveMaze = useCallback(async () => {
    if (isRunning || !mazeGenerated) return;
    setIsRunning(true);
    visitedRef.current.clear();
    pathRef.current.clear();
    setVisitedCount(0);
    setPathLength(0);

    // グリッドのコピーを作成（visited/pathをクリア）
    const currentGrid = grid.map((row) => [...row]);
    setGrid([...currentGrid.map((row) => [...row])]);

    const solver = MAZE_SOLVERS[solverKey].fn;
    const found = await solver(
      currentGrid,
      START_X,
      START_Y,
      END_X,
      END_Y,
      async (x, y) => {
        visitedRef.current.add(`${x},${y}`);
        setVisitedCount((prev) => prev + 1);
        setGrid([...currentGrid.map((row) => [...row])]);
        await sleep(20);
      },
      async (path) => {
        for (const [x, y] of path) {
          if (!(x === START_X && y === START_Y) && !(x === END_X && y === END_Y)) {
            pathRef.current.add(`${x},${y}`);
            setGrid([...currentGrid.map((row) => [...row])]);
            await sleep(30);
          }
        }
        setPathLength(path.length);
      },
    );

    if (!found) {
      setPathLength(-1);
    }

    setIsRunning(false);
  }, [isRunning, mazeGenerated, grid, solverKey]);

  const reset = useCallback(() => {
    if (isRunning) return;
    setGrid(createWallGrid(SIZE, SIZE));
    setMazeGenerated(false);
    visitedRef.current.clear();
    pathRef.current.clear();
    setVisitedCount(0);
    setPathLength(0);
  }, [isRunning]);

  const getCellClass = (x: number, y: number, cell: string): string => {
    const classes = ["maze-cell"];
    const key = `${x},${y}`;
    if (pathRef.current.has(key)) {
      classes.push("path");
    } else if (visitedRef.current.has(key)) {
      classes.push("visited");
    } else if (cell === "start") {
      classes.push("start");
    } else if (cell === "end") {
      classes.push("end");
    } else if (cell === "wall") {
      classes.push("wall");
    } else {
      classes.push("passage");
    }
    return classes.join(" ");
  };

  return (
    <div className="maze-visualizer">
      <div className="algo-title">
        <h2>迷路生成と探索</h2>
        <p className="algo-subtitle">Maze Generation &amp; Solving</p>
      </div>

      <div className="grid-wrapper">
        <div
          className="maze-grid"
          style={{
            gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${SIZE}, 1fr)`,
          }}
        >
          {grid.map((row, y) =>
            row.map((cell, x) => (
              <div key={`${x}-${y}`} className={getCellClass(x, y, cell)} />
            )),
          )}
        </div>
      </div>

      <div className="bottom-info">
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-value">{visitedCount}</span>
            <span className="stat-label">訪問</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{pathLength === -1 ? "—" : pathLength}</span>
            <span className="stat-label">パス長</span>
          </div>
        </div>
        <p className="info-text">
          {!mazeGenerated ? "「生成」で迷路を作成" : "「探索」で経路を探索"}
        </p>
      </div>

      <div className="controls-bar">
        <select
          value={generatorKey}
          onChange={(e) => setGeneratorKey(e.target.value)}
          disabled={isRunning}
        >
          {Object.entries(MAZE_GENERATORS).map(([key, { name }]) => (
            <option key={key} value={key}>
              {name}
            </option>
          ))}
        </select>
        <select
          value={solverKey}
          onChange={(e) => setSolverKey(e.target.value)}
          disabled={isRunning}
        >
          {Object.entries(MAZE_SOLVERS).map(([key, { name }]) => (
            <option key={key} value={key}>
              {name}
            </option>
          ))}
        </select>
        <button className="btn-generate" onClick={generateMaze} disabled={isRunning}>
          生成
        </button>
        <button className="btn-solve" onClick={solveMaze} disabled={isRunning || !mazeGenerated}>
          探索
        </button>
        <button className="btn-reset" onClick={reset} disabled={isRunning}>
          Reset
        </button>
      </div>
    </div>
  );
}

export default MazeVisualizer;
