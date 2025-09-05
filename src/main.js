import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import './styles/global.css'
import './styles/theme.css'
import App from './App.vue'
import Home from './views/Home.vue'
import KnowledgeBase from './views/KnowledgeBase.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/knowledge', name: 'KnowledgeBase', component: KnowledgeBase }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(ElementPlus)
app.use(router)
app.mount('#app')