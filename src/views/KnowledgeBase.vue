<template>
  <div class="knowledge-base">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">
            <el-icon><Document /></el-icon>
            知识库
          </h1>
          <p class="page-subtitle">管理和分享你的技术知识</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="showAddDialog = true" class="add-button">
            <el-icon><Plus /></el-icon>
            添加知识
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
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          <div class="filter-bar">
            <el-select v-model="selectedCategory" placeholder="选择分类" clearable>
              <el-option label="全部" value="" />
              <el-option label="前端" value="frontend" />
              <el-option label="后端" value="backend" />
              <el-option label="数据库" value="database" />
              <el-option label="DevOps" value="devops" />
            </el-select>
            <el-select v-model="selectedDifficulty" placeholder="选择难度" clearable>
              <el-option label="全部" value="" />
              <el-option label="初级" value="beginner" />
              <el-option label="中级" value="intermediate" />
              <el-option label="高级" value="advanced" />
            </el-select>
            <el-button @click="resetFilters" class="reset-button">
              <el-icon><Refresh /></el-icon>
              重置
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
            @row-click="viewKnowledge"
            class="knowledge-table"
            :row-class-name="getRowClassName"
          >
            <el-table-column prop="title" label="标题" min-width="300">
              <template #default="scope">
                <div class="title-cell">
                  <el-link type="primary" @click="viewKnowledge(scope.row)" class="title-link">
                    {{ scope.row.title }}
                  </el-link>
                  <p class="title-excerpt">{{ scope.row.content.substring(0, 100) }}...</p>
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
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="scope">
                <el-button size="small" @click="viewKnowledge(scope.row)">
                  <el-icon><Document /></el-icon>
                  查看
                </el-button>
                <el-button size="small" type="primary" @click="editKnowledge(scope.row)">
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button size="small" type="danger" @click="deleteKnowledge(scope.row)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
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
              @click="viewKnowledge(item)"
            >
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
            <el-option label="前端" value="frontend" />
            <el-option label="后端" value="backend" />
            <el-option label="数据库" value="database" />
            <el-option label="DevOps" value="devops" />
          </el-select>
        </el-form-item>
        <el-form-item label="难度">
          <el-select v-model="newKnowledge.difficulty" placeholder="选择难度">
            <el-option label="初级" value="beginner" />
            <el-option label="中级" value="intermediate" />
            <el-option label="高级" value="advanced" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容">
          <el-input
            v-model="newKnowledge.content"
            type="textarea"
            :rows="6"
            placeholder="请输入知识内容..."
          />
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
  data() {
    return {
      loading: false,
      searchQuery: '',
      selectedCategory: '',
      selectedDifficulty: '',
      viewMode: 'table',
      showAddDialog: false,
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
          content: 'Vue 3 的组合式 API 提供了更好的代码组织和复用性，让组件逻辑更加清晰和可维护。通过 setup 函数，我们可以更好地组织代码，提高代码的可读性和复用性。'
        },
        {
          id: 2,
          title: 'Node.js 性能优化技巧',
          category: 'backend',
          difficulty: 'intermediate',
          author: '李四',
          createdAt: '2024-01-14',
          content: 'Node.js 应用性能优化的几个关键技巧，包括事件循环优化、内存管理、异步处理等。通过合理的架构设计和性能调优，可以显著提升应用的响应速度和并发处理能力。'
        },
        {
          id: 3,
          title: 'MySQL 索引优化策略',
          category: 'database',
          difficulty: 'advanced',
          author: '王五',
          createdAt: '2024-01-13',
          content: 'MySQL 数据库索引优化的核心策略和最佳实践，包括索引类型选择、复合索引设计、查询优化等。通过合理的索引设计，可以大幅提升数据库查询性能。'
        },
        {
          id: 4,
          title: 'Docker 容器化部署指南',
          category: 'devops',
          difficulty: 'intermediate',
          author: '赵六',
          createdAt: '2024-01-12',
          content: 'Docker 容器化部署的完整指南，包括镜像构建、容器编排、网络配置、数据持久化等。通过容器化技术，可以实现应用的快速部署和扩展。'
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
      this.$alert(item.content, item.title, {
        confirmButtonText: '确定',
        dangerouslyUseHTMLString: true
      })
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
  color: white;
  margin: 0 0 8px 0;
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  margin: 0;
}

.add-button {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  padding: 12px 24px;
  font-weight: 600;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

/* 搜索区域样式 */
.search-section {
  margin-bottom: 24px;
}

.search-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  overflow: hidden;
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
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  transition: all 0.3s ease;
}

.reset-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 知识列表区域样式 */
.knowledge-list-section {
  margin-bottom: 24px;
}

.list-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  overflow: hidden;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.total-count {
  color: rgba(255, 255, 255, 0.8);
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
  background: rgba(255, 255, 255, 0.05);
}

.knowledge-table :deep(.el-table__header th) {
  background: transparent;
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: 600;
}

.knowledge-table :deep(.el-table__body tr) {
  background: transparent;
  transition: all 0.3s ease;
}

.knowledge-table :deep(.el-table__body tr:hover) {
  background: rgba(255, 255, 255, 0.05);
}

.knowledge-table :deep(.el-table__body td) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: white;
}

.knowledge-table :deep(.even-row) {
  background: rgba(255, 255, 255, 0.02);
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
  color: #667eea;
  text-decoration: none;
  transition: all 0.3s ease;
}

.title-link:hover {
  color: #764ba2;
  text-decoration: underline;
}

.title-excerpt {
  color: rgba(255, 255, 255, 0.6);
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
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.knowledge-card:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.knowledge-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(135deg, #667eea, #764ba2);
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
  color: white;
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
  color: rgba(255, 255, 255, 0.8);
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
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  font-weight: 500;
}

.date {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
}

.card-actions {
  display: flex;
  gap: 6px;
}

/* 对话框样式优化 */
:deep(.el-dialog) {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

:deep(.el-dialog__header) {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 16px 16px 0 0;
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
  
  .card-view {
    padding: 16px;
  }
  
  .knowledge-card {
    padding: 16px;
  }
}
</style>
