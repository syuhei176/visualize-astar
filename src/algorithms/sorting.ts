import { SortingAlgorithms } from "../types";

// バブルソート
export async function bubbleSort(
  array: number[],
  onSwap?: (array: number[], i: number, j: number) => Promise<void>,
  onCompare?: (i: number, j: number) => Promise<void>,
): Promise<number[]> {
  const arr = [...array];
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (onCompare) await onCompare(j, j + 1);

      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        if (onSwap) await onSwap(arr, j, j + 1);
      }
    }
  }

  return arr;
}

// クイックソート
export async function quickSort(
  array: number[],
  onSwap?: (array: number[], i: number, j: number) => Promise<void>,
  onCompare?: (i: number, j: number) => Promise<void>,
  start: number = 0,
  end: number | null = null,
): Promise<number[]> {
  const arr = [...array];
  if (end === null) end = arr.length - 1;

  async function partition(low: number, high: number): Promise<number> {
    const pivot = arr[high];
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
    return i + 1;
  }

  async function quickSortHelper(low: number, high: number): Promise<void> {
    if (low < high) {
      const pi = await partition(low, high);
      await quickSortHelper(low, pi - 1);
      await quickSortHelper(pi + 1, high);
    }
  }

  await quickSortHelper(start, end);
  return arr;
}

// マージソート
export async function mergeSort(
  array: number[],
  onSwap?: (array: number[], i: number, j: number) => Promise<void>,
  onCompare?: (i: number, j: number) => Promise<void>,
): Promise<number[]> {
  const arr = [...array];

  async function merge(
    left: number,
    mid: number,
    right: number,
  ): Promise<void> {
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
): Promise<number[]> {
  const arr = [...array];
  const n = arr.length;

  for (let i = 1; i < n; i++) {
    const key = arr[i];
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
): Promise<number[]> {
  const arr = [...array];
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    for (let j = i + 1; j < n; j++) {
      if (onCompare) await onCompare(j, minIdx);

      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }

    if (minIdx !== i) {
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
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    await heapify(n, i);
  }

  // ヒープから要素を取り出す
  for (let i = n - 1; i > 0; i--) {
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
