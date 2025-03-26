import { Calendar } from "@/components/ui/calendar.tsx";
import { useState, useEffect } from "react";
import {
    SidebarGroup,
    SidebarGroupContent,
} from "@/components/ui/sidebar.tsx";
import { isSameDay, startOfMonth } from "date-fns";

interface DatePickerProps {
    selected?: Date;
    onDateSelect?: (date: Date) => void;
    externalDate?: Date;
}

export function DatePicker({ selected: initialSelected, onDateSelect, externalDate }: DatePickerProps) {
    const [selected, setSelected] = useState<Date | undefined>(initialSelected);
    const [month, setMonth] = useState<Date>(startOfMonth(externalDate || initialSelected || new Date()));
    const today = new Date();

    useEffect(() => {
        if (externalDate) {
            if (!isSameDay(externalDate, selected || new Date())) {
                setSelected(externalDate);
            }
            setMonth(startOfMonth(externalDate));
        }
    }, [externalDate]);

    const modifiers = {
        today: (date: Date): boolean => isSameDay(date, today),
        selected: (date: Date): boolean => !!selected && isSameDay(date, selected),
    };

    const modifiersClassNames = {
        today: "bg-sidebar-primary text-white hover:!bg-sidebar-primary hover:!text-white",
        selected: "bg-gray-300 text-black hover:!bg-gray-200 hover:!text-black",
    };

    return (
        <SidebarGroup className="px-0">
            <SidebarGroupContent>
                <Calendar
                    mode="single"
                    selected={selected}
                    onSelect={(date) => {
                        setSelected(date);
                        if (date) {
                            setMonth(startOfMonth(date));
                            onDateSelect?.(date);
                        }
                    }}
                    month={month}
                    onMonthChange={(newMonth) => setMonth(newMonth)}
                    modifiers={modifiers}
                    modifiersClassNames={modifiersClassNames}
                    weekStartsOn={1}
                />
            </SidebarGroupContent>
        </SidebarGroup>
    );
}