import { api, buildUrlWithParams } from "@/lib/proxy-api"

export interface ApiLog {
  id: number;
  method: string;
  endpoint: string;
  status: number;
  request: any;
  response: any;
  ip?: string;
  userAgent?: string;
  userId?: string;
  userEmail?: string;
  sessionId?: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiLogFilters {
  method?: string;
  status?: number;
  userId?: string;
  userEmail?: string;
  sessionId?: string;
  startDate?: string;
  endDate?: string;
}

export interface CursorPaginationResponse {
  logs: ApiLog[];
  pagination: {
    limit: number;
    hasNextPage: boolean;
    nextCursor: string | null;
  };
}

export interface PagePaginationResponse {
  logs: ApiLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const LoggingService = {
  /**
   * Get logs with traditional page-based pagination
   */
  getLogs: async (page = 1, limit = 25, filters?: ApiLogFilters): Promise<PagePaginationResponse> => {
    const params = {
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    };

    const url = buildUrlWithParams('/logs', params);
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Get available HTTP methods for filtering
   */
  getHttpMethods: () => [
    'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'
  ],

  /**
   * Get common HTTP status codes for filtering
   */
  getStatusCodes: () => [
    { value: 200, label: '200 - OK' },
    { value: 201, label: '201 - Created' },
    { value: 400, label: '400 - Bad Request' },
    { value: 401, label: '401 - Unauthorized' },
    { value: 403, label: '403 - Forbidden' },
    { value: 404, label: '404 - Not Found' },
    { value: 500, label: '500 - Internal Server Error' },
  ],
};