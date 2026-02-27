'use client'

import { format } from 'date-fns'
import { uz } from 'date-fns/locale'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'
import useSWR from 'swr'

import { useUser } from '@/hooks/useUser'
import { authApi, dashboardApi } from '@/lib/api'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
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
	Activity,
	ArrowDownRight,
	ArrowUpRight,
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

const formatMoney = amount => {
	return new Intl.NumberFormat('uz-UZ', {
		style: 'currency',
		currency: 'UZS',
		maximumFractionDigits: 0,
	}).format(amount)
}

const menuItems = [
	{ name: 'Asosiy (Dashboard)', icon: LayoutDashboard, href: '/' },
	{ name: 'Qarzlarim', icon: CreditCard, href: '/debts' },
	{ name: 'Haqdorligim', icon: Wallet, href: '/receivables' },
	{ name: 'Harajatlar', icon: Receipt, href: '/expenses' },
	{ name: 'Profil', icon: UserCircle, href: '/profile' },
]

export default function Home() {
	const router = useRouter()
	const pathname = usePathname()
	const { user, isLoading: isUserLoading, isError } = useUser()
	const [isLoggingOut, setIsLoggingOut] = useState(false)
	const [isSheetOpen, setIsSheetOpen] = useState(false)

	const {
		data: stats,
		error: statsError,
		isLoading: isStatsLoading,
	} = useSWR(user ? '/dashboard/stats' : null, () => dashboardApi.getStats())

	useEffect(() => {
		if (isError) router.push('/authentication/login')
	}, [isError, router])

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

	if (isLoggingOut) {
		return (
			<div className='flex h-screen items-center justify-center bg-muted/30'>
				<div className='flex items-center gap-3 text-lg font-medium text-orange-600 animate-pulse'>
					<LoaderIcon className='size-6 animate-spin' /> Tizimdan chiqilmoqda...
				</div>
			</div>
		)
	}

	if (statsError) {
		return (
			<div className='flex h-screen flex-col items-center justify-center gap-4 bg-muted/30'>
				<p className='text-red-600 font-bold text-xl'>Tarmoq xatoligi!</p>
				<p className='text-muted-foreground'>{statsError.message}</p>
				<Button onClick={() => window.location.reload()} variant='outline'>
					Sahifani yangilash
				</Button>
			</div>
		)
	}

	if (isUserLoading || isStatsLoading || !user || !stats) {
		return (
			<div className='flex h-screen items-center justify-center bg-muted/30'>
				<div className='flex items-center gap-3 text-lg font-medium text-muted-foreground animate-pulse'>
					<LoaderIcon className='size-6 animate-spin' /> Ma'lumotlar
					yuklanmoqda...
				</div>
			</div>
		)
	}

	return (
		<div className='min-h-screen bg-muted/30'>
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
							className='flex w-[300px] flex-col justify-between p-6 sm:w-[340px]'
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
									{user?.isAdmin && (
										<Link
											href='/admin'
											onClick={() => setIsSheetOpen(false)}
											className='flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 text-muted-foreground hover:bg-muted hover:text-foreground'
										>
											<ShieldCheck className='h-5 w-5' />
											Admin Panel
										</Link>
									)}
									{menuItems.map((item, index) => {
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
											{user.name.charAt(0).toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<div className='flex flex-col overflow-hidden'>
										<span className='truncate text-sm font-bold text-foreground'>
											{user.name}
										</span>
										<span className='truncate text-xs text-muted-foreground'>
											{user.phone}
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
										{user.name.charAt(0).toUpperCase()}
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
								<p className='font-medium text-foreground'>{user.name}</p>
								<p className='text-xs'>{user.phone}</p>
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

			<main className='flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8 max-w-7xl mx-auto'>
				<div className='flex items-center justify-between'>
					<h1 className='text-2xl font-bold tracking-tight text-foreground'>
						Xush kelibsiz, {user.name.split(' ')[0]}!
					</h1>
				</div>

				<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
					<Card className='hover:shadow-md transition-all duration-300 hover:-translate-y-1 border-border/50 bg-background/50 backdrop-blur-sm'>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium text-muted-foreground'>
								Qarzlarim (Boshqalarga)
							</CardTitle>
							<div className='p-2 bg-red-100 rounded-full'>
								<CreditCard className='h-4 w-4 text-red-600' />
							</div>
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold text-red-600'>
								- {formatMoney(stats.activeDebts)}
							</div>
							<p className='mt-1 text-xs text-muted-foreground font-medium'>
								Jami to'lanmagan qoldiq
							</p>
						</CardContent>
					</Card>

					<Card className='hover:shadow-md transition-all duration-300 hover:-translate-y-1 border-border/50 bg-background/50 backdrop-blur-sm'>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium text-muted-foreground'>
								Haqdorligim (Olishim kerak)
							</CardTitle>
							<div className='p-2 bg-blue-100 rounded-full'>
								<Wallet className='h-4 w-4 text-blue-600' />
							</div>
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold text-blue-600'>
								+ {formatMoney(stats.activeReceivables)}
							</div>
							<p className='mt-1 text-xs text-muted-foreground font-medium'>
								Kutilayotgan umumiy tushumlar
							</p>
						</CardContent>
					</Card>

					<Card className='hover:shadow-md transition-all duration-300 hover:-translate-y-1 border-border/50 bg-background/50 backdrop-blur-sm'>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium text-muted-foreground'>
								Bu oydagi harajatlar
							</CardTitle>
							<div className='p-2 bg-orange-100 rounded-full'>
								<Receipt className='h-4 w-4 text-orange-600' />
							</div>
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold text-orange-600'>
								{formatMoney(stats.monthlyExpenses)}
							</div>
							<p className='mt-1 text-xs text-muted-foreground font-medium'>
								Joriy oy uchun ko'rsatkich
							</p>
						</CardContent>
					</Card>
				</div>

				<div className='grid gap-6 md:grid-cols-2 lg:grid-cols-7'>
					<Card className='lg:col-span-4 hover:shadow-md transition-shadow border-border/50'>
						<CardHeader>
							<CardTitle>Moliyaviy ko'rsatkichlar</CardTitle>
							<CardDescription>
								So'nggi 6 oydagi kirim va chiqimlar statistikasi
							</CardDescription>
						</CardHeader>
						<CardContent className='pl-0'>
							<div className='h-[320px] w-full mt-4'>
								<ResponsiveContainer width='100%' height='100%'>
									<BarChart
										data={stats.chartData}
										margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
									>
										<CartesianGrid
											strokeDasharray='3 3'
											vertical={false}
											stroke='#e5e7eb'
										/>
										<XAxis
											dataKey='name'
											axisLine={false}
											tickLine={false}
											tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }}
											dy={10}
										/>
										<YAxis
											axisLine={false}
											tickLine={false}
											tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }}
											tickFormatter={value => `${value / 1000}k`}
										/>
										<Tooltip
											cursor={{ fill: '#f3f4f6' }}
											contentStyle={{
												borderRadius: '12px',
												border: 'none',
												boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
											}}
											formatter={value => formatMoney(value)}
										/>
										<Bar
											dataKey='Kirim'
											fill='#3b82f6'
											radius={[6, 6, 0, 0]}
											maxBarSize={40}
										/>
										<Bar
											dataKey='Chiqim'
											fill='#ef4444'
											radius={[6, 6, 0, 0]}
											maxBarSize={40}
										/>
									</BarChart>
								</ResponsiveContainer>
							</div>
						</CardContent>
					</Card>

					<Card className='lg:col-span-3 hover:shadow-md transition-shadow border-border/50'>
						<CardHeader>
							<CardTitle>Joriy oy tranzaksiyalari</CardTitle>
							<CardDescription>So'nggi harakatlar tarixi</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='space-y-6 pr-2'>
								{stats.recentActivities.length === 0 ? (
									<div className='flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed'>
										<Activity className='mb-3 h-10 w-10 text-muted-foreground/30' />
										<p className='text-sm font-medium'>
											Hozircha tranzaksiyalar yo'q
										</p>
									</div>
								) : (
									stats.recentActivities.map(activity => (
										<div
											key={activity.id}
											className='flex items-center p-2 rounded-lg transition-colors hover:bg-muted/50 -mx-2'
										>
											<Avatar className='h-10 w-10 shadow-sm'>
												<AvatarFallback
													className={
														activity.type === 'receivable'
															? 'bg-blue-100 text-blue-600'
															: activity.type === 'debt'
																? 'bg-red-100 text-red-600'
																: 'bg-orange-100 text-orange-600'
													}
												>
													{activity.type === 'receivable' ? (
														<ArrowUpRight className='h-4 w-4' />
													) : (
														<ArrowDownRight className='h-4 w-4' />
													)}
												</AvatarFallback>
											</Avatar>
											<div className='ml-4 space-y-1'>
												<p className='text-sm font-bold leading-none capitalize text-foreground'>
													{activity.title}
												</p>
												<p className='text-xs text-muted-foreground font-medium'>
													{format(new Date(activity.date), 'dd MMM, HH:mm', {
														locale: uz,
													})}
												</p>
											</div>
											<div
												className={`ml-auto font-bold text-sm ${
													activity.type === 'receivable'
														? 'text-blue-600'
														: 'text-red-600'
												}`}
											>
												{activity.type === 'receivable' ? '+' : '-'}
												{formatMoney(activity.amount)}
											</div>
										</div>
									))
								)}
							</div>
						</CardContent>
					</Card>
				</div>
			</main>
		</div>
	)
}
