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
      <el-card class="quick-start-card">
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
      </el-card>
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
  min-height: 70vh;
  padding: 60px 0;
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 100%;
}

.hero-content {
  flex: 1;
  z-index: 2;
  max-width: 50%;
  padding-right: 20px;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 24px;
  color: white;
}

.gradient-text {
  background: linear-gradient(135deg, #667eea, #764ba2, #f093fb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  background-size: 200% 200%;
  animation: gradientShift 3s ease-in-out infinite;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 40px;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.cta-button {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  padding: 16px 32px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.4);
}

.secondary-button {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 16px 32px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.secondary-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

/* 英雄区域视觉效果 */
.hero-visual {
  flex: 1;
  position: relative;
  height: 400px;
  max-width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.floating-cards {
  position: relative;
  width: 100%;
  height: 100%;
}

.floating-card {
  position: absolute;
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  animation: float 6s ease-in-out infinite;
}

.card-1 {
  top: 20%;
  left: 20%;
  animation-delay: 0s;
}

.card-2 {
  top: 50%;
  right: 20%;
  animation-delay: 2s;
}

.card-3 {
  bottom: 20%;
  left: 50%;
  animation-delay: 4s;
}

/* 功能特性区域 */
.features-section {
  padding: 80px 0;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  margin: 40px 0;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 60px;
}

.features-grid {
  max-width: 1000px;
  margin: 0 auto;
}

.feature-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 40px 30px;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  margin-bottom: 24px;
}

.feature-card:hover {
  transform: translateY(-8px);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.feature-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 16px;
}

.feature-description {
  color: rgba(255, 255, 255, 0.8);
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
  color: #667eea;
}

.stat-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
}

/* 统计数据区域 */
.stats-section {
  padding: 60px 0;
  margin: 40px 0;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
  max-width: 800px;
  margin: 0 auto;
}

.stat-item {
  text-align: center;
  padding: 30px 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.15);
}

.stat-number {
  font-size: 3rem;
  font-weight: 800;
  color: #667eea;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

/* 快速开始区域 */
.quick-start-section {
  margin: 60px 0;
}

.quick-start-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  overflow: hidden;
}

.quick-start-content {
  text-align: center;
  padding: 40px;
}

.quick-start-content h3 {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 16px;
}

.quick-start-content p {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 32px;
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
@media (max-width: 768px) {
  .hero-section {
    flex-direction: column;
    text-align: center;
    padding: 40px 0;
    min-height: 60vh;
  }
  
  .hero-content {
    max-width: 100%;
    padding-right: 0;
    margin-bottom: 20px;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-visual {
    height: 200px;
    margin-top: 20px;
    max-width: 100%;
  }
  
  .floating-card {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }
  
  .features-section {
    padding: 40px 0;
    margin: 20px 0;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .feature-card {
    padding: 30px 20px;
  }
  
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  
  .quick-actions {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .stats-container {
    grid-template-columns: 1fr;
  }
}
</style>