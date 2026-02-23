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

export default function Login() {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)
	const [showPassword, setShowPassword] = useState(false)

	const handleSubmit = async e => {
		e.preventDefault()
		setIsLoading(true)

		const formData = new FormData(e.currentTarget)
		const login = `+998${formData.get('phone').replace(/\s/g, '')}`
		const password = formData.get('password')

		try {
			const response = await authApi.login({ login, password })

			toast.success('Muvaffaqiyatli kirildi!', {
				description: `Xush kelibsiz, ${response.data.name}!`,
				position: 'top-right',
				style: { background: '#16A34A', color: '#fff' },
				duration: 2000,
				closable: true,
			})

			router.push('/')
		} catch (error) {
			toast.error(error.message || 'Login qilishda xatolik yuz berdi', {
				position: 'top-right',
				style: { background: '#DC2626', color: '#fff' },
				duration: 3000,
				closable: true,
			})
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className='flex justify-center mt-10'>
			<Card className='w-full max-w-md'>
				<CardHeader>
					<CardTitle className='text-2xl'>Omonatga kirish</CardTitle>
					<CardDescription>
						Omonatga kirish uchun telefon raqamingiz va parolingizni kiriting.
					</CardDescription>
				</CardHeader>

				<CardContent>
					<form onSubmit={handleSubmit} className='flex flex-col gap-6'>
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
										e.target.value = formatPhoneNumber(e.target.value)
									}}
								/>
							</div>
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
								'Kirish'
							)}
						</Button>
					</form>
				</CardContent>

				<CardFooter className='flex flex-col gap-2'>
					<div className='text-sm text-muted-foreground'>
						Hisobingiz yo'qmi?{' '}
						<Link
							href='/authentication/register'
							className='text-primary hover:underline'
						>
							Ro'yxatdan o'tish
						</Link>
					</div>
				</CardFooter>
			</Card>
		</div>
	)
}
