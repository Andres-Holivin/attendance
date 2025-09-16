import { AuthService } from '@/services/auth.service'
import { LoginData, RegisterData, UpdateProfileData } from '@/types/auth.type'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { idToastQuery } from '@workspace/ui/lib/query-client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export const AUTH_KEYS = {
    user: ['auth', 'user'] as const,
    profile: ['auth', 'profile'] as const,
    session: ['auth', 'session'] as const,
    sessions: ['auth', 'sessions'] as const,
}

// Hook for login mutation
export function useLogin() {
    const queryClient = useQueryClient()
    const router = useRouter()

    return useMutation({
        mutationFn: (data: LoginData) => AuthService.login(data),
        onSuccess: (response) => {
            if (response.success) {
                // Update user cache with enhanced session data
                toast.success('Login successful!', { id: idToastQuery })
                queryClient.setQueryData(AUTH_KEYS.user, response)
                queryClient.setQueryData(AUTH_KEYS.profile, response)

                // Invalidate session queries to refresh them
                queryClient.invalidateQueries({ queryKey: AUTH_KEYS.session })
                queryClient.invalidateQueries({ queryKey: AUTH_KEYS.sessions })

                // Redirect to dashboard or home
                return router.push('/dashboard')
            }
            throw new Error(response.message)
        }
    })
}

export function useRegister() {
    const router = useRouter()

    return useMutation({
        mutationFn: (data: RegisterData) => AuthService.register(data),
        onSuccess: (response) => {
            if (response.success) {
                toast.success('Registration successful!', { id: idToastQuery })
                router.push('/auth/sign-in')
            }
        },
    })
}

// Hook for logout mutation
export function useLogout() {
    const queryClient = useQueryClient()
    const router = useRouter()

    return useMutation({
        mutationFn: () => AuthService.logout(),
        onSuccess: () => {
            // Clear all auth-related cache
            queryClient.setQueryData(AUTH_KEYS.user, null)
            queryClient.setQueryData(AUTH_KEYS.profile, null)
            queryClient.removeQueries({ queryKey: AUTH_KEYS.session })
            queryClient.removeQueries({ queryKey: AUTH_KEYS.sessions })
            toast.success('Logged out successfully!', { id: idToastQuery })
            // Redirect to home
            router.push('/')
        },
    })
}

// Hook for protected profile data
export function useProfile() {
    return useQuery({
        queryKey: AUTH_KEYS.profile,
        queryFn: () => AuthService.getProfile(),
        staleTime: 1000 * 60 * 10, // 10 minutes
    })
}

export function useMe() {
    return useQuery({
        queryKey: AUTH_KEYS.user,
        queryFn: async () => await AuthService.me(),
    });
}

export function useUpdateProfile() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: UpdateProfileData) => await AuthService.updateProfile(data),
        onSuccess: (response) => {
            if (response.success) {
                toast.success('Profile updated successfully!', { id: idToastQuery })
                queryClient.setQueryData(AUTH_KEYS.profile, response)
                queryClient.setQueryData(AUTH_KEYS.user, response)
                // Invalidate session data as profile changes might affect it
                queryClient.invalidateQueries({ queryKey: AUTH_KEYS.session })
            }
        },
    })
}

// New session management hooks
export function useSession() {
    return useQuery({
        queryKey: AUTH_KEYS.session,
        queryFn: () => AuthService.getSession(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: false, // Don't retry if session is invalid
    })
}

export function useUserSessions() {
    return useQuery({
        queryKey: AUTH_KEYS.sessions,
        queryFn: () => AuthService.getUserSessions(),
        staleTime: 1000 * 60 * 2, // 2 minutes
        retry: false,
    })
}

// Hook to check if user is authenticated with session validation
export function useAuthStatus() {
    const { data: userData, isLoading: userLoading, error: userError } = useMe()
    const { data: sessionData, isLoading: sessionLoading } = useSession()

    return {
        isAuthenticated: userData?.success && userData?.data?.user && !userError,
        user: userData?.data?.user,
        sessionInfo: sessionData?.data,
        isLoading: userLoading || sessionLoading,
        hasValidSession: sessionData?.success && sessionData?.data?.isAuthenticated,
    }
}