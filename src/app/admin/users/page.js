'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
	ExternalLink,
	LoaderIcon,
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
			<div className='flex h-64 items-center justify-center'>
				<LoaderIcon className='size-8 animate-spin text-primary' />
			</div>
		)
	}

	if (error) {
		return (
			<div className='p-8 text-center text-red-500'>
				Xatolik: {error.message}
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
