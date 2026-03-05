'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { adminApi } from '@/lib/api'
import {
	AlertCircle,
	ExternalLink,
	Search,
	ShieldAlert,
	ShieldCheck,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import useSWR from 'swr'

export default function UsersList() {
	const {
		data: users,
		isLoading,
		error,
		mutate,
	} = useSWR('/admin/users', adminApi.getUsers)
	const [search, setSearch] = useState('')

	if (isLoading) {
		return (
			<div className='space-y-6'>
				{/* Header skeleton */}
				<div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
					<Skeleton className='h-9 w-56' />
					<Skeleton className='h-10 w-full md:w-64 rounded-md' />
				</div>

				{/* Table card skeleton */}
				<Card className='border-border/50'>
					<CardHeader>
						<Skeleton className='h-6 w-52' />
					</CardHeader>
					<CardContent>
						<div className='space-y-0'>
							{/* Header row */}
							<div className='grid grid-cols-4 gap-4 pb-3 border-b border-border/50'>
								<Skeleton className='h-4 w-12' />
								<Skeleton className='h-4 w-24' />
								<Skeleton className='h-4 w-14' />
								<Skeleton className='h-4 w-16 ml-auto' />
							</div>
							{/* Data rows */}
							{[1, 2, 3, 4, 5].map(i => (
								<div
									key={i}
									className='grid grid-cols-4 gap-4 py-4 border-b border-border/30 items-center'
								>
									<Skeleton className='h-5 w-28' />
									<div className='space-y-1.5'>
										<Skeleton className='h-4 w-28' />
										<Skeleton className='h-3 w-36' />
									</div>
									<Skeleton className='h-6 w-24 rounded-full' />
									<div className='flex gap-2 justify-end'>
										<Skeleton className='h-8 w-20 rounded-md' />
										<Skeleton className='h-8 w-20 rounded-md' />
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
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
					{error.message || 'Foydalanuvchilarni yuklashda muammo yuzaga keldi.'}
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

	const filteredUsers = users.filter(
		user =>
			user.name.toLowerCase().includes(search.toLowerCase()) ||
			user.phone.includes(search) ||
			user.email.toLowerCase().includes(search.toLowerCase()),
	)

	const handleToggleBlock = async (id, isBlocked) => {
		try {
			await adminApi.toggleBlock(id)
			toast.success(
				isBlocked
					? 'Foydalanuvchi blokdan chiqarildi'
					: 'Foydalanuvchi bloklandi',
			)
			mutate()
		} catch (err) {
			toast.error('Xatolik: ' + err.message)
		}
	}

	return (
		<div className='space-y-6'>
			<div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
				<h1 className='text-3xl font-bold tracking-tight'>
					Foydalanuvchilar Paneli
				</h1>
				<div className='relative w-full md:w-64'>
					<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
					<Input
						placeholder='Foydalanuvchi qidirish...'
						className='pl-9'
						value={search}
						onChange={e => setSearch(e.target.value)}
					/>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>
						Barcha foydalanuvchilar ({filteredUsers.length})
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='overflow-x-auto'>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Ism</TableHead>
									<TableHead>Telefon/Email</TableHead>
									<TableHead>Holati</TableHead>
									<TableHead className='text-right'>Amallar</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredUsers.map(user => (
									<TableRow key={user._id}>
										<TableCell className='font-medium'>{user.name}</TableCell>
										<TableCell>
											<div className='text-sm'>{user.phone}</div>
											<div className='text-xs text-muted-foreground'>
												{user.email}
											</div>
										</TableCell>
										<TableCell>
											{user.isBlocked ? (
												<span className='inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700'>
													<ShieldAlert className='h-3 w-3' /> Bloklangan
												</span>
											) : (
												<span className='inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700'>
													<ShieldCheck className='h-3 w-3' /> Faol
												</span>
											)}
										</TableCell>
										<TableCell className='text-right space-x-2'>
											<Link href={`/admin/users/${user._id}`}>
												<Button variant='outline' size='sm' className='gap-2'>
													<ExternalLink className='h-4 w-4' /> Ko'rish
												</Button>
											</Link>
											<Button
												variant={user.isBlocked ? 'default' : 'destructive'}
												size='sm'
												onClick={() =>
													handleToggleBlock(user._id, user.isBlocked)
												}
											>
												{user.isBlocked ? 'Tiklash' : 'Bloklash'}
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
