import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom"; // Import ReactDOM
import { getCurrentBrushInfo, selectBrushByName } from "../api/photoshop";
// ... (imports remain)

import { t } from "../i18n";
import { BRUSH_ICONS, ICON_GROUPS } from "./icons";
import { FavoriteBrush } from "../types/brush";

const TAG_COLORS = [
  "#cccccc", // Default
  "#ff5f5f", // Red
  "#ffaa5f", // Orange
  "#f5d76e", // Yellow
  "#8cd790", // Green
  "#4db6ac", // Cyan
  "#77bdfb", // Blue
  "#ba68c8", // Purple
];

interface BrushGridProps {
  activeTool?: string;
  viewMode: 'minimal' | 'detail';
}

export const BrushGrid: React.FC<BrushGridProps> = ({ activeTool = "brush", viewMode }) => {
  const [favorites, setFavorites] = useState<FavoriteBrush[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<string | null>(null);
  
  // Modal State
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [pendingBrush, setPendingBrush] = useState<{name: string, type: 'brush' | 'toolPreset'} | null>(null);
  const [selectedTagColor, setSelectedTagColor] = useState<string>("#cccccc");
  
  // Global Tooltip State (Fix for overflow clipping)
  const [tooltip, setTooltip] = useState<{show: boolean, x: number, y: number, text: string}>({show: false, x: 0, y: 0, text: ""});

  // 加载收藏
  useEffect(() => {
    try {
      const saved = localStorage.getItem("brush_favorites");
      if (saved) {
        setFavorites(JSON.parse(saved));
      } else {
        setFavorites([]);
      }
    } catch (e) {
      console.error("Load data failed:", e);
    }
  }, []);

  // 保存收藏
  const saveFavorites = (list: FavoriteBrush[]) => {
    localStorage.setItem("brush_favorites", JSON.stringify(list));
    setFavorites(list);
  };
  
  // Drag and Drop State
  const [draggedId, setDraggedId] = useState<string | null>(null);
  // Swap State
  const [swapSourceId, setSwapSourceId] = useState<string | null>(null);
  
  // Drag Image Ref
  const emptyImageRef = React.useRef<HTMLImageElement>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    
    // Use the DOM element for DnD ghost
    if (emptyImageRef.current) {
        e.dataTransfer.setDragImage(emptyImageRef.current, 0, 0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const dragIndex = favorites.findIndex(f => f.id === draggedId);
    const targetIndex = favorites.findIndex(f => f.id === targetId);
    
    if (dragIndex === -1 || targetIndex === -1) return;

    // Reorder
    const newFavorites = [...favorites];
    const [movedItem] = newFavorites.splice(dragIndex, 1);
    newFavorites.splice(targetIndex, 0, movedItem);
    
    saveFavorites(newFavorites);
    setDraggedId(null);
  };

  // 添加收藏 - 第一步: 确认名称
  const handleAddStart = async () => {
    const info = await getCurrentBrushInfo();
    
    if (!info) {
      alert(t("no_brush_detected", "请先在 Photoshop 画笔面板中点击选中一个笔刷，然后再添加收藏。"));
      return;
    }

    const defaultName = info.name;
    const name = prompt(t("enter_name", "请输入预设名称 (需与 PS 预设一致):"), defaultName);
    
    if (name) {
      setPendingBrush({
        name: name,
        type: info.type
      });
      setSelectedTagColor("#cccccc"); // Reset color
      setShowIconPicker(true);
    }
  };

  // 添加收藏 - 第二步: 选择图标并保存
  const handleAddConfirm = (iconKey: string) => {
    if (pendingBrush) {
      const newFav: FavoriteBrush = {
        id: Date.now().toString(),
        name: pendingBrush.name,
        type: pendingBrush.type,
        iconKey: iconKey,
        color: selectedTagColor,
        toolId: activeTool // Save current tool context
      };
      saveFavorites([...favorites, newFav]);
      setShowIconPicker(false);
      setPendingBrush(null);
    }
  };

  // Remove fn
  const removeFavorite = (id: string) => {
    if (confirm(t("confirm_remove", "确定要删除此收藏吗？"))) {
      const newList = favorites.filter((item) => item.id !== id);
      saveFavorites(newList);
      if (selectedIndex === id) setSelectedIndex(null);
    }
  };

  // 选择收藏 (Updated for Swap Mode)
  const handleSelect = async (fav: FavoriteBrush) => {
    // 1. Swap Mode Logic
    if (swapSourceId) {
      if (swapSourceId === fav.id) {
        // Clicked itself: Cancel swap
        setSwapSourceId(null);
      } else {
        // Clicked target: Perform swap
        const sourceIndex = favorites.findIndex(f => f.id === swapSourceId);
        const targetIndex = favorites.findIndex(f => f.id === fav.id);

        if (sourceIndex !== -1 && targetIndex !== -1) {
             const newFavorites = [...favorites];
             // Swap elements
             const temp = newFavorites[sourceIndex];
             newFavorites[sourceIndex] = newFavorites[targetIndex];
             newFavorites[targetIndex] = temp;
             
             saveFavorites(newFavorites);
        }
        setSwapSourceId(null);
      }
      return; 
    }

    setSelectedIndex(fav.id);
    await selectBrushByName(fav.name, fav.type || 'brush');
  };
  
  return (
    <>
      {/* Scrollable Grid */}
      <div 
        className="brush-grid"
        style={{ 
          width: "100%",
          padding: "8px", 
          borderTop: "none",
          display: "flex",
          flexWrap: 'wrap',
          gap: "4px",
          alignContent: "flex-start",
          overflowY: "auto",
          /* Dynamic Height Logic */
          maxHeight: "220px", 
          minHeight: "80px",
          flexShrink: 0
        }}
      >
          {favorites.filter(f => (f.toolId || "brush") === activeTool).length === 0 ? (
            <div className="brush-grid-empty" style={{ width: "100%", textAlign: "center", padding: "20px" }}>
              <p>{t("no_favorites", "暂无收藏。请在 PS 选中笔刷后点击 + 号添加。")}</p>
              <p style={{fontSize: "10px", marginTop: "4px", opacity: 0.6}}>
                ({t("current_tool", "Current Tool")}: {activeTool})
              </p>
            </div>
          ) : (
            favorites
              .filter(fav => (fav.toolId || "brush") === activeTool)
              .map((fav) => {
               const isDragging = draggedId === fav.id;
               const isSwapSource = swapSourceId === fav.id;

               return (
              <div
                key={fav.id}
                className={`brush-item ${selectedIndex === fav.id ? "active" : ""} ${viewMode}`}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, fav.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, fav.id)}
                onClick={() => handleSelect(fav)}
                onContextMenu={(e) => {
                  e.preventDefault(); 
                  e.stopPropagation();
                  setSwapSourceId(fav.id); // Trigger Swap Mode
                }}
                style={{
                  opacity: isDragging ? 0.4 : 1,
                  cursor: "move",
                  touchAction: "none", 
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  // @ts-ignore
                  WebkitUserDrag: "element",
                  // Swap Mode Highlight
                  border: isSwapSource ? "2px solid #ff5f5f" : undefined,
                  animation: isSwapSource ? "pulse 1s infinite" : undefined
                }}
                onMouseEnter={(e) => {
                  if (viewMode === 'minimal') {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({
                          show: true,
                          x: rect.left, 
                          y: rect.top - 5, 
                          text: fav.name
                      });
                  }
                }}
                onMouseLeave={() => setTooltip(prev => ({...prev, show: false}))}
              >
                {viewMode === 'detail' ? (
                  <>
                     {/* Name - Full Text, CSS handles truncation */}
                     <span className="brush-name" role="name-label" title={fav.name}>
                       {fav.name}
                     </span>
                     
                     {/* Small Icon */}
                     <div style={{ opacity: selectedIndex === fav.id ? 1 : 0.8, display: "flex", alignItems: "center", marginLeft: "8px" }}>
                      {fav.iconKey && BRUSH_ICONS[fav.iconKey] ? (
                         <svg className="uxp-icon" viewBox="0 0 24 24" width="14" height="14" style={{ 
                           width: "14px", height: "14px",
                           color: selectedIndex === fav.id ? "#fff" : (fav.color || '#888') 
                         }}>
                           <path d={BRUSH_ICONS[fav.iconKey]} fill="currentColor" />
                         </svg>
                      ) : (
                         <span style={{ 
                           fontSize: '11px', 
                           fontWeight: 'bold', 
                           color: selectedIndex === fav.id ? "#fff" : (fav.color || '#888') 
                         }}>
                           {fav.name.charAt(0).toUpperCase()}
                         </span>
                      )}
                     </div>
                  </>
                ) : (
                  <div className="brush-preview">
                     {fav.iconKey && BRUSH_ICONS[fav.iconKey] ? (
                        <svg className="uxp-icon" viewBox="0 0 24 24" style={{ 
                          width: "24px", height: "24px",
                          color: selectedIndex === fav.id ? "#fff" : (fav.color || '#888') 
                        }}>
                          <path d={BRUSH_ICONS[fav.iconKey]} fill="currentColor" />
                        </svg>
                     ) : (
                       <span style={{ 
                         fontSize: '12px', 
                         fontWeight: 'bold', 
                         color: selectedIndex === fav.id ? "#fff" : (fav.color || '#888') 
                       }}>
                         {fav.name.substring(0, 2)}
                       </span>
                     )}
                  </div>
                )}

                {/* Remove Button (Hover only) - Integrated into top-right */}
                <div 
                  className="remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFavorite(fav.id);
                  }}
                  title={t("remove_favorite", "删除")}
                >
                  <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </div>
              </div>
            );
          })
          )}
          
          {/* Add Button as last item in grid */}
          <div 
            className={`brush-item add-btn ${viewMode}`} 
            style={{ 
              border: "1px dashed #555",
              background: "rgba(255,255,255,0.05)",
              justifyContent: "center"
            }} 
            onClick={handleAddStart}
            title={t("add_favorite", "添加收藏")}
          >
             <span style={{ fontSize: "16px", color: "#888" }}>+</span>
          </div>

      </div>
      
      {/* Global Tooltip Portal */}
      {tooltip.show && ReactDOM.createPortal(
        <div style={{
          position: "fixed",
          top: tooltip.y,
          left: tooltip.x,
          transform: "translate(0, -100%)", // Move up above the cursor/item
          background: "#333",
          color: "#fff",
          padding: "4px 8px",
          borderRadius: "4px",
          fontSize: "11px",
          whiteSpace: "nowrap",
          zIndex: 99999,
          pointerEvents: "none",
          boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
          border: "1px solid #555"
        }}>
          {tooltip.text}
          {/* Arrow */}
          <div style={{
            position: "absolute",
            top: "100%",
            left: "10px", // Align arrow to left side
            marginLeft: "0",
            borderWidth: "4px",
            borderStyle: "solid",
            borderColor: "#333 transparent transparent transparent"
          }}></div>
        </div>,
        document.body
      )}

      {/* 图标选择器弹窗 */}
      {showIconPicker && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.8)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div className="modal-animate" style={{
            background: "#2b2b2b", padding: "16px", borderRadius: "8px",
            border: "1px solid #444", width: "280px", maxHeight: "80%", display: "flex", flexDirection: "column"
          }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#ddd" }}>{t("select_icon", "选择图标")}</h3>
            
            {/* Color Picker */}
            <div style={{ marginBottom: "12px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {TAG_COLORS.map(color => (
                <div
                  key={color}
                  onClick={() => setSelectedTagColor(color)}
                  style={{
                    width: "24px", height: "24px", borderRadius: "50%", background: color,
                    border: selectedTagColor === color ? "2px solid #fff" : "1px solid #555",
                    cursor: "pointer",
                    boxSizing: "border-box"
                  }}
                ></div>
              ))}
            </div>

            <div style={{ flex: 1, overflowY: "auto", paddingRight: "8px" }}> {/* Added paddingRight for scrollbar */}
              {/* Default option: Use first letter of name */}
              <div style={{ marginBottom: "12px" }}>
                <h4 style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#888", borderBottom: "1px solid #444", paddingBottom: "4px" }}>
                  {t("default_icon_options", "默认选项")}
                </h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  <div 
                    onClick={() => handleAddConfirm("")}
                    style={{
                      width: "40px", height: "40px", background: "#3a3a3a", borderRadius: "4px",
                      display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "1px solid #555"
                    }}
                    title="Use Letter"
                  >
                    <span style={{color: selectedTagColor}}>T</span>
                  </div>
                </div>
              </div>

              {Object.entries(ICON_GROUPS).map(([groupName, keys]) => (
                <div key={groupName} style={{ marginBottom: "12px" }}>
                  <h4 style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#888", borderBottom: "1px solid #444", paddingBottom: "4px" }}>
                    {groupName}
                  </h4>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {keys.map(key => {
                      const path = BRUSH_ICONS[key];
                      if (!path) return null;
                      return (
                        <div 
                          key={key}
                          onClick={() => handleAddConfirm(key)}
                          style={{
                            width: "40px", height: "40px", background: "#3a3a3a", borderRadius: "4px",
                            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "1px solid #555"
                          }}
                          title={key}
                        >
                           <svg 
                             className="uxp-icon"
                             viewBox="0 0 24 24" 
                             width="24"
                             height="24"
                             style={{ width: '20px', height: '20px', color: selectedTagColor }}
                           >
                             <path d={path} fill="currentColor" />
                           </svg>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => { setShowIconPicker(false); setPendingBrush(null); }}
              style={{ marginTop: "12px", border: "none", background: "#444", color: "#fff", padding: "6px", borderRadius: "4px", cursor: "pointer" }}
            >
              {t("cancel", "取消")}
            </button>
          </div>
        </div>
      )}
      {/* Hidden Drag Image Source */}
      <img 
        ref={emptyImageRef} 
        src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        style={{ position: "absolute", top: "-1000px", left: "-1000px", opacity: 0, pointerEvents: "none" }}
        alt="drag-ghost"
      />
    </>
  );
};
