const rows = 20;
const cols = 20;
const grid = [];
let startNode = null;
let endNode = null;

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
  }
}

function setup() {
  const container = document.getElementById('grid');
  container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  container.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

  for (let y = 0; y < rows; y++) {
    grid[y] = [];
    for (let x = 0; x < cols; x++) {
      const node = new Node(x, y);

      // ★ ランダムに壁を設置（約25%の確率）
      if (Math.random() < 0.25) {
        node.isWall = true;
      }

      grid[y][x] = node;

      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.x = x;
      cell.dataset.y = y;

      if (node.isWall) {
        cell.classList.add('wall');
      }

      cell.addEventListener('click', handleCellClick);
      container.appendChild(cell);
    }
  }
}

function handleCellClick(e) {
  const x = parseInt(e.target.dataset.x);
  const y = parseInt(e.target.dataset.y);
  const node = grid[y][x];
  if (!startNode) {
    startNode = node;
    e.target.classList.add('start');
  } else if (!endNode && node !== startNode) {
    endNode = node;
    e.target.classList.add('end');
  } else if (node !== startNode && node !== endNode) {
    node.isWall = !node.isWall;
    e.target.classList.toggle('wall');
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
  while (node.previous) {
    if (node !== startNode && node !== endNode) {
      const cell = document.querySelector(`[data-x="${node.x}"][data-y="${node.y}"]`);
      cell.classList.add('path');
    }
    node = node.previous;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function astar() {
  const openSet = [];
  startNode.g = 0;
  startNode.f = heuristic(startNode, endNode);
  openSet.push(startNode);

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift();

    if (current === endNode) {
      reconstructPath(current);
      return;
    }

    const cell = document.querySelector(`[data-x="${current.x}"][data-y="${current.y}"]`);
    if (current !== startNode && current !== endNode) {
      cell.classList.add('visited');
      await sleep(25);
    }

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

  alert('道が見つかりませんでした');
}

document.getElementById('startBtn').addEventListener('click', astar);
document.getElementById('resetBtn').addEventListener('click', () => location.reload());

window.onload = setup;