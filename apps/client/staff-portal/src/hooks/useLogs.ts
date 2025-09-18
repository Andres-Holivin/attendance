import { useQuery } from '@tanstack/react-query'
import { LoggingService, type ApiLogFilters } from '@/services/logging.service'

export const LOGGING_KEYS = {
    logs: ['logs'] as const,
    logsWithFilters: (filters: ApiLogFilters) => ['logs', 'filtered', filters] as const,
}

export function useLogs(filters: ApiLogFilters = {}, limit = 25, page = 1) {
    return useQuery({
        queryKey: [...LOGGING_KEYS.logsWithFilters(filters), page, limit],
        queryFn: () => LoggingService.getLogs(page, limit, filters),
        staleTime: 30 * 1000, // 30 seconds
        gcTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
    })
}