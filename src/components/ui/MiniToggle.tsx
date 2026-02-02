/**
 * MiniToggle.tsx
 * 迷你开关组件
 */
import React from "react";

export interface MiniToggleProps {
  isOn: boolean;
  onClick: () => void;
}

export const MiniToggle: React.FC<MiniToggleProps> = ({ isOn, onClick }) => (
  <div 
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    style={{
      width: 28,
      height: 16,
      borderRadius: 8,
      background: isOn ? "#3b82f6" : "#3f3f46",
      position: "relative",
      cursor: "pointer",
      transition: "background 0.2s",
      flexShrink: 0
    }}
  >
    <div style={{
      width: 12,
      height: 12,
      borderRadius: "50%",
      background: "#fff",
      position: "absolute",
      top: 2,
      left: isOn ? 14 : 2,
      transition: "left 0.2s",
      boxShadow: "0 1px 2px rgba(0,0,0,0.3)"
    }} />
  </div>
);

export default MiniToggle;
