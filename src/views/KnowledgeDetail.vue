<template>
  <div class="knowledge-detail">
    <div v-loading="loading" class="detail-container">
      <div v-if="entry" class="entry-content">
        <!-- 返回按钮 -->
        <div class="back-button">
          <el-button @click="$router.go(-1)">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
        </div>

        <!-- 文章头部 -->
        <div class="entry-header">
          <h1 class="entry-title">{{ entry.title }}</h1>
          <div class="entry-meta">
            <div class="author-info">
              <el-avatar :size="40" :src="entry.author?.avatar">
                {{ entry.author?.username?.charAt(0) }}
              </el-avatar>
              <div class="author-details">
                <span class="author-name">{{ entry.author?.username }}</span>
                <span class="publish-date">{{ formatDate(entry.publishedAt || entry.createdAt) }}</span>
              </div>
            </div>
            <div class="entry-actions">
              <el-button 
                type="primary" 
                @click="toggleLike"
                :loading="likeLoading"
              >
                <el-icon><Star /></el-icon>
                {{ isLiked ? '已点赞' : '点赞' }} ({{ entry.likeCount }})
              </el-button>
              <el-button @click="toggleFavorite">
                <el-icon><Collection /></el-icon>
                {{ isFavorited ? '已收藏' : '收藏' }}
              </el-button>
            </div>
          </div>
        </div>

        <!-- 标签和分类 -->
        <div class="entry-tags">
          <el-tag :type="getCategoryTagType(entry.category)" size="large">
            {{ getCategoryName(entry.category) }}
          </el-tag>
          <el-tag :type="getDifficultyTagType(entry.difficulty)" size="large">
            {{ getDifficultyName(entry.difficulty) }}
          </el-tag>
          <el-tag 
            v-for="tag in entry.tags" 
            :key="tag"
            size="large"
            effect="plain"
          >
            {{ tag }}
          </el-tag>
        </div>

        <!-- 文章摘要 -->
        <div class="entry-summary">
          <h3>摘要</h3>
          <p>{{ entry.summary }}</p>
        </div>

        <!-- 文章内容 -->
        <div class="entry-body">
          <h3>内容</h3>
          <div class="content" v-html="formatContent(entry.content)"></div>
        </div>

        <!-- 统计信息 -->
        <div class="entry-stats">
          <div class="stat-item">
            <el-icon><View /></el-icon>
            <span>{{ entry.viewCount }} 次浏览</span>
          </div>
          <div class="stat-item">
            <el-icon><Star /></el-icon>
            <span>{{ entry.likeCount }} 个点赞</span>
          </div>
          <div class="stat-item">
            <el-icon><ChatDotRound /></el-icon>
            <span>{{ comments.length }} 条评论</span>
          </div>
        </div>

        <!-- 评论区域 -->
        <div class="comments-section">
          <h3>评论 ({{ comments.length }})</h3>
          
          <!-- 发表评论 -->
          <div class="comment-form">
            <el-input
              v-model="newComment"
              type="textarea"
              :rows="4"
              placeholder="写下你的评论..."
              maxlength="500"
              show-word-limit
            />
            <div class="comment-actions">
              <el-button type="primary" @click="submitComment" :loading="commentLoading">
                发表评论
              </el-button>
            </div>
          </div>

          <!-- 评论列表 -->
          <div class="comments-list">
            <div 
              v-for="comment in comments" 
              :key="comment.id"
              class="comment-item"
            >
              <div class="comment-header">
                <el-avatar :size="32" :src="comment.user?.avatar">
                  {{ comment.user?.username?.charAt(0) }}
                </el-avatar>
                <div class="comment-meta">
                  <span class="comment-author">{{ comment.user?.username }}</span>
                  <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
                </div>
              </div>
              <div class="comment-content">
                {{ comment.content }}
              </div>
              <div class="comment-actions">
                <el-button type="text" size="small" @click="replyToComment(comment)">
                  回复
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="!loading" class="not-found">
        <el-empty description="知识条目不存在">
          <el-button type="primary" @click="$router.push('/knowledge')">
            返回知识库
          </el-button>
        </el-empty>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useKnowledgeStore } from '../stores/knowledge'
import { commentAPI, favoriteAPI } from '../services/api'
import { ElMessage } from 'element-plus'
import { 
  ArrowLeft, Star, Collection, View, ChatDotRound 
} from '@element-plus/icons-vue'

const route = useRoute()
const knowledgeStore = useKnowledgeStore()

const props = defineProps({
  id: {
    type: [String, Number],
    required: true
  }
})

// 响应式数据
const loading = ref(false)
const likeLoading = ref(false)
const commentLoading = ref(false)
const entry = ref(null)
const comments = ref([])
const newComment = ref('')
const isLiked = ref(false)
const isFavorited = ref(false)

// 获取分类名称
const getCategoryName = (category) => {
  const categoryMap = {
    frontend: '前端开发',
    backend: '后端开发',
    mobile: '移动开发',
    database: '数据库',
    devops: '运维部署',
    ai: '人工智能',
    security: '安全防护',
    tools: '开发工具',
    other: '其他'
  }
  return categoryMap[category] || category
}

// 获取难度名称
const getDifficultyName = (difficulty) => {
  const difficultyMap = {
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级',
    expert: '专家'
  }
  return difficultyMap[difficulty] || difficulty
}

// 获取分类标签类型
const getCategoryTagType = (category) => {
  const typeMap = {
    frontend: 'success',
    backend: 'primary',
    mobile: 'warning',
    database: 'danger',
    devops: 'info',
    ai: '',
    security: 'warning',
    tools: 'info',
    other: ''
  }
  return typeMap[category] || ''
}

// 获取难度标签类型
const getDifficultyTagType = (difficulty) => {
  const typeMap = {
    beginner: 'success',
    intermediate: 'warning',
    advanced: 'danger',
    expert: ''
  }
  return typeMap[difficulty] || ''
}

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 格式化内容
const formatContent = (content) => {
  // 简单的Markdown转HTML（实际项目中可以使用专业的Markdown解析器）
  return content
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
}

// 获取知识条目详情
const fetchEntry = async () => {
  loading.value = true
  try {
    const entryData = await knowledgeStore.fetchEntry(Number(props.id))
    entry.value = entryData
    await fetchComments()
  } catch (error) {
    ElMessage.error('获取知识条目失败')
    console.error('获取知识条目失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取评论列表
const fetchComments = async () => {
  try {
    const response = await commentAPI.getComments(Number(props.id))
    comments.value = response.data
  } catch (error) {
    console.error('获取评论列表失败:', error)
  }
}

// 点赞/取消点赞
const toggleLike = async () => {
  if (!entry.value) return
  
  likeLoading.value = true
  try {
    // 这里需要用户ID，实际项目中应该从用户状态中获取
    const userId = 1 // 临时硬编码
    const result = await knowledgeStore.toggleLike(entry.value.id, userId)
    isLiked.value = result.liked
    entry.value.likeCount = result.likeCount
  } catch (error) {
    ElMessage.error('操作失败')
    console.error('点赞操作失败:', error)
  } finally {
    likeLoading.value = false
  }
}

// 收藏/取消收藏
const toggleFavorite = async () => {
  if (!entry.value) return
  
  try {
    const userId = 1 // 临时硬编码
    if (isFavorited.value) {
      await favoriteAPI.removeFromFavorites({
        userId,
        knowledgeEntryId: entry.value.id
      })
      isFavorited.value = false
      ElMessage.success('取消收藏成功')
    } else {
      await favoriteAPI.addToFavorites({
        userId,
        knowledgeEntryId: entry.value.id
      })
      isFavorited.value = true
      ElMessage.success('收藏成功')
    }
  } catch (error) {
    ElMessage.error('操作失败')
    console.error('收藏操作失败:', error)
  }
}

// 提交评论
const submitComment = async () => {
  if (!newComment.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }

  commentLoading.value = true
  try {
    await commentAPI.createComment({
      content: newComment.value,
      knowledgeEntryId: Number(props.id),
      userId: 1 // 临时硬编码
    })
    
    newComment.value = ''
    ElMessage.success('评论发表成功')
    await fetchComments()
  } catch (error) {
    ElMessage.error('评论发表失败')
    console.error('发表评论失败:', error)
  } finally {
    commentLoading.value = false
  }
}

// 回复评论
const replyToComment = (comment) => {
  newComment.value = `@${comment.user?.username} `
  // 滚动到评论输入框
  document.querySelector('.comment-form')?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
  fetchEntry()
})
</script>

<style scoped>
.knowledge-detail {
  max-width: 800px;
  margin: 0 auto;
}

.detail-container {
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.back-button {
  margin-bottom: 20px;
}

.entry-header {
  margin-bottom: 30px;
}

.entry-title {
  font-size: 2rem;
  font-weight: 600;
  color: #303133;
  margin: 0 0 20px 0;
  line-height: 1.4;
}

.entry-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-top: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  color: #303133;
}

.publish-date {
  font-size: 14px;
  color: #909399;
}

.entry-actions {
  display: flex;
  gap: 12px;
}

.entry-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 30px;
}

.entry-summary {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.entry-summary h3 {
  margin: 0 0 12px 0;
  color: #303133;
}

.entry-summary p {
  margin: 0;
  color: #606266;
  line-height: 1.6;
}

.entry-body {
  margin-bottom: 30px;
}

.entry-body h3 {
  margin: 0 0 20px 0;
  color: #303133;
}

.content {
  color: #606266;
  line-height: 1.8;
  font-size: 16px;
}

.content :deep(code) {
  background: #f1f2f3;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.entry-stats {
  display: flex;
  gap: 30px;
  padding: 20px 0;
  border-top: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 30px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
  font-size: 14px;
}

.comments-section h3 {
  margin: 0 0 20px 0;
  color: #303133;
}

.comment-form {
  margin-bottom: 30px;
}

.comment-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.comments-list {
  space-y: 20px;
}

.comment-item {
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  margin-bottom: 20px;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.comment-meta {
  display: flex;
  flex-direction: column;
}

.comment-author {
  font-weight: 600;
  color: #303133;
}

.comment-date {
  font-size: 12px;
  color: #909399;
}

.comment-content {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 12px;
}

.comment-actions {
  display: flex;
  justify-content: flex-end;
}

.not-found {
  text-align: center;
  padding: 60px 0;
}
</style>
