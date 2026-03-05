'use client'

export default function EmptyState({ icon: Icon, title, description }) {
	return (
		<div className='flex flex-col items-center justify-center py-14 text-center text-muted-foreground bg-muted/20 rounded-2xl border border-dashed'>
			{Icon && <Icon className='mb-3 h-10 w-10 text-muted-foreground/30' />}
			<p className='text-sm font-semibold'>{title}</p>
			{description && (
				<p className='text-xs mt-1.5 opacity-70 max-w-xs'>{description}</p>
			)}
		</div>
	)
}
