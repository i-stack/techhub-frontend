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
            @row-click="viewDetail"
          >
            <el-table-column prop="title" label="标题" width="300">
              <template #default="scope">
                <el-link type="primary" @click="viewDetail(scope.row)">
                  {{ scope.row.title }}
                </el-link>
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
                <el-button size="small" @click="viewDetail(scope.row)">
                  查看
                </el-button>
                <el-button size="small" type="primary" @click="editKnowledge(scope.row)">
                  编辑
                </el-button>
                <el-button size="small" type="danger" @click="deleteKnowledge(scope.row)">
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
        const params = {
          page: this.currentPage,
          pageSize: this.pageSize,
          search: this.searchQuery
        }
        const response = await knowledgeAPI.getEntries(params)
        this.knowledgeList = response.data || []
        this.total = response.total || 0
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
      this.$router.push(`/knowledge/${item.id}`)
    },
    editKnowledge(item) {
      this.$router.push(`/knowledge/${item.id}/edit`)
    },
    async deleteKnowledge(item) {
      try {
        await this.$confirm('确定要删除这条知识吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        await knowledgeAPI.deleteEntry(item.id)
        this.$message.success('删除成功')
        this.loadKnowledgeList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败:', error)
          this.$message.error('删除失败')
        }
      }
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
</style>