import React from "react";
import "./SwordLoader.css";

export default function SwordLoader() {
  return (
    <div className="sword-loader-container">
      <div className="sword left-sword">
        <div className="dagas">
          <div className="daga"></div>
          <div className="daga3"></div>
          <div className="base"></div>
          <div className="base3"></div>
        </div>
      </div>
      <div className="sword right-sword">
        <div className="dagas">
          <div className="daga"></div>
          <div className="daga3"></div>
          <div className="base"></div>
          <div className="base3"></div>
        </div>
      </div>
    </div>
  );
}
