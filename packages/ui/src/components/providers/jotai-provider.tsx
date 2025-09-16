"use client"

import { queryClient } from "@workspace/ui/lib/query-client"
import { Provider } from "jotai"
import { queryClientAtom } from "jotai-tanstack-query"
import { useHydrateAtoms } from "jotai/utils"
import { ReactNode } from "react"

const HydrateAtoms = ({ children }: { children: ReactNode }) => {
    useHydrateAtoms(new Map([[queryClientAtom, queryClient]]))
    return children
}
export default function JotaiProvider({ children }: Readonly<{ children: React.ReactNode }>) {
        return (
        <Provider>
            <HydrateAtoms>
                {children}
            </HydrateAtoms>
        </Provider>
    )

}