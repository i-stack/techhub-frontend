#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
掘金自动签到脚本 v2.1
优化版本 - 提高代码质量和可维护性
"""

import requests
import json
from typing import Dict, Any, Optional
import logging
from config import JuejinConfig, load_config_from_file

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('juejin_sign.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class JuejinAPI:
    """掘金API客户端"""
    
    def __init__(self, config: JuejinConfig):
        self.config = config
        self.session = requests.Session()
        self._setup_session()
    
    def _setup_session(self):
        """设置会话配置"""
        self.session.headers.update({
            'Cookie': self.config.cookie,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.6478.61 Safari/537.36',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    
    def _get_common_params(self) -> Dict[str, str]:
        """获取通用参数"""
        return {
            "aid": self.config.aid,
            "uuid": self.config.uuid,
            "spider": self.config.spider,
            "msToken": self.config.msToken,
            "a_bogus": self.config.a_bogus
        }
    
    def _make_request(self, method: str, endpoint: str, **kwargs) -> Optional[Dict[str, Any]]:
        """发送HTTP请求"""
        url = f"{self.config.base_url}{endpoint}"
        
        # 设置超时
        kwargs.setdefault('timeout', self.config.timeout)
        
        try:
            if method.upper() == 'GET':
                response = self.session.get(url, **kwargs)
            elif method.upper() == 'POST':
                response = self.session.post(url, **kwargs)
            else:
                logger.error(f"不支持的HTTP方法: {method}")
                return None
            
            # 记录完整的请求URL（包含参数）
            full_url = response.url
            logger.info(f"请求 {method} {full_url} - 状态码: {response.status_code}")
            
            if response.status_code == 200:
                # 检查响应内容是否为空
                if not response.text.strip():
                    logger.warning(f"响应内容为空: {endpoint}")
                    return None
                
                try:
                    return response.json()
                except json.JSONDecodeError as e:
                    logger.error(f"JSON解析失败: {e}")
                    logger.error(f"响应内容: {response.text[:200]}")
                    logger.error(f"响应头: {dict(response.headers)}")
                    return None
            else:
                logger.error(f"HTTP错误 {response.status_code}: {response.text}")
                return None
                
        except requests.RequestException as e:
            logger.error(f"请求异常: {e}")
            return None
    
    def check_sign_in_status(self) -> bool:
        """检查今日签到状态"""
        if not self.config.enable_sign_in:
            logger.info("签到功能已禁用")
            return True
            
        logger.info("检查签到状态...")
        
        data = self._make_request('GET', 'get_today_status')
        if not data:
            return False
        
        if data.get('err_no') == 0:
            is_signed = data.get('data', False)
            status = "已签到" if is_signed else "未签到"
            logger.info(f"今日签到状态: {status}")
            return is_signed
        else:
            logger.warning("未登录或登录已过期")
            return False
    
    def sign_in(self) -> bool:
        """执行签到"""
        if not self.config.enable_sign_in:
            logger.info("签到功能已禁用")
            return True
            
        logger.info("开始签到...")
        
        params = self._get_common_params()
        data = self._make_request('POST', 'check_in', params=params)
        if not data:
            return False
        
        err_no = data.get('err_no')
        err_msg = data.get('err_msg', '')
        
        if err_no == 0 and err_msg == "success":
            logger.info("✅ 签到成功")
            return True
        elif err_no == 15001:
            logger.info("✅ 重复签到")
            return True
        elif err_no == 3013:
            logger.error(f"❌ 签到失败: {err_msg}")
            return False
        else:
            logger.error(f"❌ 签到异常: {err_msg}")
            return False
    
    def get_points(self) -> Optional[int]:
        """获取当前积分"""
        logger.info("获取积分余额...")
        
        data = self._make_request('GET', 'get_cur_point')
        if not data:
            return None
        
        if data.get('err_no') == 0 and data.get('err_msg') == "success":
            points = data.get('data', 0)
            logger.info(f"💰 当前积分: {points}")
            return points
        else:
            logger.error(f"获取积分失败: {data.get('err_msg')}")
            return None
    
    def get_free_draw_count(self) -> Optional[int]:
        """获取免费抽奖次数"""
        if not self.config.enable_lottery:
            logger.info("抽奖功能已禁用")
            return 0
            
        logger.info("获取免费抽奖次数...")
        
        # 尝试不同的抽奖相关端点
        endpoints_to_try = [
            'lottery_config/get',
            'lottery_config',
            'lottery/get_config',
            'lottery/draw_config',
            'lottery_config/draw',
            'lottery/status'
        ]
        
        for endpoint in endpoints_to_try:
            logger.info(f"尝试端点: {endpoint}")
            params = self._get_common_params()
            data = self._make_request('GET', endpoint, params=params)
            
            if data:
                if data.get('err_no') == 0 and data.get('err_msg') == "success":
                    free_count = data.get('data', {}).get('free_count', 0)
                    logger.info(f"🎲 免费抽奖次数: {free_count}")
                    return free_count
                else:
                    logger.warning(f"端点 {endpoint} 返回错误: {data.get('err_msg')}")
            else:
                logger.warning(f"端点 {endpoint} 无响应")
        
        logger.warning("所有抽奖配置端点都无法访问，可能API已变更")
        logger.info("建议：可以暂时禁用抽奖功能，专注于签到和积分查询")
        return 0
    
    def draw_lottery(self) -> bool:
        """执行抽奖"""
        if not self.config.enable_lottery:
            logger.info("抽奖功能已禁用")
            return True
            
        logger.info("开始抽奖...")
        
        params = self._get_common_params()
        data = self._make_request('POST', 'lottery/draw', params=params)
        if not data:
            return False
        
        if data.get('err_no') == 0 and data.get('err_msg') == "success":
            prize_name = data.get('data', {}).get('lottery_name', '未知奖品')
            logger.info(f"🎉 抽奖成功: {prize_name}")
            return True
        else:
            logger.error(f"抽奖失败: {data.get('err_msg')}")
            return False
    
    def get_lucky_info(self) -> Optional[Dict[str, Any]]:
        """获取幸运值信息"""
        if not self.config.enable_lucky_check:
            logger.info("幸运值检查功能已禁用")
            return None
            
        logger.info("获取幸运值信息...")
        
        post_data = {
            "aid": self.config.aid,
            "uuid": self.config.uuid,
            "spider": self.config.spider
        }
        
        data = self._make_request('POST', 'lottery_lucky/my_lucky', data=post_data)
        if not data:
            return None
        
        if data.get('err_no') == 0 and data.get('err_msg') == "success":
            lucky_data = data.get('data', {})
            total_value = lucky_data.get('total_value', 0)
            points = self.get_points() or 0
            
            # 计算距离中奖还差多少积分
            target_points = (6000 - total_value) * 20
            remaining = max(0, target_points - points)
            
            result = {
                'total_value': total_value,
                'current_points': points,
                'remaining_points': remaining
            }
            
            logger.info(f"🎯 幸运值: {total_value}")
            logger.info(f"💰 当前积分: {points}")
            logger.info(f"🎁 距离中奖还差: {remaining} 积分")
            
            return result
        else:
            logger.error(f"获取幸运值失败: {data.get('err_msg')}")
            return None

def main():
    """主函数"""
    logger.info("🚀 掘金自动签到脚本启动")
    
    # 尝试从配置文件加载配置
    config = load_config_from_file('juejin_config.json')
    if not config:
        logger.info("使用默认配置")
        config = JuejinConfig()
    
    # 验证配置
    if not config.validate():
        logger.error("配置验证失败，退出程序")
        return
    
    # 创建API客户端
    api = JuejinAPI(config)
    
    try:
        # 检查签到状态
        if api.check_sign_in_status():
            logger.info("今日已签到，检查抽奖...")
        else:
            logger.info("今日未签到，开始签到...")
            if not api.sign_in():
                logger.error("签到失败，退出程序")
                return
        
        # 获取免费抽奖次数
        free_count = api.get_free_draw_count()
        if free_count and free_count > 0:
            logger.info(f"有 {free_count} 次免费抽奖机会，开始抽奖...")
            api.draw_lottery()
        else:
            logger.info("没有免费抽奖次数或抽奖功能暂时不可用")
        
        # 获取幸运值信息
        api.get_lucky_info()
        
        logger.info("✅ 脚本执行完成")
        
    except Exception as e:
        logger.error(f"脚本执行异常: {e}")
    finally:
        api.session.close()

if __name__ == "__main__":
    main()
