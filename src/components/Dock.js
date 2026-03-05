'use client'

import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import {
	ArrowLeft,
	BarChart3,
	CreditCard,
	LayoutDashboard,
	Plus,
	Receipt,
	ShieldCheck,
	UserCircle,
	Users,
	Wallet,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const DOCK_MODES = {
	DEFAULT: 'DEFAULT',
	ADMIN: 'ADMIN',
	DEBTS: 'DEBTS',
	RECEIVABLES: 'RECEIVABLES',
	EXPENSES: 'EXPENSES',
}

export default function Dock({ user, isLoading }) {
	const pathname = usePathname()
	const [mode, setMode] = useState(DOCK_MODES.DEFAULT)

	useEffect(() => {
		if (pathname.startsWith('/admin')) setMode(DOCK_MODES.ADMIN)
		else if (pathname.startsWith('/debts')) setMode(DOCK_MODES.DEBTS)
		else if (pathname.startsWith('/receivables'))
			setMode(DOCK_MODES.RECEIVABLES)
		else if (pathname.startsWith('/expenses')) setMode(DOCK_MODES.EXPENSES)
		else setMode(DOCK_MODES.DEFAULT)
	}, [pathname])

	const getMenuItems = () => {
		switch (mode) {
			case DOCK_MODES.ADMIN:
				return [
					{
						name: 'Orqaga',
						icon: ArrowLeft,
						onClick: () => setMode(DOCK_MODES.DEFAULT),
						type: 'button',
					},
					{ name: 'Statistika', icon: LayoutDashboard, href: '/admin' },
					{ name: 'Foydalanuvchilar', icon: Users, href: '/admin/users' },
				]
			case DOCK_MODES.DEBTS:
				return [
					{
						name: 'Orqaga',
						icon: ArrowLeft,
						onClick: () => setMode(DOCK_MODES.DEFAULT),
						type: 'button',
					},
					{ name: "Ro'yxat", icon: CreditCard, href: '/debts' },
					{ name: 'Hisobot', icon: BarChart3, href: '/debts/reports' },
					{
						name: "Qarz qo'shish",
						icon: Plus,
						href: '/debts/add',
					},
				]
			case DOCK_MODES.RECEIVABLES:
				return [
					{
						name: 'Orqaga',
						icon: ArrowLeft,
						onClick: () => setMode(DOCK_MODES.DEFAULT),
						type: 'button',
					},
					{ name: "Ro'yxat", icon: Wallet, href: '/receivables' },
					{ name: 'Hisobot', icon: BarChart3, href: '/receivables/reports' },
					{
						name: "Haq qo'shish",
						icon: Plus,
						href: '/receivables/add',
					},
				]
			case DOCK_MODES.EXPENSES:
				return [
					{
						name: 'Orqaga',
						icon: ArrowLeft,
						onClick: () => setMode(DOCK_MODES.DEFAULT),
						type: 'button',
					},
					{ name: "Ro'yxat", icon: Receipt, href: '/expenses' },
					{ name: 'Hisobot', icon: BarChart3, href: '/expenses/reports' },
					{
						name: "Harajat qo'shish",
						icon: Plus,
						href: '/expenses/add',
					},
				]
			default:
				const items = [
					{ name: 'Asosiy', icon: LayoutDashboard, href: '/' },
					{ name: 'Qarzlar', icon: CreditCard, href: '/debts' },
					{ name: 'Haqdorlik', icon: Wallet, href: '/receivables' },
					{ name: 'Harajatlar', icon: Receipt, href: '/expenses' },
					{ name: 'Profil', icon: UserCircle, href: '/profile' },
				]
				if (user?.isAdmin) {
					items.unshift({ name: 'Admin', icon: ShieldCheck, href: '/admin' })
				}
				return items
		}
	}

	if (isLoading || !user) {
		return (
			<div className='fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center w-full px-4 sm:px-0 pointer-events-none'>
				<nav className='pointer-events-auto flex items-center gap-1.5 p-2 rounded-2xl bg-white/70 dark:bg-black/70 backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.2)]'>
					{[1, 2, 3, 4, 5].map(i => (
						<div
							key={i}
							className='h-11 w-11 lg:w-28 rounded-xl bg-muted-foreground/20 animate-pulse'
						/>
					))}
				</nav>
			</div>
		)
	}

	const menuItems = getMenuItems()

	return (
		<div className='fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center w-full px-4 sm:px-0 pointer-events-none'>
			<motion.nav
				layout
				className='pointer-events-auto flex items-center gap-1.5 p-2 rounded-2xl bg-white/70 dark:bg-black/70 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)]'
			>
				<AnimatePresence mode='popLayout'>
					{menuItems.map((item, index) => {
						const Icon = item.icon
						const isActive = item.href === pathname
						const isPrimary = item.primary

						const content = (
							<div
								className={cn(
									'relative p-2.5 lg:px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2.5 group',
									isActive && !isPrimary && 'bg-primary/10 text-primary',
									!isActive &&
										!isPrimary &&
										'text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-105 active:scale-95',
									isPrimary &&
										'bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 px-4',
								)}
							>
								<Icon
									className={cn(
										'h-6 w-6 lg:h-5 lg:w-5',
										isPrimary ? 'h-5 w-5' : '',
									)}
									strokeWidth={isActive || isPrimary ? 2.5 : 2}
								/>
								<span
									className={cn(
										'hidden lg:block text-sm font-semibold whitespace-nowrap tracking-wide',
										isPrimary || isActive ? 'block' : '',
									)}
								>
									{item.name}
								</span>

								<span className='lg:hidden absolute -top-12 left-1/2 -translate-x-1/2 px-2.5 py-1.5 rounded-lg bg-black/90 text-white text-[10px] font-bold uppercase tracking-wider whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-xl'>
									{item.name}
									<div className='absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/90 rotate-45' />
								</span>

								{isActive && !isPrimary && (
									<motion.div
										layoutId='activeIndicator'
										className='absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-1 rounded-full bg-primary lg:w-3/4 w-1'
									/>
								)}
							</div>
						)

						return (
							<motion.div
								key={item.name + mode}
								layout
								initial={{ opacity: 0, scale: 0.8, y: 10 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.8, y: 10 }}
								transition={{ type: 'spring', stiffness: 500, damping: 30 }}
							>
								{item.type === 'button' ? (
									<button
										onClick={item.onClick}
										className='relative focus:outline-none w-full'
									>
										{content}
									</button>
								) : (
									<Link href={item.href} className='relative w-full block'>
										{content}
									</Link>
								)}
							</motion.div>
						)
					})}
				</AnimatePresence>
			</motion.nav>
		</div>
	)
}
