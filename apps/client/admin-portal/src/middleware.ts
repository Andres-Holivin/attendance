import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

async function GetSessionAuth(req: NextRequest): Promise<boolean> {
    let isAuthenticated = false;
    try {
        // Try different possible session cookie names
        const sessionCookie = req.cookies.get('sessionId') ||
            req.cookies.get('connect.sid') ||
            req.cookies.get('session');
        const cookies = req.headers.get('cookie') || '';

        console.log('Middleware: All cookies from headers:', cookies);
        console.log('Middleware: Session cookie from cookies API:', sessionCookie);
        console.log('Middleware: All cookies from cookies API:', req.cookies.getAll());

        // TEMPORARY: Use direct backend call for testing
        const apiUrl = process.env.USER_API_URL || process.env.NEXT_PUBLIC_USER_API_URL || "http://localhost:3002";
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

        // Build headers with cookies
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'x-app-signature': 'admin-portal'
        };

        // Add cookies if available
        if (cookies) {
            headers['Cookie'] = cookies;
        }

        const response = await fetch(`${apiUrl}/auth/me`, {
            method: 'GET',
            headers,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const responseBody = await response.json();

        if (response.ok || responseBody.success) {
            isAuthenticated = responseBody.success === true;
        } else {
            throw new Error(`Auth check failed with status ${JSON.stringify(responseBody)} ${JSON.stringify(response)}`);
        }
    } catch (error) {
        // Log error but don't crash
        console.error("Middleware auth check failed:", error);
        isAuthenticated = false;
    }
    return isAuthenticated;
}

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // TEMPORARY: Disable middleware authentication for testing
    console.log(`Middleware: path=${pathname} - AUTHENTICATION DISABLED FOR TESTING`);
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|.*\\.png$|.*\\.svg$|.*\\.ico$).*)',
    ],
}