'use client'

import { useUser } from '@/hooks/useUser'
import { debtApi } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import Navbar from '@/components/Navbar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
	ArrowLeft,
	Banknote,
	CalendarClock,
	CreditCard,
	Edit,
	Eye,
	LoaderIcon,
	MoreHorizontal,
	Plus,
	Search,
	Wallet,
} from 'lucide-react'

const formatMoney = amount => {
	return new Intl.NumberFormat('uz-UZ', {
		style: 'currency',
		currency: 'UZS',
		maximumFractionDigits: 0,
	}).format(amount || 0)
}

export default function DebtsPage() {
	const router = useRouter()
	const { user, isLoading, isError } = useUser()

	const [searchQuery, setSearchQuery] = useState('')
	const [debts, setDebts] = useState([])
	const [isFetching, setIsFetching] = useState(true)

	useEffect(() => {
		if (user) fetchDebts()
	}, [user])

	const fetchDebts = async () => {
		try {
			setIsFetching(true)
			const data = await debtApi.getAll()
			setDebts(data)
		} catch (error) {
			console.error('Qarzlarni olishda xatolik:', error)
		} finally {
			setIsFetching(false)
		}
	}

	useEffect(() => {
		if (isError) router.push('/authentication/login')
	}, [isError, router])

	if (isError) return null

	if (isLoading || !user || isFetching) {
		return (
			<div className='flex h-screen flex-col items-center justify-center bg-muted/20 gap-4'>
				<LoaderIcon className='size-10 animate-spin text-primary' />
				<p className='text-lg font-medium text-muted-foreground animate-pulse'>
					Ma'lumotlar yuklanmoqda...
				</p>
			</div>
		)
	}

	const calculateDaysLeft = dueDateStr => {
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		const due = new Date(dueDateStr)
		return Math.ceil((due - today) / (1000 * 60 * 60 * 24))
	}

	const getStatusBadge = status => {
		switch (status) {
			case 'paid':
				return (
					<Badge className='bg-green-500 hover:bg-green-600'>To'langan</Badge>
				)
			case 'partial':
				return (
					<Badge className='bg-orange-500 hover:bg-orange-600'>Qisman</Badge>
				)
			case 'pending':
				return <Badge variant='destructive'>To'lanmagan</Badge>
			default:
				return <Badge variant='secondary'>Noma'lum</Badge>
		}
	}

	const filteredDebts = debts.filter(debt =>
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
					<TableCell
						colSpan={8}
						className='text-center py-12 text-muted-foreground bg-muted/10'
					>
						Hozircha ma'lumot topilmadi
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
									<CreditCard className='h-3 w-3' />
								) : (
									<Banknote className='h-3 w-3' />
								)}
								{debt.paymentMethod === 'card' ? 'Karta' : 'Naqd'}
								{debt.paymentMethod === 'card' && debt.cardNumber && (
									<span className='ml-1 font-mono text-[10px] bg-muted/50 px-1 rounded-sm'>
										*{debt.cardNumber.slice(-4)}
									</span>
								)}
							</span>
						</div>
					</TableCell>
					<TableCell className='font-medium'>
						{formatMoney(debt.amount)}
					</TableCell>
					<TableCell className='text-green-600 font-medium'>
						{formatMoney(debt.paidAmount)}
					</TableCell>
					<TableCell className='font-bold text-red-600'>
						{formatMoney(debt.amount - debt.paidAmount)}
					</TableCell>
					<TableCell>
						<div className='flex flex-col'>
							<span className='text-sm font-medium'>
								{new Date(debt.dueDate).toLocaleDateString('ru-RU')}
							</span>
							{debt.status !== 'paid' && (
								<span
									className={`text-xs font-bold flex items-center gap-1 mt-1 ${isOverdue ? 'text-red-600' : isClose ? 'text-orange-500' : 'text-green-600'}`}
								>
									{isOverdue && <AlertCircle className='h-3 w-3' />}
									{isOverdue
										? `${Math.abs(daysLeft)} kun o'tib ketdi`
										: `${daysLeft} kun qoldi`}
								</span>
							)}
						</div>
					</TableCell>
					<TableCell>{getStatusBadge(debt.status)}</TableCell>
					<TableCell className='text-right pr-4'>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant='ghost' className='h-8 w-8 p-0 hover:bg-muted'>
									<span className='sr-only'>Menyuni ochish</span>
									<MoreHorizontal className='h-4 w-4' />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align='end' className='w-48 rounded-xl'>
								<DropdownMenuLabel>Amallar</DropdownMenuLabel>
								<DropdownMenuItem
									onClick={() => router.push(`/debts/${debt._id || debt.id}`)}
									className='cursor-pointer py-2'
								>
									<Eye className='mr-2 h-4 w-4 text-blue-500' /> Batafsil
									ko'rish
								</DropdownMenuItem>

								<DropdownMenuItem
									onClick={() =>
										router.push(`/debts/${debt._id || debt.id}/edit`)
									}
									className='cursor-pointer py-2 font-medium'
								>
									<Edit className='mr-2 h-4 w-4 text-muted-foreground' />{' '}
									Tahrirlash
								</DropdownMenuItem>
								{debt.status !== 'paid' && (
									<>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											className='cursor-pointer py-2 text-green-600 focus:bg-green-50 focus:text-green-600'
											onClick={() =>
												router.push(`/debts/${debt._id || debt.id}/pay`)
											}
										>
											<Banknote className='mr-2 h-4 w-4' /> Qarzni to'lash
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
		<div className='min-h-screen bg-muted/20'>
			<Navbar user={user} />

			<main className='flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8 max-w-7xl mx-auto'>
				<div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
					<div className='flex items-center gap-4'>
						<Button
							variant='outline'
							size='icon'
							className='rounded-xl shadow-sm hover:bg-muted'
							onClick={() => router.push('/')}
						>
							<ArrowLeft className='h-5 w-5' />
						</Button>
						<div>
							<h1 className='text-2xl font-bold tracking-tight text-foreground'>
								Qarzlarim
							</h1>
							<p className='text-sm text-muted-foreground font-medium mt-1'>
								Boshqalarga berishim kerak bo'lgan pullar va tarix.
							</p>
						</div>
					</div>
					<Button
						className='w-full md:w-auto rounded-xl shadow-md gap-2 h-11'
						onClick={() => router.push('/debts/add')}
					>
						<Plus className='h-5 w-5' /> Yangi qarz qo'shish
					</Button>
				</div>

				<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
					<Card className='hover:shadow-md transition-all duration-300 border-border/50 bg-background/50 backdrop-blur-sm'>
						<CardHeader className='flex flex-row items-center justify-between pb-2'>
							<CardTitle className='text-sm font-medium text-muted-foreground'>
								Jami Qarz (Faol)
							</CardTitle>
							<div className='p-2 bg-muted rounded-full'>
								<Banknote className='h-4 w-4 text-muted-foreground' />
							</div>
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>
								{formatMoney(stats.totalActiveAmount)}
							</div>
						</CardContent>
					</Card>

					<Card className='hover:shadow-md transition-all duration-300 border-border/50 bg-background/50 backdrop-blur-sm'>
						<CardHeader className='flex flex-row items-center justify-between pb-2'>
							<CardTitle className='text-sm font-medium text-muted-foreground'>
								Shundan to'landi
							</CardTitle>
							<div className='p-2 bg-green-100 rounded-full'>
								<Wallet className='h-4 w-4 text-green-600' />
							</div>
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold text-green-600'>
								{formatMoney(stats.totalPaidOfActive)}
							</div>
						</CardContent>
					</Card>

					<Card className='hover:shadow-md transition-all duration-300 border-border/50 bg-background/50 backdrop-blur-sm'>
						<CardHeader className='flex flex-row items-center justify-between pb-2'>
							<CardTitle className='text-sm font-medium text-muted-foreground'>
								Qoldiq (Berishim kerak)
							</CardTitle>
							<div className='p-2 bg-red-100 rounded-full'>
								<AlertCircle className='h-4 w-4 text-red-600' />
							</div>
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold text-red-600'>
								{formatMoney(stats.totalRemaining)}
							</div>
						</CardContent>
					</Card>

					<Card className='bg-muted/30 border-dashed hover:shadow-md transition-all duration-300'>
						<CardHeader className='flex flex-row items-center justify-between pb-2'>
							<CardTitle className='text-sm font-medium text-muted-foreground'>
								To'lab yopilganlar
							</CardTitle>
							<div className='p-2 bg-muted rounded-full'>
								<CalendarClock className='h-4 w-4 text-muted-foreground' />
							</div>
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>
								{formatMoney(stats.totalFullyPaid)}
							</div>
						</CardContent>
					</Card>
				</div>

				<Tabs defaultValue='active' className='w-full'>
					<div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6'>
						<TabsList className='grid w-full md:w-[400px] grid-cols-2 h-11 rounded-xl'>
							<TabsTrigger value='active' className='rounded-lg font-semibold'>
								Faol qarzlar ({activeDebts.length})
							</TabsTrigger>
							<TabsTrigger value='paid' className='rounded-lg font-semibold'>
								To'lab bo'lingan ({paidDebts.length})
							</TabsTrigger>
						</TabsList>

						<div className='relative w-full md:w-80'>
							<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
							<Input
								type='search'
								placeholder="Kreditor bo'yicha qidirish..."
								className='pl-10 h-11 rounded-xl bg-background border-border/50 shadow-sm transition-colors hover:bg-accent/10 focus-visible:bg-background'
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
							/>
						</div>
					</div>

					<TabsContent
						value='active'
						className='mt-0 focus-visible:outline-none focus-visible:ring-0'
					>
						<Card className='border-border/50 shadow-sm overflow-hidden'>
							<CardContent className='p-4 sm:p-6'>
								<div className='rounded-md border overflow-x-auto'>
									<Table>
										<TableHeader className='bg-muted/30'>
											<TableRow className='hover:bg-transparent'>
												<TableHead className='w-[50px] font-bold pl-4'>
													#
												</TableHead>
												<TableHead className='font-bold'>
													Kreditor (Kimga)
												</TableHead>
												<TableHead className='font-bold'>Jami qarz</TableHead>
												<TableHead className='font-bold'>To'landi</TableHead>
												<TableHead className='font-bold'>Qoldiq</TableHead>
												<TableHead className='font-bold'>Muddat</TableHead>
												<TableHead className='font-bold'>Holati</TableHead>
												<TableHead className='text-right font-bold pr-4'>
													Amallar
												</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>{renderTableRows(activeDebts)}</TableBody>
									</Table>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent
						value='paid'
						className='mt-0 focus-visible:outline-none focus-visible:ring-0'
					>
						<Card className='border-border/50 shadow-sm overflow-hidden opacity-90'>
							<CardContent className='p-4 sm:p-6'>
								<div className='rounded-md border overflow-x-auto'>
									<Table>
										<TableHeader className='bg-muted/30'>
											<TableRow className='hover:bg-transparent'>
												<TableHead className='w-[50px] font-bold pl-4'>
													#
												</TableHead>
												<TableHead className='font-bold'>
													Kreditor (Kimga)
												</TableHead>
												<TableHead className='font-bold'>Jami qarz</TableHead>
												<TableHead className='font-bold'>To'landi</TableHead>
												<TableHead className='font-bold'>Qoldiq</TableHead>
												<TableHead className='font-bold'>Muddat</TableHead>
												<TableHead className='font-bold'>Holati</TableHead>
												<TableHead className='text-right font-bold pr-4'>
													Amallar
												</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>{renderTableRows(paidDebts)}</TableBody>
									</Table>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</main>
		</div>
	)
}
