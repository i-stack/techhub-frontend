<template>
  <div class="knowledge-list">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>知识条目列表</span>
              <el-button type="primary" @click="$router.push('/knowledge/create')">
                <el-icon><Plus /></el-icon>
                添加知识
              </el-button>
            </div>
          </template>
          
          <div class="search-bar">
            <el-input
              v-model="searchQuery"
              placeholder="搜索知识条目..."
              @input="handleSearch"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          
          <el-table 
            :data="filteredKnowledge" 
            style="width: 100%"
            v-loading="loading"
          >
            <el-table-column prop="title" label="标题" width="300">
              <template #default="scope">
                <span 
                  class="title-link" 
                  @click.prevent.stop="viewDetail(scope.row)"
                >
                  {{ scope.row.title }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="category" label="分类" width="120">
              <template #default="scope">
                <el-tag :type="getCategoryType(scope.row.category)">
                  {{ getCategoryName(scope.row.category) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="difficulty" label="难度" width="100">
              <template #default="scope">
                <el-tag :type="getDifficultyType(scope.row.difficulty)">
                  {{ getDifficultyName(scope.row.difficulty) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="author" label="作者" width="120" />
            <el-table-column prop="createdAt" label="创建时间" width="180" />
            <el-table-column prop="likes" label="点赞数" width="100" />
            <el-table-column label="操作" width="200">
              <template #default="scope">
                <el-button size="small" @click.prevent.stop="viewDetail(scope.row)">
                  查看
                </el-button>
                <el-button size="small" type="primary" @click.prevent.stop="editKnowledge(scope.row)">
                  编辑
                </el-button>
                <el-button size="small" type="danger" @click.prevent.stop="deleteKnowledge(scope.row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="pagination">
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
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { Search, Plus } from '@element-plus/icons-vue'
import { knowledgeAPI } from '@/services/api'

export default {
  name: 'KnowledgeList',
  components: {
    Search,
    Plus
  },
  data() {
    return {
      loading: false,
      searchQuery: '',
      currentPage: 1,
      pageSize: 10,
      total: 0,
      allKnowledgeData: [
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
      ],
      knowledgeList: []
    }
  },
  computed: {
    filteredKnowledge() {
      if (!this.searchQuery) {
        return this.knowledgeList
      }
      return this.knowledgeList.filter(item =>
        item.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    }
  },
  mounted() {
    this.loadKnowledgeList()
  },
  methods: {
    async loadKnowledgeList() {
      this.loading = true
      try {
        // 使用本地数据，模拟 API 调用
        await new Promise(resolve => setTimeout(resolve, 500)) // 模拟网络延迟
        
        // 根据搜索条件过滤数据
        let filteredData = this.allKnowledgeData
        if (this.searchQuery) {
          filteredData = this.allKnowledgeData.filter(item =>
            item.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            item.content.toLowerCase().includes(this.searchQuery.toLowerCase())
          )
        }
        
        // 分页处理
        const startIndex = (this.currentPage - 1) * this.pageSize
        const endIndex = startIndex + this.pageSize
        const paginatedData = filteredData.slice(startIndex, endIndex)
        
        this.knowledgeList = paginatedData
        this.total = filteredData.length
      } catch (error) {
        console.error('加载知识列表失败:', error)
        this.$message.error('加载知识列表失败')
      } finally {
        this.loading = false
      }
    },
    handleSearch() {
      this.currentPage = 1
      this.loadKnowledgeList()
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.loadKnowledgeList()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.loadKnowledgeList()
    },
    viewDetail(item) {
      console.log('Navigating to knowledge detail:', item.title, 'ID:', item.id)
      this.$router.push(`/knowledge/${item.id}`)
    },
    editKnowledge(item) {
      this.$router.push(`/knowledge/${item.id}/edit`)
    },
    deleteKnowledge(item) {
      this.$confirm('确定要删除这条知识吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
                  // 从本地数据中删除
        const index = this.allKnowledgeData.findIndex(k => k.id === item.id)
        if (index > -1) {
          this.allKnowledgeData.splice(index, 1)
        }
        this.$message.success('删除成功')
        this.loadKnowledgeList()
        } catch (error) {
          console.error('删除失败:', error)
          this.$message.error('删除失败')
        }
      }).catch(() => {
        // 用户取消删除
      })
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

.search-bar {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.title-link {
  color: var(--el-color-primary);
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s ease;
}

.title-link:hover {
  color: var(--el-color-primary-light-3);
  text-decoration: underline;
}
</style>