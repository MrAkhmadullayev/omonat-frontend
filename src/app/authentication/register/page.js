'use client'

import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authApi } from '@/lib/api'
import { Eye, EyeOff, LoaderIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

const formatPhoneNumber = value => {
	let val = value.replace(/\D/g, '').slice(0, 9)
	if (val.length > 2) val = `${val.slice(0, 2)} ${val.slice(2)}`
	if (val.length > 6) val = `${val.slice(0, 6)} ${val.slice(6)}`
	return val
}

const validateOnlyLetters = (e, message) => {
	const el = e.currentTarget
	if (el.value === '') {
		el.setCustomValidity('')
		return
	}
	if (!/^[A-Za-z]+$/.test(el.value)) el.setCustomValidity(message)
	else el.setCustomValidity('')
}

export default function Register() {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)

	const handleSubmit = async e => {
		e.preventDefault()
		setIsLoading(true)

		const formData = new FormData(e.currentTarget)

		const userData = {
			name: `${formData.get('name')} ${formData.get('surname')}`.trim(),
			phone: `+998${formData.get('phone').replace(/\s/g, '')}`,
			email: formData.get('email'),
			password: formData.get('password'),
		}

		try {
			const user = await authApi.register(userData)

			toast.success("Muvaffaqiyatli ro'yxatdan o'tdingiz!", {
				description: `Xush kelibsiz, ${user.name}!`,
				position: 'top-right',
				style: { background: '#16A34A', color: '#fff' },
				duration: 3000,
			})

			router.push('/')
		} catch (error) {
			toast.error(error.message || 'Xatolik yuz berdi', {
				position: 'top-right',
				style: { background: '#DC2626', color: '#fff' },
				duration: 3000,
			})
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className='flex justify-center mt-10'>
			<Card className='w-full max-w-md'>
				<CardHeader>
					<CardTitle className='text-2xl'>Omonatga ro'yxatdan o'tish</CardTitle>
					<CardDescription>
						Omonatga ro'yxatdan o'tish uchun quyidagi ma'lumotlarni kiriting.
					</CardDescription>
				</CardHeader>

				<CardContent>
					<form onSubmit={handleSubmit} className='flex flex-col gap-6'>
						<div className='grid gap-2'>
							<div className='flex gap-4'>
								<div className='grid gap-2 w-1/2'>
									<Label htmlFor='name'>Ism</Label>
									<Input
										id='name'
										name='name'
										type='text'
										placeholder='Ismingizni kiriting'
										required
										disabled={isLoading}
										onInput={e =>
											validateOnlyLetters(
												e,
												"Ism faqat harflardan iborat bo'lishi kerak",
											)
										}
									/>
								</div>
								<div className='grid gap-2 w-1/2'>
									<Label htmlFor='surname'>Familiya</Label>
									<Input
										id='surname'
										name='surname'
										type='text'
										placeholder='Familiyangizni kiriting'
										required
										disabled={isLoading}
										onInput={e =>
											validateOnlyLetters(
												e,
												"Familiya faqat harflardan iborat bo'lishi kerak",
											)
										}
									/>
								</div>
							</div>
						</div>

						<div className='grid gap-2'>
							<Label htmlFor='phone'>Telefon raqam</Label>
							<div className='flex'>
								<div className='flex items-center px-3 border border-r-0 rounded-l-lg bg-muted text-sm'>
									+998
								</div>
								<Input
									id='phone'
									name='phone'
									type='tel'
									maxLength={12}
									placeholder='99 999 99 99'
									className='rounded-l-none'
									required
									disabled={isLoading}
									onInput={e => {
										e.currentTarget.value = formatPhoneNumber(
											e.currentTarget.value,
										)
									}}
								/>
							</div>
						</div>

						<div className='grid gap-2'>
							<Label htmlFor='email'>Elektron pochta</Label>
							<Input
								id='email'
								name='email'
								type='email'
								placeholder='example@omonat.uz'
								required
								disabled={isLoading}
							/>
						</div>

						<div className='grid gap-2'>
							<Label htmlFor='password'>Parol</Label>
							<div className='relative'>
								<Input
									id='password'
									name='password'
									type={showPassword ? 'text' : 'password'}
									placeholder='Parolingizni kiriting'
									required
									disabled={isLoading}
									className='pr-10'
								/>
								<button
									type='button'
									onClick={() => setShowPassword(!showPassword)}
									className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
									disabled={isLoading}
								>
									{showPassword ? (
										<EyeOff className='size-4' aria-hidden='true' />
									) : (
										<Eye className='size-4' aria-hidden='true' />
									)}
									<span className='sr-only'>Parolni ko'rsatish/yashirish</span>
								</button>
							</div>
						</div>

						<div className='grid gap-2'>
							<Label htmlFor='confirm-password'>Parolni tasdiqlang</Label>
							<div className='relative'>
								<Input
									id='confirm-password'
									name='confirm-password'
									type={showConfirmPassword ? 'text' : 'password'}
									placeholder='Parolingizni qayta kiriting'
									required
									disabled={isLoading}
									className='pr-10'
									onInput={e => {
										const confirmEl = e.currentTarget
										const form = confirmEl.form
										const password = form?.elements?.password?.value || ''
										if (confirmEl.value === '') {
											confirmEl.setCustomValidity('')
											return
										}
										if (password !== confirmEl.value) {
											confirmEl.setCustomValidity('Parollar mos kelmadi')
										} else {
											confirmEl.setCustomValidity('')
										}
									}}
								/>
								<button
									type='button'
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
									disabled={isLoading}
								>
									{showConfirmPassword ? (
										<EyeOff className='size-4' aria-hidden='true' />
									) : (
										<Eye className='size-4' aria-hidden='true' />
									)}
									<span className='sr-only'>Parolni ko'rsatish/yashirish</span>
								</button>
							</div>
						</div>

						<Button type='submit' className='w-full mt-2' disabled={isLoading}>
							{isLoading ? (
								<>
									<LoaderIcon
										className='mr-2 size-4 animate-spin'
										aria-hidden='true'
									/>
									Yuklanmoqda...
								</>
							) : (
								"Ro'yxatdan o'tish"
							)}
						</Button>
					</form>
				</CardContent>
				<CardFooter className='flex flex-col gap-2'>
					<div className='text-sm text-muted-foreground'>
						Hisobingiz bormi?{' '}
						<Link
							href='/authentication/login'
							className='text-primary hover:underline'
						>
							Kirish
						</Link>
					</div>
				</CardFooter>
			</Card>
		</div>
	)
}
