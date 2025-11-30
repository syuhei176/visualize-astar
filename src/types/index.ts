// 経路探索用の型定義
export class Node {
  x: number
  y: number
  isWall: boolean
  g: number
  h: number
  f: number
  previous: Node | null
  visited: boolean

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
    this.isWall = false
    this.g = Infinity
    this.h = 0
    this.f = Infinity
    this.previous = null
    this.visited = false
  }

  reset(): void {
    this.g = Infinity
    this.h = 0
    this.f = Infinity
    this.previous = null
    this.visited = false
  }
}

export type Grid = Node[][]

export type PathfindingAlgorithm = (
  grid: Grid,
  startNode: Node,
  endNode: Node,
  cols: number,
  rows: number,
  onVisit?: (node: Node) => Promise<void>,
  onPath?: (path: Node[]) => Promise<void>
) => Promise<boolean>

export interface AlgorithmInfo {
  name: string
  fn: PathfindingAlgorithm
}

export interface PathfindingAlgorithms {
  [key: string]: AlgorithmInfo
}

// ソート用の型定義
export type SortingAlgorithm = (
  array: number[],
  onSwap?: (array: number[], i: number, j: number) => Promise<void>,
  onCompare?: (i: number, j: number) => Promise<void>
) => Promise<number[]>

export interface SortingAlgorithmInfo {
  name: string
  fn: SortingAlgorithm
}

export interface SortingAlgorithms {
  [key: string]: SortingAlgorithmInfo
}

// カテゴリ用の型定義
export interface Category {
  id: string
  name: string
  component: React.ComponentType
}
