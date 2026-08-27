import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, XIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type DatePickerProps = {
    id: string;
    name?: string;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    min?: string;
    max?: string;
    autoComplete?: string;
    'aria-invalid'?: boolean;
    className?: string;
};

function dateFromValue(value?: string) {
    if (!value) {
        return undefined;
    }

    const [year, month, day] = value.split('-').map(Number);

    if (!year || !month || !day) {
        return undefined;
    }

    return new Date(year, month - 1, day);
}

function DatePicker({
    id,
    name,
    value,
    defaultValue,
    onChange,
    placeholder = 'Selecciona una fecha',
    disabled = false,
    required = false,
    min,
    max,
    autoComplete,
    'aria-invalid': ariaInvalid,
    className,
}: DatePickerProps) {
    const [open, setOpen] = React.useState(false);
    const [uncontrolledValue, setUncontrolledValue] = React.useState(
        defaultValue ?? '',
    );
    const selectedValue = value ?? uncontrolledValue;
    const selectedDate = dateFromValue(selectedValue);
    const minDate = dateFromValue(min);
    const maxDate = dateFromValue(max);
    const disabledDates = minDate
        ? maxDate
            ? { before: minDate, after: maxDate }
            : { before: minDate }
        : maxDate
          ? { after: maxDate }
          : undefined;

    const updateValue = (nextValue: string) => {
        if (value === undefined) {
            setUncontrolledValue(nextValue);
        }

        onChange?.(nextValue);
    };

    return (
        <div className="flex w-full gap-2">
            {name ? (
                <input
                    type="hidden"
                    name={name}
                    value={selectedValue}
                    autoComplete={autoComplete}
                />
            ) : null}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id={id}
                        type="button"
                        variant="outline"
                        disabled={disabled}
                        aria-invalid={ariaInvalid}
                        aria-required={required}
                        className={cn(
                            'w-full justify-between px-4 font-normal',
                            !selectedDate && 'text-muted-foreground',
                            className,
                        )}
                    >
                        {selectedDate
                            ? format(selectedDate, "d 'de' MMMM 'de' yyyy", {
                                  locale: es,
                              })
                            : placeholder}
                        <CalendarIcon data-icon="inline-end" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        defaultMonth={selectedDate ?? maxDate ?? new Date()}
                        captionLayout="dropdown"
                        startMonth={minDate}
                        endMonth={maxDate}
                        disabled={disabledDates}
                        onSelect={(date) => {
                            if (!date) {
                                return;
                            }

                            updateValue(format(date, 'yyyy-MM-dd'));
                            setOpen(false);
                        }}
                        locale={es}
                    />
                </PopoverContent>
            </Popover>
            {selectedDate && !disabled && !required ? (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Limpiar fecha"
                    onClick={() => updateValue('')}
                >
                    <XIcon />
                </Button>
            ) : null}
        </div>
    );
}

export { DatePicker };
