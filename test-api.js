import axios from 'axios';

async function testAPI() {
    try {
        console.log('测试API路径: http://localhost:3000/api/users/login');
        
        const response = await axios.post('http://localhost:3000/api/users/login', {
            username: 'admin',
            password: 'admin123'
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 5000
        });
        
        console.log('API响应:', response.data);
    } catch (error) {
        console.error('API错误:', error.response?.data || error.message);
        console.error('状态码:', error.response?.status);
        console.error('请求URL:', error.config?.url);
    }
}

testAPI();
