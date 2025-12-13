import React, { useState, useEffect, useCallback } from 'react';
import { Game } from './components/Game';
import { Controls } from './components/Controls';
import { LevelSelect } from './components/LevelSelect';
import { levels } from './levels';
import { Direction, GameStatus, Position, CellType } from './types';

// Define a snapshot type for history
interface GameSnapshot {
  grid: CellType[][];
  playerPos: Position;
  status: GameStatus;
  moveCount: number;
}

function App() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [grid, setGrid] = useState<CellType[][]>([]);
  const [playerPos, setPlayerPos] = useState<Position>({ x: 0, y: 0 });
  const [status, setStatus] = useState<GameStatus>('playing');
  const [moveCount, setMoveCount] = useState(0);
  
  // History Stacks
  const [history, setHistory] = useState<GameSnapshot[]>([]);
  const [future, setFuture] = useState<GameSnapshot[]>([]);

  const loadLevel = useCallback((index: number) => {
    const level = levels[index];
    // Deep copy the grid
    const newGrid = level.grid.map(row => [...row]);
    setGrid(newGrid);
    setPlayerPos({ ...level.startPos });
    setStatus('playing');
    setMoveCount(0);
    // Clear history on level load
    setHistory([]);
    setFuture([]);
  }, []);

  useEffect(() => {
    loadLevel(levelIndex);
  }, [levelIndex, loadLevel]);

  // Helper to deep copy grid
  const cloneGrid = (g: CellType[][]) => g.map(row => [...row]);

  const saveToHistory = () => {
    const snapshot: GameSnapshot = {
      grid: cloneGrid(grid),
      playerPos: { ...playerPos },
      status,
      moveCount
    };
    setHistory(prev => [...prev, snapshot]);
    setFuture([]); // Clear future when a new action is taken
  };

  const handleUndo = useCallback(() => {
    if (history.length === 0 || status === 'won') return;

    const previous = history[history.length - 1];
    const newHistory = history.slice(0, -1);

    // Save current state to future before restoring previous
    const currentSnapshot: GameSnapshot = {
      grid: cloneGrid(grid),
      playerPos: { ...playerPos },
      status,
      moveCount
    };
    setFuture(prev => [...prev, currentSnapshot]);

    // Restore state
    setGrid(previous.grid);
    setPlayerPos(previous.playerPos);
    setStatus(previous.status);
    setMoveCount(previous.moveCount);
    setHistory(newHistory);
  }, [history, grid, playerPos, status, moveCount]);

  const handleRedo = useCallback(() => {
    if (future.length === 0 || status === 'won') return;

    const next = future[future.length - 1];
    const newFuture = future.slice(0, -1);

    // Save current state to history before restoring next
    const currentSnapshot: GameSnapshot = {
      grid: cloneGrid(grid),
      playerPos: { ...playerPos },
      status,
      moveCount
    };
    setHistory(prev => [...prev, currentSnapshot]);

    // Restore state
    setGrid(next.grid);
    setPlayerPos(next.playerPos);
    setStatus(next.status);
    setMoveCount(next.moveCount);
    setFuture(newFuture);
  }, [future, grid, playerPos, status, moveCount]);

  const movePlayer = useCallback((direction: Direction) => {
    if (status !== 'playing') return;

    let dx = 0;
    let dy = 0;

    switch (direction) {
      case 'UP': dy = -1; break;
      case 'DOWN': dy = 1; break;
      case 'LEFT': dx = -1; break;
      case 'RIGHT': dx = 1; break;
    }

    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;

    // Check bounds
    if (newY < 0 || newY >= grid.length || newX < 0 || newX >= grid[0].length) return;

    const targetCell = grid[newY][newX];

    // Wall collision
    if (targetCell === 'wall') return;

    // Box interaction
    if (targetCell === 'box' || targetCell === 'box-on-target') {
      const boxNewX = newX + dx;
      const boxNewY = newY + dy;

      // Check bounds for box
      if (boxNewY < 0 || boxNewY >= grid.length || boxNewX < 0 || boxNewX >= grid[0].length) return;

      const boxTargetCell = grid[boxNewY][boxNewX];

      // Box collision (wall or another box)
      if (boxTargetCell === 'wall' || boxTargetCell === 'box' || boxTargetCell === 'box-on-target') return;

      // --- VALID MOVE DETECTED: Save History ---
      saveToHistory();

      // Move box
      const newGrid = cloneGrid(grid);
      
      // Remove box from current position
      newGrid[newY][newX] = targetCell === 'box-on-target' ? 'target' : 'floor';

      // Place box in new position
      if (boxTargetCell === 'target') {
        newGrid[boxNewY][boxNewX] = 'box-on-target';
      } else {
        newGrid[boxNewY][boxNewX] = 'box';
      }

      setGrid(newGrid);
      setPlayerPos({ x: newX, y: newY });
      setMoveCount(prev => prev + 1);
      
      // Check win condition
      const isWon = checkWin(newGrid);
      if (isWon) setStatus('won');
    } else {
      // --- VALID MOVE DETECTED (No Box): Save History ---
      saveToHistory();

      // Simple move
      setPlayerPos({ x: newX, y: newY });
      setMoveCount(prev => prev + 1);
    }
  }, [grid, playerPos, status, moveCount]); // Dependencies updated implicitly by using function scope vars, but explicit listing is good

  const checkWin = (currentGrid: CellType[][]) => {
    for (let y = 0; y < currentGrid.length; y++) {
      for (let x = 0; x < currentGrid[y].length; x++) {
        if (currentGrid[y][x] === 'box') return false; // Found a box not on target
      }
    }
    return true;
  };

  const handleReset = () => {
    loadLevel(levelIndex);
  };

  const handleNextLevel = () => {
    if (levelIndex < levels.length - 1) {
      setLevelIndex(prev => prev + 1);
    }
  };

  const handlePrevLevel = () => {
    if (levelIndex > 0) {
      setLevelIndex(prev => prev - 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo/Redo Shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        handleRedo();
        return;
      }

      switch (e.key) {
        case 'ArrowUp': movePlayer('UP'); break;
        case 'ArrowDown': movePlayer('DOWN'); break;
        case 'ArrowLeft': movePlayer('LEFT'); break;
        case 'ArrowRight': movePlayer('RIGHT'); break;
        case 'r': handleReset(); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer, handleReset, handleUndo, handleRedo]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-4 text-blue-400">Sokoban</h1>
      
      <div className="mb-4 flex items-center gap-4">
        <span className="text-xl">Level {levelIndex + 1} / {levels.length}</span>
        <span className="text-gray-400">Moves: {moveCount}</span>
      </div>

      <div className="bg-gray-800 p-2 rounded-lg shadow-2xl mb-6">
        <Game grid={grid} playerPos={playerPos} />
      </div>

      {status === 'won' && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl text-center border-2 border-green-500 animate-bounce-in">
            <h2 className="text-3xl font-bold text-green-400 mb-4">Level Complete!</h2>
            <p className="mb-6 text-gray-300">Solved in {moveCount} moves</p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={handleReset}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-500 rounded font-bold transition-colors"
              >
                Replay
              </button>
              {levelIndex < levels.length - 1 && (
                <button 
                  onClick={handleNextLevel}
                  className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded font-bold transition-colors"
                >
                  Next Level
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <Controls 
        onReset={handleReset} 
        onMove={movePlayer} 
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={history.length > 0 && status !== 'won'}
        canRedo={future.length > 0 && status !== 'won'}
      />
      
      <LevelSelect 
        currentLevel={levelIndex} 
        totalLevels={levels.length} 
        onSelect={setLevelIndex} 
      />

      <div className="mt-8 text-gray-500 text-sm">
        Use Arrow keys to move • R to reset • Ctrl+Z to Undo
      </div>
    </div>
  );
}

export default App;
