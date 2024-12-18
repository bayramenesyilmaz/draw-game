"use client";

import React, { useEffect } from "react";

export default function Canvas({ canvasRef, handleMouseMove, drawingData }) {
  useEffect(() => {
    if (!drawingData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.beginPath();
    ctx.moveTo(drawingData.prevX, drawingData.prevY);
    ctx.lineTo(drawingData.x, drawingData.y);
    ctx.stroke();
  }, [drawingData]);

  return (
    <canvas
      ref={canvasRef}
      width={500}
      height={500}
      className="border"
      onMouseMove={handleMouseMove}
    />
  );
}
