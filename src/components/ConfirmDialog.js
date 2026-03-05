'use client'

import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { AlertCircle, Loader2 } from 'lucide-react'

export default function ConfirmDialog({
	open,
	onOpenChange,
	title = 'Tasdiqlash',
	description = 'Bu amalni bajarishni xohlaysizmi?',
	confirmLabel = 'Tasdiqlash',
	cancelLabel = 'Bekor qilish',
	onConfirm,
	isLoading = false,
	variant = 'destructive',
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-md rounded-2xl'>
				<DialogHeader className='text-left'>
					<div className='flex items-center gap-3 mb-1'>
						<div
							className={`p-2 rounded-full ${variant === 'destructive' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-primary/10'}`}
						>
							<AlertCircle
								className={`h-5 w-5 ${variant === 'destructive' ? 'text-red-600' : 'text-primary'}`}
							/>
						</div>
						<DialogTitle className='text-lg font-bold'>{title}</DialogTitle>
					</div>
					<DialogDescription className='text-sm text-muted-foreground pl-12'>
						{description}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className='flex-row justify-end gap-2 pt-4'>
					<Button
						variant='ghost'
						onClick={() => onOpenChange(false)}
						disabled={isLoading}
						className='rounded-xl font-medium'
					>
						{cancelLabel}
					</Button>
					<Button
						variant={variant}
						onClick={onConfirm}
						disabled={isLoading}
						className='rounded-xl font-bold gap-2 min-w-[120px]'
					>
						{isLoading && <Loader2 className='h-4 w-4 animate-spin' />}
						{confirmLabel}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
