import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ThemeProvider } from "./theme-provider";
import NextTopLoader from "nextjs-toploader";
import JotaiProvider from "./jotai-provider";
import { QueryProvider } from "./query-provider";
import { Toaster } from "../sonner";

export const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <NextTopLoader showSpinner={false} color="#4A90E2" height={4} />
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                storageKey="theme"
                disableTransitionOnChange
                enableColorScheme
            >
                <NuqsAdapter>
                    <JotaiProvider>
                        <QueryProvider>
                            {children}
                            <Toaster position="top-right" richColors expand closeButton />
                        </QueryProvider>
                    </JotaiProvider>
                </NuqsAdapter>

            </ThemeProvider>
        </>
    );
};