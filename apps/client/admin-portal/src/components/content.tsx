
import { Card, CardContent } from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";

interface ContentProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
}

export default function Content({ children, className, title }: Readonly<ContentProps>) {
    return (
        <div className="px-6 py-4 z-10 relative flex-1 h-full">
            <Card className="h-full">
                <CardContent className={className}>
                    {title ? <h1 className="text-2xl font-bold tracking-tight pb-2">{title}</h1> : null}
                    {title ? <Separator /> : null}
                    <>{children}</>
                </CardContent>
            </Card>
        </div>
    )
}