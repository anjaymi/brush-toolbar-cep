/**
 * CollapsibleSection.tsx
 * 可折叠区域组件
 */
import React, { useState } from "react";
import { MiniToggle } from "./MiniToggle";

export interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ 
  title, 
  defaultOpen = true, 
  children 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div 
      className="sliders-frame" 
      style={{ 
        marginBottom: "8px", 
        paddingBottom: isOpen ? "12px" : "0",
      }}
    >
      {/* Section Header */}
      <div 
        className="section-header" 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 12px",
          cursor: "pointer",
          userSelect: "none",
          borderBottom: isOpen ? "1px solid rgba(255,255,255,0.05)" : "none"
        }}
      >
        <span style={{ fontSize: "12px", fontWeight: 600, color: "#d4d4d8", letterSpacing: "0.3px" }}>
          {title}
        </span>
        
        <MiniToggle isOn={isOpen} onClick={() => setIsOpen(!isOpen)} />
      </div>

      {/* Content */}
      {isOpen && (
        <div style={{ padding: "12px 12px 4px 12px" }}>
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection;
