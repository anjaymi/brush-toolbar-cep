/**
 * 轻量级 i18n 国际化模块
 * 自动检测语言并提供翻译函数
 */

// 1. Definition of Translation Dictionaries
const locales: Record<string, Record<string, string>> = {
  en: {
    "size": "Size",
    "opacity": "Opacity",
    "flow": "Flow",
    "hardness": "Hardness",
    "spacing": "Spacing",
    "sync": "Sync",
    "add_favorite": "Add Favorite",
    "enter_name": "Enter preset name:",
    "remove_favorite": "Remove",
    "no_favorites": "No favorites yet. Select a brush and click + to add.",
    "confirm_remove": "Remove this brush?",
    "add_tool": "Add Tool",
    "edit_tool": "Edit Tool",
    "customize_tool": "Customize Tool",
    "tool_name": "Tool Name",
    "icon_color": "Icon Color",
    "delete": "Delete",
    "cancel": "Cancel",
    "save": "Save",
    "delete_tool_confirm": "Delete Tool?",
    "delete_desc_prefix": "Are you sure you want to delete \"",
    "delete_desc_suffix": "\"? This action cannot be undone.",
    "settings": "Settings",
    "storage": "Storage",
    "display": "Display",
    "debug": "Debug",
    "export_config": "Export Config",
    "import_config": "Import Config",
    "reset_default": "Reset to Default",
    "storage_desc": "Import/Export tools and presets",
    "display_desc": "Choose which sections to show",
    "show_toolbar": "Toolbar",
    "show_toolbar_desc": "Quick tool switcher",
    "show_presets": "Quick Presets",
    "show_presets_desc": "Brush preset list",
    "show_advanced": "Advanced Properties",
    "show_advanced_desc": "Flow, Hardness, Spacing sliders",
    "start_listen": "Start Listening",
    "stop_listen": "Stop Listening",
    "get_props": "Get Properties",
    "copy": "Copy",
    "clear": "Clear",
    "debug_empty": "Click 'Start Listening' to capture events",
    "basic": "Basic",
    "advanced": "Advanced",
    "shapeDynamics": "Shape Dynamics",
    "sizeJitter": "Size Jitter",
    "minDiameter": "Min Diameter",
    "angleJitter": "Angle Jitter",
    "roundnessJitter": "Roundness Jitter",
    "minRoundness": "Min Roundness",
    "no_brush_detected": "Please select a brush in Photoshop first.",
    "select_icon": "Select Icon",
    "default_icon_options": "Default Options",
    "confirm_reset": "Are you sure you want to reset all settings?",
    "reset_success": "Settings reset. Please reload the plugin.",
    "import_success": "Configuration imported. Please reload.",
    "import_fail": "Import failed: Invalid JSON",
    "export_alert": "Config exported to console (UXP restriction)",
    "copy_success": "Copied to clipboard",
    "copy_fail": "Copy failed, output to console",
    "enter_config": "Paste config JSON:",
    "tool_brush": "Brush",
    "tool_eraser": "Eraser",
    "tool_mixer": "Mixer Brush",
    "tool_smudge": "Smudge",
    "tool_pencil": "Pencil",
    "tool_clone": "Clone Stamp",
    "current_tool": "Current Tool",
    "quick_presets": "Quick Presets",
    "view_list": "List",
    "view_grid": "Grid",
    "export_success": "Configuration exported successfully!",
    "app_title": "Meow Brush Favorites"
  },
  zh: {
    "size": "大小",
    "opacity": "不透明度",
    "flow": "流量",
    "hardness": "硬度",
    "spacing": "间距",
    "sync": "同步",
    "add_favorite": "添加收藏",
    "enter_name": "请输入预设名称 (需与 PS 预设一致):",
    "remove_favorite": "删除",
    "no_favorites": "暂无收藏。请在 PS 选中笔刷后点击 + 号添加。",
    "confirm_remove": "确定删除此笔刷收藏？",
    "add_tool": "添加工具",
    "edit_tool": "编辑工具",
    "customize_tool": "编辑工具",
    "tool_name": "工具名称",
    "icon_color": "图标颜色",
    "delete": "删除",
    "cancel": "取消",
    "save": "保存",
    "delete_tool_confirm": "删除工具？",
    "delete_desc_prefix": "确定要删除“",
    "delete_desc_suffix": "”吗？此操作无法撤销。",
    "settings": "设置",
    "storage": "存储",
    "display": "显示",
    "debug": "调试",
    "export_config": "导出配置",
    "import_config": "导入配置",
    "reset_default": "重置为默认",
    "storage_desc": "导入/导出工具和预设配置",
    "display_desc": "选择显示哪些功能区块",
    "show_toolbar": "工具栏",
    "show_toolbar_desc": "快捷工具切换按钮",
    "show_presets": "快捷预设",
    "show_presets_desc": "笔刷预设列表",
    "show_advanced": "高级属性",
    "show_advanced_desc": "流量、硬度、间距等高级滑块",
    "start_listen": "开始监听",
    "stop_listen": "停止监听",
    "get_props": "获取当前参数",
    "copy": "复制",
    "clear": "清除",
    "debug_empty": "点击'开始监听'捕获 Photoshop 事件",
    "basic": "基础",
    "advanced": "高级",
    "shapeDynamics": "形状动态",
    "sizeJitter": "大小抖动",
    "minDiameter": "最小直径",
    "angleJitter": "角度抖动",
    "roundnessJitter": "圆度抖动",
    "minRoundness": "最小圆度",
    "no_brush_detected": "请先在 Photoshop 画笔面板中点击选中一个笔刷，然后再添加收藏。",
    "select_icon": "选择图标",
    "default_icon_options": "默认选项",
    "confirm_reset": "确定要重置所有设置吗？",
    "reset_success": "设置已重置，请重新加载插件",
    "import_success": "配置已导入，请重新加载插件",
    "import_fail": "导入失败: JSON 格式错误",
    "export_alert": "配置已导出到控制台 (UXP 限制无法直接下载文件)",
    "copy_success": "已复制到剪贴板",
    "copy_fail": "复制失败，内容已输出到控制台",
    "enter_config": "粘贴配置 JSON:",
    "tool_brush": "画笔工具",
    "tool_eraser": "橡皮擦",
    "tool_mixer": "混合器画笔",
    "tool_smudge": "涂抹工具",
    "tool_pencil": "铅笔",
    "tool_clone": "仿制图章",
    "current_tool": "当前工具",
    "quick_presets": "快捷预设",
    "view_list": "列表视图",
    "view_grid": "网格视图",
    "export_success": "配置已成功导出！",
    "app_title": "喵笔刷收藏"
  },
  ja: {
    "size": "サイズ",
    "opacity": "不透明度",
    "flow": "流量",
    "hardness": "硬さ",
    "spacing": "間隔",
    "sync": "同期",
    "add_favorite": "追加",
    "enter_name": "プリセット名:",
    "remove_favorite": "削除",
    "no_favorites": "お気に入りがありません。ブラシを選択して+をクリック。",
    "confirm_remove": "削除しますか？",
    "add_tool": "ツール追加",
    "edit_tool": "ツール編集",
    "customize_tool": "ツール編集",
    "tool_name": "ツール名",
    "icon_color": "アイコン色",
    "delete": "削除",
    "cancel": "キャンセル",
    "save": "保存",
    "delete_tool_confirm": "ツールを削除？",
    "delete_desc_prefix": "「",
    "delete_desc_suffix": "」を削除しますか？この操作は取り消せません。",
    "settings": "設定",
    "storage": "ストレージ",
    "display": "表示",
    "debug": "デバッグ",
    "export_config": "設定エクスポート",
    "import_config": "設定インポート",
    "reset_default": "デフォルトに戻す",
    "storage_desc": "ツールとプリセットの管理",
    "display_desc": "表示セクション設定",
    "show_toolbar": "ツールバー",
    "show_toolbar_desc": "ツール切り替え",
    "show_presets": "プリセット",
    "show_presets_desc": "ブラシプリセットリスト",
    "show_advanced": "詳細設定",
    "show_advanced_desc": "流量、硬さ、間隔",
    "start_listen": "監視開始",
    "stop_listen": "監視停止",
    "get_props": "プロパティ取得",
    "copy": "コピー",
    "clear": "クリア",
    "debug_empty": "開始をクリックしてイベントを取得",
    "basic": "基本",
    "advanced": "詳細",
    "shapeDynamics": "シェイプ",
    "sizeJitter": "サイズのジッター",
    "minDiameter": "最小直径",
    "angleJitter": "角度のジッター",
    "roundnessJitter": "円率のジッター",
    "minRoundness": "最小円率",
    "no_brush_detected": "Photoshopでブラシを選択してください。",
    "select_icon": "アイコン選択",
    "default_icon_options": "デフォルト",
    "confirm_reset": "全ての設定をリセットしますか？",
    "reset_success": "リセット完了。再読み込みしてください。",
    "import_success": "インポート完了。再読み込みしてください。",
    "import_fail": "失敗: 無効なJSON",
    "export_alert": "設定をコンソールに出力しました",
    "copy_success": "コピーしました",
    "copy_fail": "失敗しました。コンソールを確認してください",
    "enter_config": "JSONを貼り付け:",
    "tool_brush": "ブラシ",
    "tool_eraser": "消しゴム",
    "tool_mixer": "混合ブラシ",
    "tool_smudge": "指先",
    "tool_pencil": "鉛筆",
    "tool_clone": "コピースタンプ",
    "current_tool": "現在のツール",
    "quick_presets": "プリセット",
    "view_list": "リスト",
    "view_grid": "グリッド",
    "export_success": "エクスポート成功！",
    "app_title": "Meow Brush Favorites"
  }
};

// 2. Supported Languages
export const LANG_OPTIONS = [
  { value: "auto", label: "Auto (System)" },
  { value: "zh", label: "简体中文" },
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" }
];

// 3. Language Detection
function detectLanguage(): string {
  try {
    const saved = localStorage.getItem("user_language");
    if (saved && saved !== "auto" && locales[saved]) {
      return saved;
    }
    const lang = navigator.language || "en";
    const code = lang.split("-")[0].toLowerCase();
    return locales[code] ? code : "en";
  } catch {
    return "en";
  }
}

let currentLang = detectLanguage();

export function getLanguage(): string {
  return currentLang;
}

export function getLanguageSetting(): string {
  return localStorage.getItem("user_language") || "auto";
}

export function setLanguage(lang: string): void {
  localStorage.setItem("user_language", lang);
  if (lang === "auto") {
    currentLang = detectLanguage(); 
  } else if (locales[lang]) {
    currentLang = lang;
  }
}

export function t(key: string, fallback?: string): string {
  const current = locales[currentLang];
  if (current && current[key]) {
    return current[key];
  }
  // Fallback to English
  if (locales.en && locales.en[key]) {
    return locales.en[key];
  }
  return fallback ?? key;
}

export function getAvailableLanguages(): string[] {
  return Object.keys(locales);
}
