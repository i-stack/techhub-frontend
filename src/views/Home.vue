<template>
	<div class="home">
		<!-- 英雄区域 -->
		<div class="hero-section">
			<div class="hero-content">
				<h1 class="hero-title">
					<span class="gradient-text">TechHub</span>
					<br>技术知识库平台
				</h1>
				<p class="hero-subtitle">
					分享、学习和探索技术知识的最佳平台
					<br>与全球开发者一起成长
				</p>
				<div class="hero-actions">
					<el-button type="primary" size="large" @click="$router.push('/knowledge')" class="cta-button">
						<el-icon><Plus /></el-icon>
						开始探索
					</el-button>
					<el-button size="large" @click="scrollToFeatures" class="secondary-button">
						<el-icon><ArrowDown /></el-icon>
						了解更多
					</el-button>
				</div>
			</div>
			<div class="hero-visual">
				<div class="floating-cards">
					<div class="floating-card card-1">
						<el-icon><Document /></el-icon>
					</div>
					<div class="floating-card card-2">
						<el-icon><DataBoard /></el-icon>
					</div>
					<div class="floating-card card-3">
						<el-icon><Connection /></el-icon>
					</div>
				</div>
			</div>
		</div>

		<!-- 功能特性区域 -->
		<div class="features-section" ref="featuresSection">
			<h2 class="section-title">为什么选择 TechHub？</h2>
			<el-row :gutter="24" class="features-grid">
				<el-col :xs="24" :sm="12" :md="8" v-for="(feature, index) in features" :key="index">
					<div class="feature-card" :class="`feature-${index + 1}`">
						<div class="feature-icon">
							<el-icon><component :is="feature.icon" /></el-icon>
						</div>
						<h3 class="feature-title">{{ feature.title }}</h3>
						<p class="feature-description">{{ feature.description }}</p>
						<div class="feature-stats">
							<span class="stat-number">{{ feature.stats }}</span>
							<span class="stat-label">{{ feature.label }}</span>
						</div>
					</div>
				</el-col>
			</el-row>
		</div>

		<!-- 统计数据区域 -->
		<div class="stats-section">
			<div class="stats-container">
				<div class="stat-item" v-for="(stat, index) in stats" :key="index">
					<div class="stat-number">{{ stat.number }}</div>
					<div class="stat-label">{{ stat.label }}</div>
				</div>
			</div>
		</div>

		<!-- 快速开始区域 -->
		<div class="quick-start-section">
			<div class="quick-start-card">
				<div class="quick-start-content">
					<h3>快速开始</h3>
					<p>立即加入我们的技术社区，开始你的知识分享之旅</p>
					<div class="quick-actions">
						<el-button type="primary" @click="$router.push('/knowledge')">
							<el-icon><Plus /></el-icon>
							创建知识条目
						</el-button>
						<el-button @click="$router.push('/statistics')">
							<el-icon><TrendCharts /></el-icon>
							查看统计
						</el-button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { 
	Document, 
	Search, 
	Star, 
	ArrowDown, 
	DataBoard, 
	Connection, 
	Plus, 
	TrendCharts 
} from '@element-plus/icons-vue'

export default {
	name: 'Home',
	components: {
		Document,
		Search,
		Star,
		ArrowDown,
		DataBoard,
		Connection,
		Plus,
		TrendCharts
	},
	data() {
		return {
			features: [
				{
					icon: 'Document',
					title: '知识分享',
					description: '分享你的技术经验和知识，帮助其他开发者成长',
					stats: '1000+',
					label: '知识条目'
				},
				{
					icon: 'Search',
					title: '智能搜索',
					description: '快速搜索和发现相关的技术知识和解决方案',
					stats: '99%',
					label: '搜索准确率'
				},
				{
					icon: 'Star',
					title: '社区互动',
					description: '与技术社区互动，讨论和分享最新的技术趋势',
					stats: '500+',
					label: '活跃用户'
				}
			],
			stats: [
				{ number: '1000+', label: '知识条目' },
				{ number: '500+', label: '活跃用户' },
				{ number: '50+', label: '技术分类' },
				{ number: '99%', label: '用户满意度' }
			]
		}
	},
	methods: {
		scrollToFeatures() {
			this.$refs.featuresSection.scrollIntoView({ 
				behavior: 'smooth' 
			})
		}
	}
}
</script>

<style scoped>
.home {
  animation: fadeInUp 0.8s ease-out;
}

/* 英雄区域样式 */
.hero-section {
	display: flex;
	align-items: center;
	min-height: 50vh;
	padding: 50px 0;
	position: relative;
	overflow: hidden;
	width: 100%;
	max-width: 100%;
	background: var(--bg-card);
	border-radius: var(--radius-2xl);
	margin: 20px 0;
	box-shadow: var(--shadow-lg);
	border: 1px solid var(--border-primary);
}

.hero-content {
	flex: 1;
	z-index: 2;
	max-width: 55%;
	padding: 0 35px;
}

.hero-title {
	font-size: 3.2rem;
	font-weight: 800;
	line-height: 1.1;
	margin-bottom: 20px;
	color: var(--text-primary);
}

.gradient-text {
	background: var(--gradient-primary);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	background-size: 200% 200%;
	animation: gradientShift 3s ease-in-out infinite;
}

.hero-subtitle {
	font-size: 1.2rem;
	color: var(--text-secondary);
	margin-bottom: 32px;
	line-height: 1.6;
}

.hero-actions {
	display: flex;
	gap: 16px;
	flex-wrap: wrap;
}

.cta-button {
	background: var(--gradient-primary);
	border: none;
	padding: 16px 32px;
	font-size: 1.1rem;
	font-weight: 600;
	border-radius: var(--radius-lg);
	box-shadow: var(--shadow-primary);
	transition: all 0.3s ease;
	color: white;
}

.cta-button:hover {
	transform: translateY(-2px);
	box-shadow: 0 12px 40px rgba(37, 99, 235, 0.4);
}

.secondary-button {
	background: var(--bg-glass);
	border: 2px solid var(--border-primary);
	color: var(--text-primary);
	padding: 16px 32px;
	font-size: 1.1rem;
	font-weight: 600;
	border-radius: var(--radius-lg);
	backdrop-filter: blur(10px);
	transition: all 0.3s ease;
}

.secondary-button:hover {
	background: var(--bg-hover);
	transform: translateY(-2px);
	border-color: var(--border-hover);
}

/* 英雄区域视觉效果 */
.hero-visual {
	flex: 1;
	position: relative;
	height: 300px;
	max-width: 45%;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 20px;
}

.floating-cards {
	position: relative;
	width: 100%;
	height: 100%;
}

.floating-card {
	position: absolute;
	width: 70px;
	height: 70px;
	background: var(--bg-card);
	backdrop-filter: blur(20px);
	border: 1px solid var(--border-primary);
	border-radius: var(--radius-xl);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 1.8rem;
	color: var(--primary-color);
	animation: float 6s ease-in-out infinite;
	box-shadow: var(--shadow-md);
}

.card-1 {
	top: 15%;
	left: 25%;
	animation-delay: 0s;
}

.card-2 {
	top: 45%;
	right: 25%;
	animation-delay: 2s;
}

.card-3 {
	bottom: 15%;
	left: 45%;
	animation-delay: 4s;
}

/* 功能特性区域 */
.features-section {
	padding: 40px 40px;
	background: var(--bg-card);
	backdrop-filter: blur(20px);
	border-radius: var(--radius-2xl);
	margin: 30px 0;
	width: 100%;
	max-width: 100%;
	overflow: hidden;
	border: 1px solid var(--border-primary);
	box-shadow: var(--shadow-lg);
}

.section-title {
	text-align: center;
	font-size: 2.3rem;
	font-weight: 700;
	color: var(--text-primary);
	margin-bottom: 35px;
}

.features-grid {
	max-width: 1000px;
	margin: 0 auto;
}

.feature-card {
	background: var(--bg-card);
	backdrop-filter: blur(20px);
	border: 1px solid var(--border-primary);
	border-radius: var(--radius-xl);
	padding: 30px 20px;
	text-align: center;
	transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	position: relative;
	overflow: hidden;
	margin-bottom: 20px;
	box-shadow: var(--shadow-sm);
	cursor: pointer;
}

.feature-card:hover {
	transform: translateY(-12px) scale(1.02);
	background: var(--bg-hover);
	box-shadow: var(--shadow-xl);
	border-color: var(--border-hover);
}

.feature-card:hover .feature-icon {
  	transform: scale(1.1) rotate(5deg);
}

.feature-card:hover .feature-title {
  	color: var(--primary-color);
}

.feature-card::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 4px;
	background: var(--gradient-primary);
}

.feature-icon {
	width: 80px;
	height: 80px;
	margin: 0 auto 24px;
	background: var(--gradient-primary);
	border-radius: var(--radius-xl);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 2rem;
	color: white;
	transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.feature-title {
	font-size: 1.5rem;
	font-weight: 700;
	color: var(--text-primary);
	margin-bottom: 16px;
	transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.feature-description {
	color: var(--text-secondary);
	line-height: 1.6;
	margin-bottom: 24px;
}

.feature-stats {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4px;
}

.stat-number {
	font-size: 2rem;
	font-weight: 800;
	color: var(--primary-color);
}

.stat-label {
	font-size: 0.9rem;
	color: var(--text-muted);
}

/* 统计数据区域 */
.stats-section {
	padding: 40px 40px;
	margin: 30px 0;
	background: var(--bg-card);
	border-radius: var(--radius-2xl);
	box-shadow: var(--shadow-lg);
	border: 1px solid var(--border-primary);
}

.stats-container {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
	gap: 30px;
	max-width: 800px;
	margin: 0 auto;
}

.stat-item {
	text-align: center;
	padding: 20px 12px;
	background: var(--bg-card);
	backdrop-filter: blur(20px);
	border: 1px solid var(--border-primary);
	border-radius: var(--radius-xl);
	transition: all 0.3s ease;
	box-shadow: var(--shadow-sm);
}

.stat-item:hover {
	transform: translateY(-4px);
	background: var(--bg-hover);
	box-shadow: var(--shadow-md);
	border-color: var(--border-hover);
}

.stat-number {
	font-size: 3rem;
	font-weight: 800;
	color: var(--primary-color);
	margin-bottom: 8px;
}

.stat-label {
	font-size: 1.1rem;
	color: var(--text-secondary);
	font-weight: 500;
}

/* 快速开始区域 */
.quick-start-section {
	margin: 30px 0;
	padding: 0;
}

.quick-start-card {
	background: var(--bg-card);
	backdrop-filter: blur(20px);
	border: 1px solid var(--border-primary);
	border-radius: var(--radius-2xl);
	overflow: hidden;
	box-shadow: var(--shadow-lg);
	width: 100%;
	max-width: 100%;
}

.quick-start-content {
	text-align: center;
	padding: 50px 40px;
}

.quick-start-content h3 {
	font-size: 1.8rem;
	font-weight: 700;
	color: var(--text-primary);
	margin-bottom: 14px;
}

.quick-start-content p {
	font-size: 1.05rem;
	color: var(--text-secondary);
	margin-bottom: 28px;
}

.quick-actions {
	display: flex;
	gap: 16px;
	justify-content: center;
	flex-wrap: wrap;
}

/* 动画效果 */
@keyframes gradientShift {
	0%, 100% {
		background-position: 0% 50%;
	}
	50% {
		background-position: 100% 50%;
	}
}

@keyframes float {
	0%, 100% {
		transform: translateY(0px) rotate(0deg);
	}
	33% {
		transform: translateY(-20px) rotate(5deg);
	}
	66% {
		transform: translateY(10px) rotate(-3deg);
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
@media (max-width: 1024px) {
	.hero-section {
		padding: 40px 20px;
		min-height: 45vh;
	}
	
	.hero-content {
		padding: 0 20px;
  	}
  
	.features-section {
		padding: 35px 20px;
		margin: 25px 0;
	}
	
	.stats-section {
		padding: 35px 20px;
		margin: 25px 0;
	}
}

@media (max-width: 768px) {
	.hero-section {
		flex-direction: column;
		text-align: center;
		padding: 30px 20px;
		min-height: 45vh;
		margin: 10px 0;
	}
	
	.hero-content {
		max-width: 100%;
		padding: 0;
		margin-bottom: 20px;
	}
	
	.hero-title {
		font-size: 2.3rem;
		line-height: 1.2;
		margin-bottom: 14px;
	}
	
	.hero-subtitle {
		font-size: 1.05rem;
		margin-bottom: 24px;
	}
	
	.hero-visual {
		height: 160px;
		margin-top: 15px;
		max-width: 100%;
	}
	
	.floating-card {
		width: 50px;
		height: 50px;
		font-size: 1.3rem;
	}
	
	.features-section {
		padding: 30px 20px;
		margin: 20px 0;
	}
	
	.section-title {
		font-size: 1.9rem;
		margin-bottom: 30px;
	}
	
	.feature-card {
		padding: 25px 15px;
	}
	
	.stats-section {
		padding: 30px 20px;
		margin: 20px 0;
	}
	
	.stats-container {
		grid-template-columns: repeat(2, 1fr);
		gap: 15px;
	}
	
	.stat-item {
		padding: 18px 10px;
	}
	
	.quick-actions {
		flex-direction: column;
		align-items: center;
	}
	
	.quick-start-section {
		padding: 0;
		margin: 20px 0;
	}
	
	.quick-start-content {
		padding: 35px 20px;
	}
}

@media (max-width: 480px) {
	.hero-section {
		padding: 20px 15px;
		margin: 5px 0;
		min-height: 40vh;
	}
	
	.hero-title {
		font-size: 1.7rem;
		line-height: 1.1;
		margin-bottom: 12px;
	}
	
	.hero-subtitle {
		font-size: 0.9rem;
		margin-bottom: 20px;
	}
	
	.hero-actions {
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}
	
	.cta-button, .secondary-button {
		width: 100%;
		max-width: 240px;
		padding: 12px 20px;
		font-size: 0.95rem;
	}
	
	.hero-visual {
		height: 130px;
	}
	
	.floating-card {
		width: 40px;
		height: 40px;
		font-size: 1.1rem;
	}
	
	.features-section {
		padding: 20px 15px;
		margin: 15px 0;
	}
	
	.section-title {
		font-size: 1.6rem;
		margin-bottom: 25px;
	}
	
	.feature-card {
		padding: 20px 10px;
	}
	
	.stats-section {
		padding: 20px 15px;
		margin: 15px 0;
	}
	
	.stats-container {
		grid-template-columns: 1fr;
		gap: 10px;
	}
	
	.stat-item {
		padding: 15px 8px;
	}
	
	.quick-start-section {
		padding: 0;
		margin: 15px 0;
	}
	
	.quick-start-content {
		padding: 20px 15px;
	}
	
	.quick-start-content h3 {
		font-size: 1.5rem;
	}
	
	.quick-start-content p {
		font-size: 0.95rem;
	}
}
</style>