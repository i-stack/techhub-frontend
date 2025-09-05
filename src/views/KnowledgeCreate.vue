<template>
  <div class="knowledge-create">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>创建知识条目</span>
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
            
            <el-form-item label="附件">
              <el-upload
                class="upload-demo"
                drag
                action="#"
                :auto-upload="false"
                :on-change="handleFileChange"
                :file-list="fileList"
              >
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text">
                  将文件拖到此处，或<em>点击上传</em>
                </div>
                <template #tip>
                  <div class="el-upload__tip">
                    支持 jpg/png/gif/pdf/doc/docx 文件，且不超过 10MB
                  </div>
                </template>
              </el-upload>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="submitForm" :loading="submitting">
                创建知识条目
              </el-button>
              <el-button @click="saveDraft" :loading="savingDraft">
                保存草稿
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
import { UploadFilled } from '@element-plus/icons-vue'
import { knowledgeAPI } from '@/services/api'

export default {
  name: 'KnowledgeCreate',
  components: {
    UploadFilled
  },
  data() {
    return {
      loading: false,
      submitting: false,
      savingDraft: false,
      tagsInput: '',
      fileList: [],
      form: {
        title: '',
        category: '',
        difficulty: '',
        tags: [],
        summary: '',
        content: '',
        attachments: []
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
  methods: {
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
    handleFileChange(file, fileList) {
      this.fileList = fileList
      this.form.attachments = fileList.map(f => ({
        name: f.name,
        size: f.size,
        type: f.raw?.type
      }))
    },
    async submitForm() {
      try {
        await this.$refs.formRef.validate()
        this.submitting = true
        
        const formData = {
          ...this.form,
          status: 'published',
          author: '当前用户'
        }
        
        await knowledgeAPI.createEntry(formData)
        this.$message.success('知识条目创建成功')
        this.$router.push('/knowledge')
      } catch (error) {
        if (error !== false) { // 不是表单验证错误
          console.error('创建知识条目失败:', error)
          this.$message.error('创建失败')
        }
      } finally {
        this.submitting = false
      }
    },
    async saveDraft() {
      try {
        this.savingDraft = true
        
        const formData = {
          ...this.form,
          status: 'draft',
          author: '当前用户'
        }
        
        await knowledgeAPI.createEntry(formData)
        this.$message.success('草稿保存成功')
      } catch (error) {
        console.error('保存草稿失败:', error)
        this.$message.error('保存草稿失败')
      } finally {
        this.savingDraft = false
      }
    },
    resetForm() {
      this.$refs.formRef.resetFields()
      this.form.tags = []
      this.form.attachments = []
      this.fileList = []
      this.tagsInput = ''
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

.upload-demo {
  width: 100%;
}
</style>