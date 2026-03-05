'use client'

import { format } from 'date-fns'
import { uz } from 'date-fns/locale'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'

import { useUser } from '@/hooks/useUser'
import { debtApi } from '@/lib/api'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

import {
	ArrowLeft,
	Banknote,
	BellRing,
	CalendarIcon,
	CreditCard,
	Loader2,
	Save,
	Wallet,
} from 'lucide-react'

export default function AddDebtPage() {
	const router = useRouter()
	const { user, isLoading: userLoading, isError } = useUser()
	const [isPending, startTransition] = useTransition()

	const [isSubmitting, setIsSubmitting] = useState(false)
	const [currency, setCurrency] = useState('UZS')
	const [paymentMethod, setPaymentMethod] = useState('cash')
	const [enableReminder, setEnableReminder] = useState(true)

	const [dateTaken, setDateTaken] = useState(new Date())
	const [dueDate, setDueDate] = useState(null)
	const [cardNumber, setCardNumber] = useState('')
	const [cardHolder, setCardHolder] = useState('')

	useEffect(() => {
		if (isError) router.push('/authentication/login')
	}, [isError, router])

	const navigate = path => {
		startTransition(() => {
			router.push(path)
		})
	}

	const formatAmount = e => {
		let value = e.target.value.replace(/\D/g, '')
		if (value) {
			e.target.value = parseInt(value, 10)
				.toLocaleString('ru-RU')
				.replace(/,/g, ' ')
		}
	}

	const handleSubmit = async e => {
		e.preventDefault()

		if (!dueDate) {
			toast.error('Qaytarish muddatini tanlang!', {
				duration: 3000,
				style: {
					background: '#fee2e2',
					color: '#dc2626',
					border: '1px solid #f87171',
				},
			})
			return
		}

		setIsSubmitting(true)
		const formData = new FormData(e.currentTarget)

		const newDebtData = {
			creditorName: formData.get('creditorName'),
			amount: Number(formData.get('amount').replace(/\s/g, '')),
			currency: currency,
			paymentMethod: paymentMethod,
			dateTaken: dateTaken.toISOString(),
			dueDate: dueDate.toISOString(),
			description: formData.get('description'),
			isReminderEnabled: enableReminder,
			cardNumber:
				paymentMethod === 'card' && cardNumber
					? cardNumber.replace(/\s/g, '')
					: null,
			cardHolder: paymentMethod === 'card' && cardHolder ? cardHolder : null,
		}

		try {
			if (newDebtData.amount <= 0) {
				throw new Error("Qarz miqdori 0 dan katta bo'lishi kerak")
			}

			await debtApi.create(newDebtData)

			toast.success("Yangi qarz muvaffaqiyatli qo'shildi!", {
				position: 'top-center',
				style: {
					background: '#ecfdf5',
					color: '#16a34a',
					border: '1px solid #6ee7b7',
				},
			})

			navigate('/debts')
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

	if (userLoading || !user) {
		return (
			<div className='min-h-screen bg-muted/20 pb-24'>
				<main className='flex-1 w-full max-w-3xl mx-auto p-4 md:p-8'>
					<div className='flex items-center gap-4 mb-6'>
						<Skeleton className='h-9 w-9 rounded-lg' />
						<div>
							<Skeleton className='h-7 w-40 mb-1.5' />
							<Skeleton className='h-3.5 w-64' />
						</div>
					</div>
					<Card className='border-border/50 bg-background/60 shadow-sm rounded-xl'>
						<CardContent className='p-6 space-y-6'>
							<div className='space-y-2'>
								<Skeleton className='h-4 w-32' />
								<Skeleton className='h-10 w-full rounded-lg' />
							</div>
							<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
								<div className='md:col-span-2 space-y-2'>
									<Skeleton className='h-4 w-24' />
									<Skeleton className='h-11 w-full rounded-lg' />
								</div>
								<div className='space-y-2'>
									<Skeleton className='h-4 w-16' />
									<Skeleton className='h-11 w-full rounded-lg' />
								</div>
							</div>
							<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
								<Skeleton className='h-10 w-full rounded-lg' />
								<Skeleton className='h-10 w-full rounded-lg' />
								<Skeleton className='h-10 w-full rounded-lg' />
							</div>
							<div className='space-y-2'>
								<Skeleton className='h-4 w-32' />
								<Skeleton className='h-24 w-full rounded-lg' />
							</div>
						</CardContent>
					</Card>
				</main>
			</div>
		)
	}

	const containerVariants = {
		hidden: { opacity: 0, y: 15 },
		show: {
			opacity: 1,
			y: 0,
			transition: { type: 'spring', stiffness: 400, damping: 30 },
		},
	}

	return (
		<div className='min-h-screen bg-muted/20 flex flex-col font-sans pb-24'>
			<motion.main
				initial='hidden'
				animate='show'
				variants={containerVariants}
				className='flex-1 w-full max-w-3xl mx-auto p-4 md:p-8'
			>
				<div className='flex items-center gap-4 mb-6'>
					<Button
						variant='outline'
						size='icon'
						className='rounded-lg shadow-sm hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors h-9 w-9'
						onClick={() => navigate('/debts')}
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
							Yangi qarz qo'shish
						</h1>
						<p className='text-xs md:text-sm text-muted-foreground mt-0.5'>
							Boshqalarga berishim kerak bo'lgan pul haqida ma'lumot.
						</p>
					</div>
				</div>

				<Card className='shadow-sm hover:shadow-md transition-shadow duration-300 border-border/50 bg-background/80 backdrop-blur-xl overflow-hidden rounded-xl'>
					<form onSubmit={handleSubmit}>
						<CardContent className='p-5 sm:p-6 space-y-5 sm:space-y-6'>
							<div className='grid gap-2'>
								<Label
									htmlFor='creditorName'
									className='text-sm font-medium text-foreground'
								>
									Kimdan qarz oldingiz? <span className='text-red-500'>*</span>
								</Label>
								<Input
									id='creditorName'
									name='creditorName'
									placeholder="Ism yoki tashkilot (Masalan: Ali do'stim)"
									className='h-10 text-sm rounded-lg border-border/50 shadow-sm focus-visible:ring-primary/50 transition-colors bg-background/50'
									required
									disabled={isSubmitting || isPending}
								/>
							</div>

							<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
								<div className='md:col-span-2 grid gap-2'>
									<Label
										htmlFor='amount'
										className='text-sm font-medium text-foreground'
									>
										Qarz miqdori <span className='text-red-500'>*</span>
									</Label>
									<div className='relative group'>
										<div className='absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors'>
											<Banknote className='h-4.5 w-4.5' />
										</div>
										<Input
											id='amount'
											name='amount'
											placeholder='1 000 000'
											className='h-11 pl-10 text-base font-semibold rounded-lg border-border/50 shadow-sm transition-all focus-visible:ring-primary/50 bg-background/50'
											required
											disabled={isSubmitting || isPending}
											onInput={formatAmount}
										/>
									</div>
								</div>

								<div className='grid gap-2'>
									<Label className='text-sm font-medium text-foreground'>
										Valyuta
									</Label>
									<Select
										value={currency}
										onValueChange={setCurrency}
										disabled={isSubmitting || isPending}
									>
										<SelectTrigger className='h-11 text-sm font-medium rounded-lg border-border/50 shadow-sm focus:ring-primary/50 bg-background/50'>
											<SelectValue placeholder='Valyuta' />
										</SelectTrigger>
										<SelectContent className='rounded-lg shadow-lg border-border/50'>
											<SelectItem
												value='UZS'
												className='py-2.5 text-sm cursor-pointer'
											>
												So'm (UZS)
											</SelectItem>
											<SelectItem
												value='USD'
												className='py-2.5 text-sm cursor-pointer'
											>
												Dollar (USD)
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
								<div className='grid gap-2'>
									<Label className='text-sm font-medium text-foreground'>
										Olingan sana <span className='text-red-500'>*</span>
									</Label>
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant='outline'
												className={cn(
													'h-10 w-full justify-start text-left text-sm font-normal rounded-lg border-border/50 shadow-sm bg-background/50 hover:bg-muted',
													!dateTaken && 'text-muted-foreground',
												)}
												disabled={isSubmitting || isPending}
											>
												<CalendarIcon className='mr-2.5 h-4 w-4 opacity-70' />
												{dateTaken ? (
													format(dateTaken, 'dd MMM, yyyy', { locale: uz })
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
												selected={dateTaken}
												onSelect={day => day && setDateTaken(day)}
												initialFocus
											/>
										</PopoverContent>
									</Popover>
								</div>

								<div className='grid gap-2'>
									<Label className='text-sm font-medium text-foreground'>
										Qaytarish muddati <span className='text-red-500'>*</span>
									</Label>
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant='outline'
												className={cn(
													'h-10 w-full justify-start text-left text-sm font-normal rounded-lg border-border/50 shadow-sm',
													dueDate
														? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
														: 'bg-background/50 text-muted-foreground hover:bg-muted',
												)}
												disabled={isSubmitting || isPending}
											>
												<CalendarIcon
													className={cn(
														'mr-2.5 h-4 w-4',
														dueDate ? 'opacity-100' : 'opacity-70',
													)}
												/>
												{dueDate ? (
													format(dueDate, 'dd MMM, yyyy', { locale: uz })
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
												selected={dueDate}
												onSelect={setDueDate}
												initialFocus
											/>
										</PopoverContent>
									</Popover>
								</div>

								<div className='grid gap-2'>
									<Label className='text-sm font-medium text-foreground'>
										Qanday qaytariladi?
									</Label>
									<Select
										value={paymentMethod}
										onValueChange={setPaymentMethod}
										disabled={isSubmitting || isPending}
									>
										<SelectTrigger className='h-10 text-sm font-normal rounded-lg border-border/50 shadow-sm focus:ring-primary/50 bg-background/50'>
											<SelectValue placeholder="To'lov turi" />
										</SelectTrigger>
										<SelectContent className='rounded-lg shadow-lg border-border/50'>
											<SelectItem
												value='cash'
												className='py-2.5 cursor-pointer'
											>
												<div className='flex items-center gap-2 text-sm'>
													<Wallet className='h-4 w-4 text-green-600' /> Naqd pul
												</div>
											</SelectItem>
											<SelectItem
												value='card'
												className='py-2.5 cursor-pointer'
											>
												<div className='flex items-center gap-2 text-sm'>
													<CreditCard className='h-4 w-4 text-blue-600' /> Karta
													orqali
												</div>
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							<AnimatePresence>
								{paymentMethod === 'card' && (
									<motion.div
										initial={{ opacity: 0, height: 0, marginTop: 0 }}
										animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
										exit={{ opacity: 0, height: 0, marginTop: 0 }}
										className='grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-blue-100 rounded-xl bg-blue-50/30 overflow-hidden'
									>
										<div className='grid gap-2'>
											<Label
												htmlFor='cardNumber'
												className='text-xs font-medium text-blue-800'
											>
												Karta raqami (Ixtiyoriy)
											</Label>
											<Input
												id='cardNumber'
												name='cardNumber'
												placeholder='8600 1234 5678 9012'
												className='h-10 font-mono tracking-widest text-sm rounded-lg bg-background border-border/50 shadow-sm focus-visible:ring-blue-400'
												disabled={isSubmitting || isPending}
												value={cardNumber}
												onChange={e => {
													let val = e.target.value.replace(/\D/g, '')
													val = val.substring(0, 16)
													setCardNumber(val.match(/.{1,4}/g)?.join(' ') || val)
												}}
											/>
										</div>
										<div className='grid gap-2'>
											<Label
												htmlFor='cardHolder'
												className='text-xs font-medium text-blue-800'
											>
												Karta egasi (Ixtiyoriy)
											</Label>
											<Input
												id='cardHolder'
												name='cardHolder'
												placeholder='ALI VALIYEV'
												className='h-10 text-sm uppercase rounded-lg bg-background border-border/50 shadow-sm focus-visible:ring-blue-400'
												disabled={isSubmitting || isPending}
												value={cardHolder}
												onChange={e =>
													setCardHolder(e.target.value.toUpperCase())
												}
											/>
										</div>
									</motion.div>
								)}
							</AnimatePresence>

							<div className='grid gap-2'>
								<Label
									htmlFor='description'
									className='text-sm font-medium text-foreground'
								>
									Qo'shimcha izoh (Ixtiyoriy)
								</Label>
								<Textarea
									id='description'
									name='description'
									placeholder='Nimaga ishlatish uchun olindi yoki qaytarish shartlari...'
									rows={3}
									disabled={isSubmitting || isPending}
									className='resize-none text-sm p-3 rounded-lg border-border/50 shadow-sm focus-visible:ring-primary/50 bg-background/50'
								/>
							</div>

							<div className='flex flex-row items-center justify-between rounded-xl border border-border/50 p-4 bg-muted/20'>
								<div className='space-y-1 pr-4'>
									<Label
										className='text-sm font-medium flex items-center gap-2 text-foreground cursor-pointer'
										onClick={() =>
											!isSubmitting &&
											!isPending &&
											setEnableReminder(!enableReminder)
										}
									>
										<BellRing
											className={`h-4 w-4 transition-colors ${enableReminder ? 'text-primary' : 'text-muted-foreground'}`}
										/>
										Avtomatik eslatma
									</Label>
									<CardDescription className='text-xs'>
										Qaytarish muddati yaqinlashganda ogohlantirish beriladi.
									</CardDescription>
								</div>
								<Switch
									checked={enableReminder}
									onCheckedChange={setEnableReminder}
									disabled={isSubmitting || isPending}
									className='data-[state=checked]:bg-primary shadow-sm'
								/>
							</div>
						</CardContent>

						<CardFooter className='flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-border/50 p-4 sm:p-6 bg-muted/5 rounded-b-xl'>
							<Button
								type='button'
								variant='ghost'
								className='w-full sm:w-auto h-10 rounded-lg text-sm hover:bg-muted text-muted-foreground transition-colors'
								onClick={() => navigate('/debts')}
								disabled={isSubmitting || isPending}
							>
								Bekor qilish
							</Button>
							<Button
								type='submit'
								disabled={isSubmitting || isPending}
								className='w-full sm:w-auto h-10 px-6 rounded-lg text-sm font-medium gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all hover:shadow-md'
							>
								{isSubmitting ? (
									<Loader2 className='h-4 w-4 animate-spin' />
								) : (
									<Save className='h-4 w-4' />
								)}
								{isSubmitting ? 'Saqlanmoqda...' : 'Saqlash'}
							</Button>
						</CardFooter>
					</form>
				</Card>
			</motion.main>
		</div>
	)
}
