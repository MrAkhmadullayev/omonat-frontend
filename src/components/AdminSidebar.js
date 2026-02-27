'use client'

import { cn } from '@/lib/utils'
import { ArrowLeft, LayoutDashboard, Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const adminMenuItems = [
	{ name: 'Statistika', icon: LayoutDashboard, href: '/admin' },
	{ name: 'Foydalanuvchilar', icon: Users, href: '/admin/users' },
]

export default function AdminSidebar({ className }) {
	const pathname = usePathname()

	return (
		<div
			className={cn(
				'pb-12 h-screen border-r bg-background flex flex-col shadow-sm',
				className,
			)}
		>
			<div className='space-y-4 py-4 flex flex-col h-full'>
				<div className='px-6 py-6 flex items-center gap-3'>
					<div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-2xl font-bold text-primary-foreground shadow-lg ring-4 ring-primary/10'>
						O
					</div>
					<div className='flex flex-col'>
						<span className='text-xl font-bold tracking-tight text-foreground leading-none'>
							Omonat
						</span>
						<span className='text-xs font-bold text-primary tracking-widest uppercase mt-0.5'>
							Admin Panel
						</span>
					</div>
				</div>

				<div className='px-4 py-2 flex-1'>
					<div className='space-y-1.5'>
						{adminMenuItems.map(item => {
							const Icon = item.icon
							const isActive = pathname === item.href

							return (
								<Link
									key={item.href}
									href={item.href}
									className={cn(
										'group flex items-center rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300',
										isActive
											? 'bg-primary text-primary-foreground shadow-md scale-[1.02]'
											: 'text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-1',
									)}
								>
									<Icon
										className={cn(
											'mr-3 h-5 w-5 transition-colors',
											isActive
												? 'text-primary-foreground'
												: 'text-muted-foreground group-hover:text-foreground',
										)}
									/>
									{item.name}
								</Link>
							)
						})}
					</div>
				</div>

				<div className='px-4 py-4 mt-auto border-t bg-muted/20'>
					<Link
						href='/'
						className='group flex items-center rounded-xl px-4 py-3 text-sm font-bold text-muted-foreground hover:bg-background hover:text-primary hover:shadow-sm transition-all duration-300 border border-transparent hover:border-border'
					>
						<ArrowLeft className='mr-3 h-5 w-5 transition-transform group-hover:-translate-x-1' />
						Asosiy saytga qaytish
					</Link>
				</div>
			</div>
		</div>
	)
}
