import { useState, useRef, useEffect } from 'react'
import { SORTING_ALGORITHMS } from '../algorithms/sorting'
import './SortingVisualizer.css'

const ARRAY_SIZE = 50
const MAX_VALUE = 100

function SortingVisualizer() {
  const [array, setArray] = useState([])
  const [algorithm, setAlgorithm] = useState('bubble')
  const [isRunning, setIsRunning] = useState(false)
  const [speed, setSpeed] = useState(50)
  const [comparisons, setComparisons] = useState(0)
  const [swaps, setSwaps] = useState(0)
  const comparingIndicesRef = useRef([])
  const swappingIndicesRef = useRef([])

  useEffect(() => {
    generateArray()
  }, [])

  const generateArray = () => {
    const newArray = Array.from(
      { length: ARRAY_SIZE },
      () => Math.floor(Math.random() * MAX_VALUE) + 1
    )
    setArray(newArray)
    setComparisons(0)
    setSwaps(0)
    comparingIndicesRef.current = []
    swappingIndicesRef.current = []
  }

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

  const handleCompare = async (i, j) => {
    comparingIndicesRef.current = [i, j]
    setComparisons(prev => prev + 1)
    setArray(prev => [...prev]) // 再レンダリング用
    await sleep(101 - speed)
    comparingIndicesRef.current = []
  }

  const handleSwap = async (newArray, i, j) => {
    swappingIndicesRef.current = [i, j]
    setSwaps(prev => prev + 1)
    setArray([...newArray])
    await sleep(101 - speed)
    swappingIndicesRef.current = []
  }

  const runSort = async () => {
    if (isRunning) return
    setIsRunning(true)
    setComparisons(0)
    setSwaps(0)

    const algorithmFn = SORTING_ALGORITHMS[algorithm].fn
    await algorithmFn(array, handleSwap, handleCompare)

    // 完了アニメーション
    for (let i = 0; i < array.length; i++) {
      swappingIndicesRef.current = [i]
      setArray(prev => [...prev])
      await sleep(20)
    }
    swappingIndicesRef.current = []
    setArray(prev => [...prev])

    setIsRunning(false)
  }

  const getBarClass = (index) => {
    const classes = ['bar']
    if (comparingIndicesRef.current.includes(index)) {
      classes.push('comparing')
    }
    if (swappingIndicesRef.current.includes(index)) {
      classes.push('swapping')
    }
    return classes.join(' ')
  }

  return (
    <div className="sorting-visualizer">
      <div className="controls">
        <label>
          アルゴリズム:
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            disabled={isRunning}
          >
            {Object.entries(SORTING_ALGORITHMS).map(([key, { name }]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
        </label>

        <label>
          速度:
          <input
            type="range"
            min="1"
            max="100"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            disabled={isRunning}
          />
          <span>{speed}</span>
        </label>

        <button onClick={runSort} disabled={isRunning}>
          ソート開始
        </button>
        <button onClick={generateArray} disabled={isRunning}>
          配列を再生成
        </button>
      </div>

      <div className="array-container">
        {array.map((value, index) => (
          <div
            key={index}
            className={getBarClass(index)}
            style={{
              height: `${(value / MAX_VALUE) * 100}%`,
              width: `${100 / ARRAY_SIZE}%`
            }}
          >
            <span className="bar-value">{value}</span>
          </div>
        ))}
      </div>

      <div className="info">
        <p className="stats">
          比較回数: {comparisons} | スワップ回数: {swaps}
        </p>
      </div>
    </div>
  )
}

export default SortingVisualizer
