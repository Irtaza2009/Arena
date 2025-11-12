import React, { useState } from "react";
import axios from "axios";
import beeImage from "../BumbleBee.png";

const COLORS = [
  { name: "Red", hex: "#FFB3B3" },      // pastel red
  { name: "Orange", hex: "#FFD7B3" },   // pastel orange
  { name: "Yellow", hex: "#FFF5B3" },   // pastel yellow
  { name: "Green", hex: "#C7F0C7" },    // pastel green
  { name: "Blue", hex: "#B3D9FF" },     // pastel blue
  { name: "Indigo", hex: "#C8B3FF" },   // pastel indigo
  { name: "Violet", hex: "#E9D4FF" },   // pastel violet
  { name: "Smoky", hex: "#4A4A4A" },    // pastel black (muted/soft black)
];

export default function ColorWheel({ onAssign }) {
  const [flying, setFlying] = useState(false);
  const [beePosition, setBeePosition] = useState({ x: 0, y: 0 });
  const [targetColor, setTargetColor] = useState(null);

  // Calculate positions for each color segment - moved more towards middle
  const getColorPosition = (index) => {
    const segments = COLORS.length;
    const radius = 80; // Reduced from 120 to move landing points more towards middle
    const angle = (index * 360 / segments) - 90; // Start from top (-90deg)
    const radian = (angle * Math.PI) / 180;
    
    return {
      x: Math.cos(radian) * radius,
      y: Math.sin(radian) * radius
    };
  };

  const flyToColor = async () => {
    if (flying) return;
    setFlying(true);

    const chosenIndex = Math.floor(Math.random() * COLORS.length);
    const targetPos = getColorPosition(chosenIndex);
    setTargetColor(COLORS[chosenIndex]);

    // Reset bee to center (slightly higher position)
    setBeePosition({ x: 0, y: -10 }); // Moved bee up by 10px

    // Small delay before starting flight
    await new Promise(resolve => setTimeout(resolve, 100));

    // Bee-like flight path with wobble
    const steps = 60;
    const duration = 3000; // 3 seconds
    const stepTime = duration / steps;

    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      
      // Main movement towards target
      const mainX = targetPos.x * progress;
      const mainY = targetPos.y * progress;
      
      // Wobble effect (bee-like motion)
      const wobbleIntensity = 15;
      const wobbleX = Math.sin(progress * Math.PI * 8) * wobbleIntensity * (1 - progress);
      const wobbleY = Math.cos(progress * Math.PI * 6) * wobbleIntensity * (1 - progress);
      
      setBeePosition({
        x: mainX + wobbleX,
        y: mainY + wobbleY - 10 * (1 - progress) // Start from higher position
      });

      await new Promise(resolve => setTimeout(resolve, stepTime));
    }

    // Final adjustment to exact target position
    setBeePosition(targetPos);

    const color = COLORS[chosenIndex].hex;

    // Save color to backend
    try {
      await axios.post(
        "https://backend.arena.hackclub.com/api/color",
        { color },
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Failed to save color:", err);
    }

    // Small delay before calling onAssign
    setTimeout(() => {
      setFlying(false);
      if (typeof onAssign === "function") onAssign(color);
    }, 500);
  };

  return (
    <div
      id="arena-color-wheel-overlay"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: 360,
          maxWidth: "90vw",
          textAlign: "center",
          color: "#fff",
          position: "relative",
        }}
      >
        <div style={{ marginBottom: 12, fontSize: 20, fontWeight: 600 }}>
          Click the bee to claim your monochrome colour!
        </div>
        
        {/* Color Wheel */}
        <div
          style={{
            width: 320,
            height: 320,
            margin: "0 auto",
            borderRadius: "50%",
            // segments with conic-gradient in ROYGBIV order
            background: `conic-gradient(${COLORS
              .map((c, i) => `${c.hex} ${i * (360 / COLORS.length)}deg ${(
                (i + 1) *
                (360 / COLORS.length)
              ).toFixed(3)}deg`)
              .join(",")})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 6px 18px rgba(0,0,0,0.5)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Bee - positioned slightly higher */}
          <div
            onClick={flyToColor}
            style={{
              position: "absolute",
              width: "50px",
              height: "50px",
              left: "50%",
              top: "50%",
              transform: `translate(${beePosition.x - 25}px, ${beePosition.y - 25}px)`,
              cursor: flying ? "default" : "pointer",
              transition: flying ? "none" : "transform 0.2s ease",
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
            }}
          >
            <img 
              src={beeImage} 
              alt="Bee" 
              style={{ 
                width: '50px', 
                height: '50px',
                filter: flying ? 'drop-shadow(0 0 4px rgba(255,255,0,0.6))' : 'none',
                transition: 'filter 0.3s ease'
              }} 
            />
          </div>

          {/* Center circle - text positioned slightly lower */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#111",
              fontWeight: 700,
              position: "relative",
              zIndex: 1,
              opacity: flying ? 0.7 : 1,
            }}
          >
            <div style={{ transform: 'translateY(20px)' }}>
              {flying ? "Flying…" : "Click Bee!"}
            </div>
          </div>
        </div>

        {/* Status message */}
        <div style={{ marginTop: 12, minHeight: 20 }}>
          {flying && targetColor && (
            <small>The bee is flying to {targetColor.name}!</small>
          )}
          {!flying && (
            <small>Click the bee to choose your color. It will fly to a random color!</small>
          )}
        </div>
      </div>
    </div>
  );
}