
import { api } from "@/lib/proxy-api"
import {
    RegisterData,
    AuthResponse,
    LoginData,
    UpdateProfileData,
    SessionResponse,
    UserSessionsResponse
} from "@/types/auth.type"
import { BaseApiResponse } from "@/types/base-api.type"

export const AuthService = {
    // All requests now go through the Next.js proxy
    register: async (data: RegisterData): Promise<BaseApiResponse> => {
        return await api.post('/auth/register', data)
    },

    login: async (data: LoginData): Promise<BaseApiResponse<AuthResponse>> => {
        return await api.post('/auth/login', data)
    },

    logout: async (): Promise<BaseApiResponse<AuthResponse>> => {
        return await api.post('/auth/logout')
    },

    me: async (): Promise<BaseApiResponse<AuthResponse>> => {
        return await api.get('/auth/me')
    },

    getProfile: async (): Promise<BaseApiResponse<AuthResponse>> => {
        return await api.get('/auth/profile')
    },

    updateProfile: async (data: UpdateProfileData): Promise<BaseApiResponse<AuthResponse>> => {
        const formData = new FormData()

        // Add form fields
        if (data.phoneNumber) {
            formData.append('phoneNumber', data.phoneNumber)
        }
        if (data.password) {
            formData.append('password', data.password)
        }
        if (data.confirmPassword) {
            formData.append('confirmPassword', data.confirmPassword)
        }
        if (data.profileImage) {
            formData.append('profileImage', data.profileImage)
        }

        return await api.put('/auth/profile', formData)
    },

    // Session management endpoints
    getSession: async (): Promise<BaseApiResponse<SessionResponse>> => {
        return await api.get('/auth/session')
    },

    getUserSessions: async (): Promise<BaseApiResponse<UserSessionsResponse>> => {
        return await api.get('/auth/sessions')
    }
}
