import { defineStore } from 'pinia'
import { knowledgeAPI, commentAPI, favoriteAPI } from '@/services/api'

export const useKnowledgeStore = defineStore('knowledge', {
  state: () => ({
    // 知识条目列表
    knowledgeList: [],
    // 当前知识条目详情
    currentKnowledge: null,
    // 加载状态
    loading: false,
    // 分页信息
    pagination: {
      currentPage: 1,
      pageSize: 10,
      total: 0
    },
    // 搜索条件
    searchQuery: '',
    // 筛选条件
    filters: {
      category: '',
      difficulty: '',
      status: ''
    },
    // 排序条件
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }),

  getters: {
    // 过滤后的知识条目列表
    filteredKnowledge: (state) => {
      let filtered = state.knowledgeList

      // 搜索过滤
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase()
        filtered = filtered.filter(item =>
          item.title.toLowerCase().includes(query) ||
          item.content.toLowerCase().includes(query) ||
          item.summary.toLowerCase().includes(query)
        )
      }

      // 分类过滤
      if (state.filters.category) {
        filtered = filtered.filter(item => item.category === state.filters.category)
      }

      // 难度过滤
      if (state.filters.difficulty) {
        filtered = filtered.filter(item => item.difficulty === state.filters.difficulty)
      }

      // 状态过滤
      if (state.filters.status) {
        filtered = filtered.filter(item => item.status === state.filters.status)
      }

      return filtered
    },

    // 按分类统计
    categoryStats: (state) => {
      const stats = {}
      state.knowledgeList.forEach(item => {
        stats[item.category] = (stats[item.category] || 0) + 1
      })
      return Object.entries(stats).map(([category, count]) => ({
        category,
        count
      }))
    },

    // 按难度统计
    difficultyStats: (state) => {
      const stats = {}
      state.knowledgeList.forEach(item => {
        stats[item.difficulty] = (stats[item.difficulty] || 0) + 1
      })
      return Object.entries(stats).map(([difficulty, count]) => ({
        difficulty,
        count
      }))
    },

    // 热门知识条目（按点赞数排序）
    popularKnowledge: (state) => {
      return [...state.knowledgeList]
        .sort((a, b) => (b.likes || 0) - (a.likes || 0))
        .slice(0, 10)
    }
  },

  actions: {
    // 加载知识条目列表
    async loadKnowledgeList(params = {}) {
      this.loading = true
      try {
        const queryParams = {
          page: this.pagination.currentPage,
          pageSize: this.pagination.pageSize,
          search: this.searchQuery,
          category: this.filters.category,
          difficulty: this.filters.difficulty,
          status: this.filters.status,
          sortBy: this.sortBy,
          sortOrder: this.sortOrder,
          ...params
        }

        const response = await knowledgeAPI.getEntries(queryParams)
        this.knowledgeList = response.data || []
        this.pagination.total = response.total || 0
      } catch (error) {
        console.error('加载知识条目列表失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 加载单个知识条目详情
    async loadKnowledgeDetail(id) {
      this.loading = true
      try {
        const response = await knowledgeAPI.getEntry(id)
        this.currentKnowledge = response.data
        return response.data
      } catch (error) {
        console.error('加载知识条目详情失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 创建知识条目
    async createKnowledge(data) {
      try {
        const response = await knowledgeAPI.createEntry(data)
        // 添加到列表开头
        this.knowledgeList.unshift(response.data)
        this.pagination.total += 1
        return response.data
      } catch (error) {
        console.error('创建知识条目失败:', error)
        throw error
      }
    },

    // 更新知识条目
    async updateKnowledge(id, data) {
      try {
        const response = await knowledgeAPI.updateEntry(id, data)
        // 更新列表中的对应项
        const index = this.knowledgeList.findIndex(item => item.id === id)
        if (index !== -1) {
          this.knowledgeList[index] = response.data
        }
        // 更新当前知识条目
        if (this.currentKnowledge && this.currentKnowledge.id === id) {
          this.currentKnowledge = response.data
        }
        return response.data
      } catch (error) {
        console.error('更新知识条目失败:', error)
        throw error
      }
    },

    // 删除知识条目
    async deleteKnowledge(id) {
      try {
        await knowledgeAPI.deleteEntry(id)
        // 从列表中移除
        this.knowledgeList = this.knowledgeList.filter(item => item.id !== id)
        this.pagination.total -= 1
        // 清空当前知识条目
        if (this.currentKnowledge && this.currentKnowledge.id === id) {
          this.currentKnowledge = null
        }
      } catch (error) {
        console.error('删除知识条目失败:', error)
        throw error
      }
    },

    // 点赞/取消点赞
    async toggleLike(id, userId) {
      try {
        const response = await knowledgeAPI.toggleLike(id, userId)
        // 更新列表中的点赞数
        const item = this.knowledgeList.find(item => item.id === id)
        if (item) {
          item.likes = response.data.likes
        }
        // 更新当前知识条目的点赞数
        if (this.currentKnowledge && this.currentKnowledge.id === id) {
          this.currentKnowledge.likes = response.data.likes
        }
        return response.data
      } catch (error) {
        console.error('点赞操作失败:', error)
        throw error
      }
    },

    // 发布知识条目
    async publishKnowledge(id) {
      try {
        const response = await knowledgeAPI.publishEntry(id)
        // 更新状态
        const item = this.knowledgeList.find(item => item.id === id)
        if (item) {
          item.status = 'published'
        }
        if (this.currentKnowledge && this.currentKnowledge.id === id) {
          this.currentKnowledge.status = 'published'
        }
        return response.data
      } catch (error) {
        console.error('发布知识条目失败:', error)
        throw error
      }
    },

    // 设置搜索条件
    setSearchQuery(query) {
      this.searchQuery = query
      this.pagination.currentPage = 1
    },

    // 设置筛选条件
    setFilters(filters) {
      this.filters = { ...this.filters, ...filters }
      this.pagination.currentPage = 1
    },

    // 设置排序条件
    setSorting(sortBy, sortOrder) {
      this.sortBy = sortBy
      this.sortOrder = sortOrder
    },

    // 设置分页
    setPagination(page, pageSize) {
      this.pagination.currentPage = page
      this.pagination.pageSize = pageSize
    },

    // 重置状态
    resetState() {
      this.knowledgeList = []
      this.currentKnowledge = null
      this.loading = false
      this.pagination = {
        currentPage: 1,
        pageSize: 10,
        total: 0
      }
      this.searchQuery = ''
      this.filters = {
        category: '',
        difficulty: '',
        status: ''
      }
      this.sortBy = 'createdAt'
      this.sortOrder = 'desc'
    }
  }
})