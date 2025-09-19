export interface PaginatedResponse<T> {
    success: boolean
    message: string
    data: T
}

export interface ApiResponse<T> {
    success: boolean
    message: string
    data?: T
    error?: string
}

export interface PaginationInfo {
    page: number
    limit: number
    total: number
    totalPages: number
}

export interface ErrorResponse {
    success: false
    message: string
    error: string
}