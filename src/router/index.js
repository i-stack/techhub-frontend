import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import KnowledgeList from '../views/KnowledgeList.vue'
import KnowledgeDetail from '../views/KnowledgeDetail.vue'
import KnowledgeCreate from '../views/KnowledgeCreate.vue'
import KnowledgeEdit from '../views/KnowledgeEdit.vue'
import UserProfile from '../views/UserProfile.vue'
import Statistics from '../views/Statistics.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/knowledge',
    name: 'KnowledgeList',
    component: KnowledgeList
  },
  {
    path: '/knowledge/:id',
    name: 'KnowledgeDetail',
    component: KnowledgeDetail,
    props: true
  },
  {
    path: '/knowledge/create',
    name: 'KnowledgeCreate',
    component: KnowledgeCreate
  },
  {
    path: '/knowledge/:id/edit',
    name: 'KnowledgeEdit',
    component: KnowledgeEdit,
    props: true
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: UserProfile
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: Statistics
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
