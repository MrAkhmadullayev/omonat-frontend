'use client'

import { format } from 'date-fns'
import { uz } from 'date-fns/locale'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import useSWR from 'swr'

import { useUser } from '@/hooks/useUser'
import { expenseApi } from '@/lib/api'

import Navbar from '@/components/Navbar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import {
	AlertCircle,
	ArrowLeft,
	Calendar,
	Car,
	CreditCard,
	Home,
	LoaderIcon,
	Plus,
	Settings,
	ShoppingBag,
	Tag,
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

const formatCardNumber = number => {
	if (!number) return '**** **** **** ****'
	const cleaned = ('' + number).replace(/\D/g, '')
	const match = cleaned.match(/.{1,4}/g)
	return match ? match.join(' ') : cleaned
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

export default function ExpenseDetailPage() {
	const { id } = useParams()
	const router = useRouter()
	const { user, isLoading: userLoading, isError } = useUser()
	const [isDeleting, setIsDeleting] = useState(false)

	const {
		data: expense,
		error: expenseError,
		isLoading: expenseLoading,
	} = useSWR(user && id ? `/expenses/${id}` : null, () =>
		expenseApi.getById(id),
	)

	useEffect(() => {
		if (isError) router.push('/authentication/login')
	}, [isError, router])

	const handleDelete = async () => {
		if (!confirm("Haqiqatan ham bu xarajatni o'chirmoqchimisiz?")) return
		try {
			setIsDeleting(true)
			await expenseApi.delete(id)
			toast.success("Xarajat muvaffaqiyatli o'chirildi", {
				style: { background: '#16A34A', color: '#fff' },
			})
			router.push('/expenses')
		} catch (error) {
			toast.error(error.message || "O'chirishda xatolik yuz berdi", {
				style: { background: '#DC2626', color: '#fff' },
			})
			setIsDeleting(false)
		}
	}

	if (isError) return null

	if (userLoading || expenseLoading || isDeleting) {
		return (
			<div className='flex h-screen flex-col items-center justify-center bg-muted/20 gap-4'>
				<LoaderIcon className='size-10 animate-spin text-foreground' />
				<p className='text-lg font-medium text-muted-foreground animate-pulse'>
					{isDeleting
						? "O'chirilmoqda..."
						: "Xarajat ma'lumotlari yuklanmoqda..."}
				</p>
			</div>
		)
	}

	if (expenseError || !expense) {
		return (
			<div className='flex h-screen flex-col items-center justify-center bg-muted/20 gap-4'>
				<AlertCircle className='size-12 text-muted-foreground/50' />
				<div className='text-xl font-bold text-foreground'>
					Ma'lumot topilmadi
				</div>
				<Button
					variant='outline'
					onClick={() => router.push('/expenses')}
					className='mt-2 rounded-xl'
				>
					Orqaga qaytish
				</Button>
			</div>
		)
	}

	const catInfo = categoryMap[expense.category] || {
		label: expense.category,
		icon: Plus,
		color: 'bg-muted text-muted-foreground',
		border: 'border-border',
	}
	const CategoryIcon = catInfo.icon

	return (
		<div className='min-h-screen bg-muted/20 flex flex-col font-sans'>
			<Navbar user={user} />

			<main className='flex-1 w-full max-w-5xl mx-auto p-4 md:p-8'>
				<div className='flex items-center gap-4 mb-8'>
					<Button
						variant='outline'
						size='icon'
						className='rounded-xl shadow-sm hover:bg-muted transition-colors'
						onClick={() => router.push('/expenses')}
					>
						<ArrowLeft className='h-5 w-5' />
					</Button>
					<div>
						<h1 className='text-2xl font-bold tracking-tight text-foreground'>
							Xarajat tafsilotlari
						</h1>
						<p className='text-sm text-muted-foreground font-medium mt-1'>
							To'liq ma'lumotlar va tarix
						</p>
					</div>
				</div>

				<div className='grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8'>
					<div className='lg:col-span-2 space-y-6'>
						<Card className='overflow-hidden border-border/50 shadow-sm bg-background/60 backdrop-blur-xl'>
							<div className='bg-foreground p-6 sm:p-8 text-background'>
								<div className='mb-6 flex items-center justify-between'>
									<Badge
										variant='secondary'
										className='bg-background/20 text-background hover:bg-background/30 font-bold tracking-wider px-3 py-1 uppercase text-xs'
									>
										Chiqim
									</Badge>
									<div className='flex items-center gap-2 text-sm font-semibold text-background/80'>
										<Calendar className='h-4 w-4' />
										{format(new Date(expense.date), 'dd MMMM, yyyy', {
											locale: uz,
										})}
									</div>
								</div>
								<h2 className='text-3xl font-extrabold mb-2 tracking-tight capitalize leading-tight'>
									{expense.title}
								</h2>
								<div className='text-5xl font-black tracking-tighter mt-4 drop-shadow-md'>
									{formatMoney(expense.amount, 'UZS')}
								</div>
							</div>

							<CardContent className='p-6 sm:p-8 space-y-8'>
								<div className='grid grid-cols-1 sm:grid-cols-2 gap-5 rounded-2xl bg-muted/40 p-5 border border-border/50'>
									<div className='space-y-2'>
										<div className='flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wider'>
											<Tag className='h-4 w-4' /> Kategoriya
										</div>
										<div
											className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border shadow-sm ${catInfo.color} ${catInfo.border}`}
										>
											<CategoryIcon className='h-4 w-4' />
											{catInfo.label}
										</div>
									</div>
									<div className='space-y-2'>
										<div className='flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wider'>
											{expense.method === 'cash' ? (
												<Wallet className='h-4 w-4' />
											) : (
												<CreditCard className='h-4 w-4' />
											)}
											To'lov usuli
										</div>
										<div className='text-base font-bold flex items-center gap-2 px-1'>
											{expense.method === 'cash'
												? 'Naqd pul orqali'
												: 'Bank kartasi orqali'}
										</div>
									</div>
								</div>

								{expense.method === 'card' && (
									<div className='relative overflow-hidden p-6 sm:p-8 rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl w-full max-w-sm'>
										<div className='absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10' />
										<div className='flex justify-between items-start relative z-10 mb-6'>
											<CreditCard className='h-8 w-8 text-white/80' />
											<span className='text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase'>
												Bank Kartasi
											</span>
										</div>
										<div className='relative z-10 mb-4'>
											<p className='text-2xl font-mono tracking-[0.15em] text-white/95 drop-shadow-md'>
												{formatCardNumber(expense.cardNumber)}
											</p>
										</div>
										<div className='flex justify-between items-end relative z-10'>
											<div className='flex flex-col'>
												<span className='text-[10px] uppercase tracking-[0.1em] text-white/50 mb-1'>
													Karta egasi
												</span>
												<span className='text-sm font-bold tracking-wider text-white/90 uppercase drop-shadow-sm'>
													{expense.cardHolder || "KO'RSATILMAGAN"}
												</span>
											</div>
										</div>
									</div>
								)}

								{expense.description && (
									<div className='space-y-3'>
										<h3 className='text-sm font-bold text-muted-foreground uppercase tracking-wider'>
											Izoh
										</h3>
										<div className='text-sm text-foreground bg-muted/30 p-4 rounded-xl border border-border/50 leading-relaxed font-medium italic'>
											{expense.description}
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					</div>

					<div className='space-y-6'>
						<Card className='shadow-sm border-border/50 bg-background/60 backdrop-blur-xl'>
							<CardHeader className='border-b bg-muted/20 pb-4'>
								<CardTitle className='text-base font-bold flex items-center gap-2'>
									<Calendar className='h-4 w-4 text-primary' /> Qo'shimcha
									ma'lumot
								</CardTitle>
							</CardHeader>
							<CardContent className='p-5 space-y-4 text-sm font-medium'>
								<div className='flex justify-between items-center p-3 rounded-lg bg-muted/30 border border-border/50'>
									<span className='text-muted-foreground'>
										Kiritilgan vaqt:
									</span>
									<span className='font-bold text-foreground'>
										{format(new Date(expense.createdAt), 'dd.MM.yyyy HH:mm')}
									</span>
								</div>
								<div className='flex justify-between items-center p-3 rounded-lg bg-muted/30 border border-border/50'>
									<span className='text-muted-foreground'>
										Yangilangan vaqt:
									</span>
									<span className='font-bold text-foreground'>
										{format(new Date(expense.updatedAt), 'dd.MM.yyyy HH:mm')}
									</span>
								</div>
							</CardContent>
						</Card>

						<Card className='border-red-200/50 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/10 shadow-sm transition-colors hover:bg-red-50/80 dark:hover:bg-red-950/20'>
							<CardContent className='p-5'>
								<Button
									variant='destructive'
									className='w-full rounded-xl font-bold tracking-wide h-11'
									onClick={handleDelete}
									disabled={isDeleting}
								>
									<Trash2 className='w-4 h-4 mr-2' />
									Xarajatni o'chirish
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</main>
		</div>
	)
}
