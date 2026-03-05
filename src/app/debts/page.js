'use client'

import { useUser } from '@/hooks/useUser'
import { debtApi } from '@/lib/api'
import { CONTAINER_VARIANTS, ITEM_VARIANTS } from '@/lib/constants'
import { calculateDaysLeft, formatMoney } from '@/lib/formatters'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import useSWR from 'swr'

import EmptyState from '@/components/EmptyState'
import ErrorState from '@/components/ErrorState'
import PageHeader from '@/components/PageHeader'
import StatsCard from '@/components/StatsCard'
import StatusBadge from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import {
	AlertCircle,
	Banknote,
	CalendarClock,
	CreditCard,
	Edit,
	Eye,
	Loader2,
	MoreHorizontal,
	Plus,
	Search,
	Wallet,
} from 'lucide-react'

export default function DebtsPage() {
	const router = useRouter()
	const { user, isLoading: isUserLoading, isError } = useUser()
	const [isPending, startTransition] = useTransition()
	const [searchQuery, setSearchQuery] = useState('')

	const {
		data: debtsData,
		error: debtsError,
		isLoading: isDebtsLoading,
	} = useSWR(user ? '/debts' : null, () => debtApi.getAll(), {
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

	if (isUserLoading || isDebtsLoading || !user) {
		return (
			<div className='min-h-screen bg-muted/20 pb-24'>
				<main className='flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8 max-w-7xl mx-auto'>
					<div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
						<div className='flex items-center gap-4'>
							<Skeleton className='h-10 w-10 rounded-md' />
							<div>
								<Skeleton className='h-8 w-40 mb-2' />
								<Skeleton className='h-4 w-64' />
							</div>
						</div>
						<Skeleton className='h-10 w-full md:w-48 rounded-md' />
					</div>
					<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
						{[1, 2, 3, 4].map(i => (
							<Card key={i} className='border-border/50 bg-background/50'>
								<CardHeader className='flex flex-row items-center justify-between pb-2'>
									<Skeleton className='h-4 w-24' />
									<Skeleton className='h-8 w-8 rounded-full' />
								</CardHeader>
								<CardContent>
									<Skeleton className='h-8 w-32' />
								</CardContent>
							</Card>
						))}
					</div>
					<div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2'>
						<Skeleton className='h-11 w-full md:w-[400px] rounded-xl' />
						<Skeleton className='h-10 w-full md:w-80 rounded-md' />
					</div>
					<Card className='border-border/50 shadow-sm'>
						<CardHeader className='pb-0'>
							<Skeleton className='h-10 w-full mb-4' />
						</CardHeader>
						<CardContent>
							<div className='space-y-4'>
								{[1, 2, 3, 4, 5].map(i => (
									<Skeleton key={i} className='h-14 w-full' />
								))}
							</div>
						</CardContent>
					</Card>
				</main>
			</div>
		)
	}

	if (debtsError) {
		return (
			<ErrorState
				message={
					debtsError.message || 'Qarzlarni yuklashda muammo yuzaga keldi.'
				}
			/>
		)
	}

	const safeDebts = debtsData || []
	const filteredDebts = safeDebts.filter(debt =>
		debt.creditorName?.toLowerCase().includes(searchQuery.toLowerCase()),
	)
	const activeDebts = filteredDebts.filter(debt => debt.status !== 'paid')
	const paidDebts = filteredDebts.filter(debt => debt.status === 'paid')

	const stats = {
		totalActiveAmount: activeDebts.reduce((sum, d) => sum + d.amount, 0),
		totalPaidOfActive: activeDebts.reduce((sum, d) => sum + d.paidAmount, 0),
		totalRemaining: activeDebts.reduce(
			(sum, d) => sum + (d.amount - d.paidAmount),
			0,
		),
		totalFullyPaid: paidDebts.reduce((sum, d) => sum + d.amount, 0),
	}

	const renderTableRows = debtsArray => {
		if (debtsArray.length === 0) {
			return (
				<TableRow>
					<TableCell colSpan={8} className='p-0'>
						<EmptyState
							icon={Wallet}
							title='Hozircha qarzlar mavjud emas'
							description="Yangi qarz qo'shish uchun yuqoridagi tugmani bosing."
						/>
					</TableCell>
				</TableRow>
			)
		}

		return debtsArray.map((debt, index) => {
			const daysLeft = calculateDaysLeft(debt.dueDate)
			const isOverdue = daysLeft < 0
			const isClose = daysLeft >= 0 && daysLeft <= 3

			return (
				<TableRow
					key={debt._id || debt.id}
					className='group transition-colors hover:bg-muted/40'
				>
					<TableCell className='text-muted-foreground font-medium pl-4'>
						{index + 1}
					</TableCell>
					<TableCell>
						<div className='flex flex-col'>
							<span className='font-bold text-foreground capitalize'>
								{debt.creditorName}
							</span>
							<span className='text-xs text-muted-foreground flex items-center gap-1 mt-1 font-medium'>
								{debt.paymentMethod === 'card' ? (
									<CreditCard className='h-3.5 w-3.5' />
								) : (
									<Banknote className='h-3.5 w-3.5' />
								)}
								{debt.paymentMethod === 'card' ? 'Karta' : 'Naqd'}
								{debt.paymentMethod === 'card' && debt.cardNumber && (
									<span className='ml-1 font-mono text-xs bg-muted/60 px-1.5 py-0.5 rounded-sm'>
										*{debt.cardNumber.slice(-4)}
									</span>
								)}
							</span>
						</div>
					</TableCell>
					<TableCell className='font-bold text-foreground'>
						{formatMoney(debt.amount)}
					</TableCell>
					<TableCell className='text-green-600 font-semibold'>
						{formatMoney(debt.paidAmount)}
					</TableCell>
					<TableCell className='font-extrabold text-destructive'>
						{formatMoney(debt.amount - debt.paidAmount)}
					</TableCell>
					<TableCell>
						<div className='flex flex-col'>
							<span className='text-sm font-semibold'>
								{new Date(debt.dueDate).toLocaleDateString('ru-RU')}
							</span>
							{debt.status !== 'paid' && (
								<span
									className={`text-xs font-semibold flex items-center gap-1 mt-1 ${isOverdue ? 'text-destructive' : isClose ? 'text-orange-500' : 'text-green-600'}`}
								>
									{isOverdue && <AlertCircle className='h-3 w-3' />}
									{isOverdue
										? `${Math.abs(daysLeft)} kun o'tdi`
										: `${daysLeft} kun qoldi`}
								</span>
							)}
						</div>
					</TableCell>
					<TableCell>
						<StatusBadge status={debt.status} type='debt' />
					</TableCell>
					<TableCell className='text-right pr-4'>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant='ghost'
									className='h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-colors'
								>
									<span className='sr-only'>Menyuni ochish</span>
									<MoreHorizontal className='h-4 w-4' />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								align='end'
								className='w-48 rounded-xl shadow-lg border-border/50'
							>
								<DropdownMenuLabel className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
									Amallar
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={() => navigate(`/debts/${debt._id || debt.id}`)}
									className='cursor-pointer py-2.5 font-medium hover:bg-primary/5 hover:text-primary transition-colors rounded-md mx-1'
								>
									<Eye className='mr-2 h-4 w-4 text-blue-500' /> Batafsil
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => navigate(`/debts/${debt._id || debt.id}/edit`)}
									className='cursor-pointer py-2.5 font-medium transition-colors rounded-md mx-1'
								>
									<Edit className='mr-2 h-4 w-4 text-muted-foreground' />{' '}
									Tahrirlash
								</DropdownMenuItem>
								{debt.status !== 'paid' && (
									<>
										<DropdownMenuSeparator className='my-1' />
										<DropdownMenuItem
											className='cursor-pointer py-2.5 font-bold text-green-600 focus:bg-green-50 focus:text-green-700 dark:focus:bg-green-950/30 dark:focus:text-green-400 transition-colors rounded-md mx-1'
											onClick={() =>
												navigate(`/debts/${debt._id || debt.id}/pay`)
											}
										>
											<Banknote className='mr-2 h-4 w-4' /> To'lov qilish
										</DropdownMenuItem>
									</>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					</TableCell>
				</TableRow>
			)
		})
	}

	return (
		<div className='min-h-screen bg-muted/20 pb-24'>
			<motion.main
				initial='hidden'
				animate='show'
				variants={CONTAINER_VARIANTS}
				className='flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8 max-w-7xl mx-auto'
			>
				<motion.div variants={ITEM_VARIANTS}>
					<PageHeader
						title='Qarzlarim'
						subtitle="Boshqalarga berishim kerak bo'lgan pullar va tarix."
						backHref='/'
					>
						<Button
							className='w-full md:w-auto shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all gap-2 h-11 px-6'
							onClick={() => navigate('/debts/add')}
							disabled={isPending}
						>
							{isPending ? (
								<Loader2 className='h-5 w-5 animate-spin' />
							) : (
								<Plus className='h-5 w-5' />
							)}
							Yangi qarz
						</Button>
					</PageHeader>
				</motion.div>

				<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
					<StatsCard
						title='Jami Qarz (Faol)'
						value={formatMoney(stats.totalActiveAmount)}
						icon={Banknote}
						iconBg='bg-muted'
						iconColor='text-muted-foreground'
					/>
					<StatsCard
						title="Shundan to'landi"
						value={formatMoney(stats.totalPaidOfActive)}
						valueColor='text-green-600'
						icon={Wallet}
						iconBg='bg-green-100/80'
						iconColor='text-green-600'
					/>
					<StatsCard
						title='Qoldiq (Berdorlik)'
						value={formatMoney(stats.totalRemaining)}
						valueColor='text-red-600'
						icon={AlertCircle}
						iconBg='bg-red-100/80'
						iconColor='text-red-600'
						className='relative overflow-hidden'
					/>
					<StatsCard
						title="To'lab yopilganlar"
						value={formatMoney(stats.totalFullyPaid)}
						valueColor='text-primary'
						icon={CalendarClock}
						iconBg='bg-primary/10'
						iconColor='text-primary'
						className='bg-primary/5 border-primary/10'
					/>
				</div>

				<motion.div variants={ITEM_VARIANTS}>
					<Tabs defaultValue='active' className='w-full'>
						<div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6'>
							<TabsList className='grid w-full md:w-[450px] grid-cols-2 h-12 rounded-xl p-1 bg-muted/50 border border-border/50'>
								<TabsTrigger
									value='active'
									className='rounded-lg font-bold transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm'
								>
									Faol qarzlar ({activeDebts.length})
								</TabsTrigger>
								<TabsTrigger
									value='paid'
									className='rounded-lg font-bold transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm'
								>
									Tarix ({paidDebts.length})
								</TabsTrigger>
							</TabsList>

							<div className='relative w-full md:w-80 group'>
								<Search className='absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors' />
								<Input
									type='search'
									placeholder="Kreditor (Kimga) bo'yicha qidirish..."
									className='pl-10 h-12 bg-background border-border/50 shadow-sm transition-all focus-visible:ring-primary/50 focus-visible:border-primary rounded-xl'
									value={searchQuery}
									onChange={e => setSearchQuery(e.target.value)}
								/>
							</div>
						</div>

						<TabsContent value='active' className='mt-0 outline-none'>
							<CardContent className='border-border/50 shadow-sm overflow-hidden'>
								<div className='overflow-x-auto'>
									<Table>
										<TableHeader className='bg-muted/30'>
											<TableRow className='hover:bg-transparent border-b-border/50'>
												<TableHead className='w-[50px] font-bold pl-4'>
													#
												</TableHead>
												<TableHead className='font-bold text-foreground'>
													Kreditor (Kimga)
												</TableHead>
												<TableHead className='font-bold text-foreground'>
													Jami qarz
												</TableHead>
												<TableHead className='font-bold text-foreground'>
													To'landi
												</TableHead>
												<TableHead className='font-bold text-red-600'>
													Qoldiq
												</TableHead>
												<TableHead className='font-bold text-foreground'>
													Muddat
												</TableHead>
												<TableHead className='font-bold text-foreground'>
													Holati
												</TableHead>
												<TableHead className='text-right font-bold pr-4'>
													Amallar
												</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>{renderTableRows(activeDebts)}</TableBody>
									</Table>
								</div>
							</CardContent>
						</TabsContent>

						<TabsContent value='paid' className='mt-0 outline-none'>
							<Card className='border-border/50 shadow-sm overflow-hidden opacity-95'>
								<div className='overflow-x-auto'>
									<Table>
										<TableHeader className='bg-muted/20'>
											<TableRow className='hover:bg-transparent border-b-border/50'>
												<TableHead className='w-[50px] font-bold pl-4'>
													#
												</TableHead>
												<TableHead className='font-bold text-foreground'>
													Kreditor (Kimga)
												</TableHead>
												<TableHead className='font-bold text-foreground'>
													Jami qarz
												</TableHead>
												<TableHead className='font-bold text-foreground'>
													To'landi
												</TableHead>
												<TableHead className='font-bold text-foreground'>
													Qoldiq
												</TableHead>
												<TableHead className='font-bold text-foreground'>
													Muddat
												</TableHead>
												<TableHead className='font-bold text-foreground'>
													Holati
												</TableHead>
												<TableHead className='text-right font-bold pr-4'>
													Amallar
												</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>{renderTableRows(paidDebts)}</TableBody>
									</Table>
								</div>
							</Card>
						</TabsContent>
					</Tabs>
				</motion.div>
			</motion.main>
		</div>
	)
}
