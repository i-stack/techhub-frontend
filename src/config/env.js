/**
 * 环境配置类
 * 用于区分不同环境的配置
 */

const getEnv = () => {
    return 'development'
}

const envConfig = {
    development: {
        name: 'development',
        apiBaseUrl: 'http://localhost:3000/api',
        wsUrl: 'ws://localhost:3000',
        debug: true,
        logLevel: 'debug'
    },
    production: {
        name: 'production',
        apiBaseUrl: 'https://api.techhub.com/api',
        wsUrl: 'wss://api.techhub.com',
        debug: false,
        logLevel: 'error'
    },
    test: {
        name: 'test',
        apiBaseUrl: 'http://localhost:3000/api',
        wsUrl: 'ws://localhost:3000',
        debug: true,
        logLevel: 'debug'
    }
}

const getConfig = () => {
    const env = getEnv()
    return envConfig[env] || envConfig.development
}

export const config = getConfig()
export const isDevelopment = () => getEnv() === 'development'
export const isProduction = () => getEnv() === 'production'
export const isTest = () => getEnv() === 'test'
export const currentEnv = getEnv()
export default config
