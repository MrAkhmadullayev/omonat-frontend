'use client'

import { format } from 'date-fns'
import { uz } from 'date-fns/locale'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import useSWR from 'swr'

import { useUser } from '@/hooks/useUser'
import { receivableApi } from '@/lib/api'
import { cn } from '@/lib/utils'

import Navbar from '@/components/Navbar'
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
import { Textarea } from '@/components/ui/textarea'

import {
	AlertCircle,
	ArrowLeft,
	Banknote,
	CalendarIcon,
	CheckCircle2,
	LoaderIcon,
	Wallet,
} from 'lucide-react'

const formatMoney = (amount, currency = 'UZS') => {
	return new Intl.NumberFormat('uz-UZ', {
		style: 'currency',
		currency,
		maximumFractionDigits: 0,
	}).format(amount || 0)
}

export default function ReceivePaymentPage() {
	const { id } = useParams()
	const router = useRouter()
	const { user, isLoading: userLoading, isError } = useUser()

	const [receiveAmount, setReceiveAmount] = useState('')
	const [date, setDate] = useState(new Date())
	const [isSubmitting, setIsSubmitting] = useState(false)

	const {
		data,
		error: dataError,
		isLoading: dataLoading,
	} = useSWR(user && id ? `/receivables/${id}` : null, () =>
		receivableApi.getById(id),
	)

	useEffect(() => {
		if (isError) router.push('/authentication/login')
	}, [isError, router])

	if (isError) return null

	if (userLoading || dataLoading) {
		return (
			<div className='flex h-screen flex-col items-center justify-center bg-muted/20 gap-4'>
				<LoaderIcon className='size-8 animate-spin text-foreground' />
				<p className='text-base font-medium text-muted-foreground animate-pulse'>
					To'lov sahifasi yuklanmoqda...
				</p>
			</div>
		)
	}

	if (dataError || !data) {
		return (
			<div className='flex h-screen flex-col items-center justify-center bg-muted/20 gap-4'>
				<AlertCircle className='size-10 text-muted-foreground/50' />
				<div className='text-lg font-bold text-foreground'>
					Ma'lumot topilmadi
				</div>
				<Button
					variant='outline'
					onClick={() => router.push('/receivables')}
					className='mt-2 rounded-lg'
				>
					Orqaga qaytish
				</Button>
			</div>
		)
	}

	const remainingAmount = data.amount - data.receivedAmount

	const handleReceiveFullRemaining = () => {
		setReceiveAmount(remainingAmount.toLocaleString('ru-RU').replace(/,/g, ' '))
	}

	const handleAmountChange = e => {
		let value = e.target.value.replace(/\D/g, '')
		if (value) {
			if (Number(value) > remainingAmount) {
				value = remainingAmount.toString()
				toast.info('Kiritilgan summa qoldiqdan oshib ketdi', { duration: 3000 })
			}
			setReceiveAmount(
				parseInt(value, 10).toLocaleString('ru-RU').replace(/,/g, ' '),
			)
		} else {
			setReceiveAmount('')
		}
	}

	const handleSubmit = async e => {
		e.preventDefault()
		setIsSubmitting(true)

		const formData = new FormData(e.currentTarget)
		const rawAmount = Number(receiveAmount.replace(/\s/g, ''))

		const paymentData = {
			amount: rawAmount,
			date: date.toISOString(),
			note: formData.get('note'),
		}

		try {
			if (paymentData.amount <= 0) {
				throw new Error("Summa noldan katta bo'lishi kerak")
			}

			await receivableApi.receivePayment(id, paymentData)

			toast.success("To'lov muvaffaqiyatli qabul qilindi!", {
				position: 'top-right',
				style: { background: '#16A34A', color: '#fff' },
			})

			router.push(`/receivables/${id}`)
		} catch (error) {
			toast.error(error.message || 'Xatolik yuz berdi', {
				position: 'top-right',
				style: { background: '#DC2626', color: '#fff' },
			})
			setIsSubmitting(false)
		}
	}

	return (
		<div className='min-h-screen bg-muted/20 flex flex-col font-sans'>
			<Navbar user={user} />

			<main className='flex-1 w-full max-w-2xl mx-auto p-4 md:p-8'>
				<div className='flex items-center gap-4 mb-6'>
					<Button
						variant='outline'
						size='icon'
						className='rounded-lg shadow-sm hover:bg-muted transition-colors h-9 w-9'
						onClick={() => router.push(`/receivables/${id}`)}
					>
						<ArrowLeft className='h-4 w-4' />
					</Button>
					<div>
						<h1 className='text-xl font-bold tracking-tight text-foreground'>
							To'lov qabul qilish
						</h1>
						<p className='text-xs text-muted-foreground font-medium mt-0.5 uppercase tracking-wider'>
							{data.debtor} dan pul olish
						</p>
					</div>
				</div>

				<Card className='shadow-md hover:shadow-lg transition-shadow duration-300 border-border/50 bg-background/60 backdrop-blur-xl overflow-hidden rounded-xl'>
					<form onSubmit={handleSubmit}>
						<div className='bg-muted/30 border-b border-border/50 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
							<div className='space-y-1'>
								<p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5'>
									<Wallet className='h-3.5 w-3.5' /> Olinishi kerak bo'lgan
									qoldiq
								</p>
								<p className='text-2xl font-black text-foreground drop-shadow-sm'>
									{formatMoney(remainingAmount, data.currency)}
								</p>
							</div>
							<Button
								type='button'
								variant='outline'
								size='sm'
								className='rounded-lg border-border text-foreground hover:bg-muted font-bold tracking-wide shadow-sm'
								onClick={handleReceiveFullRemaining}
							>
								Qoldiqni to'liq olish
							</Button>
						</div>

						<CardContent className='p-5 sm:p-6 space-y-6'>
							<div className='grid gap-2.5'>
								<Label
									htmlFor='receiveAmount'
									className='text-sm font-semibold text-foreground'
								>
									Qancha qabul qilyapsiz?{' '}
									<span className='text-red-500'>*</span>
								</Label>
								<div className='relative group'>
									<div className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-green-600 transition-colors'>
										<Banknote className='h-5 w-5' />
									</div>
									<Input
										id='receiveAmount'
										value={receiveAmount}
										onChange={handleAmountChange}
										placeholder='Masalan: 500 000'
										className='h-12 pl-10 pr-12 text-lg font-bold text-green-600 rounded-lg border-border/50 shadow-sm transition-all focus-visible:ring-green-500 focus-visible:border-green-500'
										required
										disabled={isSubmitting}
									/>
									<div className='absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground uppercase'>
										{data.currency}
									</div>
								</div>
							</div>

							<div className='grid gap-2.5'>
								<Label className='text-sm font-semibold text-foreground'>
									Qabul qilingan sana <span className='text-red-500'>*</span>
								</Label>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant='outline'
											className={cn(
												'w-full h-11 justify-start text-left font-medium rounded-lg border-border/50 shadow-sm transition-all',
												!date && 'text-muted-foreground',
											)}
											disabled={isSubmitting}
										>
											<CalendarIcon className='mr-2 h-4 w-4' />
											{date ? (
												format(date, 'PPP', { locale: uz })
											) : (
												<span>Sana tanlang</span>
											)}
										</Button>
									</PopoverTrigger>
									<PopoverContent className='w-auto p-0' align='start'>
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
									className='text-sm font-semibold text-foreground'
								>
									Izoh (Ixtiyoriy)
								</Label>
								<Textarea
									id='note'
									name='note'
									placeholder='Masalan: Plastik kartaga tashlab berdi...'
									rows={3}
									disabled={isSubmitting}
									className='resize-none text-sm p-3 rounded-lg border-border/50 shadow-sm transition-all'
								/>
							</div>
						</CardContent>

						<CardFooter className='flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-border/50 p-5 bg-muted/10 backdrop-blur-sm'>
							<Button
								type='button'
								variant='ghost'
								className='w-full sm:w-auto h-10 rounded-lg font-semibold hover:bg-muted'
								onClick={() => router.push(`/receivables/${id}`)}
								disabled={isSubmitting}
							>
								Bekor qilish
							</Button>
							<Button
								type='submit'
								disabled={isSubmitting || !receiveAmount}
								className='w-full sm:w-auto h-10 px-6 rounded-lg font-bold tracking-wide gap-2 bg-foreground hover:bg-foreground/90 text-background shadow-sm hover:shadow-md transition-all'
							>
								{isSubmitting ? (
									<LoaderIcon className='h-4 w-4 animate-spin' />
								) : (
									<CheckCircle2 className='h-4 w-4' />
								)}
								{isSubmitting ? 'Saqlanmoqda...' : 'Qabul qildim'}
							</Button>
						</CardFooter>
					</form>
				</Card>
			</main>
		</div>
	)
}
