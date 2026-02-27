'use client'

import { authApi } from '@/lib/api'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

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
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet'
import {
	CreditCard,
	LayoutDashboard,
	LoaderIcon,
	LogOut,
	Menu,
	Receipt,
	ShieldCheck,
	UserCircle,
	Wallet,
} from 'lucide-react'

const menuItems = [
	{ name: 'Asosiy (Dashboard)', icon: LayoutDashboard, href: '/' },
	{ name: 'Qarzlarim', icon: CreditCard, href: '/debts' },
	{ name: 'Haqdorligim', icon: Wallet, href: '/receivables' },
	{ name: 'Harajatlar', icon: Receipt, href: '/expenses' },
	{ name: 'Profil', icon: UserCircle, href: '/profile' },
]

export default function Navbar({ user }) {
	const currentMenuItems = [...menuItems]
	if (user?.isAdmin) {
		currentMenuItems.unshift({
			name: 'Admin Panel',
			icon: ShieldCheck,
			href: '/admin',
		})
	}
	const pathname = usePathname()
	const [isSheetOpen, setIsSheetOpen] = useState(false)
	const [isLoggingOut, setIsLoggingOut] = useState(false)

	const handleLogout = async () => {
		try {
			setIsLoggingOut(true)
			await authApi.logout()
			window.location.href = '/authentication/login'
		} catch (error) {
			console.error(error)
			setIsLoggingOut(false)
		}
	}

	return (
		<>
			{isLoggingOut && (
				<div className='fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm'>
					<LoaderIcon className='size-10 animate-spin text-primary mb-4' />
					<p className='text-lg font-medium text-foreground animate-pulse'>
						Tizimdan chiqilmoqda...
					</p>
				</div>
			)}

			<header className='sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 shadow-sm sm:px-6'>
				<div className='flex items-center gap-4'>
					<Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
						<SheetTrigger asChild>
							<Button
								variant='outline'
								size='icon'
								className='shrink-0 transition-transform hover:scale-105'
							>
								<Menu className='h-5 w-5' />
								<span className='sr-only'>Menyuni ochish</span>
							</Button>
						</SheetTrigger>

						<SheetContent
							side='left'
							className='flex w-[300px] flex-col justify-between p-6 sm:w-[340px] transition-transform duration-700 ease-in-out'
						>
							<div>
								<SheetHeader className='mb-8 flex flex-row items-center gap-3 space-y-0 text-left'>
									<div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-2xl font-bold text-primary-foreground shadow-sm'>
										O
									</div>
									<SheetTitle className='text-2xl font-bold tracking-tight text-primary'>
										Omonat
									</SheetTitle>
								</SheetHeader>

								<nav className='grid gap-2'>
									{currentMenuItems.map((item, index) => {
										const Icon = item.icon
										const isActive = pathname === item.href

										return (
											<Link
												key={index}
												href={item.href}
												onClick={() => setIsSheetOpen(false)}
												className={`flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
													isActive
														? 'bg-primary text-primary-foreground shadow-md scale-[1.02]'
														: 'text-muted-foreground hover:bg-muted hover:text-foreground'
												}`}
											>
												<Icon
													className={`h-5 w-5 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`}
												/>
												{item.name}
											</Link>
										)
									})}
								</nav>
							</div>

							<div className='mt-auto pt-8'>
								<div className='mb-4 flex items-center gap-4 rounded-xl bg-muted/50 p-4 border border-border/50'>
									<Avatar className='h-10 w-10 border border-muted-foreground/20 shadow-sm'>
										<AvatarFallback className='bg-primary/10 font-bold text-primary'>
											{user?.name?.charAt(0).toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<div className='flex flex-col overflow-hidden'>
										<span className='truncate text-sm font-bold text-foreground'>
											{user?.name}
										</span>
										<span className='truncate text-xs text-muted-foreground'>
											{user?.phone}
										</span>
									</div>
								</div>

								<Button
									variant='destructive'
									className='w-full justify-start gap-3 rounded-xl'
									onClick={handleLogout}
								>
									<LogOut className='h-5 w-5' />
									Tizimdan chiqish
								</Button>
							</div>
						</SheetContent>
					</Sheet>

					<Link
						href='/'
						className='hidden items-center gap-2 transition-transform hover:scale-105 md:flex'
					>
						<div className='flex h-8 w-8 items-center justify-center rounded-md bg-primary text-xl font-bold text-primary-foreground shadow-md'>
							O
						</div>
						<span className='text-xl font-bold tracking-tight text-primary'>
							Omonat
						</span>
					</Link>
				</div>

				<div className='flex items-center gap-4'>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant='ghost'
								size='icon'
								className='rounded-full ring-2 ring-transparent transition-all hover:ring-primary/20'
							>
								<Avatar className='h-9 w-9 border border-muted-foreground/20 shadow-sm'>
									<AvatarFallback className='bg-primary/10 font-bold text-primary'>
										{user?.name?.charAt(0).toUpperCase()}
									</AvatarFallback>
								</Avatar>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end' className='w-56 rounded-xl'>
							<DropdownMenuLabel className='font-bold'>
								Mening hisobim
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<div className='px-2 py-2 text-sm text-muted-foreground bg-muted/30 rounded-md mx-1 mb-1'>
								<p className='font-medium text-foreground'>{user?.name}</p>
								<p className='text-xs'>{user?.phone}</p>
							</div>
							<DropdownMenuSeparator />
							<Link href='/profile'>
								<DropdownMenuItem className='cursor-pointer py-2'>
									<UserCircle className='mr-2 h-4 w-4 text-muted-foreground' />{' '}
									Profil sozlamalari
								</DropdownMenuItem>
							</Link>
							<DropdownMenuItem
								onClick={handleLogout}
								className='cursor-pointer py-2 text-red-600 focus:bg-red-50 focus:text-red-600'
							>
								<LogOut className='mr-2 h-4 w-4' /> Tizimdan chiqish
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</header>
		</>
	)
}
