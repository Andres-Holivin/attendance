'use client'

import { useState } from 'react'

import { CalendarIcon } from 'lucide-react'
import { Input } from './input'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Button } from './button'
import { Calendar } from './calendar'
import moment from 'moment'


function isValidDate(date: Date | undefined) {
  if (!date) {
    return false
  }

  return !isNaN(date.getTime())
}

export const DatePickerInput = ({ onChange }: { onChange: (date: Date | undefined) => void }) => {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [month, setMonth] = useState<Date | undefined>(date)
  const [value, setValue] = useState(moment(date).format('DD-MM-YYYY'))

  return (
    <div className='w-full max-w-xs space-y-2'>
      <div className='relative flex gap-2'>
        <Input
          id='date'
          value={value}
          placeholder='January 01, 2025'
          className='bg-background pr-10'
          onChange={e => {
            const date = new Date(e.target.value)

            setValue(e.target.value)

            if (isValidDate(date)) {
              setDate(date)
              setMonth(date)
            }
          }}
          onKeyDown={e => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setOpen(true)
            }
          }}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button id='date-picker' variant='ghost' className='absolute top-1/2 right-2 size-6 -translate-y-1/2'>
              <CalendarIcon className='size-3.5' />
              <span className='sr-only'>Pick a date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto overflow-hidden p-0' align='end' alignOffset={-8} sideOffset={10}>
            <Calendar
              mode='single'
              selected={date}
              month={month}
              onMonthChange={setMonth}         
              captionLayout='dropdown'
              fixedWeeks
              showOutsideDays
              ISOWeek
              
              onSelect={date => {
                setDate(date)
                setValue(moment(date).format('DD-MM-YYYY'))
                setOpen(false)
                onChange(date)
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}