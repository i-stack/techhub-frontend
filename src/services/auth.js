import axios from 'axios'
import { config } from '@/config/env'

/**
 * 认证服务
 * 处理用户登录、登出、token管理等功能
 */

// 创建axios实例
const authApi = axios.create({
    baseURL: config.apiBaseUrl,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// 请求拦截器 - 添加token
authApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// 响应拦截器 - 处理token过期
authApi.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        if (error.response?.status === 401) {
            // token过期，清除本地存储并跳转到登录页
            localStorage.removeItem('auth_token')
            localStorage.removeItem('user_info')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

/**
 * 用户登录
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {Promise} 登录结果
 */
export const login = async (username, password) => {
    try {
        const response = await authApi.post('/users/login', {
            username,
            password
        })
        
        if (response.data.success) {
            // 保存token和用户信息
            localStorage.setItem('auth_token', response.data.data.token)
            localStorage.setItem('user_info', JSON.stringify(response.data.data))
            return response.data
        } else {
            throw new Error(response.data.message || '登录失败')
        }
    } catch (error) {
        console.error('登录错误:', error)
        throw error
    }
}

/**
 * 用户登出
 */
export const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_info')
    window.location.href = '/login'
}

/**
 * 获取当前用户信息
 * @returns {Object|null} 用户信息
 */
export const getCurrentUser = () => {
    try {
        const userInfo = localStorage.getItem('user_info')
        return userInfo ? JSON.parse(userInfo) : null
    } catch (error) {
        console.error('获取用户信息失败:', error)
        return null
    }
}

/**
 * 检查是否已登录
 * @returns {boolean} 是否已登录
 */
export const isAuthenticated = () => {
    const token = localStorage.getItem('auth_token')
    const userInfo = getCurrentUser()
    return !!(token && userInfo)
}

/**
 * 获取token
 * @returns {string|null} token
 */
export const getToken = () => {
    return localStorage.getItem('auth_token')
}

/**
 * 刷新token（如果需要的话）
 * @returns {Promise} 刷新结果
 */
export const refreshToken = async () => {
    try {
        const response = await authApi.post('/users/refresh-token')
        if (response.data.success) {
            localStorage.setItem('auth_token', response.data.data.token)
            return response.data
        }
    } catch (error) {
        console.error('刷新token失败:', error)
        throw error
    }
}

export default {
    login,
    logout,
    getCurrentUser,
    isAuthenticated,
    getToken,
    refreshToken
}
