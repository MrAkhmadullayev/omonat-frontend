'use client'

import Dock from '@/components/Dock'
import { SwrProvider } from '@/components/SwrProvider'
import { ThemeProvider } from '@/components/ThemeProvider'
import TopNavbar from '@/components/TopNavbar'
import { Toaster } from '@/components/ui/sonner'
import { useUser } from '@/hooks/useUser'
import { usePathname } from 'next/navigation'

export default function LayoutWrapper({ children }) {
	const pathname = usePathname()
	const isAuthRoute = pathname.startsWith('/authentication')
	const { user, isLoading } = useUser(isAuthRoute)

	return (
		<ThemeProvider
			attribute='class'
			defaultTheme='dark'
			enableSystem
			disableTransitionOnChange
		>
			<SwrProvider>
				{!isAuthRoute && <TopNavbar user={user} isLoading={isLoading} />}

				<main
					className={`flex-1 flex flex-col ${!isAuthRoute ? 'pt-14 md:pt-16 lg:pt-18 pb-24' : ''}`}
				>
					{children}
				</main>

				{!isAuthRoute && <Dock user={user} isLoading={isLoading} />}

				<Toaster />
			</SwrProvider>
		</ThemeProvider>
	)
}
