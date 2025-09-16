
import { Card, CardTitle, CardContent } from "@workspace/ui/components/card";

interface ContentProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
}

export default function Content({ children, className, title }: Readonly<ContentProps>) {
    return (
        <div className="px-6 py-4 z-10 relative flex-1 h-full">
            <Card className="p-6 h-full">
                {title ? <CardTitle>{title}</CardTitle> : null}
                <CardContent className={className}>
                    <>{children}</>
                </CardContent>
            </Card>
        </div>
    )
}