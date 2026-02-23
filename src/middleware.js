import { NextResponse } from 'next/server'

export function middleware(request) {
	const { nextUrl, cookies, url } = request
	const path = nextUrl.pathname

	const isAuthRoute = path.startsWith('/authentication')
	const token = cookies.get('jwt')?.value
	const hasValidToken = token && token !== 'loggedout'

	if (isAuthRoute && hasValidToken) {
		return NextResponse.redirect(new URL('/', url))
	}

	if (!isAuthRoute && !hasValidToken) {
		return NextResponse.redirect(new URL('/authentication/login', url))
	}

	return NextResponse.next()
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
