<template>
  <div id="app">
    <el-container>
      <!-- 头部导航 -->
      <el-header class="header">
        <div class="header-content">
          <div class="logo">
            <el-icon><Document /></el-icon>
            <span>TechHub 知识库</span>
          </div>
          <el-menu
            mode="horizontal"
            :default-active="$route.path"
            router
            class="nav-menu"
          >
            <el-menu-item index="/">首页</el-menu-item>
            <el-menu-item index="/knowledge">知识库</el-menu-item>
            <el-menu-item index="/statistics">统计</el-menu-item>
            <el-menu-item index="/profile">个人中心</el-menu-item>
          </el-menu>
        </div>
      </el-header>

      <!-- 主要内容区域 -->
      <el-main class="main-content">
        <router-view />
      </el-main>

      <!-- 底部 -->
      <el-footer class="footer">
        <div class="footer-content">
          <p>&copy; 2024 TechHub 知识库 - 基于 XHInfo Backend SDK 构建</p>
        </div>
      </el-footer>
    </el-container>
  </div>
</template>

<script setup>
import { Document } from '@element-plus/icons-vue'
</script>

<style scoped>
.header {
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  padding: 0;
  height: 60px;
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

.logo {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
}

.logo .el-icon {
  margin-right: 8px;
  font-size: 24px;
}

.nav-menu {
  border-bottom: none;
}

.main-content {
  min-height: calc(100vh - 120px);
  background: #f5f5f5;
  padding: 20px;
}

.footer {
  background: #fff;
  border-top: 1px solid #e6e6e6;
  height: 60px;
  padding: 0;
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
  color: #666;
}

.footer-content p {
  margin: 0;
  font-size: 14px;
}
</style>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
}

#app {
  min-height: 100vh;
}
</style>
