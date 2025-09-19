
import {
    RegisterData,
    AuthResponse,
    LoginData,
    UpdateProfileData,
    SessionResponse,
    UserSessionsResponse
} from "@/types/auth.type"
import { BaseApiResponse } from "@/types/base-api.type"
import { api } from "@/lib/proxy-api"

export const AuthService = {
    // Use proxy for registration
    register: async (data: RegisterData): Promise<BaseApiResponse> => {
        return api.post('/auth/register', data);
    },

    // Use existing local API route for login
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

    // Use existing local API route for logout
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

    // Use existing local API route for me
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

    // Use proxy for profile
    getProfile: async (): Promise<BaseApiResponse<AuthResponse>> => {
        return api.get('/auth/profile');
    },

    updateProfile: async (data: UpdateProfileData): Promise<BaseApiResponse<AuthResponse>> => {
        const formData = new FormData();

        // Add form fields
        if (data.phoneNumber) {
            formData.append('phoneNumber', data.phoneNumber);
        }
        if (data.password) {
            formData.append('password', data.password);
        }
        if (data.confirmPassword) {
            formData.append('confirmPassword', data.confirmPassword);
        }
        if (data.profileImage) {
            formData.append('profileImage', data.profileImage);
        }

        return api.put('/auth/profile', formData);
    },

    // New session management endpoints using proxy
    getSession: async (): Promise<BaseApiResponse<SessionResponse>> => {
        return api.get('/auth/session');
    },

    getUserSessions: async (): Promise<BaseApiResponse<UserSessionsResponse>> => {
        return api.get('/auth/sessions');
    }
}
