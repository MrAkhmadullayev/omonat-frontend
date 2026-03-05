'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authApi } from '@/lib/api'
import { formatPhoneNumber } from '@/lib/formatters'
import { motion } from 'framer-motion'
import { Eye, EyeOff, LoaderIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

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
		<div className='min-h-screen flex items-center justify-center px-4 py-12 bg-background relative overflow-hidden'>
			<div className='absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.primary/5%),transparent)]' />
			<div className='absolute -top-[10rem] -left-[10rem] w-[30rem] h-[30rem] bg-primary/5 rounded-full blur-3xl' />
			<div className='absolute -bottom-[10rem] -right-[10rem] w-[30rem] h-[30rem] bg-primary/5 rounded-full blur-3xl' />

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ type: 'spring', stiffness: 400, damping: 30 }}
				className='w-full max-w-md'
			>
				<div className='text-center mb-8'>
					<div className='inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-2xl font-extrabold text-primary-foreground shadow-lg shadow-primary/20 mb-4'>
						O
					</div>
					<h1 className='text-3xl font-extrabold tracking-tight text-foreground'>
						Omonatga kirish
					</h1>
					<p className='text-sm text-muted-foreground mt-2'>
						Telefon raqamingiz va parolingizni kiriting.
					</p>
				</div>

				<Card className='border-border/50 shadow-xl bg-background/80 backdrop-blur-xl rounded-2xl'>
					<CardContent className='pt-6'>
						<form onSubmit={handleSubmit} className='flex flex-col gap-6'>
							<div className='grid gap-2'>
								<Label htmlFor='phone' className='font-bold text-sm'>
									Telefon raqam
								</Label>
								<div className='flex'>
									<div className='flex items-center px-3 border border-r-0 rounded-l-xl bg-muted text-sm font-medium'>
										+998
									</div>
									<Input
										id='phone'
										name='phone'
										type='tel'
										maxLength={12}
										placeholder='99 999 99 99'
										className='rounded-l-none rounded-r-xl h-11'
										required
										disabled={isLoading}
										onInput={e => {
											e.target.value = formatPhoneNumber(e.target.value)
										}}
									/>
								</div>
							</div>

							<div className='grid gap-2'>
								<Label htmlFor='password' className='font-bold text-sm'>
									Parol
								</Label>
								<div className='relative'>
									<Input
										id='password'
										name='password'
										type={showPassword ? 'text' : 'password'}
										placeholder='Parolingizni kiriting'
										required
										disabled={isLoading}
										className='pr-10 h-11 rounded-xl'
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
										<span className='sr-only'>
											Parolni ko'rsatish/yashirish
										</span>
									</button>
								</div>
							</div>

							<Button
								type='submit'
								className='w-full mt-2 h-11 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all'
								disabled={isLoading}
							>
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

					<CardFooter className='flex flex-col gap-2 pb-6'>
						<div className='text-sm text-muted-foreground'>
							Hisobingiz yo'qmi?{' '}
							<Link
								href='/authentication/register'
								className='text-primary font-semibold hover:underline'
							>
								Ro'yxatdan o'tish
							</Link>
						</div>
					</CardFooter>
				</Card>
			</motion.div>
		</div>
	)
}
