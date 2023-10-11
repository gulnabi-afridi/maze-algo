'use client';
import React, { useEffect, useState, useRef } from 'react';
import MazeUI from '@/components/MazeUi';

export default function Home() {
  // states ---------->
  const [allPaths, setAllPaths] = useState<any[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // variables --------->
  const w = 30;
  let cols: number;
  let rows: number;
  const grid: any[] = [];
  let current: any;
  let stack: any[] = [];
  let startCell: any;
  let goalCell: any;

  // methods -------------->
  const index = (i: number, j: number) => {
    if (i < 0 || j < 0 || i > cols - 1 || j > rows - 1) {
      return -1;
    }
    return i + j * cols;
  };

  const removeWalls = (a: any, b: any) => {
    const x = a.i - b.i;
    if (x === 1) {
      a.walls[3] = false;
      b.walls[1] = false;
    } else if (x === -1) {
      a.walls[1] = false;
      b.walls[3] = false;
    }
    const y = a.j - b.j;
    if (y === 1) {
      a.walls[0] = false;
      b.walls[2] = false;
    } else if (y === -1) {
      a.walls[2] = false;
      b.walls[0] = false;
    }
  };

  const checkNeighborsWithLocks = (cell: any) => {
    const neighbors: any[] = [];
    const top = grid[index(cell.i, cell.j - 1)];
    const right = grid[index(cell.i + 1, cell.j)];
    const bottom = grid[index(cell.i, cell.j + 1)];
    const left = grid[index(cell.i - 1, cell.j)];

    if (top && !top.visited && !top.lock) neighbors.push(top);
    if (right && !right.visited && !right.lock) neighbors.push(right);
    if (bottom && !bottom.visited && !bottom.lock) neighbors.push(bottom);
    if (left && !left.visited && !left.lock) neighbors.push(left);

    if (neighbors.length > 0) {
      const r = Math.floor(Math.random() * neighbors.length);
      return neighbors[r];
    } else {
      return undefined;
    }
  };

  const setup = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    cols = Math.floor(800 / w);
    rows = Math.floor(700 / w);
    grid.length = 0;

    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const cell = {
          id: `${i}-${j}`,
          i,
          j,
          lock: false,
          walls: [true, true, true, true],
          visited: false,
          isStart: false,
          isGoal: false,
          highlight(ctx: CanvasRenderingContext2D) {
            const x = this.i * w;
            const y = this.j * w;
            ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
            ctx.fillRect(x, y, w, w);
          },

          show(ctx: CanvasRenderingContext2D) {
            const x = this.i * w;
            const y = this.j * w;

            // Draw walls
            ctx.beginPath();
            ctx.strokeStyle = 'white'; // Wall color
            if (this.walls[0]) {
              ctx.moveTo(x, y);
              ctx.lineTo(x + w, y);
            }
            if (this.walls[1]) {
              ctx.moveTo(x + w, y);
              ctx.lineTo(x + w, y + w);
            }
            if (this.walls[2]) {
              ctx.moveTo(x + w, y + w);
              ctx.lineTo(x, y + w);
            }
            if (this.walls[3]) {
              ctx.moveTo(x, y + w);
              ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Fill cell colors
            if (this.isStart) {
              ctx.fillStyle = 'purple';
              ctx.fillRect(x, y, w, w);
            } else if (this.isGoal) {
              ctx.fillStyle = 'orange';
              ctx.fillRect(x, y, w, w);
            } else if (this.visited) {
              ctx.fillStyle = 'rgba(0, 255, 0, 0.4)';
              ctx.fillRect(x, y, w, w);
            }
          },
        };
        grid.push(cell);
      }
    }

    // Randomize start and goal cells
    let randomIndexForStart = Math.floor(Math.random() * grid.length);
    let randomIndexForGoal = Math.floor(Math.random() * grid.length);

    // Ensure start and goal are different cells
    while (randomIndexForStart === randomIndexForGoal) {
      randomIndexForGoal = Math.floor(Math.random() * grid.length);
    }
    if (startCell) startCell.isStart = false;
    if (goalCell) goalCell.isGoal = false;
    startCell = grid[randomIndexForStart];
    goalCell = grid[randomIndexForGoal];

    startCell.isStart = true;
    goalCell.isGoal = true;
    current = startCell;
    stack.length = 0;
  };

  const resetGrid = () => {
    for (const cell of grid) {
      if (!cell.lock) {
        cell.visited = false;
      }
    }
    current = startCell;
    stack.length = 0;
  };

  const draw = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, 800, 800); // Clear the canvas

    // Set canvas background to black
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, 800, 800);

    // Drawing grid and walls
    ctx.beginPath();
    for (const cell of grid) {
      cell.show(ctx);
    }
    ctx.stroke();

    if (current === goalCell) {
      setAllPaths((prevPaths) => [...prevPaths, [...stack, current]]);
      resetGrid();
    } else {
      if (!current.lock) {
        // Only visit if the cell is not locked
        current.visited = true;
        current.highlight(ctx);

        const next = checkNeighborsWithLocks(current);
        if (next) {
          // Only visit the next cell if it is not locked
          next.visited = true;
          stack.push(current);
          removeWalls(current, next);
          current = next;
        } else if (stack.length > 0) {
          current = stack.pop();
        }
      } else if (stack.length > 0) {
        current = stack.pop();
      }
    }
    requestAnimationFrame(draw);
  };

  // methodes ends here ----------------->

  // useEffect ------------------->
  useEffect(() => {
    setup();
    requestAnimationFrame(draw);
  }, []);

  return (
    <div className='w-full min-h-screen flex justify-center items-center bg-black'>
      <MazeUI canvasRef={canvasRef} grid={grid} current={current} w={w} />;
    </div>
  );
}
