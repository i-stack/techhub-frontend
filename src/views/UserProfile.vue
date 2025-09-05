<template>
  <div class="user-profile">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>个人信息</span>
          </template>
          
          <div class="profile-info">
            <div class="avatar">
              <el-avatar :size="100" :src="userInfo.avatar">
                {{ userInfo.username?.charAt(0) }}
              </el-avatar>
            </div>
            
            <div class="user-details">
              <h3>{{ userInfo.username }}</h3>
              <p>{{ userInfo.email }}</p>
              <el-tag :type="getRoleType(userInfo.role)">
                {{ getRoleName(userInfo.role) }}
              </el-tag>
            </div>
          </div>
          
          <div class="stats">
            <div class="stat-item">
              <span class="label">知识条目:</span>
              <span class="value">{{ userStats.knowledgeCount || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="label">获得点赞:</span>
              <span class="value">{{ userStats.totalLikes || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="label">收藏数:</span>
              <span class="value">{{ userStats.favoriteCount || 0 }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="16">
        <el-card>
          <template #header>
            <span>我的知识条目</span>
          </template>
          
          <el-table :data="userKnowledge" style="width: 100%">
            <el-table-column prop="title" label="标题" width="300">
              <template #default="scope">
                <el-link type="primary" @click="viewKnowledge(scope.row)">
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
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ getStatusName(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="likes" label="点赞数" width="100" />
            <el-table-column prop="createdAt" label="创建时间" width="180" />
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button size="small" @click="editKnowledge(scope.row)">
                  编辑
                </el-button>
                <el-button size="small" type="danger" @click="deleteKnowledge(scope.row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
        
        <el-card style="margin-top: 20px;">
          <template #header>
            <span>我的收藏</span>
          </template>
          
          <el-table :data="userFavorites" style="width: 100%">
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
            <el-table-column prop="createdAt" label="收藏时间" width="180" />
            <el-table-column label="操作" width="100">
              <template #default="scope">
                <el-button size="small" type="danger" @click="removeFavorite(scope.row)">
                  取消收藏
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { knowledgeAPI, favoriteAPI, userAPI } from '@/services/api'

export default {
  name: 'UserProfile',
  data() {
    return {
      userInfo: {
        username: '当前用户',
        email: 'user@example.com',
        role: 'user',
        avatar: ''
      },
      userStats: {
        knowledgeCount: 0,
        totalLikes: 0,
        favoriteCount: 0
      },
      userKnowledge: [],
      userFavorites: []
    }
  },
  mounted() {
    this.loadUserInfo()
    this.loadUserKnowledge()
    this.loadUserFavorites()
  },
  methods: {
    async loadUserInfo() {
      try {
        // 这里应该从实际的用户API获取信息
        // const response = await userAPI.getUser('current_user_id')
        // this.userInfo = response.data
      } catch (error) {
        console.error('加载用户信息失败:', error)
      }
    },
    async loadUserKnowledge() {
      try {
        const response = await knowledgeAPI.getEntries({
          author: this.userInfo.username
        })
        this.userKnowledge = response.data || []
      } catch (error) {
        console.error('加载用户知识条目失败:', error)
      }
    },
    async loadUserFavorites() {
      try {
        const response = await favoriteAPI.getUserFavorites('current_user_id')
        this.userFavorites = response.data || []
      } catch (error) {
        console.error('加载用户收藏失败:', error)
      }
    },
    viewKnowledge(item) {
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
        this.loadUserKnowledge()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败:', error)
          this.$message.error('删除失败')
        }
      }
    },
    async removeFavorite(item) {
      try {
        await favoriteAPI.removeFromFavorites({
          userId: 'current_user_id',
          knowledgeEntryId: item.id
        })
        this.$message.success('取消收藏成功')
        this.loadUserFavorites()
      } catch (error) {
        console.error('取消收藏失败:', error)
        this.$message.error('取消收藏失败')
      }
    },
    getRoleType(role) {
      const types = {
        admin: 'danger',
        moderator: 'warning',
        user: 'success'
      }
      return types[role] || 'info'
    },
    getRoleName(role) {
      const names = {
        admin: '管理员',
        moderator: '版主',
        user: '普通用户'
      }
      return names[role] || role
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
    getStatusType(status) {
      const types = {
        draft: 'info',
        published: 'success',
        archived: 'warning'
      }
      return types[status] || 'info'
    },
    getStatusName(status) {
      const names = {
        draft: '草稿',
        published: '已发布',
        archived: '已归档'
      }
      return names[status] || status
    }
  }
}
</script>

<style scoped>
.profile-info {
  text-align: center;
  margin-bottom: 20px;
}

.avatar {
  margin-bottom: 15px;
}

.user-details h3 {
  margin: 10px 0 5px 0;
  color: #409eff;
}

.user-details p {
  margin: 5px 0 10px 0;
  color: #666;
}

.stats {
  border-top: 1px solid #ebeef5;
  padding-top: 15px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.stat-item .label {
  color: #666;
}

.stat-item .value {
  font-weight: bold;
  color: #409eff;
}
</style>