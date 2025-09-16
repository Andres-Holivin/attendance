
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
    register: async (data: RegisterData): Promise<BaseApiResponse> => {
        const response = await API(APIUrlEnum.USER_API).post('/auth/register', data)
        return response.data
    },

    login: async (data: LoginData): Promise<BaseApiResponse<AuthResponse>> => {
        const response = await API(APIUrlEnum.USER_API).post('/auth/login', data)
        return response.data
    },

    logout: async (): Promise<BaseApiResponse<AuthResponse>> => {
        const response = await API(APIUrlEnum.USER_API).post('/auth/logout')
        return response.data
    },

    me: async (): Promise<BaseApiResponse<AuthResponse>> => {
        const response = await API(APIUrlEnum.USER_API).get('/auth/me')
        console.log('me response', response)
        return response.data
    },

    getProfile: async (): Promise<BaseApiResponse<AuthResponse>> => {
        const response = await API(APIUrlEnum.USER_API).get('/auth/profile')
        return response.data
    },

    updateProfile: async (data: UpdateProfileData): Promise<BaseApiResponse<AuthResponse>> => {
        const response = await API(APIUrlEnum.USER_API).put('/auth/profile', data)
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
