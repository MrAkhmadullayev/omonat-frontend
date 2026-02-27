'use client'

import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { adminApi } from '@/lib/api'
import {
	ArrowRight,
	CreditCard,
	LoaderIcon,
	Receipt,
	Users,
	Wallet,
} from 'lucide-react'
import Link from 'next/link'
import useSWR from 'swr'

const formatMoney = amount => {
	return new Intl.NumberFormat('uz-UZ', {
		style: 'currency',
		currency: 'UZS',
		maximumFractionDigits: 0,
	}).format(amount)
}

export default function AdminDashboard() {
	const {
		data: stats,
		isLoading,
		error,
	} = useSWR('/admin/stats', adminApi.getStats)

	if (isLoading) {
		return (
			<div className='flex h-64 items-center justify-center'>
				<LoaderIcon className='size-8 animate-spin text-primary' />
			</div>
		)
	}

	if (error) {
		return (
			<div className='p-8 text-center text-red-500'>
				Xatolik yuz berdi: {error.message}
			</div>
		)
	}

	return (
		<div className='space-y-8'>
			<div className='flex items-center justify-between'>
				<h1 className='text-3xl font-bold tracking-tight'>
					Tizim Nazorati (Admin)
				</h1>
			</div>

			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				<Card className='hover:shadow-lg transition-all'>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Jami Foydalanuvchilar
						</CardTitle>
						<Users className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{stats.totalUsers}</div>
						<p className='text-xs text-muted-foreground'>Faol hisoblar</p>
					</CardContent>
				</Card>

				<Card className='hover:shadow-lg transition-all'>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Jami Berilgan Qarzlar
						</CardTitle>
						<CreditCard className='h-4 w-4 text-red-500' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-red-600'>
							{formatMoney(stats.totalDebt)}
						</div>
						<p className='text-xs text-muted-foreground'>
							To'langan: {formatMoney(stats.totalDebtPaid)}
						</p>
					</CardContent>
				</Card>

				<Card className='hover:shadow-lg transition-all'>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Jami Kutilayotgan Haqlar
						</CardTitle>
						<Wallet className='h-4 w-4 text-blue-500' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-blue-600'>
							{formatMoney(stats.totalReceivable)}
						</div>
						<p className='text-xs text-muted-foreground'>
							Olingan: {formatMoney(stats.totalReceivableReceived)}
						</p>
					</CardContent>
				</Card>

				<Card className='hover:shadow-lg transition-all'>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Jami Sarflangan Xarajatlar
						</CardTitle>
						<Receipt className='h-4 w-4 text-orange-500' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-orange-600'>
							{formatMoney(stats.totalExpense)}
						</div>
						<p className='text-xs text-muted-foreground'>
							Tizimdagi umumiy sarf
						</p>
					</CardContent>
				</Card>
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
