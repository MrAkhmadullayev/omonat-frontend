'use client'

import { ThemeToggle } from '@/components/ThemeToggle'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { authApi } from '@/lib/api'
import { LogOut, UserCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

export default function TopNavbar({ user, isLoading }) {
	const router = useRouter()
	const [isPending, startTransition] = useTransition()
	const [isLoggingOut, setIsLoggingOut] = useState(false)

	const handleLogout = async () => {
		try {
			setIsLoggingOut(true)
			await authApi.logout()

			startTransition(() => {
				router.push('/authentication/login')
				router.refresh()
			})
		} catch (error) {
			setIsLoggingOut(false)
		}
	}

	if (isLoggingOut || isPending) {
		return (
			<div className='fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-md transition-all'>
				<div className='relative flex flex-col items-center bg-background/95 p-10 rounded-[2rem] border border-border/50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] max-w-xs w-full mx-4 overflow-hidden animate-in zoom-in-95 fade-in duration-300'>
					<div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 blur-[50px] rounded-full pointer-events-none'></div>

					<div className='relative flex items-center justify-center h-20 w-20 mb-6'>
						<div className='absolute inset-0 rounded-full border-4 border-muted/50'></div>
						<div className='absolute inset-0 rounded-full border-4 border-primary border-r-transparent border-t-transparent animate-[spin_1s_cubic-bezier(0.55,0.15,0.45,0.85)_infinite]'></div>
						<div className='h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shadow-inner'>
							<LogOut className='h-5 w-5 ml-1 animate-pulse' />
						</div>
					</div>

					<h3 className='text-xl font-extrabold text-foreground tracking-tight mb-2 relative z-10 text-center'>
						Tizimdan chiqilmoqda
					</h3>
					<p className='text-[13px] text-muted-foreground text-center animate-pulse relative z-10 font-medium leading-relaxed'>
						Xavfsiz uzilish bajarilmoqda,
						<br /> iltimos kuting...
					</p>
				</div>
			</div>
		)
	}

	return (
		<header className='fixed top-0 z-50 flex h-14 md:h-16 lg:h-18 w-full items-center justify-between border-b bg-background/80 backdrop-blur-md px-4 shadow-sm sm:px-6 transition-colors duration-300'>
			<div className='flex items-center gap-3'>
				<Link
					href='/'
					className='flex items-center gap-2 group transition-transform duration-300'
				>
					<div className='flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-xl font-extrabold text-primary-foreground shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5 transition-all'>
						O
					</div>
					<div className='flex flex-col'>
						<span className='text-xl font-extrabold tracking-tight text-foreground leading-none'>
							Omonat
						</span>
						{user?.isAdmin && !isLoading && (
							<span className='text-[10px] font-bold text-primary uppercase tracking-widest mt-0.5'>
								Admin
							</span>
						)}
					</div>
				</Link>
			</div>
			<div className='flex items-center gap-4'>
				<ThemeToggle />
				{isLoading ? (
					<div className='flex items-center gap-3 w-32'>
						<div className='hidden md:flex flex-col items-end gap-1.5 mr-1 w-full'>
							<Skeleton className='h-3.5 w-full max-w-[5rem]' />
							<Skeleton className='h-2.5 w-16' />
						</div>
						<Skeleton className='h-10 w-10 rounded-full shrink-0' />
					</div>
				) : user ? (
					<>
						<div className='hidden md:flex flex-col items-end mr-1 text-right'>
							<span className='text-sm font-bold text-foreground leading-none'>
								{user.name}
							</span>
							<span className='text-[10px] font-semibold text-muted-foreground mt-1'>
								{user.phone}
							</span>
						</div>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant='ghost'
									size='icon'
									className='relative h-10 w-10 rounded-full ring-2 ring-transparent transition-all hover:ring-primary/20 focus-visible:ring-primary/50'
								>
									<Avatar className='h-10 w-10 border border-border/50 shadow-sm'>
										<AvatarFallback className='bg-primary/10 font-bold text-primary'>
											{user.name?.charAt(0).toUpperCase()}
										</AvatarFallback>
									</Avatar>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className='w-56 rounded-xl shadow-lg border-border/50'
								align='end'
								forceMount
							>
								<div className='md:hidden px-4 py-3 border-b border-border/50 mb-1'>
									<p className='font-bold text-sm text-foreground truncate'>
										{user.name}
									</p>
									<p className='text-xs text-muted-foreground truncate'>
										{user.phone}
									</p>
								</div>

								<DropdownMenuLabel className='hidden md:block font-bold px-4 py-2 text-muted-foreground'>
									Mening hisobim
								</DropdownMenuLabel>

								<Link href='/profile'>
									<DropdownMenuItem className='cursor-pointer py-2.5 px-4 font-medium transition-colors hover:bg-muted rounded-lg mx-1'>
										<UserCircle className='mr-2 h-4 w-4 text-muted-foreground' />{' '}
										Profil
									</DropdownMenuItem>
								</Link>

								<DropdownMenuSeparator className='opacity-50 my-1' />

								<DropdownMenuItem
									onClick={handleLogout}
									className='cursor-pointer py-2.5 px-4 font-bold text-red-600 focus:bg-red-50 focus:text-red-700 dark:focus:bg-red-950/30 dark:focus:text-red-400 transition-colors rounded-lg mx-1'
								>
									<LogOut className='mr-2 h-4 w-4' /> Chiqish
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</>
				) : null}
			</div>
		</header>
	)
}
