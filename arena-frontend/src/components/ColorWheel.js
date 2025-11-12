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

export default function ColorWheel({ onAssign, onClose }) {
  const [flying, setFlying] = useState(false);
  const [beePosition, setBeePosition] = useState({ x: 0, y: 0 });
  const [targetColor, setTargetColor] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [showResult, setShowResult] = useState(false);

  // Calculate positions for each color segment - with random offset within segment
  const getColorPosition = (index) => {
    const segments = COLORS.length;
    const radius = 90;
    
    // Calculate the base angle for this segment
    const segmentSize = 360 / segments; // 45 degrees per segment
    const segmentStartAngle = (index * segmentSize) - 90; // Start from top
    
    // Add random offset within the segment (avoid edges)
    const randomOffset = Math.random() * segmentSize * 0.6; // 0 to 27 degrees from start
    const angle = segmentStartAngle + randomOffset;
    
    const radian = (angle * Math.PI) / 180;
    
    return {
      x: Math.cos(radian) * radius,
      y: Math.sin(radian) * radius
    };
  };

  const flyToColor = async () => {
    if (flying) return;
    setFlying(true);
    setShowResult(false);

    const chosenIndex = Math.floor(Math.random() * COLORS.length);
    const targetPos = getColorPosition(chosenIndex);
    const chosenColor = COLORS[chosenIndex];
    setTargetColor(chosenColor);

    // Reset bee to center (slightly higher position)
    setBeePosition({ x: 0, y: -20 });

    // Small delay before starting flight
    await new Promise(resolve => setTimeout(resolve, 100));

    // Bee-like flight path with wobble
    const steps = 60;
    const duration = 3000;
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
        y: mainY + wobbleY - 20 * (1 - progress)
      });

      await new Promise(resolve => setTimeout(resolve, stepTime));
    }

    // Final adjustment to exact target position
    setBeePosition(targetPos);

    // Save color to backend
    try {
      await axios.post(
        "https://backend.arena.hackclub.com/api/color",
        { color: chosenColor.hex },
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Failed to save color:", err);
    }

    setTimeout(() => {
      setFlying(false);
      setSelectedColor(chosenColor);
      setShowResult(true);
    }, 500);
  };

  const handleAcceptColor = () => {
    if (selectedColor && typeof onAssign === "function") {
      onAssign(selectedColor.hex);
    }
  };

  const handleSpinAgain = () => {
    setShowResult(false);
    setSelectedColor(null);
    setTargetColor(null);
    setBeePosition({ x: 0, y: -20 });
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
          {showResult ? "Color Selected!" : "Click the bee to claim your monochrome colour!"}
        </div>
        
        {/* Color Wheel */}
        <div
          style={{
            width: 320,
            height: 320,
            margin: "0 auto",
            borderRadius: "50%",
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
            opacity: showResult ? 0.7 : 1,
          }}
        >
          {/* Bee */}
          <div
            onClick={!showResult ? flyToColor : null}
            style={{
              position: "absolute",
              width: "50px",
              height: "50px",
              left: "50%",
              top: "50%",
              transform: `translate(${beePosition.x - 25}px, ${beePosition.y - 25}px)`,
              cursor: flying ? "default" : (showResult ? "default" : "pointer"),
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

          {/* Center circle */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: showResult && selectedColor ? selectedColor.hex : "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: showResult && selectedColor ? 
                (selectedColor.name === "Smoky" || selectedColor.name === "Indigo" ? "#fff" : "#111") : "#111",
              fontWeight: 700,
              position: "relative",
              zIndex: 1,
              opacity: flying ? 0.7 : 1,
              transition: 'all 0.3s ease',
            }}
          >
            <div style={{ transform: 'translateY(18px)', fontSize: showResult ? '12px' : '14px' }}>
              {showResult ? "Selected!" : flying ? "Flying…" : "Click Bee!"}
            </div>
          </div>
        </div>

        {/* Status/Result message */}
        <div style={{ marginTop: 12, minHeight: 20 }}>
          {flying && targetColor && (
            <small>The bee is flying to {targetColor.name}!</small>
          )}
          {!flying && !showResult && (
            <small>Click the bee to choose your color. It will fly to a random color!</small>
          )}
          {showResult && selectedColor && (
            <div>
              <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '10px 0' }}>
                You got <span style={{ color: selectedColor.hex }}>{selectedColor.name}</span>!
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '15px' }}>
                <button
                  onClick={handleSpinAgain}
                  style={{
                    padding: '8px 16px',
                    background: '#c89f94',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  Choose again
                </button>
                <button
                  onClick={handleAcceptColor}
                  style={{
                    padding: '8px 16px',
                    background: '#dfe8d5',
                    color: '#3e342c',
                    border: 'none',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  Keep Color!
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}