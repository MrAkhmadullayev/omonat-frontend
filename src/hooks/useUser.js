import { authApi } from '@/lib/api'
import useSWR from 'swr'

export function useUser() {
	const { data, error, isLoading, mutate } = useSWR('/auth/me', authApi.getMe, {
		shouldRetryOnError: false,
	})

	return {
		user: data,
		isLoading,
		isError: error,
		mutate,
	}
}
