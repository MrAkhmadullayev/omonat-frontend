import axios from 'axios'

const BASE_URL = '/api'
// const BASE_URL = 'http://localhost:2026/api'

export const api = axios.create({
	baseURL: BASE_URL,
	withCredentials: true,
	headers: {
		'Content-Type': 'application/json',
	},
	timeout: 9000,
})

api.interceptors.response.use(
	response => {
		return response
	},
	error => {
		const customError = {
			message:
				error.response?.data?.message ||
				'Server bilan ulanishda xatolik yuz berdi',
			status: error.response?.status,
		}

		if (customError.status === 401) {
			console.warn(
				'Avtorizatsiya xatosi: Foydalanuvchi tizimdan chiqib ketgan.',
			)
		}

		return Promise.reject(customError)
	},
)

export const authApi = {
	register: userData => api.post('/auth/register', userData),
	login: credentials => api.post('/auth/login', credentials),
	logout: () => api.post('/auth/logout'),
	getMe: () => api.get('/auth/me').then(res => res.data),
	updateProfile: data => api.put('/auth/profile', data).then(res => res.data),
}

export const debtApi = {
	getAll: params => api.get('/debts', { params }).then(res => res.data),
	getById: id => api.get(`/debts/${id}`).then(res => res.data),
	create: data => api.post('/debts', data).then(res => res.data),
	update: (id, data) => api.put(`/debts/${id}`, data).then(res => res.data),
	delete: id => api.delete(`/debts/${id}`).then(res => res.data),
	pay: (id, paymentData) =>
		api.post(`/debts/${id}/pay`, paymentData).then(res => res.data),
	deleteHistory: (id, historyId) =>
		api.delete(`/debts/${id}/history/${historyId}`).then(res => res.data),
}

export const receivableApi = {
	getAll: params => api.get('/receivables', { params }).then(res => res.data),
	getById: id => api.get(`/receivables/${id}`).then(res => res.data),
	create: data => api.post('/receivables', data).then(res => res.data),
	update: (id, data) =>
		api.put(`/receivables/${id}`, data).then(res => res.data),
	delete: id => api.delete(`/receivables/${id}`).then(res => res.data),
	receivePayment: (id, paymentData) =>
		api.post(`/receivables/${id}/pay`, paymentData).then(res => res.data),
	deleteHistory: (id, historyId) =>
		api.delete(`/receivables/${id}/history/${historyId}`).then(res => res.data),
}

export const expenseApi = {
	getAll: params => api.get('/expenses', { params }).then(res => res.data),
	getById: id => api.get(`/expenses/${id}`).then(res => res.data),
	create: data => api.post('/expenses', data).then(res => res.data),
	update: (id, data) => api.put(`/expenses/${id}`, data).then(res => res.data),
	delete: id => api.delete(`/expenses/${id}`).then(res => res.data),
}

export const dashboardApi = {
	getStats: () => api.get('/dashboard/stats').then(res => res.data),
}

export const adminApi = {
	getStats: () => api.get('/admin/stats').then(res => res.data),
	getUsers: () => api.get('/admin/users').then(res => res.data),
	getUserData: id => api.get(`/admin/users/${id}`).then(res => res.data),
	toggleBlock: id =>
		api.patch(`/admin/users/${id}/toggle-block`).then(res => res.data),
}
