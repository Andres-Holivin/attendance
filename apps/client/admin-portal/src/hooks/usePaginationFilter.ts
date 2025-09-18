import { useAtom } from 'jotai';
import { paginationAtom, setPaginationAtom } from '@/store/attendance-filters';

export function usePaginationFilter() {
    const [pagination] = useAtom(paginationAtom);
    const [, setPagination] = useAtom(setPaginationAtom);

    const handlePaginationChange = (paginationState: { pageIndex: number; pageSize: number }) => {
        setPagination(paginationState);
    };

    const resetToFirstPage = () => {
        setPagination({ pageIndex: 0, pageSize: pagination.limit });
    };

    return {
        pagination,
        handlePaginationChange,
        resetToFirstPage,
        // Convert for DataTable component (0-based)
        tableState: {
            pageIndex: (pagination.page || 1) - 1,
            pageSize: pagination.limit || 10,
        },
    };
}