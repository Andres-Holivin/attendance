
import { cn } from "@workspace/ui/lib/utils";
import { Loader2Icon } from "lucide-react";

export function Loading({ className }: Readonly<{ className?: string }>) {
    return (
        <div className="absolute top-1/2 left-1/2 mb-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-center">
            <Loader2Icon className={cn("animate-spin h-10 w-10", className)} />
        </div>
    );
}