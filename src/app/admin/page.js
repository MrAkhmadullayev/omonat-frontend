'use client'

import ErrorState from '@/components/ErrorState'
import StatsCard from '@/components/StatsCard'
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
import { ArrowRight, CreditCard, Receipt, Users, Wallet } from 'lucide-react'
import Link from 'next/link'
import useSWR from 'swr'

export default function AdminDashboard() {
	const {
		data: stats,
		isLoading,
		error,
	} = useSWR('/admin/stats', adminApi.getStats)

	if (isLoading) {
		return (
			<div className='space-y-8'>
				<Skeleton className='h-9 w-64' />
				<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
					{[1, 2, 3, 4].map(i => (
						<Card key={i} className='border-border/50'>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<Skeleton className='h-4 w-32' />
								<Skeleton className='h-4 w-4 rounded-full' />
							</CardHeader>
							<CardContent>
								<Skeleton className='h-8 w-40 mb-2' />
								<Skeleton className='h-3 w-24' />
							</CardContent>
						</Card>
					))}
				</div>
				<div className='grid gap-4 md:grid-cols-1 lg:grid-cols-2'>
					<Card className='col-span-1 border-border/50'>
						<CardHeader>
							<Skeleton className='h-6 w-40 mb-2' />
							<Skeleton className='h-4 w-72' />
						</CardHeader>
						<CardContent className='space-y-4'>
							<Skeleton className='h-10 w-full rounded-md' />
						</CardContent>
					</Card>
				</div>
			</div>
		)
	}

	if (error) {
		return <ErrorState message={error.message} />
	}

	return (
		<div className='space-y-8'>
			<div className='flex items-center justify-between'>
				<h1 className='text-3xl font-bold tracking-tight'>
					Tizim Nazorati (Admin)
				</h1>
			</div>

			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				<StatsCard
					title='Jami Foydalanuvchilar'
					value={stats.totalUsers}
					icon={Users}
					subtitle='Faol hisoblar'
					animated={false}
				/>
				<StatsCard
					title='Jami Berilgan Qarzlar'
					value={formatMoney(stats.totalDebt)}
					valueColor='text-red-600'
					icon={CreditCard}
					iconBg='bg-red-100/80 dark:bg-red-900/30'
					iconColor='text-red-500'
					subtitle={`To'langan: ${formatMoney(stats.totalDebtPaid)}`}
					animated={false}
				/>
				<StatsCard
					title='Jami Kutilayotgan Haqlar'
					value={formatMoney(stats.totalReceivable)}
					valueColor='text-blue-600'
					icon={Wallet}
					iconBg='bg-blue-100/80 dark:bg-blue-900/30'
					iconColor='text-blue-500'
					subtitle={`Olingan: ${formatMoney(stats.totalReceivableReceived)}`}
					animated={false}
				/>
				<StatsCard
					title='Jami Sarflangan Xarajatlar'
					value={formatMoney(stats.totalExpense)}
					valueColor='text-orange-600'
					icon={Receipt}
					iconBg='bg-orange-100/80 dark:bg-orange-900/30'
					iconColor='text-orange-500'
					subtitle='Tizimdagi umumiy sarf'
					animated={false}
				/>
			</div>

			<div className='grid gap-4 md:grid-cols-1 lg:grid-cols-2'>
				<Card className='col-span-1'>
					<CardHeader>
						<CardTitle>Boshqaruv Paneli</CardTitle>
						<CardDescription>
							Foydalanuvchilar va ularning ma'lumotlarini boshqaring
						</CardDescription>
					</CardHeader>
					<CardContent className='space-y-4'>
						<Link href='/admin/users'>
							<Button className='w-full justify-between' variant='outline'>
								<span>Foydalanuvchilar Ro'yxati</span>
								<ArrowRight className='h-4 w-4' />
							</Button>
						</Link>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
