import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyBasicAuth } from './lib/auth';

export function middleware(request: NextRequest) {
    // Check if the route is under /admin
    if (request.nextUrl.pathname.startsWith('/admin')) {
        const authHeader = request.headers.get('authorization');

        if (!verifyBasicAuth(authHeader)) {
            return new NextResponse('Authentication required', {
                status: 401,
                headers: {
                    'WWW-Authenticate': 'Basic realm="Admin Area"'
                }
            });
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/admin/:path*'
};
