'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUser } from '@/hooks/useUser'
import { debtApi } from '@/lib/api'
import { formatMoney } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import {
	ArcElement,
	BarElement,
	CategoryScale,
	Chart as ChartJS,
	Tooltip as ChartTooltip,
	Legend,
	LinearScale,
	Title,
} from 'chart.js'
import { format } from 'date-fns'
import { uz } from 'date-fns/locale'
import { AnimatePresence, motion } from 'framer-motion'
import {
	AlertCircle,
	ArrowLeft,
	Banknote,
	Calendar,
	CheckCircle2,
	CreditCard,
	Loader2,
	TrendingUp,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState, useTransition } from 'react'
import { Bar, Doughnut } from 'react-chartjs-2'
import useSWR from 'swr'

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	ArcElement,
	Title,
	ChartTooltip,
	Legend,
)

export default function DebtReportsPage() {
	const router = useRouter()
	const { user, isLoading: isUserLoading, isError } = useUser()
	const [isPending, startTransition] = useTransition()
	const [activePeriod, setActivePeriod] = useState('daily')

	const {
		data: reportsData,
		error: reportsError,
		isLoading: isReportsLoading,
	} = useSWR(user ? '/debts/reports' : null, () => debtApi.getReports(), {
		revalidateOnFocus: true,
	})

	useEffect(() => {
		if (isError) router.push('/authentication/login')
	}, [isError, router])

	const navigate = path => {
		startTransition(() => {
			router.push(path)
		})
	}

	const chartData = useMemo(() => {
		if (!reportsData) return { labels: [], datasets: [] }

		let data = []
		let label = ''

		switch (activePeriod) {
			case 'daily':
				data = reportsData.daily || []
				label = 'Kunlik qarzlar'
				break
			case 'weekly':
				data = reportsData.weekly || []
				label = 'Haftalik qarzlar'
				break
			case 'monthly':
				data = reportsData.monthly || []
				label = 'Oylik qarzlar'
				break
			case 'yearly':
				data = reportsData.yearly || []
				label = 'Yillik qarzlar'
				break
			default:
				data = reportsData.daily || []
				label = 'Kunlik qarzlar'
		}

		return {
			labels: data.map(d => {
				if (activePeriod === 'daily') return d._id
				if (activePeriod === 'weekly') return `${d._id}-hafta`
				if (activePeriod === 'monthly') {
					const date = new Date()
					date.setMonth(d._id.month - 1)
					return format(date, 'MMM', { locale: uz })
				}
				return d._id
			}),
			datasets: [
				{
					label: label,
					data: data.map(d => d.amount),
					backgroundColor: '#3b82f6', // Tailwind blue-500
					borderRadius: 6,
					borderSkipped: false,
					barPercentage: 0.6,
					categoryPercentage: 0.8,
				},
			],
		}
	}, [reportsData, activePeriod])

	const donutChartData = useMemo(() => {
		if (!reportsData?.paymentMethods) return { labels: [], datasets: [] }

		const methods = reportsData.paymentMethods
		return {
			labels: methods.map(m => (m._id === 'card' ? 'Karta' : 'Naqd')),
			datasets: [
				{
					data: methods.map(m => m.amount),
					backgroundColor: ['#3b82f6', '#10b981'], // blue-500 va emerald-500
					hoverBackgroundColor: ['#2563eb', '#059669'],
					borderWidth: 0,
					cutout: '70%', // Ichini ochiq (Donut) qilish
				},
			],
		}
	}, [reportsData])

	const chartOptions = useMemo(
		() => ({
			responsive: true,
			maintainAspectRatio: false,
			interaction: { mode: 'index', intersect: false },
			plugins: {
				legend: { display: false },
				tooltip: {
					backgroundColor: 'rgba(255, 255, 255, 0.95)',
					titleColor: '#0f172a',
					bodyColor: '#475569',
					borderColor: '#e2e8f0',
					borderWidth: 1,
					padding: 12,
					boxPadding: 4,
					usePointStyle: true,
					titleFont: {
						size: 13,
						weight: '700',
						family: 'var(--font-geist-sans)',
					},
					bodyFont: {
						size: 12,
						weight: '500',
						family: 'var(--font-geist-sans)',
					},
					callbacks: {
						label: context => ` Miqdor: ${formatMoney(context.raw)}`,
					},
				},
			},
			scales: {
				x: {
					grid: { display: false },
					border: { display: false },
					ticks: {
						color: '#64748b',
						font: { size: 11, family: 'var(--font-geist-sans)' },
					},
				},
				y: {
					grid: { color: '#f1f5f9', drawBorder: false },
					border: { display: false },
					ticks: {
						color: '#64748b',
						font: { size: 11, family: 'var(--font-geist-sans)' },
						callback: value => (value > 0 ? `${value / 1000}k` : 0),
					},
				},
			},
		}),
		[],
	)

	const containerVariants = {
		hidden: { opacity: 0 },
		show: { opacity: 1, transition: { staggerChildren: 0.1 } },
	}

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		show: {
			opacity: 1,
			y: 0,
			transition: { type: 'spring', stiffness: 300, damping: 24 },
		},
	}

	if (isUserLoading || isReportsLoading || !user) {
		return (
			<div className='flex flex-1 flex-col gap-4 md:gap-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full'>
				<div className='flex items-center gap-4 mb-2'>
					<Skeleton className='h-10 w-10 rounded-xl' />
					<div>
						<Skeleton className='h-8 w-48 mb-2' />
						<Skeleton className='h-3 w-64' />
					</div>
				</div>

				<div className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
					{[1, 2, 3, 4].map(i => (
						<Card
							key={i}
							className='border-border/50 bg-background/50 shadow-sm'
						>
							<CardHeader className='pb-2'>
								<Skeleton className='h-4 w-28' />
							</CardHeader>
							<CardContent>
								<Skeleton className='h-8 w-32 mb-2' />
								<Skeleton className='h-5 w-24 rounded-full' />
							</CardContent>
						</Card>
					))}
				</div>

				<div className='grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-7'>
					<Card className='lg:col-span-4 border-border/50 bg-background/50 shadow-sm'>
						<CardHeader className='flex flex-row justify-between pb-2 md:pb-6'>
							<div>
								<Skeleton className='h-5 w-40 mb-2' />
								<Skeleton className='h-3 w-56' />
							</div>
							<Skeleton className='h-10 w-[250px] rounded-xl' />
						</CardHeader>
						<CardContent>
							<Skeleton className='h-[350px] w-full rounded-xl' />
						</CardContent>
					</Card>

					<Card className='lg:col-span-3 border-border/50 bg-background/50 shadow-sm'>
						<CardHeader className='pb-4'>
							<Skeleton className='h-5 w-40 mb-2' />
							<Skeleton className='h-3 w-32' />
						</CardHeader>
						<CardContent className='flex flex-col gap-6'>
							<Skeleton className='h-[200px] w-[200px] rounded-full mx-auto' />
							<div className='space-y-3'>
								{[1, 2].map(i => (
									<Skeleton key={i} className='h-14 w-full rounded-xl' />
								))}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		)
	}

	if (reportsError) {
		return (
			<div className='flex flex-1 flex-col items-center justify-center p-6 md:p-8 text-center min-h-[60vh]'>
				<div className='w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-5 ring-8 ring-red-50'>
					<AlertCircle className='w-8 h-8' />
				</div>
				<h2 className='text-xl md:text-2xl font-bold mb-2 text-foreground tracking-tight'>
					Xatolik yuz berdi
				</h2>
				<p className='text-sm md:text-base text-muted-foreground mb-8 max-w-sm leading-relaxed'>
					{reportsError.message ||
						"Ma'lumotlarni yuklashda kutilmagan xatolik yuz berdi."}
				</p>
				<Button
					onClick={() => window.location.reload()}
					size='lg'
					className='rounded-xl font-semibold px-8 shadow-lg shadow-primary/20 h-12 w-full sm:w-auto'
				>
					Qayta urinish
				</Button>
			</div>
		)
	}

	const summary = reportsData.summary || {
		totalAmount: 0,
		totalPaid: 0,
		overdueAmount: 0,
		overdueCount: 0,
		paidCount: 0,
		avgDuration: 0,
		activeCount: 0,
	}

	return (
		<motion.div
			initial='hidden'
			animate='show'
			variants={containerVariants}
			className='flex flex-1 flex-col gap-4 md:gap-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full'
		>
			<motion.div
				variants={itemVariants}
				className='flex items-center justify-between mb-2'
			>
				<div className='flex items-center gap-4'>
					<Button
						variant='outline'
						className='shadow-sm hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all h-10 w-10 p-0 rounded-xl'
						onClick={() => navigate('/debts')}
						disabled={isPending}
					>
						{isPending ? (
							<Loader2 className='h-5 w-5 animate-spin' />
						) : (
							<ArrowLeft className='h-5 w-5' />
						)}
					</Button>
					<div>
						<h1 className='text-2xl md:text-3xl font-extrabold tracking-tight text-foreground'>
							Qarzlar Hisoboti
						</h1>
						<p className='text-xs md:text-sm text-muted-foreground font-medium mt-1'>
							Barcha qarzlaringizning batafsil tahlili
						</p>
					</div>
				</div>
			</motion.div>

			<div className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
				<motion.div variants={itemVariants}>
					<Card className='relative overflow-hidden border-border/50 bg-background/80 backdrop-blur-sm h-full hover:shadow-md transition-shadow'>
						<CardHeader className='pb-2'>
							<CardTitle className='text-sm font-bold text-muted-foreground'>
								Jami Qarz
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-black text-foreground'>
								{formatMoney(summary.totalAmount)}
							</div>
							<div className='mt-2'>
								<Badge
									variant='secondary'
									className='bg-blue-50 text-blue-600 hover:bg-blue-50 border-none font-semibold'
								>
									<TrendingUp className='w-3.5 h-3.5 mr-1.5' /> Umumiy miqdor
								</Badge>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div variants={itemVariants}>
					<Card className='relative overflow-hidden border-border/50 bg-background/80 backdrop-blur-sm h-full hover:shadow-md transition-shadow'>
						<CardHeader className='pb-2'>
							<CardTitle className='text-sm font-bold text-muted-foreground'>
								To'langan (Success)
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-black text-green-600'>
								{formatMoney(summary.totalPaid)}
							</div>
							<div className='mt-2'>
								<Badge
									variant='secondary'
									className='bg-green-50 text-green-600 hover:bg-green-50 border-none font-semibold'
								>
									<CheckCircle2 className='w-3.5 h-3.5 mr-1.5' />{' '}
									{summary.totalAmount > 0
										? Math.round(
												(summary.totalPaid / summary.totalAmount) * 100,
											)
										: 0}
									% yopildi
								</Badge>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div variants={itemVariants}>
					<Card className='relative overflow-hidden border-border/50 bg-background/80 backdrop-blur-sm h-full hover:shadow-md transition-shadow'>
						<div className='absolute top-0 right-0 w-20 h-20 bg-red-500/5 rounded-bl-full -z-10'></div>
						<CardHeader className='pb-2'>
							<CardTitle className='text-sm font-bold text-muted-foreground'>
								Muddati o'tgan
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-black text-red-600'>
								{formatMoney(summary.overdueAmount)}
							</div>
							<div className='mt-2'>
								<Badge
									variant='secondary'
									className='bg-red-50 text-red-600 hover:bg-red-50 border-none font-semibold'
								>
									<AlertCircle className='w-3.5 h-3.5 mr-1.5' />{' '}
									{summary.overdueCount} ta qarz
								</Badge>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div variants={itemVariants}>
					<Card className='relative overflow-hidden border-border/50 bg-background/80 backdrop-blur-sm h-full hover:shadow-md transition-shadow'>
						<CardHeader className='pb-2'>
							<CardTitle className='text-sm font-bold text-muted-foreground'>
								O'rtacha muddat
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='flex items-baseline gap-1'>
								<span className='text-2xl font-black text-indigo-600'>
									{Math.round(summary.avgDuration || 0)}
								</span>
								<span className='text-sm font-bold text-indigo-600 mb-0.5'>
									kun
								</span>
							</div>
							<div className='mt-2'>
								<Badge
									variant='secondary'
									className='bg-indigo-50 text-indigo-600 hover:bg-indigo-50 border-none font-semibold'
								>
									<Calendar className='w-3.5 h-3.5 mr-1.5' /> Qaytarish vaqti
								</Badge>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</div>

			<div className='grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-7'>
				<motion.div variants={itemVariants} className='lg:col-span-4'>
					<Card className='h-full border-border/50 shadow-sm flex flex-col'>
						<CardHeader className='flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-4'>
							<div>
								<CardTitle className='text-base md:text-lg font-bold'>
									Olingan sanalar bo'yicha
								</CardTitle>
								<CardDescription className='text-xs font-medium'>
									Barcha qarzlar olingan vaqtlar dinamikasi
								</CardDescription>
							</div>
							<Tabs
								value={activePeriod}
								onValueChange={setActivePeriod}
								className='w-full md:w-auto'
							>
								<TabsList className='grid grid-cols-4 h-11 rounded-xl p-1 bg-muted/50 border border-border/50'>
									<TabsTrigger
										value='daily'
										className='rounded-lg text-[11px] font-bold'
									>
										Kun
									</TabsTrigger>
									<TabsTrigger
										value='weekly'
										className='rounded-lg text-[11px] font-bold'
									>
										Hafta
									</TabsTrigger>
									<TabsTrigger
										value='monthly'
										className='rounded-lg text-[11px] font-bold'
									>
										Oy
									</TabsTrigger>
									<TabsTrigger
										value='yearly'
										className='rounded-lg text-[11px] font-bold'
									>
										Yil
									</TabsTrigger>
								</TabsList>
							</Tabs>
						</CardHeader>
						<CardContent className='flex-1 p-2 md:p-6 md:pt-4'>
							<div className='h-[300px] md:h-[350px] w-full relative mt-2'>
								<AnimatePresence mode='wait'>
									<motion.div
										key={activePeriod}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -10 }}
										transition={{ duration: 0.3 }}
										className='h-full w-full'
									>
										<Bar data={chartData} options={chartOptions} />
									</motion.div>
								</AnimatePresence>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div variants={itemVariants} className='lg:col-span-3'>
					<Card className='h-full border-border/50 shadow-sm flex flex-col'>
						<CardHeader className='border-b border-border/50 pb-4'>
							<CardTitle className='text-base md:text-lg font-bold'>
								To'lov turlari
							</CardTitle>
							<CardDescription className='text-xs font-medium'>
								Naqd va Karta orqali olinganlar ulushi
							</CardDescription>
						</CardHeader>
						<CardContent className='flex-1 flex flex-col justify-center p-4 md:p-6'>
							<div className='h-[180px] md:h-[220px] w-full relative mb-8'>
								<Doughnut
									data={donutChartData}
									options={{
										responsive: true,
										maintainAspectRatio: false,
										cutout: '75%', // O'rtasidagi bo'shliq
										plugins: {
											legend: {
												position: 'bottom',
												labels: {
													padding: 20,
													usePointStyle: true,
													font: {
														size: 12,
														weight: '600',
														family: 'var(--font-geist-sans)',
													},
												},
											},
											tooltip: {
												callbacks: {
													label: context =>
														` ${context.label}: ${formatMoney(context.raw)}`,
												},
												titleFont: { family: 'var(--font-geist-sans)' },
												bodyFont: { family: 'var(--font-geist-sans)' },
											},
										},
									}}
								/>
							</div>
							<div className='space-y-3'>
								{reportsData.paymentMethods?.map(m => (
									<div
										key={m._id}
										className='flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors'
									>
										<div className='flex items-center gap-3'>
											<div
												className={cn(
													'h-9 w-9 rounded-xl flex items-center justify-center shadow-sm',
													m._id === 'card'
														? 'bg-blue-500 text-white'
														: 'bg-emerald-500 text-white',
												)}
											>
												{m._id === 'card' ? (
													<CreditCard className='h-4 w-4' />
												) : (
													<Banknote className='h-4 w-4' />
												)}
											</div>
											<div>
												<p className='text-sm font-bold capitalize text-foreground'>
													{m._id === 'card' ? 'Karta orqali' : 'Naqd pulda'}
												</p>
												<p className='text-[11px] text-muted-foreground font-medium mt-0.5'>
													{m.count} ta tranzaksiya
												</p>
											</div>
										</div>
										<div className='text-right'>
											<p className='text-sm font-black text-foreground'>
												{formatMoney(m.amount)}
											</p>
											<p className='text-[11px] font-bold text-muted-foreground mt-0.5'>
												{summary.totalAmount > 0
													? Math.round((m.amount / summary.totalAmount) * 100)
													: 0}
												% umumiy
											</p>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</div>

			<motion.div variants={itemVariants}>
				<Card className='border-border/50 shadow-sm overflow-hidden mb-6'>
					<CardHeader className='bg-primary/5 border-b border-primary/10 py-4'>
						<CardTitle className='text-base md:text-lg font-bold flex items-center gap-2 text-primary'>
							<TrendingUp className='h-5 w-5' />
							Batafsil tahlil va Ko'rsatkichlar
						</CardTitle>
					</CardHeader>
					<CardContent className='p-4 md:p-6'>
						<div className='grid gap-4 md:gap-6 md:grid-cols-3'>
							<div className='p-5 rounded-2xl bg-muted/30 border border-border/50 hover:border-primary/20 transition-colors'>
								<h4 className='text-sm font-bold text-foreground mb-4 flex items-center gap-2'>
									<div className='p-1.5 bg-green-100 text-green-600 rounded-md'>
										<CheckCircle2 className='h-4 w-4' />
									</div>
									To'lov intizomi
								</h4>
								<div className='space-y-4'>
									<div>
										<div className='flex justify-between text-xs font-bold mb-2'>
											<span className='text-muted-foreground'>
												Yopilgan qarzlar
											</span>
											<span className='text-foreground'>
												{summary.activeCount + summary.paidCount > 0
													? Math.round(
															(summary.paidCount /
																(summary.activeCount + summary.paidCount)) *
																100,
														)
													: 0}
												%
											</span>
										</div>
										<div className='h-2.5 w-full bg-muted rounded-full overflow-hidden'>
											<motion.div
												initial={{ width: 0 }}
												animate={{
													width: `${summary.activeCount + summary.paidCount > 0 ? (summary.paidCount / (summary.activeCount + summary.paidCount)) * 100 : 0}%`,
												}}
												transition={{ duration: 1, ease: 'easeOut' }}
												className='h-full bg-green-500 rounded-full'
											/>
										</div>
									</div>
									<p className='text-xs text-muted-foreground leading-relaxed font-medium'>
										Sizning umumiy qarzlaringizdan qariyb{' '}
										<strong>
											{summary.activeCount + summary.paidCount > 0
												? Math.round(
														(summary.paidCount /
															(summary.activeCount + summary.paidCount)) *
															100,
													)
												: 0}
											%
										</strong>{' '}
										qismi muvaffaqiyatli yopilgan. Bu yaxshi ko'rsatkich.
									</p>
								</div>
							</div>

							<div className='p-5 rounded-2xl bg-muted/30 border border-border/50 hover:border-primary/20 transition-colors'>
								<h4 className='text-sm font-bold text-foreground mb-4 flex items-center gap-2'>
									<div className='p-1.5 bg-blue-100 text-blue-600 rounded-md'>
										<Calendar className='h-4 w-4' />
									</div>
									Qaytarish vaqti
								</h4>
								<div className='space-y-2'>
									<div className='flex items-end gap-1.5 mb-2'>
										<span className='text-3xl font-black text-foreground'>
											{Math.round(summary.avgDuration || 0)}
										</span>
										<span className='text-sm font-bold mb-1 text-muted-foreground'>
											kun
										</span>
									</div>
									<p className='text-xs text-muted-foreground leading-relaxed font-medium'>
										Olingan qarzlarni qaytarish uchun o'rtacha{' '}
										<strong>{Math.round(summary.avgDuration || 0)} kun</strong>{' '}
										sarflanyapti.
									</p>
								</div>
							</div>

							<div className='p-5 rounded-2xl bg-red-50/50 border border-red-100/50 hover:border-red-200 transition-colors'>
								<h4 className='text-sm font-bold text-red-700 mb-4 flex items-center gap-2'>
									<div className='p-1.5 bg-red-100 text-red-600 rounded-md'>
										<AlertCircle className='h-4 w-4' />
									</div>
									Xavf tahlili
								</h4>
								<div className='space-y-2'>
									<div className='flex items-end gap-1.5 mb-2'>
										<span className='text-3xl font-black text-red-600'>
											{summary.overdueCount}
										</span>
										<span className='text-sm font-bold mb-1 text-red-600/80'>
											ta muammoli qarz
										</span>
									</div>
									<p className='text-xs text-red-700/80 leading-relaxed font-medium'>
										Hozirda umumiy qiymati{' '}
										<strong>{formatMoney(summary.overdueAmount)}</strong>{' '}
										bo'lgan qarzlar muddati o'tgan. Tanishlaringiz bilan
										bog'laning.
									</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</motion.div>
		</motion.div>
	)
}
