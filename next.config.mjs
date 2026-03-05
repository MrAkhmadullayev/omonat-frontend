/** @type {import('next').NextConfig} */
const nextConfig = {
	async rewrites() {
		return [
			{
				source: '/api/:path*',
				destination: 'http://13.60.93.106:2026/api/:path*',
			},
		]
	},
}

export default nextConfig
