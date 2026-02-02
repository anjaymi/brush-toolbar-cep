# 喵笔刷收藏 (Meow Brush Favorites)

Efficient Brush Management & Tool Switcher for Adobe Photoshop 2023+ (v24.2+).  
高效的笔刷管理与快速调用插件，帮助画师在复杂绘画中随心所欲切换工具。

![Preview](public/icons/plugin-icon.png)

## ✨ Features / 核心功能

### 🖌️ Brush Grid (笔刷网格)
- **Visual Favorites**: Grid view of your most used brushes.
- **Drag & Drop**: Easily reorder brushes with drag-and-drop.
- **Right-Click Swap**: Alternative quick swap mode for organizing.
- **Quick Delete**: Hover and click `[x]` to remove.

### 🛠️ Tool Switcher (工具切换)
- **One-Click Access**: Switch between Brush, Eraser, Smudge, and Mixer Brush instantly.
- **Properties Panel**: Real-time control of Size, Flow, and Opacity.

### ⚙️ Customization (个性化)
- **Icon Selector**: Choose custom icons and colors for your brushes.
- **Compact Mode**: Double-click title bar to minimize UI.

## 🚀 Installation / 安装指南

### Option A: Auto-Install (Recommended)
1. Download the latest `.ccx` release.
2. Double-click the file to install via Creative Cloud Desktop.
3. Restart Photoshop.

### Option B: Manual Install (Advanced)
1. Rename `.ccx` to `.zip`.
2. Extract to:
   - **Win**: `C:\Program Files\Common Files\Adobe\Plug-ins\CC\MeowBrushFavorites`
   - **Mac**: `/Library/Application Support/Adobe/Plug-ins/CC/MeowBrushFavorites`
3. Restart Photoshop.

## 📄 Documentation (用户手册)

For a detailed visual guide, please check the [User Manual](UserManual.html) included in the repository.  
详细图文说明请查看项目中的 [用户手册 HTML 版](UserManual.html).

## 🛠️ Build from Source / 源码构建

This project is built with [Bolt UXP](https://github.com/hyperbrew/bolt-uxp).

```bash
# Install dependencies
npm install

# Build Plugin
npm run build     # For development
npm run ccx       # Package for distribution
```

## 📜 License

[Add License Here]
