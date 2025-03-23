import { Calendar } from "@/components/ui/calendar.tsx";
import {
    SidebarGroup,
    SidebarGroupContent,
} from "@/components/ui/sidebar.tsx";

interface DatePickerProps {
    selected?: Date;
    onDateSelect?: (date: Date) => void;
}

export function DatePicker({ selected, onDateSelect }: DatePickerProps) {
    return (
        <SidebarGroup className="px-0">
            <SidebarGroupContent>
                <Calendar
                    mode="single"
                    selected={selected}
                    onSelect={(date) => {
                        if (date && onDateSelect) {
                            onDateSelect(date);
                        }
                    }}
                    className="[&_[role=gridcell].bg-accent]:bg-sidebar-primary [&_[role=gridcell].bg-accent]:text-sidebar-primary-foreground [&_[role=gridcell]]:w-[33px]"
                />
            </SidebarGroupContent>
        </SidebarGroup>
    );
}