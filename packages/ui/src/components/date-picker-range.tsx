'use client'

import { useState } from 'react'

import { DateRange } from 'react-day-picker'
import { Button } from './button'
import { Calendar } from './calendar'
import { CalendarIcon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

export const DatePickerRange = ({onChange}: {onChange: (range: DateRange | undefined) => void}) => {
  const [range, setRange] = useState<DateRange | undefined>(undefined)

  return (
    <div className='w-full max-w-xs space-y-2'>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant='outline' id='dates' className='w-full justify-between font-normal'>
            {range?.from && range?.to
              ? `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`
              : 'Pick a date'}
            <CalendarIcon/>
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto overflow-hidden p-0' align='start'>
          <Calendar
            mode='range'
            captionLayout="dropdown"
            selected={range}
            onSelect={range => {
              setRange(range)
              onChange(range)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
