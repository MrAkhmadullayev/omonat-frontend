'use client'

import { format } from 'date-fns'
import { uz } from 'date-fns/locale'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'
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
import { dashboardApi } from '@/lib/api'
import { CONTAINER_VARIANTS, ITEM_VARIANTS } from '@/lib/constants'
import { formatMoney } from '@/lib/formatters'

import ErrorState from '@/components/ErrorState'
import StatsCard from '@/components/StatsCard'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
	Activity,
	ArrowDownRight,
	ArrowUpRight,
	CreditCard,
	Receipt,
	Wallet,
} from 'lucide-react'

const CustomTooltip = ({ active, payload, label }) => {
	if (!active || !payload?.length) return null
	return (
		<div className='bg-background/95 backdrop-blur-sm border border-border/50 rounded-xl shadow-xl p-3 min-w-[160px]'>
			<p className='text-xs font-bold text-foreground mb-2'>{label}</p>
			{payload.map((entry, i) => (
				<p
					key={i}
					className='text-xs font-medium text-muted-foreground flex items-center gap-2'
				>
					<span
						className='w-2.5 h-2.5 rounded-full inline-block'
						style={{ backgroundColor: entry.color }}
					/>
					{entry.name}: {formatMoney(entry.value)}
				</p>
			))}
		</div>
	)
}

export default function Home() {
	const router = useRouter()
	const { user, isLoading: isUserLoading, isError } = useUser()

	const {
		data: stats,
		error: statsError,
		isLoading: isStatsLoading,
	} = useSWR(user ? '/dashboard/stats' : null, () => dashboardApi.getStats(), {
		revalidateOnFocus: true,
	})

	useEffect(() => {
		if (isError) router.push('/authentication/login')
	}, [isError, router])

	const chartData = useMemo(() => {
		if (!stats?.chartData) return []
		return stats.chartData
	}, [stats])

	if (statsError) {
		return <ErrorState message={statsError.message} />
	}

	if (isUserLoading || isStatsLoading || !user || !stats) {
		return (
			<div className='flex flex-1 flex-col gap-4 md:gap-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full'>
				<div className='mb-2'>
					<Skeleton className='h-8 w-64 rounded-lg' />
				</div>
				<div className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
					{[1, 2, 3].map(i => (
						<Card
							key={i}
							className='border-border/50 bg-background/50 shadow-sm'
						>
							<CardHeader className='flex flex-row items-center justify-between pb-2'>
								<Skeleton className='h-4 w-24' />
								<Skeleton className='h-8 w-8 rounded-lg' />
							</CardHeader>
							<CardContent>
								<Skeleton className='h-8 w-32 mb-2' />
								<Skeleton className='h-3 w-40' />
							</CardContent>
						</Card>
					))}
				</div>
				<div className='grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-7'>
					<Card className='lg:col-span-4 border-border/50 bg-background/50 shadow-sm'>
						<CardHeader className='pb-2 md:pb-6'>
							<Skeleton className='h-6 w-40 mb-2' />
							<Skeleton className='h-4 w-56' />
						</CardHeader>
						<CardContent>
							<Skeleton className='h-[300px] w-full rounded-xl' />
						</CardContent>
					</Card>
					<Card className='lg:col-span-3 border-border/50 bg-background/50 shadow-sm'>
						<CardHeader className='pb-4'>
							<Skeleton className='h-6 w-40 mb-2' />
							<Skeleton className='h-4 w-32' />
						</CardHeader>
						<CardContent>
							<div className='space-y-4 md:space-y-5'>
								{[1, 2, 3, 4, 5].map(i => (
									<div key={i} className='flex items-center gap-4'>
										<Skeleton className='h-10 w-10 rounded-full shrink-0' />
										<div className='space-y-2 flex-1'>
											<Skeleton className='h-4 w-3/4' />
											<Skeleton className='h-3 w-1/2' />
										</div>
										<Skeleton className='h-4 w-20' />
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		)
	}

	return (
		<motion.div
			initial='hidden'
			animate='show'
			variants={CONTAINER_VARIANTS}
			className='flex flex-1 flex-col gap-4 md:gap-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full'
		>
			<motion.div variants={ITEM_VARIANTS} className='mb-2'>
				<h1 className='text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground'>
					Xush kelibsiz,{' '}
					<span className='text-primary'>{user?.name.split(' ')[0]}</span> 👋
				</h1>
			</motion.div>

			<div className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
				<StatsCard
					title='Qarzlarim'
					value={formatMoney(stats?.activeDebts)}
					icon={CreditCard}
					iconBg='bg-red-100/50 dark:bg-red-500/20'
					iconColor='text-red-600 dark:text-red-400'
					subtitle={
						<span className='flex items-center gap-1'>
							<ArrowDownRight className='w-3 h-3 text-red-500' /> Jami
							to'lanmagan
						</span>
					}
					className='relative overflow-hidden'
				/>
				<StatsCard
					title='Haqdorligim'
					value={formatMoney(stats?.activeReceivables)}
					icon={Wallet}
					iconBg='bg-blue-100/50 dark:bg-blue-500/20'
					iconColor='text-blue-600 dark:text-blue-400'
					subtitle={
						<span className='flex items-center gap-1'>
							<ArrowUpRight className='w-3 h-3 text-blue-500' /> Kutilayotgan
						</span>
					}
					className='relative overflow-hidden'
				/>
				<StatsCard
					title='Bu oydagi sarf'
					value={formatMoney(stats?.monthlyExpenses)}
					valueColor='text-primary'
					icon={Receipt}
					iconBg='bg-primary/10'
					iconColor='text-primary'
					subtitle='Joriy oy xarajatlari'
					className='bg-primary/5 sm:col-span-2 lg:col-span-1'
				/>
			</div>

			<div className='grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-7'>
				<motion.div variants={ITEM_VARIANTS} className='lg:col-span-4 h-full'>
					<Card className='h-full hover:shadow-md transition-shadow border-border/50 flex flex-col'>
						<CardHeader className='pb-2 md:pb-6'>
							<CardTitle className='text-base md:text-lg font-bold tracking-tight'>
								Moliyaviy ko'rsatkichlar
							</CardTitle>
							<CardDescription className='text-xs md:text-sm font-medium'>
								So'nggi 6 oydagi qarz va tushumlar
							</CardDescription>
						</CardHeader>
						<CardContent className='flex-1 p-2 md:p-6 md:pt-0'>
							<div className='h-[250px] md:h-[300px] w-full'>
								<ResponsiveContainer width='100%' height='100%'>
									<BarChart data={chartData} barGap={4}>
										<CartesianGrid
											strokeDasharray='3 3'
											stroke='hsl(var(--border))'
											vertical={false}
										/>
										<XAxis
											dataKey='name'
											tick={{
												fontSize: 11,
												fill: 'hsl(var(--foreground))',
											}}
											axisLine={false}
											tickLine={false}
										/>
										<YAxis
											tick={{
												fontSize: 11,
												fill: 'hsl(var(--muted-foreground))',
											}}
											axisLine={false}
											tickLine={false}
											tickFormatter={v => (v > 0 ? `${v / 1000}k` : 0)}
										/>
										<Tooltip
											content={<CustomTooltip />}
											cursor={{ fill: 'hsl(var(--muted) / 0.5)' }}
										/>
										<Bar
											dataKey='Kirim'
											fill='#3b82f6'
											radius={[4, 4, 0, 0]}
											barSize={20}
										/>
										<Bar
											dataKey='Chiqim'
											fill='#ef4444'
											radius={[4, 4, 0, 0]}
											barSize={20}
										/>
									</BarChart>
								</ResponsiveContainer>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div variants={ITEM_VARIANTS} className='lg:col-span-3 h-full'>
					<Card className='h-full hover:shadow-md transition-shadow border-border/50 flex flex-col'>
						<CardHeader className='pb-4'>
							<CardTitle className='text-base md:text-lg font-bold tracking-tight'>
								So'nggi amaliyotlar
							</CardTitle>
							<CardDescription className='text-xs md:text-sm font-medium'>
								Yaqinda qo'shilgan yozuvlar
							</CardDescription>
						</CardHeader>
						<CardContent className='flex-1 p-3 md:p-6 md:pt-0'>
							<div className='space-y-2 md:space-y-3'>
								{!stats?.recentActivities ||
								stats.recentActivities.length === 0 ? (
									<div className='flex flex-col items-center justify-center py-10 md:py-14 text-center text-muted-foreground bg-muted/20 rounded-2xl border border-dashed'>
										<Activity className='mb-3 h-8 w-8 md:h-10 md:w-10 text-muted-foreground/30' />
										<p className='text-xs md:text-sm font-semibold'>
											Hozircha tranzaksiyalar yo'q
										</p>
									</div>
								) : (
									stats.recentActivities.map(activity => {
										const detailHref =
											activity.type === 'receivable'
												? `/receivables/${activity.id}`
												: activity.type === 'debt'
													? `/debts/${activity.id}`
													: `/expenses/${activity.id}`

										return (
											<Link
												key={activity.id}
												href={detailHref}
												className='flex items-center p-2.5 md:p-3 rounded-xl transition-all hover:bg-muted/50 hover:scale-[1.01] border border-transparent hover:border-border/50 group active:scale-[0.98]'
											>
												<div
													className={`h-9 w-9 md:h-11 md:w-11 rounded-full flex items-center justify-center shrink-0 ${
														activity.type === 'receivable'
															? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
															: activity.type === 'debt'
																? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
																: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
													}`}
												>
													{activity.type === 'receivable' ? (
														<ArrowUpRight className='h-4 w-4 md:h-5 md:w-5' />
													) : (
														<ArrowDownRight className='h-4 w-4 md:h-5 md:w-5' />
													)}
												</div>
												<div className='ml-3 md:ml-4 flex-1 min-w-0'>
													<p className='text-sm font-semibold truncate text-foreground group-hover:text-primary transition-colors tracking-tight'>
														{activity.title}
													</p>
													<p className='text-xs text-muted-foreground mt-0.5'>
														{format(new Date(activity.date), 'dd MMM, HH:mm', {
															locale: uz,
														})}
													</p>
												</div>
												<div
													className={`ml-2 font-medium text-sm whitespace-nowrap ${
														activity.type === 'receivable'
															? 'text-blue-600'
															: 'text-foreground'
													}`}
												>
													{activity.type === 'receivable' ? '+' : '-'}{' '}
													{formatMoney(activity.amount)}
												</div>
											</Link>
										)
									})
								)}
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		</motion.div>
	)
}
