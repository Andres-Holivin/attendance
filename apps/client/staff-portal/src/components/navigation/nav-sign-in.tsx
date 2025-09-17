import { useLogout, useMe } from "@/hooks/useAuth";
import { Avatar, AvatarImage, AvatarFallback } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import Link from "next/link";
import { LogOutIcon, UserIcon, UserRoundCog } from "lucide-react";
import { Spinner } from "@workspace/ui/components/spinner";
export function NavigationSignIn() {
    const { data } = useMe();
    const logOut = useLogout();
    
    if (data?.data?.user) {
        const user = data.data.user;
        let userInitials = 'U';
        
        if (user.fullName) {
            userInitials = user.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
        } else if (user.email && user.email.length > 0) {
            userInitials = user.email[0]?.toUpperCase() || 'U';
        }
            
        return (
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user.image_url || undefined} alt={user.fullName} />
                            <AvatarFallback>{userInitials}</AvatarFallback>
                        </Avatar>
                        <span className="sr-only">Toggle user menu</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80">
                    <div className="flex flex-col items-center gap-4 p-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={user.image_url || undefined} alt={user.fullName} />
                            <AvatarFallback>{userInitials}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-1 text-center">
                            <div className="text-xl font-medium">{user.fullName}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                        <div className="grid w-full gap-2">
                            <Link
                                href="/profile"
                                className="flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                prefetch={false}
                            >
                                <UserIcon className="h-4 w-4" />
                                View Profile
                            </Link>
                            <Link
                                href="/session"
                                className="flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                prefetch={false}
                            >
                                <UserRoundCog className="h-4 w-4" />
                                Session Management
                            </Link>
                            <Button
                                onClick={() => logOut.mutate()}
                                variant={"destructive"}
                                disabled={logOut.isPending}
                            >
                                <LogOutIcon className="h-4 w-4" />
                                {logOut.isPending ? <Spinner /> : null}
                                Logout
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        )
    }

    return (<a href="/auth/sign-in" className="text-center rounded-full border bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/60 hover:text-accent-foreground transition-colors cursor-pointer">Sign In</a>
    )
}