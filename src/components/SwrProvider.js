'use client'

import { SWRConfig } from 'swr'

export function SwrProvider({ children }) {
	return (
		<SWRConfig
			value={{
				keepPreviousData: true,
				revalidateOnFocus: false,
				dedupingInterval: 5000,
			}}
		>
			{children}
		</SWRConfig>
	)
}
