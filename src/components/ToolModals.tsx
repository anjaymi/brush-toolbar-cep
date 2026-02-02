import React, { useState } from "react";
import { selectTool } from "../api/photoshop";
import { t } from "../i18n";

import { UserTool } from "../types/brush";

// 基础工具定义移入组件内以支持动态多语言

// 图标颜色
export const ICON_COLORS = [
  "#e4e4e7", "#ef4444", "#f97316", "#eab308",
  "#22c55e", "#06b6d4", "#3b82f6", "#a855f7", "#ec4899",
];

// 工具图标
export const TOOL_ICONS: Record<string, React.ReactNode> = {
  brush: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34a.996.996 0 0 0-1.41 0L9 12.25 11.75 15l8.96-8.96c.39-.39.39-1.02 0-1.41z"/>
    </svg>
  ),
  eraser: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.14 3c-.51 0-1.02.2-1.41.59L2.59 14.73c-.78.77-.78 2.04 0 2.83L5.17 20c.39.39.9.59 1.41.59h13.33V18h-6.32l8.49-8.49c.78-.78.78-2.05 0-2.83l-2.52-2.52c-.4-.39-.91-.59-1.42-.59zM9 16.17L6.83 14 15.14 5.69 17.31 7.86 9 16.17z"/>
    </svg>
  ),
  mixer: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8zm0 18c-3.35 0-6-2.57-6-6.2 0-2.34 1.95-5.44 6-9.14 4.05 3.7 6 6.8 6 9.14 0 3.63-2.65 6.2-6 6.2z"/>
    </svg>
  ),
  smudge: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 13c1.1-3.5 6.5-5.91 7.84-2.19.78 2.14-.94 4.19-3.34 4.19H5.06c-1.39 0-1.74-2-.41-2.61.88-.41 2.28-.93 4.35.61z"/>
    </svg>
  ),
  pencil: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.995.995 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
    </svg>
  ),
  clone: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 6h-2c0-2.21-1.79-4-4-4S9 3.79 9 6H7c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM13 4c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm0 12c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
    </svg>
  ),
};

// ========== 工具库弹窗组件 ==========
interface ToolLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTool: (tool: UserTool) => void;
}

export const ToolLibraryModal: React.FC<ToolLibraryModalProps> = ({
  isOpen,
  onClose,
  onAddTool,
}) => {
  if (!isOpen) return null;

  // 动态获取工具列表以支持多语言
  const baseTools = [
    { type: "brush", name: t("tool_brush", "Brush") },
    { type: "eraser", name: t("tool_eraser", "Eraser") },
    { type: "mixer", name: t("tool_mixer", "Mixer Brush") },
    { type: "smudge", name: t("tool_smudge", "Smudge") },
    { type: "pencil", name: t("tool_pencil", "Pencil") },
    { type: "clone", name: t("tool_clone", "Clone Stamp") },
  ];

  const handleAddTool = (baseType: string) => {
    const base = baseTools.find(b => b.type === baseType);
    if (!base) return;

    const newTool: UserTool = {
      id: `${baseType}-${Date.now()}`,
      type: baseType,
      name: base.name,
      color: "#e4e4e7"
    };

    onAddTool(newTool);
    onClose();
  };

  return (
    <div 
      style={{
        position: 'absolute', 
        top: 0, left: 0, 
        width: '100vw', height: '100vh', // 使用 vw/vh 而不是 %
        zIndex: 99999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.7)', 
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="modal-animate"
        style={{
          width: '300px', 
          background: '#18181b', 
          border: '1px solid #3f3f46',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)',
        }}
      >
        {/* 标题栏 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#fff' }}>{t("add_tool", "Add Tool")}</h3>
          <div 
            onClick={onClose}
            style={{ cursor: 'pointer', color: '#71717a', padding: '4px' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </div>
        </div>
        
        {/* 工具网格 - 使用 flex wrap 替代 grid */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
          {baseTools.map(b => (
            <div 
              key={b.type}
              onClick={() => handleAddTool(b.type)}
              style={{
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: '80px',
                background: '#27272a',
                border: '1px solid #3f3f46',
                borderRadius: '12px',
                padding: '12px 8px',
                cursor: 'pointer',
                color: '#a1a1aa'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.background = '#3f3f46';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#3f3f46';
                e.currentTarget.style.color = '#a1a1aa';
                e.currentTarget.style.background = '#27272a';
              }}
            >
              <div style={{ marginBottom: '6px', width: '24px', height: '24px', color: 'inherit', fill: '#a1a1aa' }}>{TOOL_ICONS[b.type]}</div>
              <span style={{ fontSize: '11px', fontWeight: 500, textAlign: 'center' }}>{b.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ========== 编辑工具弹窗组件 ==========
interface EditToolModalProps {
  tool: UserTool | null;
  onClose: () => void;
  onSave: (id: string, name: string, color: string) => void;
  onDelete?: (id: string) => void;
}

export const EditToolModal: React.FC<EditToolModalProps> = ({
  tool,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState(tool?.name || "");
  const [color, setColor] = useState(tool?.color || "#e4e4e7");

  // Reset when tool changes
  React.useEffect(() => {
    if (tool) {
      setName(tool.name);
      setColor(tool.color || "#e4e4e7");
    }
  }, [tool]);

  if (!tool) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSave(tool.id, name, color);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      style={{
        position: 'absolute', 
        top: 0, left: 0, 
        width: '100%', height: '100%',
        zIndex: 99999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.7)', 
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div 
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        className="modal-animate"
        style={{
          width: '280px', 
          background: '#18181b', 
          border: '1px solid #3f3f46', 
          borderRadius: '16px',
          padding: '24px', 
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
        }}
      >
        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600, color: '#fff' }}>{t("customize_tool", "Customize Tool")}</h3>
        
        {/* Name Input */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#a1a1aa', marginBottom: '8px' }}>{t("tool_name", "Tool Name")}</label>
          <input 
            type="text" 
            value={name}
            onChange={e => setName(e.target.value)}
            style={{
              width: '100%',
              background: "#27272a", 
              border: "1px solid #3f3f46",
              color: "#fff",
              padding: "8px 10px",
              borderRadius: "6px",
              fontSize: "14px",
              outline: "none",
              boxSizing: 'border-box'
            }}
            autoFocus
          />
        </div>

        {/* Color Swatches */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#a1a1aa', marginBottom: '8px' }}>{t("icon_color", "Icon Color")}</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {ICON_COLORS.map(c => (
              <div 
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: c,
                  cursor: "pointer",
                  border: color === c ? "2px solid #fff" : "2px solid transparent",
                  boxShadow: color === c ? `0 0 0 2px ${c}` : "none",
                }}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.05)", gap: "8px" }}>
          {onDelete && (
             <button
               onClick={() => onDelete(tool.id)}
               style={{
                 background: "transparent",
                 border: "1px solid #7f1d1d",
                 color: "#ef4444",
                 fontSize: "12px",
                 borderRadius: "6px",
                 padding: "6px 8px",
                 cursor: "pointer",
                 flex: "0 1 auto",
                 minWidth: "60px",
                 whiteSpace: "nowrap"
               }}
               onMouseEnter={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"}
               onMouseLeave={e => e.currentTarget.style.background = "transparent"}
             >
               {t("delete", "Delete")}
             </button>
          )}
          
          <div style={{ display: "flex", gap: "6px", flex: "1", justifyContent: "flex-end" }}>
            <button 
              onClick={onClose}
              style={{
                background: "transparent",
                border: "1px solid #3f3f46",
                color: "#e4e4e7",
                fontSize: "12px",
                borderRadius: "6px",
                padding: "6px 8px",
                cursor: "pointer",
                flex: "1",
                maxWidth: "75px",
                whiteSpace: "nowrap"
              }}
            >
              {t("cancel", "Cancel")}
            </button>
            <button 
              onClick={() => onSave(tool.id, name, color)}
              style={{
                background: "#3b82f6",
                border: "none",
                color: "#fff",
                fontSize: "12px",
                fontWeight: 600,
                borderRadius: "6px",
                padding: "6px 12px",
                cursor: "pointer",
                flex: "1",
                maxWidth: "75px",
                whiteSpace: "nowrap"
              }}
            >
              {t("save", "Save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========== 二次确认弹窗 ==========
interface DeleteConfirmationModalProps {
  tool: UserTool | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  tool,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !tool) return null;

  return (
    <div 
      style={{
        position: 'absolute', 
        top: 0, left: 0, 
        width: '100%', height: '100%',
        zIndex: 100000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.8)', 
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="modal-animate"
        style={{
          width: '320px', 
          background: '#18181b', 
          border: '1px solid #7f1d1d', // Red border for danger
          borderRadius: '16px',
          padding: '24px', 
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)',
          textAlign: 'center'
        }}
      >
        <div style={{ 
          width: '48px', height: '48px', 
          background: 'rgba(239, 68, 68, 0.1)', 
          borderRadius: '50%', 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px auto',
          color: '#ef4444'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
        </div>

        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600, color: '#fff' }}>{t("delete_tool_confirm", "Delete Tool?")}</h3>
        <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#a1a1aa', lineHeight: 1.5 }}>
          {t("delete_desc_prefix", "Are you sure you want to delete \"")}<span style={{color:'#fff', fontWeight:600}}>{tool.name}</span>{t("delete_desc_suffix", "\"? This action cannot be undone.")}
        </p>
        
        <div style={{ display: "flex", gap: "10px", justifyContent: 'center' }}>
          <button 
            onClick={onClose}
            style={{
              flex: 1,
              background: "transparent",
              border: "1px solid #3f3f46",
              color: "#e4e4e7",
              fontSize: "14px",
              borderRadius: "8px",
              padding: "10px",
              cursor: "pointer",
            }}
          >
            {t("cancel", "Cancel")}
          </button>
          <button 
            onClick={onConfirm}
            style={{
              flex: 1,
              background: "#ef4444",
              border: "none",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 600,
              borderRadius: "8px",
              padding: "10px",
              cursor: "pointer",
            }}
          >
            {t("delete", "Delete")}
          </button>
        </div>
      </div>
    </div>
  );
};
