import { useAtom, useAtomValue } from 'jotai';
import { attendanceFiltersAtom, resetFiltersAtom } from '@/store/attendance-filters';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { X } from 'lucide-react';

export function FilterDisplay() {
    const filters = useAtomValue(attendanceFiltersAtom);
    const [, resetFilters] = useAtom(resetFiltersAtom);
    
    const formatDate = (dateString?: string) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString();
    };

    const hasActiveFilters = () => {
        const today = new Date().toISOString().split('T')[0];
        return filters.startDate !== today || filters.endDate !== today;
    };

    if (!hasActiveFilters()) return null;

    return (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">Active filters:</span>
            
            {filters.startDate && (
                <Badge variant="secondary" className="gap-1">
                    From: {formatDate(filters.startDate)}
                </Badge>
            )}
            
            {filters.endDate && (
                <Badge variant="secondary" className="gap-1">
                    To: {formatDate(filters.endDate)}
                </Badge>
            )}
            
            <Badge variant="outline" className="gap-1">
                Page: {filters.page} ({filters.limit} per page)
            </Badge>
            
            <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-6 px-2 text-xs"
            >
                <X className="h-3 w-3 mr-1" />
                Clear all
            </Button>
        </div>
    );
}