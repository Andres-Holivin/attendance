"use client";

import React from "react";
import { Button } from "@workspace/ui/components/button";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";

interface CursorPaginationProps {
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
  readonly currentCursor: string | null;
  readonly itemCount: number;
  readonly limit: number;
  readonly loading?: boolean;
  readonly onNextPage: () => void;
  readonly onPreviousPage: () => void;
  readonly onRefresh: () => void;
}

export function CursorPagination({
  hasNextPage,
  hasPreviousPage,
  currentCursor,
  itemCount,
  limit,
  loading,
  onNextPage,
  onPreviousPage,
  onRefresh,
}: CursorPaginationProps) {
  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">
          Showing {itemCount} {itemCount === 1 ? 'item' : 'items'}
          {itemCount === limit && hasNextPage && ' (more available)'}
        </div>
        
        {currentCursor && (
          <Badge variant="outline" className="font-mono text-xs">
            Cursor: {currentCursor.substring(0, 8)}...
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="h-8 w-8 p-0"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="sr-only">Refresh</span>
        </Button>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onPreviousPage}
            disabled={!hasPreviousPage || loading}
            className="h-8 px-3"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onNextPage}
            disabled={!hasNextPage || loading}
            className="h-8 px-3"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}