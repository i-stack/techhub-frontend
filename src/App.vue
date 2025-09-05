<template>
	<div id="app">
		<el-container class="app-container">
			<el-header class="app-header">
				<div class="header-content">
					<div class="logo-section">
						<el-icon class="logo-icon"><Cpu /></el-icon>
						<h1 class="logo-text">TechHub</h1>
					</div>
					<el-menu
						mode="horizontal"
						:default-active="$route.path"
						router
						class="header-menu">
						<el-menu-item index="/" class="menu-item">
							<el-icon><House /></el-icon>
							<span>首页</span>
						</el-menu-item>
						<el-menu-item index="/knowledge" class="menu-item">
							<el-icon><Document /></el-icon>
							<span>知识库</span>
						</el-menu-item>
						<el-menu-item index="/statistics" class="menu-item">
							<el-icon><TrendCharts /></el-icon>
							<span>统计</span>
						</el-menu-item>
					</el-menu>
					<div class="header-actions">
						<el-button @click="toggleTheme" circle class="theme-toggle">
							<el-icon><Moon v-if="isDark" /><Sunny v-else /></el-icon>
						</el-button>
						
						<!-- 未登录状态 -->
						<el-button 
							v-if="!isLoggedIn" 
							@click="showLoginDialog = true" 
							circle 
							class="user-button"
						>
							<el-icon><User /></el-icon>
						</el-button>
						
						<!-- 已登录状态 -->
						<el-dropdown v-else @command="handleUserCommand" class="user-dropdown">
							<div class="user-info">
								<el-avatar :size="32" :src="user?.avatar" class="user-avatar">
									<el-icon><User /></el-icon>
								</el-avatar>
								<span class="user-name">{{ user?.nickName || user?.userName }}</span>
								<el-icon class="dropdown-icon"><ArrowDownBold /></el-icon>
							</div>
							<template #dropdown>
								<el-dropdown-menu>
									<el-dropdown-item command="profile">
										<el-icon><User /></el-icon>
										个人资料
									</el-dropdown-item>
									<el-dropdown-item command="logout" divided>
										<el-icon><Switch /></el-icon>
										退出登录
									</el-dropdown-item>
								</el-dropdown-menu>
							</template>
						</el-dropdown>
					</div>
				</div>
			</el-header>
			<el-main class="app-main">
				<div class="main-content">
					<router-view />
				</div>
			</el-main>
		</el-container>
		
		<!-- 登录对话框 -->
		<LoginDialog 
			v-model="showLoginDialog" 
			@login-success="handleLoginSuccess" 
		/>
	</div>
</template>

<script>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { Cpu, House, Document, TrendCharts, User, Moon, Sunny, ArrowDownBold, Switch } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import LoginDialog from '@/components/LoginDialog.vue'

export default {
	name: 'App',
	components: {
		Cpu,
		House,
		Document,
		TrendCharts,
		User,
		Moon,
		Sunny,
		ArrowDownBold,
		Switch,
		LoginDialog
	},
	setup() {
		const authStore = useAuthStore()
		const router = useRouter()
		const showLoginDialog = ref(false)
		
		// 初始化认证状态
		onMounted(() => {
			authStore.initAuth()
		})
		
		// 用户操作
		const handleUserCommand = (command) => {
			if (command === 'logout') {
				authStore.logout()
				ElMessage.success('已退出登录')
			} else if (command === 'profile') {
				// 跳转到个人资料页面
				router.push('/profile')
			}
		}
		
		const handleLoginSuccess = () => {
			ElMessage.success('登录成功！')
		}
		
		return {
			// 认证相关
			user: computed(() => authStore.user),
			isLoggedIn: computed(() => authStore.isLoggedIn),
			showLoginDialog,
			
			// 用户操作
			handleUserCommand,
			handleLoginSuccess
		}
	},
	data() {
		return {
			isDark: false
		}
	},
	mounted() {
		const savedTheme = localStorage.getItem('theme')
		if (savedTheme) {
			this.isDark = savedTheme === 'dark'
		} else {
			this.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
		}
		this.applyTheme()
	},
	methods: {
		toggleTheme() {
			this.isDark = !this.isDark
			this.applyTheme()
			localStorage.setItem('theme', this.isDark ? 'dark' : 'light')
		},
		applyTheme() {
			document.documentElement.setAttribute('data-theme', this.isDark ? 'dark' : 'light')
		}
	}
}
</script>

<style>
/* 全局样式重置和基础设置 */
* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
}

#app {
	font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	background: var(--bg-primary);
	min-height: 100vh;
}

.app-container {
	min-height: 100vh;
	background: transparent;
}

.app-header {
	background: var(--bg-card);
	backdrop-filter: blur(20px);
	box-shadow: var(--shadow-sm);
	position: sticky;
	top: 0;
	z-index: 1000;
	height: 70px !important;
	min-height: 70px;
}

.header-content {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 100%;
	max-width: 1200px;
	margin: 0 auto;
	padding: 0 20px;
}

.logo-section {
	display: flex;
	align-items: center;
	gap: 12px;
}

.logo-icon {
	font-size: 28px;
	color: var(--primary-color);
	animation: pulse 2s infinite;
}

.logo-text {
	margin: 0;
	background: var(--gradient-primary);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	font-size: 24px;
	font-weight: 700;
	letter-spacing: -0.5px;
}

.header-menu {
	border-bottom: none;
	background: transparent;
	flex: 1;
	justify-content: center;
}

.menu-item {
	display: flex;
	align-items: center;
	gap: 6px;
	margin: 0 8px;
	padding: 0 16px;
	border-radius: var(--radius-md);
	transition: all 0.3s ease;
	font-weight: 500;
	color: var(--text-secondary);
}

.menu-item:hover {
	background: var(--gradient-primary);
	color: white;
	transform: translateY(-2px);
}

.menu-item.is-active {
	background: var(--gradient-primary);
	color: white;
}

.header-actions {
	display: flex;
	align-items: center;
	gap: 12px;
}

.theme-toggle {
	background: var(--bg-glass);
	border: 1px solid var(--border-primary);
	color: var(--text-primary);
	transition: all 0.3s ease;
}

.theme-toggle:hover {
	background: var(--bg-hover);
	border-color: var(--border-hover);
}

.user-button {
	background: var(--bg-glass);
	border: 1px solid var(--border-primary);
	color: var(--text-primary);
	transition: all 0.3s ease;
}

.user-button:hover {
	background: var(--bg-hover);
	border-color: var(--border-hover);
}

.user-dropdown {
	cursor: pointer;
}

.user-info {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 4px 8px;
	border-radius: 20px;
	background: var(--bg-glass);
	border: 1px solid var(--border-primary);
	transition: all 0.3s ease;
}

.user-info:hover {
	background: var(--bg-hover);
	border-color: var(--border-hover);
}

.user-avatar {
	flex-shrink: 0;
}

.user-name {
	font-size: 14px;
	font-weight: 500;
	color: var(--text-primary);
	white-space: nowrap;
}

.dropdown-icon {
	font-size: 12px;
	color: var(--text-secondary);
	transition: transform 0.3s ease;
}

.user-dropdown:hover .dropdown-icon {
	transform: rotate(180deg);
}

.app-main {
	background: transparent;
	padding: 0;
}

.main-content {
	max-width: 1200px;
	margin: 0 auto;
	padding: 20px;
	min-height: calc(100vh - 70px);
}

/* 动画效果 */
@keyframes pulse {
	0%, 100% {
		transform: scale(1);
	}
	50% {
		transform: scale(1.1);
	}
}

@keyframes fadeInUp {
	from {
		opacity: 0;
		transform: translateY(30px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

/* 响应式设计 */
@media (max-width: 768px) {
	.header-content {
		padding: 0 16px;
	}
	
	.logo-text {
		font-size: 20px;
	}
	
	.menu-item span {
		display: none;
	}
	
	.main-content {
		padding: 16px;
	}
}

@media (max-width: 480px) {
	.header-content {
		flex-direction: column;
		height: auto;
		padding: 10px 16px;
	}
	
	.header-menu {
		margin: 10px 0;
	}
	
	.app-header {
		height: auto !important;
	}
}
</style>