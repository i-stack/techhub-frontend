import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { login as apiLogin, logout as apiLogout, getCurrentUser, isAuthenticated as checkAuth } from '@/services/auth';

export const useAuthStore = defineStore('auth', () => {
	const user = ref(null);
	const token = ref(localStorage.getItem('auth_token') || null);
	const isLoggedIn = computed(() => !!user.value && !!token.value);
	const login = async (username, password) => {
		try {
			const result = await apiLogin(username, password);
			if (result.success) {
				user.value = result.data;
				token.value = result.data.token;

				return { success: true, message: result.message };
			} else {
				return { success: false, message: result.message };
			}
		} catch (error) {
			console.error('登录错误:', error);
			return {
				success: false,
				message: error.response?.data?.message || error.message || '登录失败，请稍后重试',
			};
		}
	};

	const logout = () => {
		apiLogout();
		user.value = null;
		token.value = null;
	};

	const initAuth = () => {
		if (checkAuth()) {
			const currentUser = getCurrentUser();
			const currentToken = localStorage.getItem('auth_token');
			if (currentUser && currentToken) {
				user.value = currentUser;
				token.value = currentToken;
			}
		}
	};

	const hasPermission = permission => {
		if (!isLoggedIn.value) return false;
		const userRole = user.value?.businessRole || 'USER';
		const permissions = {
			add_knowledge: ['ADMIN', 'EDITOR'].includes(userRole),
			edit_knowledge: ['ADMIN', 'EDITOR'].includes(userRole),
			delete_knowledge: userRole === 'ADMIN',
			view_knowledge: true, // 所有人都可以查看
			comment: true, // 所有人都可以评论
			like: true, // 所有人都可以点赞
		};
		return permissions[permission] || false;
	};

	return {
		user,
		token,
		isLoggedIn,
		login,
		logout,
		initAuth,
		hasPermission,
	};
});
