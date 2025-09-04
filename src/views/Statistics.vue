<template>
  <div class="statistics">
    <div class="page-header">
      <h1>数据统计</h1>
    </div>

    <div v-loading="loading" class="stats-container">
      <!-- 总体统计 -->
      <el-row :gutter="20" class="overview-stats">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon><Document /></el-icon>
              </div>
              <div class="stat-info">
                <h3>{{ statistics.totalEntries || 0 }}</h3>
                <p>知识条目总数</p>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon><User /></el-icon>
              </div>
              <div class="stat-info">
                <h3>{{ statistics.totalUsers || 0 }}</h3>
                <p>用户总数</p>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-icon">
              <el-icon><ChatDotRound /></el-icon>
            </div>
            <div class="stat-info">
              <h3>{{ statistics.totalComments || 0 }}</h3>
              <p>评论总数</p>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon><Star /></el-icon>
              </div>
              <div class="stat-info">
                <h3>{{ totalLikes }}</h3>
                <p>总点赞数</p>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 图表区域 -->
      <el-row :gutter="20" class="charts-section">
        <!-- 分类统计 -->
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>知识条目分类分布</span>
              </div>
            </template>
            <div class="chart-container">
              <div 
                v-for="(count, category) in statistics.entriesByCategory" 
                :key="category"
                class="category-item"
              >
                <div class="category-info">
                  <span class="category-name">{{ getCategoryName(category) }}</span>
                  <span class="category-count">{{ count }}</span>
                </div>
                <el-progress 
                  :percentage="getCategoryPercentage(count)" 
                  :color="getCategoryColor(category)"
                  :show-text="false"
                />
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 难度统计 -->
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>知识条目难度分布</span>
              </div>
            </template>
            <div class="chart-container">
              <div 
                v-for="(count, difficulty) in statistics.entriesByDifficulty" 
                :key="difficulty"
                class="difficulty-item"
              >
                <div class="difficulty-info">
                  <span class="difficulty-name">{{ getDifficultyName(difficulty) }}</span>
                  <span class="difficulty-count">{{ count }}</span>
                </div>
                <el-progress 
                  :percentage="getDifficultyPercentage(count)" 
                  :color="getDifficultyColor(difficulty)"
                  :show-text="false"
                />
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 详细统计表格 -->
      <el-row class="tables-section">
        <el-col :span="24">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>详细统计信息</span>
              </div>
            </template>
            
            <el-tabs v-model="activeTab" class="stats-tabs">
              <!-- 分类统计表 -->
              <el-tab-pane label="分类统计" name="category">
                <el-table :data="categoryTableData" stripe>
                  <el-table-column prop="category" label="分类" width="150">
                    <template #default="{ row }">
                      <el-tag :type="getCategoryTagType(row.category)">
                        {{ getCategoryName(row.category) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="count" label="数量" width="100" />
                  <el-table-column prop="percentage" label="占比" width="120">
                    <template #default="{ row }">
                      <el-progress 
                        :percentage="row.percentage" 
                        :color="getCategoryColor(row.category)"
                        :show-text="false"
                      />
                      <span style="margin-left: 8px;">{{ row.percentage }}%</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="描述">
                    <template #default="{ row }">
                      {{ getCategoryDescription(row.category) }}
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>

              <!-- 难度统计表 -->
              <el-tab-pane label="难度统计" name="difficulty">
                <el-table :data="difficultyTableData" stripe>
                  <el-table-column prop="difficulty" label="难度" width="150">
                    <template #default="{ row }">
                      <el-tag :type="getDifficultyTagType(row.difficulty)">
                        {{ getDifficultyName(row.difficulty) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="count" label="数量" width="100" />
                  <el-table-column prop="percentage" label="占比" width="120">
                    <template #default="{ row }">
                      <el-progress 
                        :percentage="row.percentage" 
                        :color="getDifficultyColor(row.difficulty)"
                        :show-text="false"
                      />
                      <span style="margin-left: 8px;">{{ row.percentage }}%</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="描述">
                    <template #default="{ row }">
                      {{ getDifficultyDescription(row.difficulty) }}
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { statisticsAPI } from '../services/api'
import { Document, User, ChatDotRound, Star } from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const activeTab = ref('category')
const statistics = reactive({
  totalEntries: 0,
  totalUsers: 0,
  totalComments: 0,
  entriesByCategory: {},
  entriesByDifficulty: {}
})

// 计算总点赞数（这里需要从API获取，暂时使用模拟数据）
const totalLikes = computed(() => {
  return Object.values(statistics.entriesByCategory).reduce((sum, count) => sum + count * 5, 0)
})

// 计算分类表格数据
const categoryTableData = computed(() => {
  const total = Object.values(statistics.entriesByCategory).reduce((sum, count) => sum + count, 0)
  return Object.entries(statistics.entriesByCategory).map(([category, count]) => ({
    category,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0
  }))
})

// 计算难度表格数据
const difficultyTableData = computed(() => {
  const total = Object.values(statistics.entriesByDifficulty).reduce((sum, count) => sum + count, 0)
  return Object.entries(statistics.entriesByDifficulty).map(([difficulty, count]) => ({
    difficulty,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0
  }))
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

// 获取分类百分比
const getCategoryPercentage = (count) => {
  const total = Object.values(statistics.entriesByCategory).reduce((sum, c) => sum + c, 0)
  return total > 0 ? Math.round((count / total) * 100) : 0
}

// 获取难度百分比
const getDifficultyPercentage = (count) => {
  const total = Object.values(statistics.entriesByDifficulty).reduce((sum, c) => sum + c, 0)
  return total > 0 ? Math.round((count / total) * 100) : 0
}

// 获取分类描述
const getCategoryDescription = (category) => {
  const descriptions = {
    frontend: '前端开发相关技术，包括HTML、CSS、JavaScript、Vue、React等',
    backend: '后端开发相关技术，包括Node.js、Python、Java、数据库等',
    mobile: '移动应用开发，包括iOS、Android、React Native、Flutter等',
    database: '数据库相关技术，包括MySQL、MongoDB、Redis等',
    devops: '运维部署相关，包括Docker、Kubernetes、CI/CD等',
    ai: '人工智能和机器学习相关技术',
    security: '网络安全和信息安全相关技术',
    tools: '开发工具和环境配置相关',
    other: '其他技术相关主题'
  }
  return descriptions[category] || '其他技术相关主题'
}

// 获取难度描述
const getDifficultyDescription = (difficulty) => {
  const descriptions = {
    beginner: '适合初学者，基础概念和简单应用',
    intermediate: '需要一定基础，中等复杂度的技术内容',
    advanced: '高级技术内容，需要扎实的基础和丰富的经验',
    expert: '专家级内容，深度技术分析和最佳实践'
  }
  return descriptions[difficulty] || '技术难度描述'
}

// 获取统计数据
const fetchStatistics = async () => {
  loading.value = true
  try {
    const response = await statisticsAPI.getStatistics()
    Object.assign(statistics, response.data)
  } catch (error) {
    console.error('获取统计数据失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStatistics()
})
</script>

<style scoped>
.statistics {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  color: #303133;
}

.stats-container {
  min-height: 400px;
}

.overview-stats {
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

.charts-section {
  margin-bottom: 30px;
}

.card-header {
  font-weight: 600;
  color: #303133;
}

.chart-container {
  padding: 20px 0;
}

.category-item,
.difficulty-item {
  margin-bottom: 20px;
}

.category-info,
.difficulty-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.category-name,
.difficulty-name {
  font-size: 14px;
  color: #606266;
}

.category-count,
.difficulty-count {
  font-size: 14px;
  color: #909399;
}

.tables-section {
  margin-bottom: 30px;
}

.stats-tabs {
  margin-top: 20px;
}
</style>
