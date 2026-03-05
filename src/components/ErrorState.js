'use client'

import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function ErrorState({ message, onRetry }) {
	return (
		<div className='flex flex-1 flex-col items-center justify-center p-6 md:p-8 text-center min-h-[60vh]'>
			<div className='w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-5 ring-8 ring-red-50 dark:ring-red-900/10'>
				<AlertCircle className='w-8 h-8' />
			</div>
			<h2 className='text-xl md:text-2xl font-bold mb-2 text-foreground tracking-tight'>
				Xatolik yuz berdi
			</h2>
			<p className='text-sm md:text-base text-muted-foreground mb-8 max-w-sm leading-relaxed'>
				{message || "Ma'lumotlarni yuklashda kutilmagan xatolik."}
			</p>
			<Button
				onClick={onRetry || (() => window.location.reload())}
				size='lg'
				className='rounded-xl font-semibold px-8 shadow-lg shadow-primary/20 h-12 w-full sm:w-auto'
			>
				Qayta urinish
			</Button>
		</div>
	)
}
