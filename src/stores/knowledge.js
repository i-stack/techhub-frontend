import { defineStore } from 'pinia'
import { knowledgeAPI, commentAPI, favoriteAPI } from '../services/api'

export const useKnowledgeStore = defineStore('knowledge', {
  state: () => ({
    entries: [],
    currentEntry: null,
    loading: false,
    total: 0,
    currentPage: 1,
    pageSize: 10,
    filters: {
      category: '',
      difficulty: '',
      search: '',
      tags: []
    }
  }),

  getters: {
    // 按分类筛选的知识条目
    entriesByCategory: (state) => (category) => {
      if (!category) return state.entries
      return state.entries.filter(entry => entry.category === category)
    },

    // 按难度筛选的知识条目
    entriesByDifficulty: (state) => (difficulty) => {
      if (!difficulty) return state.entries
      return state.entries.filter(entry => entry.difficulty === difficulty)
    },

    // 搜索知识条目
    searchEntries: (state) => (keyword) => {
      if (!keyword) return state.entries
      const lowerKeyword = keyword.toLowerCase()
      return state.entries.filter(entry => 
        entry.title.toLowerCase().includes(lowerKeyword) ||
        entry.summary.toLowerCase().includes(lowerKeyword) ||
        entry.content.toLowerCase().includes(lowerKeyword)
      )
    }
  },

  actions: {
    // 获取知识条目列表
    async fetchEntries(params = {}) {
      this.loading = true
      try {
        const response = await knowledgeAPI.getEntries({
          page: this.currentPage,
          limit: this.pageSize,
          ...this.filters,
          ...params
        })
        
        this.entries = response.data.entries
        this.total = response.data.total
        this.currentPage = response.data.page
        
        return response.data
      } catch (error) {
        console.error('获取知识条目列表失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 获取单个知识条目
    async fetchEntry(id) {
      this.loading = true
      try {
        const response = await knowledgeAPI.getEntry(id)
        this.currentEntry = response.data
        return response.data
      } catch (error) {
        console.error('获取知识条目失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 创建知识条目
    async createEntry(data) {
      try {
        const response = await knowledgeAPI.createEntry(data)
        this.entries.unshift(response.data)
        return response.data
      } catch (error) {
        console.error('创建知识条目失败:', error)
        throw error
      }
    },

    // 更新知识条目
    async updateEntry(id, data) {
      try {
        const response = await knowledgeAPI.updateEntry(id, data)
        const index = this.entries.findIndex(entry => entry.id === id)
        if (index !== -1) {
          this.entries[index] = response.data
        }
        if (this.currentEntry && this.currentEntry.id === id) {
          this.currentEntry = response.data
        }
        return response.data
      } catch (error) {
        console.error('更新知识条目失败:', error)
        throw error
      }
    },

    // 删除知识条目
    async deleteEntry(id) {
      try {
        await knowledgeAPI.deleteEntry(id)
        this.entries = this.entries.filter(entry => entry.id !== id)
        if (this.currentEntry && this.currentEntry.id === id) {
          this.currentEntry = null
        }
      } catch (error) {
        console.error('删除知识条目失败:', error)
        throw error
      }
    },

    // 发布知识条目
    async publishEntry(id) {
      try {
        const response = await knowledgeAPI.publishEntry(id)
        const index = this.entries.findIndex(entry => entry.id === id)
        if (index !== -1) {
          this.entries[index] = response.data
        }
        if (this.currentEntry && this.currentEntry.id === id) {
          this.currentEntry = response.data
        }
        return response.data
      } catch (error) {
        console.error('发布知识条目失败:', error)
        throw error
      }
    },

    // 点赞/取消点赞
    async toggleLike(id, userId) {
      try {
        const response = await knowledgeAPI.toggleLike(id, userId)
        const index = this.entries.findIndex(entry => entry.id === id)
        if (index !== -1) {
          this.entries[index].likeCount = response.data.likeCount
        }
        if (this.currentEntry && this.currentEntry.id === id) {
          this.currentEntry.likeCount = response.data.likeCount
        }
        return response.data
      } catch (error) {
        console.error('点赞操作失败:', error)
        throw error
      }
    },

    // 设置筛选条件
    setFilters(filters) {
      this.filters = { ...this.filters, ...filters }
    },

    // 重置筛选条件
    resetFilters() {
      this.filters = {
        category: '',
        difficulty: '',
        search: '',
        tags: []
      }
    },

    // 设置分页
    setPagination(page, pageSize) {
      this.currentPage = page
      this.pageSize = pageSize
    }
  }
})
