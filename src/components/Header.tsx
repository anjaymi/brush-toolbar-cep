import React from "react";
import { t } from "../i18n";

interface HeaderProps {
  onSettingsClick?: () => void;
  title?: string;
  isPro?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  onSettingsClick,
  title, // Default logic moved inside to use hook
  isPro = true
}) => {
  const displayTitle = title || t("app_title", "Meow Brush Favorites");
  return (
    <header className="app-header">
      <h1 className="app-title">
        <svg viewBox="0 0 24 24" width="20" height="20" style={{ marginRight: 8, fill: "#3b82f6" }}>
           <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8zm-5-9c.83 0 1.5-.67 1.5-1.5S7.83 8 7 8s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm10 0c.83 0 1.5-.67 1.5-1.5S16.17 8 15.33 8s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm-5 4c2.33 0 4.31-1.46 5.11-3.5h-10.22c.8 2.04 2.78 3.5 5.11 3.5z"/>
        </svg>
        {displayTitle} 
        {isPro && <span className="pro-badge" style={{ fontSize: "9px" }}>0.9 beta</span>}
      </h1>
      <div 
        onClick={onSettingsClick}
        title={t("settings", "Settings")}
        style={{
          width: 36,
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          borderRadius: 99,
          background: "transparent"
        }}
      >
        <svg 
          viewBox="0 0 24 24" 
          style={{ 
            width: 20, 
            height: 20, 
            display: "block",
            fill: "#a1a1aa"
          }}
        >
          <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.488.488 0 0 0-.59.22L2.68 9.47a.49.49 0 0 0 .12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 0 0-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
        </svg>
      </div>
    </header>
  );
};
