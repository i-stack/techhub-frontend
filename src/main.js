import './styles/global.css'
import './styles/theme.css'
import App from './App.vue'
import router from './router'
import { createApp } from 'vue'
import 'element-plus/dist/index.css'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  	app.component(key, component)
}

app.use(ElementPlus)
app.use(router)
app.mount('#app')