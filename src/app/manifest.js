export default function manifest() {
	return {
		name: 'OMONAT — Shaxsiy moliyaviy nazorat va qarzlar boshqaruvi',
		short_name: 'OMONAT',
		description:
			'OMONAT — qarzlar, tushumlar va xarajatlarni oson boshqarish tizimi.',
		start_url: '/',
		display: 'standalone',
		background_color: '#000000',
		theme_color: '#000000',
		icons: [
			{
				src: '/favicon.ico',
				sizes: 'any',
				type: 'image/x-icon',
			},
			{
				src: '/icon.ico',
				sizes: '512x512',
				type: 'image/x-icon',
			},
			{
				src: '/apple-icon.ico',
				sizes: '512x512',
				type: 'image/x-icon',
			},
		],
	}
}
