"use client";
import { useEffect, useRef } from "react";

export default function Canvas({ socket, roomId, isDrawing }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const isDrawingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    ctxRef.current = canvas.getContext("2d");

    // Diğer kullanıcılardan gelen çizim verisini dinle
    socket.on("draw", ({ x, y, prevX, prevY }) => {
      drawLine(prevX, prevY, x, y, "black");
    });

    return () => {
      socket.off("draw");
    };
  }, [socket]);

  // Çizim işlemi
  const drawLine = (x1, y1, x2, y2, color) => {
    const ctx = ctxRef.current;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  // Mouse olaylarını dinle
  const handleMouseDown = (e) => {
    if (!isDrawing) return;
    isDrawingRef.current = true;

    const { offsetX, offsetY } = e.nativeEvent;
    isDrawingRef.prevX = offsetX;
    isDrawingRef.prevY = offsetY;
  };

  const handleMouseMove = (e) => {
    if (!isDrawingRef.current) return;

    const { offsetX, offsetY } = e.nativeEvent;
    const prevX = isDrawingRef.prevX;
    const prevY = isDrawingRef.prevY;

    // Çizim işlemi
    drawLine(prevX, prevY, offsetX, offsetY, "black");

    // Çizim verisini sunucuya gönder
    socket.emit("draw", {
      roomId,
      x: offsetX,
      y: offsetY,
      prevX,
      prevY,
    });

    // Mevcut noktayı güncelle
    isDrawingRef.prevX = offsetX;
    isDrawingRef.prevY = offsetY;
  };

  const handleMouseUp = () => {
    isDrawingRef.current = false;
  };

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={400}
      style={{
        border: "1px solid black",
        backgroundColor: "white",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseOut={handleMouseUp}
    />
  );
}
