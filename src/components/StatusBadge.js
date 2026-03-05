'use client'

import { Badge } from '@/components/ui/badge'

const STATUS_CONFIG = {
	debt: {
		paid: {
			label: "To'langan",
			className:
				'bg-green-500/10 text-green-600 hover:bg-green-500/20 border-none',
		},
		partial: {
			label: 'Qisman',
			className:
				'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-none',
		},
		pending: {
			label: "To'lanmagan",
			className: 'bg-red-500/10 text-red-600 hover:bg-red-500/20 border-none',
		},
	},
	receivable: {
		paid: {
			label: "To'liq olindi",
			className: 'bg-green-500 hover:bg-green-600 shadow-sm text-white',
		},
		partial: {
			label: 'Qisman olindi',
			className: 'bg-orange-500 hover:bg-orange-600 shadow-sm text-white',
		},
		pending: {
			label: 'Olinmagan',
			className:
				'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm',
		},
	},
}

export default function StatusBadge({ status, type = 'debt' }) {
	const config = STATUS_CONFIG[type]?.[status]
	if (!config) return <Badge variant='secondary'>Noma'lum</Badge>

	return <Badge className={config.className}>{config.label}</Badge>
}
