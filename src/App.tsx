import React, { useState, useRef, useCallback } from "react";
import "./styles/global.scss";
import "./styles/components.scss";

import { ToolGrid } from "./components/ToolGrid";
import { BrushGrid } from "./components/BrushGrid";
import { Header } from "./components/Header";
import { Properties, PropertiesRef } from "./components/Properties";
import { SettingsPanel } from "./components/SettingsPanel";
import { ToolLibraryModal, EditToolModal, DeleteConfirmationModal } from "./components/ToolModals";
import { UserTool } from "./types/brush";
import { t } from "./i18n";

import { startBrushTracking } from "./api/photoshop";

const App = () => {
  // 状态提升
  const [activeTool, setActiveTool] = useState("brush");
  const propertiesRef = useRef<PropertiesRef>(null);

  // Settings Panel
  const [showSettings, setShowSettings] = useState(false);
  const [displaySettings, setDisplaySettings] = useState(() => {
    const saved = localStorage.getItem("display_settings");
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return { showToolbar: true, showPresets: true, showAdvanced: true };
  });

  // 持久化显示设置
  React.useEffect(() => {
    localStorage.setItem("display_settings", JSON.stringify(displaySettings));
  }, [displaySettings]);

  // View Mode State lifted from BrushGrid
  const [viewMode, setViewMode] = useState<'minimal' | 'detail'>('minimal');

  // ====== 弹窗状态提升到 App 层级 ======
  const [showLibrary, setShowLibrary] = useState(false);
  const [editingTool, setEditingTool] = useState<UserTool | null>(null);
  const [deletingTool, setDeletingTool] = useState<UserTool | null>(null);

  // ToolGrid 回调
  const handleOpenLibrary = useCallback(() => setShowLibrary(true), []);
  const handleEditTool = useCallback((tool: UserTool) => setEditingTool(tool), []);

  // 工具列表状态也提升到 App
  const [tools, setTools] = useState<UserTool[]>(() => {
    const saved = localStorage.getItem("user_custom_tools");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) { console.error("Failed to parse tools", e); }
    }
    // 默认工具
    return [
      { id: "brush", type: "brush", name: "Brush" },
      { id: "eraser", type: "eraser", name: "Eraser" },
      { id: "mixer", type: "mixer", name: "Mixer Brush" },
      { id: "smudge", type: "smudge", name: "Smudge" },
      { id: "pencil", type: "pencil", name: "Pencil" },
      { id: "clone", type: "clone", name: "Clone Stamp" },
    ];
  });

  // 持久化工具列表
  React.useEffect(() => {
    localStorage.setItem("user_custom_tools", JSON.stringify(tools));
  }, [tools]);

  const handleAddTool = useCallback((tool: UserTool) => {
    setTools(prev => [...prev, tool]);
    // 添加后自动打开编辑
    setEditingTool(tool);
  }, []);

  const handleSaveEdit = useCallback((id: string, name: string, color: string) => {
    setTools(prev => prev.map(t => t.id === id ? { ...t, name, color } : t));
    setEditingTool(null);
  }, []);

  // 请求删除 (打开确认框)
  const handleRequestDelete = useCallback((id: string) => {
    const tool = tools.find(t => t.id === id);
    if (tool) {
      setDeletingTool(tool);
    }
  }, [tools]);

  // 确认删除
  const handleConfirmDelete = useCallback(() => {
    if (deletingTool) {
      setTools(prev => prev.filter(t => t.id !== deletingTool.id));
      setDeletingTool(null);
      // 如果正在编辑同一个工具，也关闭编辑框
      if (editingTool?.id === deletingTool.id) {
        setEditingTool(null);
      }
    }
  }, [deletingTool, editingTool]);

  // Load view mode preference
  React.useEffect(() => {
    const savedMode = localStorage.getItem("brush_view_mode");
    if (savedMode === 'detail') {
      setViewMode('detail');
    }
  }, []);

  const toggleViewMode = () => {
    const newMode = viewMode === 'minimal' ? 'detail' : 'minimal';
    setViewMode(newMode);
    localStorage.setItem("brush_view_mode", newMode);
  };

  // 初始化监听
  React.useEffect(() => {
    startBrushTracking((newToolId) => {
      setActiveTool(newToolId);
    });
  }, []);

  // Reorder Tools
  const handleToolReorder = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    
    setTools(prev => {
      const newTools = [...prev];
      const [movedTool] = newTools.splice(fromIndex, 1);
      newTools.splice(toIndex, 0, movedTool);
      return newTools;
    });
  }, []);

  return (
    <>
      <div className="app-container">
        {/* Header */}
        <Header onSettingsClick={() => setShowSettings(true)} />

        {/* Main Content */}
        <main className="app-main">
          {/* 1. Tools Grid */}
          {displaySettings.showToolbar && (
            <div className="section-tools-grid">
               <ToolGrid 
                 activeTool={activeTool} 
                 onSelectTool={setActiveTool} 
                 tools={tools}
                 onOpenLibrary={handleOpenLibrary}
                 onEditTool={handleEditTool}
                 onDeleteTool={handleRequestDelete}
                 onReorder={handleToolReorder}
               />
            </div>
          )}

          {/* 2. Quick Presets */}
          {displaySettings.showPresets && (
            <section className="section-presets">
              <div className="section-header" style={{ marginBottom: "8px", padding: "0 4px" }}>
                <h2>{t("quick_presets", "Quick Presets")}</h2>
                <button 
                  className="btn-manage" 
                  onClick={toggleViewMode}
                  title={viewMode === 'minimal' ? t("view_list", "Switch to List View") : t("view_grid", "Switch to Grid View")}
                >
                   {viewMode === 'minimal' ? (
                     <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                       <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>
                       {t("view_list", "List")}
                     </span>
                   ) : (
                     <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                       <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/></svg> 
                       {t("view_grid", "Grid")}
                     </span>
                   )}
                </button>
              </div>
              <div className="sliders-frame" style={{ padding: "12px" }}>
                 <BrushGrid activeTool={activeTool} viewMode={viewMode} />
              </div>
            </section>
          )}

          {/* 3. Properties */}
          <section className="section-properties">
             <Properties ref={propertiesRef} showAdvanced={displaySettings.showAdvanced} />
          </section>
        </main>
      </div>

      {/* ====== 弹窗渲染在 app-container 之外，避开 overflow 限制 ====== */}
      <ToolLibraryModal 
        isOpen={showLibrary} 
        onClose={() => setShowLibrary(false)} 
        onAddTool={handleAddTool} 
      />
      <EditToolModal 
        tool={editingTool} 
        onClose={() => setEditingTool(null)} 
        onSave={handleSaveEdit} 
        onDelete={handleRequestDelete}
      />
      
      <DeleteConfirmationModal
        isOpen={!!deletingTool}
        tool={deletingTool}
        onClose={() => setDeletingTool(null)}
        onConfirm={handleConfirmDelete}
      />
      
      {/* Settings Panel */}
      {showSettings && (
        <SettingsPanel
          onClose={() => setShowSettings(false)}
          displaySettings={displaySettings}
          onDisplaySettingsChange={setDisplaySettings}
        />
      )}
    </>
  );
};

export default App;
