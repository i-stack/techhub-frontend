<template>
  <div class="knowledge-edit">
    <div class="page-header">
      <h1>编辑知识条目</h1>
      <el-button @click="$router.go(-1)">返回</el-button>
    </div>

    <div v-loading="loading" class="edit-container">
      <el-card v-if="entry" class="form-card">
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
              更新知识条目
            </el-button>
            <el-button @click="publishEntry" :loading="publishLoading">
              发布
            </el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <div v-else-if="!loading" class="not-found">
        <el-empty description="知识条目不存在">
          <el-button type="primary" @click="$router.push('/knowledge')">
            返回知识库
          </el-button>
        </el-empty>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useKnowledgeStore } from '../stores/knowledge'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const knowledgeStore = useKnowledgeStore()

const props = defineProps({
  id: {
    type: [String, Number],
    required: true
  }
})

const formRef = ref()
const loading = ref(false)
const publishLoading = ref(false)
const tagInput = ref('')
const entry = ref(null)

const form = reactive({
  title: '',
  summary: '',
  category: '',
  difficulty: '',
  tags: [],
  content: ''
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

// 获取知识条目详情
const fetchEntry = async () => {
  loading.value = true
  try {
    const entryData = await knowledgeStore.fetchEntry(Number(props.id))
    entry.value = entryData
    
    // 填充表单数据
    form.title = entryData.title
    form.summary = entryData.summary
    form.category = entryData.category
    form.difficulty = entryData.difficulty
    form.tags = [...entryData.tags]
    form.content = entryData.content
  } catch (error) {
    ElMessage.error('获取知识条目失败')
    console.error('获取知识条目失败:', error)
  } finally {
    loading.value = false
  }
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    await knowledgeStore.updateEntry(Number(props.id), form)
    ElMessage.success('知识条目更新成功')
    router.push(`/knowledge/${props.id}`)
  } catch (error) {
    if (error !== false) {
      ElMessage.error('更新失败')
      console.error('更新知识条目失败:', error)
    }
  } finally {
    loading.value = false
  }
}

// 发布知识条目
const publishEntry = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    publishLoading.value = true
    
    await knowledgeStore.updateEntry(Number(props.id), form)
    await knowledgeStore.publishEntry(Number(props.id))
    ElMessage.success('知识条目发布成功')
    router.push(`/knowledge/${props.id}`)
  } catch (error) {
    if (error !== false) {
      ElMessage.error('发布失败')
      console.error('发布知识条目失败:', error)
    }
  } finally {
    publishLoading.value = false
  }
}

// 重置表单
const resetForm = () => {
  if (entry.value) {
    form.title = entry.value.title
    form.summary = entry.value.summary
    form.category = entry.value.category
    form.difficulty = entry.value.difficulty
    form.tags = [...entry.value.tags]
    form.content = entry.value.content
  }
  tagInput.value = ''
}

onMounted(() => {
  fetchEntry()
})
</script>

<style scoped>
.knowledge-edit {
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

.edit-container {
  min-height: 400px;
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

.not-found {
  text-align: center;
  padding: 60px 0;
}
</style>
