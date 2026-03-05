import { Car, Home, Settings, ShoppingBag, Utensils } from 'lucide-react'

export const CONTAINER_VARIANTS = {
	hidden: { opacity: 0 },
	show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

export const ITEM_VARIANTS = {
	hidden: { opacity: 0, y: 15 },
	show: {
		opacity: 1,
		y: 0,
		transition: { type: 'spring', stiffness: 400, damping: 30 },
	},
}

export const PAGE_VARIANTS = {
	hidden: { opacity: 0, y: 15 },
	show: {
		opacity: 1,
		y: 0,
		transition: { type: 'spring', stiffness: 400, damping: 30 },
	},
}

export const CATEGORY_MAP = {
	food: {
		label: 'Oziq-ovqat',
		icon: Utensils,
		color:
			'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
		border: 'border-orange-200 dark:border-orange-900',
	},
	transport: {
		label: 'Transport',
		icon: Car,
		color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
		border: 'border-blue-200 dark:border-blue-900',
	},
	shopping: {
		label: 'Xaridlar',
		icon: ShoppingBag,
		color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
		border: 'border-pink-200 dark:border-pink-900',
	},
	house: {
		label: 'Uy-joy',
		icon: Home,
		color:
			'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
		border: 'border-purple-200 dark:border-purple-900',
	},
	services: {
		label: 'Xizmatlar',
		icon: Settings,
		color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
		border: 'border-slate-200 dark:border-slate-700',
	},
}

export const CURRENCY_OPTIONS = [
	{ value: 'UZS', label: "So'm (UZS)" },
	{ value: 'USD', label: 'Dollar (USD)' },
]
