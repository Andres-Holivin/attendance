"use client";


import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@workspace/ui/lib/query-client";
import { Fragment } from "react";
import { QueryClientProvider } from '@tanstack/react-query'


export const QueryProvider = ({ children }: { children: React.ReactNode }) => {

    return (
        <Fragment>
            <QueryClientProvider client={queryClient} >
                {children}
            </QueryClientProvider>
            <ReactQueryDevtools client={queryClient} initialIsOpen={false} />
        </Fragment>
    );
};