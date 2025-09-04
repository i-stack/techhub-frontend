<template>
  <div class="knowledge-list">
    <div class="page-header">
      <h1>知识库</h1>
      <el-button type="primary" @click="$router.push('/knowledge/create')">
        <el-icon><Plus /></el-icon>
        创建知识条目
      </el-button>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="filter-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索知识条目..."
            @input="handleSearch"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-select v-model="selectedCategory" placeholder="选择分类" @change="handleFilterChange" clearable>
            <el-option label="全部" value="" />
            <el-option label="前端开发" value="frontend" />
            <el-option label="后端开发" value="backend" />
            <el-option label="移动开发" value="mobile" />
            <el-option label="数据库" value="database" />
            <el-option label="运维部署" value="devops" />
            <el-option label="人工智能" value="ai" />
            <el-option label="安全防护" value="security" />
            <el-option label="开发工具" value="tools" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="selectedDifficulty" placeholder="选择难度" @change="handleFilterChange" clearable>
            <el-option label="全部" value="" />
            <el-option label="初级" value="beginner" />
            <el-option label="中级" value="intermediate" />
            <el-option label="高级" value="advanced" />
            <el-option label="专家" value="expert" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="sortBy" placeholder="排序方式" @change="handleSortChange">
            <el-option label="最新创建" value="createdAt" />
            <el-option label="最新更新" value="updatedAt" />
            <el-option label="最多浏览" value="viewCount" />
            <el-option label="最多点赞" value="likeCount" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button @click="resetFilters">重置筛选</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 知识条目列表 -->
    <div v-loading="loading" class="entries-container">
      <div v-if="entries.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无知识条目">
          <el-button type="primary" @click="$router.push('/knowledge/create')">
            创建第一个知识条目
          </el-button>
        </el-empty>
      </div>

      <div v-else class="entries-grid">
        <el-card 
          v-for="entry in entries" 
          :key="entry.id"
          class="entry-card"
          @click="goToDetail(entry.id)"
        >
          <div class="entry-header">
            <h3 class="entry-title">{{ entry.title }}</h3>
            <div class="entry-actions">
              <el-button 
                type="text" 
                size="small"
                @click.stop="editEntry(entry.id)"
              >
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button 
                type="text" 
                size="small"
                @click.stop="deleteEntry(entry.id)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>

          <p class="entry-summary">{{ entry.summary }}</p>

          <div class="entry-tags">
            <el-tag :type="getCategoryTagType(entry.category)" size="small">
              {{ getCategoryName(entry.category) }}
            </el-tag>
            <el-tag :type="getDifficultyTagType(entry.difficulty)" size="small">
              {{ getDifficultyName(entry.difficulty) }}
            </el-tag>
            <el-tag 
              v-for="tag in entry.tags" 
              :key="tag"
              size="small"
              effect="plain"
            >
              {{ tag }}
            </el-tag>
          </div>

          <div class="entry-meta">
            <div class="entry-author">
              <el-avatar :size="24" :src="entry.author?.avatar">
                {{ entry.author?.username?.charAt(0) }}
              </el-avatar>
              <span>{{ entry.author?.username }}</span>
            </div>
            <div class="entry-stats">
              <span><el-icon><View /></el-icon> {{ entry.viewCount }}</span>
              <span><el-icon><Star /></el-icon> {{ entry.likeCount }}</span>
              <span><el-icon><ChatDotRound /></el-icon> {{ entry.comments?.length || 0 }}</span>
            </div>
          </div>

          <div class="entry-footer">
            <span class="entry-date">{{ formatDate(entry.createdAt) }}</span>
            <el-tag 
              :type="entry.status === 'published' ? 'success' : 'warning'" 
              size="small"
            >
              {{ entry.status === 'published' ? '已发布' : '草稿' }}
            </el-tag>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="total > 0" class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useKnowledgeStore } from '../stores/knowledge'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, Search, Edit, Delete, View, Star, ChatDotRound 
} from '@element-plus/icons-vue'

const router = useRouter()
const knowledgeStore = useKnowledgeStore()

// 响应式数据
const loading = ref(false)
const entries = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 筛选条件
const searchKeyword = ref('')
const selectedCategory = ref('')
const selectedDifficulty = ref('')
const sortBy = ref('createdAt')

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
  return date.toLocaleDateString('zh-CN')
}

// 获取知识条目列表
const fetchEntries = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      search: searchKeyword.value,
      category: selectedCategory.value,
      difficulty: selectedDifficulty.value,
      sortBy: sortBy.value,
      sortOrder: 'DESC'
    }

    const response = await knowledgeStore.fetchEntries(params)
    entries.value = response.entries
    total.value = response.total
  } catch (error) {
    ElMessage.error('获取知识条目列表失败')
    console.error('获取知识条目列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
  fetchEntries()
}

// 筛选条件变化处理
const handleFilterChange = () => {
  currentPage.value = 1
  fetchEntries()
}

// 排序变化处理
const handleSortChange = () => {
  currentPage.value = 1
  fetchEntries()
}

// 重置筛选条件
const resetFilters = () => {
  searchKeyword.value = ''
  selectedCategory.value = ''
  selectedDifficulty.value = ''
  sortBy.value = 'createdAt'
  currentPage.value = 1
  fetchEntries()
}

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchEntries()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchEntries()
}

// 跳转到详情页
const goToDetail = (id) => {
  router.push(`/knowledge/${id}`)
}

// 编辑知识条目
const editEntry = (id) => {
  router.push(`/knowledge/${id}/edit`)
}

// 删除知识条目
const deleteEntry = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个知识条目吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await knowledgeStore.deleteEntry(id)
    ElMessage.success('删除成功')
    fetchEntries()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error('删除知识条目失败:', error)
    }
  }
}

// 监听路由变化
watch(() => router.currentRoute.value.query, () => {
  const query = router.currentRoute.value.query
  if (query.category) selectedCategory.value = query.category
  if (query.difficulty) selectedDifficulty.value = query.difficulty
  if (query.search) searchKeyword.value = query.search
  fetchEntries()
}, { immediate: true })

onMounted(() => {
  fetchEntries()
})
</script>

<style scoped>
.knowledge-list {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  color: #303133;
}

.filter-card {
  margin-bottom: 20px;
}

.entries-container {
  min-height: 400px;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
}

.entries-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.entry-card {
  cursor: pointer;
  transition: all 0.3s;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.entry-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.entry-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.entry-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #303133;
  flex: 1;
  line-height: 1.4;
}

.entry-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s;
}

.entry-card:hover .entry-actions {
  opacity: 1;
}

.entry-summary {
  color: #606266;
  line-height: 1.6;
  margin: 0 0 16px 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.entry-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.entry-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.entry-author {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
}

.entry-stats {
  display: flex;
  gap: 12px;
  font-size: 14px;
  color: #909399;
}

.entry-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.entry-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #909399;
  margin-top: auto;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}
</style>
