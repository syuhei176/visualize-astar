const rows = 20;
const cols = 20;
const grid = [];
let startNode = null;
let endNode = null;
let isRunning = false;
let visitedCount = 0;
let pathLength = 0;

// ノード作成
class Node {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.isWall = false;
    this.g = Infinity;
    this.h = 0;
    this.f = Infinity;
    this.previous = null;
    this.visited = false;
  }

  reset() {
    this.g = Infinity;
    this.h = 0;
    this.f = Infinity;
    this.previous = null;
    this.visited = false;
  }
}

function setup() {
  const container = document.getElementById("grid");
  container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  container.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

  for (let y = 0; y < rows; y++) {
    grid[y] = [];
    for (let x = 0; x < cols; x++) {
      const node = new Node(x, y);

      // ランダムに壁を設置（約25%の確率）
      if (Math.random() < 0.25) {
        node.isWall = true;
      }

      grid[y][x] = node;

      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.x = x;
      cell.dataset.y = y;

      if (node.isWall) {
        cell.classList.add("wall");
      }

      cell.addEventListener("click", handleCellClick);
      container.appendChild(cell);
    }
  }
}

function handleCellClick(e) {
  if (isRunning) return;

  const x = parseInt(e.target.dataset.x);
  const y = parseInt(e.target.dataset.y);
  const node = grid[y][x];

  if (!startNode) {
    startNode = node;
    e.target.classList.add("start");
  } else if (!endNode && node !== startNode) {
    endNode = node;
    e.target.classList.add("end");
  } else if (node !== startNode && node !== endNode) {
    node.isWall = !node.isWall;
    e.target.classList.toggle("wall");
  }
}

function heuristic(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function getNeighbors(node) {
  const neighbors = [];
  const { x, y } = node;
  if (x > 0) neighbors.push(grid[y][x - 1]);
  if (x < cols - 1) neighbors.push(grid[y][x + 1]);
  if (y > 0) neighbors.push(grid[y - 1][x]);
  if (y < rows - 1) neighbors.push(grid[y + 1][x]);
  return neighbors;
}

function reconstructPath(node) {
  const path = [];
  let current = node;
  while (current.previous) {
    if (current !== startNode && current !== endNode) {
      path.push(current);
    }
    current = current.previous;
  }
  return path;
}

async function visualizePath(path) {
  for (const node of path.reverse()) {
    const cell = document.querySelector(
      `[data-x="${node.x}"][data-y="${node.y}"]`,
    );
    cell.classList.add("path");
    await sleep(30);
  }
  pathLength = path.length;
  updateStats();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function markVisited(node) {
  if (node !== startNode && node !== endNode) {
    const cell = document.querySelector(
      `[data-x="${node.x}"][data-y="${node.y}"]`,
    );
    cell.classList.add("visited");
    visitedCount++;
    await sleep(25);
  }
}

// A* アルゴリズム
async function astar() {
  const openSet = [];
  startNode.g = 0;
  startNode.f = heuristic(startNode, endNode);
  openSet.push(startNode);

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift();

    if (current === endNode) {
      const path = reconstructPath(current);
      await visualizePath(path);
      return true;
    }

    await markVisited(current);

    for (const neighbor of getNeighbors(current)) {
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
async function dijkstra() {
  const openSet = [];
  startNode.g = 0;
  openSet.push(startNode);

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.g - b.g);
    const current = openSet.shift();

    if (current.visited) continue;
    current.visited = true;

    if (current === endNode) {
      const path = reconstructPath(current);
      await visualizePath(path);
      return true;
    }

    await markVisited(current);

    for (const neighbor of getNeighbors(current)) {
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
async function bfs() {
  const queue = [];
  startNode.visited = true;
  queue.push(startNode);

  while (queue.length > 0) {
    const current = queue.shift();

    if (current === endNode) {
      const path = reconstructPath(current);
      await visualizePath(path);
      return true;
    }

    await markVisited(current);

    for (const neighbor of getNeighbors(current)) {
      if (neighbor.isWall || neighbor.visited) continue;
      neighbor.visited = true;
      neighbor.previous = current;
      queue.push(neighbor);
    }
  }
  return false;
}

// 深さ優先探索 (DFS)
async function dfs() {
  const stack = [];
  startNode.visited = true;
  stack.push(startNode);

  while (stack.length > 0) {
    const current = stack.pop();

    if (current === endNode) {
      const path = reconstructPath(current);
      await visualizePath(path);
      return true;
    }

    await markVisited(current);

    for (const neighbor of getNeighbors(current)) {
      if (neighbor.isWall || neighbor.visited) continue;
      neighbor.visited = true;
      neighbor.previous = current;
      stack.push(neighbor);
    }
  }
  return false;
}

// 貪欲法 (Greedy Best-First Search)
async function greedy() {
  const openSet = [];
  startNode.h = heuristic(startNode, endNode);
  openSet.push(startNode);

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.h - b.h);
    const current = openSet.shift();

    if (current.visited) continue;
    current.visited = true;

    if (current === endNode) {
      const path = reconstructPath(current);
      await visualizePath(path);
      return true;
    }

    await markVisited(current);

    for (const neighbor of getNeighbors(current)) {
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

function resetNodes() {
  visitedCount = 0;
  pathLength = 0;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      grid[y][x].reset();
    }
  }
}

function clearVisualization() {
  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell) => {
    cell.classList.remove("visited", "path");
  });
}

function updateStats() {
  const stats = document.getElementById("stats");
  stats.textContent = `訪問ノード数: ${visitedCount} | パスの長さ: ${pathLength}`;
}

async function runAlgorithm() {
  if (!startNode || !endNode) {
    alert("開始点と終了点を設定してください");
    return;
  }

  if (isRunning) return;
  isRunning = true;

  clearVisualization();
  resetNodes();
  updateStats();

  const algorithm = document.getElementById("algorithm").value;
  let found = false;

  switch (algorithm) {
    case "astar":
      found = await astar();
      break;
    case "dijkstra":
      found = await dijkstra();
      break;
    case "bfs":
      found = await bfs();
      break;
    case "dfs":
      found = await dfs();
      break;
    case "greedy":
      found = await greedy();
      break;
  }

  if (!found) {
    alert("道が見つかりませんでした");
  }

  isRunning = false;
}

function clearPath() {
  if (isRunning) return;
  clearVisualization();
  resetNodes();
  visitedCount = 0;
  pathLength = 0;
  updateStats();
}

document.getElementById("startBtn").addEventListener("click", runAlgorithm);
document
  .getElementById("resetBtn")
  .addEventListener("click", () => location.reload());
document.getElementById("clearPathBtn").addEventListener("click", clearPath);

window.onload = setup;
