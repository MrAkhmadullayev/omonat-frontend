'use client'

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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { authApi } from '@/lib/api'
import { LogOut, Menu, User as UserIcon } from 'lucide-react'
import { useState } from 'react'
import AdminSidebar from './AdminSidebar'

export default function AdminNavbar({ user }) {
	const [isOpen, setIsOpen] = useState(false)

	const handleLogout = async () => {
		try {
			await authApi.logout()
			window.location.href = '/authentication/login'
		} catch (error) {
			console.error(error)
		}
	}

	return (
		<header className='sticky top-0 z-40 flex h-16 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 shadow-sm md:px-8'>
			<div className='flex flex-1 items-center gap-4'>
				<Sheet open={isOpen} onOpenChange={setIsOpen}>
					<SheetTrigger asChild>
						<Button
							variant='outline'
							size='icon'
							className='md:hidden rounded-xl border-border/50'
						>
							<Menu className='h-5 w-5' />
							<span className='sr-only'>Menyuni ochish</span>
						</Button>
					</SheetTrigger>
					<SheetContent side='left' className='p-0 w-[280px]'>
						<AdminSidebar className='border-none' />
					</SheetContent>
				</Sheet>

				<div className='flex flex-col'>
					<h2 className='text-lg font-bold tracking-tight text-foreground md:text-xl'>
						Admin Boshqaruv
					</h2>
					<p className='text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-widest md:hidden'>
						Omonat System
					</p>
				</div>
			</div>

			<div className='flex items-center gap-4'>
				<div className='hidden md:flex flex-col items-end mr-2 text-right'>
					<span className='text-sm font-bold text-foreground leading-none'>
						{user?.name}
					</span>
					<span className='text-[10px] font-semibold text-primary uppercase tracking-wider mt-1'>
						Administrator
					</span>
				</div>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant='ghost'
							className='relative h-10 w-10 rounded-full ring-2 ring-transparent transition-all hover:ring-primary/20'
						>
							<Avatar className='h-10 w-10 border-2 border-primary/10 shadow-sm'>
								<AvatarFallback className='bg-primary/10 font-bold text-primary'>
									{user?.name?.charAt(0).toUpperCase()}
								</AvatarFallback>
							</Avatar>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className='w-64 rounded-xl p-2'
						align='end'
						forceMount
					>
						<DropdownMenuLabel className='font-bold p-3'>
							<div className='flex flex-col space-y-1'>
								<p className='text-sm font-bold leading-none'>{user?.name}</p>
								<p className='text-xs leading-none text-muted-foreground font-medium mt-1'>
									{user?.phone}
								</p>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator className='opacity-50' />
						<DropdownMenuItem
							onClick={() => (window.location.href = '/profile')}
							className='rounded-lg py-2.5 cursor-pointer'
						>
							<UserIcon className='mr-3 h-4 w-4 text-muted-foreground' />
							<span>Profil sozlamalari</span>
						</DropdownMenuItem>
						<DropdownMenuSeparator className='opacity-50' />
						<DropdownMenuItem
							onClick={handleLogout}
							className='text-red-600 focus:text-red-700 focus:bg-red-50 rounded-lg py-2.5 cursor-pointer font-bold'
						>
							<LogOut className='mr-3 h-4 w-4' />
							<span>Tizimdan chiqish</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	)
}
