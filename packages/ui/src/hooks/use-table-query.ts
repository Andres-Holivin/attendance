import { keepPreviousData, useQuery, UseQueryOptions } from "@tanstack/react-query";

export interface TableFilter {
    id: string;
    value: any;
    operator?: string;
}

export interface TableQueryParams {
    page?: number;
    perPage?: number;
    search?: string;
    filters?: TableFilter[];
    sort?: Array<{ id: string; desc: boolean }>;
    joinOperator?: "and" | "or" | undefined;
}

export interface TableQueryResult<T> {
    data: T[];
    totalItems: number;
    pageInfo?: {
        page: number;
        perPage: number;
        totalPages: number;
    };
}

export interface UseTableQueryOptions<T> extends Omit<UseQueryOptions<TableQueryResult<T>>, 'queryKey' | 'queryFn'> {
    queryKey: string[];
    queryFn: (params: TableQueryParams) => Promise<TableQueryResult<T>>;
    params?: TableQueryParams;
}

/**
 * Generic hook for table queries with filtering, pagination, search, and sorting
 */
export function useTableQuery<T>({
    queryKey,
    queryFn,
    params = {},
    ...queryOptions
}: UseTableQueryOptions<T>) {
    const {
        page = 1,
        perPage = 10,
        search,
        filters = [],
        sort = [],
        joinOperator
    } = params;

    return useQuery({
        queryKey: [...queryKey, { page, perPage, search, filters, sort, joinOperator }],
        queryFn: () => queryFn({ page, perPage, search, filters, sort, joinOperator }),
        placeholderData: keepPreviousData,
        staleTime: 30 * 1000, // 30 seconds
        gcTime: 5 * 60 * 1000, // 5 minutes
        ...queryOptions,
    });
}
