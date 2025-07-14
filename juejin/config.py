#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
掘金自动签到脚本配置文件
"""

from dataclasses import dataclass
from typing import Optional

@dataclass
class JuejinConfig:
    """掘金配置类"""
    
    # API基础配置
    base_url: str = "https://api.juejin.cn/growth_api/v1/"
    
    # 用户标识
    aid: str = "2608"
    uuid: str = "7519799674821396007"
    spider: str = "0"
    
    # 安全令牌
    msToken: str = 'ERoYd5UeeW0a2ueEQ8WGRfvTy0pQwqQ4-73rmBsbIkgWeEBl6E4GTtvX-A-pncEkj_L9UDyTuBhSGLjLllfbc1h4qsSQ-gmXLYX4tGKOWK8FEvX9F4HAO3rkNagLH3E%3D'
    a_bogus: str = 'D60dkO2AMsR15jfJwhkz9b4mPxu0YW4MgZEzrQyC%2F0qC'
    
    # Cookie配置
    cookie: str = '_tea_utm_cache_2608=undefined; __tea_cookie_tokens_2608=%257B%2522user_unique_id%2522%253A%25227519799674821396007%2522%252C%2522web_id%2522%253A%25227519799674821396007%2522%252C%2522timestamp%2522%253A1750840255162%257D; s_v_web_id=verify_mck71091_tQ1FH7dh_ssMt_4K4y_8nuD_IVMgHb23oJ5W; passport_csrf_token=28eb2b389fd695eca2056957262d46aa; passport_csrf_token_default=28eb2b389fd695eca2056957262d46aa; n_mh=o3p67qncL5JBY_cQ98-fx0yDthxcAs2iRquIbcIalAE; sid_guard=cd13a353a5ee95e2941d7999ac90426a%7C1752460758%7C31536000%7CTue%2C+14-Jul-2026+02%3A39%3A18+GMT; uid_tt=196424549e8d54dc84c7dbb2a18360d6; uid_tt_ss=196424549e8d54dc84c7dbb2a18360d6; sid_tt=cd13a353a5ee95e2941d7999ac90426a; sessionid=cd13a353a5ee95e2941d7999ac90426a; sessionid_ss=cd13a353a5ee95e2941d7999ac90426a; session_tlb_tag=sttt%7C9%7CzROjU6XuleKUHXmZrJBCav_________vgjhaCNIQnIC7ynTqy7KgoeIFLoP03loeRLtAxL3EjVE%3D; is_staff_user=false; sid_ucp_v1=1.0.0-KGYxMzc0MzEyZGM1MWUxYzJhNzk3ODBjMDBiOTBlMWIyZTIxMjczOWYKFwjtjZC-_fXdBBDW29HDBhiwFDgCQO8HGgJscSIgY2QxM2EzNTNhNWVlOTVlMjk0MWQ3OTk5YWM5MDQyNmE; ssid_ucp_v1=1.0.0-KGYxMzc0MzEyZGM1MWUxYzJhNzk3ODBjMDBiOTBlMWIyZTIxMjczOWYKFwjtjZC-_fXdBBDW29HDBhiwFDgCQO8HGgJscSIgY2QxM2EzNTNhNWVlOTVlMjk0MWQ3OTk5YWM5MDQyNmE'
    
    # 请求配置
    timeout: int = 30
    retry_count: int = 3
    retry_delay: int = 2
    
    # 日志配置
    log_level: str = "INFO"
    log_file: str = "juejin_sign.log"
    
    # 功能开关
    enable_sign_in: bool = True
    enable_lottery: bool = True
    enable_lucky_check: bool = True
    
    def validate(self) -> bool:
        """验证配置有效性"""
        required_fields = ['aid', 'uuid', 'cookie', 'msToken']
        for field in required_fields:
            if not getattr(self, field):
                print(f"❌ 配置错误: {field} 不能为空")
                return False
        return True

# 默认配置实例
default_config = JuejinConfig()

def load_config_from_file(file_path: str) -> Optional[JuejinConfig]:
    """从文件加载配置"""
    try:
        import json
        with open(file_path, 'r', encoding='utf-8') as f:
            config_data = json.load(f)
        
        # 创建配置实例
        config = JuejinConfig(**config_data)
        if config.validate():
            return config
        else:
            print("❌ 配置文件验证失败")
            return None
            
    except FileNotFoundError:
        print(f"❌ 配置文件不存在: {file_path}")
        return None
    except json.JSONDecodeError:
        print(f"❌ 配置文件格式错误: {file_path}")
        return None
    except Exception as e:
        print(f"❌ 加载配置文件失败: {e}")
        return None

def save_config_to_file(config: JuejinConfig, file_path: str) -> bool:
    """保存配置到文件"""
    try:
        import json
        config_data = {
            'base_url': config.base_url,
            'aid': config.aid,
            'uuid': config.uuid,
            'spider': config.spider,
            'msToken': config.msToken,
            'a_bogus': config.a_bogus,
            'cookie': config.cookie,
            'timeout': config.timeout,
            'retry_count': config.retry_count,
            'retry_delay': config.retry_delay,
            'log_level': config.log_level,
            'log_file': config.log_file,
            'enable_sign_in': config.enable_sign_in,
            'enable_lottery': config.enable_lottery,
            'enable_lucky_check': config.enable_lucky_check
        }
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(config_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ 配置已保存到: {file_path}")
        return True
        
    except Exception as e:
        print(f"❌ 保存配置文件失败: {e}")
        return False 