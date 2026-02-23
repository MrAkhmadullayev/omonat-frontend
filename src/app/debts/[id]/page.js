'use client'

import { format } from 'date-fns'
import { uz } from 'date-fns/locale'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import useSWR from 'swr'

import { useUser } from '@/hooks/useUser'
import { debtApi } from '@/lib/api'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

import {
	AlertCircle,
	ArrowLeft,
	BanknoteIcon,
	BellRing,
	CalendarClock,
	CheckCircle2,
	CreditCard,
	History,
	LoaderIcon,
	Trash2,
	User,
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

export default function DebtDetailsPage() {
	const { id } = useParams()
	const router = useRouter()
	const { user, isLoading: userLoading, isError } = useUser()
	const [isDeleting, setIsDeleting] = useState(false)

	const {
		data: debt,
		error: debtError,
		isLoading: debtLoading,
	} = useSWR(user && id ? `/debts/${id}` : null, () => debtApi.getById(id))

	useEffect(() => {
		if (isError) router.push('/authentication/login')
	}, [isError, router])

	const handleDelete = async () => {
		if (!confirm("Haqiqatan ham bu qarzni o'chirmoqchimisiz?")) return
		try {
			setIsDeleting(true)
			await debtApi.delete(id)
			toast.success("Qarz muvaffaqiyatli o'chirildi", {
				style: { background: '#16A34A', color: '#fff' },
			})
			router.push('/debts')
		} catch (error) {
			toast.error(error.message || "O'chirishda xatolik yuz berdi", {
				style: { background: '#DC2626', color: '#fff' },
			})
			setIsDeleting(false)
		}
	}

	if (isError) return null

	if (userLoading || debtLoading || isDeleting) {
		return (
			<div className='flex h-screen flex-col items-center justify-center bg-muted/20 gap-4'>
				<LoaderIcon className='size-10 animate-spin text-primary' />
				<p className='text-lg font-medium text-muted-foreground animate-pulse'>
					{isDeleting ? "O'chirilmoqda..." : "Ma'lumotlar yuklanmoqda..."}
				</p>
			</div>
		)
	}

	if (debtError || !debt) {
		return (
			<div className='flex h-screen flex-col items-center justify-center bg-muted/20 gap-4'>
				<AlertCircle className='size-12 text-muted-foreground/50' />
				<div className='text-xl font-bold text-foreground'>
					Ma'lumot topilmadi
				</div>
				<Button
					variant='outline'
					onClick={() => router.push('/debts')}
					className='mt-2 rounded-xl'
				>
					Orqaga qaytish
				</Button>
			</div>
		)
	}

	const remainingAmount = debt.amount - debt.paidAmount
	const progressPercentage = Math.round((debt.paidAmount / debt.amount) * 100)

	const getStatusBadge = status => {
		switch (status) {
			case 'paid':
				return (
					<Badge className='bg-green-500 text-sm py-1.5 px-3.5 shadow-sm hover:bg-green-600 font-medium'>
						To'liq yopilgan
					</Badge>
				)
			case 'partial':
				return (
					<Badge className='bg-orange-500 text-sm py-1.5 px-3.5 shadow-sm hover:bg-orange-600 font-medium'>
						Qisman to'langan
					</Badge>
				)
			case 'pending':
				return (
					<Badge
						variant='destructive'
						className='text-sm py-1.5 px-3.5 shadow-sm font-medium'
					>
						To'lanmagan
					</Badge>
				)
			default:
				return null
		}
	}

	return (
		<div className='min-h-screen bg-muted/20 flex flex-col font-sans'>
			<main className='flex-1 w-full max-w-6xl mx-auto p-4 md:p-8'>
				<div className='flex items-center gap-4 mb-8'>
					<Button
						variant='outline'
						size='icon'
						className='rounded-xl shadow-sm hover:bg-muted transition-colors'
						onClick={() => router.push('/debts')}
					>
						<ArrowLeft className='h-5 w-5' />
					</Button>
					<div>
						<h1 className='text-2xl font-bold tracking-tight text-foreground'>
							Qarz tafsilotlari
						</h1>
						<p className='text-sm text-muted-foreground font-medium mt-1'>
							ID: #{debt._id || debt.id}
						</p>
					</div>
				</div>

				<div className='grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8'>
					<div className='lg:col-span-2 space-y-6'>
						<Card className='shadow-sm hover:shadow-md transition-all duration-300 bg-background/60 backdrop-blur-xl'>
							<CardHeader className='flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6'>
								<div>
									<CardTitle className='text-3xl font-extrabold capitalize tracking-tight'>
										{debt.creditorName}
									</CardTitle>
									<CardDescription className='flex items-center gap-2 mt-2 text-sm font-medium text-muted-foreground'>
										<User className='h-4 w-4' /> Kreditor (Kimga berish kerak)
									</CardDescription>
								</div>
								<div>{getStatusBadge(debt.status)}</div>
							</CardHeader>
							<CardContent>
								<div className='grid grid-cols-2 md:grid-cols-3 gap-6 mb-8 p-6 rounded-2xl bg-muted/40 border border-border/50'>
									<div className='space-y-1.5'>
										<p className='text-sm font-semibold text-muted-foreground uppercase tracking-wider'>
											Jami qarz
										</p>
										<p className='text-2xl font-bold text-foreground'>
											{formatMoney(debt.amount, debt.currency)}
										</p>
									</div>
									<div className='space-y-1.5'>
										<p className='text-sm font-semibold text-muted-foreground uppercase tracking-wider'>
											To'landi
										</p>
										<p className='text-2xl font-bold text-green-600'>
											{formatMoney(debt.paidAmount, debt.currency)}
										</p>
									</div>
									<div className='col-span-2 md:col-span-1 space-y-1.5'>
										<p className='text-sm font-semibold text-muted-foreground uppercase tracking-wider'>
											Qoldiq
										</p>
										<p className='text-3xl font-black text-red-600 drop-shadow-sm'>
											{formatMoney(remainingAmount, debt.currency)}
										</p>
									</div>
								</div>

								<div className='space-y-3 px-1'>
									<div className='flex justify-between text-sm'>
										<span className='font-semibold text-muted-foreground'>
											To'lov jarayoni
										</span>
										<span className='font-bold text-primary'>
											{progressPercentage}%
										</span>
									</div>
									<Progress
										value={progressPercentage}
										className='h-3 rounded-full bg-muted shadow-inner'
									/>
								</div>
							</CardContent>
						</Card>

						<Card className='shadow-sm hover:shadow-md transition-shadow border-border/50 bg-background/60 backdrop-blur-xl'>
							<CardHeader>
								<CardTitle className='text-xl font-bold'>
									Qo'shimcha ma'lumotlar
								</CardTitle>
							</CardHeader>
							<CardContent className='space-y-8'>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									<div className='flex items-start gap-4 p-5 rounded-2xl bg-muted/40 border border-border/50 transition-colors hover:bg-muted/60'>
										<div className='p-2.5 bg-background rounded-xl shadow-sm border border-border/50'>
											<CalendarClock className='h-5 w-5 text-primary' />
										</div>
										<div>
											<p className='text-sm font-semibold text-muted-foreground mb-1'>
												Olingan sana
											</p>
											<p className='text-base font-bold text-foreground'>
												{format(
													new Date(debt.dateTaken || debt.createdAt),
													'dd MMMM, yyyy',
													{ locale: uz },
												)}
											</p>
										</div>
									</div>
									<div className='flex items-start gap-4 p-5 rounded-2xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/50 transition-colors hover:bg-orange-50 dark:hover:bg-orange-950/40'>
										<div className='p-2.5 bg-background rounded-xl shadow-sm border border-orange-100 dark:border-orange-900'>
											<CalendarClock className='h-5 w-5 text-orange-500' />
										</div>
										<div>
											<p className='text-sm font-semibold text-orange-700 dark:text-orange-500 mb-1'>
												Qaytarish muddati
											</p>
											<p className='text-base font-bold text-orange-600/90'>
												{format(new Date(debt.dueDate), 'dd MMMM, yyyy', {
													locale: uz,
												})}
											</p>
										</div>
									</div>
								</div>

								<Separator className='opacity-70' />

								<div className='space-y-4'>
									<h3 className='text-sm font-bold text-muted-foreground uppercase tracking-wider'>
										To'lov usuli
									</h3>
									{debt.paymentMethod === 'cash' ? (
										<div className='inline-flex items-center gap-2.5 text-sm font-bold p-4 rounded-xl bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/30 dark:border-green-900 dark:text-green-400'>
											<Wallet className='h-5 w-5' /> Naqd pul orqali
										</div>
									) : (
										<div className='relative overflow-hidden p-6 rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl w-full transition-transform hover:scale-[1.02] duration-300'>
											<div className='absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10' />
											<div className='flex justify-between items-start relative z-10 mb-6'>
												<CreditCard className='h-8 w-8 text-white/80' />
												<span className='text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase'>
													Bank Kartasi
												</span>
											</div>
											<div className='relative z-10 mb-4'>
												<p className='text-2xl font-mono tracking-[0.15em] text-white/95 drop-shadow-md'>
													{formatCardNumber(debt.cardNumber)}
												</p>
											</div>
											<div className='flex justify-between items-end relative z-10'>
												<div className='flex flex-col'>
													<span className='text-[10px] uppercase tracking-[0.1em] text-white/50 mb-1'>
														Karta egasi
													</span>
													<span className='text-sm font-bold tracking-wider text-white/90 uppercase drop-shadow-sm'>
														{debt.cardHolder || "KO'RSATILMAGAN"}
													</span>
												</div>
											</div>
										</div>
									)}
								</div>

								<Separator className='opacity-70' />

								<div className='space-y-5'>
									<div>
										<h3 className='text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3'>
											Izoh
										</h3>
										<div className='text-sm text-foreground bg-muted/40 p-4 rounded-xl border border-border/50 leading-relaxed'>
											{debt.description ? (
												<span className='italic font-medium'>
													{debt.description}
												</span>
											) : (
												<span className='italic text-muted-foreground'>
													Izoh kiritilmagan.
												</span>
											)}
										</div>
									</div>

									<div
										className={`inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full border shadow-sm transition-colors ${debt.isReminderEnabled ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground border-border/50'}`}
									>
										<BellRing
											className={`h-4 w-4 ${debt.isReminderEnabled ? 'animate-pulse' : ''}`}
										/>
										{debt.isReminderEnabled
											? 'Eslatma faol'
											: "Eslatma o'chirilgan"}
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					<div className='space-y-6'>
						<Card className='shadow-sm hover:shadow-md transition-shadow border-border/50 flex flex-col h-[520px] bg-background/60 backdrop-blur-xl'>
							<CardHeader className='border-b bg-muted/20 pb-5'>
								<CardTitle className='text-xl font-bold flex items-center gap-2'>
									<History className='h-5 w-5 text-primary' /> To'lovlar tarixi
								</CardTitle>
							</CardHeader>
							<CardContent className='flex-1 overflow-y-auto p-0'>
								{debt.history && debt.history.length > 0 ? (
									<div className='p-6 space-y-6'>
										{debt.history.map((item, index) => (
											<div
												key={item._id || index}
												className='flex gap-4 relative group'
											>
												{index !== debt.history.length - 1 && (
													<div className='absolute left-[13px] top-8 bottom-[-24px] w-[2px] bg-border/60 group-hover:bg-primary/30 transition-colors' />
												)}
												<div className='relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 ring-4 ring-background dark:bg-green-900/40 transition-transform group-hover:scale-110'>
													<CheckCircle2 className='h-4 w-4 text-green-600 dark:text-green-500' />
												</div>
												<div className='flex-1 pt-0.5 pb-2'>
													<p className='font-bold text-lg text-foreground'>
														{formatMoney(item.amount, debt.currency)}
													</p>
													<p className='text-xs font-semibold text-muted-foreground mt-0.5'>
														{format(new Date(item.date), 'dd MMMM, HH:mm', {
															locale: uz,
														})}
													</p>
													{item.note && (
														<div className='mt-3 text-sm text-muted-foreground bg-muted/40 p-3 rounded-xl border border-border/50 italic font-medium'>
															"{item.note}"
														</div>
													)}
												</div>
											</div>
										))}
									</div>
								) : (
									<div className='flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground'>
										<History className='size-14 mb-4 opacity-20' />
										<p className='text-base font-semibold'>
											Hali hech qanday to'lov qilinmagan
										</p>
									</div>
								)}
							</CardContent>

							{debt.status !== 'paid' && (
								<div className='p-5 border-t bg-muted/10 backdrop-blur-sm'>
									<Button
										className='w-full gap-2 rounded-xl h-12 text-base font-bold shadow-md hover:shadow-lg transition-all'
										onClick={() =>
											router.push(`/debts/${debt._id || debt.id}/pay`)
										}
									>
										<BanknoteIcon className='h-5 w-5' /> Qarzni to'lash
									</Button>
								</div>
							)}
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
									Qarzni o'chirish
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</main>
		</div>
	)
}
