<template>
  <div class="knowledge-detail">
    <el-row :gutter="20">
      <el-col :span="18">
        <el-card v-loading="loading">
          <template #header>
            <div class="card-header">
              <span>{{ knowledge.title }}</span>
              <div class="actions">
                <el-button size="small" @click="toggleLike">
                  <el-icon><Star /></el-icon>
                  {{ isLiked ? '取消点赞' : '点赞' }} ({{ knowledge.likes || 0 }})
                </el-button>
                <el-button size="small" @click="toggleFavorite">
                  <el-icon><Collection /></el-icon>
                  {{ isFavorited ? '取消收藏' : '收藏' }}
                </el-button>
                <el-button size="small" type="primary" @click="editKnowledge">
                  编辑
                </el-button>
              </div>
            </div>
          </template>
          
          <div class="knowledge-meta">
            <el-row :gutter="20">
              <el-col :span="6">
                <el-tag :type="getCategoryType(knowledge.category)">
                  {{ getCategoryName(knowledge.category) }}
                </el-tag>
              </el-col>
              <el-col :span="6">
                <el-tag :type="getDifficultyType(knowledge.difficulty)">
                  {{ getDifficultyName(knowledge.difficulty) }}
                </el-tag>
              </el-col>
              <el-col :span="6">
                <span>作者: {{ knowledge.author }}</span>
              </el-col>
              <el-col :span="6">
                <span>创建时间: {{ formatDate(knowledge.createdAt) }}</span>
              </el-col>
            </el-row>
          </div>
          
          <div class="knowledge-content">
            <div class="content-toolbar" v-if="isMarkdownContent(knowledge.content)">
              <el-radio-group v-model="contentViewMode" size="small">
                <el-radio-button label="rendered">渲染视图</el-radio-button>
                <el-radio-button label="raw">原始Markdown</el-radio-button>
              </el-radio-group>
            </div>
            <div v-if="contentViewMode === 'rendered'" v-html="formatContent(knowledge.content)"></div>
            <pre v-else class="raw-markdown">{{ knowledge.content }}</pre>
          </div>
        </el-card>
        
        <!-- 评论区域 -->
        <el-card style="margin-top: 20px;">
          <template #header>
            <span>评论 ({{ comments.length }})</span>
          </template>
          
          <div class="comment-form">
            <el-input
              v-model="newComment"
              type="textarea"
              :rows="3"
              placeholder="写下你的评论..."
            />
            <div class="comment-actions">
              <el-button type="primary" @click="submitComment" :disabled="!newComment.trim()">
                发表评论
              </el-button>
            </div>
          </div>
          
          <div class="comments-list">
            <div v-for="comment in comments" :key="comment.id" class="comment-item">
              <div class="comment-header">
                <span class="comment-author">{{ comment.author }}</span>
                <span class="comment-time">{{ formatDate(comment.createdAt) }}</span>
              </div>
              <div class="comment-content">{{ comment.content }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card>
          <template #header>
            <span>相关信息</span>
          </template>
          
          <div class="knowledge-stats">
            <div class="stat-item">
              <el-icon><View /></el-icon>
              <span>浏览: {{ knowledge.views || 0 }}</span>
            </div>
            <div class="stat-item">
              <el-icon><Star /></el-icon>
              <span>点赞: {{ knowledge.likes || 0 }}</span>
            </div>
            <div class="stat-item">
              <el-icon><ChatDotRound /></el-icon>
              <span>评论: {{ comments.length }}</span>
            </div>
            <div class="stat-item">
              <el-icon><Collection /></el-icon>
              <span>收藏: {{ knowledge.favorites || 0 }}</span>
            </div>
          </div>
        </el-card>
        
        <el-card style="margin-top: 20px;">
          <template #header>
            <span>相关推荐</span>
          </template>
          
          <div class="related-knowledge">
            <div v-for="item in relatedKnowledge" :key="item.id" class="related-item">
              <el-link @click="viewRelated(item)">{{ item.title }}</el-link>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { Star, Collection, View, ChatDotRound } from '@element-plus/icons-vue'
import { knowledgeAPI, commentAPI, favoriteAPI } from '@/services/api'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

// 配置marked解析器
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value
      } catch (err) {
        console.error('代码高亮错误:', err)
      }
    }
    return hljs.highlightAuto(code).value
  },
  breaks: true,
  gfm: true
})

export default {
  name: 'KnowledgeDetail',
  components: {
    Star,
    Collection,
    View,
    ChatDotRound
  },
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      loading: false,
      knowledge: {},
      comments: [],
      relatedKnowledge: [],
      newComment: '',
      isLiked: false,
      isFavorited: false,
      contentViewMode: 'rendered'
    }
  },
  mounted() {
    this.loadKnowledgeDetail()
    this.loadComments()
    this.loadRelatedKnowledge()
  },
  methods: {
    async loadKnowledgeDetail() {
      this.loading = true
      try {
        // 模拟 API 调用延迟
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // 使用本地数据
        const mockData = [
          {
            id: 1,
            title: 'Vue 3 组合式 API 入门',
            category: 'frontend',
            difficulty: 'beginner',
            author: '张三',
            createdAt: '2024-01-15',
            content: '# Vue 3 组合式 API 入门指南\n\n## 什么是组合式 API？\n\nVue 3 的**组合式 API** 提供了更好的代码组织和复用性。\n\n### 核心概念\n\n- `setup()` 函数\n- 响应式数据\n- 生命周期钩子\n\n```javascript\nimport { ref, computed } from \'vue\'\n\nexport default {\n  setup() {\n    const count = ref(0)\n    const doubleCount = computed(() => count.value * 2)\n    return { count, doubleCount }\n  }\n}\n```'
          },
          {
            id: 2,
            title: 'Node.js 性能优化技巧',
            category: 'backend',
            difficulty: 'intermediate',
            author: '李四',
            createdAt: '2024-01-14',
            content: '# Node.js 性能优化完全指南\n\n## 概述\n\nNode.js 应用性能优化涉及多个层面。\n\n## 1. 事件循环优化\n\n### 避免阻塞操作\n\n```javascript\n// ❌ 错误：阻塞事件循环\nfunction badExample() {\n  const start = Date.now()\n  while (Date.now() - start < 1000) {\n    // 阻塞 1 秒\n  }\n}\n\n// ✅ 正确：使用异步操作\nfunction goodExample() {\n  return new Promise(resolve => {\n    setTimeout(resolve, 1000)\n  })\n}\n```'
          },
          {
            id: 3,
            title: 'MySQL 索引优化策略',
            category: 'database',
            difficulty: 'advanced',
            author: '王五',
            createdAt: '2024-01-13',
            content: '# MySQL 索引优化完全指南\n\n## 索引基础\n\n### 索引类型\n\n1. **主键索引 (PRIMARY KEY)**\n2. **唯一索引 (UNIQUE)**\n3. **普通索引 (INDEX)**\n\n### 创建索引\n\n```sql\n-- 单列索引\nCREATE INDEX idx_name ON users(name);\n\n-- 复合索引\nCREATE INDEX idx_name_age ON users(name, age);\n\n-- 唯一索引\nCREATE UNIQUE INDEX idx_email ON users(email);\n```'
          }
        ]
        
        const knowledge = mockData.find(item => item.id == this.id)
        if (knowledge) {
          this.knowledge = knowledge
        } else {
          throw new Error('知识条目不存在')
        }
      } catch (error) {
        console.error('加载知识详情失败:', error)
        this.$message.error('加载知识详情失败')
        this.$router.go(-1)
      } finally {
        this.loading = false
      }
    },
    async loadComments() {
      try {
        const response = await commentAPI.getComments(this.id)
        this.comments = response.data || []
      } catch (error) {
        console.error('加载评论失败:', error)
      }
    },
    async loadRelatedKnowledge() {
      try {
        const response = await knowledgeAPI.getEntries({
          category: this.knowledge.category,
          limit: 5
        })
        this.relatedKnowledge = (response.data || []).filter(item => item.id !== this.id)
      } catch (error) {
        console.error('加载相关推荐失败:', error)
      }
    },
    async toggleLike() {
      try {
        await knowledgeAPI.toggleLike(this.id, 'current_user_id')
        this.isLiked = !this.isLiked
        this.knowledge.likes = (this.knowledge.likes || 0) + (this.isLiked ? 1 : -1)
        this.$message.success(this.isLiked ? '点赞成功' : '取消点赞成功')
      } catch (error) {
        console.error('点赞操作失败:', error)
        this.$message.error('操作失败')
      }
    },
    async toggleFavorite() {
      try {
        if (this.isFavorited) {
          await favoriteAPI.removeFromFavorites({
            userId: 'current_user_id',
            knowledgeEntryId: this.id
          })
        } else {
          await favoriteAPI.addToFavorites({
            userId: 'current_user_id',
            knowledgeEntryId: this.id
          })
        }
        this.isFavorited = !this.isFavorited
        this.$message.success(this.isFavorited ? '收藏成功' : '取消收藏成功')
      } catch (error) {
        console.error('收藏操作失败:', error)
        this.$message.error('操作失败')
      }
    },
    async submitComment() {
      if (!this.newComment.trim()) return
      
      try {
        await commentAPI.createComment({
          knowledgeEntryId: this.id,
          content: this.newComment,
          author: '当前用户'
        })
        this.newComment = ''
        this.loadComments()
        this.$message.success('评论发表成功')
      } catch (error) {
        console.error('发表评论失败:', error)
        this.$message.error('发表评论失败')
      }
    },
    editKnowledge() {
      this.$router.push(`/knowledge/${this.id}/edit`)
    },
    viewRelated(item) {
      this.$router.push(`/knowledge/${item.id}`)
    },
    formatContent(content) {
      if (!content) return ''
      
      // 检测是否为Markdown格式
      if (this.isMarkdownContent(content)) {
        try {
          return marked(content)
        } catch (error) {
          console.error('Markdown解析错误:', error)
          return content.replace(/\n/g, '<br>')
        }
      }
      
      // 普通文本格式
      return content.replace(/\n/g, '<br>')
    },
    
    isMarkdownContent(content) {
      // 检测Markdown特征
      const markdownPatterns = [
        /^#{1,6}\s+/m,           // 标题
        /\*\*.*?\*\*/,            // 粗体
        /\*.*?\*/,                // 斜体
        /`.*?`/,                  // 行内代码
        /```[\s\S]*?```/,         // 代码块
        /^\s*[-*+]\s+/m,          // 无序列表
        /^\s*\d+\.\s+/m,          // 有序列表
        /\[.*?\]\(.*?\)/,         // 链接
        /!\[.*?\]\(.*?\)/,        // 图片
        /^\s*>/m,                 // 引用
        /^\s*\|.*\|/m,            // 表格
        /^---+$/m,                // 分隔线
        /^\s*```/m                // 代码块开始
      ]
      
      return markdownPatterns.some(pattern => pattern.test(content))
    },
    formatDate(date) {
      if (!date) return ''
      return new Date(date).toLocaleString('zh-CN')
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
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.actions {
  display: flex;
  gap: 10px;
}

.knowledge-meta {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.knowledge-content {
  line-height: 1.6;
  font-size: 14px;
}

.content-toolbar {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-secondary);
}

.raw-markdown {
  background: var(--bg-hover);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 16px;
  font-family: 'Fira Code', 'JetBrains Mono', monospace;
  font-size: 0.9em;
  line-height: 1.5;
  color: var(--text-primary);
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-x: auto;
  margin: 0;
}

/* Markdown样式 */
.knowledge-content :deep(h1),
.knowledge-content :deep(h2),
.knowledge-content :deep(h3),
.knowledge-content :deep(h4),
.knowledge-content :deep(h5),
.knowledge-content :deep(h6) {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
  color: var(--text-primary);
}

.knowledge-content :deep(h1) {
  font-size: 2em;
  border-bottom: 1px solid var(--border-primary);
  padding-bottom: 8px;
}

.knowledge-content :deep(h2) {
  font-size: 1.5em;
  border-bottom: 1px solid var(--border-secondary);
  padding-bottom: 6px;
}

.knowledge-content :deep(h3) {
  font-size: 1.25em;
}

.knowledge-content :deep(p) {
  margin-bottom: 16px;
  color: var(--text-secondary);
}

.knowledge-content :deep(code) {
  background: var(--bg-hover);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Fira Code', 'JetBrains Mono', monospace;
  font-size: 0.9em;
  color: var(--primary-color);
}

.knowledge-content :deep(pre) {
  background: var(--bg-hover);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  overflow-x: auto;
  font-family: 'Fira Code', 'JetBrains Mono', monospace;
  font-size: 0.9em;
  line-height: 1.5;
}

.knowledge-content :deep(pre code) {
  background: transparent;
  padding: 0;
  border-radius: 0;
  color: var(--text-primary);
}

.knowledge-content :deep(blockquote) {
  border-left: 4px solid var(--primary-color);
  padding-left: 16px;
  margin: 16px 0;
  color: var(--text-secondary);
  font-style: italic;
  background: var(--bg-hover);
  padding: 12px 16px;
  border-radius: 0 8px 8px 0;
}

.knowledge-content :deep(ul),
.knowledge-content :deep(ol) {
  margin: 16px 0;
  padding-left: 24px;
}

.knowledge-content :deep(li) {
  margin: 8px 0;
  color: var(--text-secondary);
}

.knowledge-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  overflow: hidden;
}

.knowledge-content :deep(th),
.knowledge-content :deep(td) {
  border: 1px solid var(--border-primary);
  padding: 12px 16px;
  text-align: left;
}

.knowledge-content :deep(th) {
  background: var(--bg-hover);
  font-weight: 600;
  color: var(--text-primary);
}

.knowledge-content :deep(td) {
  color: var(--text-secondary);
}

.knowledge-content :deep(a) {
  color: var(--primary-color);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: all 0.3s ease;
}

.knowledge-content :deep(a:hover) {
  border-bottom-color: var(--primary-color);
  text-decoration: none;
}

.knowledge-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 16px 0;
  box-shadow: var(--shadow-sm);
}

.knowledge-content :deep(hr) {
  border: none;
  height: 2px;
  background: var(--border-primary);
  margin: 24px 0;
  border-radius: 1px;
}

.comment-form {
  margin-bottom: 20px;
}

.comment-actions {
  margin-top: 10px;
  text-align: right;
}

.comment-item {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.comment-author {
  font-weight: bold;
  color: var(--primary-color);
}

.comment-time {
  color: var(--text-muted);
  font-size: 12px;
}

.comment-content {
  color: var(--text-secondary);
  line-height: 1.5;
}

.knowledge-stats {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
}

.related-knowledge {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.related-item {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.related-item:last-child {
  border-bottom: none;
}
</style>