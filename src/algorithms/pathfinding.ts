import { Node, Grid, PathfindingAlgorithms } from "../types";

// ヒューリスティック関数（マンハッタン距離）
export function heuristic(a: Node, b: Node): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

// 隣接ノードを取得
export function getNeighbors(
  grid: Grid,
  node: Node,
  cols: number,
  rows: number,
): Node[] {
  const neighbors: Node[] = [];
  const { x, y } = node;
  if (x > 0) neighbors.push(grid[y][x - 1]);
  if (x < cols - 1) neighbors.push(grid[y][x + 1]);
  if (y > 0) neighbors.push(grid[y - 1][x]);
  if (y < rows - 1) neighbors.push(grid[y + 1][x]);
  return neighbors;
}

// パスを再構築
export function reconstructPath(node: Node): Node[] {
  const path: Node[] = [];
  let current: Node | null = node;
  while (current?.previous) {
    path.push(current);
    current = current.previous;
  }
  return path;
}

// A* アルゴリズム
export async function astar(
  grid: Grid,
  startNode: Node,
  endNode: Node,
  cols: number,
  rows: number,
  onVisit?: (node: Node) => Promise<void>,
  onPath?: (path: Node[]) => Promise<void>,
): Promise<boolean> {
  const openSet: Node[] = [];
  startNode.g = 0;
  startNode.f = heuristic(startNode, endNode);
  openSet.push(startNode);

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift()!;

    if (current === endNode) {
      const path = reconstructPath(current);
      if (onPath) await onPath(path);
      return true;
    }

    if (onVisit) await onVisit(current);

    for (const neighbor of getNeighbors(grid, current, cols, rows)) {
      if (neighbor.isWall) continue;
      const tentativeG = current.g + 1;
      if (tentativeG < neighbor.g) {
        neighbor.previous = current;
        neighbor.g = tentativeG;
        neighbor.h = heuristic(neighbor, endNode);
        neighbor.f = neighbor.g + neighbor.h;
        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }
  return false;
}

// Dijkstra法
export async function dijkstra(
  grid: Grid,
  startNode: Node,
  endNode: Node,
  cols: number,
  rows: number,
  onVisit?: (node: Node) => Promise<void>,
  onPath?: (path: Node[]) => Promise<void>,
): Promise<boolean> {
  const openSet: Node[] = [];
  startNode.g = 0;
  openSet.push(startNode);

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.g - b.g);
    const current = openSet.shift()!;

    if (current.visited) continue;
    current.visited = true;

    if (current === endNode) {
      const path = reconstructPath(current);
      if (onPath) await onPath(path);
      return true;
    }

    if (onVisit) await onVisit(current);

    for (const neighbor of getNeighbors(grid, current, cols, rows)) {
      if (neighbor.isWall || neighbor.visited) continue;
      const tentativeG = current.g + 1;
      if (tentativeG < neighbor.g) {
        neighbor.previous = current;
        neighbor.g = tentativeG;
        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }
  return false;
}

// 幅優先探索 (BFS)
export async function bfs(
  grid: Grid,
  startNode: Node,
  endNode: Node,
  cols: number,
  rows: number,
  onVisit?: (node: Node) => Promise<void>,
  onPath?: (path: Node[]) => Promise<void>,
): Promise<boolean> {
  const queue: Node[] = [];
  startNode.visited = true;
  queue.push(startNode);

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current === endNode) {
      const path = reconstructPath(current);
      if (onPath) await onPath(path);
      return true;
    }

    if (onVisit) await onVisit(current);

    for (const neighbor of getNeighbors(grid, current, cols, rows)) {
      if (neighbor.isWall || neighbor.visited) continue;
      neighbor.visited = true;
      neighbor.previous = current;
      queue.push(neighbor);
    }
  }
  return false;
}

// 深さ優先探索 (DFS)
export async function dfs(
  grid: Grid,
  startNode: Node,
  endNode: Node,
  cols: number,
  rows: number,
  onVisit?: (node: Node) => Promise<void>,
  onPath?: (path: Node[]) => Promise<void>,
): Promise<boolean> {
  const stack: Node[] = [];
  startNode.visited = true;
  stack.push(startNode);

  while (stack.length > 0) {
    const current = stack.pop()!;

    if (current === endNode) {
      const path = reconstructPath(current);
      if (onPath) await onPath(path);
      return true;
    }

    if (onVisit) await onVisit(current);

    for (const neighbor of getNeighbors(grid, current, cols, rows)) {
      if (neighbor.isWall || neighbor.visited) continue;
      neighbor.visited = true;
      neighbor.previous = current;
      stack.push(neighbor);
    }
  }
  return false;
}

// 貪欲法 (Greedy Best-First Search)
export async function greedy(
  grid: Grid,
  startNode: Node,
  endNode: Node,
  cols: number,
  rows: number,
  onVisit?: (node: Node) => Promise<void>,
  onPath?: (path: Node[]) => Promise<void>,
): Promise<boolean> {
  const openSet: Node[] = [];
  startNode.h = heuristic(startNode, endNode);
  openSet.push(startNode);

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.h - b.h);
    const current = openSet.shift()!;

    if (current.visited) continue;
    current.visited = true;

    if (current === endNode) {
      const path = reconstructPath(current);
      if (onPath) await onPath(path);
      return true;
    }

    if (onVisit) await onVisit(current);

    for (const neighbor of getNeighbors(grid, current, cols, rows)) {
      if (neighbor.isWall || neighbor.visited) continue;
      neighbor.previous = current;
      neighbor.h = heuristic(neighbor, endNode);
      if (!openSet.includes(neighbor)) {
        openSet.push(neighbor);
      }
    }
  }
  return false;
}

export const ALGORITHMS: PathfindingAlgorithms = {
  astar: { name: "A* (A-Star)", fn: astar },
  dijkstra: { name: "Dijkstra法", fn: dijkstra },
  bfs: { name: "幅優先探索 (BFS)", fn: bfs },
  dfs: { name: "深さ優先探索 (DFS)", fn: dfs },
  greedy: { name: "貪欲法 (Greedy Best-First)", fn: greedy },
};

export { Node };
