'use client'

import { format } from 'date-fns'
import { uz } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import useSWR from 'swr'

import { useUser } from '@/hooks/useUser'
import { expenseApi } from '@/lib/api'
import { CATEGORY_MAP } from '@/lib/constants'
import { formatMoney } from '@/lib/formatters'

import ConfirmDialog from '@/components/ConfirmDialog'
import ErrorState from '@/components/ErrorState'
import LoadingState from '@/components/LoadingState'
import PageHeader from '@/components/PageHeader'
import StatsCard from '@/components/StatsCard'
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
	Banknote,
	Calendar,
	CreditCard,
	Edit,
	Eye,
	Filter,
	MoreVertical,
	Plus,
	Search,
	ShoppingBag,
	Trash2,
	TrendingUp,
	Wallet,
} from 'lucide-react'

export default function ExpensesPage() {
	const router = useRouter()
	const { user, isLoading: isUserLoading, isError } = useUser()
	const [searchQuery, setSearchQuery] = useState('')
	const [deleteTarget, setDeleteTarget] = useState(null)
	const [isDeleting, setIsDeleting] = useState(false)

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
		return <LoadingState message='Xarajatlar yuklanmoqda...' />
	}

	if (expensesError) {
		return <ErrorState message={expensesError.message} />
	}

	const handleDelete = async () => {
		if (!deleteTarget) return
		setIsDeleting(true)
		try {
			await expenseApi.delete(deleteTarget)
			toast.success("Xarajat muvaffaqiyatli o'chirildi")
			mutate()
		} catch (error) {
			toast.error(error.message || 'Xatolik yuz berdi')
		} finally {
			setIsDeleting(false)
			setDeleteTarget(null)
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
		<div className='min-h-screen bg-muted/20 flex flex-col font-sans pb-24'>
			<main className='flex-1 w-full max-w-7xl mx-auto p-4 md:p-8'>
				<div className='mb-8'>
					<PageHeader
						title='Xarajatlar royxati'
						subtitle='Pullaringiz qayerga sarflanayotganini kuzating.'
						backHref='/'
					>
						<Button
							variant='outline'
							className='flex-1 md:flex-none rounded-xl gap-2 h-11 transition-all font-bold hover:bg-muted'
							onClick={() => router.push('/expenses/reports')}
						>
							<TrendingUp className='h-4 w-4 text-primary' /> Hisobotlar
						</Button>
						<Button
							className='flex-1 md:flex-none rounded-xl shadow-md gap-2 h-11 transition-all font-bold'
							onClick={() => router.push('/expenses/add')}
						>
							<Plus className='h-5 w-5' /> Yangi
						</Button>
					</PageHeader>
				</div>

				<div className='grid gap-4 md:grid-cols-3 mb-8'>
					<StatsCard
						title='Jami xarajat (bu oy)'
						value={formatMoney(totalThisMonth)}
						icon={Banknote}
						animated={false}
					/>
					<StatsCard
						title='Kartadan chiqim'
						value={formatMoney(cardPayments)}
						valueColor='text-blue-600'
						icon={CreditCard}
						iconBg='bg-blue-50 dark:bg-blue-900/20'
						iconColor='text-blue-600'
						animated={false}
					/>
					<StatsCard
						title='Naqd chiqim'
						value={formatMoney(cashPayments)}
						valueColor='text-green-600'
						icon={Wallet}
						iconBg='bg-green-50 dark:bg-green-900/20'
						iconColor='text-green-600'
						animated={false}
					/>
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
											const catInfo = CATEGORY_MAP[exp.category] || {
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
														<div className='flex items-center gap-2 text-[13px] font-semibold text-muted-foreground'>
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
																className='text-xs font-bold uppercase tracking-wider bg-background'
															>
																{exp.method === 'card' ? 'Karta' : 'Naqd'}
															</Badge>
															{exp.method === 'card' && exp.cardNumber && (
																<span className='text-[11px] text-muted-foreground font-mono font-medium'>
																	*{exp.cardNumber.slice(-4)}
																</span>
															)}
														</div>
													</TableCell>
													<TableCell className='text-right font-black text-destructive'>
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
																	className='cursor-pointer py-2 text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950/30 dark:focus:text-red-400 font-bold'
																	onClick={() =>
																		setDeleteTarget(exp._id || exp.id)
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

			<ConfirmDialog
				open={!!deleteTarget}
				onOpenChange={open => !open && setDeleteTarget(null)}
				title="Xarajatni o'chirish"
				description="Haqiqatan ham bu xarajatni o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi."
				confirmLabel="O'chirish"
				onConfirm={handleDelete}
				isLoading={isDeleting}
				variant='destructive'
			/>
		</div>
	)
}
