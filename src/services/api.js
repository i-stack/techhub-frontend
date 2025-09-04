import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:3000/api/knowledge',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 可以在这里添加认证token
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    console.error('API请求错误:', error)
    return Promise.reject(error)
  }
)

// 知识条目相关API
export const knowledgeAPI = {
  // 获取知识条目列表
  getEntries(params = {}) {
    return api.get('/entries', { params })
  },
  
  // 获取单个知识条目
  getEntry(id) {
    return api.get(`/entries/${id}`)
  },
  
  // 创建知识条目
  createEntry(data) {
    return api.post('/entries', data)
  },
  
  // 更新知识条目
  updateEntry(id, data) {
    return api.put(`/entries/${id}`, data)
  },
  
  // 删除知识条目
  deleteEntry(id) {
    return api.delete(`/entries/${id}`)
  },
  
  // 发布知识条目
  publishEntry(id) {
    return api.patch(`/entries/${id}/publish`)
  },
  
  // 点赞/取消点赞
  toggleLike(id, userId) {
    return api.post(`/entries/${id}/like`, { userId })
  }
}

// 用户相关API
export const userAPI = {
  // 创建用户
  createUser(data) {
    return api.post('/users', data)
  },
  
  // 获取用户信息
  getUser(id) {
    return api.get(`/users/${id}`)
  },
  
  // 更新用户信息
  updateUser(id, data) {
    return api.put(`/users/${id}`, data)
  }
}

// 评论相关API
export const commentAPI = {
  // 创建评论
  createComment(data) {
    return api.post('/comments', data)
  },
  
  // 获取评论列表
  getComments(knowledgeEntryId) {
    return api.get(`/entries/${knowledgeEntryId}/comments`)
  },
  
  // 审核评论
  approveComment(id) {
    return api.patch(`/comments/${id}/approve`)
  },
  
  // 删除评论
  deleteComment(id) {
    return api.delete(`/comments/${id}`)
  }
}

// 收藏相关API
export const favoriteAPI = {
  // 添加收藏
  addToFavorites(data) {
    return api.post('/favorites', data)
  },
  
  // 取消收藏
  removeFromFavorites(data) {
    return api.delete('/favorites', { data })
  },
  
  // 获取用户收藏
  getUserFavorites(userId, params = {}) {
    return api.get(`/users/${userId}/favorites`, { params })
  }
}

// 统计相关API
export const statisticsAPI = {
  // 获取统计信息
  getStatistics() {
    return api.get('/statistics')
  }
}

export default api
