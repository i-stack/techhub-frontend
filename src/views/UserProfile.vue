<template>
  <div class="user-profile">
    <div class="page-header">
      <h1>个人中心</h1>
    </div>

    <el-row :gutter="20">
      <!-- 用户信息 -->
      <el-col :span="8">
        <el-card class="profile-card">
          <div class="profile-header">
            <el-avatar :size="80" :src="userInfo.avatar">
              {{ userInfo.username?.charAt(0) }}
            </el-avatar>
            <h2>{{ userInfo.username }}</h2>
            <p>{{ userInfo.email }}</p>
          </div>
          
          <div class="profile-stats">
            <div class="stat-item">
              <span class="stat-number">{{ userStats.entriesCount }}</span>
              <span class="stat-label">知识条目</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ userStats.commentsCount }}</span>
              <span class="stat-label">评论数</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ userStats.favoritesCount }}</span>
              <span class="stat-label">收藏数</span>
            </div>
          </div>

          <div class="profile-actions">
            <el-button type="primary" @click="editProfile">编辑资料</el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 内容区域 -->
      <el-col :span="16">
        <el-tabs v-model="activeTab" class="content-tabs">
          <!-- 我的知识条目 -->
          <el-tab-pane label="我的知识条目" name="entries">
            <div class="entries-section">
              <div class="section-header">
                <h3>我的知识条目</h3>
                <el-button type="primary" @click="$router.push('/knowledge/create')">
                  创建新条目
                </el-button>
              </div>
              
              <div v-loading="entriesLoading" class="entries-list">
                <div v-if="myEntries.length === 0" class="empty-state">
                  <el-empty description="还没有创建任何知识条目">
                    <el-button type="primary" @click="$router.push('/knowledge/create')">
                      创建第一个知识条目
                    </el-button>
                  </el-empty>
                </div>
                
                <div v-else class="entries-grid">
                  <el-card 
                    v-for="entry in myEntries" 
                    :key="entry.id"
                    class="entry-card"
                    @click="$router.push(`/knowledge/${entry.id}`)"
                  >
                    <div class="entry-header">
                      <h4 class="entry-title">{{ entry.title }}</h4>
                      <div class="entry-actions">
                        <el-button 
                          type="text" 
                          size="small"
                          @click.stop="$router.push(`/knowledge/${entry.id}/edit`)"
                        >
                          编辑
                        </el-button>
                      </div>
                    </div>
                    <p class="entry-summary">{{ entry.summary }}</p>
                    <div class="entry-meta">
                      <el-tag :type="entry.status === 'published' ? 'success' : 'warning'" size="small">
                        {{ entry.status === 'published' ? '已发布' : '草稿' }}
                      </el-tag>
                      <span class="entry-date">{{ formatDate(entry.createdAt) }}</span>
                    </div>
                  </el-card>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 我的收藏 -->
          <el-tab-pane label="我的收藏" name="favorites">
            <div class="favorites-section">
              <div class="section-header">
                <h3>我的收藏</h3>
              </div>
              
              <div v-loading="favoritesLoading" class="favorites-list">
                <div v-if="favorites.length === 0" class="empty-state">
                  <el-empty description="还没有收藏任何知识条目">
                    <el-button type="primary" @click="$router.push('/knowledge')">
                      去知识库看看
                    </el-button>
                  </el-empty>
                </div>
                
                <div v-else class="favorites-grid">
                  <el-card 
                    v-for="entry in favorites" 
                    :key="entry.id"
                    class="favorite-card"
                    @click="$router.push(`/knowledge/${entry.id}`)"
                  >
                    <div class="favorite-header">
                      <h4 class="favorite-title">{{ entry.title }}</h4>
                      <el-button 
                        type="text" 
                        size="small"
                        @click.stop="removeFavorite(entry.id)"
                      >
                        取消收藏
                      </el-button>
                    </div>
                    <p class="favorite-summary">{{ entry.summary }}</p>
                    <div class="favorite-meta">
                      <span class="favorite-author">作者: {{ entry.author?.username }}</span>
                      <span class="favorite-date">{{ formatDate(entry.createdAt) }}</span>
                    </div>
                  </el-card>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 我的评论 -->
          <el-tab-pane label="我的评论" name="comments">
            <div class="comments-section">
              <div class="section-header">
                <h3>我的评论</h3>
              </div>
              
              <div v-loading="commentsLoading" class="comments-list">
                <div v-if="myComments.length === 0" class="empty-state">
                  <el-empty description="还没有发表任何评论">
                    <el-button type="primary" @click="$router.push('/knowledge')">
                      去知识库看看
                    </el-button>
                  </el-empty>
                </div>
                
                <div v-else class="comments-grid">
                  <el-card 
                    v-for="comment in myComments" 
                    :key="comment.id"
                    class="comment-card"
                  >
                    <div class="comment-header">
                      <h4 class="comment-title">
                        <router-link :to="`/knowledge/${comment.knowledgeEntryId}`">
                          {{ comment.knowledgeEntry?.title }}
                        </router-link>
                      </h4>
                      <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
                    </div>
                    <p class="comment-content">{{ comment.content }}</p>
                  </el-card>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>

    <!-- 编辑资料对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑资料" width="500px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="editForm.email" />
        </el-form-item>
        <el-form-item label="个人简介">
          <el-input v-model="editForm.bio" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveProfile">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useKnowledgeStore } from '../stores/knowledge'
import { favoriteAPI, commentAPI } from '../services/api'
import { ElMessage } from 'element-plus'

const knowledgeStore = useKnowledgeStore()

// 响应式数据
const activeTab = ref('entries')
const entriesLoading = ref(false)
const favoritesLoading = ref(false)
const commentsLoading = ref(false)
const editDialogVisible = ref(false)

const userInfo = reactive({
  id: 1, // 临时硬编码
  username: 'TechHub用户',
  email: 'user@techhub.com',
  avatar: '',
  bio: '这是一个技术爱好者'
})

const userStats = reactive({
  entriesCount: 0,
  commentsCount: 0,
  favoritesCount: 0
})

const myEntries = ref([])
const favorites = ref([])
const myComments = ref([])

const editForm = reactive({
  username: '',
  email: '',
  bio: ''
})

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// 获取我的知识条目
const fetchMyEntries = async () => {
  entriesLoading.value = true
  try {
    const response = await knowledgeStore.fetchEntries({
      authorId: userInfo.id,
      limit: 20
    })
    myEntries.value = response.entries
    userStats.entriesCount = response.total
  } catch (error) {
    console.error('获取我的知识条目失败:', error)
  } finally {
    entriesLoading.value = false
  }
}

// 获取我的收藏
const fetchMyFavorites = async () => {
  favoritesLoading.value = true
  try {
    const response = await favoriteAPI.getUserFavorites(userInfo.id, { limit: 20 })
    favorites.value = response.data.entries
    userStats.favoritesCount = response.data.total
  } catch (error) {
    console.error('获取我的收藏失败:', error)
  } finally {
    favoritesLoading.value = false
  }
}

// 获取我的评论
const fetchMyComments = async () => {
  commentsLoading.value = true
  try {
    // 这里需要实现获取用户评论的API
    // 暂时使用模拟数据
    myComments.value = []
    userStats.commentsCount = 0
  } catch (error) {
    console.error('获取我的评论失败:', error)
  } finally {
    commentsLoading.value = false
  }
}

// 取消收藏
const removeFavorite = async (entryId) => {
  try {
    await favoriteAPI.removeFromFavorites({
      userId: userInfo.id,
      knowledgeEntryId: entryId
    })
    ElMessage.success('取消收藏成功')
    fetchMyFavorites()
  } catch (error) {
    ElMessage.error('取消收藏失败')
    console.error('取消收藏失败:', error)
  }
}

// 编辑资料
const editProfile = () => {
  editForm.username = userInfo.username
  editForm.email = userInfo.email
  editForm.bio = userInfo.bio
  editDialogVisible.value = true
}

// 保存资料
const saveProfile = async () => {
  try {
    // 这里需要实现更新用户信息的API
    userInfo.username = editForm.username
    userInfo.email = editForm.email
    userInfo.bio = editForm.bio
    editDialogVisible.value = false
    ElMessage.success('资料更新成功')
  } catch (error) {
    ElMessage.error('资料更新失败')
    console.error('资料更新失败:', error)
  }
}

onMounted(() => {
  fetchMyEntries()
  fetchMyFavorites()
  fetchMyComments()
})
</script>

<style scoped>
.user-profile {
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

.profile-card {
  text-align: center;
}

.profile-header {
  margin-bottom: 30px;
}

.profile-header h2 {
  margin: 16px 0 8px 0;
  color: #303133;
}

.profile-header p {
  margin: 0;
  color: #909399;
}

.profile-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30px;
  padding: 20px 0;
  border-top: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #409eff;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.content-tabs {
  background: white;
  border-radius: 8px;
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  color: #303133;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
}

.entries-grid,
.favorites-grid,
.comments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.entry-card,
.favorite-card,
.comment-card {
  cursor: pointer;
  transition: all 0.3s;
}

.entry-card:hover,
.favorite-card:hover,
.comment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.entry-header,
.favorite-header,
.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.entry-title,
.favorite-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #303133;
  flex: 1;
  line-height: 1.4;
}

.comment-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #303133;
  flex: 1;
}

.comment-title a {
  color: #409eff;
  text-decoration: none;
}

.comment-title a:hover {
  text-decoration: underline;
}

.entry-summary,
.favorite-summary,
.comment-content {
  color: #606266;
  line-height: 1.6;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.entry-meta,
.favorite-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #909399;
}

.comment-date {
  font-size: 12px;
  color: #909399;
}
</style>
