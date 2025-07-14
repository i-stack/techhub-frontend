# 掘金自动签到脚本 v2.1

## 🚀 功能特性

- ✅ **自动签到** - 每日自动签到获取积分
- ✅ **自动抽奖** - 免费抽奖获取奖品
- ✅ **幸运值查询** - 查看当前幸运值和距离中奖所需积分
- ✅ **配置管理** - 支持配置文件管理
- ✅ **日志记录** - 详细的日志记录和错误处理
- ✅ **功能开关** - 可选择性启用/禁用功能
- ✅ **错误重试** - 网络请求失败自动重试

## 📁 文件结构

```
├── test.py              # 主程序文件
├── config.py            # 配置管理模块
├── debug_response.py    # 调试工具
├── README_juejin.md     # 说明文档
└── juejin_config.json   # 配置文件（可选）
```

## 🛠️ 安装依赖

```bash
pip install requests
```

## 📝 使用方法

### 1. 基本使用

```bash
python test.py
```

### 2. 使用配置文件

创建 `juejin_config.json` 文件：

```json
{
  "base_url": "https://api.juejin.cn/growth_api/v1/",
  "aid": "2608",
  "uuid": "7519799674821396007",
  "spider": "0",
  "msToken": "your_msToken_here",
  "a_bogus": "your_a_bogus_here",
  "cookie": "your_cookie_here",
  "timeout": 30,
  "retry_count": 3,
  "retry_delay": 2,
  "log_level": "INFO",
  "log_file": "juejin_sign.log",
  "enable_sign_in": true,
  "enable_lottery": true,
  "enable_lucky_check": true
}
```

### 3. 调试模式

```bash
python debug_response.py
```

## ⚙️ 配置说明

### 必需配置

- `aid` - 用户ID
- `uuid` - 用户UUID
- `cookie` - 登录Cookie
- `msToken` - 安全令牌
- `a_bogus` - 防爬虫令牌

### 可选配置

- `timeout` - 请求超时时间（秒）
- `retry_count` - 重试次数
- `retry_delay` - 重试延迟（秒）
- `log_level` - 日志级别
- `log_file` - 日志文件路径

### 功能开关

- `enable_sign_in` - 启用签到功能
- `enable_lottery` - 启用抽奖功能
- `enable_lucky_check` - 启用幸运值查询

## 🔧 代码优化亮点

### 1. 面向对象设计
- 使用类封装API操作
- 清晰的职责分离
- 易于扩展和维护

### 2. 配置管理
- 支持配置文件加载
- 配置验证机制
- 默认配置回退

### 3. 错误处理
- 完善的异常处理
- 详细的错误日志
- 优雅的错误恢复

### 4. 日志系统
- 结构化日志记录
- 文件和控制台输出
- 可配置的日志级别

### 5. 代码质量
- 类型注解
- 文档字符串
- 代码注释
- 遵循PEP8规范

## 📊 日志示例

```
2024-01-15 10:30:00 - INFO - 🚀 掘金自动签到脚本启动
2024-01-15 10:30:01 - INFO - 检查签到状态...
2024-01-15 10:30:02 - INFO - 请求 GET https://api.juejin.cn/growth_api/v1/get_today_status - 状态码: 200
2024-01-15 10:30:02 - INFO - 今日签到状态: 未签到
2024-01-15 10:30:02 - INFO - 今日未签到，开始签到...
2024-01-15 10:30:03 - INFO - 开始签到...
2024-01-15 10:30:04 - INFO - 请求 POST https://api.juejin.cn/growth_api/v1/check_in - 状态码: 200
2024-01-15 10:30:04 - INFO - ✅ 签到成功
2024-01-15 10:30:04 - INFO - 今日已签到，检查抽奖...
2024-01-15 10:30:05 - INFO - 获取免费抽奖次数...
2024-01-15 10:30:06 - INFO - 请求 GET https://api.juejin.cn/growth_api/v1/lottery_config/get - 状态码: 200
2024-01-15 10:30:06 - INFO - 🎲 免费抽奖次数: 1
2024-01-15 10:30:06 - INFO - 有 1 次免费抽奖机会，开始抽奖...
2024-01-15 10:30:07 - INFO - 开始抽奖...
2024-01-15 10:30:08 - INFO - 请求 POST https://api.juejin.cn/growth_api/v1/lottery/draw - 状态码: 200
2024-01-15 10:30:08 - INFO - 🎉 抽奖成功: 掘金徽章
2024-01-15 10:30:08 - INFO - 没有免费抽奖次数
2024-01-15 10:30:09 - INFO - 获取幸运值信息...
2024-01-15 10:30:10 - INFO - 请求 POST https://api.juejin.cn/growth_api/v1/lottery_lucky/my_lucky - 状态码: 200
2024-01-15 10:30:10 - INFO - 🎯 幸运值: 1500
2024-01-15 10:30:10 - INFO - 💰 当前积分: 500
2024-01-15 10:30:10 - INFO - 🎁 距离中奖还差: 89500 积分
2024-01-15 10:30:10 - INFO - ✅ 脚本执行完成
```

## 🚨 注意事项

1. **Cookie更新** - Cookie会定期过期，需要及时更新
2. **频率限制** - 避免过于频繁的请求
3. **网络环境** - 确保网络连接稳定
4. **配置安全** - 不要将配置文件提交到公共仓库

## 🔄 更新日志

### v2.1 (2024-01-15)
- ✨ 重构代码结构，使用面向对象设计
- ✨ 添加配置管理系统
- ✨ 完善错误处理和日志记录
- ✨ 添加功能开关
- ✨ 优化代码可读性和可维护性

### v2.0 (原始版本)
- 基础签到和抽奖功能
- 简单的错误处理

## 📞 技术支持

如有问题，请检查：
1. 配置文件是否正确
2. 网络连接是否正常
3. Cookie是否有效
4. 日志文件中的错误信息 