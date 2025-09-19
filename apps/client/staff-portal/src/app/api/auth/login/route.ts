import { NextRequest, NextResponse } from 'next/server';

const USER_API_URL = process.env.USER_API_URL || process.env.NEXT_PUBLIC_USER_API_URL;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const response = await fetch(`${USER_API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-app-signature': 'staff-portal',
            },
            body: JSON.stringify(body),
            credentials: 'include',
        });

        const data = await response.json();

        // Create Next.js response
        const nextResponse = NextResponse.json(data, { status: response.status });

        // Forward any Set-Cookie headers from the backend
        const setCookieHeader = response.headers.get('set-cookie');
        if (setCookieHeader) {
            nextResponse.headers.set('Set-Cookie', setCookieHeader);
        }

        return nextResponse;
    } catch (error) {
        console.error('Login API route error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}