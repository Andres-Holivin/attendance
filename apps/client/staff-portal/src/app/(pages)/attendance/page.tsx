"use client"

import { Button } from "@workspace/ui/components/button";
import moment from 'moment-timezone'
import { useEffect, useState } from "react";
import { Hourglass, LogIn, LogOut } from "lucide-react";
import Content from "@/components/content";
import { Loading } from "@workspace/ui/components/custom/loading";
import { useCheckIn, useCheckOut, useTodayAttendance } from "@/hooks/useAttendance";
import { Spinner } from "@workspace/ui/components/spinner";
import { FailedFetch } from "@workspace/ui/components/custom/failed-fetch";

export default function AttendancePage() {
    const [dateTime, setDateTime] = useState('')
    const [timeZone, setTimeZone] = useState('')
    const [duration, setDuration] = useState('')
    const checkInMutation = useCheckIn()
    const checkOutMutation = useCheckOut()

    const { data, isPending, error, refetch } = useTodayAttendance()

    // Refetch attendance data after successful check-in/check-out
    useEffect(() => {
        if (checkInMutation.isSuccess || checkOutMutation.isSuccess) {
            refetch()
        }
    }, [checkInMutation.isSuccess, checkOutMutation.isSuccess, refetch])

    useEffect(() => {
        const tz = moment.tz.guess() // get browser time zone
        setTimeZone(tz)

        const interval = setInterval(() => {
            setDateTime(moment().tz(tz).format('YYYY-MM-DD HH:mm:ss'))
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (!data?.data) {
            setDuration('No attendance record')
            return
        }

        const attendance = data.data
        const dateIn = moment(attendance.dateIn)

        const updateDuration = () => {
            if (attendance.dateOut) {
                // User has checked out - calculate fixed duration
                const dateOut = moment(attendance.dateOut)
                const diff = moment.duration(dateOut.diff(dateIn))
                setDuration(`${Math.floor(diff.asHours())}h ${diff.minutes()}m ${diff.seconds()}s`)
            } else {
                // User is still checked in - calculate real-time duration
                const now = moment()
                const diff = moment.duration(now.diff(dateIn))
                setDuration(`${Math.floor(diff.asHours())}h ${diff.minutes()}m ${diff.seconds()}s`)
            }
        }

        updateDuration() // Initial calculation

        // Update duration every second if user is still checked in
        let durationInterval: NodeJS.Timeout | null = null
        if (!attendance.dateOut) {
            durationInterval = setInterval(updateDuration, 1000)
        }

        return () => {
            if (durationInterval) {
                clearInterval(durationInterval)
            }
        }
    }, [data])

    const getStatusText = () => {
        if (!data?.data) return 'Not Checked In'
        return data.data.dateOut ? 'Checked Out' : 'Checked In'
    }

    const getStatusColor = () => {
        if (!data?.data) return 'text-gray-600'
        return data.data.dateOut ? 'text-red-600' : 'text-green-600'
    }

    if (!dateTime || isPending) {
        return (<Content><Loading /></Content>)
    }
    if (error) {
        return (<Content><FailedFetch retry={refetch} message={error.message} /></Content>)
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
                        <div className={`font-bold ${getStatusColor()}`}>
                            {getStatusText()}
                        </div>
                    </div>
                    <div>Duration: {duration}</div>
                </div>
                <div className="text-2xl font-bold mb-4 text-center">Actions</div>
                <div className="flex gap-8 mt-8">
                    <Button className="flex flex-col items-center h-24 w-24"
                        disabled={checkInMutation.isPending || !data?.data || data.data.dateIn}
                        onClick={() => checkInMutation.mutate()}>
                        <LogIn className="size-8" />
                        Check In
                        {checkInMutation.isPending && <Spinner />}
                    </Button>
                    <Button className="flex flex-col items-center h-24 w-24"
                        disabled={checkOutMutation.isPending || !data?.data || data.data.dateOut}
                        onClick={() => checkOutMutation.mutate()}
                    >
                        <LogOut className="size-8" />
                        Check Out
                        {checkOutMutation.isPending && <Spinner />}
                    </Button>
                </div>

            </div>
        </Content>
    )
}