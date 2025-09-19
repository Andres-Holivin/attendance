import { NextRequest, NextResponse } from 'next/server';

/**
 * Configuration for backend services
 */
const BACKEND_SERVICES = {
  user: process.env.NEXT_PUBLIC_USER_API_URL,
  attendance: process.env.NEXT_PUBLIC_ATTENDANCE_API_URL,
  logging: process.env.NEXT_PUBLIC_LOGGING_API_URL,
} as const;

/**
 * Maps API route paths to backend services
 * Example: /api/auth/login → user service
 */
const PATH_TO_SERVICE_MAP = {
  auth: 'user',
  users: 'user', 
  attendance: 'attendance',
  logs: 'logging',
} as const;

type ServiceName = keyof typeof BACKEND_SERVICES;
type PathPrefix = keyof typeof PATH_TO_SERVICE_MAP;

/**
 * Determines which backend service to use based on the API path
 * @param pathSegments - Array of path segments from the URL
 * @returns Service name or null if no mapping found
 */
function determineTargetService(pathSegments: string[]): ServiceName | null {
  if (pathSegments.length === 0) return null;
  
  const firstSegment = pathSegments[0] as PathPrefix;
  return PATH_TO_SERVICE_MAP[firstSegment] || null;
}

/**
 * Builds the complete backend URL for the request
 * @param service - Backend service name
 * @param pathSegments - API path segments
 * @param searchParams - URL search parameters
 * @returns Complete backend URL
 */
function buildBackendUrl(
  service: ServiceName, 
  pathSegments: string[], 
  searchParams: URLSearchParams
): string {
  const baseUrl = BACKEND_SERVICES[service];
  
  if (!baseUrl) {
    throw new Error(`Backend URL not configured for service: ${service}`);
  }

  // Remove trailing slash and build path
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  const apiPath = pathSegments.join('/');
  
  // Add query parameters if present
  let url = `${cleanBaseUrl}/${apiPath}`;
  const queryString = searchParams.toString();
  if (queryString) {
    url += `?${queryString}`;
  }
  
  return url;
}

/**
 * Prepares headers for the backend request
 * @param request - Incoming Next.js request
 * @returns Headers object for backend request
 */
function prepareBackendHeaders(request: NextRequest): Headers {
  const headers = new Headers();
  
  // Headers to forward from client request
  const headersToForward = [
    'content-type',
    'authorization',
    'x-app-signature', // Important for backend service identification
    'user-agent',
  ];

  // Copy specified headers
  headersToForward.forEach((headerName) => {
    const headerValue = request.headers.get(headerName);
    if (headerValue) {
      headers.set(headerName, headerValue);
    }
  });

  // Forward cookies for session management
  const cookies = request.headers.get('cookie');
  if (cookies) {
    headers.set('Cookie', cookies);
  }

  // Always identify requests as coming from admin portal
  headers.set('X-App-Signature', 'admin-portal');

  return headers;
}

/**
 * Prepares the request body for different content types
 * @param request - Incoming Next.js request
 * @param method - HTTP method
 * @returns Request body or undefined
 */
async function prepareRequestBody(
  request: NextRequest, 
  method: string
): Promise<BodyInit | undefined> {
  // Only process body for methods that support it
  if (!['POST', 'PUT', 'PATCH'].includes(method)) {
    return undefined;
  }

  const contentType = request.headers.get('content-type');
  
  try {
    if (contentType?.includes('application/json')) {
      const jsonData = await request.json();
      return JSON.stringify(jsonData);
    } 
    
    if (contentType?.includes('multipart/form-data')) {
      // FormData handling - let fetch handle the content-type boundary
      return await request.formData();
    }
    
    // Default: treat as text
    return await request.text();
    
  } catch (error) {
    console.error('Error processing request body:', error);
    return undefined;
  }
}

/**
 * Makes the actual request to the backend service
 * @param targetUrl - Complete backend URL
 * @param method - HTTP method
 * @param headers - Request headers
 * @param body - Request body
 * @returns Backend response
 */
async function callBackendService(
  targetUrl: string,
  method: string, 
  headers: Headers,
  body?: BodyInit
): Promise<Response> {
  const requestOptions: RequestInit = {
    method,
    headers,
    credentials: 'include',
  };

  if (body) {
    requestOptions.body = body;
  }

  try {
    return await fetch(targetUrl, requestOptions);
  } catch (error) {
    console.error('Backend service call failed:', error);
    throw new Error(`Failed to connect to backend service: ${error}`);
  }
}

/**
 * Processes the backend response and creates a Next.js response
 * @param backendResponse - Response from backend service
 * @returns Next.js response
 */
async function processBackendResponse(backendResponse: Response): Promise<NextResponse> {
  try {
    // Get response content
    const responseText = await backendResponse.text();
    
    // Try to parse as JSON, fallback to text
    let responseData: any;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    // Create Next.js response with same status
    const nextResponse = new NextResponse(JSON.stringify(responseData), {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
    });

    // Forward all headers from backend (including cookies)
    backendResponse.headers.forEach((value, key) => {
      // Skip headers that Next.js manages automatically
      const skipHeaders = ['content-length', 'transfer-encoding'];
      if (!skipHeaders.includes(key.toLowerCase())) {
        nextResponse.headers.set(key, value);
      }
    });

    // Ensure JSON content type
    nextResponse.headers.set('content-type', 'application/json');

    return nextResponse;
    
  } catch (error) {
    console.error('Error processing backend response:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error processing backend response',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Main handler for all API proxy requests
 * @param request - Next.js request object
 * @param context - Route context with path parameters
 * @returns Next.js response
 */
async function handleApiProxyRequest(
  request: NextRequest, 
  context: { params: { path: string[] } }
): Promise<NextResponse> {
  const { path } = context.params;
  const { searchParams } = new URL(request.url);
  const method = request.method;

  console.log(`[API Proxy] ${method} /${path.join('/')}`);

  try {
    // Step 1: Determine which backend service to call
    const targetService = determineTargetService(path);
    if (!targetService) {
      return NextResponse.json(
        { 
          success: false, 
          message: `No backend service configured for path: /${path.join('/')}` 
        },
        { status: 404 }
      );
    }

    // Step 2: Build the complete backend URL
    const backendUrl = buildBackendUrl(targetService, path, searchParams);
    console.log(`[API Proxy] Forwarding to: ${backendUrl}`);

    // Step 3: Prepare headers and body for backend request
    const headers = prepareBackendHeaders(request);
    const body = await prepareRequestBody(request, method);

    // Step 4: Call the backend service
    const backendResponse = await callBackendService(backendUrl, method, headers, body);

    // Step 5: Process and return the response
    return await processBackendResponse(backendResponse);

  } catch (error) {
    console.error('[API Proxy] Request failed:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Proxy request failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * HTTP method handlers - all use the same main handler
 */
export async function GET(request: NextRequest, context: { params: { path: string[] } }) {
  return handleApiProxyRequest(request, context);
}

export async function POST(request: NextRequest, context: { params: { path: string[] } }) {
  return handleApiProxyRequest(request, context);
}

export async function PUT(request: NextRequest, context: { params: { path: string[] } }) {
  return handleApiProxyRequest(request, context);
}

export async function DELETE(request: NextRequest, context: { params: { path: string[] } }) {
  return handleApiProxyRequest(request, context);
}

export async function PATCH(request: NextRequest, context: { params: { path: string[] } }) {
  return handleApiProxyRequest(request, context);
}

export async function HEAD(request: NextRequest, context: { params: { path: string[] } }) {
  return handleApiProxyRequest(request, context);
}

export async function OPTIONS(request: NextRequest, context: { params: { path: string[] } }) {
  return handleApiProxyRequest(request, context);
}