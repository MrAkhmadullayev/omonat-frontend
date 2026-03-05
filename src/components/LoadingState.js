'use client'

import { LoaderIcon } from 'lucide-react'

export default function LoadingState({
	message = "Ma'lumotlar yuklanmoqda...",
}) {
	return (
		<div className='flex h-screen flex-col items-center justify-center bg-muted/20 gap-4'>
			<LoaderIcon className='size-10 animate-spin text-primary' />
			<p className='text-lg font-medium text-muted-foreground animate-pulse'>
				{message}
			</p>
		</div>
	)
}
