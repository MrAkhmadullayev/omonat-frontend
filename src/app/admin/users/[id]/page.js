'use client'

import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { adminApi } from '@/lib/api'
import { formatMoney } from '@/lib/formatters'
import { format } from 'date-fns'
import { uz } from 'date-fns/locale'
import {
	AlertCircle,
	ArrowLeft,
	CreditCard,
	Receipt,
	Wallet,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import useSWR from 'swr'

export default function UserDetail() {
	const { id } = useParams()
	const { data, isLoading, error } = useSWR(
		id ? `/admin/users/${id}` : null,
		() => adminApi.getUserData(id),
	)

	if (isLoading) {
		return (
			<div className='space-y-8'>
				{/* Header skeleton */}
				<div className='flex items-center gap-4'>
					<Skeleton className='h-10 w-10 rounded-full' />
					<div>
						<Skeleton className='h-9 w-48 mb-2' />
						<Skeleton className='h-4 w-64' />
					</div>
				</div>

				{/* 3 cards skeleton */}
				<div className='grid gap-6 lg:grid-cols-3'>
					{[1, 2, 3].map(i => (
						<Card key={i} className='lg:col-span-1 border-border/50'>
							<CardHeader className='flex flex-row items-center justify-between'>
								<div>
									<Skeleton className='h-5 w-20 mb-2' />
									<Skeleton className='h-3 w-40' />
								</div>
								<Skeleton className='h-5 w-5 rounded-full' />
							</CardHeader>
							<CardContent>
								<div className='space-y-4'>
									{[1, 2, 3].map(j => (
										<div
											key={j}
											className='flex items-center justify-between border-b border-border/30 pb-3 last:border-0'
										>
											<div className='space-y-1.5'>
												<Skeleton className='h-4 w-28' />
												<Skeleton className='h-3 w-20' />
											</div>
											<div className='space-y-1.5 text-right'>
												<Skeleton className='h-5 w-24 ml-auto' />
												<Skeleton className='h-3 w-20 ml-auto' />
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className='flex flex-1 flex-col items-center justify-center p-8 text-center min-h-[50vh]'>
				<div className='w-16 h-16 bg-red-100 dark:bg-red-900/30 text-destructive rounded-full flex items-center justify-center mb-4 ring-8 ring-red-50 dark:ring-red-900/10'>
					<AlertCircle className='w-8 h-8' />
				</div>
				<h2 className='text-xl font-bold mb-2 text-foreground'>
					Xatolik yuz berdi
				</h2>
				<p className='text-sm text-muted-foreground mb-6 max-w-sm'>
					{error.message || "Ma'lumotlarni yuklashda muammo yuzaga keldi."}
				</p>
				<Button
					onClick={() => window.location.reload()}
					size='lg'
					className='rounded-xl font-bold px-8 shadow-lg shadow-primary/20'
				>
					Qayta urinib ko'rish
				</Button>
			</div>
		)
	}

	const { user, debts, receivables, expenses } = data

	return (
		<div className='space-y-8'>
			<div className='flex items-center gap-4'>
				<Link href='/admin/users'>
					<Button variant='outline' size='icon' className='rounded-full'>
						<ArrowLeft className='h-4 w-4' />
					</Button>
				</Link>
				<div>
					<h1 className='text-3xl font-bold tracking-tight'>{user.name}</h1>
					<p className='text-muted-foreground'>
						{user.phone} • {user.email}
					</p>
				</div>
			</div>

			<div className='grid gap-6 lg:grid-cols-3'>
				{/* Debts Table */}
				<Card className='lg:col-span-1'>
					<CardHeader className='flex flex-row items-center justify-between'>
						<div>
							<CardTitle>Qarzlar</CardTitle>
							<CardDescription>Boshqalarga berilishi kerak</CardDescription>
						</div>
						<CreditCard className='h-5 w-5 text-red-500' />
					</CardHeader>
					<CardContent>
						<div className='space-y-4'>
							{debts.map(debt => (
								<div
									key={debt._id}
									className='flex items-center justify-between border-b pb-2 last:border-0'
								>
									<div>
										<p className='font-medium'>{debt.creditorName}</p>
										<p className='text-xs text-muted-foreground'>
											{format(new Date(debt.dateTaken), 'dd MMM yyyy', {
												locale: uz,
											})}
										</p>
									</div>
									<div className='text-right'>
										<p className='font-bold text-red-600'>
											-{formatMoney(debt.amount)}
										</p>
										<p className='text-xs font-medium'>
											Qoldiq: {formatMoney(debt.amount - debt.paidAmount)}
										</p>
									</div>
								</div>
							))}
							{debts.length === 0 && (
								<p className='text-center text-sm text-muted-foreground py-4'>
									Ma'lumot yo'q
								</p>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Receivables Table */}
				<Card className='lg:col-span-1'>
					<CardHeader className='flex flex-row items-center justify-between'>
						<div>
							<CardTitle>Haqlar</CardTitle>
							<CardDescription>Kutilayotgan tushumlar</CardDescription>
						</div>
						<Wallet className='h-5 w-5 text-blue-500' />
					</CardHeader>
					<CardContent>
						<div className='space-y-4'>
							{receivables.map(item => (
								<div
									key={item._id}
									className='flex items-center justify-between border-b pb-2 last:border-0'
								>
									<div>
										<p className='font-medium'>{item.debtor}</p>
										<p className='text-xs text-muted-foreground'>
											{format(new Date(item.createdAt), 'dd MMM yyyy', {
												locale: uz,
											})}
										</p>
									</div>
									<div className='text-right'>
										<p className='font-bold text-blue-600'>
											+{formatMoney(item.amount)}
										</p>
										<p className='text-xs font-medium'>
											Kutilmoqda:{' '}
											{formatMoney(item.amount - item.receivedAmount)}
										</p>
									</div>
								</div>
							))}
							{receivables.length === 0 && (
								<p className='text-center text-sm text-muted-foreground py-4'>
									Ma'lumot yo'q
								</p>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Expenses Table */}
				<Card className='lg:col-span-1'>
					<CardHeader className='flex flex-row items-center justify-between'>
						<div>
							<CardTitle>Xarajatlar</CardTitle>
							<CardDescription>Joriy sarf-xarajatlar</CardDescription>
						</div>
						<Receipt className='h-5 w-5 text-orange-500' />
					</CardHeader>
					<CardContent>
						<div className='space-y-4'>
							{expenses.map(exp => (
								<div
									key={exp._id}
									className='flex items-center justify-between border-b pb-2 last:border-0'
								>
									<div>
										<p className='font-medium'>{exp.title}</p>
										<p className='text-xs text-muted-foreground'>
											{format(new Date(exp.date), 'dd MMM yyyy', {
												locale: uz,
											})}
										</p>
									</div>
									<div className='text-right'>
										<p className='font-bold text-orange-600'>
											{formatMoney(exp.amount)}
										</p>
										<p className='text-xs text-muted-foreground'>
											{exp.category}
										</p>
									</div>
								</div>
							))}
							{expenses.length === 0 && (
								<p className='text-center text-sm text-muted-foreground py-4'>
									Ma'lumot yo'q
								</p>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
