'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft, FileQuestion, Home } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
	return (
		<div className='min-h-screen flex items-center justify-center bg-background px-6 py-24 sm:py-32 lg:px-8 relative overflow-hidden'>
			<div className='absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.primary/5%),transparent)]' />
			<div className='absolute -top-[10rem] -left-[10rem] w-[30rem] h-[30rem] bg-primary/5 rounded-full blur-3xl' />
			<div className='absolute -bottom-[10rem] -right-[10rem] w-[30rem] h-[30rem] bg-primary/5 rounded-full blur-3xl' />

			<div className='text-center max-w-2xl mx-auto'>
				<div className='flex justify-center mb-8 relative'>
					<div className='bg-primary/10 p-4 rounded-2xl relative z-10 animate-bounce'>
						<FileQuestion
							className='h-12 w-12 text-primary'
							strokeWidth={1.5}
						/>
					</div>
					<div className='absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-50 opacity-50' />
				</div>

				<p className='text-sm font-semibold text-primary uppercase tracking-widest mb-4'>
					Xatolik 404
				</p>

				<h1 className='mt-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70'>
					Sahifa topilmadi
				</h1>

				<p className='mt-6 text-lg leading-7 text-muted-foreground max-w-lg mx-auto'>
					Kechirasiz, siz qidirayotgan sahifa mavjud emas yoki boshqa manzilga
					ko'chirilgan bo'lishi mumkin.
				</p>

				<div className='mt-12 flex flex-col sm:flex-row items-center justify-center gap-4'>
					<Button
						asChild
						size='lg'
						className='w-full sm:w-auto px-8 py-6 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-primary/20'
					>
						<Link href='/' className='flex items-center gap-2'>
							<Home className='h-5 w-5' />
							Bosh sahifaga qaytish
						</Link>
					</Button>

					<Button
						asChild
						variant='outline'
						size='lg'
						className='w-full sm:w-auto px-8 py-6 rounded-2xl transition-all duration-300 hover:bg-accent/10 hover:scale-105 active:scale-95'
					>
						<button
							onClick={() => window.history.back()}
							className='flex items-center gap-2'
						>
							<ArrowLeft className='h-5 w-5' />
							Orqaga qaytish
						</button>
					</Button>
				</div>

				<div className='mt-16 pt-8 border-t border-border/50'>
					<p className='text-sm text-muted-foreground/60 italic'>
						"Omonat" tizimi — sizning ishonchli hamkoringiz.
					</p>
				</div>
			</div>

			<div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -z-20 opacity-[0.02] select-none pointer-events-none'>
				<span className='font-black text-[30rem] leading-none'>404</span>
			</div>
		</div>
	)
}
