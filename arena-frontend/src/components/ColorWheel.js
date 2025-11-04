import React, { useState } from "react";
import axios from "axios";

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
  const [spinning, setSpinning] = useState(false);
  const [selected, setSelected] = useState(null);

  const spin = async () => {
    if (spinning) return;
    setSpinning(true);

    const segments = COLORS.length;
    const chosenIndex = Math.floor(Math.random() * segments);

    // compute rotation so the chosen segment ends at the top (pointer at 0deg).
    const segmentAngle = 360 / segments;
    const halfSeg = segmentAngle / 2;
    // random extra spins for effect
    const extraSpins = 3 + Math.floor(Math.random() * 3); // 3..5 full spins
    // angle that will place the center of chosen segment at top (0deg)
    const targetAlign = 360 - (chosenIndex * segmentAngle + halfSeg);
    const targetRotation = extraSpins * 360 + targetAlign;

    setSelected(chosenIndex);

    // animate rotation by applying inline style to wheel element via id
    const wheel = document.getElementById("arena-color-wheel");
    if (wheel) {
      wheel.style.transition = "transform 4s cubic-bezier(0.1,0.9,0.2,1)";
      wheel.style.transform = `rotate(${targetRotation}deg)`;
    }

    // wait for animation to finish
    const duration = 4200;
    setTimeout(async () => {
      const color = COLORS[chosenIndex].hex;
      setSpinning(false);

      // Save color to backend 
      try {
        
        await axios.post(
          "https://backend.arena.hackclub.com/api/color",
          { color },
          { withCredentials: true }
        );
      } catch (err) {
        console.error("Failed to save color:", err);
        // continue to notify parent even on backend failure
      }

      if (typeof onAssign === "function") onAssign(color);
    }, duration);
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
        }}
      >
        <div style={{ marginBottom: 12, fontSize: 20, fontWeight: 600 }}>
          Spin the colour wheel to claim your monochrome colour
        </div>
        <div
          id="arena-color-wheel"
          onClick={spin}
          style={{
            width: 320,
            height: 320,
            margin: "0 auto",
            borderRadius: "50%",
            cursor: spinning ? "default" : "pointer",
            // create segments with conic-gradient in ROYGBIV order
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
            transition: "transform 4s cubic-bezier(0.1,0.9,0.2,1)",
          }}
        >
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
            }}
          >
            {spinning ? "Spinning…" : "SPIN"}
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <small>Click the wheel to spin. Your colour will appear on the UI.</small>
        </div>
        <div
          style={{
            position: "absolute",
            top: 18,
            left: 18,
            color: "#fff",
            fontSize: 12,
            opacity: 0.9,
          }}
        >
          {/* pointer marker */}
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderBottom: "14px solid #fff",
              marginBottom: 6,
            }}
          />
          <div style={{ fontSize: 11 }}>pointer</div>
        </div>
      </div>
    </div>
  );
}