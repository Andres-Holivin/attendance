'use client'

import { FiltersType } from '@/types/hooks/filters.type'
import { atom, useAtom } from 'jotai'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import * as React from 'react'


export function useFilters(): FiltersType {
    const pathname = usePathname()
    const router = useRouter()
    const searchParams = useSearchParams()

    // Get current filters as a stable, memoized plain object so deps don't thrash
    const filters = React.useMemo(() => {
        return Object.fromEntries(searchParams.entries())
    }, [searchParams])

    const setFilters = (partialFilters: Partial<Record<string, any>>) => {
        const newParams = new URLSearchParams(searchParams.toString())

        Object.entries(partialFilters).forEach(([key, value]) => {
            if (
                value === undefined ||
                value === '' ||
                (typeof value === 'number' && isNaN(value))
            ) {
                newParams.delete(key)
            } else {
                newParams.set(key, String(value))
            }
        })
        router.push(`${pathname}?${newParams.toString()}`)
    }

    const resetFilters = () => {
        router.push(pathname) // no query string
    }

    return { filters, setFilters, resetFilters }
}
