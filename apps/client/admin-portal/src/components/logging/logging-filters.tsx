"use client";

import React from "react";
import { DateRange } from "react-day-picker";
import { CalendarIcon, Filter, X } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";
import { Badge } from "@workspace/ui/components/badge";
import { DatePickerRange } from "@workspace/ui/components/date-picker-range";
import { ApiLogFilters, LoggingService } from "@/services/logging.service";

interface LoggingFiltersProps {
  readonly filters: ApiLogFilters;
  readonly onFiltersChange: (filters: ApiLogFilters) => void;
  readonly loading?: boolean;
}

export function LoggingFilters({ filters, onFiltersChange, loading }: LoggingFiltersProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();

  // Initialize date range from filters
  React.useEffect(() => {
    if (filters.startDate || filters.endDate) {
      setDateRange({
        from: filters.startDate ? new Date(filters.startDate) : undefined,
        to: filters.endDate ? new Date(filters.endDate) : undefined,
      });
    }
  }, [filters.startDate, filters.endDate]);

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    onFiltersChange({
      ...filters,
      startDate: range?.from?.toISOString(),
      endDate: range?.to?.toISOString(),
    });
  };

  const handleFilterChange = (key: keyof ApiLogFilters, value: string | number | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const clearFilters = () => {
    setDateRange(undefined);
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined);
  const filterCount = Object.values(filters).filter(value => value !== undefined).length;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center justify-between">
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {filterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {filterCount}
              </Badge>
            )}
          </Button>
        </CollapsibleTrigger>
        
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      <CollapsibleContent className="space-y-4 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/20">
          {/* Date Range */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <DatePickerRange
              onChange={handleDateRangeChange}
            />
          </div>

          {/* HTTP Method */}
          <div className="space-y-2">
            <Label>HTTP Method</Label>
            <Select
              value={filters.method || "all"}
              onValueChange={(value) => handleFilterChange("method", value === "all" ? undefined : value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="All methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All methods</SelectItem>
                {LoggingService.getHttpMethods().map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Code */}
          <div className="space-y-2">
            <Label>Status Code</Label>
            <Select
              value={filters.status?.toString() || "all"}
              onValueChange={(value) => 
                handleFilterChange("status", value === "all" ? undefined : parseInt(value, 10))
              }
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {LoggingService.getStatusCodes().map((status) => (
                  <SelectItem key={status.value} value={status.value.toString()}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* User Email */}
          <div className="space-y-2">
            <Label>User Email</Label>
            <Input
              type="email"
              placeholder="Filter by user email"
              value={filters.userEmail || ""}
              onChange={(e) => handleFilterChange("userEmail", e.target.value)}
              disabled={loading}
            />
          </div>

          {/* User ID */}
          <div className="space-y-2">
            <Label>User ID</Label>
            <Input
              placeholder="Filter by user ID"
              value={filters.userId || ""}
              onChange={(e) => handleFilterChange("userId", e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Session ID */}
          <div className="space-y-2">
            <Label>Session ID</Label>
            <Input
              placeholder="Filter by session ID"
              value={filters.sessionId || ""}
              onChange={(e) => handleFilterChange("sessionId", e.target.value)}
              disabled={loading}
              className="font-mono text-sm"
            />
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {filters.method && (
              <Badge variant="secondary" className="gap-1">
                Method: {filters.method}
                <button
                  onClick={() => handleFilterChange("method", undefined)}
                  className="ml-1 hover:bg-muted rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.status && (
              <Badge variant="secondary" className="gap-1">
                Status: {filters.status}
                <button
                  onClick={() => handleFilterChange("status", undefined)}
                  className="ml-1 hover:bg-muted rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.userEmail && (
              <Badge variant="secondary" className="gap-1">
                Email: {filters.userEmail}
                <button
                  onClick={() => handleFilterChange("userEmail", undefined)}
                  className="ml-1 hover:bg-muted rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.userId && (
              <Badge variant="secondary" className="gap-1">
                User ID: {filters.userId}
                <button
                  onClick={() => handleFilterChange("userId", undefined)}
                  className="ml-1 hover:bg-muted rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.sessionId && (
              <Badge variant="secondary" className="gap-1">
                Session: {filters.sessionId.substring(0, 8)}...
                <button
                  onClick={() => handleFilterChange("sessionId", undefined)}
                  className="ml-1 hover:bg-muted rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {(filters.startDate || filters.endDate) && (
              <Badge variant="secondary" className="gap-1">
                <CalendarIcon className="h-3 w-3" />
                {filters.startDate && new Date(filters.startDate).toLocaleDateString()}
                {filters.startDate && filters.endDate && " - "}
                {filters.endDate && new Date(filters.endDate).toLocaleDateString()}
                <button
                  onClick={() => {
                    setDateRange(undefined);
                    onFiltersChange({
                      ...filters,
                      startDate: undefined,
                      endDate: undefined,
                    });
                  }}
                  className="ml-1 hover:bg-muted rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}