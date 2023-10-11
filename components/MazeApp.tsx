'use client';
import React, { useEffect, useState, useRef } from 'react';

const MazePage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [allPaths, setAllPaths] = useState<any[]>([]);
  const w = 30;
  let cols: number;
  let rows: number;
  const grid: any[] = [];
  let current: any;
  let stack: any[] = [];
  let startCell: any;
  let goalCell: any;

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

  const setup = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    cols = Math.floor(800 / w);
    rows = Math.floor(800 / w);
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
              ctx.fillStyle = 'red';
              ctx.fillRect(x, y, w, w);
            } else if (this.visited) {
              ctx.fillStyle = 'rgba(0, 255, 0, 0.4)';
              ctx.fillRect(x, y, w, w);
            }
          },
          checkNeighbors() {
            const neighbors: any[] = [];
            const top = grid[index(this.i, this.j - 1)];
            const right = grid[index(this.i + 1, this.j)];
            const bottom = grid[index(this.i, this.j + 1)];
            const left = grid[index(this.i - 1, this.j)];

            if (top && !top.visited) neighbors.push(top);
            if (right && !right.visited) neighbors.push(right);
            if (bottom && !bottom.visited) neighbors.push(bottom);
            if (left && !left.visited) neighbors.push(left);

            if (neighbors.length > 0) {
              const r = Math.floor(Math.random() * neighbors.length);
              return neighbors[r];
            } else {
              return undefined;
            }
          },
        };
        grid.push(cell);
      }
    }

    startCell = grid[0];
    goalCell = grid[grid.length - 1];
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

        const next = current.checkNeighbors();
        if (next && !next.lock) {
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

  useEffect(() => {
    setup();
    requestAnimationFrame(draw);
  }, []);

  return <canvas ref={canvasRef} width={800} height={800}></canvas>;
};

export default MazePage;
