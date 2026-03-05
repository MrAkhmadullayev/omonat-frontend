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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useUser } from '@/hooks/useUser'
import { debtApi } from '@/lib/api'
import { CONTAINER_VARIANTS, ITEM_VARIANTS } from '@/lib/constants'
import { formatCardNumber, formatMoney } from '@/lib/formatters'
import { format } from 'date-fns'
import { uz } from 'date-fns/locale'
import { motion } from 'framer-motion'
import {
	AlertCircle,
	ArrowLeft,
	BanknoteIcon,
	BellRing,
	CalendarClock,
	CheckCircle2,
	CreditCard,
	History,
	Loader2,
	Trash2,
	User,
	Wallet,
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import useSWR from 'swr'

export default function DebtDetailsPage() {
	const { id } = useParams()
	const router = useRouter()
	const { user, isLoading: userLoading, isError } = useUser()
	const [isPending, startTransition] = useTransition()

	const [isDeleting, setIsDeleting] = useState(false)
	const [isHistoryDeleting, setIsHistoryDeleting] = useState(false)
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
	const [isHistoryDeleteDialogOpen, setIsHistoryDeleteDialogOpen] =
		useState(false)
	const [historyIdToDelete, setHistoryIdToDelete] = useState(null)

	const {
		data: debt,
		error: debtError,
		isLoading: debtLoading,
		mutate,
	} = useSWR(user && id ? `/debts/${id}` : null, () => debtApi.getById(id), {
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

	const handleDelete = async () => {
		try {
			setIsDeleting(true)
			setIsDeleteDialogOpen(false)
			await debtApi.delete(id)
			toast.success("Qarz muvaffaqiyatli o'chirildi")
			navigate('/debts')
		} catch (error) {
			toast.error(error.message || "O'chirishda xatolik yuz berdi")
			setIsDeleting(false)
		}
	}

	const handleDeleteHistory = async () => {
		if (!historyIdToDelete) return
		try {
			setIsHistoryDeleting(true)
			setIsHistoryDeleteDialogOpen(false)
			await debtApi.deleteHistory(id, historyIdToDelete)
			toast.success("To'lov muvaffaqiyatli o'chirildi")
			mutate()
		} catch (error) {
			toast.error(error.message || "O'chirishda xatolik yuz berdi")
		} finally {
			setIsHistoryDeleting(false)
			setHistoryIdToDelete(null)
		}
	}

	if (isError) return null

	if (userLoading || debtLoading || isDeleting) {
		return (
			<div className='min-h-screen bg-muted/20 flex flex-col font-sans pb-24'>
				<main className='flex-1 w-full max-w-6xl mx-auto p-4 md:p-8'>
					<div className='flex items-center gap-4 mb-8'>
						<Skeleton className='h-10 w-10 rounded-xl' />
						<div>
							<Skeleton className='h-8 w-48 mb-2' />
							<Skeleton className='h-4 w-32' />
						</div>
					</div>
					<div className='grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8'>
						<div className='lg:col-span-2 space-y-6'>
							<Card className='border-border/50 bg-background/60 shadow-sm rounded-2xl'>
								<CardHeader className='pb-6'>
									<Skeleton className='h-10 w-3/4 mb-2' />
									<Skeleton className='h-4 w-1/2' />
								</CardHeader>
								<CardContent>
									<div className='grid grid-cols-2 md:grid-cols-3 gap-6 mb-8'>
										<Skeleton className='h-24 w-full rounded-2xl' />
										<Skeleton className='h-24 w-full rounded-2xl' />
										<Skeleton className='h-24 w-full rounded-2xl col-span-2 md:col-span-1' />
									</div>
									<Skeleton className='h-3 w-full rounded-full' />
								</CardContent>
							</Card>
							<Card className='border-border/50 bg-background/60 shadow-sm rounded-2xl'>
								<CardHeader>
									<Skeleton className='h-6 w-48' />
								</CardHeader>
								<CardContent className='space-y-8'>
									<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
										<Skeleton className='h-20 w-full rounded-2xl' />
										<Skeleton className='h-20 w-full rounded-2xl' />
									</div>
									<Separator />
									<Skeleton className='h-24 w-full rounded-2xl' />
									<Separator />
									<Skeleton className='h-32 w-full rounded-xl' />
								</CardContent>
							</Card>
						</div>
						<div className='space-y-6'>
							<Card className='border-border/50 bg-background/60 shadow-sm rounded-2xl h-[520px]'>
								<CardHeader>
									<Skeleton className='h-6 w-40' />
								</CardHeader>
								<CardContent className='space-y-6'>
									<Skeleton className='h-16 w-full rounded-xl' />
									<Skeleton className='h-16 w-full rounded-xl' />
									<Skeleton className='h-16 w-full rounded-xl' />
								</CardContent>
							</Card>
							<Skeleton className='h-14 w-full rounded-2xl' />
						</div>
					</div>
				</main>
			</div>
		)
	}

	if (debtError || !debt) {
		return (
			<div className='flex h-screen flex-col items-center justify-center bg-muted/20 gap-4'>
				<AlertCircle className='size-12 text-muted-foreground/50' />
				<div className='text-xl font-extrabold text-foreground tracking-tight'>
					Ma'lumot topilmadi
				</div>
				<Button
					variant='outline'
					onClick={() => navigate('/debts')}
					className='mt-2 rounded-xl font-semibold'
					disabled={isPending}
				>
					{isPending ? (
						<Loader2 className='h-4 w-4 animate-spin mr-2' />
					) : (
						<ArrowLeft className='h-4 w-4 mr-2' />
					)}
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
					<Badge className='bg-green-500/10 text-green-600 hover:bg-green-500/20 border-none text-sm py-1.5 px-4 shadow-none font-bold'>
						To'liq yopilgan
					</Badge>
				)
			case 'partial':
				return (
					<Badge className='bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-none text-sm py-1.5 px-4 shadow-none font-bold'>
						Qisman to'langan
					</Badge>
				)
			case 'pending':
				return (
					<Badge className='bg-red-500/10 text-red-600 hover:bg-red-500/20 border-none text-sm py-1.5 px-4 shadow-none font-bold'>
						To'lanmagan
					</Badge>
				)
			default:
				return null
		}
	}

	return (
		<div className='min-h-screen bg-muted/20 flex flex-col font-sans pb-24'>
			<motion.main
				initial='hidden'
				animate='show'
				variants={CONTAINER_VARIANTS}
				className='flex-1 w-full max-w-6xl mx-auto p-4 md:p-8'
			>
				<motion.div
					variants={ITEM_VARIANTS}
					className='flex items-center gap-4 mb-8'
				>
					<Button
						variant='outline'
						size='icon'
						className='rounded-xl shadow-sm hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all h-10 w-10'
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
							Qarz tafsilotlari
						</h1>
						<p className='text-xs md:text-sm text-muted-foreground font-medium mt-1 uppercase tracking-wider'>
							ID: {debt._id || debt.id}
						</p>
					</div>
				</motion.div>

				<div className='grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8'>
					<div className='lg:col-span-2 space-y-6'>
						<motion.div variants={ITEM_VARIANTS}>
							<Card className='shadow-sm hover:shadow-md transition-all duration-300 bg-background/80 backdrop-blur-xl border-border/50 rounded-2xl overflow-hidden'>
								<CardHeader className='flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 bg-muted/10'>
									<div>
										<CardTitle className='text-3xl md:text-4xl font-black capitalize tracking-tight text-foreground'>
											{debt.creditorName}
										</CardTitle>
										<CardDescription className='flex items-center gap-2 mt-2.5 text-sm font-semibold text-muted-foreground'>
											<User className='h-4.5 w-4.5' /> Kreditor (Kimga berish
											kerak)
										</CardDescription>
									</div>
									<div>{getStatusBadge(debt.status)}</div>
								</CardHeader>
								<CardContent className='pt-6'>
									<div className='grid grid-cols-2 md:grid-cols-3 gap-4 mb-8'>
										<div className='space-y-1.5 p-4 rounded-2xl bg-muted/30 border border-border/50 hover:border-primary/20 transition-colors'>
											<p className='text-[11px] font-bold text-muted-foreground uppercase tracking-wider'>
												Jami qarz
											</p>
											<p className='text-xl md:text-2xl font-black text-foreground tracking-tight'>
												{formatMoney(debt.amount, debt.currency)}
											</p>
										</div>
										<div className='space-y-1.5 p-4 rounded-2xl bg-green-50/50 dark:bg-green-950/20 border border-green-100 dark:border-green-900 hover:border-green-200 dark:hover:border-green-800 transition-colors'>
											<p className='text-[11px] font-bold text-green-700/70 dark:text-green-500/70 uppercase tracking-wider'>
												To'landi
											</p>
											<p className='text-xl md:text-2xl font-black text-green-600 tracking-tight'>
												{formatMoney(debt.paidAmount, debt.currency)}
											</p>
										</div>
										<div className='col-span-2 md:col-span-1 space-y-1.5 p-4 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900 hover:border-red-200 dark:hover:border-red-800 transition-colors'>
											<p className='text-[11px] font-bold text-red-700/70 dark:text-red-500/70 uppercase tracking-wider'>
												Qoldiq
											</p>
											<p className='text-2xl md:text-3xl font-black text-red-600 tracking-tight drop-shadow-sm'>
												{formatMoney(remainingAmount, debt.currency)}
											</p>
										</div>
									</div>

									<div className='space-y-3 px-2'>
										<div className='flex justify-between text-sm'>
											<span className='font-bold text-muted-foreground'>
												To'lov jarayoni
											</span>
											<span className='font-black text-primary'>
												{progressPercentage}%
											</span>
										</div>
										<div className='h-3 w-full bg-muted rounded-full overflow-hidden'>
											<motion.div
												initial={{ width: 0 }}
												animate={{ width: `${progressPercentage}%` }}
												transition={{ duration: 1, ease: 'easeOut' }}
												className='h-full bg-primary rounded-full'
											/>
										</div>
									</div>
								</CardContent>
							</Card>
						</motion.div>

						<motion.div variants={ITEM_VARIANTS}>
							<Card className='shadow-sm hover:shadow-md transition-shadow border-border/50 bg-background/80 backdrop-blur-xl rounded-2xl'>
								<CardHeader className='pb-4 border-b border-border/50'>
									<CardTitle className='text-lg md:text-xl font-extrabold'>
										Qo'shimcha ma'lumotlar
									</CardTitle>
								</CardHeader>
								<CardContent className='space-y-6 pt-6'>
									<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
										<div className='flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50 transition-colors hover:bg-muted/50'>
											<div className='p-3 bg-background rounded-xl shadow-sm border border-border/50'>
												<CalendarClock className='h-5 w-5 text-primary' />
											</div>
											<div>
												<p className='text-xs font-bold text-muted-foreground mb-0.5 uppercase tracking-wider'>
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
										<div className='flex items-center gap-4 p-4 rounded-2xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/50 transition-colors hover:bg-orange-100/50 dark:hover:bg-orange-900/30'>
											<div className='p-3 bg-background rounded-xl shadow-sm border border-orange-100 dark:border-orange-900'>
												<CalendarClock className='h-5 w-5 text-orange-500' />
											</div>
											<div>
												<p className='text-xs font-bold text-orange-700/80 dark:text-orange-500/80 mb-0.5 uppercase tracking-wider'>
													Qaytarish muddati
												</p>
												<p className='text-base font-bold text-orange-600'>
													{format(new Date(debt.dueDate), 'dd MMMM, yyyy', {
														locale: uz,
													})}
												</p>
											</div>
										</div>
									</div>

									<Separator className='opacity-50' />

									<div className='space-y-3'>
										<h3 className='text-xs font-bold text-muted-foreground uppercase tracking-wider'>
											To'lov usuli
										</h3>
										{debt.paymentMethod === 'cash' ? (
											<div className='inline-flex items-center gap-3 text-sm font-bold p-4 rounded-2xl bg-green-50/50 text-green-700 border border-green-200 dark:bg-green-950/30 dark:border-green-900 dark:text-green-400'>
												<Wallet className='h-5 w-5' /> Naqd pul orqali
											</div>
										) : (
											<div className='relative overflow-hidden p-6 md:p-8 rounded-3xl bg-gradient-to-tr from-slate-950 via-slate-800 to-slate-900 text-white shadow-xl w-full max-w-sm transition-transform hover:scale-[1.02] duration-300'>
												<div className='absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10' />
												<div className='absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -ml-10 -mb-10' />
												<div className='flex justify-between items-start relative z-10 mb-8'>
													<CreditCard className='h-8 w-8 text-white/90' />
													<span className='text-[10px] font-black tracking-[0.25em] text-white/50 uppercase'>
														Karta
													</span>
												</div>
												<div className='relative z-10 mb-6'>
													<p className='text-xl md:text-2xl font-mono tracking-[0.2em] text-white/95 drop-shadow-md'>
														{formatCardNumber(debt.cardNumber)}
													</p>
												</div>
												<div className='flex justify-between items-end relative z-10'>
													<div className='flex flex-col'>
														<span className='text-[9px] font-bold uppercase tracking-[0.15em] text-white/50 mb-1'>
															Karta egasi
														</span>
														<span className='text-sm font-extrabold tracking-widest text-white/90 uppercase drop-shadow-sm'>
															{debt.cardHolder || "KO'RSATILMAGAN"}
														</span>
													</div>
												</div>
											</div>
										)}
									</div>

									<Separator className='opacity-50' />

									<div className='space-y-4'>
										<div>
											<h3 className='text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2'>
												Izoh
											</h3>
											<div className='text-sm text-foreground bg-muted/30 p-4 rounded-xl border border-border/50 leading-relaxed font-medium'>
												{debt.description ? (
													<span>{debt.description}</span>
												) : (
													<span className='italic text-muted-foreground'>
														Izoh kiritilmagan.
													</span>
												)}
											</div>
										</div>

										<div
											className={`inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-full border transition-colors ${debt.isReminderEnabled ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground border-border/50'}`}
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
						</motion.div>
					</div>

					<div className='space-y-6'>
						<motion.div variants={ITEM_VARIANTS} className='h-[520px]'>
							<Card className='shadow-sm hover:shadow-md transition-shadow border-border/50 flex flex-col h-full bg-background/80 backdrop-blur-xl rounded-2xl'>
								<CardHeader className='border-b border-border/50 pb-4'>
									<CardTitle className='text-lg font-extrabold flex items-center gap-2'>
										<History className='h-5 w-5 text-primary' /> To'lovlar
										tarixi
									</CardTitle>
								</CardHeader>
								<CardContent className='flex-1 overflow-y-auto p-0 relative'>
									{debt.history && debt.history.length > 0 ? (
										<div className='p-6 space-y-6'>
											{debt.history.map((item, index) => (
												<div
													key={item._id || index}
													className='flex gap-4 relative group'
												>
													{index !== debt.history.length - 1 && (
														<div className='absolute left-[13px] top-8 bottom-[-24px] w-[2px] bg-border/80 group-hover:bg-primary/40 transition-colors' />
													)}
													<div className='relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 ring-4 ring-background dark:bg-green-900/40 transition-transform group-hover:scale-110'>
														<CheckCircle2 className='h-4 w-4 text-green-600 dark:text-green-500' />
													</div>
													<div className='flex-1 pt-0.5 pb-2'>
														<div className='flex items-start justify-between'>
															<div>
																<p className='font-black text-lg text-foreground tracking-tight'>
																	{formatMoney(item.amount, debt.currency)}
																</p>
																<p className='text-[11px] font-bold text-muted-foreground mt-1 uppercase tracking-wider'>
																	{format(
																		new Date(item.date),
																		'dd MMMM, HH:mm',
																		{ locale: uz },
																	)}
																</p>
															</div>
															<Button
																variant='ghost'
																size='icon'
																className='h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors'
																onClick={() => {
																	setHistoryIdToDelete(item._id)
																	setIsHistoryDeleteDialogOpen(true)
																}}
																disabled={isHistoryDeleting}
															>
																<Trash2 className='h-4 w-4' />
															</Button>
														</div>
														{item.note && (
															<div className='mt-3 text-sm text-muted-foreground bg-muted/40 p-3 rounded-xl border border-border/50 font-medium'>
																"{item.note}"
															</div>
														)}
													</div>
												</div>
											))}
										</div>
									) : (
										<div className='flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground'>
											<History className='size-12 mb-3 opacity-20' />
											<p className='text-sm font-bold'>
												Hali to'lov qilinmagan
											</p>
										</div>
									)}
								</CardContent>

								{debt.status !== 'paid' && (
									<div className='p-4 border-t border-border/50 bg-muted/10 backdrop-blur-sm'>
										<Button
											className='w-full gap-2 rounded-xl h-12 text-base font-bold shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95'
											onClick={() =>
												navigate(`/debts/${debt._id || debt.id}/pay`)
											}
											disabled={isPending}
										>
											{isPending ? (
												<Loader2 className='h-5 w-5 animate-spin' />
											) : (
												<BanknoteIcon className='h-5 w-5' />
											)}
											Qarzni to'lash
										</Button>
									</div>
								)}
							</Card>
						</motion.div>

						<motion.div variants={ITEM_VARIANTS}>
							<Card className='border-red-200/50 bg-red-50/30 dark:border-red-900/30 dark:bg-red-950/10 shadow-sm transition-colors hover:bg-red-50/80 dark:hover:bg-red-950/20 rounded-2xl'>
								<CardContent className='p-4'>
									<Button
										variant='destructive'
										className='w-full rounded-xl font-bold tracking-wide h-12 text-base shadow-sm hover:shadow-md transition-all'
										onClick={() => setIsDeleteDialogOpen(true)}
										disabled={isDeleting}
									>
										{isDeleting ? (
											<Loader2 className='w-5 h-5 mr-2 animate-spin' />
										) : (
											<Trash2 className='w-5 h-5 mr-2' />
										)}
										Qarzni o'chirish
									</Button>
								</CardContent>
							</Card>
						</motion.div>
					</div>
				</div>
			</motion.main>

			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent className='sm:max-w-md rounded-3xl p-6'>
					<DialogHeader>
						<DialogTitle className='text-xl font-extrabold flex items-center gap-2 text-red-600'>
							<Trash2 className='h-5 w-5' /> Qarzni o'chirish
						</DialogTitle>
						<DialogDescription className='text-sm font-medium pt-3 leading-relaxed'>
							Haqiqatan ham{' '}
							<strong className='text-foreground'>{debt?.creditorName}</strong>{' '}
							uchun kiritilgan ushbu qarzni o'chirmoqchimisiz? Bu amalni ortga
							qaytarib bo'lmaydi.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className='mt-6 gap-3 sm:gap-0'>
						<Button
							variant='outline'
							onClick={() => setIsDeleteDialogOpen(false)}
							className='rounded-xl flex-1 h-11 font-bold'
						>
							Bekor qilish
						</Button>
						<Button
							variant='destructive'
							onClick={handleDelete}
							className='rounded-xl flex-1 h-11 font-bold'
							disabled={isDeleting}
						>
							{isDeleting ? (
								<Loader2 className='w-4 h-4 mr-2 animate-spin' />
							) : null}
							O'chirish
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog
				open={isHistoryDeleteDialogOpen}
				onOpenChange={setIsHistoryDeleteDialogOpen}
			>
				<DialogContent className='sm:max-w-md rounded-3xl p-6'>
					<DialogHeader>
						<DialogTitle className='text-xl font-extrabold flex items-center gap-2 text-red-600'>
							<History className='h-5 w-5' /> To'lovni o'chirish
						</DialogTitle>
						<DialogDescription className='text-sm font-medium pt-3 leading-relaxed'>
							Haqiqatan ham ushbu to'lovni tarixdan o'chirib tashlamoqchimisiz?
							Bu amal jami to'langan summani kamaytiradi va qoldiqni oshiradi.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className='mt-6 gap-3 sm:gap-0'>
						<Button
							variant='outline'
							onClick={() => {
								setIsHistoryDeleteDialogOpen(false)
								setHistoryIdToDelete(null)
							}}
							className='rounded-xl flex-1 h-11 font-bold'
						>
							Bekor qilish
						</Button>
						<Button
							variant='destructive'
							onClick={handleDeleteHistory}
							className='rounded-xl flex-1 h-11 font-bold'
							disabled={isHistoryDeleting}
						>
							{isHistoryDeleting ? (
								<Loader2 className='w-4 h-4 mr-2 animate-spin' />
							) : null}
							O'chirish
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
