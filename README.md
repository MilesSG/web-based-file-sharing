# 🌐 CloudVault - Web文件分享平台

<div align="center">

![CloudVault Logo](https://img.shields.io/badge/CloudVault-📁-6366f1?style=for-the-badge)

**🚀 现代化的Web文件分享解决方案**

[![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?style=flat-square&logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

</div>

## ✨ 项目简介

CloudVault 是一个基于Vue 3 + TypeScript构建的现代化文件分享平台，采用Apple风格设计，提供安全、快速、美观的文件分享体验。
![image](https://github.com/user-attachments/assets/b618df7c-983c-4e92-ab54-f93f2a44932b)

### 🎯 核心特性

- 📱 **响应式设计** - 完美适配移动端和桌面端
- 🔒 **安全分享** - 文件内容直接编码到链接中，无需服务器存储
- ⚡ **快速预览** - 支持图片、PDF、文档等多种格式的在线预览
- 🎨 **现代UI** - Apple风格的毛玻璃效果和流畅动画
- 📦 **本地存储** - 基于IndexedDB的本地文件管理
- 🌈 **分类管理** - 智能文件分类和筛选系统

## 🖼️ 界面预览

### 主界面
- 🏠 现代化的文件管理界面
- 📊 实时统计信息展示
- 🔍 强大的搜索和筛选功能

### 文件分享
- 🔗 生成美观的分享预览页面
- 📱 移动端友好的分享界面
- 💾 一键下载和预览功能

## 🚀 快速开始

### 📋 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0

### 🛠️ 安装依赖

```bash
npm install
```

### 🏃‍♂️ 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:5173` 开始使用！

### 📦 构建生产版本

```bash
npm run build
```

### 🔍 预览生产版本

```bash
npm run preview
```

## 💡 主要功能

### 📁 文件管理
- ✅ 拖拽上传文件
- ✅ 多文件批量上传
- ✅ 文件类型智能识别
- ✅ 文件大小自动压缩
- ✅ 本地存储管理

### 🔗 文件分享
- ✅ 生成安全分享链接
- ✅ 精美的预览页面
- ✅ 支持多种文件格式预览
- ✅ 一键复制分享链接
- ✅ 无需服务器的离线分享

### 👀 文件预览
- 🖼️ **图片预览** - 支持JPG、PNG、GIF、WebP等格式
- 📄 **PDF预览** - 内嵌PDF查看器
- 📝 **文本预览** - 支持代码高亮和格式化
- 🎵 **媒体文件** - 音频和视频文件支持

### 🎨 界面特色
- 🌈 **毛玻璃效果** - 现代化的Apple风格设计
- 🎭 **深色模式** - 护眼的暗色主题
- 📱 **响应式布局** - 完美适配各种屏幕尺寸
- ⚡ **流畅动画** - 60fps的丝滑交互体验

## 🔧 技术栈

### 🎯 前端框架
- **Vue 3** - 渐进式JavaScript框架
- **TypeScript** - 类型安全的JavaScript超集
- **Vite** - 下一代前端构建工具

### 🎨 UI框架
- **Tailwind CSS** - 原子化CSS框架
- **Headless UI** - 无样式组件库
- **Element Plus** - Vue 3组件库
- **Lucide Vue** - 精美的图标库

### 🛠️ 开发工具
- **VueUse** - Vue组合式API工具集
- **Pinia** - Vue状态管理
- **Vue Router** - 官方路由管理器

### 💾 数据存储
- **IndexedDB** - 浏览器本地数据库
- **Blob API** - 文件处理和分享

## 📂 项目结构

```
src/
├── 📁 components/          # Vue组件
│   ├── 🎨 FileCard.vue     # 文件卡片组件
│   ├── 📤 UploadArea.vue   # 文件上传区域
│   ├── 🔗 QrShareDialog.vue # 文件分享对话框
│   └── 🎯 ...              # 其他组件
├── 📁 views/               # 页面视图
│   ├── 🏠 Home.vue         # 主页
│   ├── 👁️ ShareView.vue    # 分享预览页
│   └── ⚙️ Settings.vue     # 设置页面
├── 📁 utils/               # 工具函数
│   ├── 🗄️ db.ts             # 数据库操作
│   ├── 🔗 urlShareService.ts # 分享服务
│   └── 📎 fileUtils.ts     # 文件工具
├── 📁 stores/              # 状态管理
├── 📁 types/               # TypeScript类型定义
└── 📁 styles/              # 样式文件
```

## 🎮 使用指南

### 1️⃣ 上传文件
1. 点击"上传文件"按钮或直接拖拽文件到上传区域
2. 支持多文件同时上传
3. 文件会自动保存到本地数据库

### 2️⃣ 分享文件
1. 在文件列表中找到要分享的文件
2. 点击分享按钮
3. 选择"新窗口预览"或"当前页预览"
4. 复制分享链接发送给他人

### 3️⃣ 预览文件
1. 点击文件卡片进入预览模式
2. 支持图片、PDF、文档等格式
3. 提供下载和分享功能

## 🔒 安全特性

- 🛡️ **无服务器存储** - 文件不上传到任何服务器
- 🔐 **本地加密** - 敏感数据本地加密存储
- 🌐 **安全分享** - 文件内容直接编码到链接中
- 🚫 **无追踪** - 不收集任何用户数据

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

### 🐛 报告问题
1. 在GitHub上创建Issue
2. 详细描述问题和复现步骤
3. 提供浏览器和系统信息

### 💡 功能建议
1. 在Issue中描述新功能需求
2. 说明使用场景和预期效果
3. 如果可能，提供设计草图

## 📄 开源协议

本项目采用 [MIT协议](LICENSE) 开源。

## 👨‍💻 作者

**MilesSG** - [GitHub](https://github.com/MilesSG)

## 🙏 致谢

感谢所有开源项目的贡献者，特别是：
- Vue.js团队 🎉
- Tailwind CSS团队 🎨
- Element Plus团队 🔧
- 以及所有依赖库的维护者 ❤️

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给它一个星星！**

[🌟 Star](https://github.com/MilesSG/web-based-file-sharing) • [🐛 Report Bug](https://github.com/MilesSG/web-based-file-sharing/issues) • [💡 Request Feature](https://github.com/MilesSG/web-based-file-sharing/issues)

</div> 
