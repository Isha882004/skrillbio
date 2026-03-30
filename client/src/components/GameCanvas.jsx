import { useEffect, useRef, useState } from "react";
import { socket } from "../socketHandler";
import { GameEvent } from "../types";
import Toolbar from "./Toolbar";
import { useRoom } from "../context/RoomContext";

const GameCanvas = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const { myTurn } = useRoom();
  const [lineWidth, setLineWidth] = useState(5);
  const [color, setColor] = useState("#000000");

  const drawing = useRef(false);
  const localDrawData = useRef([]);

  /** Helper: get canvas coords from mouse/touch */
  const getCoords = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const point = event.touches ? event.touches[0] : event;
    return {
      x: ((point.clientX - rect.left) * canvas.width) / rect.width,
      y: ((point.clientY - rect.top) * canvas.height) / rect.height,
    };
  };

  /** Start drawing */
  const startDrawing = (event) => {
    if (!myTurn) return;
    drawing.current = true;
    const { x, y } = getCoords(event);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x, y);
    localDrawData.current.push({ x, y, color, lineWidth, end: false });
    event.preventDefault();
  };

  /** Draw stroke */
  const draw = (event) => {
    if (!drawing.current || !myTurn) return;
    const { x, y } = getCoords(event);
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);

    const point = { x, y, color, lineWidth, end: false };
    localDrawData.current.push(point);

    // Emit to server
    socket.emit(GameEvent.DRAW, point);
    event.preventDefault();
  };

  /** Stop drawing */
  const stopDrawing = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const last = localDrawData.current[localDrawData.current.length - 1];
    if (last) last.end = true;
    socket.emit(GameEvent.DRAW, last); // inform server stroke ended
  };

  /** Clear canvas */
  const clearCanvas = () => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  localDrawData.current = [];

  // ✅ IMPORTANT: sync with server
  socket.emit(GameEvent.DRAW_CLEAR);
};
  /** Undo last stroke */
  const handleUndo = () => {
    if (localDrawData.current.length === 0) return;
    // Remove points until previous "end"
    let i = localDrawData.current.length - 1;
    while (i >= 0) {
      if (localDrawData.current[i].end) break;
      i--;
    }
    localDrawData.current = localDrawData.current.slice(0, i);
    clearCanvas();
    redraw(localDrawData.current);
    socket.emit(GameEvent.UNDO_DRAW); // tell server
  };

  /** Redraw array of points */
  const redraw = (data) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    data.forEach((point) => {
      ctx.lineWidth = point.lineWidth;
      ctx.strokeStyle = point.color;
      ctx.lineCap = "round";
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
      if (point.end) ctx.beginPath();
      ctx.moveTo(point.x, point.y);
    });
  };

  /** Handle drawing from other players */
  const receiveDrawData = (point) => {
    localDrawData.current.push(point);
    redraw([point]);
  };

  /** Setup socket listeners */
  useEffect(() => {
    socket.on(GameEvent.DRAW_DATA, receiveDrawData);
    socket.on(GameEvent.CLEAR_DRAW, clearCanvas);
    socket.on(GameEvent.UNDO_DRAW, () => {
      localDrawData.current.pop();
      clearCanvas();
      redraw(localDrawData.current);
    });

    return () => {
      socket.off(GameEvent.DRAW_DATA, receiveDrawData);
      socket.off(GameEvent.CLEAR_DRAW, clearCanvas);
      socket.off(GameEvent.UNDO_DRAW);
    };
  }, []);

  /** Resize canvas to fit container */
  useEffect(() => {
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (canvas && container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }
  };

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  return () => window.removeEventListener("resize", resizeCanvas);
}, []);

  return (
<div
  ref={containerRef}
  className="flex flex-col flex-1 bg-gray-100 border border-gray-400"
  style={{ minHeight: "400px" }}>
    <canvas
  ref={canvasRef}
  className="w-full h-full border border-black z-0"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      <div className="w-full bg-white border-t border-gray-300">
  <Toolbar
    onLineWidthChange={setLineWidth}
    onColorChange={setColor}
    handleUndo={handleUndo}
    handleClear={clearCanvas}
  />
</div>
    </div>
  );
};

export default GameCanvas;