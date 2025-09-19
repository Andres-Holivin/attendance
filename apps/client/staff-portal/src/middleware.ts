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

        // Use local API route instead of direct backend call
        const apiUrl = new URL('/api/auth/me', req.url);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

        // Build headers with cookies
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        // Add cookies if available
        if (cookies) {
            headers['Cookie'] = cookies;
        }

        const response = await fetch(apiUrl, {
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

    // Define public routes that don't require authentication

    const publicPaths = ["/auth"];
    // Check if the current path is public
    const isPublicPath = pathname === "/" || publicPaths.some(path => pathname.startsWith(path + "/"));

    let isAuthenticated = false;

    // Only check authentication if we need to
    if (!isPublicPath) {
        isAuthenticated = await GetSessionAuth(req);
    }

    console.log(`Middleware: path=${pathname}, isPublic=${isPublicPath} , isAuth=${isAuthenticated}`);


    if (isPublicPath === true && isAuthenticated === true) {
        // Redirect authenticated users away from auth pages
        const redirectTo = req.nextUrl.searchParams.get("redirect") || "/dashboard";
        return NextResponse.redirect(new URL(redirectTo, req.url));
    }

    if (isPublicPath === false && isAuthenticated === false) {
        // Redirect unauthenticated users to sign-in
        const signInUrl = new URL("/auth/sign-in", req.url);
        signInUrl.searchParams.set("redirect", pathname); // Save where they wanted to go
        return NextResponse.redirect(signInUrl);
    }

    // Allow the request to continue
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|.*\\.png$|.*\\.svg$|.*\\.ico$).*)',
    ],
}