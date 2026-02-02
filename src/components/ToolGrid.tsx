import React, { useState } from "react";
import { selectTool } from "../api/photoshop";
import { UserTool, TOOL_ICONS } from "./ToolModals";
import { t } from "../i18n";

interface ToolGridProps {
  activeTool: string;
  onSelectTool: (toolId: string) => void;
  tools: UserTool[];
  onOpenLibrary: () => void;
  onEditTool: (tool: UserTool) => void;
  onDeleteTool: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export const ToolGrid: React.FC<ToolGridProps> = ({
  activeTool,
  onSelectTool,
  tools,
  onOpenLibrary,
  onEditTool,
  onDeleteTool,
  onReorder,
}) => {
  // Drag State
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const emptyImageRef = React.useRef<HTMLImageElement>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    if (emptyImageRef.current) {
        e.dataTransfer.setDragImage(emptyImageRef.current, 0, 0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const fromIndex = tools.findIndex(t => t.id === draggedId);
    const toIndex = tools.findIndex(t => t.id === targetId);
    
    if (fromIndex !== -1 && toIndex !== -1) {
      onReorder(fromIndex, toIndex);
    }
    setDraggedId(null);
  };
  const [tooltip, setTooltip] = useState<{show: boolean, x: number, y: number, text: string}>({show: false, x: 0, y: 0, text: ""});
  const [contextMenu, setContextMenu] = useState<{show: boolean, x: number, y: number, tool: UserTool | null}>({show: false, x: 0, y: 0, tool: null});

  const handleSelect = async (userTool: UserTool) => {
    onSelectTool(userTool.id); // 使用 id 而不是 type
    await selectTool(userTool.type); // PS API 仍需要 type
  };

  const handleContextMenu = (e: React.MouseEvent, tool: UserTool) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      tool
    });
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenLibrary();
  };

  // 关闭右键菜单
  React.useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.show) {
        setContextMenu(prev => ({...prev, show: false}));
      }
    };
    if (contextMenu.show) {
      window.addEventListener('click', handleClickOutside);
    }
    return () => window.removeEventListener('click', handleClickOutside);
  }, [contextMenu.show]);

  return (
    <div className="tool-grid">
      {tools.map((tool) => {
        // 使用 tool.id 判断激活状态，而不是 tool.type
        const isActive = activeTool === tool.id; 
        
        // 自定义颜色：如果工具有自定义颜色且不是默认色，则使用该颜色
        const hasCustomColor = tool.color && tool.color !== "#e4e4e7";
        // 激活时也保持自定义颜色，只有没有自定义颜色时激活才变白
        const toolColor = hasCustomColor ? tool.color : (isActive ? "#fff" : undefined);

        return (
          <div
            key={tool.id}
            className={`tool-btn ${isActive ? "active" : ""}`}
            draggable={true}
            onDragStart={(e) => handleDragStart(e, tool.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, tool.id)}
            onClick={() => handleSelect(tool)}
            onContextMenu={(e) => handleContextMenu(e, tool)}
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setTooltip({show: true, x: rect.left, y: rect.bottom + 5, text: tool.name});
            }}
            onMouseLeave={() => setTooltip(prev => ({...prev, show: false}))}
            style={{
              ...(toolColor ? { color: toolColor } : {}),
              opacity: draggedId === tool.id ? 0.4 : 1,
              cursor: "move",
              touchAction: "none" // Prevents scroll/gestures on Pen/Touch
            }}
          >
            {TOOL_ICONS[tool.type] || TOOL_ICONS['brush']}
            
            {/* Remove Button - Top Right */}
            <div 
              className="remove-btn"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteTool(tool.id);
              }}
              title="Delete Tool"
            >
              <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg> 
            </div>
          </div>
        );
      })}

      {/* Add Button */}
      <div 
        className="tool-btn add-btn"
        onClick={handleAddClick}
        title="Add Custom Tool"
        style={{ touchAction: "none" }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
        </svg>
      </div>
      
      {/* Hidden Drag Image Source */}
      <img 
        ref={emptyImageRef} 
        src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        style={{ position: "absolute", top: "-1000px", left: "-1000px", opacity: 0, pointerEvents: "none" }}
        alt="drag-ghost"
      />

      {/* Context Menu - 直接渲染 */}
      {contextMenu.show && contextMenu.tool && (
        <div 
          onClick={e => e.stopPropagation()} 
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            background: '#27272a',
            border: '1px solid #3f3f46',
            borderRadius: '8px',
            padding: '6px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            zIndex: 99999,
            minWidth: '140px'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div 
              onClick={() => {
                if (contextMenu.tool) onEditTool(contextMenu.tool);
                setContextMenu(prev => ({...prev, show: false}));
              }}
              style={{ padding: '8px 12px', cursor: 'pointer', borderRadius: '6px', color: '#e4e4e7', fontSize: '13px', display:'flex', alignItems:'center', gap:'10px' }}
              onMouseEnter={e => e.currentTarget.style.background = '#3f3f46'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" style={{ fill: "currentColor" }}><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.995.995 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
              {t("edit_tool", "Edit Tool")}
            </div>
            <div 
              onClick={() => {
                if (contextMenu.tool) onDeleteTool(contextMenu.tool.id);
                setContextMenu(prev => ({...prev, show: false}));
              }}
              style={{ padding: '8px 12px', cursor: 'pointer', borderRadius: '6px', color: '#ef4444', fontSize: '13px', display:'flex', alignItems:'center', gap:'10px' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" style={{ fill: "currentColor" }}><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
              {t("delete", "Delete")}
            </div>
          </div>
        </div>
      )}
       
      {/* Tooltip */}
      {tooltip.show && (
        <div style={{
          position: "fixed",
          top: tooltip.y,
          left: tooltip.x,
          background: "#18181b",
          color: "#fff",
          padding: "6px 10px",
          borderRadius: "6px",
          fontSize: "12px",
          whiteSpace: "nowrap",
          zIndex: 10000, 
          pointerEvents: "none",
          boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
          border: "1px solid #3f3f46"
        }}>
          {tooltip.text}
        </div>
      )}
    </div>
  );
};
