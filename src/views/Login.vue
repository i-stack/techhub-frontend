<template>
    <div class="login-container">
        <div class="login-card">
            <div class="login-header">
                <div class="logo">
                    <el-icon class="logo-icon" size="40">
                        <Document />
                    </el-icon>
                    <h1 class="logo-text">TechHub</h1>
                </div>
                <p class="login-subtitle">技术知识库平台</p>
            </div>

            <el-form
                ref="loginFormRef"
                :model="loginForm"
                :rules="loginRules"
                class="login-form"
                @submit.prevent="handleLogin"
            >
                <el-form-item prop="username">
                    <el-input
                        v-model="loginForm.username"
                        placeholder="请输入用户名"
                        size="large"
                        :prefix-icon="User"
                        clearable
                    />
                </el-form-item>

                <el-form-item prop="password">
                    <el-input
                        v-model="loginForm.password"
                        type="password"
                        placeholder="请输入密码"
                        size="large"
                        :prefix-icon="Lock"
                        show-password
                        clearable
                        @keyup.enter="handleLogin"
                    />
                </el-form-item>

                <el-form-item>
                    <el-checkbox v-model="loginForm.remember">
                        记住我
                    </el-checkbox>
                </el-form-item>

                <el-form-item>
                    <el-button
                        type="primary"
                        size="large"
                        class="login-button"
                        :loading="loading"
                        @click="handleLogin"
                    >
                        {{ loading ? '登录中...' : '登录' }}
                    </el-button>
                </el-form-item>
            </el-form>

            <div class="login-footer">
                <p class="demo-account">
                    演示账号：admin / admin123
                </p>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Document } from '@element-plus/icons-vue'
import { login } from '@/services/auth'

export default {
    name: 'Login',
    components: {
        User,
        Lock,
        Document
    },
    setup() {
        const router = useRouter()
        const loginFormRef = ref()
        const loading = ref(false)

        // 登录表单数据
        const loginForm = reactive({
            username: '',
            password: '',
            remember: false
        })

        // 表单验证规则
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

        // 处理登录
        const handleLogin = async () => {
            if (!loginFormRef.value) return

            try {
                const valid = await loginFormRef.value.validate()
                if (!valid) return

                loading.value = true

                const result = await login(loginForm.username, loginForm.password)

                if (result.success) {
                    ElMessage.success('登录成功！')
                    
                    // 如果选择记住我，保存用户名
                    if (loginForm.remember) {
                        localStorage.setItem('remembered_username', loginForm.username)
                    } else {
                        localStorage.removeItem('remembered_username')
                    }

                    // 跳转到首页
                    router.push('/')
                } else {
                    ElMessage.error(result.message || '登录失败')
                }
            } catch (error) {
                console.error('登录错误:', error)
                ElMessage.error(error.response?.data?.message || error.message || '登录失败，请检查网络连接')
            } finally {
                loading.value = false
            }
        }

        // 页面加载时检查是否已登录
        const checkAuth = () => {
            const token = localStorage.getItem('auth_token')
            if (token) {
                router.push('/')
            }
        }

        // 恢复记住的用户名
        const restoreUsername = () => {
            const remembered = localStorage.getItem('remembered_username')
            if (remembered) {
                loginForm.username = remembered
                loginForm.remember = true
            }
        }

        // 初始化
        checkAuth()
        restoreUsername()

        return {
            loginFormRef,
            loginForm,
            loginRules,
            loading,
            handleLogin
        }
    }
}
</script>

<style scoped>
.login-container {
    min-height: 100vh;
    background: var(--bg-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.login-card {
    width: 100%;
    max-width: 400px;
    background: var(--bg-card);
    border-radius: var(--radius-2xl);
    box-shadow: var(--shadow-xl);
    border: 1px solid var(--border-primary);
    padding: 40px;
}

.login-header {
    text-align: center;
    margin-bottom: 40px;
}

.logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 16px;
}

.logo-icon {
    color: var(--primary-color);
}

.logo-text {
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0;
}

.login-subtitle {
    color: var(--text-secondary);
    font-size: 1.1rem;
    margin: 0;
}

.login-form {
    margin-bottom: 30px;
}

.login-form .el-form-item {
    margin-bottom: 24px;
}

.login-form .el-input {
    height: 48px;
}

.login-form .el-input__wrapper {
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-primary);
    transition: all 0.3s ease;
}

.login-form .el-input__wrapper:hover {
    border-color: var(--primary-color);
    box-shadow: var(--shadow-md);
}

.login-form .el-input__wrapper.is-focus {
    border-color: var(--primary-color);
    box-shadow: var(--shadow-primary);
}

.login-button {
    width: 100%;
    height: 48px;
    background: var(--gradient-primary);
    border: none;
    border-radius: var(--radius-lg);
    font-size: 1.1rem;
    font-weight: 600;
    box-shadow: var(--shadow-primary);
    transition: all 0.3s ease;
}

.login-button:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

.login-button:active {
    transform: translateY(0);
}

.login-footer {
    text-align: center;
    padding-top: 20px;
    border-top: 1px solid var(--border-primary);
}

.demo-account {
    color: var(--text-muted);
    font-size: 0.9rem;
    margin: 0;
    padding: 12px;
    background: var(--bg-glass);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-primary);
}

/* 响应式设计 */
@media (max-width: 480px) {
    .login-container {
        padding: 10px;
    }
    
    .login-card {
        padding: 30px 20px;
    }
    
    .logo-text {
        font-size: 2rem;
    }
    
    .login-subtitle {
        font-size: 1rem;
    }
}

/* 深色主题适配 */
[data-theme="dark"] .login-card {
    background: var(--bg-card);
    border-color: var(--border-primary);
}

[data-theme="dark"] .demo-account {
    background: var(--bg-glass);
    border-color: var(--border-primary);
}
</style>
