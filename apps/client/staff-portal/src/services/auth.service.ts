
import { API, APIUrlEnum } from "@/lib/api"
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
    // Use direct backend call - no cookies needed for registration
    register: async (data: RegisterData): Promise<BaseApiResponse> => {
        const response = await API(APIUrlEnum.USER_API).post('/auth/register', data)
        return response.data
    },

    // Use local API route - sets session cookie
    login: async (data: LoginData): Promise<BaseApiResponse<AuthResponse>> => {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            credentials: 'include',
        });
        return response.json();
    },

    // Use local API route - clears session cookie
    logout: async (): Promise<BaseApiResponse<AuthResponse>> => {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        return response.json();
    },

    // Use local API route - validates session cookie
    me: async (): Promise<BaseApiResponse<AuthResponse>> => {
        const response = await fetch('/api/auth/me', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        console.log('me response', response);
        return response.json();
    },

    // Use direct backend call - cookies are automatically sent by browser
    getProfile: async (): Promise<BaseApiResponse<AuthResponse>> => {
        const response = await API(APIUrlEnum.USER_API).get('/auth/profile')
        return response.data
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

        const response = await API(APIUrlEnum.USER_API).put('/auth/profile', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    },

    // New session management endpoints
    getSession: async (): Promise<BaseApiResponse<SessionResponse>> => {
        const response = await API(APIUrlEnum.USER_API).get('/auth/session')
        return response.data
    },

    getUserSessions: async (): Promise<BaseApiResponse<UserSessionsResponse>> => {
        const response = await API(APIUrlEnum.USER_API).get('/auth/sessions')
        return response.data
    }
}
