import { CalendarIcon, CalendarSearch } from "lucide-react"
import { Button } from "./button"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Calendar } from "./calendar"
import React from "react"
import { Input } from "./input"
import { ControllerRenderProps } from "react-hook-form"
import { fi } from "date-fns/locale"
import { format, isValid, parse } from "date-fns"
import { cn } from "@workspace/ui/lib/utils"

export default function PopoverCalendar({ className, field, disabled, open, onOpenChange }: Readonly<{ className?: string, field: ControllerRenderProps<any, string>, disabled?: boolean, open?: boolean, onOpenChange?: (open: boolean) => void }>) {
    // Support controlled & uncontrolled open state
    const [internalOpen, setInternalOpen] = React.useState(false)
    const isControlled = typeof open === 'boolean'
    const openState = isControlled ? open : internalOpen
    const setOpen = (value: boolean) => {
        if (onOpenChange) onOpenChange(value)
        if (!isControlled) setInternalOpen(value)
    }

    // Convert field string value (yyyy-MM-dd) to Date for Calendar
    const selectedDate = React.useMemo(() => {
        if (!field?.value) return undefined
        const d = parse(String(field.value), "yyyy-MM-dd", new Date(), { locale: fi })
        return isValid(d) ? d : undefined
    }, [field?.value])

    return (
        <div className="relative">
            <Popover open={openState} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button id="date-picker"
                        disabled={disabled} variant="secondary" size={"sm"}
                        className={cn("hover:opacity-75 ", className)}
                    >
                        <CalendarSearch className="size-6" />
                        <span className="sr-only">Select date</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="end">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        defaultMonth={selectedDate}
                        onSelect={(date) => {
                            if (date) {
                                field.onChange(format(date, "yyyy-MM-dd", { locale: fi }))
                            }
                            setOpen(false)
                        }}
                        captionLayout="dropdown"
                        disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                        }
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}