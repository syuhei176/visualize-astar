// 迷路生成アルゴリズム

export type MazeCell = "wall" | "passage" | "start" | "end";
export type MazeGrid = MazeCell[][];

type OnCellChange = (x: number, y: number, cell: MazeCell) => Promise<void>;

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 全壁のグリッドを作成
export function createWallGrid(rows: number, cols: number): MazeGrid {
  const grid: MazeGrid = [];
  for (let y = 0; y < rows; y++) {
    grid[y] = [];
    for (let x = 0; x < cols; x++) {
      grid[y][x] = "wall";
    }
  }
  return grid;
}

// 再帰バックトラッキング法
export async function recursiveBacktracking(
  grid: MazeGrid,
  rows: number,
  cols: number,
  onCellChange?: OnCellChange,
): Promise<MazeGrid> {
  const startX = 1;
  const startY = 1;
  grid[startY][startX] = "passage";
  if (onCellChange) await onCellChange(startX, startY, "passage");

  const directions = [
    [0, -2],
    [2, 0],
    [0, 2],
    [-2, 0],
  ];

  async function carve(x: number, y: number) {
    const shuffled = shuffle(directions);
    for (const [dx, dy] of shuffled) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx > 0 && nx < cols - 1 && ny > 0 && ny < rows - 1 && grid[ny][nx] === "wall") {
        // 壁を通路にする
        const wallX = x + dx / 2;
        const wallY = y + dy / 2;
        grid[wallY][wallX] = "passage";
        grid[ny][nx] = "passage";
        if (onCellChange) {
          await onCellChange(wallX, wallY, "passage");
          await onCellChange(nx, ny, "passage");
        }
        await carve(nx, ny);
      }
    }
  }

  await carve(startX, startY);
  return grid;
}

// Primのアルゴリズム
export async function primMaze(
  grid: MazeGrid,
  rows: number,
  cols: number,
  onCellChange?: OnCellChange,
): Promise<MazeGrid> {
  const startX = 1;
  const startY = 1;
  grid[startY][startX] = "passage";
  if (onCellChange) await onCellChange(startX, startY, "passage");

  const walls: [number, number, number, number][] = [];

  function addWalls(x: number, y: number) {
    const directions = [
      [0, -2],
      [2, 0],
      [0, 2],
      [-2, 0],
    ];
    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx > 0 && nx < cols - 1 && ny > 0 && ny < rows - 1 && grid[ny][nx] === "wall") {
        walls.push([x + dx / 2, y + dy / 2, nx, ny]);
      }
    }
  }

  addWalls(startX, startY);

  while (walls.length > 0) {
    const idx = Math.floor(Math.random() * walls.length);
    const [wallX, wallY, cellX, cellY] = walls[idx];
    walls.splice(idx, 1);

    if (grid[cellY][cellX] === "wall") {
      grid[wallY][wallX] = "passage";
      grid[cellY][cellX] = "passage";
      if (onCellChange) {
        await onCellChange(wallX, wallY, "passage");
        await onCellChange(cellX, cellY, "passage");
      }
      addWalls(cellX, cellY);
    }
  }

  return grid;
}

// 迷路探索用 BFS
export async function solveBFS(
  grid: MazeGrid,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  onVisit?: (x: number, y: number) => Promise<void>,
  onPath?: (path: [number, number][]) => Promise<void>,
): Promise<boolean> {
  const rows = grid.length;
  const cols = grid[0].length;
  const visited = new Set<string>();
  const parent = new Map<string, string>();
  const queue: [number, number][] = [[startX, startY]];
  visited.add(`${startX},${startY}`);

  const directions = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
  ];

  while (queue.length > 0) {
    const [x, y] = queue.shift()!;

    if (x === endX && y === endY) {
      const path: [number, number][] = [];
      let key = `${endX},${endY}`;
      while (key) {
        const [px, py] = key.split(",").map(Number);
        path.push([px, py]);
        key = parent.get(key)!;
      }
      path.reverse();
      if (onPath) await onPath(path);
      return true;
    }

    if (onVisit && !(x === startX && y === startY)) {
      await onVisit(x, y);
    }

    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;
      const nKey = `${nx},${ny}`;
      if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && grid[ny][nx] !== "wall" && !visited.has(nKey)) {
        visited.add(nKey);
        parent.set(nKey, `${x},${y}`);
        queue.push([nx, ny]);
      }
    }
  }
  return false;
}

// 迷路探索用 DFS
export async function solveDFS(
  grid: MazeGrid,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  onVisit?: (x: number, y: number) => Promise<void>,
  onPath?: (path: [number, number][]) => Promise<void>,
): Promise<boolean> {
  const rows = grid.length;
  const cols = grid[0].length;
  const visited = new Set<string>();
  const parent = new Map<string, string>();
  const stack: [number, number][] = [[startX, startY]];
  visited.add(`${startX},${startY}`);

  const directions = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
  ];

  while (stack.length > 0) {
    const [x, y] = stack.pop()!;

    if (x === endX && y === endY) {
      const path: [number, number][] = [];
      let key = `${endX},${endY}`;
      while (key) {
        const [px, py] = key.split(",").map(Number);
        path.push([px, py]);
        key = parent.get(key)!;
      }
      path.reverse();
      if (onPath) await onPath(path);
      return true;
    }

    if (onVisit && !(x === startX && y === startY)) {
      await onVisit(x, y);
    }

    for (const [dx, dy] of shuffle(directions)) {
      const nx = x + dx;
      const ny = y + dy;
      const nKey = `${nx},${ny}`;
      if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && grid[ny][nx] !== "wall" && !visited.has(nKey)) {
        visited.add(nKey);
        parent.set(nKey, `${x},${y}`);
        stack.push([nx, ny]);
      }
    }
  }
  return false;
}

// 迷路探索用 A*
export async function solveAStar(
  grid: MazeGrid,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  onVisit?: (x: number, y: number) => Promise<void>,
  onPath?: (path: [number, number][]) => Promise<void>,
): Promise<boolean> {
  const rows = grid.length;
  const cols = grid[0].length;
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();
  const parent = new Map<string, string>();
  const openSet: [number, number][] = [[startX, startY]];
  const closedSet = new Set<string>();

  const h = (x: number, y: number) => Math.abs(x - endX) + Math.abs(y - endY);
  const startKey = `${startX},${startY}`;
  gScore.set(startKey, 0);
  fScore.set(startKey, h(startX, startY));

  const directions = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
  ];

  while (openSet.length > 0) {
    openSet.sort((a, b) => (fScore.get(`${a[0]},${a[1]}`) ?? Infinity) - (fScore.get(`${b[0]},${b[1]}`) ?? Infinity));
    const [x, y] = openSet.shift()!;
    const key = `${x},${y}`;

    if (x === endX && y === endY) {
      const path: [number, number][] = [];
      let k: string | undefined = `${endX},${endY}`;
      while (k) {
        const [px, py] = k.split(",").map(Number);
        path.push([px, py]);
        k = parent.get(k);
      }
      path.reverse();
      if (onPath) await onPath(path);
      return true;
    }

    closedSet.add(key);
    if (onVisit && !(x === startX && y === startY)) {
      await onVisit(x, y);
    }

    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;
      const nKey = `${nx},${ny}`;
      if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && grid[ny][nx] !== "wall" && !closedSet.has(nKey)) {
        const tentativeG = (gScore.get(key) ?? Infinity) + 1;
        if (tentativeG < (gScore.get(nKey) ?? Infinity)) {
          parent.set(nKey, key);
          gScore.set(nKey, tentativeG);
          fScore.set(nKey, tentativeG + h(nx, ny));
          if (!openSet.some(([ox, oy]) => ox === nx && oy === ny)) {
            openSet.push([nx, ny]);
          }
        }
      }
    }
  }
  return false;
}

export type MazeGenerationAlgorithm = (
  grid: MazeGrid,
  rows: number,
  cols: number,
  onCellChange?: OnCellChange,
) => Promise<MazeGrid>;

export type MazeSolveAlgorithm = (
  grid: MazeGrid,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  onVisit?: (x: number, y: number) => Promise<void>,
  onPath?: (path: [number, number][]) => Promise<void>,
) => Promise<boolean>;

export const MAZE_GENERATORS: Record<string, { name: string; fn: MazeGenerationAlgorithm }> = {
  recursive: { name: "再帰バックトラッキング", fn: recursiveBacktracking },
  prim: { name: "Primのアルゴリズム", fn: primMaze },
};

export const MAZE_SOLVERS: Record<string, { name: string; fn: MazeSolveAlgorithm }> = {
  bfs: { name: "幅優先探索 (BFS)", fn: solveBFS },
  dfs: { name: "深さ優先探索 (DFS)", fn: solveDFS },
  astar: { name: "A* (A-Star)", fn: solveAStar },
};
