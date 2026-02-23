'use client'

import { differenceInDays, format } from 'date-fns'
import { uz } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import useSWR from 'swr'

import { useUser } from '@/hooks/useUser'
import { receivableApi } from '@/lib/api'

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
	ArrowDownToLine,
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

const formatMoney = (amount, currency = 'UZS') => {
	return new Intl.NumberFormat('uz-UZ', {
		style: 'currency',
		currency,
		maximumFractionDigits: 0,
	}).format(amount || 0)
}

export default function ReceivablesPage() {
	const router = useRouter()
	const { user, isLoading: isUserLoading, isError } = useUser()
	const [searchQuery, setSearchQuery] = useState('')

	// XATOLIK TARTIBGA SOLINDI: () => receivableApi.getAll() qilib o'zgartirildi
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
		return (
			<div className='flex h-screen flex-col items-center justify-center bg-muted/20 gap-4'>
				<LoaderIcon className='size-10 animate-spin text-primary' />
				<p className='text-lg font-medium text-muted-foreground animate-pulse'>
					Haqdorlik ma'lumotlari yuklanmoqda...
				</p>
			</div>
		)
	}

	if (receivablesError) {
		return (
			<div className='flex h-screen flex-col items-center justify-center gap-4 bg-muted/20'>
				<AlertCircle className='size-12 text-muted-foreground/50' />
				<p className='text-xl font-bold text-red-600'>Tarmoq xatoligi!</p>
				<p className='text-muted-foreground font-medium'>
					{receivablesError.message}
				</p>
				<Button
					onClick={() => window.location.reload()}
					variant='outline'
					className='mt-2 rounded-xl'
				>
					Sahifani yangilash
				</Button>
			</div>
		)
	}

	const getStatusBadge = status => {
		switch (status) {
			case 'paid':
				return (
					<Badge className='bg-green-500 hover:bg-green-600 shadow-sm'>
						To'liq olindi
					</Badge>
				)
			case 'partial':
				return (
					<Badge className='bg-orange-500 hover:bg-orange-600 shadow-sm'>
						Qisman olindi
					</Badge>
				)
			case 'pending':
				return (
					<Badge className='bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm'>
						Olinmagan
					</Badge>
				)
			default:
				return <Badge variant='secondary'>Noma'lum</Badge>
		}
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
					<TableCell
						colSpan={8}
						className='text-center py-12 text-muted-foreground bg-muted/10 font-medium'
					>
						Hozircha ma'lumot topilmadi
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
									<span className='ml-1 font-mono text-[10px] bg-muted/50 px-1 rounded-sm'>
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
					<TableCell>{getStatusBadge(item.status)}</TableCell>

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
											className='cursor-pointer py-2 text-green-600 focus:bg-green-50 focus:text-green-600 font-bold'
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

	return (
		<div className='min-h-screen bg-muted/20 flex flex-col font-sans'>
			<Navbar user={user} />

			<main className='flex-1 w-full max-w-7xl mx-auto p-4 md:p-8'>
				<div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8'>
					<div className='flex items-center gap-4'>
						<Button
							variant='outline'
							size='icon'
							className='rounded-xl shadow-sm hover:bg-muted transition-colors'
							onClick={() => router.push('/')}
						>
							<ArrowLeft className='h-5 w-5' />
						</Button>
						<div>
							<h1 className='text-2xl font-bold tracking-tight text-foreground'>
								Haqdorligim
							</h1>
							<p className='text-sm text-muted-foreground font-medium mt-1'>
								Boshqalardan olishim kerak bo'lgan pullar.
							</p>
						</div>
					</div>
					<Button
						className='w-full md:w-auto rounded-xl shadow-md gap-2 h-11 transition-all font-bold'
						onClick={() => router.push('/receivables/add')}
					>
						<Plus className='h-5 w-5' /> Yangi haq qo'shish
					</Button>
				</div>

				<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8'>
					<Card className='hover:shadow-md transition-all duration-300 border-border/50 bg-background/60 backdrop-blur-sm'>
						<CardHeader className='flex flex-row items-center justify-between pb-2'>
							<CardTitle className='text-sm font-bold text-muted-foreground uppercase tracking-wider'>
								Kutilayotgan jami pul
							</CardTitle>
							<div className='p-2 bg-muted rounded-full border border-border/50'>
								<Banknote className='h-4 w-4 text-foreground' />
							</div>
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-black text-foreground'>
								{formatMoney(stats.totalExpected)}
							</div>
						</CardContent>
					</Card>

					<Card className='hover:shadow-md transition-all duration-300 border-border/50 bg-background/60 backdrop-blur-sm'>
						<CardHeader className='flex flex-row items-center justify-between pb-2'>
							<CardTitle className='text-sm font-bold text-muted-foreground uppercase tracking-wider'>
								Shundan olindi
							</CardTitle>
							<div className='p-2 bg-green-50 dark:bg-green-900/20 rounded-full border border-green-100 dark:border-green-900/30'>
								<Wallet className='h-4 w-4 text-green-600' />
							</div>
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-black text-green-600'>
								{formatMoney(stats.totalReceivedOfActive)}
							</div>
						</CardContent>
					</Card>

					<Card className='hover:shadow-md transition-all duration-300 border-border/50 bg-background/60 backdrop-blur-sm'>
						<CardHeader className='flex flex-row items-center justify-between pb-2'>
							<CardTitle className='text-sm font-bold text-muted-foreground uppercase tracking-wider'>
								Qoldiq (Olishim kerak)
							</CardTitle>
							<div className='p-2 bg-muted rounded-full'>
								<ArrowDownToLine className='h-4 w-4 text-foreground' />
							</div>
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-black text-foreground'>
								{formatMoney(stats.totalRemaining)}
							</div>
						</CardContent>
					</Card>

					<Card className='bg-muted/30 border-dashed hover:shadow-md transition-all duration-300'>
						<CardHeader className='flex flex-row items-center justify-between pb-2'>
							<CardTitle className='text-sm font-bold text-muted-foreground uppercase tracking-wider'>
								To'liq olinganlar
							</CardTitle>
							<div className='p-2 bg-muted rounded-full'>
								<CalendarClock className='h-4 w-4 text-muted-foreground' />
							</div>
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-black text-foreground'>
								{formatMoney(stats.totalFullyReceived)}
							</div>
						</CardContent>
					</Card>
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
								className='pl-11 h-12 rounded-xl bg-background border-border/50 shadow-sm transition-all hover:bg-accent/10 focus-visible:bg-background focus-visible:ring-primary font-medium'
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
							/>
						</div>
					</div>

					<TabsContent
						value='active'
						className='mt-0 focus-visible:outline-none focus-visible:ring-0'
					>
						<Card className='border-border/50 shadow-sm overflow-hidden bg-background/60 backdrop-blur-sm'>
							<CardContent className='p-4 sm:p-6'>
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
										<TableBody>{renderTableRows(activeReceivables)}</TableBody>
									</Table>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent
						value='paid'
						className='mt-0 focus-visible:outline-none focus-visible:ring-0'
					>
						<Card className='border-border/50 shadow-sm overflow-hidden opacity-90 bg-background/60 backdrop-blur-sm'>
							<CardContent className='p-4 sm:p-6'>
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
										<TableBody>{renderTableRows(paidReceivables)}</TableBody>
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
