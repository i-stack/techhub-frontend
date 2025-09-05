# TechHub Frontend

基于 Vue 3 + Vite + Element Plus 构建的技术知识库前端应用。

## 功能特性

- 🎨 现代化的用户界面设计
- 📱 响应式布局，支持移动端
- 🔍 强大的搜索和筛选功能
- 📊 数据统计和可视化
- 💬 评论和互动功能
- ⭐ 收藏和点赞系统
- 📝 富文本编辑器
- 🚀 快速加载和优化

## 技术栈

- **框架**: Vue 3
- **构建工具**: Vite
- **UI 组件库**: Element Plus
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **HTTP 客户端**: Axios
- **图标**: Element Plus Icons

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

应用将在 `http://localhost:3001` 启动。

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 项目结构

```
techhub-frontend/
├── public/                 # 静态资源
├── src/
│   ├── components/         # 公共组件
│   ├── views/             # 页面组件
│   │   ├── Home.vue       # 首页
│   │   ├── KnowledgeBase.vue      # 知识库
│   │   ├── KnowledgeList.vue      # 知识列表
│   │   ├── KnowledgeDetail.vue    # 知识详情
│   │   ├── KnowledgeCreate.vue    # 创建知识
│   │   ├── KnowledgeEdit.vue      # 编辑知识
│   │   ├── UserProfile.vue        # 用户资料
│   │   └── Statistics.vue         # 统计页面
│   ├── router/            # 路由配置
│   │   └── index.js
│   ├── services/          # API 服务
│   │   └── api.js
│   ├── stores/            # 状态管理
│   │   └── knowledge.js
│   ├── App.vue            # 根组件
│   └── main.js            # 入口文件
├── index.html             # HTML 模板
├── vite.config.js         # Vite 配置
├── package.json           # 项目配置
└── README.md              # 项目说明
```

## 页面功能

### 首页 (Home)
- 欢迎界面
- 功能导航
- 快速访问

### 知识库 (KnowledgeBase)
- 知识条目展示
- 搜索和筛选
- 添加新知识

### 知识列表 (KnowledgeList)
- 分页展示
- 高级搜索
- 批量操作

### 知识详情 (KnowledgeDetail)
- 详细内容展示
- 评论系统
- 点赞收藏
- 相关推荐

### 创建知识 (KnowledgeCreate)
- 富文本编辑
- 分类标签
- 附件上传
- 草稿保存

### 编辑知识 (KnowledgeEdit)
- 内容修改
- 状态管理
- 版本控制

### 用户资料 (UserProfile)
- 个人信息
- 我的知识
- 我的收藏
- 统计数据

### 统计页面 (Statistics)
- 数据概览
- 分类统计
- 热门排行
- 趋势分析

## API 接口

前端通过 `src/services/api.js` 与后端 API 进行交互：

- **知识条目**: `/api/knowledge/entries`
- **用户管理**: `/api/users`
- **评论系统**: `/api/comments`
- **收藏功能**: `/api/favorites`
- **统计数据**: `/api/statistics`

## 状态管理

使用 Pinia 进行状态管理，主要 store：

- **knowledge**: 知识条目相关状态
- **user**: 用户信息状态
- **app**: 应用全局状态

## 开发指南

### 添加新页面

1. 在 `src/views/` 中创建新的 Vue 组件
2. 在 `src/router/index.js` 中添加路由配置
3. 在导航菜单中添加链接

### 添加新组件

1. 在 `src/components/` 中创建组件
2. 在需要的地方导入使用
3. 遵循 Vue 3 组合式 API 规范

### 添加新 API

1. 在 `src/services/api.js` 中添加新的 API 方法
2. 在组件中调用 API
3. 处理加载状态和错误情况

## 样式规范

- 使用 Element Plus 组件库
- 遵循 BEM CSS 命名规范
- 使用 scoped 样式避免污染
- 响应式设计，支持移动端

## 部署

### 构建

```bash
npm run build
```

### 部署到服务器

将 `dist` 目录上传到 Web 服务器即可。

### Docker 部署

```bash
# 构建镜像
docker build -t techhub-frontend .

# 运行容器
docker run -p 80:80 techhub-frontend
```

## 浏览器支持

- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## 许可证

MIT License