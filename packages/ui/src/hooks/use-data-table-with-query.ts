"use client";

import { useSearchParams } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import React from "react";
import { useDataTable as useUIDataTable } from "@workspace/ui/hooks/use-data-table";
import { ColumnDef } from "@tanstack/react-table";
import { DEFAULT_DEBOUNCE_WAIT } from "@workspace/utils/common";
import { useDebounceValue } from "@workspace/ui/hooks-tsx/use-debounce-value";
import { TableQueryParams, TableQueryResult, useTableQuery } from "./use-table-query";

export interface UseDataTableWithQueryOptions<T> {
    columns: ColumnDef<T>[];
    queryKey: string[];
    queryFn: (params: TableQueryParams) => Promise<TableQueryResult<T>>;
    searchParamKey?: string;
    enableRefetching?: boolean;
    enableAdvancedFilter?: boolean;
    debounceMs?: number;
    getRowId?: (row: T) => string;
}

/**
 * Hook that combines data table functionality with React Query
 * Automatically handles URL parameters, search, filtering, and pagination
 */
export function useDataTableWithQuery<T>({
    columns,
    queryKey,
    queryFn,
    searchParamKey = "q",
    enableRefetching = true,
    enableAdvancedFilter = true,
    debounceMs = DEFAULT_DEBOUNCE_WAIT,
    getRowId,
}: UseDataTableWithQueryOptions<T>) {
    const params = useSearchParams();

    // Extract parameters from URL
    const page = parseInt(params.get("page") || "1");
    const perPage = parseInt(params.get("perPage") || "10");
    const search = params.get(searchParamKey) || undefined;
    const filtersParam = params.get("filters");
    const sortParam = params.get("sort");
    const joinOperatorParam = params.get("joinOperator") as "and" | "or" | undefined;

    // Search state hook for real-time search
    const [searchQuery, setSearchQuery] = useQueryState(
        searchParamKey,
        parseAsString.withDefault("")
    );

    // Debounce search to prevent excessive API calls
    const [debouncedSearch, setDebouncedSearch] = useDebounceValue(searchQuery, debounceMs);

    // Use debounced search for API calls but immediate value for input
    const effectiveSearch = debouncedSearch || undefined;

    // Parse filters from URL
    const filters = React.useMemo(() => {
        if (!filtersParam) return [];
        try {
            return JSON.parse(filtersParam);
        } catch {
            return [];
        }
    }, [filtersParam]);

    // Parse sort from URL
    const sort = React.useMemo(() => {
        if (!sortParam) return [];
        try {
            return JSON.parse(sortParam);
        } catch {
            return [];
        }
    }, [sortParam]);

    // React Query
    const queryResult = useTableQuery({
        queryKey,
        queryFn,
        params: { page, perPage, search: effectiveSearch, filters, sort, joinOperator: joinOperatorParam || "and" },
        enabled: enableRefetching,
    });

    // Data table hook
    const { table } = useUIDataTable<T>({
        columns,
        data: queryResult.data?.data || [],
        pageCount: Math.ceil((queryResult.data?.totalItems ?? 0) / perPage),
        enableAdvancedFilter,
        getRowId,
    });

    return {
        table,
        queryResult,
        searchQuery,
        setSearchQuery,
        filters,
        sort,
        pagination: {
            page,
            perPage,
            totalItems: queryResult.data?.totalItems ?? 0,
            totalPages: queryResult.data?.pageInfo?.totalPages ?? 0,
        },
    };
}
