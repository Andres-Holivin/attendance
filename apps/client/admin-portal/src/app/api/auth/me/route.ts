import { NextRequest, NextResponse } from 'next/server';

const USER_API_URL = process.env.USER_API_URL || process.env.NEXT_PUBLIC_USER_API_URL;

export async function GET(request: NextRequest) {
    try {
        // Forward cookies from the browser request
        const cookies = request.headers.get('cookie') || '';

        const response = await fetch(`${USER_API_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookies,
                'x-app-signature': 'admin-portal',
            },
            credentials: 'include',
        });

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Me API route error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}