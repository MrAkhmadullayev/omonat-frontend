'use client'

import { differenceInDays, format } from 'date-fns'
import { uz } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import useSWR from 'swr'

import { useUser } from '@/hooks/useUser'
import { receivableApi } from '@/lib/api'
import { formatMoney } from '@/lib/formatters'

import EmptyState from '@/components/EmptyState'
import ErrorState from '@/components/ErrorState'
import LoadingState from '@/components/LoadingState'
import PageHeader from '@/components/PageHeader'
import StatsCard from '@/components/StatsCard'
import StatusBadge from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
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
	ArrowDownToLine,
	Banknote,
	CalendarClock,
	CreditCard,
	Edit,
	Eye,
	MoreHorizontal,
	Plus,
	Search,
	TrendingUp,
	Wallet,
} from 'lucide-react'

export default function ReceivablesPage() {
	const router = useRouter()
	const { user, isLoading: isUserLoading, isError } = useUser()
	const [searchQuery, setSearchQuery] = useState('')

	const {
		data: receivables = [],
		isLoading: isReceivablesLoading,
		error: receivablesError,
	} = useSWR(user ? '/receivables' : null, () => receivableApi.getAll())

	useEffect(() => {
		if (isError) router.push('/authentication/login')
	}, [isError, router])

	if (isError) return null

	if (isUserLoading || isReceivablesLoading || !user) {
		return <LoadingState message="Haqdorlik ma'lumotlari yuklanmoqda..." />
	}

	if (receivablesError) {
		return <ErrorState message={receivablesError.message} />
	}

	const filteredReceivables = receivables.filter(item =>
		item.debtor?.toLowerCase().includes(searchQuery.toLowerCase()),
	)
	const activeReceivables = filteredReceivables.filter(
		item => item.status !== 'paid',
	)
	const paidReceivables = filteredReceivables.filter(
		item => item.status === 'paid',
	)

	const stats = {
		totalExpected: activeReceivables.reduce((sum, d) => sum + d.amount, 0),
		totalReceivedOfActive: activeReceivables.reduce(
			(sum, d) => sum + d.receivedAmount,
			0,
		),
		totalRemaining: activeReceivables.reduce(
			(sum, d) => sum + (d.amount - d.receivedAmount),
			0,
		),
		totalFullyReceived: paidReceivables.reduce((sum, d) => sum + d.amount, 0),
	}

	const renderTableRows = itemsArray => {
		if (itemsArray.length === 0) {
			return (
				<TableRow>
					<TableCell colSpan={8} className='p-0'>
						<EmptyState icon={Wallet} title="Hozircha ma'lumot topilmadi" />
					</TableCell>
				</TableRow>
			)
		}

		return itemsArray.map((item, index) => {
			const daysLeft = differenceInDays(new Date(item.dueDate), new Date())
			const isOverdue = daysLeft < 0
			const isClose = daysLeft >= 0 && daysLeft <= 3

			return (
				<TableRow
					key={item._id || item.id}
					className='group transition-colors hover:bg-muted/40'
				>
					<TableCell className='text-muted-foreground font-medium pl-4'>
						{index + 1}
					</TableCell>
					<TableCell>
						<div className='flex flex-col'>
							<span className='font-bold text-foreground capitalize'>
								{item.debtor}
							</span>
							<span className='text-xs text-muted-foreground flex items-center gap-1 mt-1 font-medium'>
								{item.paymentMethod === 'card' ? (
									<CreditCard className='h-3 w-3' />
								) : (
									<Banknote className='h-3 w-3' />
								)}
								{item.paymentMethod === 'card' ? 'Karta orqali' : 'Naqd pul'}
								{item.paymentMethod === 'card' && item.cardNumber && (
									<span className='ml-1 font-mono text-xs bg-muted/50 px-1 rounded-sm'>
										*{item.cardNumber.slice(-4)}
									</span>
								)}
							</span>
						</div>
					</TableCell>
					<TableCell className='font-medium'>
						{formatMoney(item.amount, item.currency)}
					</TableCell>
					<TableCell className='text-green-600 font-medium'>
						{formatMoney(item.receivedAmount, item.currency)}
					</TableCell>
					<TableCell className='font-bold text-foreground'>
						{formatMoney(item.amount - item.receivedAmount, item.currency)}
					</TableCell>
					<TableCell>
						<div className='flex flex-col'>
							<span className='text-sm font-medium'>
								{format(new Date(item.dueDate), 'dd MMM, yyyy', { locale: uz })}
							</span>
							{item.status !== 'paid' && (
								<span
									className={`text-xs font-bold flex items-center gap-1 mt-1 ${isOverdue ? 'text-destructive' : isClose ? 'text-orange-500' : 'text-green-600'}`}
								>
									{isOverdue && <AlertCircle className='h-3 w-3' />}
									{isOverdue
										? `${Math.abs(daysLeft)} kun o'tib ketdi`
										: `${daysLeft} kun qoldi`}
								</span>
							)}
						</div>
					</TableCell>
					<TableCell>
						<StatusBadge status={item.status} type='receivable' />
					</TableCell>
					<TableCell className='text-right pr-4'>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant='ghost' className='h-8 w-8 p-0 hover:bg-muted'>
									<span className='sr-only'>Menyuni ochish</span>
									<MoreHorizontal className='h-4 w-4' />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align='end' className='w-52 rounded-xl'>
								<DropdownMenuLabel className='font-bold'>
									Amallar
								</DropdownMenuLabel>
								<DropdownMenuItem
									onClick={() =>
										router.push(`/receivables/${item._id || item.id}`)
									}
									className='cursor-pointer py-2 font-medium'
								>
									<Eye className='mr-2 h-4 w-4 text-muted-foreground' />{' '}
									Batafsil ko'rish
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() =>
										router.push(`/receivables/${item._id || item.id}/edit`)
									}
									className='cursor-pointer py-2 font-medium'
								>
									<Edit className='mr-2 h-4 w-4 text-muted-foreground' />{' '}
									Tahrirlash
								</DropdownMenuItem>
								{item.status !== 'paid' && (
									<>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											onClick={() =>
												router.push(
													`/receivables/${item._id || item.id}/receive`,
												)
											}
											className='cursor-pointer py-2 text-green-600 focus:bg-green-50 focus:text-green-600 dark:focus:bg-green-950/30 dark:focus:text-green-400 font-bold'
										>
											<ArrowDownToLine className='mr-2 h-4 w-4' /> To'lov qabul
											qilish
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

	const renderTable = data => (
		<Card className='border-border/50 shadow-sm overflow-hidden bg-background/60 backdrop-blur-sm p-0'>
			<CardContent className='p-0'>
				<div className='rounded-xl border border-border/50 overflow-x-auto bg-background'>
					<Table>
						<TableHeader className='bg-muted/30'>
							<TableRow className='hover:bg-transparent'>
								<TableHead className='w-[50px] font-bold pl-4 text-xs uppercase tracking-wider'>
									#
								</TableHead>
								<TableHead className='font-bold text-xs uppercase tracking-wider'>
									Kimdan
								</TableHead>
								<TableHead className='font-bold text-xs uppercase tracking-wider'>
									Jami haq
								</TableHead>
								<TableHead className='font-bold text-xs uppercase tracking-wider'>
									Olindi
								</TableHead>
								<TableHead className='font-bold text-xs uppercase tracking-wider'>
									Qoldiq
								</TableHead>
								<TableHead className='font-bold text-xs uppercase tracking-wider'>
									Muddat
								</TableHead>
								<TableHead className='font-bold text-xs uppercase tracking-wider'>
									Holati
								</TableHead>
								<TableHead className='text-right font-bold pr-4 text-xs uppercase tracking-wider'>
									Amallar
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>{renderTableRows(data)}</TableBody>
					</Table>
				</div>
			</CardContent>
		</Card>
	)

	return (
		<div className='min-h-screen bg-muted/20 flex flex-col font-sans pb-24'>
			<main className='flex-1 w-full max-w-7xl mx-auto p-4 md:p-8'>
				<div className='mb-8'>
					<PageHeader
						title='Haqdorligim'
						subtitle="Boshqalardan olishim kerak bo'lgan pullar."
						backHref='/'
					>
						<Button
							variant='outline'
							className='flex-1 md:flex-none rounded-xl gap-2 h-11 transition-all font-bold hover:bg-muted'
							onClick={() => router.push('/receivables/reports')}
						>
							<TrendingUp className='h-4 w-4 text-primary' /> Hisobotlar
						</Button>
						<Button
							className='flex-1 md:flex-none shadow-md rounded-xl gap-2 h-11 transition-all font-bold'
							onClick={() => router.push('/receivables/add')}
						>
							<Plus className='h-5 w-5' /> Yangi
						</Button>
					</PageHeader>
				</div>

				<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8'>
					<StatsCard
						title='Kutilayotgan jami pul'
						value={formatMoney(stats.totalExpected)}
						icon={Banknote}
						animated={false}
					/>
					<StatsCard
						title='Shundan olindi'
						value={formatMoney(stats.totalReceivedOfActive)}
						valueColor='text-green-600'
						icon={Wallet}
						iconBg='bg-green-50 dark:bg-green-900/20'
						iconColor='text-green-600'
						animated={false}
					/>
					<StatsCard
						title='Qoldiq (Olishim kerak)'
						value={formatMoney(stats.totalRemaining)}
						icon={ArrowDownToLine}
						animated={false}
					/>
					<StatsCard
						title="To'liq olinganlar"
						value={formatMoney(stats.totalFullyReceived)}
						icon={CalendarClock}
						className='bg-muted/30 border-dashed'
						animated={false}
					/>
				</div>

				<Tabs defaultValue='active' className='w-full'>
					<div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6'>
						<TabsList className='grid w-full md:w-[450px] grid-cols-2 h-12 rounded-xl p-1 bg-muted/50 border border-border/50'>
							<TabsTrigger
								value='active'
								className='rounded-lg font-bold text-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all'
							>
								Kutilayotgan haqlar ({activeReceivables.length})
							</TabsTrigger>
							<TabsTrigger
								value='paid'
								className='rounded-lg font-bold text-sm data-[state=active]:bg-background data-[state=active]:text-green-600 data-[state=active]:shadow-sm transition-all'
							>
								To'liq olingan ({paidReceivables.length})
							</TabsTrigger>
						</TabsList>

						<div className='relative w-full md:w-80'>
							<Search className='absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
							<Input
								type='search'
								placeholder="Ism bo'yicha qidirish..."
								className='pl-11 h-10 rounded-xl bg-background border-border/50 shadow-sm transition-all hover:bg-accent/10 focus-visible:bg-background focus-visible:ring-primary font-medium'
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
							/>
						</div>
					</div>

					<TabsContent
						value='active'
						className='mt-0 focus-visible:outline-none focus-visible:ring-0'
					>
						{renderTable(activeReceivables)}
					</TabsContent>

					<TabsContent
						value='paid'
						className='mt-0 focus-visible:outline-none focus-visible:ring-0'
					>
						{renderTable(paidReceivables)}
					</TabsContent>
				</Tabs>
			</main>
		</div>
	)
}
