'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { useUser } from '@/hooks/useUser'
import { authApi } from '@/lib/api'

import Navbar from '@/components/Navbar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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

import {
	ArrowLeft,
	LoaderIcon,
	Lock,
	Mail,
	Phone,
	Save,
	User as UserIcon,
} from 'lucide-react'

export default function ProfilePage() {
	const router = useRouter()
	const { user, isLoading: userLoading, isError, mutate } = useUser()

	const [isLoading, setIsLoading] = useState(false)
	const [formData, setFormData] = useState({
		name: '',
		phone: '',
		email: '',
		password: '',
	})

	useEffect(() => {
		if (isError) router.push('/authentication/login')
		if (user) {
			setFormData({
				name: user.name || '',
				phone: user.phone || '',
				email: user.email || '',
				password: '',
			})
		}
	}, [isError, user, router])

	if (isError) return null

	if (userLoading || !user) {
		return (
			<div className='flex h-screen flex-col items-center justify-center bg-muted/20 gap-4'>
				<LoaderIcon className='size-10 animate-spin text-primary' />
				<p className='text-lg font-medium text-muted-foreground animate-pulse'>
					Sahifa yuklanmoqda...
				</p>
			</div>
		)
	}

	const handleChange = e => {
		const { name, value } = e.target
		setFormData(prev => ({ ...prev, [name]: value }))
	}

	const handleSubmit = async e => {
		e.preventDefault()
		setIsLoading(true)

		const updateData = {
			name: formData.name,
			phone: formData.phone,
		}

		if (formData.email) updateData.email = formData.email
		if (formData.password) updateData.password = formData.password

		try {
			const updatedUser = await authApi.updateProfile(updateData)

			// Update the local SWR cache immediately
			mutate(updatedUser, false)

			toast.success('Profil muvaffaqiyatli yangilandi!', {
				style: { background: '#16A34A', color: '#fff' },
			})

			// Parol hammasi toza bo'lishi uchun xonani tozalaymiz
			setFormData(prev => ({ ...prev, password: '' }))
		} catch (error) {
			toast.error(error.message || 'Xatolik yuz berdi', {
				style: { background: '#DC2626', color: '#fff' },
			})
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className='min-h-screen bg-muted/20 flex flex-col font-sans'>
			<Navbar user={user} />

			<main className='flex-1 w-full max-w-3xl mx-auto p-4 md:p-8'>
				<div className='flex items-center gap-4 mb-8'>
					<Button
						variant='outline'
						size='icon'
						className='rounded-xl shadow-sm hover:bg-muted transition-colors h-10 w-10'
						onClick={() => router.push('/')}
					>
						<ArrowLeft className='h-5 w-5' />
					</Button>
					<div>
						<h1 className='text-2xl font-bold tracking-tight text-foreground'>
							Profil Sozlamalari
						</h1>
						<p className='text-sm text-muted-foreground font-medium mt-1'>
							Shaxsiy ma'lumotlaringizni boshqaring.
						</p>
					</div>
				</div>

				<Card className='shadow-lg border-border/50 bg-background/60 backdrop-blur-xl overflow-hidden rounded-2xl'>
					<CardHeader className='pb-4 border-b border-border/50 bg-muted/30'>
						<div className='flex items-center gap-4'>
							<Avatar className='h-16 w-16 border-2 border-background shadow-sm ring-2 ring-primary/20'>
								<AvatarFallback className='bg-primary/10 text-xl font-bold text-primary'>
									{user.name.charAt(0).toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<div>
								<CardTitle className='text-xl font-bold'>
									Mening Hisobim
								</CardTitle>
								<CardDescription className='font-medium mt-1'>
									Tahrirlash va saqlash
								</CardDescription>
							</div>
						</div>
					</CardHeader>

					<form onSubmit={handleSubmit}>
						<CardContent className='p-6 sm:p-8 space-y-6'>
							<div className='grid gap-3'>
								<Label htmlFor='name' className='text-sm font-bold'>
									Ism va Familiya <span className='text-red-500'>*</span>
								</Label>
								<div className='relative'>
									<div className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'>
										<UserIcon className='h-5 w-5' />
									</div>
									<Input
										id='name'
										name='name'
										placeholder='Masalan: Ali Valiyev'
										className='pl-10 h-12 rounded-xl border-border/50 font-medium shadow-sm'
										value={formData.name}
										onChange={handleChange}
										required
										disabled={isLoading}
									/>
								</div>
							</div>

							<div className='grid gap-3'>
								<Label htmlFor='phone' className='text-sm font-bold'>
									Telefon raqam <span className='text-red-500'>*</span>
								</Label>
								<div className='relative'>
									<div className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'>
										<Phone className='h-5 w-5' />
									</div>
									<Input
										id='phone'
										name='phone'
										placeholder='+998901234567'
										className='pl-10 h-12 rounded-xl border-border/50 font-medium tracking-wide shadow-sm'
										value={formData.phone}
										onChange={handleChange}
										required
										disabled={isLoading}
									/>
								</div>
							</div>

							<div className='grid gap-3'>
								<Label htmlFor='email' className='text-sm font-bold'>
									Elektron pochta (Ixtiyoriy)
								</Label>
								<div className='relative'>
									<div className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'>
										<Mail className='h-5 w-5' />
									</div>
									<Input
										id='email'
										name='email'
										type='email'
										placeholder='ali@example.com'
										className='pl-10 h-12 rounded-xl border-border/50 font-medium shadow-sm'
										value={formData.email}
										onChange={handleChange}
										disabled={isLoading}
									/>
								</div>
							</div>

							<div className='pt-6 border-t border-border/50 grid gap-3'>
								<Label htmlFor='password' className='text-sm font-bold'>
									Yangi Parol
								</Label>
								<p className='text-xs text-muted-foreground font-medium mb-1'>
									Parolni o'zgartirishni xohlamasangiz, bu joyni bo'sh
									qoldiring.
								</p>
								<div className='relative'>
									<div className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'>
										<Lock className='h-5 w-5' />
									</div>
									<Input
										id='password'
										name='password'
										type='password'
										placeholder='••••••••'
										className='pl-10 h-12 rounded-xl border-border/50 shadow-sm'
										value={formData.password}
										onChange={handleChange}
										disabled={isLoading}
									/>
								</div>
							</div>
						</CardContent>

						<CardFooter className='flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-border/50 p-6 sm:p-8 bg-muted/10'>
							<Button
								type='button'
								variant='ghost'
								className='w-full sm:w-auto h-12 rounded-xl font-bold hover:bg-muted'
								onClick={() => router.push('/')}
								disabled={isLoading}
							>
								Ortga qaytish
							</Button>
							<Button
								type='submit'
								disabled={isLoading}
								className='w-full sm:w-auto h-12 px-8 rounded-xl font-bold tracking-wide gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all'
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
