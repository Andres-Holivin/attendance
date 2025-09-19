import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { staffService, CreateStaffData, UpdateStaffData, StaffListParams } from '@/services/staff.service'
import { toast } from 'sonner'
import { idToastQuery } from '@workspace/ui/lib/query-client'
// Query keys
export const staffKeys = {
    all: ['staff'] as const,
    lists: () => [...staffKeys.all, 'list'] as const,
    list: (params: StaffListParams) => [...staffKeys.lists(), params] as const,
}

/**
 * Hook for fetching staff list
 */
export function useStaffList(params?: StaffListParams) {
    return useQuery({
        queryKey: staffKeys.list(params || {}),
        queryFn: () => staffService.getStaffList(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

/**
 * Hook for creating a new staff member
 */
export function useCreateStaff() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateStaffData) => staffService.createStaff(data),
        onSuccess: () => {
            toast.success('Staff member created successfully!', { id: idToastQuery })
            queryClient.invalidateQueries({ queryKey: staffKeys.lists() })
        },
        onError: (error: Error) => {
            toast.error(`Failed to create staff member: ${error.message}`, { id: idToastQuery })
            console.error('Failed to create staff member:', error.message)
        },
    })
}

/**
 * Hook for updating a staff member
 */
export function useUpdateStaff() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateStaffData }) =>
            staffService.updateStaff(id, data),
        onSuccess: () => {
            toast.success('Staff member updated successfully!', { id: idToastQuery })
            // Invalidate and refetch staff queries
            queryClient.invalidateQueries({ queryKey: staffKeys.lists() })
        },
        onError: (error: Error) => {
            toast.error(`Failed to update staff member: ${error.message}`, { id: idToastQuery })
            console.error('Failed to update staff member:', error.message)
        },
    })
}

/**
 * Hook for deleting a staff member
 */
export function useDeleteStaff() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => staffService.deleteStaff(id),
        onSuccess: () => {
            // Invalidate and refetch staff queries
            toast.success('Staff member deleted successfully!', { id: idToastQuery })
            queryClient.invalidateQueries({ queryKey: staffKeys.lists() })
        },
        onError: (error: Error) => {
            toast.error(`Failed to delete staff member: ${error.message}`, { id: idToastQuery })
            console.error('Failed to delete staff member:', error.message)
        },
    })
}