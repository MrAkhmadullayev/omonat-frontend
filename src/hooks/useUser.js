import { authApi } from '@/lib/api'
import useSWR from 'swr'

export function useUser(skip = false) {
	const { data, error, isLoading, mutate } = useSWR(
		skip ? null : '/auth/me',
		authApi.getMe,
		{
			shouldRetryOnError: false,
		},
	)

	return {
		user: data,
		isLoading,
		isError: error,
		mutate,
	}
}
