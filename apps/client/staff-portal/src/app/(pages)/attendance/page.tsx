"use client"

import { Button } from "@workspace/ui/components/button";
import moment from 'moment-timezone'
import { useEffect, useState } from "react";
import { Hourglass, LogIn, LogOut } from "lucide-react";
import Content from "@/components/content";
import { Loading } from "@workspace/ui/components/custom/loading";

export default function AttendancePage() {
    const [dateTime, setDateTime] = useState('')
    const [timeZone, setTimeZone] = useState('')

    useEffect(() => {
        const tz = moment.tz.guess() // get browser time zone
        setTimeZone(tz)

        const interval = setInterval(() => {
            setDateTime(moment().tz(tz).format('YYYY-MM-DD HH:mm:ss'))
        }, 1000)

        return () => clearInterval(interval)
    }, [])
    if (!dateTime) {
        return (
            <Content>
                <Loading />
            </Content>
        )
    }
    return (
        <Content className="flex justify-center items-center h-full md:flex-row flex-col space-x-0 md:space-x-14 md:space-y-0 space-y-8">
            <div className="flex flex-col items-center justify-center space-x-2 md:space-y-4 border h-72 w-72 md:w-82 md:h-82 rounded-full shadow-lg ">
                <h1 className="text-2xl font-bold flex items-center gap-2"><Hourglass />Time</h1>
                <div className="text-3xl font-mono">{moment(dateTime).format('HH:mm:ss')}</div>
                <div className="text-sm ">Time Zone: {timeZone}</div>
                <div className="flex gap-4 mt-4">
                    <div className="bg-muted  rounded-full px-3 py-1">
                        {moment(dateTime).format('dddd')}
                    </div>
                    <div className="bg-muted  rounded-full px-3 py-1">
                        {moment(dateTime).format('YYYY-MM-DD')}
                    </div>
                </div>
            </div>
            <div>
                <div className="flex flex-col items-center mb-8 bg-muted rounded-full px-6 py-2 shadow">
                    <div className="flex gap-2">
                        Status:
                        <div className="font-bold text-green-600">Checked Out</div>
                    </div>
                    <div>Duration: 8 hours</div>
                </div>
                <div className="text-2xl font-bold mb-4 text-center">Actions</div>
                <div className="flex gap-8 mt-8">
                    <Button className="flex flex-col items-center h-24 w-24">
                        <LogIn className="size-8" />
                        Check In
                    </Button>
                    <Button className="flex flex-col items-center h-24 w-24">
                        <LogOut className="size-8" />
                        Check Out
                    </Button>
                </div>

            </div>
        </Content>
    )
}