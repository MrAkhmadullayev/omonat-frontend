'use client'

import { format } from 'date-fns'
import { uz } from 'date-fns/locale'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import useSWR from 'swr'

import { useUser } from '@/hooks/useUser'
import { expenseApi } from '@/lib/api'
import { CATEGORY_MAP } from '@/lib/constants'
import { formatCardNumber, formatMoney } from '@/lib/formatters'

import ConfirmDialog from '@/components/ConfirmDialog'
import ErrorState from '@/components/ErrorState'
import LoadingState from '@/components/LoadingState'
import PageHeader from '@/components/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { Calendar, CreditCard, Plus, Tag, Trash2, Wallet } from 'lucide-react'

export default function ExpenseDetailPage() {
	const { id } = useParams()
	const router = useRouter()
	const { user, isLoading: userLoading, isError } = useUser()
	const [isDeleting, setIsDeleting] = useState(false)
	const [showDeleteDialog, setShowDeleteDialog] = useState(false)

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
			setShowDeleteDialog(false)
		}
	}

	if (isError) return null

	if (userLoading || expenseLoading || isDeleting) {
		return (
			<LoadingState
				message={
					isDeleting
						? "O'chirilmoqda..."
						: "Xarajat ma'lumotlari yuklanmoqda..."
				}
			/>
		)
	}

	if (expenseError || !expense) {
		return (
			<ErrorState
				message="Ma'lumot topilmadi"
				onRetry={() => router.push('/expenses')}
			/>
		)
	}

	const catInfo = CATEGORY_MAP[expense.category] || {
		label: expense.category,
		icon: Plus,
		color: 'bg-muted text-muted-foreground',
		border: 'border-border',
	}
	const CategoryIcon = catInfo.icon

	return (
		<div className='min-h-screen bg-muted/20 flex flex-col font-sans pb-24'>
			<main className='flex-1 w-full max-w-5xl mx-auto p-4 md:p-8'>
				<div className='mb-8'>
					<PageHeader
						title='Xarajat tafsilotlari'
						subtitle="To'liq ma'lumotlar va tarix"
						backHref='/expenses'
					/>
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
												{expense.cardNumber
													? formatCardNumber(expense.cardNumber)
													: '**** **** **** ****'}
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
									onClick={() => setShowDeleteDialog(true)}
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

			<ConfirmDialog
				open={showDeleteDialog}
				onOpenChange={setShowDeleteDialog}
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
