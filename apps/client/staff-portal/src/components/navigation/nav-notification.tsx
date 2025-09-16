import { useMe } from "@/hooks/useAuth";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Popover, PopoverTrigger, PopoverContent } from "@workspace/ui/components/popover";
import { Bell } from "lucide-react";
export function NavigationNotification() {
    const { data } = useMe();
    if (!data?.data?.user) return null;
    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className='relative w-fit'>
                    <Button variant="outline" size="icon" >
                        <Bell />
                    </Button>
                    <Badge className='absolute -end-2.5 -top-2.5 h-5 min-w-5 rounded-full px-1 tabular-nums'>8</Badge>
                </div>
            </PopoverTrigger>
            <PopoverContent>Place content for the popover here.</PopoverContent>
        </Popover>
    );
}