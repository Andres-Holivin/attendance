import { NextRequest, NextResponse } from 'next/server';

const USER_API_URL = process.env.USER_API_URL || process.env.NEXT_PUBLIC_USER_API_URL;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const response = await fetch(`${USER_API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-app-signature': 'admin-portal',
            },
            body: JSON.stringify(body),
            credentials: 'include',
        });

        const data = await response.json();

        // Create Next.js response
        const nextResponse = NextResponse.json(data, { status: response.status });

        // Forward ALL Set-Cookie headers from the backend
        const setCookieHeaders = response.headers.get('set-cookie');
        if (setCookieHeaders) {
            // Handle multiple Set-Cookie headers
            const cookies = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
            cookies.forEach(cookie => {
                nextResponse.headers.append('Set-Cookie', cookie);
            });
        }

        // Also try to get all cookies from response headers
        response.headers.forEach((value, key) => {
            if (key.toLowerCase() === 'set-cookie') {
                nextResponse.headers.append('Set-Cookie', value);
            }
        });

        console.log('Login API - Response status:', response.status);
        console.log('Login API - Set-Cookie headers:', setCookieHeaders);
        console.log('Login API - Response data:', data);

        return nextResponse;
    } catch (error) {
        console.error('Login API route error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}