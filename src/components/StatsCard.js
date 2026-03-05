'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ITEM_VARIANTS } from '@/lib/constants'
import { motion } from 'framer-motion'

export default function StatsCard({
	title,
	value,
	icon: Icon,
	iconBg = 'bg-muted',
	iconColor = 'text-muted-foreground',
	valueColor = 'text-foreground',
	subtitle,
	className = '',
	animated = true,
}) {
	const Wrapper = animated ? motion.div : 'div'
	const wrapperProps = animated ? { variants: ITEM_VARIANTS } : {}

	return (
		<Wrapper {...wrapperProps}>
			<Card
				className={`hover:shadow-md transition-all duration-300 border-border/50 bg-background/80 backdrop-blur-sm h-full ${className}`}
			>
				<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
					<CardTitle className='text-sm font-bold text-muted-foreground'>
						{title}
					</CardTitle>
					{Icon && (
						<div className={`p-2 ${iconBg} rounded-xl`}>
							<Icon className={`h-4 w-4 ${iconColor}`} />
						</div>
					)}
				</CardHeader>
				<CardContent>
					<div className={`text-2xl font-black ${valueColor}`}>{value}</div>
					{subtitle && (
						<p className='mt-1 text-xs text-muted-foreground'>{subtitle}</p>
					)}
				</CardContent>
			</Card>
		</Wrapper>
	)
}
