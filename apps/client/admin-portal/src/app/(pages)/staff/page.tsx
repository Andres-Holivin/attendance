"use client"

import { useState } from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { DataTable } from "@/components/data-table"
import { createStaffColumns } from "@/components/staff/staff-columns"
import { StaffModal, DeleteStaffModal } from "@/components/staff/staff-modals"
import {
    useStaffList,
    useCreateStaff,
    useUpdateStaff,
    useDeleteStaff
} from "@/hooks/useStaff"
import { User } from "@/types/user.type"
import { CreateStaffData, UpdateStaffData } from "@/services/staff.service"
import Content from "@/components/content"
import { useDebouncedCallback } from "@workspace/ui/hooks/use-debounced-callback"

export default function StaffPage() {
    // State for pagination and search
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
    const [searchQuery, setSearchQuery] = useState("")

    // Modal states
    const [createModalOpen, setCreateModalOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [selectedStaff, setSelectedStaff] = useState<User | null>(null)

    // Debounced search
    const debouncedSearch = useDebouncedCallback(
        (value: string) => {
            setSearchQuery(value)
            setPagination(prev => ({ ...prev, pageIndex: 0 })) // Reset to first page on search
        },
        300
    )

    // React Query hooks
    const { data: staffData, isLoading } = useStaffList({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: searchQuery || undefined,
    })

    const createStaffMutation = useCreateStaff()
    const updateStaffMutation = useUpdateStaff()
    const deleteStaffMutation = useDeleteStaff()

    // Event handlers
    const handleCreateStaff = (data: CreateStaffData | UpdateStaffData) => {
        createStaffMutation.mutate(data as CreateStaffData, {
            onSuccess: () => {
                setCreateModalOpen(false)
            }
        })
    }

    const handleUpdateStaff = (data: CreateStaffData | UpdateStaffData) => {
        if (!selectedStaff) return

        updateStaffMutation.mutate({
            id: selectedStaff.id,
            data: data as UpdateStaffData,
        }, {
            onSuccess: () => {
                setEditModalOpen(false)
                setSelectedStaff(null)
            }
        })
    }

    const handleDeleteStaff = () => {
        if (!selectedStaff) return

        deleteStaffMutation.mutate(selectedStaff.id, {
            onSuccess: () => {
                setDeleteModalOpen(false)
                setSelectedStaff(null)
            }
        })
    }

    const openEditModal = (staff: User) => {
        setSelectedStaff(staff)
        setEditModalOpen(true)
    }

    const openDeleteModal = (staff: User) => {
        setSelectedStaff(staff)
        setDeleteModalOpen(true)
    }

    // Table columns with event handlers
    const columns = createStaffColumns(
        openEditModal,
        openDeleteModal
    )

    const staffList = staffData?.data?.users || []
    const pagination_data = staffData?.data?.pagination

    return (
        <Content title="Staff Management" className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-muted-foreground">
                        Manage staff members and their information.
                    </p>
                </div>
                <Button onClick={() => setCreateModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Staff
                </Button>
            </div>

            {/* Content */}
            <Card>
                <CardHeader>
                    <CardTitle>Staff Members</CardTitle>
                    <CardDescription>
                        A list of all staff members in your organization.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Search */}
                    <div className="flex items-center space-x-2 mb-6">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search staff by name..."
                                className="pl-10"
                                onChange={(e) => debouncedSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Data Table */}
                    <DataTable
                        columns={columns}
                        data={staffList}
                        loading={isLoading}
                        pagination={pagination}
                        pageCount={pagination_data?.totalPages || 0}
                        totalRecords={pagination_data?.total || 0}
                        onPaginationChange={setPagination}
                    />
                </CardContent>
            </Card>

            {/* Modals */}
            <StaffModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
                onSubmit={handleCreateStaff}
                loading={createStaffMutation.isPending}
            />

            <StaffModal
                open={editModalOpen}
                onOpenChange={setEditModalOpen}
                staff={selectedStaff || undefined}
                isEditing={true}
                onSubmit={handleUpdateStaff}
                loading={updateStaffMutation.isPending}
            />

            <DeleteStaffModal
                open={deleteModalOpen}
                onOpenChange={setDeleteModalOpen}
                staff={selectedStaff || undefined}
                onConfirm={handleDeleteStaff}
                loading={deleteStaffMutation.isPending}
            />
        </Content>
    )
}
