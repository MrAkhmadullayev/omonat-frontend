'use client'

import { format } from 'date-fns'
import { uz } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { useUser } from '@/hooks/useUser'
import { expenseApi } from '@/lib/api'
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import {
	ArrowLeft,
	Banknote,
	CalendarIcon,
	Car,
	CreditCard,
	Home,
	LoaderIcon,
	PlusCircle,
	Save,
	Settings,
	ShoppingBag,
	Utensils,
	Wallet,
} from 'lucide-react'

const initialCategories = [
	{ id: 'food', label: 'Oziq-ovqat', icon: Utensils },
	{ id: 'transport', label: 'Transport', icon: Car },
	{ id: 'shopping', label: 'Xaridlar', icon: ShoppingBag },
	{ id: 'house', label: 'Uy-joy', icon: Home },
	{ id: 'services', label: 'Xizmatlar', icon: Settings },
]

export default function AddExpensePage() {
	const { user, isLoading: userLoading, isError } = useUser()
	const router = useRouter()

	const [isLoading, setIsLoading] = useState(false)
	const [category, setCategory] = useState('food')
	const [customCategory, setCustomCategory] = useState('')
	const [paymentMethod, setPaymentMethod] = useState('cash')
	const [date, setDate] = useState(new Date())
	const [cardNumber, setCardNumber] = useState('')
	const [cardHolder, setCardHolder] = useState('')

	useEffect(() => {
		if (isError) router.push('/authentication/login')
	}, [isError, router])

	if (isError) return null

	if (userLoading || !user) {
		return (
			<div className='flex h-screen flex-col items-center justify-center bg-muted/20 gap-4'>
				<LoaderIcon className='size-10 animate-spin text-foreground' />
				<p className='text-lg font-medium text-muted-foreground animate-pulse'>
					Sahifa yuklanmoqda...
				</p>
			</div>
		)
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
		setIsLoading(true)

		const formData = new FormData(e.currentTarget)
		const finalCategory = category === 'other' ? customCategory : category

		const newExpenseData = {
			title: formData.get('title'),
			amount: Number(formData.get('amount').replace(/\s/g, '')),
			category: finalCategory,
			method: paymentMethod,
			date: date.toISOString(),
			description: formData.get('description'),
			cardNumber:
				paymentMethod === 'card' && cardNumber
					? cardNumber.replace(/\s/g, '')
					: null,
			cardHolder: paymentMethod === 'card' && cardHolder ? cardHolder : null,
		}

		try {
			if (category === 'other' && !customCategory.trim()) {
				throw new Error('Iltimos, yangi kategoriya nomini kiriting')
			}
			if (newExpenseData.amount <= 0) {
				throw new Error("Xarajat summasi noldan katta bo'lishi kerak")
			}

			await expenseApi.create(newExpenseData)

			toast.success(
				category === 'other'
					? `Yangi "${finalCategory}" toifasi saqlandi!`
					: 'Xarajat saqlandi!',
				{ style: { background: '#16A34A', color: '#fff' } },
			)

			router.push('/expenses')
		} catch (error) {
			toast.error(error.message || 'Xatolik yuz berdi', {
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
						onClick={() => router.push('/expenses')}
					>
						<ArrowLeft className='h-5 w-5' />
					</Button>
					<div>
						<h1 className='text-2xl font-bold tracking-tight text-foreground'>
							Yangi xarajat
						</h1>
						<p className='text-sm text-muted-foreground font-medium mt-1'>
							Xarajat turi va tafsilotlarini kiriting.
						</p>
					</div>
				</div>

				<Card className='shadow-lg hover:shadow-xl transition-shadow duration-300 border-border/50 bg-background/60 backdrop-blur-xl overflow-hidden rounded-2xl'>
					<form onSubmit={handleSubmit}>
						<CardContent className='p-6 sm:p-8 space-y-8'>
							<div className='grid gap-3'>
								<Label
									htmlFor='title'
									className='text-sm font-bold text-foreground'
								>
									Xarajat nomi (Nima oldingiz?){' '}
									<span className='text-red-500'>*</span>
								</Label>
								<Input
									id='title'
									name='title'
									placeholder='Masalan: Uyga bozorlik'
									className='h-12 text-base font-semibold rounded-xl border-border/50 shadow-sm focus-visible:ring-foreground'
									required
									disabled={isLoading}
								/>
							</div>

							<div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
								<div className='grid gap-3'>
									<Label
										htmlFor='amount'
										className='text-sm font-bold text-foreground'
									>
										Summa <span className='text-red-500'>*</span>
									</Label>
									<div className='relative group'>
										<div className='absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors'>
											<Banknote className='h-5 w-5' />
										</div>
										<Input
											id='amount'
											name='amount'
											placeholder='50 000'
											className='h-14 pl-12 pr-14 text-xl font-black rounded-xl border-border/50 shadow-sm transition-all focus-visible:ring-foreground'
											required
											disabled={isLoading}
											onInput={formatAmount}
										/>
										<div className='absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground uppercase'>
											UZS
										</div>
									</div>
								</div>

								<div className='grid gap-3'>
									<Label className='text-sm font-bold text-foreground'>
										Kategoriya
									</Label>
									<Select
										value={category}
										onValueChange={setCategory}
										disabled={isLoading}
									>
										<SelectTrigger className='h-14 text-base font-bold rounded-xl border-border/50 shadow-sm focus:ring-foreground'>
											<SelectValue placeholder='Toifani tanlang' />
										</SelectTrigger>
										<SelectContent className='rounded-xl'>
											{initialCategories.map(cat => (
												<SelectItem
													key={cat.id}
													value={cat.id}
													className='py-3'
												>
													<div className='flex items-center gap-2.5 font-semibold'>
														<cat.icon className='h-4 w-4 text-muted-foreground' />{' '}
														{cat.label}
													</div>
												</SelectItem>
											))}
											<SelectItem
												value='other'
												className='py-3 text-foreground font-bold focus:bg-muted/50'
											>
												<div className='flex items-center gap-2.5'>
													<PlusCircle className='h-4 w-4' /> Boshqa...
												</div>
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							{category === 'other' && (
								<div className='grid gap-3 p-5 border border-dashed border-border/60 bg-muted/20 rounded-xl animate-in fade-in slide-in-from-top-4 duration-300'>
									<Label
										htmlFor='customCategory'
										className='text-sm font-bold text-foreground'
									>
										Yangi kategoriya nomini yozing{' '}
										<span className='text-red-500'>*</span>
									</Label>
									<Input
										id='customCategory'
										placeholder='Masalan: Xayriya, Sport...'
										value={customCategory}
										onChange={e => setCustomCategory(e.target.value)}
										className='h-12 rounded-lg bg-background shadow-sm'
										required={category === 'other'}
										disabled={isLoading}
									/>
								</div>
							)}

							<div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
								<div className='grid gap-3'>
									<Label className='text-sm font-bold text-foreground'>
										Sana <span className='text-red-500'>*</span>
									</Label>
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant='outline'
												className={cn(
													'h-14 w-full justify-start text-left text-base font-semibold rounded-xl border-border/50 shadow-sm',
													!date && 'text-muted-foreground',
												)}
												disabled={isLoading}
											>
												<CalendarIcon className='mr-3 h-5 w-5' />
												{date ? (
													format(date, 'dd MMM, yyyy', { locale: uz })
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
												selected={date}
												onSelect={day => day && setDate(day)}
												initialFocus
											/>
										</PopoverContent>
									</Popover>
								</div>

								<div className='grid gap-3'>
									<Label className='text-sm font-bold text-foreground'>
										To'lov usuli
									</Label>
									<Select
										value={paymentMethod}
										onValueChange={setPaymentMethod}
										disabled={isLoading}
									>
										<SelectTrigger className='h-14 text-base font-bold rounded-xl border-border/50 shadow-sm'>
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
													<CreditCard className='h-4 w-4' /> Karta
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
											placeholder='ISM FAMILIYA'
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
									Izoh
								</Label>
								<Textarea
									id='description'
									name='description'
									placeholder='Xarajat haqida qisqacha...'
									rows={3}
									disabled={isLoading}
									className='resize-none text-base p-4 rounded-xl border-border/50 shadow-sm'
								/>
							</div>
						</CardContent>

						<CardFooter className='flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-border/50 p-6 sm:p-8 bg-muted/10 backdrop-blur-sm'>
							<Button
								type='button'
								variant='ghost'
								className='w-full sm:w-auto h-12 rounded-xl font-bold hover:bg-muted'
								onClick={() => router.push('/expenses')}
								disabled={isLoading}
							>
								Bekor qilish
							</Button>
							<Button
								type='submit'
								disabled={isLoading}
								className='w-full sm:w-auto h-12 px-8 rounded-xl font-bold tracking-wide gap-2 bg-foreground hover:bg-foreground/90 text-background shadow-md hover:shadow-lg transition-all'
							>
								{isLoading ? (
									<LoaderIcon className='h-5 w-5 animate-spin' />
								) : (
									<Save className='h-5 w-5' />
								)}
								{isLoading ? 'Saqlanmoqda...' : 'Saqlash'}
							</Button>
						</CardFooter>
					</form>
				</Card>
			</main>
		</div>
	)
}
