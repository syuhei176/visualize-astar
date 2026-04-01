import { SortingAlgorithms, OnStepCallback, HighlightRole } from "../types";

function rangeHighlights(
  low: number,
  high: number,
  role: HighlightRole,
): Map<number, HighlightRole> {
  const map = new Map<number, HighlightRole>();
  for (let i = low; i <= high; i++) map.set(i, role);
  return map;
}

// バブルソート
export async function bubbleSort(
  array: number[],
  onSwap?: (array: number[], i: number, j: number) => Promise<void>,
  onCompare?: (i: number, j: number) => Promise<void>,
  onSorted?: (indices: number[]) => void,
  onStep?: OnStepCallback,
): Promise<number[]> {
  const arr = [...array];
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    if (onStep)
      await onStep({
        description: `パス ${i + 1}/${n - 1}: 隣接する要素を比較・交換`,
        highlights: rangeHighlights(0, n - 1 - i, "range"),
      });

    for (let j = 0; j < n - i - 1; j++) {
      if (onCompare) await onCompare(j, j + 1);

      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        if (onSwap) await onSwap(arr, j, j + 1);
      }
    }
    if (onSorted) onSorted([n - 1 - i]);
  }
  if (onSorted) onSorted([0]);

  return arr;
}

// クイックソート
export async function quickSort(
  array: number[],
  onSwap?: (array: number[], i: number, j: number) => Promise<void>,
  onCompare?: (i: number, j: number) => Promise<void>,
  _onSorted?: (indices: number[]) => void,
  onStep?: OnStepCallback,
): Promise<number[]> {
  const arr = [...array];

  async function partition(low: number, high: number): Promise<number> {
    const pivot = arr[high];

    if (onStep) {
      const highlights = rangeHighlights(low, high, "range");
      highlights.set(high, "pivot");
      await onStep({
        description: `ピボット選択: ${pivot} (位置 ${high})`,
        highlights,
      });
    }

    let i = low - 1;

    for (let j = low; j < high; j++) {
      if (onCompare) await onCompare(j, high);

      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        if (onSwap) await onSwap(arr, i, j);
      }
    }

    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    if (onSwap) await onSwap(arr, i + 1, high);

    if (onStep) {
      const highlights = new Map<number, HighlightRole>();
      highlights.set(i + 1, "pivot");
      await onStep({
        description: `ピボット ${pivot} を位置 ${i + 1} に確定`,
        highlights,
      });
    }

    return i + 1;
  }

  async function quickSortHelper(low: number, high: number): Promise<void> {
    if (low < high) {
      if (onStep) {
        await onStep({
          description: `範囲 [${low}..${high}] をソート中`,
          highlights: rangeHighlights(low, high, "range"),
        });
      }
      const pi = await partition(low, high);
      await quickSortHelper(low, pi - 1);
      await quickSortHelper(pi + 1, high);
    }
  }

  await quickSortHelper(0, arr.length - 1);
  return arr;
}

// マージソート
export async function mergeSort(
  array: number[],
  onSwap?: (array: number[], i: number, j: number) => Promise<void>,
  onCompare?: (i: number, j: number) => Promise<void>,
  _onSorted?: (indices: number[]) => void,
  onStep?: OnStepCallback,
): Promise<number[]> {
  const arr = [...array];

  async function merge(
    left: number,
    mid: number,
    right: number,
  ): Promise<void> {
    if (onStep) {
      await onStep({
        description: `マージ中: 範囲 [${left}..${mid}] と [${mid + 1}..${right}] を統合`,
        highlights: rangeHighlights(left, right, "merged"),
      });
    }

    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);

    let i = 0,
      j = 0,
      k = left;

    while (i < leftArr.length && j < rightArr.length) {
      if (onCompare) await onCompare(left + i, mid + 1 + j);

      if (leftArr[i] <= rightArr[j]) {
        arr[k] = leftArr[i];
        i++;
      } else {
        arr[k] = rightArr[j];
        j++;
      }
      if (onSwap) await onSwap(arr, k, k);
      k++;
    }

    while (i < leftArr.length) {
      arr[k] = leftArr[i];
      if (onSwap) await onSwap(arr, k, k);
      i++;
      k++;
    }

    while (j < rightArr.length) {
      arr[k] = rightArr[j];
      if (onSwap) await onSwap(arr, k, k);
      j++;
      k++;
    }
  }

  async function mergeSortHelper(left: number, right: number): Promise<void> {
    if (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (onStep) {
        await onStep({
          description: `分割: 範囲 [${left}..${right}] を [${left}..${mid}] と [${mid + 1}..${right}] に分割`,
          highlights: rangeHighlights(left, right, "range"),
        });
      }
      await mergeSortHelper(left, mid);
      await mergeSortHelper(mid + 1, right);
      await merge(left, mid, right);
    }
  }

  await mergeSortHelper(0, arr.length - 1);
  return arr;
}

// 挿入ソート
export async function insertionSort(
  array: number[],
  onSwap?: (array: number[], i: number, j: number) => Promise<void>,
  onCompare?: (i: number, j: number) => Promise<void>,
  _onSorted?: (indices: number[]) => void,
  onStep?: OnStepCallback,
): Promise<number[]> {
  const arr = [...array];
  const n = arr.length;

  for (let i = 1; i < n; i++) {
    const key = arr[i];

    if (onStep) {
      const highlights = new Map<number, HighlightRole>();
      highlights.set(i, "key");
      await onStep({
        description: `キー ${key} (位置 ${i}) の挿入位置を探索中`,
        highlights,
      });
    }

    let j = i - 1;

    while (j >= 0) {
      if (onCompare) await onCompare(j, i);

      if (arr[j] > key) {
        arr[j + 1] = arr[j];
        if (onSwap) await onSwap(arr, j + 1, j);
        j--;
      } else {
        break;
      }
    }
    arr[j + 1] = key;
    if (onSwap) await onSwap(arr, j + 1, j + 1);
  }

  return arr;
}

// 選択ソート
export async function selectionSort(
  array: number[],
  onSwap?: (array: number[], i: number, j: number) => Promise<void>,
  onCompare?: (i: number, j: number) => Promise<void>,
  _onSorted?: (indices: number[]) => void,
  onStep?: OnStepCallback,
): Promise<number[]> {
  const arr = [...array];
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    if (onStep) {
      const highlights = rangeHighlights(i, n - 1, "range");
      highlights.set(i, "minimum");
      await onStep({
        description: `範囲 [${i}..${n - 1}] から最小値を探索中`,
        highlights,
      });
    }

    for (let j = i + 1; j < n; j++) {
      if (onCompare) await onCompare(j, minIdx);

      if (arr[j] < arr[minIdx]) {
        minIdx = j;
        if (onStep) {
          const highlights = rangeHighlights(i, n - 1, "range");
          highlights.set(minIdx, "minimum");
          await onStep({
            description: `新しい最小値: ${arr[minIdx]} (位置 ${minIdx})`,
            highlights,
          });
        }
      }
    }

    if (minIdx !== i) {
      if (onStep) {
        const highlights = new Map<number, HighlightRole>();
        highlights.set(i, "range");
        highlights.set(minIdx, "minimum");
        await onStep({
          description: `最小値 ${arr[minIdx]} を位置 ${i} に交換`,
          highlights,
        });
      }
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      if (onSwap) await onSwap(arr, i, minIdx);
    }
  }

  return arr;
}

// ヒープソート
export async function heapSort(
  array: number[],
  onSwap?: (array: number[], i: number, j: number) => Promise<void>,
  onCompare?: (i: number, j: number) => Promise<void>,
  _onSorted?: (indices: number[]) => void,
  onStep?: OnStepCallback,
): Promise<number[]> {
  const arr = [...array];
  const n = arr.length;

  async function heapify(size: number, i: number): Promise<void> {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < size) {
      if (onCompare) await onCompare(left, largest);
      if (arr[left] > arr[largest]) {
        largest = left;
      }
    }

    if (right < size) {
      if (onCompare) await onCompare(right, largest);
      if (arr[right] > arr[largest]) {
        largest = right;
      }
    }

    if (largest !== i) {
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      if (onSwap) await onSwap(arr, i, largest);
      await heapify(size, largest);
    }
  }

  // ヒープを構築
  if (onStep) {
    await onStep({
      description: "ヒープ構築中: 最大ヒープを作成",
      highlights: rangeHighlights(0, n - 1, "range"),
    });
  }
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    if (onStep) {
      const highlights = new Map<number, HighlightRole>();
      highlights.set(i, "heap-root");
      await onStep({
        description: `ヒープ化: ノード ${i} (値: ${arr[i]})`,
        highlights,
      });
    }
    await heapify(n, i);
  }

  // ヒープから要素を取り出す
  for (let i = n - 1; i > 0; i--) {
    if (onStep) {
      const highlights = new Map<number, HighlightRole>();
      highlights.set(0, "heap-root");
      await onStep({
        description: `最大値 ${arr[0]} をヒープから取り出して位置 ${i} に配置`,
        highlights,
      });
    }
    [arr[0], arr[i]] = [arr[i], arr[0]];
    if (onSwap) await onSwap(arr, 0, i);
    await heapify(i, 0);
  }

  return arr;
}

export const SORTING_ALGORITHMS: SortingAlgorithms = {
  bubble: { name: "バブルソート", fn: bubbleSort },
  quick: { name: "クイックソート", fn: quickSort },
  merge: { name: "マージソート", fn: mergeSort },
  insertion: { name: "挿入ソート", fn: insertionSort },
  selection: { name: "選択ソート", fn: selectionSort },
  heap: { name: "ヒープソート", fn: heapSort },
};
