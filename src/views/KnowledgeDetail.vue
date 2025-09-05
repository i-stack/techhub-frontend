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
            <div v-html="formatContent(knowledge.content)"></div>
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
      isFavorited: false
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
        const response = await knowledgeAPI.getEntry(this.id)
        this.knowledge = response.data || {}
      } catch (error) {
        console.error('加载知识详情失败:', error)
        this.$message.error('加载知识详情失败')
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
      return content.replace(/\n/g, '<br>')
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