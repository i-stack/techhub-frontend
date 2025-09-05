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
						<el-button type="primary" circle>
							<el-icon><User /></el-icon>
						</el-button>
					</div>
				</div>
			</el-header>
			<el-main class="app-main">
				<div class="main-content">
					<router-view />
				</div>
			</el-main>
		</el-container>
	</div>
</template>

<script>
import { Cpu, House, Document, TrendCharts, User, Moon, Sunny } from '@element-plus/icons-vue'

export default {
	name: 'App',
	components: {
		Cpu,
		House,
		Document,
		TrendCharts,
		User,
		Moon,
		Sunny
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