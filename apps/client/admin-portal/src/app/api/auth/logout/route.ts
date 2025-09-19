import { NextRequest, NextResponse } from 'next/server';

const USER_API_URL = process.env.USER_API_URL || process.env.NEXT_PUBLIC_USER_API_URL;

export async function POST(request: NextRequest) {
    try {
        // Forward cookies from the browser request
        const cookies = request.headers.get('cookie') || '';

        const response = await fetch(`${USER_API_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookies,
                'x-app-signature': 'admin-portal',
            },
            credentials: 'include',
        });

        const data = await response.json();

        // Create Next.js response
        const nextResponse = NextResponse.json(data, { status: response.status });

        // Forward any Set-Cookie headers from the backend (for cookie clearing)
        const setCookieHeader = response.headers.get('set-cookie');
        if (setCookieHeader) {
            nextResponse.headers.set('Set-Cookie', setCookieHeader);
        }

        return nextResponse;
    } catch (error) {
        console.error('Logout API route error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}