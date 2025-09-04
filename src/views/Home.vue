<template>
  <div class="home">
    <!-- 欢迎横幅 -->
    <el-row class="welcome-banner">
      <el-col :span="24">
        <el-card class="banner-card">
          <div class="banner-content">
            <h1>欢迎来到 TechHub 知识库</h1>
            <p>收集和分享技术知识，共同成长</p>
            <el-button type="primary" size="large" @click="$router.push('/knowledge')">
              开始探索
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 统计信息 -->
    <el-row :gutter="20" class="stats-section">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon"><Document /></el-icon>
            <div class="stat-info">
              <h3>{{ statistics.totalEntries || 0 }}</h3>
              <p>知识条目</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon"><User /></el-icon>
            <div class="stat-info">
              <h3>{{ statistics.totalUsers || 0 }}</h3>
              <p>用户数量</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon"><ChatDotRound /></el-icon>
            <div class="stat-info">
              <h3>{{ statistics.totalComments || 0 }}</h3>
              <p>评论数量</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon"><Star /></el-icon>
            <div class="stat-info">
              <h3>{{ totalLikes }}</h3>
              <p>总点赞数</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 分类统计 -->
    <el-row :gutter="20" class="category-section">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>按分类统计</span>
            </div>
          </template>
          <div class="category-stats">
            <div 
              v-for="(count, category) in statistics.entriesByCategory" 
              :key="category"
              class="category-item"
            >
              <span class="category-name">{{ getCategoryName(category) }}</span>
              <el-progress 
                :percentage="getCategoryPercentage(count)" 
                :color="getCategoryColor(category)"
                :show-text="false"
              />
              <span class="category-count">{{ count }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>按难度统计</span>
            </div>
          </template>
          <div class="difficulty-stats">
            <div 
              v-for="(count, difficulty) in statistics.entriesByDifficulty" 
              :key="difficulty"
              class="difficulty-item"
            >
              <span class="difficulty-name">{{ getDifficultyName(difficulty) }}</span>
              <el-progress 
                :percentage="getDifficultyPercentage(count)" 
                :color="getDifficultyColor(difficulty)"
                :show-text="false"
              />
              <span class="difficulty-count">{{ count }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最新知识条目 -->
    <el-row class="latest-section">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最新知识条目</span>
              <el-button type="text" @click="$router.push('/knowledge')">查看更多</el-button>
            </div>
          </template>
          <div v-loading="loading" class="latest-entries">
            <div 
              v-for="entry in latestEntries" 
              :key="entry.id"
              class="entry-item"
              @click="$router.push(`/knowledge/${entry.id}`)"
            >
              <div class="entry-content">
                <h4 class="entry-title">{{ entry.title }}</h4>
                <p class="entry-summary">{{ entry.summary }}</p>
                <div class="entry-meta">
                  <el-tag :type="getCategoryTagType(entry.category)" size="small">
                    {{ getCategoryName(entry.category) }}
                  </el-tag>
                  <el-tag :type="getDifficultyTagType(entry.difficulty)" size="small">
                    {{ getDifficultyName(entry.difficulty) }}
                  </el-tag>
                  <span class="entry-author">作者: {{ entry.author?.username }}</span>
                  <span class="entry-date">{{ formatDate(entry.createdAt) }}</span>
                </div>
              </div>
              <div class="entry-stats">
                <span><el-icon><View /></el-icon> {{ entry.viewCount }}</span>
                <span><el-icon><Star /></el-icon> {{ entry.likeCount }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { statisticsAPI, knowledgeAPI } from '../services/api'
import { Document, User, ChatDotRound, Star, View } from '@element-plus/icons-vue'

const statistics = ref({})
const latestEntries = ref([])
const loading = ref(false)

// 计算总点赞数
const totalLikes = computed(() => {
  return latestEntries.value.reduce((sum, entry) => sum + entry.likeCount, 0)
})

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

// 获取分类颜色
const getCategoryColor = (category) => {
  const colorMap = {
    frontend: '#67c23a',
    backend: '#409eff',
    mobile: '#e6a23c',
    database: '#f56c6c',
    devops: '#909399',
    ai: '#9c27b0',
    security: '#ff9800',
    tools: '#607d8b',
    other: '#795548'
  }
  return colorMap[category] || '#409eff'
}

// 获取难度颜色
const getDifficultyColor = (difficulty) => {
  const colorMap = {
    beginner: '#67c23a',
    intermediate: '#e6a23c',
    advanced: '#f56c6c',
    expert: '#9c27b0'
  }
  return colorMap[difficulty] || '#409eff'
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

// 计算分类百分比
const getCategoryPercentage = (count) => {
  const total = Object.values(statistics.value.entriesByCategory || {}).reduce((sum, c) => sum + c, 0)
  return total > 0 ? Math.round((count / total) * 100) : 0
}

// 计算难度百分比
const getDifficultyPercentage = (count) => {
  const total = Object.values(statistics.value.entriesByDifficulty || {}).reduce((sum, c) => sum + c, 0)
  return total > 0 ? Math.round((count / total) * 100) : 0
}

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// 获取统计数据
const fetchStatistics = async () => {
  try {
    const response = await statisticsAPI.getStatistics()
    statistics.value = response.data
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 获取最新知识条目
const fetchLatestEntries = async () => {
  loading.value = true
  try {
    const response = await knowledgeAPI.getEntries({ limit: 5 })
    latestEntries.value = response.data.entries
  } catch (error) {
    console.error('获取最新知识条目失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStatistics()
  fetchLatestEntries()
})
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-banner {
  margin-bottom: 30px;
}

.banner-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.banner-content {
  text-align: center;
  padding: 40px 20px;
}

.banner-content h1 {
  font-size: 2.5rem;
  margin-bottom: 16px;
  font-weight: 300;
}

.banner-content p {
  font-size: 1.2rem;
  margin-bottom: 30px;
  opacity: 0.9;
}

.stats-section {
  margin-bottom: 30px;
}

.stat-card {
  text-align: center;
}

.stat-content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.stat-icon {
  font-size: 2.5rem;
  color: #409eff;
  margin-right: 20px;
}

.stat-info h3 {
  font-size: 2rem;
  margin: 0 0 8px 0;
  color: #303133;
}

.stat-info p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.category-section {
  margin-bottom: 30px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-stats,
.difficulty-stats {
  padding: 10px 0;
}

.category-item,
.difficulty-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.category-name,
.difficulty-name {
  width: 80px;
  font-size: 14px;
  color: #606266;
}

.category-count,
.difficulty-count {
  width: 40px;
  text-align: right;
  font-size: 14px;
  color: #909399;
}

.latest-section {
  margin-bottom: 30px;
}

.latest-entries {
  min-height: 200px;
}

.entry-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  margin-bottom: 15px;
  cursor: pointer;
  transition: all 0.3s;
}

.entry-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.entry-content {
  flex: 1;
}

.entry-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #303133;
}

.entry-summary {
  color: #606266;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.entry-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #909399;
}

.entry-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  color: #909399;
}

.entry-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
