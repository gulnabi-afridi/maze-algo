import React from 'react';

interface MazeUIProps {
  grid: any[];
  current: any;
  w: number;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const MazeUI: React.FC<MazeUIProps> = ({ canvasRef, grid, current, w }) => {
  React.useEffect(() => {
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

    if (current) {
      current.highlight(ctx);
    }
  }, [grid, current, w]);

  return <canvas ref={canvasRef} width={800} height={700}></canvas>;
};

export default MazeUI;
