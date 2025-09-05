<template>
  <el-dialog
    v-model="visible"
    title="管理员登录"
    width="400px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    center
    class="login-dialog"
  >
    <div class="login-content">
      <div class="login-header">
        <el-icon class="login-icon"><User /></el-icon>
        <h3>欢迎回来</h3>
        <p>请输入管理员账号信息</p>
      </div>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-width="0"
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="用户名"
            size="large"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            clearable
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            @click="handleLogin"
            class="login-button"
            block
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-tips">
        <el-alert
          title="提示"
          type="info"
          :closable="false"
          show-icon
        >
          <template #default>
            <p>默认账号：admin</p>
            <p>默认密码：admin123</p>
          </template>
        </el-alert>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'LoginDialog',
  components: {
    User,
    Lock
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'login-success'],
  setup(props, { emit }) {
    const authStore = useAuthStore()
    const loginFormRef = ref()
    const loading = ref(false)
    
    const visible = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    })
    
    const loginForm = reactive({
      username: '',
      password: ''
    })
    
    const loginRules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
      ]
    }
    
    const handleLogin = async () => {
      if (!loginFormRef.value) return
      
      try {
        const valid = await loginFormRef.value.validate()
        if (!valid) return
        
        loading.value = true
        
        const result = await authStore.login(loginForm.username, loginForm.password)
        
        if (result.success) {
          ElMessage.success(result.message)
          emit('login-success')
          visible.value = false
          // 重置表单
          loginForm.username = ''
          loginForm.password = ''
        } else {
          ElMessage.error(result.message)
        }
      } catch (error) {
        ElMessage.error('登录失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }
    
    return {
      visible,
      loginFormRef,
      loginForm,
      loginRules,
      loading,
      handleLogin,
      User,
      Lock
    }
  }
}
</script>

<style scoped>
.login-dialog {
  border-radius: 12px;
}

.login-content {
  padding: 20px 0;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-icon {
  font-size: 48px;
  color: var(--primary-color);
  margin-bottom: 16px;
}

.login-header h3 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
}

.login-header p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.login-form {
  margin-bottom: 20px;
}

.login-form .el-form-item {
  margin-bottom: 20px;
}

.login-button {
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  background: var(--gradient-primary);
  border: none;
  transition: all 0.3s ease;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(64, 158, 255, 0.3);
}

.login-tips {
  margin-top: 20px;
}

.login-tips .el-alert {
  border-radius: 8px;
}

.login-tips p {
  margin: 4px 0;
  font-size: 13px;
}
</style>
