'use client'

import { format } from 'date-fns'
import { uz } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import useSWR from 'swr'

import { useUser } from '@/hooks/useUser'
import { expenseApi } from '@/lib/api'

import Navbar from '@/components/Navbar'
import { Badge } from '@/components/ui/badge'
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
import { Input } from '@/components/ui/input'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'

import {
	AlertCircle,
	ArrowLeft,
	Banknote,
	Calendar,
	Car,
	CreditCard,
	Edit,
	Eye,
	Filter,
	Home,
	LoaderIcon,
	MoreVertical,
	Plus,
	Search,
	Settings,
	ShoppingBag,
	Trash2,
	Utensils,
	Wallet,
} from 'lucide-react'

const formatMoney = (amount, currency = 'UZS') => {
	return new Intl.NumberFormat('uz-UZ', {
		style: 'currency',
		currency,
		maximumFractionDigits: 0,
	}).format(amount || 0)
}

const categoryMap = {
	food: {
		label: 'Oziq-ovqat',
		icon: Utensils,
		color:
			'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
		border: 'border-orange-200 dark:border-orange-900',
	},
	transport: {
		label: 'Transport',
		icon: Car,
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
		border: 'border-blue-200 dark:border-blue-900',
	},
	shopping: {
		label: 'Xaridlar',
		icon: ShoppingBag,
		color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
		border: 'border-pink-200 dark:border-pink-900',
	},
	house: {
		label: 'Uy-joy',
		icon: Home,
		color:
			'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
		border: 'border-purple-200 dark:border-purple-900',
	},
	services: {
		label: 'Xizmatlar',
		icon: Settings,
		color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
		border: 'border-slate-200 dark:border-slate-700',
	},
}

export default function ExpensesPage() {
	const router = useRouter()
	const { user, isLoading: isUserLoading, isError } = useUser()
	const [searchQuery, setSearchQuery] = useState('')

	const {
		data: expenses = [],
		isLoading: isExpensesLoading,
		error: expensesError,
		mutate,
	} = useSWR(user ? '/expenses' : null, () => expenseApi.getAll())

	useEffect(() => {
		if (isError) router.push('/authentication/login')
	}, [isError, router])

	if (isError) return null

	if (isUserLoading || isExpensesLoading || !user) {
		return (
			<div className='flex h-screen flex-col items-center justify-center bg-muted/20 gap-4'>
				<LoaderIcon className='size-10 animate-spin text-primary' />
				<p className='text-lg font-medium text-muted-foreground animate-pulse'>
					Xarajatlar yuklanmoqda...
				</p>
			</div>
		)
	}

	if (expensesError) {
		return (
			<div className='flex h-screen flex-col items-center justify-center gap-4 bg-muted/20'>
				<AlertCircle className='size-12 text-muted-foreground/50' />
				<p className='text-xl font-bold text-red-600'>Tarmoq xatoligi!</p>
				<p className='text-muted-foreground font-medium'>
					{expensesError.message}
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

	const handleDelete = async id => {
		if (!confirm("Haqiqatan ham bu xarajatni o'chirmoqchimisiz?")) return
		try {
			await expenseApi.delete(id)
			toast.success("Xarajat muvaffaqiyatli o'chirildi", {
				style: { background: '#16A34A', color: '#fff' },
			})
			mutate()
		} catch (error) {
			toast.error(error.message || 'Xatolik yuz berdi', {
				style: { background: '#DC2626', color: '#fff' },
			})
		}
	}

	const filteredExpenses = expenses.filter(exp =>
		exp.title?.toLowerCase().includes(searchQuery.toLowerCase()),
	)

	const totalThisMonth = filteredExpenses.reduce(
		(sum, exp) => sum + exp.amount,
		0,
	)
	const cardPayments = filteredExpenses
		.filter(e => e.method === 'card')
		.reduce((sum, e) => sum + e.amount, 0)
	const cashPayments = filteredExpenses
		.filter(e => e.method === 'cash')
		.reduce((sum, e) => sum + e.amount, 0)

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
								Xarajatlar ro'yxati
							</h1>
							<p className='text-sm text-muted-foreground font-medium mt-1'>
								Pullaringiz qayerga sarflanayotganini kuzating.
							</p>
						</div>
					</div>
					<Button
						className='w-full md:w-auto rounded-xl shadow-md gap-2 h-11 transition-all font-bold'
						onClick={() => router.push('/expenses/add')}
					>
						<Plus className='h-5 w-5' /> Yangi xarajat qo'shish
					</Button>
				</div>

				<div className='grid gap-4 md:grid-cols-3 mb-8'>
					<Card className='hover:shadow-md transition-all duration-300 border-border/50 bg-background/60 backdrop-blur-sm'>
						<CardHeader className='flex flex-row items-center justify-between pb-2'>
							<CardTitle className='text-sm font-bold text-muted-foreground uppercase tracking-wider'>
								Jami xarajat (bu oy)
							</CardTitle>
							<div className='p-2 bg-muted rounded-full border border-border/50'>
								<Banknote className='h-4 w-4 text-foreground' />
							</div>
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-black text-foreground'>
								{formatMoney(totalThisMonth)}
							</div>
						</CardContent>
					</Card>

					<Card className='hover:shadow-md transition-all duration-300 border-border/50 bg-background/60 backdrop-blur-sm'>
						<CardHeader className='flex flex-row items-center justify-between pb-2'>
							<CardTitle className='text-sm font-bold text-muted-foreground uppercase tracking-wider'>
								Kartadan chiqim
							</CardTitle>
							<div className='p-2 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-100 dark:border-blue-900/30'>
								<CreditCard className='h-4 w-4 text-blue-600' />
							</div>
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-black text-blue-600'>
								{formatMoney(cardPayments)}
							</div>
						</CardContent>
					</Card>

					<Card className='hover:shadow-md transition-all duration-300 border-border/50 bg-background/60 backdrop-blur-sm'>
						<CardHeader className='flex flex-row items-center justify-between pb-2'>
							<CardTitle className='text-sm font-bold text-muted-foreground uppercase tracking-wider'>
								Naqd chiqim
							</CardTitle>
							<div className='p-2 bg-green-50 dark:bg-green-900/20 rounded-full border border-green-100 dark:border-green-900/30'>
								<Wallet className='h-4 w-4 text-green-600' />
							</div>
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-black text-green-600'>
								{formatMoney(cashPayments)}
							</div>
						</CardContent>
					</Card>
				</div>

				<Card className='mb-8 border-border/50 shadow-sm bg-background/60 backdrop-blur-sm'>
					<CardContent className='p-4 sm:p-5 flex flex-col md:flex-row gap-4'>
						<div className='relative flex-1'>
							<Search className='absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
							<Input
								placeholder='Xarajat nomini yozing...'
								className='pl-11 h-12 rounded-xl bg-background border-border/50 shadow-sm transition-all hover:bg-accent/10 focus-visible:bg-background focus-visible:ring-primary font-medium'
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
							/>
						</div>
						<Button
							variant='outline'
							className='h-12 rounded-xl px-6 gap-2 font-bold shadow-sm hover:bg-muted'
						>
							<Filter className='h-4 w-4' /> Saralash
						</Button>
					</CardContent>
				</Card>

				<Card className='border-border/50 shadow-sm overflow-hidden bg-background/60 backdrop-blur-sm'>
					<CardHeader className='pb-4 border-b border-border/50 bg-muted/20'>
						<CardTitle className='text-lg font-bold'>
							So'nggi xarajatlar
						</CardTitle>
						<CardDescription className='font-medium'>
							Sizning barcha sarf-xarajatlaringiz tarixi.
						</CardDescription>
					</CardHeader>
					<CardContent className='p-0'>
						<div className='overflow-x-auto'>
							<Table>
								<TableHeader className='bg-muted/30'>
									<TableRow className='hover:bg-transparent'>
										<TableHead className='w-[120px] font-bold text-xs uppercase tracking-wider pl-6'>
											Sana
										</TableHead>
										<TableHead className='font-bold text-xs uppercase tracking-wider'>
											Nomi
										</TableHead>
										<TableHead className='font-bold text-xs uppercase tracking-wider'>
											Kategoriya
										</TableHead>
										<TableHead className='font-bold text-xs uppercase tracking-wider'>
											To'lov turi
										</TableHead>
										<TableHead className='text-right font-bold text-xs uppercase tracking-wider'>
											Summa
										</TableHead>
										<TableHead className='w-[60px] pr-4'></TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredExpenses.length > 0 ? (
										filteredExpenses.map(exp => {
											const catInfo = categoryMap[exp.category] || {
												label: exp.category,
												icon: Plus,
												color: 'bg-muted text-muted-foreground',
												border: 'border-border',
											}
											const CategoryIcon = catInfo.icon
											return (
												<TableRow
													key={exp._id || exp.id}
													className='hover:bg-muted/40 transition-colors group'
												>
													<TableCell className='pl-6'>
														<div className='flex items-center gap-2 text-xs font-semibold text-muted-foreground'>
															<Calendar className='h-3.5 w-3.5' />
															{format(new Date(exp.date), 'dd MMM, yyyy', {
																locale: uz,
															})}
														</div>
													</TableCell>
													<TableCell className='font-bold text-foreground capitalize'>
														{exp.title}
													</TableCell>
													<TableCell>
														<div
															className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${catInfo.color} ${catInfo.border}`}
														>
															<CategoryIcon className='h-3.5 w-3.5' />
															{catInfo.label}
														</div>
													</TableCell>
													<TableCell>
														<div className='flex flex-col items-start gap-1'>
															<Badge
																variant='outline'
																className='text-[11px] font-bold uppercase tracking-wider bg-background'
															>
																{exp.method === 'card' ? 'Karta' : 'Naqd'}
															</Badge>
															{exp.method === 'card' && exp.cardNumber && (
																<span className='text-[10px] text-muted-foreground font-mono font-medium'>
																	*{exp.cardNumber.slice(-4)}
																</span>
															)}
														</div>
													</TableCell>
													<TableCell className='text-right font-black text-red-600'>
														-{formatMoney(exp.amount, 'UZS')}
													</TableCell>
													<TableCell className='pr-4 text-right'>
														<DropdownMenu>
															<DropdownMenuTrigger asChild>
																<Button
																	variant='ghost'
																	size='icon'
																	className='h-8 w-8 rounded-lg hover:bg-muted data-[state=open]:bg-muted'
																>
																	<MoreVertical className='h-4 w-4' />
																</Button>
															</DropdownMenuTrigger>
															<DropdownMenuContent
																align='end'
																className='w-48 rounded-xl shadow-md border-border/50'
															>
																<DropdownMenuLabel className='font-bold text-xs text-muted-foreground uppercase tracking-wider'>
																	Amallar
																</DropdownMenuLabel>
																<DropdownMenuItem
																	onClick={() =>
																		router.push(
																			`/expenses/${exp._id || exp.id}`,
																		)
																	}
																	className='cursor-pointer py-2 font-medium'
																>
																	<Eye className='mr-2 h-4 w-4 text-muted-foreground' />{' '}
																	Batafsil ko'rish
																</DropdownMenuItem>
																<DropdownMenuItem
																	onClick={() =>
																		router.push(
																			`/expenses/${exp._id || exp.id}/edit`,
																		)
																	}
																	className='cursor-pointer py-2 font-medium'
																>
																	<Edit className='mr-2 h-4 w-4 text-muted-foreground' />{' '}
																	Tahrirlash
																</DropdownMenuItem>
																<DropdownMenuSeparator />
																<DropdownMenuItem
																	className='cursor-pointer py-2 text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950/30 font-bold'
																	onClick={() =>
																		handleDelete(exp._id || exp.id)
																	}
																>
																	<Trash2 className='mr-2 h-4 w-4' /> O'chirish
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
													</TableCell>
												</TableRow>
											)
										})
									) : (
										<TableRow>
											<TableCell
												colSpan={6}
												className='text-center py-16 text-muted-foreground'
											>
												<div className='flex flex-col items-center justify-center'>
													<ShoppingBag className='h-10 w-10 mb-3 opacity-20' />
													<span className='font-medium'>
														Hech qanday xarajat topilmadi.
													</span>
												</div>
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</div>
					</CardContent>
				</Card>
			</main>
		</div>
	)
}
