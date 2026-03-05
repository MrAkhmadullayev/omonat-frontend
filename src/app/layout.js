import LayoutWrapper from '@/components/LayoutWrapper'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

export const metadata = {
	title: {
		default: 'OMONAT — Shaxsiy moliyaviy nazorat va qarzlar boshqaruvi',
		template: '%s | OMONAT',
	},
	description:
		'OMONAT — qarzlar, tushumlar va xarajatlarni oson boshqarish, moliyaviy rejalashtirish va shaxsiy hisob-kitoblarni amalga oshirish uchun eng qulay va zamonaviy tizim.',
	keywords: [
		'omonat',
		'qarzlar',
		'tushumlar',
		'mablag‘',
		'moliya',
		'xarajatlar',
		'uzbekistan',
		'fintech',
		'shaxsiy hamyon',
	],
	authors: [{ name: 'OMONAT Team' }],
	creator: 'OMONAT',
	publisher: 'OMONAT',
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	openGraph: {
		title: 'OMONAT — Moliyaviy erkinlik sari!',
		description:
			'Qarzlar va tushumlarni boshqarish endi yanada oson. OMONAT bilan moliyangiz har doim nazorat ostida.',
		url: 'https://omonat.uz',
		siteName: 'OMONAT',
		locale: 'uz_UZ',
		type: 'website',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'OMONAT — Moliyaviy Nazorat',
		description: 'Qarzlar va tushumlarni boshqarish tizimi',
		creator: '@omonat',
	},
	appleWebApp: {
		capable: true,
		statusBarStyle: 'black-translucent',
		title: 'OMONAT',
	},
}

export const viewport = {
	themeColor: '#000000',
	width: 'device-width',
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
}

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

export default function RootLayout({ children }) {
	return (
		<html lang='uz' className='scroll-smooth' suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-primary/10 flex flex-col min-h-screen bg-background`}
			>
				<LayoutWrapper>{children}</LayoutWrapper>
			</body>
		</html>
	)
}
