<template>
  <div class="knowledge-create">
    <div class="page-header">
      <h1>创建知识条目</h1>
      <el-button @click="$router.go(-1)">返回</el-button>
    </div>

    <el-card class="form-card">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        @submit.prevent="submitForm"
      >
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="form.title"
            placeholder="请输入知识条目标题"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="摘要" prop="summary">
          <el-input
            v-model="form.summary"
            type="textarea"
            :rows="3"
            placeholder="请输入知识条目摘要"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择分类">
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
        </el-form-item>

        <el-form-item label="难度" prop="difficulty">
          <el-select v-model="form.difficulty" placeholder="请选择难度">
            <el-option label="初级" value="beginner" />
            <el-option label="中级" value="intermediate" />
            <el-option label="高级" value="advanced" />
            <el-option label="专家" value="expert" />
          </el-select>
        </el-form-item>

        <el-form-item label="标签">
          <el-input
            v-model="tagInput"
            placeholder="输入标签后按回车添加"
            @keyup.enter="addTag"
          />
          <div class="tags-container">
            <el-tag
              v-for="tag in form.tags"
              :key="tag"
              closable
              @close="removeTag(tag)"
            >
              {{ tag }}
            </el-tag>
          </div>
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="15"
            placeholder="请输入知识条目内容（支持Markdown格式）"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="loading">
            创建知识条目
          </el-button>
          <el-button @click="saveDraft" :loading="draftLoading">
            保存草稿
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useKnowledgeStore } from '../stores/knowledge'
import { ElMessage } from 'element-plus'

const router = useRouter()
const knowledgeStore = useKnowledgeStore()

const formRef = ref()
const loading = ref(false)
const draftLoading = ref(false)
const tagInput = ref('')

const form = reactive({
  title: '',
  summary: '',
  category: '',
  difficulty: '',
  tags: [],
  content: '',
  authorId: 1 // 临时硬编码
})

const rules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 5, max: 200, message: '标题长度在 5 到 200 个字符', trigger: 'blur' }
  ],
  summary: [
    { required: true, message: '请输入摘要', trigger: 'blur' },
    { min: 10, max: 500, message: '摘要长度在 10 到 500 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  difficulty: [
    { required: true, message: '请选择难度', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' },
    { min: 50, message: '内容至少需要 50 个字符', trigger: 'blur' }
  ]
}

// 添加标签
const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && !form.tags.includes(tag)) {
    form.tags.push(tag)
    tagInput.value = ''
  }
}

// 移除标签
const removeTag = (tag) => {
  const index = form.tags.indexOf(tag)
  if (index > -1) {
    form.tags.splice(index, 1)
  }
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    const entry = await knowledgeStore.createEntry(form)
    ElMessage.success('知识条目创建成功')
    router.push(`/knowledge/${entry.id}`)
  } catch (error) {
    if (error !== false) { // 验证失败时error为false
      ElMessage.error('创建失败')
      console.error('创建知识条目失败:', error)
    }
  } finally {
    loading.value = false
  }
}

// 保存草稿
const saveDraft = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    draftLoading.value = true
    
    const draftData = { ...form, status: 'draft' }
    const entry = await knowledgeStore.createEntry(draftData)
    ElMessage.success('草稿保存成功')
    router.push(`/knowledge/${entry.id}`)
  } catch (error) {
    if (error !== false) {
      ElMessage.error('保存草稿失败')
      console.error('保存草稿失败:', error)
    }
  } finally {
    draftLoading.value = false
  }
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  form.tags = []
  tagInput.value = ''
}
</script>

<style scoped>
.knowledge-create {
  max-width: 800px;
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

.form-card {
  padding: 30px;
}

.tags-container {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
