import React, { useEffect, useRef } from 'react';

const MazePage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

  const removeRandomWalls = () => {
    // You can change this value to control how many walls are removed.
    let numWallsToRemove = Math.floor(grid.length * 0.2); // Remove 20% of total walls

    while (numWallsToRemove > 0) {
      const randomCell = grid[Math.floor(Math.random() * grid.length)];
      const wallIndex = Math.floor(Math.random() * 4);
      if (randomCell.walls[wallIndex]) {
        randomCell.walls[wallIndex] = false;
        numWallsToRemove--;
      }
    }
  };

  const setup = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    cols = Math.floor(800 / w);
    rows = Math.floor(800 / w);
    grid.length = 0; // Clear the grid array

    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const cell = {
          id: `${i}-${j}`,
          i,
          j,
          walls: [true, true, true, true],
          visited: false,
          isStart: false,
          isGoal: false,
          highlight() {
            const x = this.i * w;
            const y = this.j * w;
            ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
            ctx.fillRect(x, y, w, w);
          },
          checkNeighbors() {
            const neighbors = [];

            const top = grid[index(i, j - 1)];
            const right = grid[index(i + 1, j)];
            const bottom = grid[index(i, j + 1)];
            const left = grid[index(i - 1, j)];

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

    const randomIndex = () => Math.floor(Math.random() * grid.length);

    let startCellIndex = randomIndex();
    let goalCellIndex = randomIndex();

    // Ensure the start and goal cells are not the same
    while (startCellIndex === goalCellIndex) {
      goalCellIndex = randomIndex();
    }

    startCell = grid[startCellIndex];
    goalCell = grid[goalCellIndex];

    startCell.isStart = true;
    goalCell.isGoal = true;

    current = startCell;

    // Introduce multiple solutions by removing random walls
    removeRandomWalls();
  };

  const draw = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 800, 800);
    ctx.strokeStyle = '#FFF';

    for (const cell of grid) {
      const x = cell.i * w;
      const y = cell.j * w;

      if (cell.walls[0]) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + w, y);
        ctx.stroke();
      }
      if (cell.walls[1]) {
        ctx.beginPath();
        ctx.moveTo(x + w, y);
        ctx.lineTo(x + w, y + w);
        ctx.stroke();
      }
      if (cell.walls[2]) {
        ctx.beginPath();
        ctx.moveTo(x + w, y + w);
        ctx.lineTo(x, y + w);
        ctx.stroke();
      }
      if (cell.walls[3]) {
        ctx.beginPath();
        ctx.moveTo(x, y + w);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      if (cell.visited) {
        ctx.fillStyle = 'rgba(128, 128, 0, 0.5)';
        ctx.fillRect(x, y, w, w);
      }

      if (cell.isStart) {
        ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
        ctx.fillRect(x, y, w, w);
      }

      if (cell.isGoal) {
        ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
        ctx.fillRect(x, y, w, w);
      }
    }

    if (current === goalCell) {
      return;
    }

    current.visited = true;
    current.highlight();

    const next = current.checkNeighbors();

    if (next) {
      next.visited = true;
      stack.push(current);
      removeWalls(current, next);
      current = next;
    } else if (stack.length > 0) {
      current = stack.pop();
    }

    requestAnimationFrame(draw);
  };

  useEffect(() => {
    setup();
    requestAnimationFrame(draw); // First drawing call, subsequent calls will be made recursively inside draw()
  }, []);

  return <canvas ref={canvasRef} width={800} height={800}></canvas>;
};

export default MazePage;
