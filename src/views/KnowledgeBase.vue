<template>
	<div class="knowledge-base">
		<!-- 页面头部 -->
		<div class="page-header">
			<div class="header-content">
				<div class="header-left">
					<h1 class="page-title">
						<el-icon><Document /></el-icon>知识库
					</h1>
					<p class="page-subtitle">管理和分享你的技术知识</p>
				</div>
				<div class="header-actions">
					<el-button 
						v-if="authStore.hasPermission('add_knowledge')"
						type="primary" 
						@click="showAddDialog = true" 
						class="add-button"
					>
						<el-icon><Plus /></el-icon>添加知识
					</el-button>
					<el-button 
						v-else
						type="primary" 
						@click="showLoginPrompt" 
						class="add-button"
					>
						<el-icon><Plus /></el-icon>添加知识
					</el-button>
				</div>
			</div>
		</div>

		<!-- 搜索和筛选区域 -->
		<div class="search-section">
			<el-card class="search-card">
				<div class="search-content">
					<div class="search-bar">
						<el-input
						v-model="searchQuery"
						placeholder="搜索知识条目..."
						@input="handleSearch"
						size="large"
						clearable>
							<template #prefix>
								<el-icon><Search /></el-icon>
							</template>
						</el-input>
					</div>
					<div class="filter-bar">
						<el-select v-model="selectedCategory" placeholder="选择分类" clearable>
							<el-option 
								v-for="category in categories" 
								:key="category.value" 
								:label="category.label" 
								:value="category.value" />
						</el-select>
						<el-select v-model="selectedDifficulty" placeholder="选择难度" clearable>
							<el-option 
								v-for="level in difficultyLevels" 
								:key="level.value" 
								:label="level.label" 
								:value="level.value" />
						</el-select>
						<el-button @click="resetFilters" class="reset-button">
							<el-icon><Refresh /></el-icon>重置
						</el-button>
					</div>
				</div>
			</el-card>
		</div>

		<!-- 知识列表区域 -->
		<div class="knowledge-list-section">
			<el-card class="list-card">
				<div class="list-header">
					<div class="list-info">
						<span class="total-count">共 {{ filteredKnowledge.length }} 条知识</span>
					</div>
					<div class="view-toggle">
						<el-radio-group v-model="viewMode" size="small">
							<el-radio-button label="table">表格视图</el-radio-button>
							<el-radio-button label="card">卡片视图</el-radio-button>
						</el-radio-group>
					</div>
				</div>

				<!-- 表格视图 -->
				<div v-if="viewMode === 'table'" class="table-view">
					<el-table 
						:data="filteredKnowledge" 
						style="width: 100%"
						v-loading="loading"
						class="knowledge-table"
						:row-class-name="getRowClassName">
						<el-table-column prop="title" label="标题" min-width="300">
							<template #default="scope">
								<div class="title-cell">
									<el-link type="primary" @click.stop="viewKnowledge(scope.row)" class="title-link">
										{{ scope.row.title }}
									</el-link>
									<p class="title-excerpt">{{ getContentExcerpt(scope.row.content) }}</p>
								</div>
							</template>
						</el-table-column>
						<el-table-column prop="category" label="分类" width="120">
							<template #default="scope">
								<el-tag :type="getCategoryType(scope.row.category)" size="small">
								{{ getCategoryName(scope.row.category) }}
								</el-tag>
							</template>
						</el-table-column>
						<el-table-column prop="difficulty" label="难度" width="100">
							<template #default="scope">
								<el-tag :type="getDifficultyType(scope.row.difficulty)" size="small">
								{{ getDifficultyName(scope.row.difficulty) }}
								</el-tag>
							</template>
						</el-table-column>
						<el-table-column prop="author" label="作者" width="120" />
						<el-table-column prop="createdAt" label="创建时间" width="180" />
						<el-table-column label="操作" width="200" fixed="right" align="center">
							<template #default="scope">
								<div class="action-buttons">
									<div class="action-row">
										<el-button size="small" @click.stop="viewKnowledge(scope.row)" class="action-btn">
											<el-icon><Document /></el-icon>查看
										</el-button>
										<el-button 
											v-if="authStore.hasPermission('edit_knowledge')"
											size="small" 
											type="primary" 
											@click.stop="editKnowledge(scope.row)" 
											class="action-btn"
										>
											<el-icon><Edit /></el-icon>编辑
										</el-button>
									</div>
									<div class="action-row">
										<el-button 
											v-if="authStore.hasPermission('delete_knowledge')"
											size="small" 
											type="danger" 
											@click.stop="deleteKnowledge(scope.row)" 
											class="action-btn delete-btn"
										>
											<el-icon><Delete /></el-icon>删除
										</el-button>
									</div>
								</div>
							</template>
						</el-table-column>
					</el-table>
				</div>

				<!-- 卡片视图 -->
				<div v-else class="card-view">
					<div class="knowledge-cards">
						<div 
						v-for="item in filteredKnowledge" 
						:key="item.id" 
						class="knowledge-card"
						@click="viewKnowledge(item)">
							<div class="card-header">
								<h3 class="card-title">{{ item.title }}</h3>
								<div class="card-tags">
									<el-tag :type="getCategoryType(item.category)" size="small">
										{{ getCategoryName(item.category) }}
									</el-tag>
									<el-tag :type="getDifficultyType(item.difficulty)" size="small">
										{{ getDifficultyName(item.difficulty) }}
									</el-tag>
								</div>
							</div>
							<p class="card-content">{{ item.content.substring(0, 150) }}...</p>
							<div class="card-footer">
								<div class="card-meta">
									<span class="author">{{ item.author }}</span>
									<span class="date">{{ item.createdAt }}</span>
								</div>
								<div class="card-actions">
									<el-button size="small" @click.stop="viewKnowledge(item)">
										<el-icon><Document /></el-icon>
									</el-button>
									<el-button size="small" type="primary" @click.stop="editKnowledge(item)">
										<el-icon><Edit /></el-icon>
									</el-button>
									<el-button size="small" type="danger" @click.stop="deleteKnowledge(item)">
										<el-icon><Delete /></el-icon>
									</el-button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</el-card>
		</div>
		
		<!-- 添加知识对话框 -->
		<el-dialog v-model="showAddDialog" title="添加知识" width="600px">
			<el-form :model="newKnowledge" label-width="80px">
				<el-form-item label="标题">
					<el-input v-model="newKnowledge.title" />
				</el-form-item>
				<el-form-item label="分类">
					<el-select v-model="newKnowledge.category" placeholder="选择分类">
						<el-option 
							v-for="category in categories.filter(c => c.value !== '')" 
							:key="category.value" 
							:label="category.label" 
							:value="category.value" 
						/>
					</el-select>
				</el-form-item>
				<el-form-item label="难度">
					<el-select v-model="newKnowledge.difficulty" placeholder="选择难度">
						<el-option 
							v-for="level in difficultyLevels.filter(l => l.value !== '')" 
							:key="level.value" 
							:label="level.label" 
							:value="level.value" 
						/>
					</el-select>
				</el-form-item>
				<el-form-item label="内容">
					<el-input
						v-model="newKnowledge.content"
						type="textarea"
						:rows="6"
						placeholder="请输入知识内容..."/>
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="showAddDialog = false">取消</el-button>
				<el-button type="primary" @click="addKnowledge">确定</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script>
import { 
	Search, 
	Plus, 
	Refresh, 
	Edit, 
	Delete, 
	Document 
} from '@element-plus/icons-vue'
import { CATEGORIES, DIFFICULTY_LEVELS } from '@/config/categories.js'
import { useAuthStore } from '@/stores/auth'

export default {
	name: 'KnowledgeBase',
	components: {
		Search,
		Plus,
		Refresh,
		Edit,
		Delete,
		Document
	},
	setup() {
		const authStore = useAuthStore()
		
		return {
			authStore
		}
	},
	data() {
		return {
		loading: false,
		searchQuery: '',
		selectedCategory: '',
		selectedDifficulty: '',
		viewMode: 'table',
		showAddDialog: false,
		// 配置数据
		categories: CATEGORIES,
		difficultyLevels: DIFFICULTY_LEVELS,
		newKnowledge: {
			title: '',
			category: '',
			difficulty: '',
			content: ''
		},
		knowledgeList: [
        {
          id: 1,
          title: 'Vue 3 组合式 API 入门',
          category: 'frontend',
          difficulty: 'beginner',
          author: '张三',
          createdAt: '2024-01-15',
          content: `# Vue 3 组合式 API 入门指南

## 什么是组合式 API？

Vue 3 的**组合式 API** 提供了更好的代码组织和复用性，让组件逻辑更加清晰和可维护。

### 核心概念

- \`setup()\` 函数
- 响应式数据
- 生命周期钩子
- 计算属性和侦听器

## 基本用法

\`\`\`javascript
import { ref, computed, onMounted } from 'vue'

export default {
  setup() {
    // 响应式数据
    const count = ref(0)
    const message = ref('Hello Vue 3!')
    
    // 计算属性
    const doubleCount = computed(() => count.value * 2)
    
    // 方法
    const increment = () => {
      count.value++
    }
    
    // 生命周期
    onMounted(() => {
      console.log('组件已挂载')
    })
    
    return {
      count,
      message,
      doubleCount,
      increment
    }
  }
}
\`\`\`

## 优势对比

| 特性 | 选项式 API | 组合式 API |
|------|------------|------------|
| 代码组织 | 按选项分组 | 按逻辑分组 |
| 类型推导 | 有限 | 完整支持 |
| 代码复用 | Mixins | 组合函数 |
| 逻辑提取 | 困难 | 简单 |

> **提示**: 组合式 API 可以与选项式 API 混合使用，你可以根据实际需求选择合适的写法。

## 最佳实践

1. **单一职责**: 每个组合函数只负责一个功能
2. **命名规范**: 使用 \`use\` 前缀命名组合函数
3. **类型安全**: 充分利用 TypeScript 的类型推导

---

*更多详细信息请参考 [Vue 3 官方文档](https://vuejs.org/guide/composition-api/)*`
        },
        {
          id: 2,
          title: 'Node.js 性能优化技巧',
          category: 'backend',
          difficulty: 'intermediate',
          author: '李四',
          createdAt: '2024-01-14',
          content: `# Node.js 性能优化完全指南

## 概述

Node.js 应用性能优化涉及多个层面，从代码层面到系统层面的全面优化。

## 1. 事件循环优化

### 避免阻塞操作

\`\`\`javascript
// ❌ 错误：阻塞事件循环
function badExample() {
  const start = Date.now()
  while (Date.now() - start < 1000) {
    // 阻塞 1 秒
  }
}

// ✅ 正确：使用异步操作
function goodExample() {
  return new Promise(resolve => {
    setTimeout(resolve, 1000)
  })
}
\`\`\`

### 使用 Worker Threads

\`\`\`javascript
const { Worker, isMainThread, parentPort } = require('worker_threads')

if (isMainThread) {
  // 主线程
  const worker = new Worker(__filename)
  worker.postMessage({ data: 'heavy computation' })
} else {
  // Worker 线程
  parentPort.on('message', (data) => {
    // 执行 CPU 密集型任务
    const result = heavyComputation(data)
    parentPort.postMessage(result)
  })
}
\`\`\`

## 2. 内存管理

### 监控内存使用

\`\`\`javascript
// 监控内存使用情况
setInterval(() => {
  const usage = process.memoryUsage()
  console.log({
    rss: Math.round(usage.rss / 1024 / 1024) + ' MB',
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + ' MB',
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + ' MB'
  })
}, 5000)
\`\`\`

### 避免内存泄漏

- 及时清理事件监听器
- 避免循环引用
- 使用 WeakMap 和 WeakSet

## 3. 数据库优化

### 连接池配置

\`\`\`javascript
const mysql = require('mysql2/promise')

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'mydb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000
})
\`\`\`

## 4. 缓存策略

### Redis 缓存

\`\`\`javascript
const redis = require('redis')
const client = redis.createClient()

async function getCachedData(key) {
  const cached = await client.get(key)
  if (cached) {
    return JSON.parse(cached)
  }
  
  const data = await fetchFromDatabase(key)
  await client.setex(key, 3600, JSON.stringify(data))
  return data
}
\`\`\`

## 性能监控工具

- **clinic.js**: 性能诊断工具
- **0x**: 火焰图生成
- **autocannon**: 压力测试工具

> **注意**: 性能优化是一个持续的过程，需要根据实际应用场景进行调整。`
        },
        {
          id: 3,
          title: 'MySQL 索引优化策略',
          category: 'database',
          difficulty: 'advanced',
          author: '王五',
          createdAt: '2024-01-13',
          content: `# MySQL 索引优化完全指南

## 索引基础

### 索引类型

1. **主键索引 (PRIMARY KEY)**
2. **唯一索引 (UNIQUE)**
3. **普通索引 (INDEX)**
4. **全文索引 (FULLTEXT)**
5. **空间索引 (SPATIAL)**

### 创建索引

\`\`\`sql
-- 单列索引
CREATE INDEX idx_name ON users(name);

-- 复合索引
CREATE INDEX idx_name_age ON users(name, age);

-- 唯一索引
CREATE UNIQUE INDEX idx_email ON users(email);

-- 前缀索引
CREATE INDEX idx_title_prefix ON articles(title(10));
\`\`\`

## 索引设计原则

### 1. 最左前缀原则

\`\`\`sql
-- 索引: (a, b, c)
-- ✅ 可以使用索引的查询
SELECT * FROM table WHERE a = 1;
SELECT * FROM table WHERE a = 1 AND b = 2;
SELECT * FROM table WHERE a = 1 AND b = 2 AND c = 3;

-- ❌ 不能使用索引的查询
SELECT * FROM table WHERE b = 2;
SELECT * FROM table WHERE c = 3;
SELECT * FROM table WHERE b = 2 AND c = 3;
\`\`\`

### 2. 选择性高的列放在前面

\`\`\`sql
-- 假设 gender 只有 2 个值，age 有 100 个值
-- ❌ 错误顺序
CREATE INDEX idx_gender_age ON users(gender, age);

-- ✅ 正确顺序
CREATE INDEX idx_age_gender ON users(age, gender);
\`\`\`

## 查询优化

### 使用 EXPLAIN 分析

\`\`\`sql
EXPLAIN SELECT * FROM users 
WHERE name = 'John' AND age > 25;
\`\`\`

### 关键指标

| 指标 | 说明 | 理想值 |
|------|------|--------|
| type | 访问类型 | const, eq_ref, ref |
| key | 使用的索引 | 非 NULL |
| rows | 扫描行数 | 尽可能少 |
| Extra | 额外信息 | Using index |

## 常见优化场景

### 1. 分页查询优化

\`\`\`sql
-- ❌ 深度分页问题
SELECT * FROM users ORDER BY id LIMIT 100000, 20;

-- ✅ 使用游标分页
SELECT * FROM users WHERE id > 100000 ORDER BY id LIMIT 20;
\`\`\`

### 2. 范围查询优化

\`\`\`sql
-- 复合索引: (status, created_at)
-- ✅ 高效查询
SELECT * FROM orders 
WHERE status = 'pending' 
  AND created_at >= '2024-01-01' 
  AND created_at < '2024-02-01';
\`\`\`

### 3. 排序优化

\`\`\`sql
-- 索引: (category, price)
-- ✅ 可以使用索引排序
SELECT * FROM products 
WHERE category = 'electronics' 
ORDER BY price;
\`\`\`

## 索引维护

### 监控索引使用情况

\`\`\`sql
-- 查看索引使用统计
SELECT 
  object_schema,
  object_name,
  index_name,
  count_read,
  count_write
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE object_schema = 'your_database';
\`\`\`

### 定期维护

\`\`\sql
-- 分析表
ANALYZE TABLE users;

-- 优化表
OPTIMIZE TABLE users;

-- 重建索引
ALTER TABLE users DROP INDEX idx_name;
ALTER TABLE users ADD INDEX idx_name(name);
\`\`\`

## 最佳实践

1. **避免过多索引**: 每个索引都会影响写入性能
2. **定期监控**: 使用性能监控工具跟踪索引效果
3. **测试验证**: 在生产环境前充分测试
4. **文档记录**: 记录索引设计决策和变更历史

> **警告**: 索引优化需要根据实际业务场景进行，盲目添加索引可能会适得其反。`
        },
        {
          id: 4,
          title: 'Docker 容器化部署指南',
          category: 'devops',
          difficulty: 'intermediate',
          author: '赵六',
          createdAt: '2024-01-12',
          content: `# Docker 容器化部署完全指南

## 什么是 Docker？

Docker 是一个开源的容器化平台，允许开发者将应用程序及其依赖项打包到一个轻量级、可移植的容器中。

## 核心概念

- **镜像 (Image)**: 只读的模板
- **容器 (Container)**: 镜像的运行实例
- **仓库 (Repository)**: 存储镜像的地方
- **Dockerfile**: 构建镜像的指令文件

## 基础命令

### 镜像操作

\`\`\`bash
# 拉取镜像
docker pull nginx:latest

# 查看本地镜像
docker images

# 删除镜像
docker rmi nginx:latest

# 构建镜像
docker build -t myapp:1.0 .
\`\`\`

### 容器操作

\`\`\`bash
# 运行容器
docker run -d -p 8080:80 --name my-nginx nginx

# 查看运行中的容器
docker ps

# 查看所有容器
docker ps -a

# 停止容器
docker stop my-nginx

# 删除容器
docker rm my-nginx
\`\`\`

## Dockerfile 最佳实践

### 基础 Dockerfile

\`\`\`dockerfile
# 使用官方 Node.js 镜像作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production

# 启动应用
CMD ["node", "server.js"]
\`\`\`

### 多阶段构建

\`\`\`dockerfile
# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 生产阶段
FROM node:18-alpine AS production

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/server.js"]
\`\`\`

## Docker Compose

### 基本配置

\`\`\`yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
\`\`\`

### 启动服务

\`\`\`bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f web

# 停止服务
docker-compose down
\`\`\`

## 网络配置

### 创建自定义网络

\`\`\`bash
# 创建网络
docker network create my-network

# 运行容器并连接到网络
docker run -d --network my-network --name web nginx
docker run -d --network my-network --name db postgres
\`\`\`

### Docker Compose 网络

\`\`\`yaml
version: '3.8'

services:
  web:
    image: nginx
    networks:
      - frontend
      - backend

  api:
    image: node:18
    networks:
      - backend

networks:
  frontend:
  backend:
\`\`\`

## 数据持久化

### 卷挂载

\`\`\`bash
# 创建命名卷
docker volume create my-data

# 挂载卷到容器
docker run -d -v my-data:/data postgres
\`\`\`

### 绑定挂载

\`\`\`bash
# 挂载主机目录
docker run -d -v /host/path:/container/path nginx
\`\`\`

## 监控和日志

### 查看容器资源使用

\`\`\`bash
# 实时监控
docker stats

# 查看特定容器
docker stats my-container
\`\`\`

### 日志管理

\`\`\`bash
# 查看日志
docker logs my-container

# 实时跟踪日志
docker logs -f my-container

# 限制日志大小
docker run --log-opt max-size=10m --log-opt max-file=3 nginx
\`\`\`

## 安全最佳实践

1. **使用非 root 用户**
2. **定期更新基础镜像**
3. **扫描镜像漏洞**
4. **限制容器权限**
5. **使用 secrets 管理敏感信息**

> **提示**: 容器化不是银弹，需要根据应用特点选择合适的策略。`
        },
        {
          id: 5,
          title: 'React Hooks 深度解析',
          category: 'frontend',
          difficulty: 'intermediate',
          author: '钱七',
          createdAt: '2024-01-11',
          content: `# React Hooks 深度解析

## 什么是 Hooks？

React Hooks 是 React 16.8 引入的新特性，允许你在函数组件中使用状态和其他 React 特性。

## 内置 Hooks

### useState

\`\`\`javascript
import React, { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  )
}
\`\`\`

### useEffect

\`\`\`javascript
import React, { useState, useEffect } from 'react'

function DataFetcher({ url }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetch(url)
      .then(response => response.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
  }, [url]) // 依赖数组
  
  if (loading) return <div>Loading...</div>
  return <div>{JSON.stringify(data)}</div>
}
\`\`\`

### 自定义 Hooks

\`\`\`javascript
// useLocalStorage Hook
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      return initialValue
    }
  })
  
  const setValue = (value) => {
    try {
      setStoredValue(value)
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(error)
    }
  }
  
  return [storedValue, setValue]
}

// 使用自定义 Hook
function MyComponent() {
  const [name, setName] = useLocalStorage('name', '')
  
  return (
    <input 
      value={name} 
      onChange={(e) => setName(e.target.value)} 
    />
  )
}
\`\`\`

## 性能优化

### useMemo

\`\`\`javascript
import React, { useMemo } from 'react'

function ExpensiveComponent({ items, filter }) {
  const filteredItems = useMemo(() => {
    return items.filter(item => item.category === filter)
  }, [items, filter])
  
  return (
    <ul>
      {filteredItems.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  )
}
\`\`\`

### useCallback

\`\`\`javascript
import React, { useCallback, useState } from 'react'

function Parent() {
  const [count, setCount] = useState(0)
  
  const handleClick = useCallback(() => {
    setCount(c => c + 1)
  }, [])
  
  return <Child onClick={handleClick} />
}

function Child({ onClick }) {
  return <button onClick={onClick}>Click me</button>
}
\`\`\`

## 常见陷阱

1. **不要在循环、条件或嵌套函数中调用 Hooks**
2. **依赖数组要完整**
3. **避免在 useEffect 中创建对象和函数**

> **注意**: Hooks 让函数组件更加强大，但也需要遵循特定的规则。`
        }
      ]
    }
  },
	computed: {
		filteredKnowledge() {
			let filtered = this.knowledgeList
			// 搜索过滤
			if (this.searchQuery) {
				filtered = filtered.filter(item =>
				item.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
				item.content.toLowerCase().includes(this.searchQuery.toLowerCase())
				)
			}
			// 分类过滤
			if (this.selectedCategory) {
				filtered = filtered.filter(item => item.category === this.selectedCategory)
			}
			// 难度过滤
			if (this.selectedDifficulty) {
				filtered = filtered.filter(item => item.difficulty === this.selectedDifficulty)
			}
			return filtered
		}
	},
	methods: {
		handleSearch() {
		// 搜索逻辑已在 computed 中处理
		},
		resetFilters() {
			this.searchQuery = ''
			this.selectedCategory = ''
			this.selectedDifficulty = ''
		},
		getRowClassName({ row, rowIndex }) {
			return rowIndex % 2 === 0 ? 'even-row' : 'odd-row'
		},
		viewKnowledge(item) {
			this.$router.push({
				path: `/knowledge/${item.id}`,
				state: { knowledgeData: item }
			})
		},
		getContentExcerpt(content) {
			if (!content) return ''
			let text = content
				.replace(/#{1,6}\s+/g, '') // 移除标题标记
				.replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗体标记
				.replace(/\*(.*?)\*/g, '$1') // 移除斜体标记
				.replace(/`(.*?)`/g, '$1') // 移除行内代码标记
				.replace(/```[\s\S]*?```/g, '') // 移除代码块
				.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 移除链接，保留文本
				.replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // 移除图片
				.replace(/^\s*[-*+]\s+/gm, '') // 移除列表标记
				.replace(/^\s*\d+\.\s+/gm, '') // 移除有序列表标记
				.replace(/^\s*>\s*/gm, '') // 移除引用标记
				.replace(/^\s*\|.*\|/gm, '') // 移除表格行
				.replace(/^---+$/gm, '') // 移除分隔线
				.replace(/\n+/g, ' ') // 将多个换行替换为单个空格
				.trim()
			return text.length > 100 ? text.substring(0, 100) + '...' : text
		},
		editKnowledge(item) {
			this.$message.info('编辑功能开发中...')
		},
		deleteKnowledge(item) {
			this.$confirm('确定要删除这条知识吗？', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				const index = this.knowledgeList.findIndex(k => k.id === item.id)
				if (index > -1) {
					this.knowledgeList.splice(index, 1)
					this.$message.success('删除成功')
				}
			})
		},
		showLoginPrompt() {
			this.$message.warning('请先登录后再进行操作')
			// 触发父组件的登录对话框
			this.$emit('show-login')
		},
		addKnowledge() {
			if (!this.newKnowledge.title || !this.newKnowledge.content) {
				this.$message.warning('请填写完整信息')
				return
			}
			const newItem = {
				id: Date.now(),
				...this.newKnowledge,
				author: '当前用户',
				createdAt: new Date().toISOString().split('T')[0]
			}
			this.knowledgeList.unshift(newItem)
			this.showAddDialog = false
			this.newKnowledge = {
				title: '',
				category: '',
				difficulty: '',
				content: ''
			}
			this.$message.success('添加成功')
		},
		getCategoryType(category) {
			const types = {
				frontend: 'primary',
				backend: 'success',
				database: 'warning',
				devops: 'danger'
			}
			return types[category] || 'info'
		},
		getCategoryName(category) {
			const names = {
				frontend: '前端',
				backend: '后端',
				database: '数据库',
				devops: 'DevOps'
			}
			return names[category] || category
		},
		getDifficultyType(difficulty) {
			const types = {
				beginner: 'success',
				intermediate: 'warning',
				advanced: 'danger'
			}
			return types[difficulty] || 'info'
		},
		getDifficultyName(difficulty) {
			const names = {
				beginner: '初级',
				intermediate: '中级',
				advanced: '高级'
			}
			return names[difficulty] || difficulty
		}
	}
}
</script>

<style scoped>
.knowledge-base {
	animation: fadeInUp 0.6s ease-out;
	width: 100%;
	max-width: 100%;
	overflow-x: hidden;
}

/* 页面头部样式 */
.page-header {
  	margin-bottom: 24px;
}

.header-content {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 24px 0;
}

.header-left {
  	flex: 1;
}

.page-title {
	display: flex;
	align-items: center;
	gap: 12px;
	font-size: 2rem;
	font-weight: 700;
	color: var(--text-primary);
	margin: 0 0 8px 0;
}

.page-subtitle {
	color: var(--text-secondary);
	font-size: 1.1rem;
	margin: 0;
}

.add-button {
	background: var(--gradient-primary);
	border: none;
	padding: 12px 24px;
	font-weight: 600;
	border-radius: var(--radius-md);
	box-shadow: var(--shadow-primary);
	transition: all 0.3s ease;
	color: white;
}

.add-button:hover {
	transform: translateY(-2px);
	box-shadow: 0 8px 24px rgba(37, 99, 235, 0.4);
}

/* 搜索区域样式 */
.search-section {
  	margin-bottom: 24px;
}

.search-card {
	background: var(--bg-card);
	backdrop-filter: blur(20px);
	border: 1px solid var(--border-primary);
	border-radius: var(--radius-xl);
	overflow: hidden;
	box-shadow: var(--shadow-sm);
}

.search-content {
  	padding: 24px;
}

.search-bar {
  	margin-bottom: 16px;
}

.filter-bar {
	display: flex;
	gap: 12px;
	align-items: center;
	flex-wrap: wrap;
}

.reset-button {
	background: var(--bg-glass);
	border: 1px solid var(--border-primary);
	color: var(--text-primary);
	transition: all 0.3s ease;
}

.reset-button:hover {
	background: var(--bg-hover);
	border-color: var(--border-hover);
}

/* 知识列表区域样式 */
.knowledge-list-section {
  	margin-bottom: 24px;
}

.list-card {
	background: var(--bg-card);
	backdrop-filter: blur(20px);
	border: 1px solid var(--border-primary);
	border-radius: var(--radius-xl);
	overflow: hidden;
	box-shadow: var(--shadow-sm);
}

.list-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20px 24px;
	border-bottom: 1px solid var(--border-primary);
}

.total-count {
	color: var(--text-secondary);
	font-weight: 500;
}

/* 表格视图样式 */
.table-view {
	padding: 0 24px 24px;
	width: 100%;
	overflow-x: auto;
}

.knowledge-table {
  	background: transparent;
}

.knowledge-table :deep(.el-table__header) {
  	background: var(--bg-hover);
}

.knowledge-table :deep(.el-table__header th) {
	background: transparent;
	color: var(--text-primary);
	border-bottom: 1px solid var(--border-primary);
	font-weight: 600;
}

.knowledge-table :deep(.el-table__body tr) {
	background: transparent;
	transition: all 0.3s ease;
}

.knowledge-table :deep(.el-table__body tr:hover) {
  	background: var(--bg-hover);
}

.knowledge-table :deep(.el-table__body td) {
	border-bottom: 1px solid var(--border-secondary);
	color: var(--text-primary);
}

.knowledge-table :deep(.even-row) {
  	background: var(--bg-hover);
}

.knowledge-table :deep(.odd-row) {
  	background: transparent;
}

.title-cell {
  	padding: 8px 0;
}

.title-link {
	font-size: 1rem;
	font-weight: 600;
	color: var(--primary-color);
	text-decoration: none;
  	transition: all 0.3s ease;
}

.title-link:hover {
	color: var(--primary-dark);
	text-decoration: underline;
}

.title-excerpt {
	color: var(--text-muted);
	font-size: 0.9rem;
	margin: 4px 0 0 0;
	line-height: 1.4;
}

/* 卡片视图样式 */
.card-view {
	padding: 24px;
	width: 100%;
	overflow-x: hidden;
}

.knowledge-cards {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
	gap: 20px;
}

.knowledge-card {
	background: var(--bg-card);
	backdrop-filter: blur(20px);
	border: 1px solid var(--border-primary);
	border-radius: var(--radius-lg);
	padding: 20px;
	cursor: pointer;
	transition: all 0.3s ease;
	position: relative;
	overflow: hidden;
	box-shadow: var(--shadow-sm);
}

.knowledge-card:hover {
	transform: translateY(-4px);
	background: var(--bg-hover);
	box-shadow: var(--shadow-md);
	border-color: var(--border-hover);
}

.knowledge-card::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 3px;
  background: var(--gradient-primary);
}

.card-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 12px;
}

.card-title {
	font-size: 1.1rem;
	font-weight: 600;
	color: var(--text-primary);
	margin: 0;
	flex: 1;
  	line-height: 1.4;
}

.card-tags {
	display: flex;
	gap: 6px;
	flex-wrap: wrap;
}

.card-content {
	color: var(--text-secondary);
	line-height: 1.5;
	margin: 0 0 16px 0;
	font-size: 0.9rem;
}

.card-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.card-meta {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.author {
	color: var(--text-muted);
	font-size: 0.85rem;
	font-weight: 500;
}

.date {
	color: var(--text-disabled);
	font-size: 0.8rem;
}

/* 表格操作按钮样式 */
.action-buttons {
	display: flex;
	flex-direction: column;
	gap: 6px;
	align-items: flex-start;
	width: 100%;
}

.action-row {
	display: flex;
	gap: 6px;
	align-items: center;
	width: 100%;
}

.action-row:last-child {
  	justify-content: center;
}

.action-btn {
	min-width: 60px;
	height: 28px;
	font-size: 12px;
	padding: 4px 8px;
	border-radius: var(--radius-sm);
	transition: all 0.2s ease;
	white-space: nowrap;
	flex: 1;
}

.action-btn:hover {
	transform: translateY(-1px);
	box-shadow: var(--shadow-md);
}

.action-btn .el-icon {
	margin-right: 4px;
	font-size: 14px;
}

.delete-btn {
	flex: 1;
	min-width: 60px;
}

/* 卡片操作按钮样式 */
.card-actions {
	display: flex;
	gap: 6px;
	align-items: center;
}

/* 对话框样式优化 */
:deep(.el-dialog) {
	background: var(--bg-card);
	backdrop-filter: blur(20px);
	border-radius: var(--radius-xl);
	border: 1px solid var(--border-primary);
	box-shadow: var(--shadow-lg);
}

:deep(.el-dialog__header) {
	background: var(--gradient-primary);
	color: white;
	border-radius: var(--radius-xl) var(--radius-xl) 0 0;
	padding: 20px 24px;
}

:deep(.el-dialog__title) {
	color: white;
	font-weight: 600;
}

:deep(.el-dialog__body) {
  	padding: 24px;
}

/* 动画效果 */
@keyframes fadeInUp {
	from {
		opacity: 0;
		transform: translateY(30px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

/* 响应式设计 */
@media (max-width: 768px) {
	.header-content {
		flex-direction: column;
		align-items: flex-start;
		gap: 16px;
	}
	
	.page-title {
		font-size: 1.5rem;
	}
	
	.filter-bar {
		flex-direction: column;
		align-items: stretch;
		gap: 12px;
	}
	
	.list-header {
		flex-direction: column;
		gap: 16px;
		align-items: flex-start;
	}
	
	.knowledge-cards {
		grid-template-columns: 1fr;
		gap: 16px;
	}
	
	.card-footer {
		flex-direction: column;
		gap: 12px;
		align-items: flex-start;
	}
	
	.card-actions {
		align-self: stretch;
		justify-content: space-between;
	}
	
	.table-view {
		padding: 0 16px 16px;
	}
	
	.action-buttons {
		gap: 4px;
	}
	
	.action-row {
		gap: 4px;
	}
	
	.action-btn {
		min-width: 50px;
		height: 30px;
		font-size: 11px;
		padding: 3px 6px;
	}
	
	.search-content {
		padding: 16px;
	}
}

@media (max-width: 480px) {
	.search-content {
		padding: 16px;
	}
	
	.table-view {
		padding: 0 16px 16px;
	}
	
	.action-buttons {
		gap: 3px;
	}
	
	.action-row {
		gap: 3px;
	}
	
	.action-btn {
		min-width: 45px;
		height: 26px;
		font-size: 10px;
		padding: 2px 4px;
	}
	
	.action-btn .el-icon {
		margin-right: 2px;
		font-size: 12px;
	}
	
	.card-view {
		padding: 16px;
	}
	
	.knowledge-card {
		padding: 16px;
	}
}
</style>
