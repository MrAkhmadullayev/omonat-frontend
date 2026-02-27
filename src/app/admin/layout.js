'use client'

import AdminNavbar from '@/components/AdminNavbar'
import AdminSidebar from '@/components/AdminSidebar'
import { Button } from '@/components/ui/button'
import { useUser } from '@/hooks/useUser'
import { LoaderIcon, ShieldAlert } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminLayout({ children }) {
	const { user, isLoading, isError } = useUser()
	const router = useRouter()

	useEffect(() => {
		if (!isLoading && !isError && user && !user.isAdmin) {
			router.push('/')
		}
		if (!isLoading && (isError || !user)) {
			router.push('/authentication/login')
		}
	}, [user, isLoading, isError, router])

	if (isLoading) {
		return (
			<div className='flex flex-col h-screen items-center justify-center bg-background gap-4'>
				<div className='relative flex items-center justify-center'>
					<div className='absolute h-16 w-16 rounded-full border-4 border-primary/20 animate-pulse'></div>
					<LoaderIcon className='size-10 animate-spin text-primary relative z-10' />
				</div>
				<p className='text-lg font-bold text-muted-foreground animate-pulse tracking-wide uppercase text-xs'>
					Xavfsiz ulanish o'rnatilmoqda...
				</p>
			</div>
		)
	}

	if (isError || !user || !user.isAdmin) {
		return (
			<div className='flex flex-col h-screen items-center justify-center bg-background p-6 text-center'>
				<div className='h-20 w-20 bg-red-50 rounded-3xl flex items-center justify-center mb-6 ring-8 ring-red-50/50'>
					<ShieldAlert className='size-10 text-red-600' />
				</div>
				<h1 className='text-2xl font-black text-foreground mb-2'>
					Ruxsat mavjud emas
				</h1>
				<p className='text-muted-foreground max-w-sm mb-8 font-medium'>
					Ushbu bo'limga faqat administratorlar kira oladi. Iltimos,
					hisobingizni tekshiring.
				</p>
				<Button
					onClick={() => router.push('/')}
					className='rounded-xl px-8 h-11 font-bold shadow-lg shadow-primary/20'
				>
					Bosh sahifaga qaytish
				</Button>
			</div>
		)
	}

	return (
		<div className='flex min-h-screen bg-muted/20 selection:bg-primary/10'>
			{/* Sidebar for Desktop */}
			<aside className='hidden md:block w-72 shrink-0 border-r bg-background'>
				<AdminSidebar className='fixed w-72 border-r-0' />
			</aside>

			<div className='flex-1 flex flex-col min-w-0 min-h-screen'>
				<AdminNavbar user={user} />
				<main className='flex-1 overflow-x-hidden'>
					<div className='p-4 md:p-8 lg:p-12 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 ease-out'>
						{children}
					</div>
				</main>

				<footer className='py-6 px-4 text-center border-t bg-background/50 backdrop-blur-sm'>
					<p className='text-xs font-bold text-muted-foreground/60 uppercase tracking-[0.2em]'>
						Omonat Boshqaruv Tizimi © {new Date().getFullYear()}
					</p>
				</footer>
			</div>
		</div>
	)
}
