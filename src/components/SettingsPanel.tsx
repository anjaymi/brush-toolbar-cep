/**
 * SettingsPanel.tsx
 * 设置面板 - 包含存储、显示、调试三个 Tab
 */
import React, { useState, useEffect, useRef } from "react";
import { action } from "photoshop";
import { t } from "../i18n";

type TabId = "storage" | "display" | "debug";

interface SettingsPanelProps {
  onClose: () => void;
  // 显示设置回调
  displaySettings: {
    showToolbar: boolean;
    showPresets: boolean;
    showAdvanced: boolean;
  };
  onDisplaySettingsChange: (settings: SettingsPanelProps["displaySettings"]) => void;
}

// ========== 通用样式 ==========
const btnStyle: React.CSSProperties = {
  backgroundColor: "#3f3f46",
  border: "none",
  color: "#e4e4e7",
  padding: "8px 16px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: 500,
  transition: "all 0.2s"
};

const tabStyle = (active: boolean): React.CSSProperties => ({
  padding: "8px 16px",
  background: active ? "#3b82f6" : "transparent",
  color: active ? "#fff" : "#a1a1aa",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: 500,
  transition: "all 0.2s"
});

// ========== 主组件 ==========
export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  onClose,
  displaySettings,
  onDisplaySettingsChange
}) => {
  const [activeTab, setActiveTab] = useState<TabId>("storage");
  
  // Debug 相关状态
  const [logs, setLogs] = useState<Array<{id: number; event: string; descriptor: any; timestamp: string}>>([]);
  const [isListening, setIsListening] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Debug 日志滚动
  useEffect(() => {
    if (activeTab === "debug") {
      logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, activeTab]);

  // Debug 事件监听
  useEffect(() => {
    if (activeTab !== "debug" || !isListening) return;

    const listener = (event: string, descriptor: any) => {
      setLogs(prev => [...prev.slice(-49), {
        id: Date.now(),
        event,
        descriptor,
        timestamp: new Date().toLocaleTimeString()
      }]);
    };

    action.addNotificationListener(["all"], listener);
    return () => {
      try { action.removeNotificationListener(["all"], listener); } catch {}
    };
  }, [activeTab, isListening]);

  // 导出配置
  // 导出配置
  const handleExport = async () => {
    const config = {
      version: "1.0",
      tools: localStorage.getItem("user_custom_tools"),
      brushPresets: localStorage.getItem("brush_presets"),
      displaySettings
    };
    
    const jsonStr = JSON.stringify(config, null, 2);

    try {
      // @ts-ignore
      const fs = require("uxp").storage.localFileSystem;
      
      const file = await fs.getFileForSaving("brush-toolbar-config.json", {
        types: ["json"]
      });
      
      if (!file) return; // User cancelled

      await file.write(jsonStr);
      alert(t("export_success", "配置已成功导出！"));
      
    } catch (e) {
      console.warn("UXP fs failed, fallback to console:", e);
      // Fallback
      console.log("Export Config:", jsonStr);
      alert(t("export_alert", "无法保存文件（UXP限制？）。配置已导出到控制台。"));
    }
  };

  // 导入配置
  const handleImport = async () => {
    try {
      // @ts-ignore
      const fs = require("uxp").storage.localFileSystem;
      
      const file = await fs.getFileForOpening({
        types: ["json"],
        allowMultiple: false
      });
      
      if (!file) return;

      const text = await file.read();
      const config = JSON.parse(text);
      
      if (config.tools) localStorage.setItem("user_custom_tools", config.tools);
      if (config.brushPresets) localStorage.setItem("brush_presets", config.brushPresets);
      if (config.displaySettings) onDisplaySettingsChange(config.displaySettings);
      
      alert(t("import_success", "配置已导入，请重新加载插件"));

    } catch (e) {
      console.warn("UXP fs failed, fallback to prompt:", e);
      // Fallback
      const input = prompt(t("enter_config", "粘贴配置 JSON:"));
      if (!input) return;
      try {
        const config = JSON.parse(input);
        if (config.tools) localStorage.setItem("user_custom_tools", config.tools);
        if (config.brushPresets) localStorage.setItem("brush_presets", config.brushPresets);
        if (config.displaySettings) onDisplaySettingsChange(config.displaySettings);
        alert(t("import_success", "配置已导入，请重新加载插件"));
      } catch (err) {
        alert(t("import_fail", "导入失败: JSON 格式错误"));
      }
    }
  };

  // 重置默认
  const handleReset = () => {
    if (!confirm(t("confirm_reset", "确定要重置所有设置吗？"))) return;
    localStorage.removeItem("user_custom_tools");
    localStorage.removeItem("brush_presets");
    localStorage.removeItem("brush_view_mode");
    onDisplaySettingsChange({ showToolbar: true, showPresets: true, showAdvanced: true });
    alert(t("reset_success", "设置已重置，请重新加载插件"));
  };

  // Debug: 获取当前参数
  const handleGetOptions = async () => {
    try {
      const result = await action.batchPlay([
        {
          _obj: "get",
          _target: [
            { _ref: "property", _property: "currentToolOptions" },
            { _ref: "application", _enum: "ordinal", _value: "targetEnum" }
          ],
          _options: { dialogOptions: "dontDisplay" }
        },
        {
          _obj: "get",
          _target: [{ _ref: "brush", _enum: "ordinal", _value: "targetEnum" }],
          _options: { dialogOptions: "dontDisplay" }
        }
      ], { synchronousExecution: true });
      
      setLogs(prev => [...prev.slice(-49), {
        id: Date.now(),
        event: "Active Inspect",
        descriptor: { currentToolOptions: result[0], targetBrush: result[1] },
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      backdropFilter: "blur(8px)",
      zIndex: 99999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div className="modal-animate" style={{
        width: "90%",
        maxWidth: "400px",
        maxHeight: "80vh",
        background: "#18181b",
        border: "1px solid #3f3f46",
        borderRadius: "16px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 20px",
          borderBottom: "1px solid #27272a"
        }}>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 600, color: "#fff" }}>
            {t("settings", "Settings")}
          </h2>
          <div onClick={onClose} style={{ cursor: "pointer", color: "#71717a", padding: "4px" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </div>
        </div>

        {/* Tab Bar */}
        <div style={{
          display: "flex",
          gap: "8px",
          padding: "12px 20px",
          borderBottom: "1px solid #27272a",
          background: "#1f1f23"
        }}>
          <button style={tabStyle(activeTab === "storage")} onClick={() => setActiveTab("storage")}>
            {t("storage", "存储")}
          </button>
          <button style={tabStyle(activeTab === "display")} onClick={() => setActiveTab("display")}>
            {t("display", "显示")}
          </button>
          <button style={tabStyle(activeTab === "debug")} onClick={() => setActiveTab("debug")}>
            {t("debug", "调试")}
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          
          {/* Tab: Storage */}
          {activeTab === "storage" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <p style={{ color: "#a1a1aa", fontSize: "13px", margin: "0 0 8px 0" }}>
                {t("storage_desc", "导入/导出工具和预设配置")}
              </p>
              <button style={btnStyle} onClick={handleExport}>
                📤 {t("export_config", "导出配置")}
              </button>
              <button style={btnStyle} onClick={handleImport}>
                📥 {t("import_config", "导入配置")}
              </button>
              <div style={{ borderTop: "1px solid #27272a", marginTop: "8px", paddingTop: "16px" }}>
                <button 
                  style={{ ...btnStyle, background: "#7f1d1d", color: "#fecaca" }} 
                  onClick={handleReset}
                >
                  🔄 {t("reset_default", "重置为默认")}
                </button>
              </div>
            </div>
          )}

          {/* Tab: Display */}
          {activeTab === "display" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <p style={{ color: "#a1a1aa", fontSize: "13px", margin: 0 }}>
                {t("display_desc", "选择显示哪些功能区块")}
              </p>
              
              <ToggleRow 
                label={t("show_toolbar", "工具栏")}
                description={t("show_toolbar_desc", "快捷工具切换按钮")}
                checked={displaySettings.showToolbar}
                onChange={(v) => onDisplaySettingsChange({ ...displaySettings, showToolbar: v })}
              />
              <ToggleRow 
                label={t("show_presets", "快捷预设")}
                description={t("show_presets_desc", "笔刷预设列表")}
                checked={displaySettings.showPresets}
                onChange={(v) => onDisplaySettingsChange({ ...displaySettings, showPresets: v })}
              />
              <ToggleRow 
                label={t("show_advanced", "高级属性")}
                description={t("show_advanced_desc", "流量、硬度、间距等高级滑块")}
                checked={displaySettings.showAdvanced}
                onChange={(v) => onDisplaySettingsChange({ ...displaySettings, showAdvanced: v })}
              />
            </div>
          )}

          {/* Tab: Debug */}
          {activeTab === "debug" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button 
                  style={{ ...btnStyle, background: isListening ? "#166534" : "#3f3f46" }}
                  onClick={() => setIsListening(!isListening)}
                >
                  {isListening ? `🔴 ${t("stop_listen", "停止监听")}` : `▶️ ${t("start_listen", "开始监听")}`}
                </button>
                <button style={{ ...btnStyle, background: "#1e40af" }} onClick={handleGetOptions}>
                  ⏬ {t("get_props", "获取当前参数")}
                </button>
                <button 
                  style={{ ...btnStyle, background: "#065f46" }} 
                  onClick={() => {
                    const text = logs.map(l => JSON.stringify(l.descriptor, null, 2)).join("\n\n");
                    navigator.clipboard.writeText(text).then(() => {
                      alert(t("copy_success", "已复制到剪贴板"));
                    }).catch(() => {
                      // Fallback for UXP
                      console.log("Copy content:", text);
                      alert(t("copy_fail", "复制失败，内容已输出到控制台"));
                    });
                  }}
                >
                  📋 {t("copy", "复制")}
                </button>
                <button style={btnStyle} onClick={() => setLogs([])}>
                  🗑️ {t("clear", "清除")}
                </button>
              </div>
              
              <div style={{
                background: "#0f0f0f",
                border: "1px solid #27272a",
                borderRadius: "8px",
                padding: "12px",
                maxHeight: "300px",
                overflowY: "auto",
                fontFamily: "monospace",
                fontSize: "11px"
              }}>
                {logs.length === 0 && (
                  <div style={{ color: "#52525b", textAlign: "center" }}>
                    {t("debug_empty", "点击'开始监听'捕获 Photoshop 事件")}
                  </div>
                )}
                {logs.map(log => (
                  <div key={log.id} style={{ marginBottom: "8px", borderBottom: "1px solid #27272a", paddingBottom: "8px" }}>
                    <div style={{ color: "#71717a", marginBottom: "4px" }}>
                      [{log.timestamp}] <span style={{ color: "#60a5fa" }}>{log.event}</span>
                    </div>
                    <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all", color: "#a3e635", fontSize: "10px" }}>
                      {JSON.stringify(log.descriptor, null, 2)}
                    </pre>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ========== Toggle Row 子组件 ==========
const ToggleRow: React.FC<{
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}> = ({ label, description, checked, onChange }) => (
  <div style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    background: "#27272a",
    borderRadius: "8px"
  }}>
    <div>
      <div style={{ color: "#e4e4e7", fontSize: "14px", fontWeight: 500 }}>{label}</div>
      <div style={{ color: "#71717a", fontSize: "12px", marginTop: "2px" }}>{description}</div>
    </div>
    <div 
      onClick={() => onChange(!checked)}
      style={{
        width: "40px",
        height: "22px",
        borderRadius: "11px",
        background: checked ? "#3b82f6" : "#3f3f46",
        position: "relative",
        cursor: "pointer",
        transition: "background 0.2s"
      }}
    >
      <div style={{
        width: "18px",
        height: "18px",
        borderRadius: "50%",
        background: "#fff",
        position: "absolute",
        top: "2px",
        left: checked ? "20px" : "2px",
        transition: "left 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.3)"
      }} />
    </div>
  </div>
);
