'use client'

import { format } from 'date-fns'
import { uz } from 'date-fns/locale'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { useUser } from '@/hooks/useUser'
import { debtApi } from '@/lib/api'
import { cn } from '@/lib/utils'

import Navbar from '@/components/Navbar'
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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

import {
	ArrowLeft,
	Banknote,
	BellRing,
	CalendarIcon,
	CreditCard,
	LoaderIcon,
	Save,
	Wallet,
} from 'lucide-react'

export default function EditDebtPage() {
	const { user, isLoading: userLoading, isError } = useUser()
	const router = useRouter()
	const { id } = useParams()

	const [isFetching, setIsFetching] = useState(true)
	const [isLoading, setIsLoading] = useState(false)

	const [creditorName, setCreditorName] = useState('')
	const [amount, setAmount] = useState('')
	const [currency, setCurrency] = useState('UZS')
	const [paymentMethod, setPaymentMethod] = useState('cash')
	const [enableReminder, setEnableReminder] = useState(true)

	const [dateTaken, setDateTaken] = useState(new Date())
	const [dueDate, setDueDate] = useState(null)
	const [cardNumber, setCardNumber] = useState('')
	const [cardHolder, setCardHolder] = useState('')
	const [description, setDescription] = useState('')

	useEffect(() => {
		if (isError) router.push('/authentication/login')
	}, [isError, router])

	useEffect(() => {
		const fetchDebt = async () => {
			if (!id) return
			try {
				const data = await debtApi.getById(id)

				setCreditorName(data.creditorName)
				setAmount(data.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '))
				setCurrency(data.currency)
				setPaymentMethod(data.paymentMethod)
				setDateTaken(new Date(data.dateTaken))
				setDueDate(data.dueDate ? new Date(data.dueDate) : null)
				setDescription(data.description || '')
				setEnableReminder(data.isReminderEnabled !== false)

				if (data.paymentMethod === 'card') {
					setCardNumber(
						data.cardNumber?.replace(/(.{4})/g, '$1 ')?.trim() || '',
					)
					setCardHolder(data.cardHolder || '')
				}
			} catch (error) {
				toast.error("Ma'lumotlarni yuklashda xatolik", {
					style: { background: '#DC2626', color: '#fff' },
				})
				router.push('/debts')
			} finally {
				setIsFetching(false)
			}
		}

		if (user && !userLoading) {
			fetchDebt()
		}
	}, [id, user, userLoading, router])

	if (isError) return null

	if (userLoading || isFetching || !user) {
		return (
			<div className='flex h-screen flex-col items-center justify-center bg-muted/20 gap-4'>
				<LoaderIcon className='size-10 animate-spin text-primary' />
				<p className='text-lg font-medium text-muted-foreground animate-pulse'>
					Ma'lumotlar yuklanmoqda...
				</p>
			</div>
		)
	}

	const formatAmount = e => {
		let value = e.target.value.replace(/\D/g, '')
		if (value) {
			setAmount(parseInt(value, 10).toLocaleString('ru-RU').replace(/,/g, ' '))
		} else {
			setAmount('')
		}
	}

	const handleSubmit = async e => {
		e.preventDefault()

		if (!dueDate) {
			toast.error('Qaytarish muddatini tanlang!', { duration: 3000 })
			return
		}

		setIsLoading(true)

		const updatedDebtData = {
			creditorName,
			amount: Number(amount.replace(/\s/g, '')),
			currency,
			paymentMethod,
			dateTaken: dateTaken.toISOString(),
			dueDate: dueDate.toISOString(),
			description,
			isReminderEnabled: enableReminder,
			cardNumber:
				paymentMethod === 'card' && cardNumber
					? cardNumber.replace(/\s/g, '')
					: null,
			cardHolder: paymentMethod === 'card' && cardHolder ? cardHolder : null,
		}

		try {
			if (updatedDebtData.amount <= 0) {
				throw new Error("Qarz miqdori noldan katta bo'lishi kerak")
			}

			await debtApi.update(id, updatedDebtData)

			toast.success('Qarz muvaffaqiyatli saqlandi!', {
				position: 'top-right',
				style: { background: '#16A34A', color: '#fff' },
			})

			router.push('/debts')
		} catch (error) {
			toast.error(error.message || 'Xatolik yuz berdi', {
				position: 'top-right',
				style: { background: '#DC2626', color: '#fff' },
			})
			setIsLoading(false)
		}
	}

	return (
		<div className='min-h-screen bg-muted/20 flex flex-col font-sans'>
			<Navbar user={user} />

			<main className='flex-1 w-full max-w-4xl mx-auto p-4 md:p-8'>
				<div className='flex items-center gap-4 mb-8'>
					<Button
						variant='outline'
						size='icon'
						className='rounded-xl shadow-sm hover:bg-muted transition-colors h-10 w-10'
						onClick={() => router.push('/debts')}
					>
						<ArrowLeft className='h-5 w-5' />
					</Button>
					<div>
						<h1 className='text-2xl font-bold tracking-tight text-foreground'>
							Qarzni tahrirlash
						</h1>
						<p className='text-sm text-muted-foreground font-medium mt-1'>
							Kiritilgan ma'lumotlarni o'zgartirishingiz mumkin.
						</p>
					</div>
				</div>

				<Card className='shadow-lg hover:shadow-xl transition-shadow duration-300 border-border/50 bg-background/60 backdrop-blur-xl overflow-hidden rounded-2xl'>
					<form onSubmit={handleSubmit}>
						<CardContent className='p-6 sm:p-8 space-y-8'>
							<div className='grid gap-3'>
								<Label
									htmlFor='creditorName'
									className='text-sm font-bold text-foreground'
								>
									Kimdan qarz oldingiz? <span className='text-red-500'>*</span>
								</Label>
								<Input
									id='creditorName'
									name='creditorName'
									placeholder="Ism yoki Tashkilot (Masalan: Ali do'stim)"
									className='h-12 text-base font-semibold rounded-xl border-border/50 shadow-sm focus-visible:ring-primary'
									value={creditorName}
									onChange={e => setCreditorName(e.target.value)}
									required
									disabled={isLoading}
								/>
							</div>

							<div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
								<div className='md:col-span-2 grid gap-3'>
									<Label
										htmlFor='amount'
										className='text-sm font-bold text-foreground'
									>
										Qarz miqdori <span className='text-red-500'>*</span>
									</Label>
									<div className='relative group'>
										<div className='absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors'>
											<Banknote className='h-5 w-5' />
										</div>
										<Input
											id='amount'
											name='amount'
											placeholder='1 000 000'
											className='h-14 pl-12 text-xl font-black rounded-xl border-border/50 shadow-sm transition-all focus-visible:ring-primary'
											value={amount}
											onChange={formatAmount}
											required
											disabled={isLoading}
										/>
									</div>
								</div>

								<div className='grid gap-3'>
									<Label className='text-sm font-bold text-foreground'>
										Valyuta
									</Label>
									<Select
										value={currency}
										onValueChange={setCurrency}
										disabled={isLoading}
									>
										<SelectTrigger className='h-14 text-base font-bold rounded-xl border-border/50 shadow-sm focus:ring-primary'>
											<SelectValue placeholder='Valyuta' />
										</SelectTrigger>
										<SelectContent className='rounded-xl'>
											<SelectItem value='UZS' className='font-semibold py-3'>
												So'm (UZS)
											</SelectItem>
											<SelectItem value='USD' className='font-semibold py-3'>
												Dollar (USD)
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							<div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
								<div className='grid gap-3'>
									<Label className='text-sm font-bold text-foreground'>
										Olingan sana <span className='text-red-500'>*</span>
									</Label>
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant='outline'
												className={cn(
													'h-12 w-full justify-start text-left font-semibold rounded-xl border-border/50 shadow-sm',
													!dateTaken && 'text-muted-foreground',
												)}
												disabled={isLoading}
											>
												<CalendarIcon className='mr-3 h-4 w-4' />
												{dateTaken ? (
													format(dateTaken, 'dd MMM, yyyy', { locale: uz })
												) : (
													<span>Sana tanlang</span>
												)}
											</Button>
										</PopoverTrigger>
										<PopoverContent
											className='w-auto p-0 rounded-xl'
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

								<div className='grid gap-3'>
									<Label className='text-sm font-bold text-foreground'>
										Qaytarish muddati <span className='text-red-500'>*</span>
									</Label>
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant='outline'
												className={cn(
													'h-12 w-full justify-start text-left font-semibold rounded-xl border-border/50 shadow-sm border-orange-200/50 hover:bg-orange-50/50 dark:hover:bg-orange-900/20 text-orange-700 dark:text-orange-500',
													!dueDate && 'text-muted-foreground',
												)}
												disabled={isLoading}
											>
												<CalendarIcon className='mr-3 h-4 w-4' />
												{dueDate ? (
													format(dueDate, 'dd MMM, yyyy', { locale: uz })
												) : (
													<span>Sana tanlang</span>
												)}
											</Button>
										</PopoverTrigger>
										<PopoverContent
											className='w-auto p-0 rounded-xl'
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

								<div className='grid gap-3'>
									<Label className='text-sm font-bold text-foreground'>
										Qanday qaytariladi?
									</Label>
									<Select
										value={paymentMethod}
										onValueChange={setPaymentMethod}
										disabled={isLoading}
									>
										<SelectTrigger className='h-12 text-sm font-semibold rounded-xl border-border/50 shadow-sm'>
											<SelectValue placeholder="To'lov turi" />
										</SelectTrigger>
										<SelectContent className='rounded-xl'>
											<SelectItem value='cash' className='py-3'>
												<div className='flex items-center gap-2.5 font-semibold text-green-700 dark:text-green-500'>
													<Wallet className='h-4 w-4' /> Naqd pul
												</div>
											</SelectItem>
											<SelectItem value='card' className='py-3'>
												<div className='flex items-center gap-2.5 font-semibold text-blue-700 dark:text-blue-500'>
													<CreditCard className='h-4 w-4' /> Karta orqali
												</div>
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							{paymentMethod === 'card' && (
								<div className='grid grid-cols-1 md:grid-cols-2 gap-5 p-5 border border-blue-200/50 rounded-2xl bg-blue-50/30 dark:bg-blue-950/10 animate-in fade-in slide-in-from-top-4 duration-300'>
									<div className='grid gap-2.5'>
										<Label
											htmlFor='cardNumber'
											className='text-sm font-semibold text-blue-800 dark:text-blue-300'
										>
											Karta raqami (Ixtiyoriy)
										</Label>
										<Input
											id='cardNumber'
											name='cardNumber'
											placeholder='8600 1234 5678 9012'
											className='h-12 font-mono tracking-widest rounded-xl bg-background border-border/50 shadow-sm'
											disabled={isLoading}
											value={cardNumber}
											onChange={e => {
												let val = e.target.value.replace(/\D/g, '')
												val = val.substring(0, 16)
												setCardNumber(val.match(/.{1,4}/g)?.join(' ') || val)
											}}
										/>
									</div>
									<div className='grid gap-2.5'>
										<Label
											htmlFor='cardHolder'
											className='text-sm font-semibold text-blue-800 dark:text-blue-300'
										>
											Karta egasi (Ixtiyoriy)
										</Label>
										<Input
											id='cardHolder'
											name='cardHolder'
											placeholder='ALI VALIYEV'
											className='h-12 font-bold uppercase tracking-wide rounded-xl bg-background border-border/50 shadow-sm'
											disabled={isLoading}
											value={cardHolder}
											onChange={e =>
												setCardHolder(e.target.value.toUpperCase())
											}
										/>
									</div>
								</div>
							)}

							<div className='grid gap-3'>
								<Label
									htmlFor='description'
									className='text-sm font-bold text-foreground'
								>
									Qo'shimcha izoh (Ixtiyoriy)
								</Label>
								<Textarea
									id='description'
									name='description'
									laceholder='Nimaga ishlatish uchun olindi yoki qaytarish shartlari haqida eslatma...'
									rows={4}
									disabled={isLoading}
									value={description}
									onChange={e => setDescription(e.target.value)}
									className='resize-none text-base p-4 rounded-xl border-border/50 shadow-sm'
								/>
							</div>

							<div className='flex flex-row items-center justify-between rounded-2xl border border-border/50 p-5 bg-muted/20 hover:bg-muted/40 transition-colors'>
								<div className='space-y-1 pr-4'>
									<Label className='text-base font-bold flex items-center gap-2 text-foreground'>
										<BellRing
											className={`h-5 w-5 ${enableReminder ? 'text-primary animate-pulse' : 'text-muted-foreground'}`}
										/>
										Avtomatik eslatma
									</Label>
									<CardDescription className='text-sm font-medium'>
										Qaytarish muddati yaqinlashganda dastur sizga ogohlantirish
										beradi.
									</CardDescription>
								</div>
								<Switch
									checked={enableReminder}
									onCheckedChange={setEnableReminder}
									disabled={isLoading}
									className='data-[state=checked]:bg-primary'
								/>
							</div>
						</CardContent>

						<CardFooter className='flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-border/50 p-6 sm:p-8 bg-muted/10 backdrop-blur-sm'>
							<Button
								type='button'
								variant='ghost'
								className='w-full sm:w-auto h-12 rounded-xl font-bold hover:bg-muted'
								onClick={() => router.push('/debts')}
								disabled={isLoading}
							>
								Bekor qilish
							</Button>
							<Button
								type='submit'
								disabled={isLoading}
								className='w-full sm:w-auto h-12 px-8 rounded-xl font-bold tracking-wide gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all'
							>
								{isLoading ? (
									<LoaderIcon className='h-5 w-5 animate-spin' />
								) : (
									<Save className='h-5 w-5' />
								)}
								{isLoading ? 'Saqlanmoqda...' : "O'zgarishlarni saqlash"}
							</Button>
						</CardFooter>
					</form>
				</Card>
			</main>
		</div>
	)
}
