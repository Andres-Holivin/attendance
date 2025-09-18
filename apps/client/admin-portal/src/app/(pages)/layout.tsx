"use client";
import TopNav from "@/components/navigation/top-nav";
import { useMe } from "@/hooks/useAuth";
import { Loading } from "@workspace/ui/components/custom/loading";
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    const { data, isPending } = useMe();
    if (isPending) return <Loading />;
    return (
        <div className="flex flex-col max-h-screen h-screen overflow-auto">
            <TopNav />
            <div className="flex-1">
                {children}
            </div>
        </div>
    );
}


