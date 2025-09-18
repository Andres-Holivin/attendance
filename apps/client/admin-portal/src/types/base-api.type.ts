export interface BaseApiResponse<T = any> {
    success: boolean
    message?: string
    error?: string
    data?: T
}