'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

export default function PageHeader({
	title,
	subtitle,
	backHref = '/',
	children,
}) {
	const router = useRouter()
	const [isPending, startTransition] = useTransition()

	const navigate = path => {
		startTransition(() => {
			router.push(path)
		})
	}

	return (
		<div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
			<div className='flex items-center gap-4'>
				<Button
					variant='outline'
					size='icon'
					className='shadow-sm hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors'
					onClick={() => navigate(backHref)}
					disabled={isPending}
				>
					{isPending ? (
						<Loader2 className='h-5 w-5 animate-spin' />
					) : (
						<ArrowLeft className='h-5 w-5' />
					)}
				</Button>
				<div>
					<h1 className='text-2xl font-extrabold tracking-tight text-foreground'>
						{title}
					</h1>
					{subtitle && (
						<p className='text-sm text-muted-foreground font-medium mt-1'>
							{subtitle}
						</p>
					)}
				</div>
			</div>
			{children && (
				<div className='flex items-center gap-2 w-full md:w-auto'>
					{children}
				</div>
			)}
		</div>
	)
}
