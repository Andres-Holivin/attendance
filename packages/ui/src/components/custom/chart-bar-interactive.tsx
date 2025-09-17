"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@workspace/ui/components/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@workspace/ui/components/chart"
import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { Skeleton } from "@workspace/ui/components/skeleton"
import moment from "moment"

export const description = "An interactive bar chart showing daily working hours trends"

interface ChartBarInteractiveProps {
    readonly data?: any;
    readonly loading?: boolean;
    readonly chartConfig: ChartConfig;
    readonly title?: string;
    readonly description?: React.ReactNode;
    readonly dataKey: string;
    readonly labelKey: string;
}


export function ChartBarInteractive({ data, loading, chartConfig, title, description, dataKey, labelKey }: ChartBarInteractiveProps) {

    const chartData = data || [];



    if (loading) {
        return (
            <Card>
                <CardHeader className="items-center pb-0">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="px-2 sm:p-6">
                    <div className="aspect-auto h-[250px] w-full flex items-center justify-center">
                        <Skeleton className="h-full w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                    <CardTitle>{title}</CardTitle>
                    <CardDescription><>{description}</></CardDescription>
                </div>
            </CardHeader>
            <CardContent className="px-2 sm:p-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[250px] w-full"
                >
                    <BarChart
                        accessibilityLayer
                        data={chartData}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey={labelKey}
                            tickFormatter={(value) => moment(value).format('DD MMM YY')}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(value) => moment(value).format('DD MMM YYYY')}
                                    formatter={(value, name) => `${value} ${chartConfig[name as keyof typeof chartConfig]?.label || name}`}
                                />
                            }
                        />
                        <Bar
                            dataKey={dataKey}
                            fill={`var(--color-${dataKey})`}
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
