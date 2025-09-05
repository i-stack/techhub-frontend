<template>
  <div class="statistics">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon size="40" color="#409eff"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalKnowledge || 0 }}</div>
              <div class="stat-label">知识条目</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon size="40" color="#67c23a"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalUsers || 0 }}</div>
              <div class="stat-label">用户数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon size="40" color="#e6a23c"><Star /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalLikes || 0 }}</div>
              <div class="stat-label">总点赞数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon size="40" color="#f56c6c"><ChatDotRound /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalComments || 0 }}</div>
              <div class="stat-label">评论数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>分类统计</span>
          </template>
          
          <div class="chart-container">
            <div v-for="item in categoryStats" :key="item.category" class="category-item">
              <div class="category-info">
                <el-tag :type="getCategoryType(item.category)">
                  {{ getCategoryName(item.category) }}
                </el-tag>
                <span class="category-count">{{ item.count }} 条</span>
              </div>
              <el-progress 
                :percentage="getCategoryPercentage(item.count)" 
                :color="getCategoryColor(item.category)"
              />
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>难度分布</span>
          </template>
          
          <div class="chart-container">
            <div v-for="item in difficultyStats" :key="item.difficulty" class="difficulty-item">
              <div class="difficulty-info">
                <el-tag :type="getDifficultyType(item.difficulty)">
                  {{ getDifficultyName(item.difficulty) }}
                </el-tag>
                <span class="difficulty-count">{{ item.count }} 条</span>
              </div>
              <el-progress 
                :percentage="getDifficultyPercentage(item.count)" 
                :color="getDifficultyColor(item.difficulty)"
              />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card>
          <template #header>
            <span>热门知识条目</span>
          </template>
          
          <el-table :data="popularKnowledge" style="width: 100%">
            <el-table-column prop="title" label="标题" width="300">
              <template #default="scope">
                <el-link type="primary" @click="viewKnowledge(scope.row)">
                  {{ scope.row.title }}
                </el-link>
              </template>
            </el-table-column>
            <el-table-column prop="author" label="作者" width="120" />
            <el-table-column prop="category" label="分类" width="120">
              <template #default="scope">
                <el-tag :type="getCategoryType(scope.row.category)">
                  {{ getCategoryName(scope.row.category) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="likes" label="点赞数" width="100" />
            <el-table-column prop="views" label="浏览数" width="100" />
            <el-table-column prop="createdAt" label="创建时间" width="180" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { Document, User, Star, ChatDotRound } from '@element-plus/icons-vue'
import { statisticsAPI, knowledgeAPI } from '@/services/api'

export default {
  name: 'Statistics',
  components: {
    Document,
    User,
    Star,
    ChatDotRound
  },
  data() {
    return {
      stats: {
        totalKnowledge: 0,
        totalUsers: 0,
        totalLikes: 0,
        totalComments: 0
      },
      categoryStats: [],
      difficultyStats: [],
      popularKnowledge: []
    }
  },
  mounted() {
    this.loadStatistics()
  },
  methods: {
    async loadStatistics() {
      try {
        // 加载总体统计
        const statsResponse = await statisticsAPI.getStatistics()
        this.stats = statsResponse.data || {}
        
        // 加载分类统计
        const categoryResponse = await knowledgeAPI.getEntries({ groupBy: 'category' })
        this.categoryStats = categoryResponse.data || []
        
        // 加载难度统计
        const difficultyResponse = await knowledgeAPI.getEntries({ groupBy: 'difficulty' })
        this.difficultyStats = difficultyResponse.data || []
        
        // 加载热门知识条目
        const popularResponse = await knowledgeAPI.getEntries({ 
          sortBy: 'likes', 
          order: 'desc', 
          limit: 10 
        })
        this.popularKnowledge = popularResponse.data || []
      } catch (error) {
        console.error('加载统计数据失败:', error)
        this.$message.error('加载统计数据失败')
      }
    },
    viewKnowledge(item) {
      this.$router.push(`/knowledge/${item.id}`)
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
    getCategoryColor(category) {
      const colors = {
        frontend: '#409eff',
        backend: '#67c23a',
        database: '#e6a23c',
        devops: '#f56c6c'
      }
      return colors[category] || '#909399'
    },
    getCategoryPercentage(count) {
      const total = this.categoryStats.reduce((sum, item) => sum + item.count, 0)
      return total > 0 ? Math.round((count / total) * 100) : 0
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
    },
    getDifficultyColor(difficulty) {
      const colors = {
        beginner: '#67c23a',
        intermediate: '#e6a23c',
        advanced: '#f56c6c'
      }
      return colors[difficulty] || '#909399'
    },
    getDifficultyPercentage(count) {
      const total = this.difficultyStats.reduce((sum, item) => sum + item.count, 0)
      return total > 0 ? Math.round((count / total) * 100) : 0
    }
  }
}
</script>

<style scoped>
.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.chart-container {
  padding: 10px 0;
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

.category-count,
.difficulty-count {
  font-size: 14px;
  color: #666;
}
</style>