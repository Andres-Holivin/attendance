import { QueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import axios from 'axios';
export const idToastQuery = "idToastQuery"
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: 2,
            staleTime: 1000 * 60 * 60, // 1 hour
        },
        mutations: {
            onError: (error) => {
                let message = "";
                console.error('Mutation error:', error);
                if (axios.isAxiosError(error)) {
                    message = error.response?.data?.message || message;
                } else if (error instanceof Error) {
                    message = error.message;
                }
                console.error('Mutation error message:', message);
                return toast.error(`An unexpected error occurred. ${message}`, { id: idToastQuery });
            },
            onMutate: () => {
                return toast.loading("Loading...", { id: idToastQuery });
            },
            onSuccess() {
                return toast.success("Action completed successfully!", { id: idToastQuery });
            },
        },
    }
})

