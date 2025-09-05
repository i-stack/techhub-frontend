import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Statistics from '../views/Statistics.vue'
import UserProfile from '../views/UserProfile.vue'
import KnowledgeBase from '../views/KnowledgeBase.vue'
import KnowledgeList from '../views/KnowledgeList.vue'
import KnowledgeEdit from '../views/KnowledgeEdit.vue'
import KnowledgeDetail from '../views/KnowledgeDetail.vue'
import KnowledgeCreate from '../views/KnowledgeCreate.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated } from '@/services/auth'

const routes = [
	{
		path: '/login',
		name: 'Login',
		component: Login,
		meta: { requiresAuth: false }
	},
	{
		path: '/',
		name: 'Home',
		component: Home,
		meta: { requiresAuth: true }
	},
	{
		path: '/knowledge',
		name: 'KnowledgeBase',
		component: KnowledgeBase,
		meta: { requiresAuth: true }
	},
	{
		path: '/knowledge-list',
		name: 'KnowledgeList',
		component: KnowledgeList,
		meta: { requiresAuth: true }
	},
	{
		path: '/knowledge/:id',
		name: 'KnowledgeDetail',
		component: KnowledgeDetail,
		props: true,
		meta: { requiresAuth: true }
	},
	{
		path: '/knowledge/create',
		name: 'KnowledgeCreate',
		component: KnowledgeCreate,
		meta: { requiresAuth: true }
	},
	{
		path: '/knowledge/:id/edit',
		name: 'KnowledgeEdit',
		component: KnowledgeEdit,
		props: true,
		meta: { requiresAuth: true }
	},
	{
		path: '/profile',
		name: 'UserProfile',
		component: UserProfile,
		meta: { requiresAuth: true }
	},
	{
		path: '/statistics',
		name: 'Statistics',
		component: Statistics,
		meta: { requiresAuth: true }
	}
]

const router = createRouter({
	history: createWebHistory(),
	routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
	const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
	
	if (requiresAuth && !isAuthenticated()) {
		// 需要登录但未登录，跳转到登录页
		next('/login')
	} else if (to.path === '/login' && isAuthenticated()) {
		// 已登录但访问登录页，跳转到首页
		next('/')
	} else {
		next()
	}
})

export default router
