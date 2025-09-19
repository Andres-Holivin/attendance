import { PaginatedResponse } from "@/types/api.type"
import { User } from "@/types/user.type"
import { api, buildUrlWithParams } from "@/lib/proxy-api"

export interface CreateStaffData {
    email: string
    fullName: string
    password: string
    position?: string
    phoneNumber?: string
    profileImage?: File
}

export interface UpdateStaffData {
    fullName?: string
    position?: string
    phoneNumber?: string
    profileImage?: File
}

export interface StaffListParams {
    page?: number
    limit?: number
    search?: string
}

export interface StaffListResponse {
    users: User[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

export const staffService = {
    /**
     * Get paginated list of staff members
     */
    async getStaffList(params?: StaffListParams): Promise<PaginatedResponse<StaffListResponse>> {
        const queryParams = {
            role: 'STAFF',
            ...params,
        };

        const url = buildUrlWithParams('/users', queryParams);
        return api.get(url);
    },

    /**
     * Create a new staff member
     */
    async createStaff(data: CreateStaffData): Promise<{ success: boolean; message: string; data: User }> {
        const formData = new FormData()

        formData.append('email', data.email)
        formData.append('fullName', data.fullName)
        formData.append('password', data.password)

        if (data.position) {
            formData.append('position', data.position)
        }

        if (data.phoneNumber) {
            formData.append('phoneNumber', data.phoneNumber)
        }

        if (data.profileImage) {
            formData.append('profileImage', data.profileImage)
        }

        // Set role as staff
        formData.append('role', 'STAFF')

        try {
            return await api.post('/users', formData);
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to create staff'
            throw new Error(errorMessage)
        }
    },

    /**
     * Update an existing staff member
     */
    async updateStaff(id: string, data: UpdateStaffData): Promise<{ success: boolean; message: string; data: User }> {
        const formData = new FormData()

        if (data.fullName) {
            formData.append('fullName', data.fullName)
        }

        if (data.position) {
            formData.append('position', data.position)
        }

        if (data.phoneNumber) {
            formData.append('phoneNumber', data.phoneNumber)
        }

        if (data.profileImage) {
            formData.append('profileImage', data.profileImage)
        }

        try {
            return await api.put(`/users/${id}`, formData);
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to update staff'
            throw new Error(errorMessage)
        }
    },

    /**
     * Delete a staff member
     */
    async deleteStaff(id: string): Promise<{ success: boolean; message: string }> {
        try {
            return await api.delete(`/users/${id}`);
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to delete staff'
            throw new Error(errorMessage)
        }
    },
}