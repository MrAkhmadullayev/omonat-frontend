'use client'

import { format } from 'date-fns'
import { uz } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import useSWR from 'swr'

import { useUser } from '@/hooks/useUser'
import { debtApi } from '@/lib/api'
import { PAGE_VARIANTS } from '@/lib/constants'
import { formatMoney } from '@/lib/formatters'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'

import {
	AlertCircle,
	ArrowLeft,
	Banknote,
	CalendarIcon,
	CheckCircle2,
	Loader2,
	Wallet,
} from 'lucide-react'

export default function PayDebtPage() {
	const { id } = useParams()
	const router = useRouter()
	const { user, isLoading: userLoading, isError } = useUser()
	const [isPending, startTransition] = useTransition()

	const [payAmount, setPayAmount] = useState('')
	const [date, setDate] = useState(new Date())
	const [isSubmitting, setIsSubmitting] = useState(false)

	const {
		data: debt,
		error: debtError,
		isLoading: debtLoading,
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

	if (userLoading || debtLoading || !user) {
		return (
			<div className='min-h-screen bg-muted/20 flex flex-col font-sans pb-24'>
				<main className='flex-1 w-full max-w-2xl mx-auto p-4 md:p-8'>
					<div className='flex items-center gap-4 mb-6'>
						<Skeleton className='h-9 w-9 rounded-lg' />
						<div>
							<Skeleton className='h-6 w-32 mb-1.5' />
							<Skeleton className='h-3 w-48' />
						</div>
					</div>
					<Card className='border-border/50 bg-background/60 shadow-sm rounded-xl overflow-hidden'>
						<div className='bg-primary/5 border-b border-primary/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
							<div className='space-y-2'>
								<Skeleton className='h-3 w-40' />
								<Skeleton className='h-8 w-32' />
							</div>
							<Skeleton className='h-9 w-24 rounded-lg' />
						</div>
						<CardContent className='p-5 sm:p-6 space-y-6'>
							<div className='space-y-2'>
								<Skeleton className='h-4 w-32' />
								<Skeleton className='h-12 w-full rounded-lg' />
							</div>
							<div className='space-y-2'>
								<Skeleton className='h-4 w-24' />
								<Skeleton className='h-11 w-full rounded-lg' />
							</div>
							<div className='space-y-2'>
								<Skeleton className='h-4 w-16' />
								<Skeleton className='h-20 w-full rounded-lg' />
							</div>
						</CardContent>
						<CardFooter className='border-t border-border/50 p-5 justify-end gap-3'>
							<Skeleton className='h-10 w-24 rounded-lg' />
							<Skeleton className='h-10 w-32 rounded-lg' />
						</CardFooter>
					</Card>
				</main>
			</div>
		)
	}

	if (debtError || !debt) {
		return (
			<div className='flex flex-1 flex-col items-center justify-center p-6 text-center min-h-[60vh]'>
				<div className='w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 ring-8 ring-red-50'>
					<AlertCircle className='w-8 h-8' />
				</div>
				<h2 className='text-xl font-bold mb-2 text-foreground'>
					Ma'lumot topilmadi
				</h2>
				<p className='text-muted-foreground mb-6'>
					Kechirasiz, siz qidirayotgan qarz ma'lumoti topilmadi.
				</p>
				<Button
					variant='outline'
					onClick={() => navigate('/debts')}
					className='rounded-xl font-semibold px-8'
					disabled={isPending}
				>
					{isPending ? (
						<Loader2 className='h-4 w-4 mr-2 animate-spin' />
					) : (
						<ArrowLeft className='h-4 w-4 mr-2' />
					)}
					Orqaga qaytish
				</Button>
			</div>
		)
	}

	const remainingAmount = debt.amount - debt.paidAmount

	const handlePayFullRemaining = () => {
		setPayAmount(remainingAmount.toLocaleString('ru-RU').replace(/,/g, ' '))
	}

	const handleAmountChange = e => {
		let value = e.target.value.replace(/\D/g, '')
		if (value) {
			if (Number(value) > remainingAmount) {
				value = remainingAmount.toString()
				toast.info("Qoldiqdan ortiqcha to'lay olmaysiz", {
					duration: 3000,
					style: {
						background: '#fffbeb',
						color: '#b45309',
						border: '1px solid #fde68a',
					},
				})
			}
			setPayAmount(
				parseInt(value, 10).toLocaleString('ru-RU').replace(/,/g, ' '),
			)
		} else {
			setPayAmount('')
		}
	}

	const handleSubmit = async e => {
		e.preventDefault()
		setIsSubmitting(true)

		const formData = new FormData(e.currentTarget)
		const rawAmount = Number(payAmount.replace(/\s/g, ''))

		const paymentData = {
			amount: rawAmount,
			date: date.toISOString(),
			note: formData.get('note'),
		}

		try {
			if (paymentData.amount <= 0) {
				throw new Error("To'lov summasi noldan katta bo'lishi kerak")
			}

			await debtApi.pay(id, paymentData)

			toast.success("To'lov muvaffaqiyatli qabul qilindi!", {
				position: 'top-center',
				style: {
					background: '#ecfdf5',
					color: '#16a34a',
					border: '1px solid #6ee7b7',
				},
			})

			navigate(`/debts/${id}`)
		} catch (error) {
			toast.error(error.message || 'Xatolik yuz berdi', {
				position: 'top-center',
				style: {
					background: '#fee2e2',
					color: '#dc2626',
					border: '1px solid #f87171',
				},
			})
			setIsSubmitting(false)
		}
	}

	return (
		<div className='min-h-screen bg-muted/20 flex flex-col font-sans pb-24'>
			<motion.main
				initial='hidden'
				animate='show'
				variants={PAGE_VARIANTS}
				className='flex-1 w-full max-w-2xl mx-auto p-4 md:p-8'
			>
				<div className='flex items-center gap-4 mb-6'>
					<Button
						variant='outline'
						size='icon'
						className='rounded-lg shadow-sm hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors h-9 w-9'
						onClick={() => navigate(`/debts/${id}`)}
						disabled={isPending || isSubmitting}
					>
						{isPending ? (
							<Loader2 className='h-4 w-4 animate-spin' />
						) : (
							<ArrowLeft className='h-4 w-4' />
						)}
					</Button>
					<div>
						<h1 className='text-xl md:text-2xl font-bold tracking-tight text-foreground'>
							Qarzni uzish
						</h1>
						<p className='text-xs md:text-sm text-muted-foreground font-medium mt-0.5 uppercase tracking-wider'>
							{debt.creditorName} ga to'lov qilish
						</p>
					</div>
				</div>

				<Card className='shadow-sm hover:shadow-md transition-shadow duration-300 border-border/50 bg-background/80 backdrop-blur-xl overflow-hidden rounded-xl'>
					<form onSubmit={handleSubmit}>
						<div className='bg-primary/5 dark:bg-primary/10 border-b border-primary/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
							<div className='space-y-1'>
								<p className='text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5'>
									<Wallet className='h-3.5 w-3.5 text-primary' /> To'lanishi
									kerak bo'lgan qoldiq
								</p>
								<p className='text-2xl md:text-3xl font-black text-primary tracking-tight'>
									{formatMoney(remainingAmount, debt.currency)}
								</p>
							</div>
							<Button
								type='button'
								variant='outline'
								size='sm'
								className='rounded-lg border-primary/30 text-primary hover:bg-primary/10 font-bold tracking-wide shadow-sm h-9 px-4'
								onClick={handlePayFullRemaining}
								disabled={isSubmitting || isPending}
							>
								To'liq uzish
							</Button>
						</div>

						<CardContent className='p-5 sm:p-6 space-y-5 sm:space-y-6'>
							<div className='grid gap-2.5'>
								<Label
									htmlFor='payAmount'
									className='text-sm font-bold text-foreground'
								>
									Qancha to'layapsiz? <span className='text-red-500'>*</span>
								</Label>
								<div className='relative group'>
									<div className='absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-green-600 transition-colors'>
										<Banknote className='h-5 w-5' />
									</div>
									<Input
										id='payAmount'
										value={payAmount}
										onChange={handleAmountChange}
										placeholder='Masalan: 500 000'
										className='h-12 pl-11 pr-16 text-lg font-black text-green-600 rounded-lg border-border/50 shadow-sm transition-all focus-visible:ring-green-500 focus-visible:border-green-500 bg-background/50'
										required
										disabled={isSubmitting || isPending}
									/>
									<div className='absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-muted-foreground uppercase tracking-wider'>
										{debt.currency}
									</div>
								</div>
							</div>

							<div className='grid gap-2.5'>
								<Label className='text-sm font-bold text-foreground'>
									To'lov sanasi <span className='text-red-500'>*</span>
								</Label>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant='outline'
											className={cn(
												'w-full h-11 justify-start text-left font-medium rounded-lg border-border/50 shadow-sm bg-background/50 hover:bg-muted',
												!date && 'text-muted-foreground',
											)}
											disabled={isSubmitting || isPending}
										>
											<CalendarIcon className='mr-2.5 h-4 w-4 opacity-70' />
											{date ? (
												format(date, 'PPP', { locale: uz })
											) : (
												<span>Sana tanlang</span>
											)}
										</Button>
									</PopoverTrigger>
									<PopoverContent
										className='w-auto p-0 rounded-xl shadow-xl border-border/50'
										align='start'
									>
										<Calendar
											mode='single'
											selected={date}
											onSelect={day => day && setDate(day)}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
							</div>

							<div className='grid gap-2.5'>
								<Label
									htmlFor='note'
									className='text-sm font-bold text-foreground'
								>
									Izoh (Ixtiyoriy)
								</Label>
								<Textarea
									id='note'
									name='note'
									placeholder='Masalan: Plastik kartadan tashlab berdim...'
									rows={3}
									disabled={isSubmitting || isPending}
									className='resize-none text-sm p-3 rounded-lg border-border/50 shadow-sm bg-background/50 focus-visible:ring-primary/50'
								/>
							</div>
						</CardContent>

						<CardFooter className='flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-border/50 p-4 sm:p-5 bg-muted/5 backdrop-blur-sm rounded-b-xl'>
							<Button
								type='button'
								variant='ghost'
								className='w-full sm:w-auto h-10 rounded-lg font-semibold hover:bg-muted text-muted-foreground transition-colors'
								onClick={() => navigate(`/debts/${id}`)}
								disabled={isSubmitting || isPending}
							>
								Bekor qilish
							</Button>
							<Button
								type='submit'
								disabled={isSubmitting || !payAmount || isPending}
								className='w-full sm:w-auto h-10 px-6 rounded-lg font-bold tracking-wide gap-2 bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md transition-all active:scale-95'
							>
								{isSubmitting ? (
									<Loader2 className='h-4 w-4 animate-spin' />
								) : (
									<CheckCircle2 className='h-4 w-4' />
								)}
								{isSubmitting ? "To'lanmoqda..." : 'Tasdiqlash'}
							</Button>
						</CardFooter>
					</form>
				</Card>
			</motion.main>
		</div>
	)
}
