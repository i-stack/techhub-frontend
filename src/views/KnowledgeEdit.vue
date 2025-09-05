<template>
  <div class="knowledge-edit">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>编辑知识条目</span>
              <el-button @click="$router.go(-1)">返回</el-button>
            </div>
          </template>
          
          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            label-width="100px"
            v-loading="loading"
          >
            <el-form-item label="标题" prop="title">
              <el-input
                v-model="form.title"
                placeholder="请输入知识条目标题"
                maxlength="100"
                show-word-limit
              />
            </el-form-item>
            
            <el-form-item label="分类" prop="category">
              <el-select v-model="form.category" placeholder="请选择分类">
                <el-option label="前端" value="frontend" />
                <el-option label="后端" value="backend" />
                <el-option label="数据库" value="database" />
                <el-option label="DevOps" value="devops" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="难度" prop="difficulty">
              <el-select v-model="form.difficulty" placeholder="请选择难度">
                <el-option label="初级" value="beginner" />
                <el-option label="中级" value="intermediate" />
                <el-option label="高级" value="advanced" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="标签" prop="tags">
              <el-input
                v-model="tagsInput"
                placeholder="请输入标签，用逗号分隔"
                @blur="updateTags"
              />
              <div class="tags-display">
                <el-tag
                  v-for="tag in form.tags"
                  :key="tag"
                  closable
                  @close="removeTag(tag)"
                  style="margin-right: 8px; margin-top: 8px;"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </el-form-item>
            
            <el-form-item label="摘要" prop="summary">
              <el-input
                v-model="form.summary"
                type="textarea"
                :rows="3"
                placeholder="请输入知识条目摘要"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
            
            <el-form-item label="内容" prop="content">
              <el-input
                v-model="form.content"
                type="textarea"
                :rows="15"
                placeholder="请输入知识条目详细内容"
              />
            </el-form-item>
            
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio label="draft">草稿</el-radio>
                <el-radio label="published">已发布</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="submitForm" :loading="submitting">
                保存修改
              </el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { knowledgeAPI } from '@/services/api'

export default {
  name: 'KnowledgeEdit',
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      loading: false,
      submitting: false,
      tagsInput: '',
      form: {
        title: '',
        category: '',
        difficulty: '',
        tags: [],
        summary: '',
        content: '',
        status: 'draft'
      },
      rules: {
        title: [
          { required: true, message: '请输入标题', trigger: 'blur' },
          { min: 5, max: 100, message: '标题长度在 5 到 100 个字符', trigger: 'blur' }
        ],
        category: [
          { required: true, message: '请选择分类', trigger: 'change' }
        ],
        difficulty: [
          { required: true, message: '请选择难度', trigger: 'change' }
        ],
        summary: [
          { required: true, message: '请输入摘要', trigger: 'blur' },
          { min: 10, max: 200, message: '摘要长度在 10 到 200 个字符', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入内容', trigger: 'blur' },
          { min: 50, message: '内容至少 50 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    this.loadKnowledgeDetail()
  },
  methods: {
    async loadKnowledgeDetail() {
      this.loading = true
      try {
        const response = await knowledgeAPI.getEntry(this.id)
        const data = response.data || {}
        this.form = {
          title: data.title || '',
          category: data.category || '',
          difficulty: data.difficulty || '',
          tags: data.tags || [],
          summary: data.summary || '',
          content: data.content || '',
          status: data.status || 'draft'
        }
      } catch (error) {
        console.error('加载知识详情失败:', error)
        this.$message.error('加载知识详情失败')
      } finally {
        this.loading = false
      }
    },
    updateTags() {
      if (this.tagsInput.trim()) {
        const tags = this.tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag)
        this.form.tags = [...new Set([...this.form.tags, ...tags])]
        this.tagsInput = ''
      }
    },
    removeTag(tag) {
      this.form.tags = this.form.tags.filter(t => t !== tag)
    },
    async submitForm() {
      try {
        await this.$refs.formRef.validate()
        this.submitting = true
        
        await knowledgeAPI.updateEntry(this.id, this.form)
        this.$message.success('知识条目更新成功')
        this.$router.push(`/knowledge/${this.id}`)
      } catch (error) {
        if (error !== false) { // 不是表单验证错误
          console.error('更新知识条目失败:', error)
          this.$message.error('更新失败')
        }
      } finally {
        this.submitting = false
      }
    },
    resetForm() {
      this.loadKnowledgeDetail()
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

.tags-display {
  margin-top: 8px;
}
</style>