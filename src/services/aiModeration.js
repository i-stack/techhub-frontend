// AI评论审核服务
export class AIModerationService {
  constructor() {
    this.apiKey = ''
    this.apiUrl = 'https://api.openai.com/v1/moderations'
  }

  // 检查评论内容是否包含不当内容
  async moderateComment(comment) {
    try {
      // 如果没有配置API Key，使用本地规则检查
      if (!this.apiKey) {
        return this.localModeration(comment)
      }

      // 使用OpenAI Moderation API
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          input: comment
        })
      })

      const data = await response.json()
      
      // 检查是否有任何标记为不当的内容
      const flagged = data.results[0].flagged
      const categories = data.results[0].categories
      
      return {
        approved: !flagged,
        reason: flagged ? this.getRejectionReason(categories) : null,
        confidence: data.results[0].category_scores
      }
    } catch (error) {
      console.error('AI审核失败，使用本地规则:', error)
      return this.localModeration(comment)
    }
  }

  // 本地规则检查（备用方案）
  localModeration(comment) {
    const text = comment.toLowerCase()
    
    // 广告关键词
    const adKeywords = [
      '加微信', '加qq', '联系方式', '私聊', '加群', '微信群', 'qq群',
      '推广', '代理', '加盟', '赚钱', '兼职', '刷单', '投资',
      '点击链接', '扫码', '下载app', '注册送', '免费领取'
    ]
    
    // 不良言论关键词
    const badKeywords = [
      '垃圾', '傻逼', '白痴', '智障', '滚', '死', '操', 'fuck',
      '政治敏感', '色情', '暴力', '恐怖主义'
    ]
    
    // 检查广告关键词
    const hasAdContent = adKeywords.some(keyword => text.includes(keyword))
    if (hasAdContent) {
      return {
        approved: false,
        reason: '检测到广告内容，评论不予通过',
        confidence: { advertising: 0.8 }
      }
    }
    
    // 检查不良言论
    const hasBadContent = badKeywords.some(keyword => text.includes(keyword))
    if (hasBadContent) {
      return {
        approved: false,
        reason: '检测到不当言论，评论不予通过',
        confidence: { hate: 0.7 }
      }
    }
    
    // 检查评论长度
    if (comment.length < 3) {
      return {
        approved: false,
        reason: '评论内容过短，请提供有意义的评论',
        confidence: { length: 0.9 }
      }
    }
    
    if (comment.length > 500) {
      return {
        approved: false,
        reason: '评论内容过长，请控制在500字以内',
        confidence: { length: 0.9 }
      }
    }
    
    return {
      approved: true,
      reason: null,
      confidence: { safe: 0.9 }
    }
  }

  // 获取拒绝原因
  getRejectionReason(categories) {
    const reasons = []
    
    if (categories.hate) reasons.push('仇恨言论')
    if (categories.hate_threatening) reasons.push('威胁性仇恨言论')
    if (categories.self_harm) reasons.push('自残相关内容')
    if (categories.sexual) reasons.push('性相关内容')
    if (categories.sexual_minors) reasons.push('涉及未成年人的性内容')
    if (categories.violence) reasons.push('暴力内容')
    if (categories.violence_graphic) reasons.push('图形暴力内容')
    
    return reasons.length > 0 ? `检测到${reasons.join('、')}，评论不予通过` : '内容不符合社区规范'
  }

  // 批量审核评论
  async moderateComments(comments) {
    const results = []
    
    for (const comment of comments) {
      const result = await this.moderateComment(comment.content)
      results.push({
        ...comment,
        moderation: result
      })
    }
    
    return results
  }
}

// 创建单例实例
export const aiModerationService = new AIModerationService()
