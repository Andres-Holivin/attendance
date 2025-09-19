/**
 * Client-side API utilities for making requests through the Next.js proxy
 * 
 * This module provides a clean interface for making API calls that automatically
 * go through the Next.js API proxy instead of directly to backend services.
 */

/**
 * Standard API response structure
 */
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}

/**
 * Custom error class for API-related errors
 */
export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public response?: any
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Converts a relative API path to the full proxy path
 * @param path - API path (e.g., '/users' or '/attendance/today')
 * @returns Full proxy path (e.g., '/api/users' or '/api/attendance/today')
 */
function buildProxyPath(path: string): string {
    // Ensure path starts with /api for the proxy
    return path.startsWith('/api') ? path : `/api${path}`;
}

/**
 * Prepares default headers for API requests
 * @param customHeaders - Any additional headers to include
 * @returns Headers object with defaults and custom headers
 */
function prepareRequestHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    const defaultHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    return {
        ...defaultHeaders,
        ...customHeaders,
    };
}

/**
 * Processes the raw fetch response and handles errors
 * @param response - Raw fetch response
 * @returns Parsed response data
 * @throws ApiError if the request failed
 */
async function processResponse<T>(response: Response): Promise<T> {
    // Parse response content
    let responseData: any;
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
        responseData = await response.json();
    } else {
        responseData = await response.text();
    }

    // Handle non-2xx responses
    if (!response.ok) {
        const errorMessage = responseData?.message ||
            responseData?.error ||
            `HTTP ${response.status}: ${response.statusText}`;

        throw new ApiError(errorMessage, response.status, responseData);
    }

    return responseData;
}

/**
 * Core function for making API requests through the proxy
 * @param path - API endpoint path
 * @param options - Fetch options (method, body, headers, etc.)
 * @returns Promise with parsed response data
 */
export async function makeApiRequest<T = any>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    try {
        const proxyPath = buildProxyPath(path);

        // Prepare headers
        let headers = prepareRequestHeaders(options.headers as Record<string, string>);

        // Special handling for FormData - don't set Content-Type
        if (options.body instanceof FormData) {
            const { 'Content-Type': _, ...headersWithoutContentType } = headers;
            headers = headersWithoutContentType;
        }

        // Make the request
        const response = await fetch(proxyPath, {
            credentials: 'include', // Always include cookies for session management
            ...options,
            headers,
        });

        return await processResponse<T>(response);

    } catch (error) {
        // Re-throw ApiError as-is
        if (error instanceof ApiError) {
            throw error;
        }

        // Handle network or other errors
        console.error('[API Request] Failed:', error);
        throw new ApiError(
            error instanceof Error ? error.message : 'Network request failed',
            0,
            error
        );
    }
}

/**
 * Convenience methods for different HTTP verbs
 * These provide a clean, intuitive interface for common API operations
 */
export const api = {
    /**
     * Makes a GET request
     * @param path - API endpoint path
     * @param options - Additional fetch options
     */
    get: <T = any>(path: string, options?: RequestInit): Promise<T> =>
        makeApiRequest<T>(path, { ...options, method: 'GET' }),

    /**
     * Makes a POST request with data
     * @param path - API endpoint path  
     * @param data - Data to send (will be JSON stringified unless it's FormData)
     * @param options - Additional fetch options
     */
    post: <T = any>(path: string, data?: any, options?: RequestInit): Promise<T> =>
        makeApiRequest<T>(path, {
            ...options,
            method: 'POST',
            body: data instanceof FormData ? data : JSON.stringify(data),
        }),

    /**
     * Makes a PUT request with data
     * @param path - API endpoint path
     * @param data - Data to send (will be JSON stringified unless it's FormData)
     * @param options - Additional fetch options
     */
    put: <T = any>(path: string, data?: any, options?: RequestInit): Promise<T> =>
        makeApiRequest<T>(path, {
            ...options,
            method: 'PUT',
            body: data instanceof FormData ? data : JSON.stringify(data),
        }),

    /**
     * Makes a PATCH request with data
     * @param path - API endpoint path
     * @param data - Data to send (will be JSON stringified unless it's FormData)
     * @param options - Additional fetch options
     */
    patch: <T = any>(path: string, data?: any, options?: RequestInit): Promise<T> =>
        makeApiRequest<T>(path, {
            ...options,
            method: 'PATCH',
            body: data instanceof FormData ? data : JSON.stringify(data),
        }),

    /**
     * Makes a DELETE request
     * @param path - API endpoint path
     * @param options - Additional fetch options
     */
    delete: <T = any>(path: string, options?: RequestInit): Promise<T> =>
        makeApiRequest<T>(path, { ...options, method: 'DELETE' }),
};

/**
 * Utility function to build URLs with query parameters
 * @param basePath - Base API path
 * @param params - Object with query parameters
 * @returns Path with query string appended
 * 
 * @example
 * buildUrlWithParams('/users', { page: 1, limit: 10 })
 * // Returns: '/users?page=1&limit=10'
 */
export function buildUrlWithParams(basePath: string, params: Record<string, any> = {}): string {
    const url = new URL(basePath, 'http://localhost'); // Base URL doesn't matter for relative paths

    // Add each parameter to the URL
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            url.searchParams.append(key, String(value));
        }
    });

    return url.pathname + url.search;
}

/**
 * Legacy alias for backward compatibility
 * @deprecated Use makeApiRequest instead
 */
export const apiCall = makeApiRequest;