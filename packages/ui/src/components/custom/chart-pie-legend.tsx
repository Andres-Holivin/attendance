import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@workspace/ui/components/card"
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@workspace/ui/components/chart"
import { Pie, PieChart } from "recharts"
import { Skeleton } from "@workspace/ui/components/skeleton"
import React from "react"

export const description = "A pie chart showing attendance statistics"

interface ChartPieLegendProps {
    readonly data?: any;
    readonly loading?: boolean;
    readonly title?: string;
    readonly description?: React.ReactNode;
    readonly chartConfig: ChartConfig;
    readonly labelKey: string;
    readonly dataKey: string;
}



export function ChartPieLegend({ data, loading, chartConfig, dataKey,labelKey, title, description }: ChartPieLegendProps) {
    if (loading) {
        return (
            <Card className="flex flex-col">
                <CardHeader className="items-center pb-0">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                    <div className="mx-auto aspect-square max-h-[300px] flex items-center justify-center">
                        <Skeleton className="h-64 w-64 rounded-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }



    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>{title}</CardTitle>
                <CardDescription><>{description}</></CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-8 flex justify-center items-center">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square h-full"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={data || []}
                            dataKey={dataKey}
                            nameKey={labelKey}
                        />
                        <ChartLegend
                            content={<ChartLegendContent nameKey={labelKey} />}
                            className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
                        />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
