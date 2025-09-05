<template>
  <div class="comment-section">
    <div class="comment-header">
      <h3 class="comment-title">
        <el-icon><ChatDotRound /></el-icon>
        评论 ({{ comments.length }})
      </h3>
    </div>

    <!-- 添加评论 -->
    <div class="add-comment">
      <el-input
        v-model="newComment"
        type="textarea"
        :rows="3"
        placeholder="写下你的评论..."
        maxlength="500"
        show-word-limit
        class="comment-input"
      />
      <div class="comment-actions">
        <el-button 
          type="primary" 
          @click="submitComment"
          :loading="submitting"
          :disabled="!newComment.trim()"
        >
          <el-icon><Position /></el-icon>
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
        <div class="comment-avatar">
          <el-avatar :size="40" :src="comment.avatar">
            <el-icon><User /></el-icon>
          </el-avatar>
        </div>
        <div class="comment-content">
          <div class="comment-header">
            <span class="comment-author">{{ comment.author }}</span>
            <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
          </div>
          <div class="comment-text">{{ comment.content }}</div>
          <div class="comment-actions">
            <el-button 
              size="small" 
              text 
              @click="toggleLike(comment)"
              :class="{ liked: comment.isLiked }"
            >
              <el-icon><Star /></el-icon>
              {{ comment.likes || 0 }}
            </el-button>
            <el-button 
              size="small" 
              text 
              @click="replyToComment(comment)"
            >
              <el-icon><ChatDotRound /></el-icon>
              回复
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="comments.length === 0" class="empty-comments">
      <el-icon class="empty-icon"><ChatDotRound /></el-icon>
      <p>还没有评论，来抢沙发吧！</p>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { ChatDotRound, Position, User, Star } from '@element-plus/icons-vue'
import { aiModerationService } from '@/services/aiModeration'

export default {
  name: 'CommentSection',
  components: {
    ChatDotRound,
    Position,
    User,
    Star
  },
  props: {
    knowledgeId: {
      type: [String, Number],
      required: true
    },
    comments: {
      type: Array,
      default: () => []
    }
  },
  emits: ['comment-added', 'comment-liked'],
  setup(props, { emit }) {
    const newComment = ref('')
    const submitting = ref(false)

    // 提交评论
    const submitComment = async () => {
      if (!newComment.value.trim()) return

      submitting.value = true

      try {
        // AI审核评论
        const moderation = await aiModerationService.moderateComment(newComment.value)
        
        if (!moderation.approved) {
          ElMessage.warning(moderation.reason)
          return
        }

        // 创建评论对象
        const comment = {
          id: Date.now(),
          knowledgeId: props.knowledgeId,
          author: '游客',
          avatar: 'https://avatars.githubusercontent.com/u/0?v=4',
          content: newComment.value,
          likes: 0,
          isLiked: false,
          createdAt: new Date(),
          moderation: moderation
        }

        // 发送事件给父组件
        emit('comment-added', comment)
        
        // 清空输入框
        newComment.value = ''
        
        ElMessage.success('评论发表成功！')
      } catch (error) {
        ElMessage.error('评论发表失败，请稍后重试')
        console.error('评论提交错误:', error)
      } finally {
        submitting.value = false
      }
    }

    // 点赞评论
    const toggleLike = (comment) => {
      comment.isLiked = !comment.isLiked
      comment.likes += comment.isLiked ? 1 : -1
      emit('comment-liked', comment)
    }

    // 回复评论
    const replyToComment = (comment) => {
      newComment.value = `@${comment.author} `
      // 聚焦到输入框
      setTimeout(() => {
        const input = document.querySelector('.comment-input textarea')
        if (input) input.focus()
      }, 100)
    }

    // 格式化时间
    const formatTime = (date) => {
      const now = new Date()
      const diff = now - new Date(date)
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(diff / 3600000)
      const days = Math.floor(diff / 86400000)

      if (minutes < 1) return '刚刚'
      if (minutes < 60) return `${minutes}分钟前`
      if (hours < 24) return `${hours}小时前`
      if (days < 7) return `${days}天前`
      
      return new Date(date).toLocaleDateString()
    }

    return {
      newComment,
      submitting,
      submitComment,
      toggleLike,
      replyToComment,
      formatTime
    }
  }
}
</script>

<style scoped>
.comment-section {
  margin-top: 30px;
  padding: 20px;
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-primary);
}

.comment-header {
  margin-bottom: 20px;
}

.comment-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.add-comment {
  margin-bottom: 30px;
  padding: 20px;
  background: var(--bg-glass);
  border-radius: 8px;
  border: 1px solid var(--border-primary);
}

.comment-input {
  margin-bottom: 15px;
}

.comment-input :deep(.el-textarea__inner) {
  border-radius: 8px;
  border: 1px solid var(--border-primary);
  background: var(--bg-primary);
  color: var(--text-primary);
  resize: none;
}

.comment-input :deep(.el-textarea__inner):focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.comment-actions {
  display: flex;
  justify-content: flex-end;
}

.comments-list {
  space-y: 16px;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-light);
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-avatar {
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.comment-author {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 14px;
}

.comment-time {
  font-size: 12px;
  color: var(--text-secondary);
}

.comment-text {
  color: var(--text-primary);
  line-height: 1.6;
  margin-bottom: 12px;
  white-space: pre-wrap;
  word-break: break-word;
}

.comment-actions {
  display: flex;
  gap: 16px;
}

.comment-actions .el-button {
  padding: 4px 8px;
  font-size: 12px;
  color: var(--text-secondary);
}

.comment-actions .el-button:hover {
  color: var(--primary-color);
}

.comment-actions .el-button.liked {
  color: var(--primary-color);
}

.empty-comments {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-comments p {
  margin: 0;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .comment-section {
    padding: 16px;
  }
  
  .add-comment {
    padding: 16px;
  }
  
  .comment-item {
    gap: 8px;
  }
  
  .comment-actions {
    gap: 12px;
  }
}
</style>
